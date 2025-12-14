import { redirect } from 'next/navigation';
import type { Locale } from '@/i18n-config';

export const dynamic = 'force-dynamic';

// Redirect old profile URL to new account page
export default function ProfilePage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  redirect(`/${lang}/account`);
}
