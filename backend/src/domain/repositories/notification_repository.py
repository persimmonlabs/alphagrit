from abc import ABC, abstractmethod
from typing import Optional, List
from src.domain.entities.notification import EmailLog, EmailStatus

class AbstractEmailLogRepository(ABC):
    @abstractmethod
    def get_by_id(self, log_id: str) -> Optional[EmailLog]:
        pass

    @abstractmethod
    def get_all(self, recipient_email: Optional[str] = None, status: Optional[EmailStatus] = None, order_id: Optional[str] = None, user_id: Optional[str] = None) -> List[EmailLog]:
        pass

    @abstractmethod
    def save(self, email_log: EmailLog) -> None:
        pass

    @abstractmethod
    def delete(self, log_id: str) -> None:
        pass
