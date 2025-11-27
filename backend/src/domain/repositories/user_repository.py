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
        pass

    @abstractmethod
    def delete(self, profile_id: str) -> None:
        pass
