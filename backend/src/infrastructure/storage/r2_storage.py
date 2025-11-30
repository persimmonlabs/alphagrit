"""
Cloudflare R2 storage service (S3-compatible).

R2 is Cloudflare's object storage service with zero egress fees,
making it ideal for serving downloadable content like e-books.
"""
import logging
import uuid
import mimetypes
from typing import Optional, Dict, Any, BinaryIO
from datetime import datetime
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)


class R2StorageService:
    """
    Cloudflare R2 storage service using S3-compatible API.

    Handles file uploads, downloads, presigned URLs, and file management.
    """

    # Allowed file types for uploads
    ALLOWED_IMAGE_TYPES = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}
    ALLOWED_DOCUMENT_TYPES = {".pdf", ".epub", ".mobi"}
    ALLOWED_TYPES = ALLOWED_IMAGE_TYPES | ALLOWED_DOCUMENT_TYPES

    # Maximum file sizes (in bytes)
    MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB
    MAX_DOCUMENT_SIZE = 100 * 1024 * 1024  # 100 MB

    def __init__(
        self,
        account_id: str,
        access_key_id: str,
        secret_access_key: str,
        bucket_name: str,
        public_url: Optional[str] = None
    ):
        """
        Initialize R2 storage service.

        Args:
            account_id: Cloudflare account ID
            access_key_id: R2 access key ID
            secret_access_key: R2 secret access key
            bucket_name: R2 bucket name
            public_url: Public URL for the bucket (custom domain or R2.dev)
        """
        self.account_id = account_id
        self.bucket_name = bucket_name
        self.public_url = public_url.rstrip("/") if public_url else None

        # R2 endpoint URL
        endpoint_url = f"https://{account_id}.r2.cloudflarestorage.com"

        # Initialize boto3 client with R2-specific configuration
        self.client = boto3.client(
            "s3",
            endpoint_url=endpoint_url,
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
            config=Config(
                signature_version="s3v4",
                retries={"max_attempts": 3, "mode": "adaptive"}
            ),
            region_name="auto"  # R2 uses "auto" region
        )

    def upload_file(
        self,
        file_data: BinaryIO,
        filename: str,
        folder: str = "uploads",
        content_type: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Upload a file to R2.

        Args:
            file_data: File binary data (file-like object)
            filename: Original filename
            folder: Folder/prefix in the bucket
            content_type: MIME type (auto-detected if not provided)
            metadata: Additional metadata to store with the file

        Returns:
            Dictionary with file_id, key, url, size
        """
        # Validate file extension
        ext = self._get_extension(filename)
        if ext not in self.ALLOWED_TYPES:
            raise ValueError(f"File type not allowed: {ext}")

        # Generate unique key
        file_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().strftime("%Y/%m/%d")
        key = f"{folder}/{timestamp}/{file_id}{ext}"

        # Auto-detect content type
        if not content_type:
            content_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"

        # Get file size
        file_data.seek(0, 2)  # Seek to end
        file_size = file_data.tell()
        file_data.seek(0)  # Reset to beginning

        # Validate file size
        max_size = self.MAX_IMAGE_SIZE if ext in self.ALLOWED_IMAGE_TYPES else self.MAX_DOCUMENT_SIZE
        if file_size > max_size:
            raise ValueError(f"File too large. Maximum size: {max_size / 1024 / 1024}MB")

        try:
            # Upload to R2
            extra_args = {
                "ContentType": content_type,
                "Metadata": metadata or {}
            }

            self.client.upload_fileobj(
                file_data,
                self.bucket_name,
                key,
                ExtraArgs=extra_args
            )

            logger.info(f"Uploaded file: {key} ({file_size} bytes)")

            # Build public URL
            url = self._get_public_url(key)

            return {
                "file_id": file_id,
                "key": key,
                "url": url,
                "filename": filename,
                "content_type": content_type,
                "size": file_size,
                "folder": folder
            }

        except ClientError as e:
            logger.error(f"R2 upload error: {e}")
            raise Exception(f"Failed to upload file: {str(e)}")

    def upload_bytes(
        self,
        data: bytes,
        filename: str,
        folder: str = "uploads",
        content_type: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Upload bytes data to R2.

        Args:
            data: Raw bytes data
            filename: Original filename
            folder: Folder/prefix in the bucket
            content_type: MIME type
            metadata: Additional metadata

        Returns:
            Dictionary with file_id, key, url, size
        """
        import io
        return self.upload_file(
            io.BytesIO(data),
            filename,
            folder,
            content_type,
            metadata
        )

    def delete_file(self, key: str) -> bool:
        """
        Delete a file from R2.

        Args:
            key: File key in the bucket

        Returns:
            True if successful
        """
        try:
            self.client.delete_object(Bucket=self.bucket_name, Key=key)
            logger.info(f"Deleted file: {key}")
            return True

        except ClientError as e:
            logger.error(f"R2 delete error: {e}")
            return False

    def get_file_info(self, key: str) -> Optional[Dict[str, Any]]:
        """
        Get information about a file.

        Args:
            key: File key in the bucket

        Returns:
            Dictionary with file metadata, or None if not found
        """
        try:
            response = self.client.head_object(Bucket=self.bucket_name, Key=key)

            return {
                "key": key,
                "size": response.get("ContentLength", 0),
                "content_type": response.get("ContentType"),
                "last_modified": response.get("LastModified"),
                "metadata": response.get("Metadata", {}),
                "url": self._get_public_url(key)
            }

        except ClientError as e:
            if e.response["Error"]["Code"] == "404":
                return None
            logger.error(f"R2 head error: {e}")
            raise

    def generate_presigned_url(
        self,
        key: str,
        expires_in: int = 3600,
        for_upload: bool = False
    ) -> str:
        """
        Generate a presigned URL for temporary access.

        Args:
            key: File key in the bucket
            expires_in: URL expiration time in seconds (default 1 hour)
            for_upload: If True, generate upload URL; otherwise download URL

        Returns:
            Presigned URL string
        """
        try:
            method = "put_object" if for_upload else "get_object"

            url = self.client.generate_presigned_url(
                ClientMethod=method,
                Params={"Bucket": self.bucket_name, "Key": key},
                ExpiresIn=expires_in
            )

            return url

        except ClientError as e:
            logger.error(f"R2 presigned URL error: {e}")
            raise Exception(f"Failed to generate presigned URL: {str(e)}")

    def generate_download_url(
        self,
        key: str,
        filename: Optional[str] = None,
        expires_in: int = 3600
    ) -> str:
        """
        Generate a presigned download URL with content-disposition.

        Args:
            key: File key in the bucket
            filename: Filename to use for download
            expires_in: URL expiration time in seconds

        Returns:
            Presigned download URL
        """
        try:
            params = {"Bucket": self.bucket_name, "Key": key}

            if filename:
                params["ResponseContentDisposition"] = f'attachment; filename="{filename}"'

            url = self.client.generate_presigned_url(
                ClientMethod="get_object",
                Params=params,
                ExpiresIn=expires_in
            )

            return url

        except ClientError as e:
            logger.error(f"R2 download URL error: {e}")
            raise Exception(f"Failed to generate download URL: {str(e)}")

    def list_files(
        self,
        prefix: str = "",
        max_keys: int = 100
    ) -> list:
        """
        List files in the bucket.

        Args:
            prefix: Filter by key prefix
            max_keys: Maximum number of keys to return

        Returns:
            List of file info dictionaries
        """
        try:
            response = self.client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix,
                MaxKeys=max_keys
            )

            files = []
            for obj in response.get("Contents", []):
                files.append({
                    "key": obj["Key"],
                    "size": obj["Size"],
                    "last_modified": obj["LastModified"],
                    "url": self._get_public_url(obj["Key"])
                })

            return files

        except ClientError as e:
            logger.error(f"R2 list error: {e}")
            return []

    def copy_file(self, source_key: str, dest_key: str) -> bool:
        """
        Copy a file within the bucket.

        Args:
            source_key: Source file key
            dest_key: Destination file key

        Returns:
            True if successful
        """
        try:
            self.client.copy_object(
                Bucket=self.bucket_name,
                CopySource={"Bucket": self.bucket_name, "Key": source_key},
                Key=dest_key
            )
            logger.info(f"Copied file: {source_key} -> {dest_key}")
            return True

        except ClientError as e:
            logger.error(f"R2 copy error: {e}")
            return False

    def _get_public_url(self, key: str) -> str:
        """Get public URL for a file."""
        if self.public_url:
            return f"{self.public_url}/{key}"
        # Fallback to R2.dev URL if available
        return f"https://{self.bucket_name}.{self.account_id}.r2.dev/{key}"

    def _get_extension(self, filename: str) -> str:
        """Get lowercase file extension."""
        import os
        return os.path.splitext(filename)[1].lower()
