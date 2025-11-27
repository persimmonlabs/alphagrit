from abc import ABC, abstractmethod
from typing import Optional, List
from src.domain.entities.ebook import (
    Ebook, EbookChapter, EbookSection, EbookContentBlock, EbookReadingProgress
)
from src.domain.entities.product import ProductStatus


class AbstractEbookRepository(ABC):
    @abstractmethod
    def get_by_id(self, ebook_id: str) -> Optional[Ebook]:
        pass

    @abstractmethod
    def get_by_product_id(self, product_id: str) -> Optional[Ebook]:
        pass

    @abstractmethod
    def get_all(self, status: Optional[ProductStatus] = None) -> List[Ebook]:
        pass

    @abstractmethod
    def get_with_chapters(self, ebook_id: str) -> Optional[Ebook]:
        """Get ebook with all chapters loaded"""
        pass

    @abstractmethod
    def save(self, ebook: Ebook) -> None:
        pass

    @abstractmethod
    def delete(self, ebook_id: str) -> None:
        pass


class AbstractEbookChapterRepository(ABC):
    @abstractmethod
    def get_by_id(self, chapter_id: str) -> Optional[EbookChapter]:
        pass

    @abstractmethod
    def get_by_slug(self, ebook_id: str, slug: str) -> Optional[EbookChapter]:
        pass

    @abstractmethod
    def get_by_ebook_id(self, ebook_id: str, published_only: bool = False) -> List[EbookChapter]:
        pass

    @abstractmethod
    def get_with_sections(self, chapter_id: str) -> Optional[EbookChapter]:
        """Get chapter with all sections and blocks loaded"""
        pass

    @abstractmethod
    def get_free_preview_chapters(self, ebook_id: str) -> List[EbookChapter]:
        pass

    @abstractmethod
    def save(self, chapter: EbookChapter) -> None:
        pass

    @abstractmethod
    def delete(self, chapter_id: str) -> None:
        pass

    @abstractmethod
    def reorder(self, ebook_id: str, chapter_ids: List[str]) -> None:
        """Reorder chapters by updating display_order"""
        pass


class AbstractEbookSectionRepository(ABC):
    @abstractmethod
    def get_by_id(self, section_id: str) -> Optional[EbookSection]:
        pass

    @abstractmethod
    def get_by_chapter_id(self, chapter_id: str) -> List[EbookSection]:
        pass

    @abstractmethod
    def get_with_blocks(self, section_id: str) -> Optional[EbookSection]:
        """Get section with all blocks loaded"""
        pass

    @abstractmethod
    def save(self, section: EbookSection) -> None:
        pass

    @abstractmethod
    def delete(self, section_id: str) -> None:
        pass

    @abstractmethod
    def reorder(self, chapter_id: str, section_ids: List[str]) -> None:
        """Reorder sections by updating display_order"""
        pass


class AbstractEbookContentBlockRepository(ABC):
    @abstractmethod
    def get_by_id(self, block_id: str) -> Optional[EbookContentBlock]:
        pass

    @abstractmethod
    def get_by_section_id(self, section_id: str) -> List[EbookContentBlock]:
        pass

    @abstractmethod
    def save(self, block: EbookContentBlock) -> None:
        pass

    @abstractmethod
    def delete(self, block_id: str) -> None:
        pass

    @abstractmethod
    def reorder(self, section_id: str, block_ids: List[str]) -> None:
        """Reorder blocks by updating display_order"""
        pass


class AbstractEbookReadingProgressRepository(ABC):
    @abstractmethod
    def get_by_user_and_ebook(self, user_id: str, ebook_id: str) -> Optional[EbookReadingProgress]:
        pass

    @abstractmethod
    def get_by_user(self, user_id: str) -> List[EbookReadingProgress]:
        """Get all reading progress for a user"""
        pass

    @abstractmethod
    def save(self, progress: EbookReadingProgress) -> None:
        pass

    @abstractmethod
    def delete(self, progress_id: str) -> None:
        pass
