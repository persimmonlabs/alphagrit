from dataclasses import dataclass, field
from datetime import datetime
import uuid
from typing import Optional

@dataclass
class Review:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    product_id: Optional[str] = None # REFERENCES products(id)
    user_id: Optional[str] = None # REFERENCES auth.users(id) - for SQLAlchemy ORM
    title: Optional[str] = None
    content: str = ""
    rating: int = 1 # CHECK (rating >= 1 AND rating <= 5)
    reviewer_name: Optional[str] = None
    reviewer_avatar_url: Optional[str] = None
    is_featured: bool = False
    is_verified_purchase: bool = False
    is_approved: bool = False
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def __post_init__(self):
        if not self.content:
            raise ValueError("Review content cannot be empty")
        if not (1 <= self.rating <= 5):
            raise ValueError("Rating must be between 1 and 5")

    def approve(self):
        self.is_approved = True
        self.updated_at = datetime.now()

    def feature(self):
        self.is_featured = True
        self.updated_at = datetime.now()

    def unapprove(self):
        self.is_approved = False
        self.updated_at = datetime.now()

    def unfeature(self):
        self.is_featured = False
        self.updated_at = datetime.now()
