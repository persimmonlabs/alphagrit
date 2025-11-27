from dataclasses import dataclass, field
from datetime import datetime
import uuid
from enum import Enum
from typing import Optional

# Enums from schema.sql
class RefundStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    DENIED = "denied"

@dataclass
class RefundRequest:
    order_id: str # No default, comes first
    id: str = field(default_factory=lambda: str(uuid.uuid4())) # Now follows non-default args
    user_id: Optional[str] = None
    reason: Optional[str] = None
    status: RefundStatus = RefundStatus.PENDING
    admin_notes: Optional[str] = None
    processed_by: Optional[str] = None
    processed_at: Optional[datetime] = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def __post_init__(self):
        if not self.order_id:
            raise ValueError("Refund request must be associated with an order ID")

    def approve(self, processed_by_user_id: str):
        if self.status != RefundStatus.PENDING:
            raise ValueError(f"Cannot approve a refund request with status {self.status.value}")
        self.status = RefundStatus.APPROVED
        self.processed_by = processed_by_user_id
        self.processed_at = datetime.now()
        self.updated_at = datetime.now()

    def deny(self, processed_by_user_id: str, admin_notes: Optional[str] = None):
        if self.status != RefundStatus.PENDING:
            raise ValueError(f"Cannot deny a refund request with status {self.status.value}")
        self.status = RefundStatus.DENIED
        self.processed_by = processed_by_user_id
        self.admin_notes = admin_notes
        self.processed_at = datetime.now()
        self.updated_at = datetime.now()