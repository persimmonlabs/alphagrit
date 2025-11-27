from typing import Optional, List, Dict
from datetime import datetime

from src.domain.entities.ebook import (
    Ebook, EbookChapter, EbookSection, EbookContentBlock, EbookReadingProgress
)
from src.domain.entities.product import ProductStatus
from src.domain.repositories.ebook_repository import (
    AbstractEbookRepository, AbstractEbookChapterRepository,
    AbstractEbookSectionRepository, AbstractEbookContentBlockRepository,
    AbstractEbookReadingProgressRepository
)


class InMemoryEbookRepository(AbstractEbookRepository):
    def __init__(self):
        self._ebooks: Dict[str, Ebook] = {}

    def get_by_id(self, ebook_id: str) -> Optional[Ebook]:
        return self._ebooks.get(ebook_id)

    def get_by_product_id(self, product_id: str) -> Optional[Ebook]:
        for ebook in self._ebooks.values():
            if ebook.product_id == product_id:
                return ebook
        return None

    def get_all(self, status: Optional[ProductStatus] = None) -> List[Ebook]:
        ebooks = list(self._ebooks.values())
        if status:
            ebooks = [e for e in ebooks if e.status == status]
        return ebooks

    def get_with_chapters(self, ebook_id: str) -> Optional[Ebook]:
        return self._ebooks.get(ebook_id)

    def save(self, ebook: Ebook) -> None:
        ebook.updated_at = datetime.now()
        self._ebooks[ebook.id] = ebook

    def delete(self, ebook_id: str) -> None:
        self._ebooks.pop(ebook_id, None)


class InMemoryEbookChapterRepository(AbstractEbookChapterRepository):
    def __init__(self):
        self._chapters: Dict[str, EbookChapter] = {}

    def get_by_id(self, chapter_id: str) -> Optional[EbookChapter]:
        return self._chapters.get(chapter_id)

    def get_by_slug(self, ebook_id: str, slug: str) -> Optional[EbookChapter]:
        for chapter in self._chapters.values():
            if chapter.ebook_id == ebook_id and chapter.slug == slug:
                return chapter
        return None

    def get_by_ebook_id(self, ebook_id: str, published_only: bool = False) -> List[EbookChapter]:
        chapters = [ch for ch in self._chapters.values() if ch.ebook_id == ebook_id]
        if published_only:
            chapters = [ch for ch in chapters if ch.is_published]
        return sorted(chapters, key=lambda x: x.display_order)

    def get_with_sections(self, chapter_id: str) -> Optional[EbookChapter]:
        return self._chapters.get(chapter_id)

    def get_free_preview_chapters(self, ebook_id: str) -> List[EbookChapter]:
        chapters = [
            ch for ch in self._chapters.values()
            if ch.ebook_id == ebook_id and ch.is_free_preview and ch.is_published
        ]
        return sorted(chapters, key=lambda x: x.display_order)

    def save(self, chapter: EbookChapter) -> None:
        chapter.updated_at = datetime.now()
        self._chapters[chapter.id] = chapter

    def delete(self, chapter_id: str) -> None:
        self._chapters.pop(chapter_id, None)

    def reorder(self, ebook_id: str, chapter_ids: List[str]) -> None:
        for index, chapter_id in enumerate(chapter_ids):
            if chapter_id in self._chapters and self._chapters[chapter_id].ebook_id == ebook_id:
                self._chapters[chapter_id].display_order = index + 1


class InMemoryEbookSectionRepository(AbstractEbookSectionRepository):
    def __init__(self):
        self._sections: Dict[str, EbookSection] = {}

    def get_by_id(self, section_id: str) -> Optional[EbookSection]:
        return self._sections.get(section_id)

    def get_by_chapter_id(self, chapter_id: str) -> List[EbookSection]:
        sections = [s for s in self._sections.values() if s.chapter_id == chapter_id]
        return sorted(sections, key=lambda x: x.display_order)

    def get_with_blocks(self, section_id: str) -> Optional[EbookSection]:
        return self._sections.get(section_id)

    def save(self, section: EbookSection) -> None:
        section.updated_at = datetime.now()
        self._sections[section.id] = section

    def delete(self, section_id: str) -> None:
        self._sections.pop(section_id, None)

    def reorder(self, chapter_id: str, section_ids: List[str]) -> None:
        for index, section_id in enumerate(section_ids):
            if section_id in self._sections and self._sections[section_id].chapter_id == chapter_id:
                self._sections[section_id].display_order = index + 1


class InMemoryEbookContentBlockRepository(AbstractEbookContentBlockRepository):
    def __init__(self):
        self._blocks: Dict[str, EbookContentBlock] = {}

    def get_by_id(self, block_id: str) -> Optional[EbookContentBlock]:
        return self._blocks.get(block_id)

    def get_by_section_id(self, section_id: str) -> List[EbookContentBlock]:
        blocks = [b for b in self._blocks.values() if b.section_id == section_id]
        return sorted(blocks, key=lambda x: x.display_order)

    def save(self, block: EbookContentBlock) -> None:
        block.updated_at = datetime.now()
        self._blocks[block.id] = block

    def delete(self, block_id: str) -> None:
        self._blocks.pop(block_id, None)

    def reorder(self, section_id: str, block_ids: List[str]) -> None:
        for index, block_id in enumerate(block_ids):
            if block_id in self._blocks and self._blocks[block_id].section_id == section_id:
                self._blocks[block_id].display_order = index + 1


class InMemoryEbookReadingProgressRepository(AbstractEbookReadingProgressRepository):
    def __init__(self):
        self._progress: Dict[str, EbookReadingProgress] = {}

    def get_by_user_and_ebook(self, user_id: str, ebook_id: str) -> Optional[EbookReadingProgress]:
        for progress in self._progress.values():
            if progress.user_id == user_id and progress.ebook_id == ebook_id:
                return progress
        return None

    def get_by_user(self, user_id: str) -> List[EbookReadingProgress]:
        return [p for p in self._progress.values() if p.user_id == user_id]

    def save(self, progress: EbookReadingProgress) -> None:
        # Check for existing by user+ebook (upsert pattern)
        existing = self.get_by_user_and_ebook(progress.user_id, progress.ebook_id)
        if existing and existing.id != progress.id:
            # Update existing entry
            existing.last_chapter_id = progress.last_chapter_id
            existing.last_section_id = progress.last_section_id
            existing.completion_percentage = progress.completion_percentage
            existing.completed_chapters = progress.completed_chapters
            existing.bookmarks = progress.bookmarks
            existing.last_read_at = progress.last_read_at
            existing.completed_at = progress.completed_at
        else:
            progress.last_read_at = datetime.now()
            self._progress[progress.id] = progress

    def delete(self, progress_id: str) -> None:
        self._progress.pop(progress_id, None)
