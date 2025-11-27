import unittest
from unittest.mock import Mock, ANY
from datetime import datetime, timedelta
from uuid import uuid4

from src.domain.entities.user import Profile, UserRole, CurrencyType
from src.domain.repositories.user_repository import AbstractProfileRepository
from src.application.services.user_profile_service import UserProfileService

class TestUserProfileService(unittest.TestCase):
    def setUp(self):
        self.mock_profile_repo: AbstractProfileRepository = Mock(spec=AbstractProfileRepository)
        self.service = UserProfileService(self.mock_profile_repo)

        self.test_email = "test@example.com"
        self.test_profile_id = str(uuid4())
        self.test_profile = Profile(
            id=self.test_profile_id, email=self.test_email, full_name="Test User",
            role=UserRole.CUSTOMER, preferred_language="en", preferred_currency=CurrencyType.USD
        )
        self.mock_profile_repo.get_by_id.return_value = self.test_profile
        self.mock_profile_repo.get_by_email.return_value = self.test_profile

    def test_create_profile_success(self):
        self.mock_profile_repo.get_by_email.return_value = None # No existing profile
        
        profile = self.service.create_profile(
            email="new@example.com", full_name="New User"
        )
        
        self.assertIsInstance(profile, Profile)
        self.assertEqual(profile.email, "new@example.com")
        self.assertEqual(profile.full_name, "New User")
        self.assertEqual(profile.role, UserRole.CUSTOMER)
        self.mock_profile_repo.save.assert_called_once_with(ANY)

    def test_create_profile_email_exists_raises_error(self):
        # Mock already set to return test_profile for test_email
        
        with self.assertRaises(ValueError, msg="Profile with email already exists."):
            self.service.create_profile(email=self.test_email, full_name="Existing User")
        self.mock_profile_repo.save.assert_not_called()

    def test_get_profile_by_id_success(self):
        profile = self.service.get_profile_by_id(self.test_profile_id)
        self.assertEqual(profile, self.test_profile)
        self.mock_profile_repo.get_by_id.assert_called_once_with(self.test_profile_id)

    def test_get_profile_by_email_success(self):
        profile = self.service.get_profile_by_email(self.test_email)
        self.assertEqual(profile, self.test_profile)
        self.mock_profile_repo.get_by_email.assert_called_once_with(self.test_email)

    def test_list_profiles_all(self):
        self.mock_profile_repo.get_all.return_value = [self.test_profile, Profile(email="other@example.com")]
        profiles = self.service.list_profiles()
        self.assertEqual(len(profiles), 2)
        self.mock_profile_repo.get_all.assert_called_once_with(role=None)

    def test_list_profiles_by_role(self):
        self.mock_profile_repo.get_all.return_value = [self.test_profile] # Test profile is CUSTOMER by default
        profiles = self.service.list_profiles(role=UserRole.CUSTOMER)
        self.assertEqual(len(profiles), 1)
        self.mock_profile_repo.get_all.assert_called_once_with(role=UserRole.CUSTOMER)

    def test_update_profile_success(self):
        original_profile = Profile(id=self.test_profile_id, email=self.test_email, full_name="Old Name", updated_at=datetime(2020, 1, 1))
        self.mock_profile_repo.get_by_id.return_value = original_profile
        self.mock_profile_repo.get_by_email.return_value = None # Ensure new email is unique if email is being updated

        updated_profile = self.service.update_profile(self.test_profile_id, full_name="New Name", preferred_language="fr")

        self.assertEqual(updated_profile.full_name, "New Name")
        self.assertEqual(updated_profile.preferred_language, "fr")
        self.mock_profile_repo.save.assert_called_once_with(original_profile)
        self.assertTrue(updated_profile.updated_at > datetime(2020, 1, 1))

    def test_update_profile_not_found_raises_error(self):
        self.mock_profile_repo.get_by_id.return_value = None
        with self.assertRaises(ValueError, msg="Profile with ID not found."):
            self.service.update_profile(str(uuid4()), full_name="Non Existent")
        self.mock_profile_repo.save.assert_not_called()
    
    def test_update_profile_change_to_existing_email_raises_error(self):
        profile_to_update = Profile(id=str(uuid4()), email="unique@example.com", full_name="User A")
        self.mock_profile_repo.get_by_id.return_value = profile_to_update
        self.mock_profile_repo.get_by_email.side_effect = \
            lambda email: profile_to_update if email == "unique@example.com" else self.test_profile # mock returns self.test_profile for self.test_email

        with self.assertRaises(ValueError, msg="Profile with email already exists."):
            self.service.update_profile(profile_to_update.id, email=self.test_email) # Try to change to existing email
        self.mock_profile_repo.save.assert_not_called()

    def test_delete_profile_success(self):
        profile_id = str(uuid4())
        self.mock_profile_repo.get_by_id.return_value = Profile(id=profile_id, email="delete@example.com")

        self.service.delete_profile(profile_id)
        self.mock_profile_repo.delete.assert_called_once_with(profile_id)

    def test_delete_profile_not_found_raises_error(self):
        self.mock_profile_repo.get_by_id.return_value = None
        with self.assertRaises(ValueError, msg="Profile with ID not found."):
            self.service.delete_profile(str(uuid4()))
        self.mock_profile_repo.delete.assert_not_called()
