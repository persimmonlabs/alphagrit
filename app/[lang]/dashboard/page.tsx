import { redirect } from 'next/navigation';
import type { Locale } from '@/i18n-config';

export const dynamic = 'force-dynamic';

// Redirect old dashboard URL to new account page
export default function DashboardPage({
  params: { lang },
  searchParams,
}: {
  params: { lang: Locale };
  searchParams: { success?: string };
}) {
  const successParam = searchParams.success ? `?success=${searchParams.success}` : '';
  redirect(`/${lang}/account${successParam}`);
}
