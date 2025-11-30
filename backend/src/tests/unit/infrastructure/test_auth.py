"""
Unit tests for authentication infrastructure.
"""
import unittest
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from src.infrastructure.auth.password import PasswordHandler
from src.infrastructure.auth.jwt_handler import JWTHandler, TokenPair, TokenPayload


class TestPasswordHandler(unittest.TestCase):
    """Tests for PasswordHandler class."""

    def setUp(self):
        self.handler = PasswordHandler()

    def test_hash_returns_bcrypt_hash(self):
        """Test that hashing returns a bcrypt formatted hash."""
        password = "securepassword123"
        hashed = self.handler.hash(password)

        self.assertIsInstance(hashed, str)
        self.assertTrue(hashed.startswith("$2b$"))  # bcrypt prefix
        self.assertNotEqual(password, hashed)

    def test_hash_same_password_different_hashes(self):
        """Test that the same password produces different hashes (salted)."""
        password = "securepassword123"
        hash1 = self.handler.hash(password)
        hash2 = self.handler.hash(password)

        self.assertNotEqual(hash1, hash2)

    def test_verify_correct_password(self):
        """Test that verify returns True for correct password."""
        password = "securepassword123"
        hashed = self.handler.hash(password)

        result = self.handler.verify(password, hashed)

        self.assertTrue(result)

    def test_verify_wrong_password(self):
        """Test that verify returns False for wrong password."""
        password = "securepassword123"
        hashed = self.handler.hash(password)

        result = self.handler.verify("wrongpassword", hashed)

        self.assertFalse(result)

    def test_verify_malformed_hash_returns_false(self):
        """Test that verify handles malformed hashes gracefully."""
        result = self.handler.verify("password", "not_a_valid_hash")

        self.assertFalse(result)

    def test_verify_empty_hash_returns_false(self):
        """Test that verify handles empty hash gracefully."""
        result = self.handler.verify("password", "")

        self.assertFalse(result)

    def test_needs_rehash_fresh_hash(self):
        """Test that fresh hashes don't need rehashing."""
        hashed = self.handler.hash("password")

        result = self.handler.needs_rehash(hashed)

        self.assertFalse(result)


class TestJWTHandler(unittest.TestCase):
    """Tests for JWTHandler class."""

    def setUp(self):
        self.secret = "test-secret-key-for-testing-only"
        self.handler = JWTHandler(
            secret_key=self.secret,
            algorithm="HS256",
            access_token_expire_minutes=30,
            refresh_token_expire_days=7
        )
        self.user_id = str(uuid4())
        self.email = "test@example.com"
        self.role = "customer"

    def test_create_access_token_returns_string(self):
        """Test that create_access_token returns a JWT string."""
        token = self.handler.create_access_token(
            self.user_id, self.email, self.role
        )

        self.assertIsInstance(token, str)
        self.assertEqual(len(token.split(".")), 3)  # JWT format: header.payload.signature

    def test_create_refresh_token_returns_string(self):
        """Test that create_refresh_token returns a JWT string."""
        token = self.handler.create_refresh_token(
            self.user_id, self.email, self.role
        )

        self.assertIsInstance(token, str)
        self.assertEqual(len(token.split(".")), 3)

    def test_create_token_pair_returns_both_tokens(self):
        """Test that create_token_pair returns access and refresh tokens."""
        pair = self.handler.create_token_pair(
            self.user_id, self.email, self.role
        )

        self.assertIsInstance(pair, TokenPair)
        self.assertIsNotNone(pair.access_token)
        self.assertIsNotNone(pair.refresh_token)
        self.assertEqual(pair.token_type, "bearer")
        self.assertEqual(pair.expires_in, 30 * 60)  # 30 minutes in seconds

    def test_verify_access_token_valid(self):
        """Test that verify_access_token returns payload for valid token."""
        token = self.handler.create_access_token(
            self.user_id, self.email, self.role
        )

        payload = self.handler.verify_access_token(token)

        self.assertIsNotNone(payload)
        self.assertEqual(payload.sub, self.user_id)
        self.assertEqual(payload.email, self.email)
        self.assertEqual(payload.role, self.role)
        self.assertEqual(payload.type, "access")

    def test_verify_refresh_token_valid(self):
        """Test that verify_refresh_token returns payload for valid token."""
        token = self.handler.create_refresh_token(
            self.user_id, self.email, self.role
        )

        payload = self.handler.verify_refresh_token(token)

        self.assertIsNotNone(payload)
        self.assertEqual(payload.sub, self.user_id)
        self.assertEqual(payload.type, "refresh")

    def test_verify_access_token_rejects_refresh_token(self):
        """Test that verify_access_token rejects refresh tokens."""
        refresh_token = self.handler.create_refresh_token(
            self.user_id, self.email, self.role
        )

        payload = self.handler.verify_access_token(refresh_token)

        self.assertIsNone(payload)

    def test_verify_refresh_token_rejects_access_token(self):
        """Test that verify_refresh_token rejects access tokens."""
        access_token = self.handler.create_access_token(
            self.user_id, self.email, self.role
        )

        payload = self.handler.verify_refresh_token(access_token)

        self.assertIsNone(payload)

    def test_decode_token_invalid_token_returns_none(self):
        """Test that decode_token returns None for invalid tokens."""
        payload = self.handler.decode_token("invalid.token.here")

        self.assertIsNone(payload)

    def test_decode_token_wrong_secret_returns_none(self):
        """Test that tokens signed with different secret are rejected."""
        token = self.handler.create_access_token(
            self.user_id, self.email, self.role
        )

        other_handler = JWTHandler(secret_key="different-secret")
        payload = other_handler.decode_token(token)

        self.assertIsNone(payload)

    def test_get_token_from_header_valid(self):
        """Test extracting token from valid Authorization header."""
        token = self.handler.create_access_token(
            self.user_id, self.email, self.role
        )
        header = f"Bearer {token}"

        result = self.handler.get_token_from_header(header)

        self.assertEqual(result, token)

    def test_get_token_from_header_case_insensitive(self):
        """Test that Bearer is case-insensitive."""
        token = "some-token"
        header = f"bearer {token}"

        result = self.handler.get_token_from_header(header)

        self.assertEqual(result, token)

    def test_get_token_from_header_invalid_format(self):
        """Test that invalid format returns None."""
        result = self.handler.get_token_from_header("InvalidFormat token")
        self.assertIsNone(result)

    def test_get_token_from_header_empty(self):
        """Test that empty header returns None."""
        result = self.handler.get_token_from_header("")
        self.assertIsNone(result)

    def test_get_token_from_header_none(self):
        """Test that None header returns None."""
        result = self.handler.get_token_from_header(None)
        self.assertIsNone(result)

    def test_token_contains_expiration(self):
        """Test that tokens have proper expiration time."""
        token = self.handler.create_access_token(
            self.user_id, self.email, self.role
        )

        payload = self.handler.decode_token(token)

        self.assertIsNotNone(payload.exp)
        self.assertIsNotNone(payload.iat)
        # Expiration should be in the future
        self.assertGreater(payload.exp, datetime.now(timezone.utc))


if __name__ == "__main__":
    unittest.main()
