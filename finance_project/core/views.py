from django.shortcuts import render

# Create your views here.
# core/views.py
from rest_framework import viewsets, mixins, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.postgres.search import SearchQuery, SearchRank
from django.db.models import Q
from django.utils import timezone
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests

from .models import *
from .serializers import *
from .filters import *
from .permissions import IsOwner
from .signals import create_audit
from .tasks import send_email_notification_task, generate_due_recurring_transactions_task
from django.conf import settings



# -------- Auth endpoints --------
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register(request):
    ser = RegisterSerializer(data=request.data, context={"request":request})
    ser.is_valid(raise_exception=True)
    user = ser.save()
    refresh = RefreshToken.for_user(user)
    return Response({"user": UserSerializer(user).data, "access": str(refresh.access_token), "refresh": str(refresh)})

# -------- Login endpoint --------
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login(request):
    from django.contrib.auth import authenticate
    user = authenticate(username=request.data.get("username"), password=request.data.get("password"))
    if not user: return Response({"detail":"Invalid credentials"}, status=400)
    refresh = RefreshToken.for_user(user)
    return Response({"access": str(refresh.access_token), "refresh": str(refresh)})

# -------- Logout endpoint --------
@api_view(["POST"])
def logout(request):
    try:
        RefreshToken(request.data.get("refresh")).blacklist()
    except Exception:
        pass
    return Response(status=204)

# -------- User profile endpoints -------- me endpoints
@api_view(["GET","PUT","PATCH","DELETE"])
def me(request):
    user = request.user
    if request.method == "GET":
        return Response(UserSerializer(user).data)
    if request.method in ["PUT","PATCH"]:
        ser = UserSerializer(user, data=request.data, partial=(request.method=="PATCH"))
        ser.is_valid(raise_exception=True); ser.save()
        return Response(ser.data)
    if request.method == "DELETE":
        user.is_active = False
        user.save(update_fields=["is_active"])
        return Response(status=204)
    

# -------- Verify email --------
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def verify_email(request):
    # stub: in production you’d verify token sent by email
    request.user.is_verified = True
    request.user.save(update_fields=["is_verified"])
    return Response({"verified": True})

# -------- Reset password --------
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    # stub: send email
    return Response({"status":"email_sent"})

# -------- Reset password confirm --------
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def reset_password_confirm(request):
    # stub: change password
    return Response({"status":"password_changed"})


 # Google OAuth login
@api_view(["POST"]) 
@permission_classes([permissions.AllowAny])
def google_oauth(request):
    token = request.data.get("id_token")
    if not token: return Response({"detail":"id_token required"}, status=400)
    try:
        info = google_id_token.verify_oauth2_token(token, google_requests.Request(), request.data.get("client_id"))
        email = info["email"]; gid = info["sub"]
        user, _ = User.objects.get_or_create(email=email, defaults={
            "username": email.split("@")[0],
            "google_id": gid,
            "preferred_currency": Currency.objects.get(code="USD"),
        })
        if not user.google_id:
            user.google_id = gid; user.save(update_fields=["google_id"])
        refresh = RefreshToken.for_user(user)
        return Response({"access": str(refresh.access_token), "refresh": str(refresh)})
    except Exception as e:
        return Response({"detail": str(e)}, status=400)

# -------- Base class for owned objects with soft delete --------
class OwnedModelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsOwner]
    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(user=self.request.user, is_deleted=False) if hasattr(self.queryset.model, "is_deleted") else qs.filter(user=self.request.user)
    @action(detail=False, methods=["get"])
    def archived(self, request):
        qs = self.queryset.filter(user=request.user, is_deleted=True)
        page = self.paginate_queryset(qs)
        ser = self.get_serializer(page, many=True) if page is not None else self.get_serializer(qs, many=True)
        return self.get_paginated_response(ser.data) if page is not None else Response(ser.data)
    @action(detail=True, methods=["post"])
    def restore(self, request, pk=None):
        obj = self.get_object()
        obj.is_deleted = False
        obj.save(update_fields=["is_deleted","updated_at"])
        return Response(self.get_serializer(obj).data)

# -------- Currencies -------- Kaliya GET currency.
class CurrencyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Currency.objects.filter(is_active=True)
    serializer_class = CurrencySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "code"

