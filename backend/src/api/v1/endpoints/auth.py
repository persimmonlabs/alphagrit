"""
Authentication endpoints for user registration, login, and token management.
"""
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, status, Header
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from src.settings import get_settings
from src.infrastructure.auth import JWTHandler, PasswordHandler
from src.infrastructure.database import SessionLocal
from src.domain.repositories.user_repository import AbstractProfileRepository
from src.infrastructure.repositories.sqlalchemy_user_repository import SQLAlchemyProfileRepository
from src.domain.entities.user import Profile, UserRole

router = APIRouter(prefix="/auth", tags=["auth"])

# Initialize handlers
settings = get_settings()
jwt_handler = JWTHandler(
    secret_key=settings.JWT_SECRET_KEY,
    algorithm=settings.JWT_ALGORITHM,
    access_token_expire_minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES,
    refresh_token_expire_days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS
)
password_handler = PasswordHandler()


# ===========================================
# Request/Response Schemas
# ===========================================

class LoginRequest(BaseModel):
    """Login request schema."""
    email: EmailStr
    password: str = Field(..., min_length=6)


class RegisterRequest(BaseModel):
    """Registration request schema."""
    email: EmailStr
    password: str = Field(..., min_length=8, description="Minimum 8 characters")
    full_name: str = Field(..., min_length=2, max_length=255)
    preferred_language: str = Field(default="en", pattern="^(en|pt)$")
    preferred_currency: str = Field(default="USD", pattern="^(USD|BRL)$")


class TokenResponse(BaseModel):
    """Token response schema."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshRequest(BaseModel):
    """Refresh token request schema."""
    refresh_token: str


class VerifyRequest(BaseModel):
    """Token verification request schema."""
    token: str


class UserResponse(BaseModel):
    """User information response schema."""
    id: str
    email: str
    full_name: Optional[str]
    role: str
    preferred_language: str
    preferred_currency: str


class VerifyResponse(BaseModel):
    """Token verification response schema."""
    valid: bool
    user: Optional[UserResponse] = None


class PasswordChangeRequest(BaseModel):
    """Password change request schema."""
    current_password: str
    new_password: str = Field(..., min_length=8)


# ===========================================
# Dependencies
# ===========================================

def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_profile_repo(db: Session = Depends(get_db)) -> AbstractProfileRepository:
    """Get profile repository."""
    return SQLAlchemyProfileRepository(db)


# ===========================================
# Endpoints
# ===========================================

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(
    request: RegisterRequest,
    profile_repo: AbstractProfileRepository = Depends(get_profile_repo)
):
    """
    Register a new user account.

    Creates a new user with the provided email and password.
    Returns access and refresh tokens upon successful registration.
    """
    # Check if user already exists
    existing_user = profile_repo.get_by_email(request.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists"
        )

    # Hash password
    hashed_password = password_handler.hash(request.password)

    # Create new profile
    from src.domain.entities.user import CurrencyType
    currency = CurrencyType.USD if request.preferred_currency == "USD" else CurrencyType.BRL

    new_profile = Profile(
        email=request.email,
        full_name=request.full_name,
        role=UserRole.CUSTOMER,
        preferred_language=request.preferred_language,
        preferred_currency=currency,
        password_hash=hashed_password
    )

    # Save to database
    created_profile = profile_repo.create(new_profile)

    # Generate tokens
    token_pair = jwt_handler.create_token_pair(
        user_id=created_profile.id,
        email=created_profile.email,
        role=created_profile.role.value
    )

    return TokenResponse(
        access_token=token_pair.access_token,
        refresh_token=token_pair.refresh_token,
        token_type=token_pair.token_type,
        expires_in=token_pair.expires_in
    )


@router.post("/login", response_model=TokenResponse)
def login(
    request: LoginRequest,
    profile_repo: AbstractProfileRepository = Depends(get_profile_repo)
):
    """
    Authenticate a user and return tokens.

    Validates email and password, then returns access and refresh tokens.
    """
    # Find user by email
    user = profile_repo.get_by_email(request.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Verify password
    if not user.password_hash or not password_handler.verify(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Update last login
    user.last_login_at = datetime.now(timezone.utc)
    profile_repo.update(user)

    # Generate tokens
    token_pair = jwt_handler.create_token_pair(
        user_id=user.id,
        email=user.email,
        role=user.role.value
    )

    return TokenResponse(
        access_token=token_pair.access_token,
        refresh_token=token_pair.refresh_token,
        token_type=token_pair.token_type,
        expires_in=token_pair.expires_in
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    request: RefreshRequest,
    profile_repo: AbstractProfileRepository = Depends(get_profile_repo)
):
    """
    Refresh an access token using a valid refresh token.

    Returns a new token pair if the refresh token is valid.
    """
    # Verify refresh token
    payload = jwt_handler.verify_refresh_token(request.refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Verify user still exists
    user = profile_repo.get_by_id(payload.sub)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Generate new token pair
    token_pair = jwt_handler.create_token_pair(
        user_id=user.id,
        email=user.email,
        role=user.role.value
    )

    return TokenResponse(
        access_token=token_pair.access_token,
        refresh_token=token_pair.refresh_token,
        token_type=token_pair.token_type,
        expires_in=token_pair.expires_in
    )


@router.post("/verify", response_model=VerifyResponse)
def verify_token(
    request: VerifyRequest,
    profile_repo: AbstractProfileRepository = Depends(get_profile_repo)
):
    """
    Verify a token and return user information if valid.

    Can be used to validate either access or refresh tokens.
    """
    # Try to verify as access token first
    payload = jwt_handler.verify_access_token(request.token)
    if not payload:
        # Try as refresh token
        payload = jwt_handler.verify_refresh_token(request.token)

    if not payload:
        return VerifyResponse(valid=False)

    # Get user info
    user = profile_repo.get_by_id(payload.sub)
    if not user:
        return VerifyResponse(valid=False)

    return VerifyResponse(
        valid=True,
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role.value,
            preferred_language=user.preferred_language,
            preferred_currency=user.preferred_currency.value if user.preferred_currency else "USD"
        )
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    authorization: str = Header(None, alias="Authorization"),
    profile_repo: AbstractProfileRepository = Depends(get_profile_repo)
):
    """
    Get information about the currently authenticated user.

    Requires a valid access token in the Authorization header.
    """
    # This endpoint uses the Authorization header directly
    # In production, use the get_current_user dependency
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

    user = profile_repo.get_by_id(payload.sub)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value,
        preferred_language=user.preferred_language,
        preferred_currency=user.preferred_currency.value if user.preferred_currency else "USD"
    )


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    request: PasswordChangeRequest,
    authorization: str = Header(None, alias="Authorization"),
    profile_repo: AbstractProfileRepository = Depends(get_profile_repo)
):
    """
    Change the current user's password.

    Requires valid current password and a new password.
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

    user = profile_repo.get_by_id(payload.sub)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Verify current password
    if not user.password_hash or not password_handler.verify(request.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    # Hash and update new password
    user.password_hash = password_handler.hash(request.new_password)
    profile_repo.update(user)
