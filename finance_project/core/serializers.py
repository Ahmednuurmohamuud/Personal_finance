# core/serializers.py
from rest_framework import serializers
from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from .models import *

# ---- User ----
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ("id","username","email","password","preferred_currency","monthly_income_est","savings_goal")
    def validate_password(self, value):
        validate_password(value); return value
    def create(self, data):
        pwd = data.pop("password")
        user = User(**data); user.set_password(pwd); user.save(); return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id","username","email","preferred_currency","monthly_income_est","savings_goal","is_active","is_verified","date_joined")

# ---- Currency ----
class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = '__all__'  # sax

# ---- Category ----
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id","name","parent","created_at","updated_at","is_deleted")
    def create(self, data):
        data["user"] = self.context["request"].user
        return super().create(data)

# ---- Account ----
class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ("id","name","type","balance","currency","is_active","is_deleted","created_at","updated_at")
    def create(self, data):
        data["user"] = self.context["request"].user
        return super().create(data)

# ---- Transaction Split ----
class TransactionSplitSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionSplit
        fields = ("id","transaction","category","amount","created_at")
        read_only_fields = ("id","created_at","transaction")

# ---- Transaction ----
class TransactionSerializer(serializers.ModelSerializer):
    splits = TransactionSplitSerializer(many=True, required=False)
    class Meta:
        model = Transaction
        fields = ("id","account","target_account","category","type","amount","currency",
                  "converted_amount","converted_currency","description","transaction_date",
                  "is_recurring_instance","recurring_bill","splits","is_deleted","created_at","updated_at")
        read_only_fields = ("is_deleted","created_at","updated_at")
    def validate(self, attrs):
        # restrict currency set
        if attrs.get("currency") and attrs["currency"].code not in settings.ALLOWED_CURRENCIES:
            raise serializers.ValidationError("Unsupported currency.")
        return attrs
    def create(self, data):
        splits = data.pop("splits", [])
        data["user"] = self.context["request"].user
        tx = super().create(data)
        total_splits = sum([s["amount"] for s in splits]) if splits else 0
        if splits:
            if total_splits <= 0 or total_splits > tx.amount:
                raise serializers.ValidationError("Invalid split total.")
            for s in splits:
                TransactionSplit.objects.create(transaction=tx, **s)
        return tx

# ---- Attachment ----
class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ("id","transaction","file_url","file_type","file_size","uploaded_at")
        read_only_fields = ("id","uploaded_at","transaction")

# ---- RecurringBill ----
class RecurringBillSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecurringBill
        fields = ("id","account","category","name","amount","currency","type","frequency",
                  "start_date","next_due_date","end_date","is_active","last_generated_date",
                  "is_deleted","created_at","updated_at")
    def create(self, data):
        data["user"] = self.context["request"].user
        return super().create(data)

# ---- Budget ----
class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = "_all_"
        read_only_fields = ("id","created_at","updated_at")
    def create(self, data):
        data["user"] = self.context["request"].user
        return super().create(data)

# ---- Notification ----
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "_all_"

# ---- ExchangeRate ----
class ExchangeRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExchangeRate
        fields = "_all_"

# ---- AuditLog ----
class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = "_all_"