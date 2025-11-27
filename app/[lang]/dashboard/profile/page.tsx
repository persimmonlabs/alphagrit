import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/i18n-config';
import { serverApiClient } from '@/lib/api-client-server';
import UserProfileTemplate from '@/components/templates/UserProfileTemplate';
import { notFound } from 'next/navigation';

// Define interface for API data
interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  preferred_language?: string;
  preferred_currency?: string;
}

export default async function UserProfilePage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);

  // TODO: Replace with actual user ID from authentication context
  const userId = 'test_user_id';

  let userProfile: UserProfile | null = null;

  try {
    userProfile = await serverApiClient<UserProfile>(`/users/${userId}`);
  } catch (error) {
    console.error(`Error fetching user profile for ID ${userId}:`, error);
    // If user profile not found, maybe redirect to login or show an error
    notFound(); 
  }

  return (
    <UserProfileTemplate
      content={dict}
      lang={lang}
      userProfile={userProfile}
    />
  );
}
