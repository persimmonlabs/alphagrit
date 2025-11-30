import type { Locale } from '@/i18n-config';
import { redirect } from 'next/navigation';

// Checkout is not used - we use direct Stripe checkout from ebook page
// Redirect to ebooks
export default function CheckoutPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  redirect(`/${lang}/ebooks`);
}
