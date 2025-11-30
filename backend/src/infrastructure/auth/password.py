"""
Password hashing and verification using bcrypt.
"""
from passlib.context import CryptContext


class PasswordHandler:
    """
    Handles password hashing and verification using bcrypt.
    """

    def __init__(self):
        self._context = CryptContext(
            schemes=["bcrypt"],
            deprecated="auto"
        )

    def hash(self, password: str) -> str:
        """
        Hash a plain text password.

        Args:
            password: Plain text password to hash

        Returns:
            Hashed password string
        """
        return self._context.hash(password)

    def verify(self, plain_password: str, hashed_password: str) -> bool:
        """
        Verify a plain text password against a hash.

        Args:
            plain_password: Plain text password to verify
            hashed_password: Previously hashed password

        Returns:
            True if password matches, False otherwise
        """
        try:
            return self._context.verify(plain_password, hashed_password)
        except Exception:
            # Handle malformed hashes gracefully
            return False

    def needs_rehash(self, hashed_password: str) -> bool:
        """
        Check if a password hash needs to be updated.

        Args:
            hashed_password: Existing password hash

        Returns:
            True if the hash should be updated
        """
        return self._context.needs_update(hashed_password)


# Global instance for convenience
password_handler = PasswordHandler()
