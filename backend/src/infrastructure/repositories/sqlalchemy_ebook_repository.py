from sqlalchemy import Column, String, Float, Boolean, DateTime, Integer, Text, ForeignKey, Enum as SQLEnum, ARRAY
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from typing import Optional, List
from datetime import datetime

from src.domain.entities.ebook import (
    Ebook, EbookChapter, EbookSection, EbookContentBlock, EbookReadingProgress,
    EbookThemeConfig, SectionType, BlockType
)
from src.domain.entities.product import ProductStatus
from src.domain.repositories.ebook_repository import (
    AbstractEbookRepository, AbstractEbookChapterRepository,
    AbstractEbookSectionRepository, AbstractEbookContentBlockRepository,
    AbstractEbookReadingProgressRepository
)
from src.infrastructure.base import Base
from sqlalchemy.orm import Session


# SQLAlchemy ORM Models
class EbookORM(Base):
    __tablename__ = "ebooks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, unique=True)
    total_chapters = Column(Integer, default=0)
    estimated_read_time_minutes = Column(Integer, nullable=True)
    theme_config = Column(JSONB, default={"primaryColor": "#f97316", "accentColor": "#ef4444", "fontFamily": "Inter"})
    status = Column(SQLEnum(ProductStatus, name="product_status", create_type=False), default=ProductStatus.DRAFT, nullable=False)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=True)

    chapters = relationship("EbookChapterORM", back_populates="ebook", cascade="all, delete-orphan", order_by="EbookChapterORM.display_order")

    def to_entity(self) -> Ebook:
        theme = EbookThemeConfig.from_dict(self.theme_config) if self.theme_config else EbookThemeConfig()
        return Ebook(
            id=str(self.id),
            product_id=str(self.product_id),
            total_chapters=self.total_chapters or 0,
            estimated_read_time_minutes=self.estimated_read_time_minutes,
            theme_config=theme,
            status=self.status,
            created_at=self.created_at,
            updated_at=self.updated_at,
            published_at=self.published_at
        )

    @staticmethod
    def from_entity(entity: Ebook) -> 'EbookORM':
        theme_dict = entity.theme_config.to_dict() if isinstance(entity.theme_config, EbookThemeConfig) else entity.theme_config
        return EbookORM(
            id=entity.id,
            product_id=entity.product_id,
            total_chapters=entity.total_chapters,
            estimated_read_time_minutes=entity.estimated_read_time_minutes,
            theme_config=theme_dict,
            status=entity.status,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
            published_at=entity.published_at
        )


class EbookChapterORM(Base):
    __tablename__ = "ebook_chapters"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ebook_id = Column(String(36), ForeignKey("ebooks.id", ondelete="CASCADE"), nullable=False)
    chapter_number = Column(Integer, nullable=False)
    display_order = Column(Integer, nullable=False)
    title_en = Column(String(255), nullable=False)
    title_pt = Column(String(255), nullable=True)
    slug = Column(String(255), nullable=False)
    summary_en = Column(Text, nullable=True)
    summary_pt = Column(Text, nullable=True)
    estimated_read_time_minutes = Column(Integer, nullable=True)
    is_free_preview = Column(Boolean, default=False)
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)

    ebook = relationship("EbookORM", back_populates="chapters")
    sections = relationship("EbookSectionORM", back_populates="chapter", cascade="all, delete-orphan", order_by="EbookSectionORM.display_order")

    def to_entity(self) -> EbookChapter:
        return EbookChapter(
            id=str(self.id),
            ebook_id=str(self.ebook_id),
            chapter_number=self.chapter_number,
            display_order=self.display_order,
            title_en=self.title_en,
            title_pt=self.title_pt,
            slug=self.slug,
            summary_en=self.summary_en,
            summary_pt=self.summary_pt,
            estimated_read_time_minutes=self.estimated_read_time_minutes,
            is_free_preview=self.is_free_preview or False,
            is_published=self.is_published or False,
            created_at=self.created_at,
            updated_at=self.updated_at
        )

    @staticmethod
    def from_entity(entity: EbookChapter) -> 'EbookChapterORM':
        return EbookChapterORM(
            id=entity.id,
            ebook_id=entity.ebook_id,
            chapter_number=entity.chapter_number,
            display_order=entity.display_order,
            title_en=entity.title_en,
            title_pt=entity.title_pt,
            slug=entity.slug,
            summary_en=entity.summary_en,
            summary_pt=entity.summary_pt,
            estimated_read_time_minutes=entity.estimated_read_time_minutes,
            is_free_preview=entity.is_free_preview,
            is_published=entity.is_published,
            created_at=entity.created_at,
            updated_at=entity.updated_at
        )


