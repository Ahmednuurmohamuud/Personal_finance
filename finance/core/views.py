# core/views.py
from django.shortcuts import render
from django.db import models
from rest_framework import viewsets, mixins, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.postgres.search import SearchQuery, SearchRank
from django.db.models import Q
from django.utils import timezone
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from django.contrib.auth import authenticate
from datetime import timedelta

from django_filters.rest_framework import DjangoFilterBackend
from .models import AuditLog
from .serializers import AuditLogSerializer
from .filters import AuditLogFilter

from .models import *
from .serializers import *
from .filters import *
from .permissions import IsOwner
from .signals import create_audit
from .tasks import send_email_notification_task, generate_due_recurring_transactions_task
from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
import random



User = get_user_model()
token_generator = PasswordResetTokenGenerator()




# =========================
# ----- OTP Helpers -------
# =========================
def generate_otp(user):
    otp = f"{random.randint(100000, 999999)}"  # 6-digit OTP
    user.otp_code = otp
    user.otp_created_at = timezone.now()
    user.save(update_fields=["otp_code", "otp_created_at"])
    return otp


def send_otp_email(user):
    otp = generate_otp(user)
    send_mail(
        subject="Your OTP Code",
        message=f"Your login OTP code is: {otp}",
        from_email=None,  # uses DEFAULT_FROM_EMAIL in settings.py
        recipient_list=[user.email],
        fail_silently=False,
    )


# =========================
# ----- Login View --------
# =========================
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login(request):
    username_or_email = request.data.get("username")
    password = request.data.get("password")

    if not username_or_email or not password:
        return Response({"detail": "Username/email and password required"}, status=400)

    # Allow login by either username OR email
    try:
        user_obj = User.objects.get(Q(username=username_or_email) | Q(email=username_or_email))
        username = user_obj.username
    except User.DoesNotExist:
        return Response({"detail": "Invalid credentials"}, status=400)

    user = authenticate(username=username, password=password)
    if not user:
        return Response({"detail": "Invalid credentials"}, status=400)

    # If user has 2FA enabled → send OTP
    if getattr(user, "two_factor_enabled", False):
        send_otp_email(user)
        return Response({
            "otp_required": True,
            "user_id": str(user.id),
            "message": "OTP sent to your email"
        })

    # Normal login flow
    if not user.last_login:
        welcome_message = f"Welcome {user.username}"
    else:
        welcome_message = f"Welcome back {user.username}"

    user.last_login = timezone.now()
    user.save(update_fields=["last_login"])

    refresh = RefreshToken.for_user(user)

    return Response({
        "otp_required": False,
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "message": welcome_message
    })


# =========================
# ----- OTP Verify --------
# =========================
OTP_VALID_MINUTES = 5

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def verify_otp(request):
    user_id = request.data.get("user_id")
    otp = request.data.get("otp")

    if not user_id or not otp:
        return Response({"detail": "user_id and otp are required"}, status=400)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "User not found"}, status=404)

    # OTP check
    if not user.otp_code or user.otp_code != otp:
        return Response({"detail": "Invalid OTP"}, status=400)

    # Expiration check
    if timezone.now() > user.otp_created_at + timedelta(minutes=OTP_VALID_MINUTES):
        return Response({"detail": "OTP expired"}, status=400)

    # OTP valid → clear OTP and return JWT
    user.otp_code = None
    user.otp_created_at = None
    user.save(update_fields=["otp_code", "otp_created_at"])

    refresh = RefreshToken.for_user(user)

    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "message": f"Welcome {user.username}"
    })


# -------- Auth endpoints --------
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register(request):
    ser = RegisterSerializer(data=request.data, context={"request":request})
    ser.is_valid(raise_exception=True)
    user = ser.save()
    refresh = RefreshToken.for_user(user)
    return Response({"user": UserSerializer(user).data, "access": str(refresh.access_token), "refresh": str(refresh)})



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
    email = request.data.get("email")
    if not email:
        return Response({"error": "Email is required"}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    # Generate token
    token = token_generator.make_token(user)
    reset_link = f"http://localhost:3000/reset-password-confirm?uid={user.id}&token={token}"

    # Console email (tijaabo free)
    send_mail(
        subject="Reset your password",
        message=f"Click this link to reset your password: {reset_link}",
        from_email=None,  # uses DEFAULT_FROM_EMAIL
        recipient_list=[email],
        fail_silently=False,
    )

    return Response({"status": "email_sent"})


# -------- Reset password confirm --------
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def reset_password_confirm(request):
    uid = request.data.get("uid")
    token = request.data.get("token")
    new_password = request.data.get("password")

    if not uid or not token or not new_password:
        return Response({"error": "uid, token, and password are required"}, status=400)

    try:
        user = User.objects.get(id=uid)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    if not token_generator.check_token(user, token):
        return Response({"error": "Invalid or expired token"}, status=400)

    user.set_password(new_password)
    user.save()
    return Response({"status": "password_changed"})


@api_view(["POST"]) 
@permission_classes([permissions.AllowAny])
def google_oauth(request):
    token = request.data.get("id_token")
    client_id = request.data.get("client_id")
    if not token or not client_id:
        return Response({"detail":"id_token and client_id required"}, status=400)

    try:
        info = google_id_token.verify_oauth2_token(
            token, google_requests.Request(), client_id
        )
        email = info["email"]
        gid = info["sub"]

        user, _ = User.objects.get_or_create(
            email=email,
            defaults={
                "username": email.split("@")[0],
                "google_id": gid,
                "preferred_currency": Currency.objects.get(code="USD"),
            }
        )
        if not user.google_id:
            user.google_id = gid
            user.save(update_fields=["google_id"])

        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data
        })

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

# -------- Currencies --------
class CurrencyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Currency.objects.filter(is_active=True).order_by("code")  # ✅ Warning fix
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
        # User-ka kaliya wuxuu arki karaa notifications-kiisa
        return Notification.objects.filter(user=self.request.user).order_by("-sent_at")

    @action(detail=True, methods=["patch"])
    def mark_read(self, request, pk=None):
        """
        Calaamadee notification gaar ah sida read
        URL: /api/notifications/{id}/mark_read/
        """
        n = self.get_object()
        n.is_read = True
        n.save(update_fields=["is_read"])
        return Response({"is_read": True})

    @action(detail=False, methods=["post"])
    def mark_all_read(self, request):
        """
        Calaamadee dhamaan notifications user-ka sida read
        URL: /api/notifications/mark_all_read/
        """
        qs = Notification.objects.filter(user=request.user, is_read=False)
        count = qs.count()
        qs.update(is_read=True)
        return Response({"marked": count})

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        """
        Tirada notifications-ka aan la aqrin
        URL: /api/notifications/unread_count/
        """
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({"unread": count})

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
    
class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AuditLogSerializer
    filterset_class = AuditLogFilter
    filter_backends = [DjangoFilterBackend]  # enable filter

    def get_queryset(self):
        queryset = AuditLog.objects.all().order_by("-changed_at")  # show all logs
        return queryset
