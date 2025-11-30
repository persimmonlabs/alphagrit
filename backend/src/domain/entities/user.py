from dataclasses import dataclass, field
from datetime import datetime
import uuid
from enum import Enum
from typing import Optional

# Enums from schema.sql
class UserRole(str, Enum):
    CUSTOMER = "customer"
    ADMIN = "admin"

class CurrencyType(str, Enum):
    BRL = "BRL"
    USD = "USD"

@dataclass
class Profile:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    email: str = ""
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER
    preferred_language: str = "en"
    preferred_currency: CurrencyType = CurrencyType.USD
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    # Authentication fields
    password_hash: Optional[str] = None
    refresh_token_hash: Optional[str] = None
    last_login_at: Optional[datetime] = None

    def __post_init__(self):
        if not self.email:
            raise ValueError("Email cannot be empty for a profile")
        if not "@" in self.email: # Basic email validation
            raise ValueError("Invalid email format")

    def make_admin(self):
        self.role = UserRole.ADMIN
        self.updated_at = datetime.now()

    def update_profile_info(self, full_name: Optional[str] = None, avatar_url: Optional[str] = None, preferred_language: Optional[str] = None, preferred_currency: Optional[CurrencyType] = None):
        if full_name is not None:
            self.full_name = full_name
        if avatar_url is not None:
            self.avatar_url = avatar_url
        if preferred_language is not None:
            self.preferred_language = preferred_language
        if preferred_currency is not None:
            self.preferred_currency = preferred_currency
        self.updated_at = datetime.now()
