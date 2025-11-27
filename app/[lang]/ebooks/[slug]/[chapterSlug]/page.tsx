import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/i18n-config';
import { serverApiClient } from '@/lib/api-client-server';

export const dynamic = 'force-dynamic';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { EbookReaderTemplate } from '@/components/templates/ebook/EbookReaderTemplate';
import {
  EbookResponse,
  EbookChapterResponse,
  EbookSectionResponse,
  EbookContentBlockResponse,
  EbookReadingProgressResponse,
  transformEbook,
  transformChapter,
  transformSection,
  transformBlock,
  transformReadingProgress,
} from '@/lib/ebook/types';

interface ProductResponse {
  id: string;
  name: string;
  slug: string;
}

interface AccessResponse {
  has_access: boolean;
  ebook_id: string;
  product_id: string;
}

export default async function ChapterReaderPage({
  params: { lang, slug, chapterSlug },
}: {
  params: { lang: Locale; slug: string; chapterSlug: string };
}) {
  const dict = await getDictionary(lang);

  // Get user ID from cookie (in production, use proper auth)
  const cookieStore = cookies();
  const userId = cookieStore.get('user_id')?.value;

  let product: ProductResponse | null = null;
  let ebook: EbookResponse | null = null;
  let chapters: EbookChapterResponse[] = [];
  let currentChapter: EbookChapterResponse | null = null;
  let sections: EbookSectionResponse[] = [];
  let hasAccess = false;
  let progress: EbookReadingProgressResponse | null = null;

  try {
    // Fetch product by slug
    const productsResponse = await serverApiClient<ProductResponse[]>(`/products/products/?slug=${slug}`);
    if (productsResponse.length === 0) {
      notFound();
    }
    product = productsResponse[0];

    // Fetch ebook by product ID
    ebook = await serverApiClient<EbookResponse>(`/ebooks/by-product/${product.id}`);

    // Fetch all chapters
    chapters = await serverApiClient<EbookChapterResponse[]>(`/ebooks/${ebook.id}/chapters?published_only=true`);

    // Find current chapter by slug
    currentChapter = chapters.find(ch => ch.slug === chapterSlug) || null;
    if (!currentChapter) {
      notFound();
    }

    // Check access
    if (userId) {
      try {
        const accessResponse = await serverApiClient<AccessResponse>(
          `/ebooks/${ebook.id}/access?user_id=${userId}`
        );
        hasAccess = accessResponse.has_access;
      } catch {
        hasAccess = false;
      }
    }

    // If no access and not a free preview chapter, redirect to purchase page
    if (!hasAccess && !currentChapter.is_free_preview) {
      redirect(`/${lang}/ebooks/${slug}`);
    }

    // Fetch sections with blocks for current chapter
    const sectionsResponse = await serverApiClient<EbookSectionResponse[]>(
      `/ebooks/chapters/${currentChapter.id}/sections`
    );

    // Fetch blocks for each section
    sections = await Promise.all(
      sectionsResponse.map(async (section) => {
        const blocks = await serverApiClient<EbookContentBlockResponse[]>(
          `/ebooks/sections/${section.id}/blocks`
        );
        return { ...section, blocks } as EbookSectionResponse & { blocks: EbookContentBlockResponse[] };
      })
    );

    // Fetch reading progress if user is logged in and has access
    if (userId && hasAccess) {
      try {
        progress = await serverApiClient<EbookReadingProgressResponse>(
          `/ebooks/${ebook.id}/progress/${userId}`
        );
      } catch {
        progress = null;
      }
    }
  } catch (error) {
    console.error('Error fetching chapter:', error);
    notFound();
  }

  if (!product || !ebook || !currentChapter) {
    notFound();
  }

  // Transform API responses to frontend types
  const transformedEbook = transformEbook(ebook);
  const transformedChapters = chapters.map(transformChapter);
  const transformedCurrentChapter = transformChapter(currentChapter);
  const transformedSections = sections.map(section => {
    const transformed = transformSection(section);
    if ('blocks' in section && Array.isArray(section.blocks)) {
      transformed.blocks = section.blocks.map(transformBlock);
    }
    return transformed;
  });
  const transformedProgress = progress ? transformReadingProgress(progress) : null;

  return (
    <EbookReaderTemplate
      ebook={transformedEbook}
      chapters={transformedChapters}
      currentChapter={transformedCurrentChapter}
      sections={transformedSections}
      hasAccess={hasAccess}
      progress={transformedProgress}
      ebookSlug={slug}
      lang={lang}
    />
  );
}