class EbookSectionORM(Base):
    __tablename__ = "ebook_sections"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chapter_id = Column(String(36), ForeignKey("ebook_chapters.id", ondelete="CASCADE"), nullable=False)
    display_order = Column(Integer, nullable=False)
    heading_en = Column(String(255), nullable=True)
    heading_pt = Column(String(255), nullable=True)
    section_type = Column(String(50), default="standard")
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)

    chapter = relationship("EbookChapterORM", back_populates="sections")
    blocks = relationship("EbookContentBlockORM", back_populates="section", cascade="all, delete-orphan", order_by="EbookContentBlockORM.display_order")

    def to_entity(self) -> EbookSection:
        section_type = SectionType(self.section_type) if self.section_type else SectionType.STANDARD
        return EbookSection(
            id=str(self.id),
            chapter_id=str(self.chapter_id),
            display_order=self.display_order,
            heading_en=self.heading_en,
            heading_pt=self.heading_pt,
            section_type=section_type,
            created_at=self.created_at,
            updated_at=self.updated_at
        )

    @staticmethod
    def from_entity(entity: EbookSection) -> 'EbookSectionORM':
        section_type_value = entity.section_type.value if isinstance(entity.section_type, SectionType) else entity.section_type
        return EbookSectionORM(
            id=entity.id,
            chapter_id=entity.chapter_id,
            display_order=entity.display_order,
            heading_en=entity.heading_en,
            heading_pt=entity.heading_pt,
            section_type=section_type_value,
            created_at=entity.created_at,
            updated_at=entity.updated_at
        )


class EbookContentBlockORM(Base):
    __tablename__ = "ebook_content_blocks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    section_id = Column(String(36), ForeignKey("ebook_sections.id", ondelete="CASCADE"), nullable=False)
    display_order = Column(Integer, nullable=False)
    block_type = Column(String(50), nullable=False)
    content_en = Column(JSONB, nullable=False, default={})
    content_pt = Column(JSONB, nullable=True)
    config = Column(JSONB, default={})
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)

    section = relationship("EbookSectionORM", back_populates="blocks")

    def to_entity(self) -> EbookContentBlock:
        block_type = BlockType(self.block_type) if self.block_type else BlockType.TEXT
        return EbookContentBlock(
            id=str(self.id),
            section_id=str(self.section_id),
            display_order=self.display_order,
            block_type=block_type,
            content_en=self.content_en or {},
            content_pt=self.content_pt,
            config=self.config or {},
            created_at=self.created_at,
            updated_at=self.updated_at
        )

    @staticmethod
    def from_entity(entity: EbookContentBlock) -> 'EbookContentBlockORM':
        block_type_value = entity.block_type.value if isinstance(entity.block_type, BlockType) else entity.block_type
        return EbookContentBlockORM(
            id=entity.id,
            section_id=entity.section_id,
            display_order=entity.display_order,
            block_type=block_type_value,
            content_en=entity.content_en,
            content_pt=entity.content_pt,
            config=entity.config,
            created_at=entity.created_at,
            updated_at=entity.updated_at
        )


