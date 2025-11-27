"""
Auth endpoints - Stub implementation
All endpoints raise NotImplementedError until real auth is implemented.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class VerifyRequest(BaseModel):
    token: str


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest):
    """
    Login endpoint - stub implementation.
    Raises NotImplementedError until authentication system is implemented.
    """
    raise NotImplementedError(
        "Authentication system not yet implemented. "
        "Expected to handle user login and return JWT token."
    )


@router.post("/register", response_model=TokenResponse)
def register(request: RegisterRequest):
    """
    Register endpoint - stub implementation.
    Raises NotImplementedError until authentication system is implemented.
    """
    raise NotImplementedError(
        "Authentication system not yet implemented. "
        "Expected to create new user account and return JWT token."
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(token: str):
    """
    Refresh token endpoint - stub implementation.
    Raises NotImplementedError until authentication system is implemented.
    """
    raise NotImplementedError(
        "Authentication system not yet implemented. "
        "Expected to refresh JWT token."
    )


@router.post("/verify")
def verify_token(request: VerifyRequest):
    """
    Verify token endpoint - stub implementation.
    Raises NotImplementedError until authentication system is implemented.
    """
    raise NotImplementedError(
        "Authentication system not yet implemented. "
        "Expected to verify JWT token validity."
    )
