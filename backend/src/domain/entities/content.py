from dataclasses import dataclass, field
from datetime import datetime
import uuid
from enum import Enum
from typing import Optional, Any
import json # For JSONB handling

from src.domain.entities.user import UserRole # For author_id reference

# Enums from schema.sql
class PostStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

@dataclass
class BlogPost:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    title: str = ""
    slug: str = ""
    excerpt: Optional[str] = None
    content: str = ""
    author_id: Optional[str] = None # REFERENCES auth.users(id) - for SQLAlchemy ORM
    author_name: Optional[str] = None
    cover_image_url: Optional[str] = None
    status: PostStatus = PostStatus.DRAFT
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    views: int = 0
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    published_at: Optional[datetime] = None

    def __post_init__(self):
        if not self.title:
            raise ValueError("Blog post title cannot be empty")
        if not self.slug:
            self.slug = self.title.lower().replace(' ', '-') # Basic slug generation
        if not self.content:
            raise ValueError("Blog post content cannot be empty")
        if self.views < 0:
            raise ValueError("Views cannot be negative")

    def publish(self):
        if self.status == PostStatus.PUBLISHED:
            raise ValueError("Blog post is already published")
        self.status = PostStatus.PUBLISHED
        self.published_at = datetime.now()
        self.updated_at = datetime.now()

    def archive(self):
        self.status = PostStatus.ARCHIVED
        self.updated_at = datetime.now()

@dataclass
class FAQ:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    question: str = ""
    answer: str = ""
    category: Optional[str] = None
    display_order: int = 0
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def __post_init__(self):
        if not self.question:
            raise ValueError("FAQ question cannot be empty")
        if not self.answer:
            raise ValueError("FAQ answer cannot be empty")
        if self.display_order < 0:
            raise ValueError("Display order cannot be negative")

@dataclass
class SiteConfigSetting:
    key: str = ""
    value: Any = None # JSONB type in DB, so can be any Python type
    value_type: str = "string" # string, json, number, boolean
    description: Optional[str] = None
    is_public: bool = False
    updated_at: datetime = field(default_factory=datetime.now)

    def __post_init__(self):
        if not self.key:
            raise ValueError("Site config key cannot be empty")
        # Basic validation for value_type and value consistency
        if self.value_type == "json" and not isinstance(self.value, (dict, list)):
             try: # Try to parse if it's a string, assuming it might come from direct input
                 json.loads(self.value)
             except (TypeError, json.JSONDecodeError):
                 raise ValueError(f"Value for key '{self.key}' is not valid JSON for value_type 'json'")
        elif self.value_type == "number" and not isinstance(self.value, (int, float)):
             try:
                 float(self.value)
             except (TypeError, ValueError):
                 raise ValueError(f"Value for key '{self.key}' is not a valid number for value_type 'number'")
        elif self.value_type == "boolean" and not isinstance(self.value, bool):
             if not (isinstance(self.value, str) and self.value.lower() in ("true", "false")):
                 raise ValueError(f"Value for key '{self.key}' is not a valid boolean for value_type 'boolean'")

@dataclass
class FeatureFlag:
    key: str = ""
    is_enabled: bool = False
    description: Optional[str] = None
    updated_at: datetime = field(default_factory=datetime.now)

    def __post_init__(self):
        if not self.key:
            raise ValueError("Feature flag key cannot be empty")