class EbookReadingProgressORM(Base):
    __tablename__ = "ebook_reading_progress"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    ebook_id = Column(String(36), ForeignKey("ebooks.id", ondelete="CASCADE"), nullable=False)
    last_chapter_id = Column(String(36), ForeignKey("ebook_chapters.id", ondelete="SET NULL"), nullable=True)
    last_section_id = Column(String(36), ForeignKey("ebook_sections.id", ondelete="SET NULL"), nullable=True)
    completion_percentage = Column(Float, default=0.0)
    completed_chapters = Column(ARRAY(String(36)), default=[])
    bookmarks = Column(ARRAY(String(36)), default=[])
    started_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    last_read_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    def to_entity(self) -> EbookReadingProgress:
        return EbookReadingProgress(
            id=str(self.id),
            user_id=str(self.user_id),
            ebook_id=str(self.ebook_id),
            last_chapter_id=str(self.last_chapter_id) if self.last_chapter_id else None,
            last_section_id=str(self.last_section_id) if self.last_section_id else None,
            completion_percentage=self.completion_percentage or 0.0,
            completed_chapters=list(self.completed_chapters) if self.completed_chapters else [],
            bookmarks=list(self.bookmarks) if self.bookmarks else [],
            started_at=self.started_at,
            last_read_at=self.last_read_at,
            completed_at=self.completed_at
        )

    @staticmethod
    def from_entity(entity: EbookReadingProgress) -> 'EbookReadingProgressORM':
        return EbookReadingProgressORM(
            id=entity.id,
            user_id=entity.user_id,
            ebook_id=entity.ebook_id,
            last_chapter_id=entity.last_chapter_id,
            last_section_id=entity.last_section_id,
            completion_percentage=entity.completion_percentage,
            completed_chapters=entity.completed_chapters,
            bookmarks=entity.bookmarks,
            started_at=entity.started_at,
            last_read_at=entity.last_read_at,
            completed_at=entity.completed_at
        )


# SQLAlchemy Repository Implementations
class SQLAlchemyEbookRepository(AbstractEbookRepository):
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, ebook_id: str) -> Optional[Ebook]:
        orm_ebook = self.session.query(EbookORM).filter_by(id=ebook_id).first()
        return orm_ebook.to_entity() if orm_ebook else None

    def get_by_product_id(self, product_id: str) -> Optional[Ebook]:
        orm_ebook = self.session.query(EbookORM).filter_by(product_id=product_id).first()
        return orm_ebook.to_entity() if orm_ebook else None

    def get_all(self, status: Optional[ProductStatus] = None) -> List[Ebook]:
        query = self.session.query(EbookORM)
        if status:
            query = query.filter_by(status=status)
        return [orm_ebook.to_entity() for orm_ebook in query.all()]

    def get_with_chapters(self, ebook_id: str) -> Optional[Ebook]:
        orm_ebook = self.session.query(EbookORM).filter_by(id=ebook_id).first()
        if not orm_ebook:
            return None
        entity = orm_ebook.to_entity()
        entity.chapters = [ch.to_entity() for ch in orm_ebook.chapters]
        return entity

    def save(self, ebook: Ebook) -> None:
        orm_ebook = self.session.query(EbookORM).filter_by(id=ebook.id).first()
        if orm_ebook:
            # Update existing
            orm_ebook.product_id = ebook.product_id
            orm_ebook.total_chapters = ebook.total_chapters
            orm_ebook.estimated_read_time_minutes = ebook.estimated_read_time_minutes
            orm_ebook.theme_config = ebook.theme_config.to_dict() if isinstance(ebook.theme_config, EbookThemeConfig) else ebook.theme_config
            orm_ebook.status = ebook.status
            orm_ebook.updated_at = datetime.now()
            orm_ebook.published_at = ebook.published_at
        else:
            # Add new
            self.session.add(EbookORM.from_entity(ebook))
        self.session.commit()

    def delete(self, ebook_id: str) -> None:
        self.session.query(EbookORM).filter_by(id=ebook_id).delete()
        self.session.commit()


