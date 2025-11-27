from dataclasses import dataclass, field
from datetime import datetime
import uuid
from enum import Enum
from typing import Optional

# Enums based on email_logs.status VARCHAR
class EmailStatus(str, Enum):
    SENT = "sent"
    FAILED = "failed"
    BOUNCED = "bounced"
    PENDING = "pending" # An additional status for emails queued but not yet sent

@dataclass
class EmailLog:
    recipient_email: str # No default, comes first
    subject: str # No default, comes second
    id: str = field(default_factory=lambda: str(uuid.uuid4())) # Now follows non-default args
    template_name: Optional[str] = None
    status: EmailStatus = EmailStatus.PENDING
    error_message: Optional[str] = None
    order_id: Optional[str] = None
    user_id: Optional[str] = None
    provider: Optional[str] = None
    provider_message_id: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)

    def __post_init__(self):
        if not self.recipient_email:
            raise ValueError("Recipient email cannot be empty")
        if not self.subject:
            raise ValueError("Email subject cannot be empty")
        # Basic email format validation
        if "@" not in self.recipient_email or "." not in self.recipient_email:
            raise ValueError("Invalid recipient email format")

    def mark_sent(self, provider: Optional[str] = None, provider_message_id: Optional[str] = None):
        self.status = EmailStatus.SENT
        self.provider = provider
        self.provider_message_id = provider_message_id

    def mark_failed(self, error_message: Optional[str] = None, provider: Optional[str] = None):
        self.status = EmailStatus.FAILED
        self.error_message = error_message
        self.provider = provider