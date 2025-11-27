from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional

from src.api.v1.schemas import (
    EbookCreate, EbookUpdate, EbookResponse,
    EbookChapterCreate, EbookChapterUpdate, EbookChapterResponse,
    EbookSectionCreate, EbookSectionUpdate, EbookSectionResponse,
    EbookContentBlockCreate, EbookContentBlockUpdate, EbookContentBlockResponse,
    EbookReadingProgressResponse, UpdateReadingProgressRequest,
    ReorderRequest, EbookAccessResponse
)
from src.api.v1.dependencies import get_ebook_management_service
from src.application.services.ebook_management_service import EbookManagementService
from src.domain.entities.product import ProductStatus
from src.domain.entities.ebook import EbookThemeConfig

router = APIRouter()


# --- Helper function to convert entity to response ---
def ebook_to_response(ebook) -> dict:
    theme_dict = ebook.theme_config.to_dict() if isinstance(ebook.theme_config, EbookThemeConfig) else ebook.theme_config
    return {
        "id": ebook.id,
        "product_id": ebook.product_id,
        "total_chapters": ebook.total_chapters,
        "estimated_read_time_minutes": ebook.estimated_read_time_minutes,
        "theme_config": theme_dict,
        "status": ebook.status,
        "created_at": ebook.created_at,
        "updated_at": ebook.updated_at,
        "published_at": ebook.published_at
    }