class SQLAlchemyEbookChapterRepository(AbstractEbookChapterRepository):
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, chapter_id: str) -> Optional[EbookChapter]:
        orm_chapter = self.session.query(EbookChapterORM).filter_by(id=chapter_id).first()
        return orm_chapter.to_entity() if orm_chapter else None

    def get_by_slug(self, ebook_id: str, slug: str) -> Optional[EbookChapter]:
        orm_chapter = self.session.query(EbookChapterORM).filter_by(ebook_id=ebook_id, slug=slug).first()
        return orm_chapter.to_entity() if orm_chapter else None

    def get_by_ebook_id(self, ebook_id: str, published_only: bool = False) -> List[EbookChapter]:
        query = self.session.query(EbookChapterORM).filter_by(ebook_id=ebook_id)
        if published_only:
            query = query.filter_by(is_published=True)
        query = query.order_by(EbookChapterORM.display_order)
        return [ch.to_entity() for ch in query.all()]

    def get_with_sections(self, chapter_id: str) -> Optional[EbookChapter]:
        orm_chapter = self.session.query(EbookChapterORM).filter_by(id=chapter_id).first()
        if not orm_chapter:
            return None
        entity = orm_chapter.to_entity()
        entity.sections = []
        for orm_section in orm_chapter.sections:
            section_entity = orm_section.to_entity()
            section_entity.blocks = [b.to_entity() for b in orm_section.blocks]
            entity.sections.append(section_entity)
        return entity

    def get_free_preview_chapters(self, ebook_id: str) -> List[EbookChapter]:
        query = self.session.query(EbookChapterORM).filter_by(
            ebook_id=ebook_id, is_free_preview=True, is_published=True
        ).order_by(EbookChapterORM.display_order)
        return [ch.to_entity() for ch in query.all()]

    def save(self, chapter: EbookChapter) -> None:
        orm_chapter = self.session.query(EbookChapterORM).filter_by(id=chapter.id).first()
        if orm_chapter:
            # Update existing
            orm_chapter.ebook_id = chapter.ebook_id
            orm_chapter.chapter_number = chapter.chapter_number
            orm_chapter.display_order = chapter.display_order
            orm_chapter.title_en = chapter.title_en
            orm_chapter.title_pt = chapter.title_pt
            orm_chapter.slug = chapter.slug
            orm_chapter.summary_en = chapter.summary_en
            orm_chapter.summary_pt = chapter.summary_pt
            orm_chapter.estimated_read_time_minutes = chapter.estimated_read_time_minutes
            orm_chapter.is_free_preview = chapter.is_free_preview
            orm_chapter.is_published = chapter.is_published
            orm_chapter.updated_at = datetime.now()
        else:
            # Add new
            self.session.add(EbookChapterORM.from_entity(chapter))
        self.session.commit()

    def delete(self, chapter_id: str) -> None:
        self.session.query(EbookChapterORM).filter_by(id=chapter_id).delete()
        self.session.commit()

    def reorder(self, ebook_id: str, chapter_ids: List[str]) -> None:
        for index, chapter_id in enumerate(chapter_ids):
            self.session.query(EbookChapterORM).filter_by(
                id=chapter_id, ebook_id=ebook_id
            ).update({"display_order": index + 1})
        self.session.commit()


class SQLAlchemyEbookSectionRepository(AbstractEbookSectionRepository):
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, section_id: str) -> Optional[EbookSection]:
        orm_section = self.session.query(EbookSectionORM).filter_by(id=section_id).first()
        return orm_section.to_entity() if orm_section else None

    def get_by_chapter_id(self, chapter_id: str) -> List[EbookSection]:
        query = self.session.query(EbookSectionORM).filter_by(chapter_id=chapter_id).order_by(EbookSectionORM.display_order)
        return [s.to_entity() for s in query.all()]

    def get_with_blocks(self, section_id: str) -> Optional[EbookSection]:
        orm_section = self.session.query(EbookSectionORM).filter_by(id=section_id).first()
        if not orm_section:
            return None
        entity = orm_section.to_entity()
        entity.blocks = [b.to_entity() for b in orm_section.blocks]
        return entity

    def save(self, section: EbookSection) -> None:
        orm_section = self.session.query(EbookSectionORM).filter_by(id=section.id).first()
        if orm_section:
            # Update existing
            orm_section.chapter_id = section.chapter_id
            orm_section.display_order = section.display_order
            orm_section.heading_en = section.heading_en
            orm_section.heading_pt = section.heading_pt
            orm_section.section_type = section.section_type.value if isinstance(section.section_type, SectionType) else section.section_type
            orm_section.updated_at = datetime.now()
        else:
            # Add new
            self.session.add(EbookSectionORM.from_entity(section))
        self.session.commit()

    def delete(self, section_id: str) -> None:
        self.session.query(EbookSectionORM).filter_by(id=section_id).delete()
        self.session.commit()

    def reorder(self, chapter_id: str, section_ids: List[str]) -> None:
        for index, section_id in enumerate(section_ids):
            self.session.query(EbookSectionORM).filter_by(
                id=section_id, chapter_id=chapter_id
            ).update({"display_order": index + 1})
        self.session.commit()


