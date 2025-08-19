# core/signals.py
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.contrib.postgres.search import SearchVector
from .models import Transaction, Account, AuditLog
from django.db.models import Sum
from .models import Transaction, Budget
from .tasks import send_budget_warning_notification_task

@receiver(post_save, sender=Transaction)
def check_budget_after_transaction(sender, instance, created, **kwargs):
    """
    Hubi haddii Transaction cusub uu dhaafay budget-ka ama uu gaaray thresholds
    """
    if not created:
        return  # kaliya marka la abuuro transaction cusub

    try:
        # hel budget-ga category + user + bil iyo sanadka
        budget = Budget.objects.filter(
            user=instance.user,
            category=instance.category,
            month=instance.transaction_date.month,
            year=instance.transaction_date.year,
        ).first()

        if not budget:
            return

        # wadarta kharashyada category-gan bishan
        total_spent = Transaction.objects.filter(
            user=instance.user,
            category=instance.category,
            type="Expense",
            transaction_date__month=instance.transaction_date.month,
            transaction_date__year=instance.transaction_date.year,
        ).aggregate(total=Sum("amount"))["total"] or 0

        # xisaabi boqolkiiba la isticmaalay
        percent_used = (total_spent / budget.amount) * 100 if budget.amount > 0 else 0

        # digniino kala duwan
        if percent_used >= 100:
            # dhaafay miisaaniyad
            send_budget_warning_notification_task.delay(instance.user.id, budget.id)
        elif percent_used >= 90:
            # gaaray 90%
            send_budget_warning_notification_task.delay(instance.user.id, budget.id)
        elif percent_used >= 80:
            # gaaray 80%
            send_budget_warning_notification_task.delay(instance.user.id, budget.id)

    except Exception as e:
        print("Budget signal error:", e)
        

def _account_apply_delta(account: Account, delta):
    account.balance = (account.balance or 0) + delta
    account.save(update_fields=["balance","updated_at"])

@receiver(pre_save, sender=Transaction)
def tx_balance_adjust(sender, instance: Transaction, **kwargs):
    if not instance.id:
        return  # handle on post_save for created

@receiver(post_save, sender=Transaction)
def tx_postsave(sender, instance: Transaction, created, **kwargs):
    # Update TSV
    type(sender).objects.filter(pk=instance.pk).update(
        description_tsv=SearchVector("description", config="english")
    )

    # Balance logic (created only; updates should be done via custom view logic)
    if created and not instance.is_deleted:
        if instance.type == "Income":
            _account_apply_delta(instance.account, instance.amount)
        elif instance.type == "Expense":
            _account_apply_delta(instance.account, -instance.amount)
        elif instance.type == "Transfer":
            _account_apply_delta(instance.account, -instance.amount)
            if instance.target_account_id:
                _account_apply_delta(instance.target_account, instance.amount)

# Simple audit helper (called from views to capture old/new snapshots)
def create_audit(user, table_name, record_id, action, old_data=None, new_data=None, ip=None):
    AuditLog.objects.create(
        user=user, table_name=table_name, record_id=record_id, action=action,
        old_data=old_data, new_data=new_data, ip_address=ip
    )