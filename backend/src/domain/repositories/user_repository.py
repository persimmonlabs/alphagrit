from abc import ABC, abstractmethod
from typing import Optional, List
from src.domain.entities.user import Profile, UserRole

class AbstractProfileRepository(ABC):
    @abstractmethod
    def get_by_id(self, profile_id: str) -> Optional[Profile]:
        pass

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[Profile]:
        pass

    @abstractmethod
    def get_all(self, role: Optional[UserRole] = None) -> List[Profile]:
        pass

    @abstractmethod
    def save(self, profile: Profile) -> None:
        """Save (create or update) a profile."""
        pass

    def create(self, profile: Profile) -> Profile:
        """Create a new profile. Default implementation uses save()."""
        self.save(profile)
        return profile

    def update(self, profile: Profile) -> Profile:
        """Update an existing profile. Default implementation uses save()."""
        self.save(profile)
        return profile

    @abstractmethod
    def delete(self, profile_id: str) -> None:
        pass
