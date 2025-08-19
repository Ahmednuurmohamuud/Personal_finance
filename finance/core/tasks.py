# core/tasks.py  ------ automation iyo background jobs
from celery import shared_task
from django.utils import timezone
from datetime import timedelta, date
from django.conf import settings
from django.db import transaction as dbtx
import requests

# Wildcard imports meesha laga saaray
# Import garee models gaar ah halka loo baahdo gudaha functions

# ---------- SEND EMAIL TASK ----------
@shared_task
def send_email_notification_task(user_id, subject, message):
    """Dir email caadi ah"""
    try:
        from .models import User
        from django.core.mail import send_mail

        user = User.objects.get(pk=user_id)
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=True
        )
    except Exception as e:
        print("Send email error:", e)
        return {"status": "failed", "error": str(e)}
    return {"status": "sent", "to": user_id}


# ---------- BUDGET WARNING TASK ----------
@shared_task
def send_budget_warning_notification_task(user_id, budget_id):
    """Check budget usage and notify user"""
    try:
        # Import gudaha function si circular import looga fogaado
        from .models import User, Budget, Transaction, Notification, NotificationType
        from django.db.models import Sum
        from django.core.mail import send_mail

        user = User.objects.get(pk=user_id)
        budget = Budget.objects.get(pk=budget_id)

        # wadarta kharashyada bishan
        total_spent = Transaction.objects.filter(
            user=user,
            category=budget.category,
            type="Expense",
            transaction_date__month=budget.month,
            transaction_date__year=budget.year,
        ).aggregate(total=Sum("amount"))["total"] or 0

        percent_used = (total_spent / budget.amount) * 100 if budget.amount > 0 else 0

        # go'aami fariinta ku saleysan boqolkiiba
        if percent_used >= 100:
            msg = f"⚠️ Waxaad dhaaftay miisaaniyadda {budget.category.name} bishan."
        elif percent_used >= 90:
            msg = f"⚠️ Kharashkaaga {budget.category.name} wuxuu gaaray {percent_used:.0f}% miisaaniyadda."
        elif percent_used >= 80:
            msg = f"ℹ️ Kharashkaaga {budget.category.name} wuxuu gaaray {percent_used:.0f}% miisaaniyadda."
        else:
            return  # digniin looma baahna

        # Abuur notification gudaha app-ka
        Notification.objects.create(
            user=user,
            type=NotificationType.BUDGET_WARNING,
            message=msg
        )

        # Dir email
        send_mail(
            subject="Budget Warning",
            message=msg,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )

    except Exception as e:
        print("Budget warning task error:", e)


# ---------- RECURRING TRANSACTIONS ----------
def _next_due(freq: str, d: date) -> date:
    from dateutil.relativedelta import relativedelta
    if freq == "Daily": return d + timedelta(days=1)
    if freq == "Weekly": return d + timedelta(weeks=1)
    if freq == "Bi-Weekly": return d + timedelta(weeks=2)
    if freq == "Monthly": return d + relativedelta(months=1)
    if freq == "Quarterly": return d + relativedelta(months=3)
    if freq == "Annually": return d + relativedelta(years=1)
    return d


@shared_task
def generate_due_recurring_transactions_task():
    from .models import RecurringBill
    bills = RecurringBill.objects.filter(is_active=True, is_deleted=False, next_due_date__lte=date.today())
    for bill in bills:
        generate_single_recurring_tx(bill.id)


def generate_single_recurring_tx(bill_id):
    from .models import Transaction, Notification, NotificationType, RecurringBill
    with dbtx.atomic():
        bill = RecurringBill.objects.select_for_update().get(pk=bill_id)
        if not bill.is_active or bill.is_deleted:
            return None
        tx = Transaction.objects.create(
            user=bill.user, account=bill.account, category=bill.category, type=bill.type,
            amount=bill.amount, currency=bill.currency, description=f"[Recurring] {bill.name}",
            transaction_date=bill.next_due_date, is_recurring_instance=True, recurring_bill=bill
        )
        bill.last_generated_date = bill.next_due_date
        bill.next_due_date = _next_due(bill.frequency, bill.next_due_date)
        bill.save(update_fields=["last_generated_date", "next_due_date", "updated_at"])

        # Notify user
        Notification.objects.create(
            user=bill.user,
            type=NotificationType.BILL_DUE,
            message=f"Generated recurring: {bill.name}"
        )
        return str(tx.id)


# ---------- FETCH USD/SOS ----------
@shared_task
def fetch_usd_sos_rate_task():
    try:
        from .models import Currency, ExchangeRate
        r = requests.get("https://api.exchangerate.host/latest?base=USD&symbols=SOS", timeout=10)
        data = r.json()
        rate = data["rates"]["SOS"]

        usd = Currency.objects.get(code="USD")
        sos = Currency.objects.get(code="SOS")
        ExchangeRate.objects.update_or_create(
            base_currency=usd,
            target_currency=sos,
            date=date.today(),
            defaults={"rate": rate, "source": "ExchangeRate.host", "last_fetched_at": timezone.now()}
        )
    except Exception as e:
        print("Fetch USD/SOS error:", e)