# -------- Categories --------   CRUD categories oo leh OwnedModelViewSet
class CategoryViewSet(OwnedModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filterset_fields = ["parent"]

# -------- Accounts --------  CRUD accounts
class AccountViewSet(OwnedModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    filterset_fields = ["type","is_active"]

# -------- Transactions --------  CRUD transactions + Search API.
class TransactionViewSet(OwnedModelViewSet):
    queryset = Transaction.objects.select_related("account","target_account","category")
    serializer_class = TransactionSerializer
    filterset_class = TransactionFilter
    search_fields = ["description"]
    ordering_fields = ["transaction_date","amount","created_at"]

    @action(detail=False, methods=["get"])
    def search(self, request):
        q = request.query_params.get("q","").strip()
        if not q: return Response([])
        qobj = SearchQuery(q)
        qs = (self.queryset
              .filter(user=request.user, is_deleted=False)
              .annotate(rank=SearchRank(models.F("description_tsv"), qobj))
              .filter(description_tsv=qobj)
              .order_by("-rank","-transaction_date")[:100])
        return Response(TransactionSerializer(qs, many=True).data)

# Splits under transaction  -------- Splits transactions
class TransactionSplitViewSet(mixins.CreateModelMixin,
                              mixins.UpdateModelMixin,
                              mixins.DestroyModelMixin,
                              mixins.ListModelMixin,
                              viewsets.GenericViewSet):
    serializer_class = TransactionSplitSerializer
    def get_queryset(self):
        return TransactionSplit.objects.filter(transaction_id=self.kwargs["transaction_pk"],
                                               transaction__user=self.request.user)

# Attachments  --------  Upload attachments to transactions
class AttachmentViewSet(mixins.CreateModelMixin,
                        mixins.DestroyModelMixin,
                        mixins.ListModelMixin,
                        viewsets.GenericViewSet):
    serializer_class = AttachmentSerializer
    def get_queryset(self):
        return Attachment.objects.filter(transaction_id=self.kwargs.get("transaction_pk"),
                                         transaction__user=self.request.user)
    def perform_create(self, serializer):
        tx = Transaction.objects.get(pk=self.kwargs["transaction_pk"], user=self.request.user)
        serializer.save(transaction=tx)

# -------- Recurring Bills --------  CRUD + generate transaction from bill.
class RecurringBillViewSet(OwnedModelViewSet):
    queryset = RecurringBill.objects.all()
    serializer_class = RecurringBillSerializer
    filterset_class = RecurringBillFilter

    @action(detail=True, methods=["post"])
    def generate_transaction(self, request, pk=None):
        bill = self.get_object()
        from .tasks import generate_single_recurring_tx
        tx_id = generate_single_recurring_tx(bill.id)
        return Response({"transaction_id": tx_id}, status=201)

# -------- Budgets --------   CRUD budgets
class BudgetViewSet(OwnedModelViewSet):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    filterset_class = BudgetFilter

# -------- Notifications --------  Read-only notifications + mark as read.
class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by("-sent_at")
    @action(detail=True, methods=["patch"])
    def mark_read(self, request, pk=None):
        n = self.get_object(); n.is_read = True; n.save(update_fields=["is_read"])
        return Response({"is_read": True})

# -------- Exchange Rates --------  aqris-only + get rate for given date.
class ExchangeRateViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ExchangeRateSerializer
    def get_queryset(self):
        return ExchangeRate.objects.all()
    @action(detail=False, methods=["get"], url_path=r"(?P<base>[A-Z]{3})/(?P<target>[A-Z]{3})/(?P<dt>\d{4}-\d{2}-\d{2})")
    def get_rate(self, request, base, target, dt):
        try:
            rate = ExchangeRate.objects.get(base_currency_id=base, target_currency_id=target, date=dt)
            return Response(ExchangeRateSerializer(rate).data)
        except ExchangeRate.DoesNotExist:
            return Response({"detail":"Not found"}, status=404)

# -------- Audit Logs --------  AuditLogViewSet → aqris-only audit logs.
class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AuditLogSerializer
    filterset_class = AuditLogFilter
    def get_queryset(self):
        return AuditLog.objects.filter(user=self.request.user).order_by("-changed_at")