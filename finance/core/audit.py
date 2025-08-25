# core/audit.py
from .models import AuditLog

def create_audit(user, table_name, record_id, action, old_data=None, new_data=None, ip=None):
    AuditLog.objects.create(
        user=user,
        table_name=table_name,
        record_id=record_id,
        action=action,
        old_data=old_data,
        new_data=new_data,
        ip_address=ip
    )
