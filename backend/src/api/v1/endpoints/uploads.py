"""
File upload endpoints for R2 storage.
"""
import logging
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends, Header, Query
from pydantic import BaseModel

from src.settings import get_settings
from src.infrastructure.storage.r2_storage import R2StorageService
from src.infrastructure.auth import JWTHandler

router = APIRouter(prefix="/uploads", tags=["uploads"])
logger = logging.getLogger(__name__)
settings = get_settings()

# Initialize JWT handler for auth
jwt_handler = JWTHandler(
    secret_key=settings.JWT_SECRET_KEY,
    algorithm=settings.JWT_ALGORITHM
)


# ===========================================
# Response Schemas
# ===========================================

class UploadResponse(BaseModel):
    """Upload response schema."""
    file_id: str
    filename: str
    url: str
    size: int
    content_type: str
    key: str


class FileInfoResponse(BaseModel):
    """File info response schema."""
    key: str
    size: int
    content_type: Optional[str]
    url: str
    last_modified: Optional[str]


class PresignedUrlResponse(BaseModel):
    """Presigned URL response schema."""
    url: str
    expires_in: int
    key: str


# ===========================================
# Dependencies
# ===========================================

def get_storage_service() -> R2StorageService:
    """Get R2 storage service instance."""
    if not settings.has_r2_config():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Storage service not configured"
        )

    return R2StorageService(
        account_id=settings.R2_ACCOUNT_ID,
        access_key_id=settings.R2_ACCESS_KEY_ID,
        secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        bucket_name=settings.R2_BUCKET_NAME,
        public_url=settings.R2_PUBLIC_URL
    )


def verify_auth(authorization: str = Header(None)) -> dict:
    """
    Verify authentication for upload endpoints.

    Returns user info from token.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = jwt_handler.get_token_from_header(authorization)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
            headers={"WWW-Authenticate": "Bearer"}
        )

    payload = jwt_handler.verify_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return {"user_id": payload.sub, "email": payload.email, "role": payload.role}


def require_admin(user: dict = Depends(verify_auth)) -> dict:
    """Require admin role for endpoint."""
    if user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user


# ===========================================
# Endpoints
# ===========================================

@router.post("/", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    folder: str = Query(default="uploads", description="Folder/category for the upload"),
    storage: R2StorageService = Depends(get_storage_service),
    user: dict = Depends(verify_auth)
):
    """
    Upload a file to R2 storage.

    Requires authentication. Allowed file types:
    - Images: .jpg, .jpeg, .png, .gif, .webp, .svg (max 10MB)
    - Documents: .pdf, .epub, .mobi (max 100MB)

    Folder options: uploads, products, covers, ebooks, content
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required"
        )

    # Validate folder
    allowed_folders = {"uploads", "products", "covers", "ebooks", "content", "images"}
    if folder not in allowed_folders:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid folder. Allowed: {', '.join(allowed_folders)}"
        )

    try:
        result = storage.upload_file(
            file_data=file.file,
            filename=file.filename,
            folder=folder,
            content_type=file.content_type,
            metadata={"uploaded_by": user["user_id"]}
        )

        logger.info(f"File uploaded by {user['email']}: {result['key']}")

        return UploadResponse(
            file_id=result["file_id"],
            filename=result["filename"],
            url=result["url"],
            size=result["size"],
            content_type=result["content_type"],
            key=result["key"]
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload file"
        )


@router.delete("/{file_key:path}")
async def delete_file(
    file_key: str,
    storage: R2StorageService = Depends(get_storage_service),
    user: dict = Depends(require_admin)
):
    """
    Delete a file from R2 storage.

    Requires admin authentication.
    """
    success = storage.delete_file(file_key)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found or could not be deleted"
        )

    logger.info(f"File deleted by {user['email']}: {file_key}")

    return {"status": "deleted", "key": file_key}


@router.get("/{file_key:path}", response_model=FileInfoResponse)
async def get_file_info(
    file_key: str,
    storage: R2StorageService = Depends(get_storage_service),
    user: dict = Depends(verify_auth)
):
    """
    Get information about an uploaded file.

    Requires authentication.
    """
    info = storage.get_file_info(file_key)

    if not info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    return FileInfoResponse(
        key=info["key"],
        size=info["size"],
        content_type=info["content_type"],
        url=info["url"],
        last_modified=str(info["last_modified"]) if info["last_modified"] else None
    )


@router.get("/{file_key:path}/download", response_model=PresignedUrlResponse)
async def get_download_url(
    file_key: str,
    filename: Optional[str] = Query(None, description="Filename for download"),
    expires_in: int = Query(3600, ge=60, le=86400, description="URL expiration in seconds"),
    storage: R2StorageService = Depends(get_storage_service),
    user: dict = Depends(verify_auth)
):
    """
    Generate a presigned download URL for a file.

    The URL allows temporary access to download the file.
    Expires in 1 hour by default (configurable 1 minute to 24 hours).

    Requires authentication.
    """
    # Verify file exists
    info = storage.get_file_info(file_key)
    if not info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    try:
        url = storage.generate_download_url(
            key=file_key,
            filename=filename,
            expires_in=expires_in
        )

        return PresignedUrlResponse(
            url=url,
            expires_in=expires_in,
            key=file_key
        )

    except Exception as e:
        logger.error(f"Error generating download URL: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate download URL"
        )


@router.post("/presigned-upload", response_model=PresignedUrlResponse)
async def get_presigned_upload_url(
    filename: str = Query(..., description="Filename to upload"),
    folder: str = Query(default="uploads", description="Folder for the upload"),
    expires_in: int = Query(3600, ge=60, le=3600, description="URL expiration in seconds"),
    storage: R2StorageService = Depends(get_storage_service),
    user: dict = Depends(verify_auth)
):
    """
    Generate a presigned URL for direct upload to R2.

    This allows the client to upload directly to R2 without going through the API,
    which is more efficient for large files.

    Returns a URL that accepts PUT requests with the file data.
    """
    import uuid
    from datetime import datetime

    # Validate folder
    allowed_folders = {"uploads", "products", "covers", "ebooks", "content", "images"}
    if folder not in allowed_folders:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid folder. Allowed: {', '.join(allowed_folders)}"
        )

    # Generate unique key
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    file_id = str(uuid.uuid4())
    timestamp = datetime.utcnow().strftime("%Y/%m/%d")
    key = f"{folder}/{timestamp}/{file_id}.{ext}" if ext else f"{folder}/{timestamp}/{file_id}"

    try:
        url = storage.generate_presigned_url(
            key=key,
            expires_in=expires_in,
            for_upload=True
        )

        logger.info(f"Generated presigned upload URL for {user['email']}: {key}")

        return PresignedUrlResponse(
            url=url,
            expires_in=expires_in,
            key=key
        )

    except Exception as e:
        logger.error(f"Error generating presigned upload URL: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate upload URL"
        )


@router.get("/")
async def list_uploads(
    folder: str = Query(default="", description="Filter by folder prefix"),
    limit: int = Query(default=50, ge=1, le=100, description="Maximum results"),
    storage: R2StorageService = Depends(get_storage_service),
    user: dict = Depends(require_admin)
):
    """
    List uploaded files.

    Requires admin authentication.
    """
    files = storage.list_files(prefix=folder, max_keys=limit)

    return {
        "files": files,
        "count": len(files),
        "folder": folder
    }
