from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from src.api.v1.schemas import ProfileResponse, ProfileCreate, ProfileUpdate
from src.api.v1.dependencies import get_user_profile_service
from src.application.services.user_profile_service import UserProfileService
from src.domain.entities.user import UserRole

router = APIRouter()

# --- User Profile Endpoints ---
@router.post("/users/", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
def create_user_profile(
    profile_data: ProfileCreate,
    service: UserProfileService = Depends(get_user_profile_service)
):
    try:
        profile = service.create_profile(**profile_data.model_dump())
        return ProfileResponse.model_validate(profile)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/users/", response_model=List[ProfileResponse])
def list_user_profiles(
    role: Optional[UserRole] = None,
    service: UserProfileService = Depends(get_user_profile_service)
):
    profiles = service.list_profiles(role=role)
    return [ProfileResponse.model_validate(p) for p in profiles]

@router.get("/users/{profile_id}", response_model=ProfileResponse)
def get_user_profile(
    profile_id: str,
    service: UserProfileService = Depends(get_user_profile_service)
):
    profile = service.get_profile_by_id(profile_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")
    return ProfileResponse.model_validate(profile)

@router.patch("/users/{profile_id}", response_model=ProfileResponse)
def update_user_profile(
    profile_id: str,
    profile_data: ProfileUpdate,
    service: UserProfileService = Depends(get_user_profile_service)
):
    try:
        update_data = {k: v for k, v in profile_data.model_dump(exclude_unset=True).items()}
        profile = service.update_profile(profile_id, **update_data)
        return ProfileResponse.model_validate(profile)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")

@router.delete("/users/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_profile(
    profile_id: str,
    service: UserProfileService = Depends(get_user_profile_service)
):
    try:
        service.delete_profile(profile_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")
