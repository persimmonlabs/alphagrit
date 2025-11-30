import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/i18n-config';
import { getChapterBySlug } from '@/lib/sanity/queries';
import { hasEbookAccess } from '@/lib/supabase/server';
import {
  transformEbook,
  transformChapter,
  transformChapterWithSections,
} from '@/lib/sanity/transformers';

export const dynamic = 'force-dynamic';
import { notFound, redirect } from 'next/navigation';
import { EbookReaderTemplate } from '@/components/templates/ebook/EbookReaderTemplate';

export default async function ChapterReaderPage({
  params: { lang, slug, chapterSlug },
}: {
  params: { lang: Locale; slug: string; chapterSlug: string };
}) {
  const dict = await getDictionary(lang);

  // Fetch ebook and chapter from Sanity
  const result = await getChapterBySlug(slug, chapterSlug);

  if (!result || result.ebook.status !== 'active') {
    notFound();
  }

  const { ebook, chapter } = result;

  // Check if chapter is published
  if (!chapter.isPublished) {
    notFound();
  }

  // Check user access via Supabase
  const hasAccess = await hasEbookAccess(ebook._id);

  // If no access and not a free preview chapter, redirect to purchase page
  if (!hasAccess && !chapter.isFreePreview) {
    redirect(`/${lang}/ebooks/${slug}`);
  }

  // Transform Sanity data to frontend types
  const transformedEbook = transformEbook(ebook);
  const transformedChapters = (ebook.chapters || [])
    .filter(ch => ch.isPublished)
    .map(transformChapter);
  const transformedCurrentChapter = transformChapterWithSections(chapter);

  // Extract sections from the transformed chapter
  const sections = transformedCurrentChapter.sections || [];

  return (
    <EbookReaderTemplate
      ebook={transformedEbook}
      chapters={transformedChapters}
      currentChapter={transformedCurrentChapter}
      sections={sections}
      hasAccess={hasAccess}
      progress={null}
      ebookSlug={slug}
      lang={lang}
    />
  );
}
