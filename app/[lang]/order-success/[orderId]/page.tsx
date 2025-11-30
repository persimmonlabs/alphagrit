import type { Locale } from '@/i18n-config';
import { redirect } from 'next/navigation';

// Order success now redirects to dashboard - purchases are shown there
export default function OrderSuccessPage({
  params: { lang, orderId },
}: {
  params: { lang: Locale; orderId: string };
}) {
  redirect(`/${lang}/dashboard?success=purchase`);
}
