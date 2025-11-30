import type { Locale } from '@/i18n-config';
import { redirect } from 'next/navigation';

// Products page redirects to ebooks - we only sell ebooks
export default function ProductsPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  redirect(`/${lang}/ebooks`);
}
