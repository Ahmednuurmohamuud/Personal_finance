from django.db import models
import uuid
from django.db.models import Q

from datetime import date
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.search import SearchVectorField
from django.contrib.postgres.indexes import GinIndex
from django.utils import timezone

# ----- Choices matching your ENUMs -----
class AccountType(models.TextChoices):
    BANK = "Bank", "Bank"
    SAVINGS = "Savings", "Savings"
    CREDIT_CARD = "Credit Card", "Credit Card"
    LOAN = "Loan", "Loan"
    INVESTMENT = "Investment", "Investment"
    CASH = "Cash", "Cash"

class TransactionType(models.TextChoices):
    INCOME = "Income", "Income"
    EXPENSE = "Expense", "Expense"
    TRANSFER = "Transfer", "Transfer"

class RecurringFrequency(models.TextChoices):
    DAILY="Daily"; WEEKLY="Weekly"; BI_WEEKLY="Bi-Weekly"
    MONTHLY="Monthly"; QUARTERLY="Quarterly"; ANNUALLY="Annually"

class NotificationType(models.TextChoices):
    BUDGET="Budget"; BILL_DUE="Bill Due"; WARNING="Warning"; INSIGHT="Insight"

class AuditAction(models.TextChoices):
    CREATE="CREATE"; UPDATE="UPDATE"; DELETE="DELETE"

# ----- Soft delete manager -----
class SoftDeleteQuerySet(models.QuerySet):
    def alive(self): return self.filter(is_deleted=False)
    def dead(self): return self.filter(is_deleted=True)

class SoftDeleteModel(models.Model):
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    objects = SoftDeleteQuerySet.as_manager()

    class Meta:
        abstract = True

    def delete(self, using=None, keep_parents=False):
        self.is_deleted = True
        self.save(update_fields=["is_deleted","updated_at"])

# ----- Currencies -----
class Currency(models.Model):
    code = models.CharField(primary_key=True, max_length=3)
    name = models.CharField(max_length=255, unique=True)
    symbol = models.CharField(max_length=10)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    def _str_(self): return self.code

# ----- User -----
class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    preferred_currency = models.ForeignKey(Currency, to_field="code", on_delete=models.PROTECT)
    monthly_income_est = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    savings_goal = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    is_verified = models.BooleanField(default=False)
    google_id = models.CharField(max_length=255, null=True, blank=True, unique=True)

    REQUIRED_FIELDS = ["email", "preferred_currency"]

# ----- Categories -----
class Category(SoftDeleteModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    parent = models.ForeignKey("self", null=True, blank=True, on_delete=models.CASCADE)

    class Meta:
        unique_together = (("user","name","parent","is_deleted"),)

    def _str_(self): return self.name

# ----- Accounts -----
class Account(SoftDeleteModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=AccountType.choices)
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    currency = models.ForeignKey(Currency, to_field="code", on_delete=models.PROTECT)
    is_active = models.BooleanField(default=True)

    class Meta:
        indexes = [models.Index(fields=["user","type"])]

    def __str__(self):
      return f"{self.name} ({self.type})"


# ----- Recurring Bills (declared before Transaction for FK) -----
class RecurringBill(SoftDeleteModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    account = models.ForeignKey(Account, on_delete=models.PROTECT)
    category = models.ForeignKey("Category", null=True, blank=True, on_delete=models.SET_NULL)
    name = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.ForeignKey(Currency, to_field="code", on_delete=models.PROTECT)
    type = models.CharField(max_length=10, choices=TransactionType.choices)
    frequency = models.CharField(max_length=12, choices=RecurringFrequency.choices)
    start_date = models.DateField()
    next_due_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    last_generated_date = models.DateField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["user","next_due_date","is_active"]),
            models.Index(fields=["account"]),
        ]

# ----- Transactions -----
class Transaction(SoftDeleteModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    account = models.ForeignKey(Account, related_name="transactions", on_delete=models.PROTECT)
    target_account = models.ForeignKey(Account, related_name="incoming_transfers", null=True, blank=True, on_delete=models.PROTECT)
    category = models.ForeignKey(Category, null=True, blank=True, on_delete=models.SET_NULL)
    type = models.CharField(max_length=10, choices=TransactionType.choices)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.ForeignKey(Currency, to_field="code", on_delete=models.PROTECT)
    converted_amount = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    converted_currency = models.ForeignKey(Currency, to_field="code", on_delete=models.PROTECT, null=True, blank=True, related_name="+")
    description = models.TextField(blank=True, default="")
    transaction_date = models.DateField()
    is_recurring_instance = models.BooleanField(default=False)
    recurring_bill = models.ForeignKey(RecurringBill, null=True, blank=True, on_delete=models.SET_NULL)
    description_tsv = SearchVectorField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["user","transaction_date","type"]),
            models.Index(fields=["account","transaction_date"]),
            models.Index(fields=["category"]),
            GinIndex(fields=["description_tsv"]),
        ]
        constraints = [
            models.CheckConstraint(
                name="transfer_requires_target",
                check=(
                    Q(type=TransactionType.TRANSFER, target_account__isnull=False) |
                    Q(type__in=[TransactionType.INCOME, TransactionType.EXPENSE], target_account__isnull=True)
                )
            )
        ]

# ----- Transaction Splits -----
class TransactionSplit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name="splits")
    category = models.ForeignKey(Category, on_delete=models.RESTRICT)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = (("transaction","category"),)

# ----- Attachments -----
class Attachment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name="attachments")
    file_url = models.URLField(max_length=512)
    file_type = models.CharField(max_length=50, blank=True, default="")
    file_size = models.IntegerField(null=True, blank=True)
    uploaded_at = models.DateTimeField(default=timezone.now)

# ----- Budgets -----
class Budget(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    month = models.IntegerField()
    year = models.IntegerField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.ForeignKey(Currency, to_field="code", on_delete=models.PROTECT)
    rollover_enabled = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = (("user","category","month","year"),)
        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["category"]),
            models.Index(fields=["user","year","month","category"]),
        ]

# ----- Notifications -----
class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=NotificationType.choices)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    sent_at = models.DateTimeField(default=timezone.now)
    related_id = models.UUIDField(null=True, blank=True)
    email_sent = models.BooleanField(default=False)

# ----- Exchange rates -----
class ExchangeRate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    base_currency = models.ForeignKey(Currency, to_field="code", on_delete=models.PROTECT, related_name="base_rates")
    target_currency = models.ForeignKey(Currency, to_field="code", on_delete=models.PROTECT, related_name="target_rates")
    rate = models.DecimalField(max_digits=15, decimal_places=6)
    date = models.DateField()
    source = models.CharField(max_length=50, default="ExchangeRate.host")
    last_fetched_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = (("base_currency","target_currency","date"),)
        indexes = [
            models.Index(fields=["base_currency","target_currency"]),
            models.Index(fields=["date"]),
        ]

# ----- Audit Logs -----
class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)
    table_name = models.CharField(max_length=100)
    record_id = models.UUIDField()
    action = models.CharField(max_length=10, choices=AuditAction.choices)
    old_data = models.JSONField(null=True, blank=True)
    new_data = models.JSONField(null=True, blank=True)
    changed_at = models.DateTimeField(default=timezone.now)
    ip_address = models.GenericIPAddressField(null=True, blank=True)