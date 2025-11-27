import unittest
from datetime import datetime, timedelta
from uuid import uuid4

from src.domain.entities.user import Profile, UserRole, CurrencyType

class TestProfileEntity(unittest.TestCase):
    def test_profile_creation_valid(self):
        profile = Profile(email="test@example.com", full_name="Test User")
        self.assertIsNotNone(profile.id)
        self.assertEqual(profile.email, "test@example.com")
        self.assertEqual(profile.full_name, "Test User")
        self.assertEqual(profile.role, UserRole.CUSTOMER)
        self.assertEqual(profile.preferred_language, "en")
        self.assertEqual(profile.preferred_currency, CurrencyType.USD)
        self.assertLessEqual(datetime.now() - profile.created_at, timedelta(seconds=1))

    def test_profile_creation_empty_email_raises_error(self):
        with self.assertRaises(ValueError, msg="Email cannot be empty for a profile"):
            Profile(email="")

    def test_profile_creation_invalid_email_format_raises_error(self):
        with self.assertRaises(ValueError, msg="Invalid email format"):
            Profile(email="invalid-email")

    def test_make_admin(self):
        profile = Profile(email="test@example.com", updated_at=datetime(2020, 1, 1))
        self.assertEqual(profile.role, UserRole.CUSTOMER)
        
        old_updated_at = profile.updated_at # This will now be datetime(2020, 1, 1)
        profile.make_admin()
        
        self.assertEqual(profile.role, UserRole.ADMIN)
        self.assertTrue(profile.updated_at > old_updated_at)

    def test_update_profile_info(self):
        profile = Profile(email="test@example.com", full_name="Old Name", preferred_language="fr", updated_at=datetime(2020, 1, 1))
        old_updated_at = profile.updated_at
        
        profile.update_profile_info(full_name="New Name", preferred_currency=CurrencyType.BRL)
        
        self.assertEqual(profile.full_name, "New Name")
        self.assertEqual(profile.preferred_currency, CurrencyType.BRL)
        self.assertEqual(profile.preferred_language, "fr") # Should remain unchanged
        self.assertTrue(profile.updated_at > old_updated_at)

    def test_update_profile_info_none_values(self):
        profile = Profile(email="test@example.com", full_name="Old Name", avatar_url="old.png", updated_at=datetime(2020, 1, 1))
        old_updated_at = profile.updated_at
        
        profile.update_profile_info(full_name=None, avatar_url="new.png")
        
        self.assertEqual(profile.full_name, "Old Name") # Should remain unchanged
        self.assertEqual(profile.avatar_url, "new.png")
        self.assertTrue(profile.updated_at > old_updated_at)
