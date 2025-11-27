from typing import Optional, List, Dict
from src.domain.repositories.notification_repository import AbstractEmailLogRepository
from src.domain.entities.notification import EmailLog, EmailStatus

class InMemoryEmailLogRepository(AbstractEmailLogRepository):
    def __init__(self, initial_logs: Optional[List[EmailLog]] = None):
        self._logs: Dict[str, EmailLog] = {}
        if initial_logs:
            for log in initial_logs:
                self._logs[log.id] = log

    def get_by_id(self, log_id: str) -> Optional[EmailLog]:
        return self._logs.get(log_id)

    def get_all(self, recipient_email: Optional[str] = None, status: Optional[EmailStatus] = None, order_id: Optional[str] = None, user_id: Optional[str] = None) -> List[EmailLog]:
        filtered_logs = list(self._logs.values())
        if recipient_email:
            filtered_logs = [log for log in filtered_logs if log.recipient_email == recipient_email]
        if status:
            filtered_logs = [log for log in filtered_logs if log.status == status]
        if order_id:
            filtered_logs = [log for log in filtered_logs if log.order_id == order_id]
        if user_id:
            filtered_logs = [log for log in filtered_logs if log.user_id == user_id]
        return filtered_logs

    def save(self, email_log: EmailLog) -> None:
        self._logs[email_log.id] = email_log

    def delete(self, log_id: str) -> None:
        if log_id in self._logs:
            del self._logs[log_id]
