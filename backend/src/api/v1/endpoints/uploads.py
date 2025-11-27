"""
Upload endpoints - Stub implementation
All endpoints raise NotImplementedError until file upload system is implemented.
"""

from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel

router = APIRouter(prefix="/uploads", tags=["uploads"])


class UploadResponse(BaseModel):
    file_id: str
    filename: str
    url: str
    size: int


@router.post("/", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload file endpoint - stub implementation.
    Raises NotImplementedError until file upload system is implemented.
    """
    raise NotImplementedError(
        "File upload system not yet implemented. "
        "Expected to handle file uploads and return file metadata."
    )


@router.delete("/{file_id}")
def delete_file(file_id: str):
    """
    Delete file endpoint - stub implementation.
    Raises NotImplementedError until file upload system is implemented.
    """
    raise NotImplementedError(
        "File upload system not yet implemented. "
        "Expected to delete uploaded file."
    )


@router.get("/{file_id}")
def get_file(file_id: str):
    """
    Get file info endpoint - stub implementation.
    Raises NotImplementedError until file upload system is implemented.
    """
    raise NotImplementedError(
        "File upload system not yet implemented. "
        "Expected to return file information."
    )
