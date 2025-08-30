# core/serializers.py
from rest_framework import serializers
from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from .models import *
from decimal import Decimal

# ---- User & Auth ----

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "password",
            "preferred_currency",
            "monthly_income_est",
            "savings_goal",
        )

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate_email(self, value):
        # hubi haddii email horay u jiray
        user_qs = User.objects.filter(email=value)
        if user_qs.exists():
            user = user_qs.first()
            if user.is_verified:
                raise serializers.ValidationError("Email already exists")
            else:
                raise serializers.ValidationError(
                    "Email already registered but not verified. Please check your inbox."
                )
        return value

    def create(self, validated_data):
        pwd = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(pwd)
        user.is_verified = False   # 🚨 account cusub waligiis waa unverified
        user.save()

        # 🚀 halkan ku dir email verification
        # tusaale: send_verification_email(user)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id", "username", "email", "first_name", "last_name", "phone",
            "preferred_currency", "monthly_income_est", "savings_goal",
            "photo", "is_active", "is_verified", "date_joined", "two_factor_enabled"
        )
        
        read_only_fields = ("is_active", "is_verified", "date_joined")




class OTPSerializer(serializers.ModelSerializer):
    class Meta:
        model = OTP
        fields = ["id", "user", "code", "is_used", "created_at"]


# ---- Currency ----
class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = '__all__'  

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
        fields = "__all__"
        read_only_fields = ["id", "created_at", "transaction"]

        
# ---- Transaction ----

class TransactionSerializer(serializers.ModelSerializer):
    account = serializers.PrimaryKeyRelatedField(queryset=Account.objects.all())
    target_account = serializers.PrimaryKeyRelatedField(queryset=Account.objects.all(), required=False, allow_null=True)
    splits = TransactionSplitSerializer(many=True, read_only=True)   # <-- add this

    class Meta:
        model = Transaction
        fields = ["id","user","account","target_account","type","amount","currency","description","transaction_date","splits"]
        read_only_fields = ["id","user"]

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["user"] = user

        account = validated_data["account"]
        target_account = validated_data.get("target_account")
        amount = Decimal(validated_data["amount"])  # Make sure it's Decimal
        tx_type = validated_data["type"]

        with transaction.atomic():
            if tx_type == TransactionType.INCOME:
                account.balance += amount
                account.save(update_fields=["balance"])

            elif tx_type == TransactionType.EXPENSE:
                if account.balance < amount:
                    raise serializers.ValidationError("Insufficient funds for expense.")
                account.balance -= amount
                account.save(update_fields=["balance"])

            elif tx_type == TransactionType.TRANSFER:
                if account.balance < amount:
                    raise serializers.ValidationError("Insufficient funds for transfer.")
                account.balance -= amount
                account.save(update_fields=["balance"])
                target_account.balance += amount
                target_account.save(update_fields=["balance"])

            transaction_obj = Transaction.objects.create(**validated_data)

        return transaction_obj

        
# ---- Attachment ----
class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = "__all__"
        read_only_fields = ["id", "uploaded_at"]

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

# class BudgetSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Budget
#         fields = "__all__"
#         read_only_fields = ("id", "created_at", "updated_at", "user")  # <--- user read-only

#     def create(self, validated_data):
#         validated_data["user"] = self.context["request"].user
#         return super().create(validated_data)
# serializers.py
class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at", "user")

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user  # Add logged-in user automatically
        return super().create(validated_data)



    

# ---- Notification ----
class NotificationSerializer(serializers.ModelSerializer):
    timestamp = serializers.DateTimeField(source="sent_at")
    class Meta:
        model = Notification
        fields = ["id", "user", "type", "message", "is_read", "timestamp", "related_id", "email_sent"]

# ---- ExchangeRate ----
class ExchangeRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExchangeRate
        fields = "__all__"  # ✅ sax

# ---- AuditLog ----
class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = "__all__"