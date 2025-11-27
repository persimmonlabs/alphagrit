from typing import Optional, List, Dict, Any
from datetime import datetime

from src.domain.repositories.ebook_repository import (
    AbstractEbookRepository, AbstractEbookChapterRepository,
    AbstractEbookSectionRepository, AbstractEbookContentBlockRepository,
    AbstractEbookReadingProgressRepository
)
from src.domain.repositories.product_repository import AbstractProductRepository
from src.domain.repositories.order_repository import AbstractOrderRepository
from src.domain.entities.ebook import (
    Ebook, EbookChapter, EbookSection, EbookContentBlock, EbookReadingProgress,
    EbookThemeConfig, SectionType, BlockType
)
from src.domain.entities.product import ProductStatus
from src.domain.entities.order import OrderStatus


class EbookManagementService:
    def __init__(
        self,
        ebook_repo: AbstractEbookRepository,
        chapter_repo: AbstractEbookChapterRepository,
        section_repo: AbstractEbookSectionRepository,
        block_repo: AbstractEbookContentBlockRepository,
        progress_repo: AbstractEbookReadingProgressRepository,
        product_repo: AbstractProductRepository,
        order_repo: AbstractOrderRepository
    ):
        self.ebook_repo = ebook_repo
        self.chapter_repo = chapter_repo
        self.section_repo = section_repo
        self.block_repo = block_repo
        self.progress_repo = progress_repo
        self.product_repo = product_repo
        self.order_repo = order_repo

    # --- Ebook CRUD ---
    def create_ebook(
        self,
        product_id: str,
        theme_config: Optional[Dict[str, Any]] = None
    ) -> Ebook:
        # Verify product exists
        product = self.product_repo.get_by_id(product_id)
        if not product:
            raise ValueError(f"Product with ID {product_id} not found.")

        # Check if ebook already exists for this product
        existing = self.ebook_repo.get_by_product_id(product_id)
        if existing:
            raise ValueError(f"Ebook for product {product_id} already exists.")

        theme = EbookThemeConfig.from_dict(theme_config) if theme_config else EbookThemeConfig()

        new_ebook = Ebook(
            product_id=product_id,
            theme_config=theme,
            status=ProductStatus.DRAFT
        )
        self.ebook_repo.save(new_ebook)
        return new_ebook

    def get_ebook(self, ebook_id: str) -> Optional[Ebook]:
        return self.ebook_repo.get_by_id(ebook_id)

    def get_ebook_by_product(self, product_id: str) -> Optional[Ebook]:
        return self.ebook_repo.get_by_product_id(product_id)

    def get_ebook_with_chapters(self, ebook_id: str) -> Optional[Ebook]:
        return self.ebook_repo.get_with_chapters(ebook_id)

    def list_ebooks(self, status: Optional[ProductStatus] = None) -> List[Ebook]:
        return self.ebook_repo.get_all(status=status)

    def update_ebook(self, ebook_id: str, **kwargs) -> Ebook:
        ebook = self.ebook_repo.get_by_id(ebook_id)
        if not ebook:
            raise ValueError(f"Ebook with ID {ebook_id} not found.")

        # Handle theme_config conversion
        if 'theme_config' in kwargs and isinstance(kwargs['theme_config'], dict):
            kwargs['theme_config'] = EbookThemeConfig.from_dict(kwargs['theme_config'])

        for key, value in kwargs.items():
            if hasattr(ebook, key) and key not in ['id', 'product_id', 'created_at']:
                setattr(ebook, key, value)

        ebook.updated_at = datetime.now()
        self.ebook_repo.save(ebook)
        return ebook

    def publish_ebook(self, ebook_id: str) -> Ebook:
        ebook = self.ebook_repo.get_by_id(ebook_id)
        if not ebook:
            raise ValueError(f"Ebook with ID {ebook_id} not found.")

        ebook.publish()  # Domain logic validates chapters
        self.ebook_repo.save(ebook)
        return ebook

    def archive_ebook(self, ebook_id: str) -> Ebook:
        ebook = self.ebook_repo.get_by_id(ebook_id)
        if not ebook:
            raise ValueError(f"Ebook with ID {ebook_id} not found.")

        ebook.archive()
        self.ebook_repo.save(ebook)
        return ebook

    def delete_ebook(self, ebook_id: str) -> None:
        if not self.ebook_repo.get_by_id(ebook_id):
            raise ValueError(f"Ebook with ID {ebook_id} not found.")
        self.ebook_repo.delete(ebook_id)

    # --- Chapter CRUD ---
    def create_chapter(
        self,
        ebook_id: str,
        title_en: str,
        chapter_number: int,
        title_pt: Optional[str] = None,
        slug: Optional[str] = None,
        summary_en: Optional[str] = None,
        summary_pt: Optional[str] = None,
        is_free_preview: bool = False
    ) -> EbookChapter:
        ebook = self.ebook_repo.get_by_id(ebook_id)
        if not ebook:
            raise ValueError(f"Ebook with ID {ebook_id} not found.")

        # Get next display order
        existing_chapters = self.chapter_repo.get_by_ebook_id(ebook_id)
        display_order = len(existing_chapters) + 1

        # Generate slug if not provided
        if not slug:
            slug = title_en.lower().replace(' ', '-').replace('.', '').replace(',', '')

        # Check slug uniqueness within ebook
        if self.chapter_repo.get_by_slug(ebook_id, slug):
            raise ValueError(f"Chapter with slug '{slug}' already exists in this ebook.")

        new_chapter = EbookChapter(
            ebook_id=ebook_id,
            chapter_number=chapter_number,
            display_order=display_order,
            title_en=title_en,
            title_pt=title_pt,
            slug=slug,
            summary_en=summary_en,
            summary_pt=summary_pt,
            is_free_preview=is_free_preview,
            is_published=False
        )
        self.chapter_repo.save(new_chapter)

        # Update ebook total_chapters
        ebook.total_chapters = len(existing_chapters) + 1
        self.ebook_repo.save(ebook)

        return new_chapter

    def get_chapter(self, chapter_id: str) -> Optional[EbookChapter]:
        return self.chapter_repo.get_by_id(chapter_id)

    def get_chapter_by_slug(self, ebook_id: str, slug: str) -> Optional[EbookChapter]:
        return self.chapter_repo.get_by_slug(ebook_id, slug)

    def get_chapter_with_content(self, chapter_id: str) -> Optional[EbookChapter]:
        return self.chapter_repo.get_with_sections(chapter_id)

    def list_chapters(self, ebook_id: str, published_only: bool = False) -> List[EbookChapter]:
        return self.chapter_repo.get_by_ebook_id(ebook_id, published_only=published_only)

    def get_free_preview_chapters(self, ebook_id: str) -> List[EbookChapter]:
        return self.chapter_repo.get_free_preview_chapters(ebook_id)

    def update_chapter(self, chapter_id: str, **kwargs) -> EbookChapter:
        chapter = self.chapter_repo.get_by_id(chapter_id)
        if not chapter:
            raise ValueError(f"Chapter with ID {chapter_id} not found.")

        # Handle slug uniqueness
        if 'slug' in kwargs and kwargs['slug'] != chapter.slug:
            if self.chapter_repo.get_by_slug(chapter.ebook_id, kwargs['slug']):
                raise ValueError(f"Chapter with slug '{kwargs['slug']}' already exists in this ebook.")

        for key, value in kwargs.items():
            if hasattr(chapter, key) and key not in ['id', 'ebook_id', 'created_at']:
                setattr(chapter, key, value)

        chapter.updated_at = datetime.now()
        self.chapter_repo.save(chapter)
        return chapter

    def publish_chapter(self, chapter_id: str) -> EbookChapter:
        chapter = self.chapter_repo.get_by_id(chapter_id)
        if not chapter:
            raise ValueError(f"Chapter with ID {chapter_id} not found.")

        chapter.is_published = True
        chapter.updated_at = datetime.now()
        self.chapter_repo.save(chapter)
        return chapter

    def unpublish_chapter(self, chapter_id: str) -> EbookChapter:
        chapter = self.chapter_repo.get_by_id(chapter_id)
        if not chapter:
            raise ValueError(f"Chapter with ID {chapter_id} not found.")

        chapter.is_published = False
        chapter.updated_at = datetime.now()
        self.chapter_repo.save(chapter)
        return chapter

    def reorder_chapters(self, ebook_id: str, chapter_ids: List[str]) -> None:
        ebook = self.ebook_repo.get_by_id(ebook_id)
        if not ebook:
            raise ValueError(f"Ebook with ID {ebook_id} not found.")

        self.chapter_repo.reorder(ebook_id, chapter_ids)

    def delete_chapter(self, chapter_id: str) -> None:
        chapter = self.chapter_repo.get_by_id(chapter_id)
        if not chapter:
            raise ValueError(f"Chapter with ID {chapter_id} not found.")

        ebook_id = chapter.ebook_id
        self.chapter_repo.delete(chapter_id)

        # Update ebook total_chapters
        ebook = self.ebook_repo.get_by_id(ebook_id)
        if ebook:
            remaining_chapters = self.chapter_repo.get_by_ebook_id(ebook_id)
            ebook.total_chapters = len(remaining_chapters)
            self.ebook_repo.save(ebook)

    # --- Section CRUD ---
    def create_section(
        self,
        chapter_id: str,
        heading_en: Optional[str] = None,
        heading_pt: Optional[str] = None,
        section_type: str = "standard"
    ) -> EbookSection:
        chapter = self.chapter_repo.get_by_id(chapter_id)
        if not chapter:
            raise ValueError(f"Chapter with ID {chapter_id} not found.")

        existing_sections = self.section_repo.get_by_chapter_id(chapter_id)
        display_order = len(existing_sections) + 1

        section_type_enum = SectionType(section_type) if isinstance(section_type, str) else section_type

        new_section = EbookSection(
            chapter_id=chapter_id,
            display_order=display_order,
            heading_en=heading_en,
            heading_pt=heading_pt,
            section_type=section_type_enum
        )
        self.section_repo.save(new_section)
        return new_section

    def get_section(self, section_id: str) -> Optional[EbookSection]:
        return self.section_repo.get_by_id(section_id)

    def get_section_with_blocks(self, section_id: str) -> Optional[EbookSection]:
        return self.section_repo.get_with_blocks(section_id)

    def list_sections(self, chapter_id: str) -> List[EbookSection]:
        return self.section_repo.get_by_chapter_id(chapter_id)

    def update_section(self, section_id: str, **kwargs) -> EbookSection:
        section = self.section_repo.get_by_id(section_id)
        if not section:
            raise ValueError(f"Section with ID {section_id} not found.")

        # Handle section_type conversion
        if 'section_type' in kwargs and isinstance(kwargs['section_type'], str):
            kwargs['section_type'] = SectionType(kwargs['section_type'])

        for key, value in kwargs.items():
            if hasattr(section, key) and key not in ['id', 'chapter_id', 'created_at']:
                setattr(section, key, value)

        section.updated_at = datetime.now()
        self.section_repo.save(section)
        return section

    def reorder_sections(self, chapter_id: str, section_ids: List[str]) -> None:
        chapter = self.chapter_repo.get_by_id(chapter_id)
        if not chapter:
            raise ValueError(f"Chapter with ID {chapter_id} not found.")

        self.section_repo.reorder(chapter_id, section_ids)

    def delete_section(self, section_id: str) -> None:
        if not self.section_repo.get_by_id(section_id):
            raise ValueError(f"Section with ID {section_id} not found.")
        self.section_repo.delete(section_id)

    # --- Content Block CRUD ---
    def create_block(
        self,
        section_id: str,
        block_type: str,
        content_en: Dict[str, Any],
        content_pt: Optional[Dict[str, Any]] = None,
        config: Optional[Dict[str, Any]] = None
    ) -> EbookContentBlock:
        section = self.section_repo.get_by_id(section_id)
        if not section:
            raise ValueError(f"Section with ID {section_id} not found.")

        existing_blocks = self.block_repo.get_by_section_id(section_id)
        display_order = len(existing_blocks) + 1

        block_type_enum = BlockType(block_type) if isinstance(block_type, str) else block_type

        new_block = EbookContentBlock(
            section_id=section_id,
            display_order=display_order,
            block_type=block_type_enum,
            content_en=content_en,
            content_pt=content_pt,
            config=config or {}
        )
        self.block_repo.save(new_block)
        return new_block

    def get_block(self, block_id: str) -> Optional[EbookContentBlock]:
        return self.block_repo.get_by_id(block_id)

    def list_blocks(self, section_id: str) -> List[EbookContentBlock]:
        return self.block_repo.get_by_section_id(section_id)

    def update_block(self, block_id: str, **kwargs) -> EbookContentBlock:
        block = self.block_repo.get_by_id(block_id)
        if not block:
            raise ValueError(f"Block with ID {block_id} not found.")

        # Handle block_type conversion
        if 'block_type' in kwargs and isinstance(kwargs['block_type'], str):
            kwargs['block_type'] = BlockType(kwargs['block_type'])

        for key, value in kwargs.items():
            if hasattr(block, key) and key not in ['id', 'section_id', 'created_at']:
                setattr(block, key, value)

        block.updated_at = datetime.now()
        self.block_repo.save(block)
        return block

    def reorder_blocks(self, section_id: str, block_ids: List[str]) -> None:
        section = self.section_repo.get_by_id(section_id)
        if not section:
            raise ValueError(f"Section with ID {section_id} not found.")

        self.block_repo.reorder(section_id, block_ids)

    def delete_block(self, block_id: str) -> None:
        if not self.block_repo.get_by_id(block_id):
            raise ValueError(f"Block with ID {block_id} not found.")
        self.block_repo.delete(block_id)

    # --- Access Control ---
    def check_user_access(self, user_id: str, ebook_id: str) -> bool:
        """Check if user has purchased access to this ebook"""
        ebook = self.ebook_repo.get_by_id(ebook_id)
        if not ebook:
            return False

        # Get all paid orders for this user containing this product
        orders = self.order_repo.get_by_user_id(user_id)
        for order in orders:
            if order.status == OrderStatus.PAID:
                # Check if order contains this product
                for item in order.items:
                    if item.product_id == ebook.product_id:
                        return True
        return False

    # --- Reading Progress ---
    def get_reading_progress(self, user_id: str, ebook_id: str) -> Optional[EbookReadingProgress]:
        return self.progress_repo.get_by_user_and_ebook(user_id, ebook_id)

    def get_user_reading_progress(self, user_id: str) -> List[EbookReadingProgress]:
        return self.progress_repo.get_by_user(user_id)

    def update_reading_progress(
        self,
        user_id: str,
        ebook_id: str,
        last_chapter_id: Optional[str] = None,
        last_section_id: Optional[str] = None,
        completion_percentage: Optional[float] = None
    ) -> EbookReadingProgress:
        progress = self.progress_repo.get_by_user_and_ebook(user_id, ebook_id)

        if not progress:
            # Create new progress
            progress = EbookReadingProgress(
                user_id=user_id,
                ebook_id=ebook_id,
                last_chapter_id=last_chapter_id,
                last_section_id=last_section_id,
                completion_percentage=completion_percentage or 0.0
            )
        else:
            # Update existing
            if last_chapter_id:
                progress.last_chapter_id = last_chapter_id
            if last_section_id:
                progress.last_section_id = last_section_id
            if completion_percentage is not None:
                progress.completion_percentage = completion_percentage
            progress.last_read_at = datetime.now()

        self.progress_repo.save(progress)
        return progress

    def mark_chapter_completed(self, user_id: str, ebook_id: str, chapter_id: str) -> EbookReadingProgress:
        progress = self.progress_repo.get_by_user_and_ebook(user_id, ebook_id)

        if not progress:
            progress = EbookReadingProgress(
                user_id=user_id,
                ebook_id=ebook_id
            )

        progress.mark_chapter_completed(chapter_id)

        # Calculate completion percentage
        ebook = self.ebook_repo.get_by_id(ebook_id)
        if ebook and ebook.total_chapters > 0:
            progress.completion_percentage = (len(progress.completed_chapters) / ebook.total_chapters) * 100

            # Mark as completed if 100%
            if progress.completion_percentage >= 100:
                progress.completed_at = datetime.now()

        self.progress_repo.save(progress)
        return progress

    def add_bookmark(self, user_id: str, ebook_id: str, section_id: str) -> EbookReadingProgress:
        progress = self.progress_repo.get_by_user_and_ebook(user_id, ebook_id)

        if not progress:
            progress = EbookReadingProgress(
                user_id=user_id,
                ebook_id=ebook_id
            )

        progress.add_bookmark(section_id)
        self.progress_repo.save(progress)
        return progress

    def remove_bookmark(self, user_id: str, ebook_id: str, section_id: str) -> EbookReadingProgress:
        progress = self.progress_repo.get_by_user_and_ebook(user_id, ebook_id)

        if not progress:
            raise ValueError("No reading progress found for this user and ebook.")

        progress.remove_bookmark(section_id)
        self.progress_repo.save(progress)
        return progress