class SQLAlchemyEbookContentBlockRepository(AbstractEbookContentBlockRepository):
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, block_id: str) -> Optional[EbookContentBlock]:
        orm_block = self.session.query(EbookContentBlockORM).filter_by(id=block_id).first()
        return orm_block.to_entity() if orm_block else None

    def get_by_section_id(self, section_id: str) -> List[EbookContentBlock]:
        query = self.session.query(EbookContentBlockORM).filter_by(section_id=section_id).order_by(EbookContentBlockORM.display_order)
        return [b.to_entity() for b in query.all()]

    def save(self, block: EbookContentBlock) -> None:
        orm_block = self.session.query(EbookContentBlockORM).filter_by(id=block.id).first()
        if orm_block:
            # Update existing
            orm_block.section_id = block.section_id
            orm_block.display_order = block.display_order
            orm_block.block_type = block.block_type.value if isinstance(block.block_type, BlockType) else block.block_type
            orm_block.content_en = block.content_en
            orm_block.content_pt = block.content_pt
            orm_block.config = block.config
            orm_block.updated_at = datetime.now()
        else:
            # Add new
            self.session.add(EbookContentBlockORM.from_entity(block))
        self.session.commit()

    def delete(self, block_id: str) -> None:
        self.session.query(EbookContentBlockORM).filter_by(id=block_id).delete()
        self.session.commit()

    def reorder(self, section_id: str, block_ids: List[str]) -> None:
        for index, block_id in enumerate(block_ids):
            self.session.query(EbookContentBlockORM).filter_by(
                id=block_id, section_id=section_id
            ).update({"display_order": index + 1})
        self.session.commit()


class SQLAlchemyEbookReadingProgressRepository(AbstractEbookReadingProgressRepository):
    def __init__(self, session: Session):
        self.session = session

    def get_by_user_and_ebook(self, user_id: str, ebook_id: str) -> Optional[EbookReadingProgress]:
        orm_progress = self.session.query(EbookReadingProgressORM).filter_by(
            user_id=user_id, ebook_id=ebook_id
        ).first()
        return orm_progress.to_entity() if orm_progress else None

    def get_by_user(self, user_id: str) -> List[EbookReadingProgress]:
        query = self.session.query(EbookReadingProgressORM).filter_by(user_id=user_id)
        return [p.to_entity() for p in query.all()]

    def save(self, progress: EbookReadingProgress) -> None:
        orm_progress = self.session.query(EbookReadingProgressORM).filter_by(id=progress.id).first()
        if orm_progress:
            # Update existing
            orm_progress.last_chapter_id = progress.last_chapter_id
            orm_progress.last_section_id = progress.last_section_id
            orm_progress.completion_percentage = progress.completion_percentage
            orm_progress.completed_chapters = progress.completed_chapters
            orm_progress.bookmarks = progress.bookmarks
            orm_progress.last_read_at = progress.last_read_at
            orm_progress.completed_at = progress.completed_at
        else:
            # Check for existing by user+ebook (upsert pattern)
            existing = self.session.query(EbookReadingProgressORM).filter_by(
                user_id=progress.user_id, ebook_id=progress.ebook_id
            ).first()
            if existing:
                existing.last_chapter_id = progress.last_chapter_id
                existing.last_section_id = progress.last_section_id
                existing.completion_percentage = progress.completion_percentage
                existing.completed_chapters = progress.completed_chapters
                existing.bookmarks = progress.bookmarks
                existing.last_read_at = progress.last_read_at
                existing.completed_at = progress.completed_at
            else:
                self.session.add(EbookReadingProgressORM.from_entity(progress))
        self.session.commit()

    def delete(self, progress_id: str) -> None:
        self.session.query(EbookReadingProgressORM).filter_by(id=progress_id).delete()
        self.session.commit()
