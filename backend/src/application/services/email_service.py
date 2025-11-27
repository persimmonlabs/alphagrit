from typing import Optional, List
from datetime import datetime
import uuid
from abc import ABC, abstractmethod

from src.domain.entities.notification import EmailLog, EmailStatus
from src.domain.repositories.notification_repository import AbstractEmailLogRepository
from src.domain.entities.order import Order # For order reference validation
from src.domain.entities.user import Profile # For user reference validation

# Abstract Email Sender Interface (Infrastructure dependency)
class AbstractEmailSender(ABC):
    @abstractmethod
    def send_email(self, recipient_email: str, subject: str, body: str, html_body: Optional[str] = None) -> str:
        """
        Sends an email and returns a provider-specific message ID.
        Raises an exception if sending fails.
        """
        pass

class EmailService:
    def __init__(
        self,
        email_log_repo: AbstractEmailLogRepository,
        email_sender: AbstractEmailSender
    ):
        self.email_log_repo = email_log_repo
        self.email_sender = email_sender

    def send_and_log_email(
        self,
        recipient_email: str,
        subject: str,
        body: str,
        html_body: Optional[str] = None,
        template_name: Optional[str] = None,
        order_id: Optional[str] = None,
        user_id: Optional[str] = None,
        provider: Optional[str] = None # e.g., "resend", "sendgrid"
    ) -> EmailLog:
        # Create an initial log entry as PENDING
        email_log = EmailLog(
            recipient_email=recipient_email,
            subject=subject,
            template_name=template_name,
            order_id=order_id,
            user_id=user_id,
            status=EmailStatus.PENDING # Initial status
        )
        self.email_log_repo.save(email_log)

        try:
            # Attempt to send the email
            message_id = self.email_sender.send_email(
                recipient_email=recipient_email,
                subject=subject,
                body=body,
                html_body=html_body
            )
            # Mark as SENT if successful
            email_log.mark_sent(provider=provider, provider_message_id=message_id)
        except Exception as e:
            # Mark as FAILED if sending fails
            email_log.mark_failed(error_message=str(e), provider=provider)
            raise # Re-raise the exception to inform the caller
        finally:
            # Always save the updated log status
            self.email_log_repo.save(email_log)
        
        return email_log

    def get_email_log_by_id(self, log_id: str) -> Optional[EmailLog]:
        return self.email_log_repo.get_by_id(log_id)

    def list_email_logs(
        self,
        recipient_email: Optional[str] = None,
        status: Optional[EmailStatus] = None,
        order_id: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> List[EmailLog]:
        return self.email_log_repo.get_all(
            recipient_email=recipient_email,
            status=status,
            order_id=order_id,
            user_id=user_id
        )

    def delete_email_log(self, log_id: str) -> None:
        if not self.email_log_repo.get_by_id(log_id):
            raise ValueError(f"Email log with ID {log_id} not found.")
        self.email_log_repo.delete(log_id)
