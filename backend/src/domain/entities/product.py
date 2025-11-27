from dataclasses import dataclass, field
from datetime import datetime
import uuid
from enum import Enum
from typing import Optional

class ProductStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    ARCHIVED = "archived"

class CurrencyType(str, Enum):
    BRL = "BRL"
    USD = "USD"

@dataclass
class Category:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    slug: str = ""
    description: Optional[str] = None
    display_order: int = 0
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def __post_init__(self):
        if not self.name:
            raise ValueError("Category name cannot be empty")
        if not self.slug:
            self.slug = self.name.lower().replace(' ', '-') # Basic slug generation

@dataclass
class Product:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    slug: str = ""
    description_short: Optional[str] = None
    description_full: Optional[str] = None
    category_id: Optional[str] = None
    price_brl: float = 0.0
    price_usd: float = 0.0
    stripe_product_id: Optional[str] = None
    stripe_price_id_brl: Optional[str] = None
    stripe_price_id_usd: Optional[str] = None
    cover_image_url: Optional[str] = None
    file_url: Optional[str] = None
    file_size_bytes: Optional[int] = None
    file_format: str = "pdf"
    author: Optional[str] = None
    pages: Optional[int] = None
    rating: float = 0.0
    total_reviews: int = 0
    total_sales: int = 0
    status: ProductStatus = ProductStatus.DRAFT
    is_featured: bool = False
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    published_at: Optional[datetime] = None

    def __post_init__(self):
        if not self.name:
            raise ValueError("Product name cannot be empty")
        if not self.slug:
            self.slug = self.name.lower().replace(' ', '-') # Basic slug generation
        if not self.file_url and self.status == ProductStatus.ACTIVE:
            raise ValueError("Product must have a file_url if status is ACTIVE")
        if self.price_brl < 0 or self.price_usd < 0:
            raise ValueError("Prices cannot be negative")
        if not (0.0 <= self.rating <= 5.0):
            raise ValueError("Rating must be between 0.0 and 5.0")
        if self.total_reviews < 0 or self.total_sales < 0:
            raise ValueError("Review count and sales count cannot be negative")

    def publish(self):
        if not self.file_url:
            raise ValueError("Cannot publish a product without a file_url.")
        if self.price_brl <= 0 or self.price_usd <= 0:
            raise ValueError("Cannot publish a product with zero or negative price.")
        self.status = ProductStatus.ACTIVE
        self.published_at = datetime.now()
        self.updated_at = datetime.now()

    def archive(self):
        self.status = ProductStatus.ARCHIVED
        self.updated_at = datetime.now()

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "description_short": self.description_short,
            "description_full": self.description_full,
            "category_id": self.category_id,
            "price_brl": self.price_brl,
            "price_usd": self.price_usd,
            "stripe_product_id": self.stripe_product_id,
            "stripe_price_id_brl": self.stripe_price_id_brl,
            "stripe_price_id_usd": self.stripe_price_id_usd,
            "cover_image_url": self.cover_image_url,
            "file_url": self.file_url,
            "file_size_bytes": self.file_size_bytes,
            "file_format": self.file_format,
            "author": self.author,
            "pages": self.pages,
            "rating": self.rating,
            "total_reviews": self.total_reviews,
            "total_sales": self.total_sales,
            "status": self.status.value, # Convert enum to string for dict
            "is_featured": self.is_featured,
            "meta_title": self.meta_title,
            "meta_description": self.meta_description,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "published_at": self.published_at.isoformat() if self.published_at else None,
        }
