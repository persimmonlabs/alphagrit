"""
JWT token handling for authentication.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional, Literal
from dataclasses import dataclass
from jose import jwt, JWTError
from pydantic import BaseModel


class TokenPayload(BaseModel):
    """JWT token payload schema."""
    sub: str  # User ID
    email: str
    role: str
    type: Literal["access", "refresh"]
    exp: datetime
    iat: datetime


@dataclass
class TokenPair:
    """Access and refresh token pair."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 0  # Seconds until access token expires


class JWTHandler:
    """
    Handles JWT token creation and validation.
    """

    def __init__(
        self,
        secret_key: str,
        algorithm: str = "HS256",
        access_token_expire_minutes: int = 30,
        refresh_token_expire_days: int = 7
    ):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.access_token_expire_minutes = access_token_expire_minutes
        self.refresh_token_expire_days = refresh_token_expire_days

    def create_access_token(
        self,
        user_id: str,
        email: str,
        role: str
    ) -> str:
        """
        Create an access token for a user.

        Args:
            user_id: User's unique identifier
            email: User's email address
            role: User's role (customer, admin)

        Returns:
            Encoded JWT access token
        """
        now = datetime.now(timezone.utc)
        expires = now + timedelta(minutes=self.access_token_expire_minutes)

        payload = {
            "sub": user_id,
            "email": email,
            "role": role,
            "type": "access",
            "exp": expires,
            "iat": now
        }

        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def create_refresh_token(
        self,
        user_id: str,
        email: str,
        role: str
    ) -> str:
        """
        Create a refresh token for a user.

        Args:
            user_id: User's unique identifier
            email: User's email address
            role: User's role

        Returns:
            Encoded JWT refresh token
        """
        now = datetime.now(timezone.utc)
        expires = now + timedelta(days=self.refresh_token_expire_days)

        payload = {
            "sub": user_id,
            "email": email,
            "role": role,
            "type": "refresh",
            "exp": expires,
            "iat": now
        }

        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def create_token_pair(
        self,
        user_id: str,
        email: str,
        role: str
    ) -> TokenPair:
        """
        Create both access and refresh tokens for a user.

        Args:
            user_id: User's unique identifier
            email: User's email address
            role: User's role

        Returns:
            TokenPair with access and refresh tokens
        """
        access_token = self.create_access_token(user_id, email, role)
        refresh_token = self.create_refresh_token(user_id, email, role)

        return TokenPair(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=self.access_token_expire_minutes * 60
        )

    def decode_token(self, token: str) -> Optional[TokenPayload]:
        """
        Decode and validate a JWT token.

        Args:
            token: Encoded JWT token

        Returns:
            TokenPayload if valid, None if invalid or expired
        """
        try:
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm]
            )
            return TokenPayload(**payload)
        except JWTError:
            return None

    def verify_access_token(self, token: str) -> Optional[TokenPayload]:
        """
        Verify an access token.

        Args:
            token: Encoded JWT access token

        Returns:
            TokenPayload if valid access token, None otherwise
        """
        payload = self.decode_token(token)
        if payload and payload.type == "access":
            return payload
        return None

    def verify_refresh_token(self, token: str) -> Optional[TokenPayload]:
        """
        Verify a refresh token.

        Args:
            token: Encoded JWT refresh token

        Returns:
            TokenPayload if valid refresh token, None otherwise
        """
        payload = self.decode_token(token)
        if payload and payload.type == "refresh":
            return payload
        return None

    def get_token_from_header(self, authorization: str) -> Optional[str]:
        """
        Extract token from Authorization header.

        Args:
            authorization: Authorization header value (e.g., "Bearer xxx")

        Returns:
            Token string if valid format, None otherwise
        """
        if not authorization:
            return None

        parts = authorization.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return None

        return parts[1]
