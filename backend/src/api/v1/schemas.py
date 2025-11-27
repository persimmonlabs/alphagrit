from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
from src.domain.entities.product import ProductStatus, CurrencyType
from src.domain.entities.order import OrderStatus, PaymentMethod, RefundStatus
from src.domain.entities.user import UserRole
from src.domain.entities.content import PostStatus
from src.domain.entities.notification import EmailStatus


# --- Product Catalog Schemas ---
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    display_order: Optional[int] = 0
    is_active: Optional[bool] = True

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    name: Optional[str] = None
    slug: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    name: str
    slug: str
    description_short: Optional[str] = None
    description_full: Optional[str] = None
    category_id: Optional[str] = None
    price_brl: float
    price_usd: float
    cover_image_url: Optional[str] = None
    file_url: Optional[str] = None
    file_size_bytes: Optional[int] = None
    file_format: Optional[str] = "pdf"
    author: Optional[str] = None
    pages: Optional[int] = None
    status: Optional[ProductStatus] = ProductStatus.DRAFT
    is_featured: Optional[bool] = False
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    name: Optional[str] = None
    slug: Optional[str] = None
    price_brl: Optional[float] = None
    price_usd: Optional[float] = None

class ProductResponse(ProductBase):
    id: str
    rating: float
    total_reviews: int
    total_sales: int
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Order Management Schemas ---
class CartItemBase(BaseModel):
    product_id: str
    quantity: int = 1

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemResponse(CartItemBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class OrderItemBase(BaseModel):
    product_id: Optional[str] = None
    product_name: str
    product_slug: Optional[str] = None
    price: float
    quantity: int
    subtotal: float
    file_url: Optional[str] = None

class OrderItemResponse(OrderItemBase):
    id: str

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    customer_email: str
    customer_name: Optional[str] = None
    payment_method: PaymentMethod
    currency: CurrencyType
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class OrderResponse(BaseModel):
    id: str
    order_number: Optional[str] = None
    user_id: Optional[str] = None
    customer_email: str
    customer_name: Optional[str] = None
    subtotal: float
    tax: float
    total: float
    currency: CurrencyType
    payment_method: PaymentMethod
    payment_intent_id: Optional[str] = None
    stripe_session_id: Optional[str] = None
    mercado_pago_id: Optional[str] = None
    status: OrderStatus
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    paid_at: Optional[datetime] = None
    refunded_at: Optional[datetime] = None
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True

class DownloadLinkResponse(BaseModel):
    id: str
    order_id: str
    product_id: str
    user_id: Optional[str] = None
    token: str
    file_url: str
    max_downloads: int
    download_count: int
    expires_at: datetime
    last_downloaded_at: Optional[datetime] = None
    last_ip_address: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- User Profiles Schemas ---
class ProfileBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Optional[UserRole] = UserRole.CUSTOMER
    preferred_language: Optional[str] = "en"
    preferred_currency: Optional[CurrencyType] = CurrencyType.USD

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    email: Optional[str] = None # Allow updating email, with checks in service
    
class ProfileResponse(ProfileBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Content Management Schemas ---
class BlogPostBase(BaseModel):
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: str
    author_id: Optional[str] = None
    author_name: Optional[str] = None
    cover_image_url: Optional[str] = None
    status: Optional[PostStatus] = PostStatus.DRAFT
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None

class BlogPostCreate(BlogPostBase):
    pass

class BlogPostUpdate(BlogPostBase):
    title: Optional[str] = None
    slug: Optional[str] = None
    content: Optional[str] = None

class BlogPostResponse(BlogPostBase):
    id: str
    views: int
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class FaqBase(BaseModel):
    question: str
    answer: str
    category: Optional[str] = None
    display_order: Optional[int] = 0
    is_active: Optional[bool] = True

class FaqCreate(FaqBase):
    pass

class FaqUpdate(FaqBase):
    question: Optional[str] = None
    answer: Optional[str] = None

class FaqResponse(FaqBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SiteConfigSettingResponse(BaseModel):
    key: str
    value: Any
    value_type: str
    description: Optional[str] = None
    is_public: bool
    updated_at: datetime

    class Config:
        from_attributes = True

class SiteConfigSettingUpdate(BaseModel):
    value: Any
    value_type: str
    description: Optional[str] = None
    is_public: Optional[bool] = None

class FeatureFlagResponse(BaseModel):
    key: str
    is_enabled: bool
    description: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True

class FeatureFlagUpdate(BaseModel):
    is_enabled: bool
    description: Optional[str] = None


# --- Customer Feedback Schemas ---
class ReviewBase(BaseModel):
    product_id: Optional[str] = None
    user_id: Optional[str] = None
    title: Optional[str] = None
    content: str
    rating: int
    reviewer_name: Optional[str] = None
    reviewer_avatar_url: Optional[str] = None
    is_featured: Optional[bool] = False
    is_verified_purchase: Optional[bool] = False
    is_approved: Optional[bool] = False

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(ReviewBase):
    content: Optional[str] = None
    rating: Optional[int] = None

class ReviewResponse(ReviewBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Customer Support / Refunds Schemas ---
class RefundRequestBase(BaseModel):
    order_id: str
    user_id: Optional[str] = None
    reason: Optional[str] = None

class RefundRequestCreate(RefundRequestBase):
    pass

class RefundRequestResponse(RefundRequestBase):
    id: str
    status: RefundStatus
    admin_notes: Optional[str] = None
    processed_by: Optional[str] = None
    processed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class RefundRequestProcess(BaseModel):
    action: str # "approve" or "deny"
    admin_notes: Optional[str] = None


# --- Notifications / Emailing Schemas ---
class EmailLogResponse(BaseModel):
    id: str
    recipient_email: str
    subject: str
    template_name: Optional[str] = None
    status: EmailStatus
    error_message: Optional[str] = None
    order_id: Optional[str] = None
    user_id: Optional[str] = None
    provider: Optional[str] = None
    provider_message_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SendEmailRequest(BaseModel):
    recipient_email: str
    subject: str
    body: str
    html_body: Optional[str] = None
    template_name: Optional[str] = None
    order_id: Optional[str] = None
    user_id: Optional[str] = None
    provider: Optional[str] = None


# --- E-Book Schemas ---
class EbookThemeConfigSchema(BaseModel):
    primaryColor: str = "#f97316"
    accentColor: str = "#ef4444"
    fontFamily: str = "Inter"

class EbookBase(BaseModel):
    product_id: str
    theme_config: Optional[EbookThemeConfigSchema] = None
    estimated_read_time_minutes: Optional[int] = None

class EbookCreate(EbookBase):
    pass

class EbookUpdate(BaseModel):
    theme_config: Optional[EbookThemeConfigSchema] = None
    estimated_read_time_minutes: Optional[int] = None

class EbookResponse(BaseModel):
    id: str
    product_id: str
    total_chapters: int
    estimated_read_time_minutes: Optional[int] = None
    theme_config: Optional[dict] = None
    status: ProductStatus
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class EbookChapterBase(BaseModel):
    title_en: str
    chapter_number: int
    title_pt: Optional[str] = None
    slug: Optional[str] = None
    summary_en: Optional[str] = None
    summary_pt: Optional[str] = None
    is_free_preview: bool = False

class EbookChapterCreate(EbookChapterBase):
    pass

class EbookChapterUpdate(BaseModel):
    title_en: Optional[str] = None
    title_pt: Optional[str] = None
    slug: Optional[str] = None
    summary_en: Optional[str] = None
    summary_pt: Optional[str] = None
    chapter_number: Optional[int] = None
    is_free_preview: Optional[bool] = None
    is_published: Optional[bool] = None

class EbookChapterResponse(BaseModel):
    id: str
    ebook_id: str
    chapter_number: int
    display_order: int
    title_en: str
    title_pt: Optional[str] = None
    slug: str
    summary_en: Optional[str] = None
    summary_pt: Optional[str] = None
    estimated_read_time_minutes: Optional[int] = None
    is_free_preview: bool
    is_published: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class EbookSectionBase(BaseModel):
    heading_en: Optional[str] = None
    heading_pt: Optional[str] = None
    section_type: str = "standard"

class EbookSectionCreate(EbookSectionBase):
    pass

class EbookSectionUpdate(EbookSectionBase):
    pass

class EbookSectionResponse(BaseModel):
    id: str
    chapter_id: str
    display_order: int
    heading_en: Optional[str] = None
    heading_pt: Optional[str] = None
    section_type: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class EbookContentBlockBase(BaseModel):
    block_type: str
    content_en: dict
    content_pt: Optional[dict] = None
    config: Optional[dict] = None

class EbookContentBlockCreate(EbookContentBlockBase):
    pass

class EbookContentBlockUpdate(BaseModel):
    block_type: Optional[str] = None
    content_en: Optional[dict] = None
    content_pt: Optional[dict] = None
    config: Optional[dict] = None

class EbookContentBlockResponse(BaseModel):
    id: str
    section_id: str
    display_order: int
    block_type: str
    content_en: dict
    content_pt: Optional[dict] = None
    config: Optional[dict] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class EbookReadingProgressResponse(BaseModel):
    id: str
    user_id: str
    ebook_id: str
    last_chapter_id: Optional[str] = None
    last_section_id: Optional[str] = None
    completion_percentage: float
    completed_chapters: List[str] = []
    bookmarks: List[str] = []
    started_at: datetime
    last_read_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UpdateReadingProgressRequest(BaseModel):
    last_chapter_id: Optional[str] = None
    last_section_id: Optional[str] = None
    completion_percentage: Optional[float] = None

class ReorderRequest(BaseModel):
    ids: List[str]

class EbookAccessResponse(BaseModel):
    has_access: bool
    ebook_id: str
    product_id: str
