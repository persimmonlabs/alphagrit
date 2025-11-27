from sqlalchemy import Column, String, Float, Boolean, DateTime, Integer, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship, joinedload
from sqlalchemy.sql import func
import uuid
from typing import Optional, List

from src.domain.entities.user import Profile, UserRole, CurrencyType
from src.domain.repositories.user_repository import AbstractProfileRepository
from src.infrastructure.base import Base # Import Base from your dedicated base setup # Import Base from your database setup
from sqlalchemy.orm import Session


# SQLAlchemy ORM Models
class ProfileORM(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), nullable=False, unique=True)
    full_name = Column(String(255), nullable=True)
    avatar_url = Column(Text, nullable=True)
    role = Column(SQLEnum(UserRole, name="user_role", create_type=False), default=UserRole.CUSTOMER, nullable=False)
    preferred_language = Column(String(5), default="en", nullable=True)
    preferred_currency = Column(SQLEnum(CurrencyType, name="currency_type", create_type=False), default=CurrencyType.USD, nullable=True)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)

    def to_entity(self) -> Profile:
        return Profile(
            id=str(self.id),
            email=self.email,
            full_name=self.full_name,
            avatar_url=self.avatar_url,
            role=self.role,
            preferred_language=self.preferred_language,
            preferred_currency=self.preferred_currency,
            created_at=self.created_at,
            updated_at=self.updated_at
        )

    @staticmethod
    def from_entity(entity: Profile) -> 'ProfileORM':
        return ProfileORM(
            id=entity.id,
            email=entity.email,
            full_name=entity.full_name,
            avatar_url=entity.avatar_url,
            role=entity.role,
            preferred_language=entity.preferred_language,
            preferred_currency=entity.preferred_currency,
            created_at=entity.created_at,
            updated_at=entity.updated_at
        )


# SQLAlchemy Repository Implementations
class SQLAlchemyProfileRepository(AbstractProfileRepository):
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, profile_id: str) -> Optional[Profile]:
        orm_profile = self.session.query(ProfileORM).filter_by(id=profile_id).first()
        return orm_profile.to_entity() if orm_profile else None

    def get_by_email(self, email: str) -> Optional[Profile]:
        orm_profile = self.session.query(ProfileORM).filter_by(email=email).first()
        return orm_profile.to_entity() if orm_profile else None

    def get_all(self, role: Optional[UserRole] = None) -> List[Profile]:
        query = self.session.query(ProfileORM)
        if role:
            query = query.filter_by(role=role)
        return [orm_profile.to_entity() for orm_profile in query.all()]

    def save(self, profile: Profile) -> None:
        orm_profile = self.session.query(ProfileORM).filter_by(id=profile.id).first()
        if orm_profile:
            # Update existing scalar attributes
            for key, value in ProfileORM.from_entity(profile).__dict__.items():
                if not key.startswith('_'):
                    setattr(orm_profile, key, value)
        else:
            # Add new
            self.session.add(ProfileORM.from_entity(profile))
        self.session.commit()

    def delete(self, profile_id: str) -> None:
        orm_profile = self.session.query(ProfileORM).filter_by(id=profile_id).first()
        if orm_profile:
            self.session.delete(orm_profile)
            self.session.commit()