# --- Ebook Endpoints ---
@router.post("/", response_model=EbookResponse, status_code=status.HTTP_201_CREATED)
def create_ebook(
    ebook_data: EbookCreate,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    try:
        theme_dict = ebook_data.theme_config.model_dump() if ebook_data.theme_config else None
        ebook = service.create_ebook(
            product_id=ebook_data.product_id,
            theme_config=theme_dict
        )
        return EbookResponse(**ebook_to_response(ebook))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/", response_model=List[EbookResponse])
def list_ebooks(
    status_filter: Optional[ProductStatus] = None,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    ebooks = service.list_ebooks(status=status_filter)
    return [EbookResponse(**ebook_to_response(e)) for e in ebooks]


@router.get("/{ebook_id}", response_model=EbookResponse)
def get_ebook(
    ebook_id: str,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    ebook = service.get_ebook(ebook_id)
    if not ebook:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ebook not found")
    return EbookResponse(**ebook_to_response(ebook))


@router.get("/by-product/{product_id}", response_model=EbookResponse)
def get_ebook_by_product(
    product_id: str,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    ebook = service.get_ebook_by_product(product_id)
    if not ebook:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ebook not found for this product")
    return EbookResponse(**ebook_to_response(ebook))


@router.patch("/{ebook_id}", response_model=EbookResponse)
def update_ebook(
    ebook_id: str,
    ebook_data: EbookUpdate,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    try:
        update_data = ebook_data.model_dump(exclude_unset=True)
        if 'theme_config' in update_data and update_data['theme_config']:
            update_data['theme_config'] = update_data['theme_config']
        ebook = service.update_ebook(ebook_id, **update_data)
        return EbookResponse(**ebook_to_response(ebook))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/{ebook_id}/publish", response_model=EbookResponse)
def publish_ebook(
    ebook_id: str,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    try:
        ebook = service.publish_ebook(ebook_id)
        return EbookResponse(**ebook_to_response(ebook))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/{ebook_id}/archive", response_model=EbookResponse)
def archive_ebook(
    ebook_id: str,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    try:
        ebook = service.archive_ebook(ebook_id)
        return EbookResponse(**ebook_to_response(ebook))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{ebook_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ebook(
    ebook_id: str,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    try:
        service.delete_ebook(ebook_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# --- Access Control ---
@router.get("/{ebook_id}/access", response_model=EbookAccessResponse)
def check_ebook_access(
    ebook_id: str,
    user_id: str,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    ebook = service.get_ebook(ebook_id)
    if not ebook:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ebook not found")

    has_access = service.check_user_access(user_id, ebook_id)
    return EbookAccessResponse(
        has_access=has_access,
        ebook_id=ebook_id,
        product_id=ebook.product_id
    )


# --- Chapter Endpoints ---
@router.post("/{ebook_id}/chapters", response_model=EbookChapterResponse, status_code=status.HTTP_201_CREATED)
def create_chapter(
    ebook_id: str,
    chapter_data: EbookChapterCreate,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    try:
        chapter = service.create_chapter(
            ebook_id=ebook_id,
            title_en=chapter_data.title_en,
            chapter_number=chapter_data.chapter_number,
            title_pt=chapter_data.title_pt,
            slug=chapter_data.slug,
            summary_en=chapter_data.summary_en,
            summary_pt=chapter_data.summary_pt,
            is_free_preview=chapter_data.is_free_preview
        )
        return EbookChapterResponse.model_validate(chapter)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{ebook_id}/chapters", response_model=List[EbookChapterResponse])
def list_chapters(
    ebook_id: str,
    published_only: bool = False,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    chapters = service.list_chapters(ebook_id, published_only=published_only)
    return [EbookChapterResponse.model_validate(ch) for ch in chapters]


@router.get("/{ebook_id}/chapters/free-preview", response_model=List[EbookChapterResponse])
def get_free_preview_chapters(
    ebook_id: str,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    chapters = service.get_free_preview_chapters(ebook_id)
    return [EbookChapterResponse.model_validate(ch) for ch in chapters]


@router.get("/chapters/{chapter_id}", response_model=EbookChapterResponse)
def get_chapter(
    chapter_id: str,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    chapter = service.get_chapter(chapter_id)
    if not chapter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")
    return EbookChapterResponse.model_validate(chapter)


@router.patch("/chapters/{chapter_id}", response_model=EbookChapterResponse)
def update_chapter(
    chapter_id: str,
    chapter_data: EbookChapterUpdate,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    try:
        update_data = chapter_data.model_dump(exclude_unset=True)
        chapter = service.update_chapter(chapter_id, **update_data)
        return EbookChapterResponse.model_validate(chapter)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/chapters/{chapter_id}/publish", response_model=EbookChapterResponse)
def publish_chapter(
    chapter_id: str,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    try:
        chapter = service.publish_chapter(chapter_id)
        return EbookChapterResponse.model_validate(chapter)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/chapters/{chapter_id}/unpublish", response_model=EbookChapterResponse)
def unpublish_chapter(
    chapter_id: str,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    try:
        chapter = service.unpublish_chapter(chapter_id)
        return EbookChapterResponse.model_validate(chapter)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/{ebook_id}/chapters/reorder")
def reorder_chapters(
    ebook_id: str,
    reorder_data: ReorderRequest,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    try:
        service.reorder_chapters(ebook_id, reorder_data.ids)
        return {"message": "Chapters reordered successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/chapters/{chapter_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chapter(
    chapter_id: str,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    try:
        service.delete_chapter(chapter_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# --- Section Endpoints ---
@router.post("/chapters/{chapter_id}/sections", response_model=EbookSectionResponse, status_code=status.HTTP_201_CREATED)
def create_section(
    chapter_id: str,
    section_data: EbookSectionCreate,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    try:
        section = service.create_section(
            chapter_id=chapter_id,
            heading_en=section_data.heading_en,
            heading_pt=section_data.heading_pt,
            section_type=section_data.section_type
        )
        return EbookSectionResponse.model_validate(section)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/chapters/{chapter_id}/sections", response_model=List[EbookSectionResponse])
def list_sections(
    chapter_id: str,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    sections = service.list_sections(chapter_id)
    return [EbookSectionResponse.model_validate(s) for s in sections]


@router.get("/sections/{section_id}", response_model=EbookSectionResponse)
def get_section(
    section_id: str,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    section = service.get_section(section_id)
    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    return EbookSectionResponse.model_validate(section)


@router.patch("/sections/{section_id}", response_model=EbookSectionResponse)
def update_section(
    section_id: str,
    section_data: EbookSectionUpdate,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    try:
        update_data = section_data.model_dump(exclude_unset=True)
        section = service.update_section(section_id, **update_data)
        return EbookSectionResponse.model_validate(section)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/chapters/{chapter_id}/sections/reorder")
def reorder_sections(
    chapter_id: str,
    reorder_data: ReorderRequest,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    try:
        service.reorder_sections(chapter_id, reorder_data.ids)
        return {"message": "Sections reordered successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/sections/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_section(
    section_id: str,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    try:
        service.delete_section(section_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# --- Content Block Endpoints ---
@router.post("/sections/{section_id}/blocks", response_model=EbookContentBlockResponse, status_code=status.HTTP_201_CREATED)
def create_block(
    section_id: str,
    block_data: EbookContentBlockCreate,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    try:
        block = service.create_block(
            section_id=section_id,
            block_type=block_data.block_type,
            content_en=block_data.content_en,
            content_pt=block_data.content_pt,
            config=block_data.config
        )
        return EbookContentBlockResponse.model_validate(block)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/sections/{section_id}/blocks", response_model=List[EbookContentBlockResponse])
def list_blocks(
    section_id: str,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    blocks = service.list_blocks(section_id)
    return [EbookContentBlockResponse.model_validate(b) for b in blocks]


@router.get("/blocks/{block_id}", response_model=EbookContentBlockResponse)
def get_block(
    block_id: str,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    block = service.get_block(block_id)
    if not block:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Block not found")
    return EbookContentBlockResponse.model_validate(block)


@router.patch("/blocks/{block_id}", response_model=EbookContentBlockResponse)
def update_block(
    block_id: str,
    block_data: EbookContentBlockUpdate,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    try:
        update_data = block_data.model_dump(exclude_unset=True)
        block = service.update_block(block_id, **update_data)
        return EbookContentBlockResponse.model_validate(block)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/sections/{section_id}/blocks/reorder")
def reorder_blocks(
    section_id: str,
    reorder_data: ReorderRequest,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    try:
        service.reorder_blocks(section_id, reorder_data.ids)
        return {"message": "Blocks reordered successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/blocks/{block_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_block(
    block_id: str,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    try:
        service.delete_block(block_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# --- Reading Progress Endpoints ---
@router.get("/{ebook_id}/progress/{user_id}", response_model=EbookReadingProgressResponse)
def get_reading_progress(
    ebook_id: str,
    user_id: str,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    progress = service.get_reading_progress(user_id, ebook_id)
    if not progress:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No reading progress found")
    return EbookReadingProgressResponse.model_validate(progress)


@router.put("/{ebook_id}/progress/{user_id}", response_model=EbookReadingProgressResponse)
def update_reading_progress(
    ebook_id: str,
    user_id: str,
    progress_data: UpdateReadingProgressRequest,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    progress = service.update_reading_progress(
        user_id=user_id,
        ebook_id=ebook_id,
        last_chapter_id=progress_data.last_chapter_id,
        last_section_id=progress_data.last_section_id,
        completion_percentage=progress_data.completion_percentage
    )
    return EbookReadingProgressResponse.model_validate(progress)


@router.put("/{ebook_id}/progress/{user_id}/complete-chapter/{chapter_id}", response_model=EbookReadingProgressResponse)
def mark_chapter_completed(
    ebook_id: str,
    user_id: str,
    chapter_id: str,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    progress = service.mark_chapter_completed(user_id, ebook_id, chapter_id)
    return EbookReadingProgressResponse.model_validate(progress)


@router.put("/{ebook_id}/progress/{user_id}/bookmark/{section_id}", response_model=EbookReadingProgressResponse)
def add_bookmark(
    ebook_id: str,
    user_id: str,
    section_id: str,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    progress = service.add_bookmark(user_id, ebook_id, section_id)
    return EbookReadingProgressResponse.model_validate(progress)


@router.delete("/{ebook_id}/progress/{user_id}/bookmark/{section_id}", response_model=EbookReadingProgressResponse)
def remove_bookmark(
    ebook_id: str,
    user_id: str,
    section_id: str,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    try:
        progress = service.remove_bookmark(user_id, ebook_id, section_id)
        return EbookReadingProgressResponse.model_validate(progress)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/user/{user_id}/progress", response_model=List[EbookReadingProgressResponse])
def get_user_reading_progress(
    user_id: str,
    service: EbookManagementService = Depends(get_ebook_management_service)
):
    progress_list = service.get_user_reading_progress(user_id)
    return [EbookReadingProgressResponse.model_validate(p) for p in progress_list]
