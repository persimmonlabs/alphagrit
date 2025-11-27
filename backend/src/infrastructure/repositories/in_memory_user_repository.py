from typing import Optional, List, Dict
from src.domain.repositories.user_repository import AbstractProfileRepository
from src.domain.entities.user import Profile, UserRole

class InMemoryProfileRepository(AbstractProfileRepository):
    def __init__(self, initial_profiles: Optional[List[Profile]] = None):
        self._profiles: Dict[str, Profile] = {}
        if initial_profiles:
            for profile in initial_profiles:
                self._profiles[profile.id] = profile

    def get_by_id(self, profile_id: str) -> Optional[Profile]:
        return self._profiles.get(profile_id)

    def get_by_email(self, email: str) -> Optional[Profile]:
        return next((p for p in self._profiles.values() if p.email == email), None)

    def get_all(self, role: Optional[UserRole] = None) -> List[Profile]:
        if role:
            return [p for p in self._profiles.values() if p.role == role]
        return list(self._profiles.values())

    def save(self, profile: Profile) -> None:
        self._profiles[profile.id] = profile

    def delete(self, profile_id: str) -> None:
        if profile_id in self._profiles:
            del self._profiles[profile_id]
