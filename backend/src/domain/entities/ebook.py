from dataclasses import dataclass, field
from datetime import datetime
import uuid
from enum import Enum
from typing import Optional, List, Dict, Any

from src.domain.entities.product import ProductStatus


class SectionType(str, Enum):
    STANDARD = "standard"
    TWO_COLUMN = "two-column"
    FULL_WIDTH = "full-width"


class BlockType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    QUOTE = "quote"
    CALLOUT = "callout"
    ACCORDION = "accordion"
    TABS = "tabs"
    CODE = "code"
    VIDEO = "video"
    DIVIDER = "divider"


@dataclass
class EbookThemeConfig:
    primary_color: str = "#f97316"
    accent_color: str = "#ef4444"
    font_family: str = "Inter"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "primaryColor": self.primary_color,
            "accentColor": self.accent_color,
            "fontFamily": self.font_family,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "EbookThemeConfig":
        return cls(
            primary_color=data.get("primaryColor", "#f97316"),
            accent_color=data.get("accentColor", "#ef4444"),
            font_family=data.get("fontFamily", "Inter"),
        )


@dataclass
class Ebook:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str = ""
    total_chapters: int = 0
    estimated_read_time_minutes: Optional[int] = None
    theme_config: EbookThemeConfig = field(default_factory=EbookThemeConfig)
    status: ProductStatus = ProductStatus.DRAFT
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    published_at: Optional[datetime] = None

    # Loaded relationships (not persisted directly)
    chapters: List["EbookChapter"] = field(default_factory=list)
    product: Optional[Any] = None  # Product reference when joined

    def __post_init__(self):
        if not self.product_id:
            raise ValueError("Ebook must have a product_id")

    def publish(self):
        if self.total_chapters == 0:
            raise ValueError("Cannot publish an ebook with no chapters")
        self.status = ProductStatus.ACTIVE
        self.published_at = datetime.now()
        self.updated_at = datetime.now()

    def archive(self):
        self.status = ProductStatus.ARCHIVED
        self.updated_at = datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "product_id": self.product_id,
            "total_chapters": self.total_chapters,
            "estimated_read_time_minutes": self.estimated_read_time_minutes,
            "theme_config": self.theme_config.to_dict() if isinstance(self.theme_config, EbookThemeConfig) else self.theme_config,
            "status": self.status.value if isinstance(self.status, ProductStatus) else self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "published_at": self.published_at.isoformat() if self.published_at else None,
        }


@dataclass
class EbookChapter:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    ebook_id: str = ""
    chapter_number: int = 1
    display_order: int = 1
    title_en: str = ""
    title_pt: Optional[str] = None
    slug: str = ""
    summary_en: Optional[str] = None
    summary_pt: Optional[str] = None
    estimated_read_time_minutes: Optional[int] = None
    is_free_preview: bool = False
    is_published: bool = False
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    # Loaded relationships
    sections: List["EbookSection"] = field(default_factory=list)

    def __post_init__(self):
        if not self.ebook_id:
            raise ValueError("Chapter must have an ebook_id")
        if not self.title_en:
            raise ValueError("Chapter must have a title_en")
        if not self.slug:
            self.slug = self.title_en.lower().replace(' ', '-').replace('.', '').replace(',', '')

    def get_title(self, lang: str = "en") -> str:
        """Get localized title, fallback to English"""
        if lang == "pt" and self.title_pt:
            return self.title_pt
        return self.title_en

    def get_summary(self, lang: str = "en") -> Optional[str]:
        """Get localized summary, fallback to English"""
        if lang == "pt" and self.summary_pt:
            return self.summary_pt
        return self.summary_en

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "ebook_id": self.ebook_id,
            "chapter_number": self.chapter_number,
            "display_order": self.display_order,
            "title_en": self.title_en,
            "title_pt": self.title_pt,
            "slug": self.slug,
            "summary_en": self.summary_en,
            "summary_pt": self.summary_pt,
            "estimated_read_time_minutes": self.estimated_read_time_minutes,
            "is_free_preview": self.is_free_preview,
            "is_published": self.is_published,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


@dataclass
class EbookSection:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    chapter_id: str = ""
    display_order: int = 1
    heading_en: Optional[str] = None
    heading_pt: Optional[str] = None
    section_type: SectionType = SectionType.STANDARD
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    # Loaded relationships
    blocks: List["EbookContentBlock"] = field(default_factory=list)

    def __post_init__(self):
        if not self.chapter_id:
            raise ValueError("Section must have a chapter_id")

    def get_heading(self, lang: str = "en") -> Optional[str]:
        """Get localized heading, fallback to English"""
        if lang == "pt" and self.heading_pt:
            return self.heading_pt
        return self.heading_en

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "chapter_id": self.chapter_id,
            "display_order": self.display_order,
            "heading_en": self.heading_en,
            "heading_pt": self.heading_pt,
            "section_type": self.section_type.value if isinstance(self.section_type, SectionType) else self.section_type,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


@dataclass
class EbookContentBlock:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    section_id: str = ""
    display_order: int = 1
    block_type: BlockType = BlockType.TEXT
    content_en: Dict[str, Any] = field(default_factory=dict)
    content_pt: Optional[Dict[str, Any]] = None
    config: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def __post_init__(self):
        if not self.section_id:
            raise ValueError("Block must have a section_id")

    def get_content(self, lang: str = "en") -> Dict[str, Any]:
        """Get localized content, fallback to English"""
        if lang == "pt" and self.content_pt:
            return self.content_pt
        return self.content_en

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "section_id": self.section_id,
            "display_order": self.display_order,
            "block_type": self.block_type.value if isinstance(self.block_type, BlockType) else self.block_type,
            "content_en": self.content_en,
            "content_pt": self.content_pt,
            "config": self.config,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


@dataclass
class EbookReadingProgress:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = ""
    ebook_id: str = ""
    last_chapter_id: Optional[str] = None
    last_section_id: Optional[str] = None
    completion_percentage: float = 0.0
    completed_chapters: List[str] = field(default_factory=list)
    bookmarks: List[str] = field(default_factory=list)
    started_at: datetime = field(default_factory=datetime.now)
    last_read_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None

    def __post_init__(self):
        if not self.user_id:
            raise ValueError("Progress must have a user_id")
        if not self.ebook_id:
            raise ValueError("Progress must have an ebook_id")

    def mark_chapter_completed(self, chapter_id: str):
        if chapter_id not in self.completed_chapters:
            self.completed_chapters.append(chapter_id)
        self.last_read_at = datetime.now()

    def add_bookmark(self, section_id: str):
        if section_id not in self.bookmarks:
            self.bookmarks.append(section_id)

    def remove_bookmark(self, section_id: str):
        if section_id in self.bookmarks:
            self.bookmarks.remove(section_id)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "ebook_id": self.ebook_id,
            "last_chapter_id": self.last_chapter_id,
            "last_section_id": self.last_section_id,
            "completion_percentage": self.completion_percentage,
            "completed_chapters": self.completed_chapters,
            "bookmarks": self.bookmarks,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "last_read_at": self.last_read_at.isoformat() if self.last_read_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }
