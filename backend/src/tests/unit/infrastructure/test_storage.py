"""
Unit tests for R2 storage service.
"""
import unittest
from unittest.mock import Mock, patch, MagicMock
from io import BytesIO
from datetime import datetime

from src.infrastructure.storage.r2_storage import R2StorageService


class TestR2StorageService(unittest.TestCase):
    """Tests for R2StorageService class."""

    def setUp(self):
        self.account_id = "test-account-id"
        self.access_key = "test-access-key"
        self.secret_key = "test-secret-key"
        self.bucket_name = "test-bucket"
        self.public_url = "https://files.alphagrit.com"

    @patch('src.infrastructure.storage.r2_storage.boto3')
    def test_init_creates_client(self, mock_boto3):
        """Test that initialization creates boto3 client with correct config."""
        mock_client = MagicMock()
        mock_boto3.client.return_value = mock_client

        service = R2StorageService(
            account_id=self.account_id,
            access_key_id=self.access_key,
            secret_access_key=self.secret_key,
            bucket_name=self.bucket_name,
            public_url=self.public_url
        )

        mock_boto3.client.assert_called_once()
        call_kwargs = mock_boto3.client.call_args[1]
        self.assertEqual(call_kwargs["endpoint_url"], f"https://{self.account_id}.r2.cloudflarestorage.com")
        self.assertEqual(call_kwargs["aws_access_key_id"], self.access_key)
        self.assertEqual(call_kwargs["region_name"], "auto")

    @patch('src.infrastructure.storage.r2_storage.boto3')
    def test_upload_file_success(self, mock_boto3):
        """Test successful file upload."""
        mock_client = MagicMock()
        mock_boto3.client.return_value = mock_client

        service = R2StorageService(
            account_id=self.account_id,
            access_key_id=self.access_key,
            secret_access_key=self.secret_key,
            bucket_name=self.bucket_name,
            public_url=self.public_url
        )

        file_data = BytesIO(b"test file content")
        result = service.upload_file(
            file_data=file_data,
            filename="test.pdf",
            folder="ebooks"
        )

        self.assertIn("file_id", result)
        self.assertIn("key", result)
        self.assertIn("url", result)
        self.assertEqual(result["filename"], "test.pdf")
        self.assertEqual(result["content_type"], "application/pdf")
        self.assertEqual(result["size"], 17)  # len("test file content")
        self.assertTrue(result["key"].startswith("ebooks/"))
        mock_client.upload_fileobj.assert_called_once()

    @patch('src.infrastructure.storage.r2_storage.boto3')
    def test_upload_file_invalid_extension_raises(self, mock_boto3):
        """Test that invalid file extension raises ValueError."""
        mock_client = MagicMock()
        mock_boto3.client.return_value = mock_client

        service = R2StorageService(
            account_id=self.account_id,
            access_key_id=self.access_key,
            secret_access_key=self.secret_key,
            bucket_name=self.bucket_name
        )

        file_data = BytesIO(b"test content")

        with self.assertRaises(ValueError) as ctx:
            service.upload_file(file_data, "test.exe", "uploads")

        self.assertIn("File type not allowed", str(ctx.exception))

    @patch('src.infrastructure.storage.r2_storage.boto3')
    def test_upload_file_image_size_limit(self, mock_boto3):
        """Test that image files over 10MB raise ValueError."""
        mock_client = MagicMock()
        mock_boto3.client.return_value = mock_client

        service = R2StorageService(
            account_id=self.account_id,
            access_key_id=self.access_key,
            secret_access_key=self.secret_key,
            bucket_name=self.bucket_name
        )

        # Create file over 10MB
        large_data = BytesIO(b"x" * (11 * 1024 * 1024))

        with self.assertRaises(ValueError) as ctx:
            service.upload_file(large_data, "large.png", "images")

        self.assertIn("File too large", str(ctx.exception))

    @patch('src.infrastructure.storage.r2_storage.boto3')
    def test_upload_bytes_success(self, mock_boto3):
        """Test uploading raw bytes."""
        mock_client = MagicMock()
        mock_boto3.client.return_value = mock_client

        service = R2StorageService(
            account_id=self.account_id,
            access_key_id=self.access_key,
            secret_access_key=self.secret_key,
            bucket_name=self.bucket_name,
            public_url=self.public_url
        )

        result = service.upload_bytes(
            data=b"raw bytes data",
            filename="test.jpg",
            folder="images"
        )

        self.assertEqual(result["size"], 14)
        mock_client.upload_fileobj.assert_called_once()

    @patch('src.infrastructure.storage.r2_storage.boto3')
    def test_delete_file_success(self, mock_boto3):
        """Test successful file deletion."""
        mock_client = MagicMock()
        mock_boto3.client.return_value = mock_client

        service = R2StorageService(
            account_id=self.account_id,
            access_key_id=self.access_key,
            secret_access_key=self.secret_key,
            bucket_name=self.bucket_name
        )

        result = service.delete_file("uploads/test.pdf")

        self.assertTrue(result)
        mock_client.delete_object.assert_called_once_with(
            Bucket=self.bucket_name,
            Key="uploads/test.pdf"
        )

    @patch('src.infrastructure.storage.r2_storage.boto3')
    def test_get_file_info_success(self, mock_boto3):
        """Test getting file information."""
        mock_client = MagicMock()
        mock_client.head_object.return_value = {
            "ContentLength": 1024,
            "ContentType": "application/pdf",
            "LastModified": datetime(2024, 11, 29),
            "Metadata": {"uploaded_by": "test"}
        }
        mock_boto3.client.return_value = mock_client

        service = R2StorageService(
            account_id=self.account_id,
            access_key_id=self.access_key,
            secret_access_key=self.secret_key,
            bucket_name=self.bucket_name,
            public_url=self.public_url
        )

        result = service.get_file_info("ebooks/test.pdf")

        self.assertEqual(result["key"], "ebooks/test.pdf")
        self.assertEqual(result["size"], 1024)
        self.assertEqual(result["content_type"], "application/pdf")
        self.assertIn(self.public_url, result["url"])

    @patch('src.infrastructure.storage.r2_storage.boto3')
    def test_get_file_info_not_found(self, mock_boto3):
        """Test getting info for non-existent file returns None."""
        from botocore.exceptions import ClientError

        mock_client = MagicMock()
        mock_client.head_object.side_effect = ClientError(
            {"Error": {"Code": "404"}},
            "HeadObject"
        )
        mock_boto3.client.return_value = mock_client

        service = R2StorageService(
            account_id=self.account_id,
            access_key_id=self.access_key,
            secret_access_key=self.secret_key,
            bucket_name=self.bucket_name
        )

        result = service.get_file_info("nonexistent/file.pdf")

        self.assertIsNone(result)

    @patch('src.infrastructure.storage.r2_storage.boto3')
    def test_generate_presigned_url_download(self, mock_boto3):
        """Test generating presigned download URL."""
        mock_client = MagicMock()
        mock_client.generate_presigned_url.return_value = "https://presigned-url.com/file"
        mock_boto3.client.return_value = mock_client

        service = R2StorageService(
            account_id=self.account_id,
            access_key_id=self.access_key,
            secret_access_key=self.secret_key,
            bucket_name=self.bucket_name
        )

        result = service.generate_presigned_url("ebooks/test.pdf", expires_in=7200)

        self.assertEqual(result, "https://presigned-url.com/file")
        mock_client.generate_presigned_url.assert_called_once_with(
            ClientMethod="get_object",
            Params={"Bucket": self.bucket_name, "Key": "ebooks/test.pdf"},
            ExpiresIn=7200
        )

    @patch('src.infrastructure.storage.r2_storage.boto3')
    def test_generate_presigned_url_upload(self, mock_boto3):
        """Test generating presigned upload URL."""
        mock_client = MagicMock()
        mock_client.generate_presigned_url.return_value = "https://presigned-upload.com/file"
        mock_boto3.client.return_value = mock_client

        service = R2StorageService(
            account_id=self.account_id,
            access_key_id=self.access_key,
            secret_access_key=self.secret_key,
            bucket_name=self.bucket_name
        )

        result = service.generate_presigned_url("uploads/new.pdf", for_upload=True)

        mock_client.generate_presigned_url.assert_called_once_with(
            ClientMethod="put_object",
            Params={"Bucket": self.bucket_name, "Key": "uploads/new.pdf"},
            ExpiresIn=3600
        )

    @patch('src.infrastructure.storage.r2_storage.boto3')
    def test_generate_download_url_with_filename(self, mock_boto3):
        """Test generating download URL with content-disposition."""
        mock_client = MagicMock()
        mock_client.generate_presigned_url.return_value = "https://download-url.com/file"
        mock_boto3.client.return_value = mock_client

        service = R2StorageService(
            account_id=self.account_id,
            access_key_id=self.access_key,
            secret_access_key=self.secret_key,
            bucket_name=self.bucket_name
        )

        result = service.generate_download_url(
            "ebooks/2024/11/uuid.pdf",
            filename="IMPARAVEL.pdf"
        )

        call_args = mock_client.generate_presigned_url.call_args
        params = call_args[1]["Params"]
        self.assertIn("ResponseContentDisposition", params)
        self.assertIn("IMPARAVEL.pdf", params["ResponseContentDisposition"])

    @patch('src.infrastructure.storage.r2_storage.boto3')
    def test_list_files_success(self, mock_boto3):
        """Test listing files in bucket."""
        mock_client = MagicMock()
        mock_client.list_objects_v2.return_value = {
            "Contents": [
                {"Key": "uploads/file1.pdf", "Size": 1024, "LastModified": datetime.now()},
                {"Key": "uploads/file2.jpg", "Size": 2048, "LastModified": datetime.now()}
            ]
        }
        mock_boto3.client.return_value = mock_client

        service = R2StorageService(
            account_id=self.account_id,
            access_key_id=self.access_key,
            secret_access_key=self.secret_key,
            bucket_name=self.bucket_name,
            public_url=self.public_url
        )

        result = service.list_files(prefix="uploads/", max_keys=10)

        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]["key"], "uploads/file1.pdf")
        self.assertEqual(result[1]["key"], "uploads/file2.jpg")

    @patch('src.infrastructure.storage.r2_storage.boto3')
    def test_copy_file_success(self, mock_boto3):
        """Test copying file within bucket."""
        mock_client = MagicMock()
        mock_boto3.client.return_value = mock_client

        service = R2StorageService(
            account_id=self.account_id,
            access_key_id=self.access_key,
            secret_access_key=self.secret_key,
            bucket_name=self.bucket_name
        )

        result = service.copy_file("source/file.pdf", "dest/file.pdf")

        self.assertTrue(result)
        mock_client.copy_object.assert_called_once()

    @patch('src.infrastructure.storage.r2_storage.boto3')
    def test_public_url_generation(self, mock_boto3):
        """Test public URL generation with custom domain."""
        mock_client = MagicMock()
        mock_boto3.client.return_value = mock_client

        service = R2StorageService(
            account_id=self.account_id,
            access_key_id=self.access_key,
            secret_access_key=self.secret_key,
            bucket_name=self.bucket_name,
            public_url="https://files.alphagrit.com"
        )

        url = service._get_public_url("ebooks/test.pdf")

        self.assertEqual(url, "https://files.alphagrit.com/ebooks/test.pdf")

    @patch('src.infrastructure.storage.r2_storage.boto3')
    def test_public_url_fallback_without_custom_domain(self, mock_boto3):
        """Test public URL fallback to R2.dev when no custom domain."""
        mock_client = MagicMock()
        mock_boto3.client.return_value = mock_client

        service = R2StorageService(
            account_id=self.account_id,
            access_key_id=self.access_key,
            secret_access_key=self.secret_key,
            bucket_name=self.bucket_name,
            public_url=None
        )

        url = service._get_public_url("ebooks/test.pdf")

        self.assertIn(self.bucket_name, url)
        self.assertIn(self.account_id, url)
        self.assertIn("r2.dev", url)

    def test_allowed_file_types(self):
        """Test that allowed file types are correct."""
        self.assertIn(".pdf", R2StorageService.ALLOWED_TYPES)
        self.assertIn(".epub", R2StorageService.ALLOWED_TYPES)
        self.assertIn(".jpg", R2StorageService.ALLOWED_TYPES)
        self.assertIn(".png", R2StorageService.ALLOWED_TYPES)
        self.assertNotIn(".exe", R2StorageService.ALLOWED_TYPES)
        self.assertNotIn(".js", R2StorageService.ALLOWED_TYPES)

    def test_file_size_limits(self):
        """Test that file size limits are correct."""
        self.assertEqual(R2StorageService.MAX_IMAGE_SIZE, 10 * 1024 * 1024)
        self.assertEqual(R2StorageService.MAX_DOCUMENT_SIZE, 100 * 1024 * 1024)


if __name__ == "__main__":
    unittest.main()
