import unittest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from uuid import uuid4
from datetime import datetime, timedelta

from src.domain.entities.user import Profile, UserRole, CurrencyType
from src.infrastructure.database import Base
from src.infrastructure.repositories.sqlalchemy_user_repository import (
    SQLAlchemyProfileRepository,
    ProfileORM,
)


class TestSQLAlchemyProfileRepository(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)  # Create tables for all ORMs
        Session = sessionmaker(bind=self.engine)
        self.session = Session()

        self.profile_repo = SQLAlchemyProfileRepository(self.session)

    def tearDown(self):
        self.session.rollback()
        self.session.close()
        Base.metadata.drop_all(self.engine)

    def test_save_new_profile(self):
        profile = Profile(email="new@example.com", full_name="New User")
        self.profile_repo.save(profile)

        retrieved = self.profile_repo.get_by_id(profile.id)
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved.email, "new@example.com")
        self.assertEqual(retrieved.full_name, "New User")
        self.assertEqual(retrieved.role, UserRole.CUSTOMER)

    def test_update_existing_profile(self):
        profile = Profile(email="update@example.com", full_name="Old Name")
        self.profile_repo.save(profile)

        profile.full_name = "Updated Name"
        profile.role = UserRole.ADMIN
        self.profile_repo.save(profile)

        updated_profile = self.profile_repo.get_by_id(profile.id)
        self.assertEqual(updated_profile.full_name, "Updated Name")
        self.assertEqual(updated_profile.role, UserRole.ADMIN)

    def test_get_by_id(self):
        profile = Profile(email="specific@example.com", full_name="Specific User")
        self.profile_repo.save(profile)

        found_profile = self.profile_repo.get_by_id(profile.id)
        self.assertIsNotNone(found_profile)
        self.assertEqual(found_profile.id, profile.id)

    def test_get_by_email(self):
        profile = Profile(email="email@example.com", full_name="Email User")
        self.profile_repo.save(profile)

        found_profile = self.profile_repo.get_by_email("email@example.com")
        self.assertIsNotNone(found_profile)
        self.assertEqual(found_profile.email, "email@example.com")

    def test_get_all_profiles(self):
        profile1 = Profile(email="p1@example.com")
        profile2 = Profile(email="p2@example.com", role=UserRole.ADMIN)
        self.profile_repo.save(profile1)
        self.profile_repo.save(profile2)

        all_profiles = self.profile_repo.get_all()
        self.assertEqual(len(all_profiles), 2)

        admin_profiles = self.profile_repo.get_all(role=UserRole.ADMIN)
        self.assertEqual(len(admin_profiles), 1)
        self.assertEqual(admin_profiles[0].email, "p2@example.com")

    def test_delete_profile(self):
        profile = Profile(email="delete@example.com")
        self.profile_repo.save(profile)
        
        self.profile_repo.delete(profile.id)
        retrieved = self.profile_repo.get_by_id(profile.id)
        self.assertIsNone(retrieved)
