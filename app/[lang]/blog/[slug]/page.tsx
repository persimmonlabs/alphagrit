import type { Locale } from '@/i18n-config';
import { redirect } from 'next/navigation';

// Blog posts are not available yet - redirect to blog index
export default function BlogPostPage({
  params: { lang, slug },
}: {
  params: { lang: Locale; slug: string };
}) {
  redirect(`/${lang}/blog`);
}
