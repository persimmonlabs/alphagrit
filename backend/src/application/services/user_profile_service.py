from typing import Optional, List
from datetime import datetime
import uuid

from src.domain.entities.user import Profile, UserRole, CurrencyType
from src.domain.repositories.user_repository import AbstractProfileRepository

class UserProfileService:
    def __init__(self, profile_repo: AbstractProfileRepository):
        self.profile_repo = profile_repo

    def create_profile(
        self,
        email: str,
        full_name: Optional[str] = None,
        avatar_url: Optional[str] = None,
        role: UserRole = UserRole.CUSTOMER,
        preferred_language: str = "en",
        preferred_currency: CurrencyType = CurrencyType.USD
    ) -> Profile:
        if self.profile_repo.get_by_email(email):
            raise ValueError(f"Profile with email {email} already exists.")
        
        new_profile = Profile(
            email=email,
            full_name=full_name,
            avatar_url=avatar_url,
            role=role,
            preferred_language=preferred_language,
            preferred_currency=preferred_currency
        )
        self.profile_repo.save(new_profile)
        return new_profile

    def get_profile_by_id(self, profile_id: str) -> Optional[Profile]:
        return self.profile_repo.get_by_id(profile_id)

    def get_profile_by_email(self, email: str) -> Optional[Profile]:
        return self.profile_repo.get_by_email(email)

    def list_profiles(self, role: Optional[UserRole] = None) -> List[Profile]:
        return self.profile_repo.get_all(role=role)

    def update_profile(self, profile_id: str, **kwargs) -> Profile:
        profile = self.profile_repo.get_by_id(profile_id)
        if not profile:
            raise ValueError(f"Profile with ID {profile_id} not found.")
        
        # Prevent changing email through update, or handle it with specific logic
        if 'email' in kwargs and kwargs['email'] != profile.email:
            if self.profile_repo.get_by_email(kwargs['email']):
                raise ValueError(f"Profile with email {kwargs['email']} already exists.")
        
        for key, value in kwargs.items():
            if hasattr(profile, key) and key != 'id' and key != 'created_at': # Don't update ID or creation date
                # Handle Enum conversion if updating role or currency
                if key == 'role' and isinstance(value, str):
                    value = UserRole(value)
                elif key == 'preferred_currency' and isinstance(value, str):
                    value = CurrencyType(value)
                setattr(profile, key, value)
        
        profile.updated_at = datetime.now()
        self.profile_repo.save(profile)
        return profile

    def delete_profile(self, profile_id: str) -> None:
        if not self.profile_repo.get_by_id(profile_id):
            raise ValueError(f"Profile with ID {profile_id} not found.")
        self.profile_repo.delete(profile_id)
