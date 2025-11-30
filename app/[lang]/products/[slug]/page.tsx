import type { Locale } from '@/i18n-config';
import { redirect } from 'next/navigation';

// Products page redirects to ebooks - we only sell ebooks
export default function ProductDetailPage({
  params: { lang, slug },
}: {
  params: { lang: Locale; slug: string };
}) {
  // Try to redirect to the ebook with the same slug
  redirect(`/${lang}/ebooks/${slug}`);
}
