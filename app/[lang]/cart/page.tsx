import type { Locale } from '@/i18n-config';
import { redirect } from 'next/navigation';

// Cart is not used for direct ebook purchases - redirect to ebooks
export default function CartPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  redirect(`/${lang}/ebooks`);
}
