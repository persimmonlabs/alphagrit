import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/i18n-config';
import { getChapterBySlug } from '@/lib/supabase/ebooks';
import { hasEbookAccess } from '@/lib/supabase/server';
import { RichContentRenderer } from '@/components/ebook';

export const dynamic = 'force-dynamic';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, BookOpen, Home, Clock } from 'lucide-react';

export default async function ChapterReaderPage({
  params,
}: {
  params: { lang: Locale; slug: string; chapterSlug: string };
}) {
  // Safely extract params with fallbacks
  const lang = params?.lang || 'en';
  const slug = params?.slug || '';
  const chapterSlug = params?.chapterSlug || '';

  // Load dictionary with error handling
  try {
    await getDictionary(lang);
  } catch (error) {
    console.error('[Chapter Reader] Failed to load dictionary:', error);
  }

  // Fetch ebook and chapter from Supabase with error handling
  let result = null;
  try {
    result = await getChapterBySlug(slug, chapterSlug);
  } catch (error) {
    console.error('[Chapter Reader] Failed to fetch chapter:', error);
    notFound();
  }

  if (!result || result.ebook.status !== 'active') {
    notFound();
  }

  const { ebook, chapter } = result;

  // Check if chapter is published
  if (!chapter.is_published) {
    notFound();
  }

  // Check user access via Supabase with error handling
  let hasAccess = false;
  try {
    hasAccess = await hasEbookAccess(ebook.id);
  } catch (error) {
    console.error('[Chapter Reader] Failed to check access:', error);
  }

  // If no access and not a free preview chapter, redirect to subscription page
  if (!hasAccess && !chapter.is_free_preview) {
    redirect(`/${lang}/ebooks/${slug}`);
  }

  // Get all published chapters for navigation
  const chapters = ebook.chapters || [];
  const currentIndex = chapters.findIndex(ch => ch.id === chapter.id);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  // Get localized content
  const ebookTitle = lang === 'pt' && ebook.title_pt ? ebook.title_pt : ebook.title_en;
  const chapterTitle = lang === 'pt' && chapter.title_pt ? chapter.title_pt : chapter.title_en;
  const chapterContent = lang === 'pt' && chapter.content_pt ? chapter.content_pt : chapter.content_en;

  const themeStyles = {
    '--ebook-primary': '#f97316',
    '--ebook-accent': '#ef4444',
  } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-background scroll-smooth" style={themeStyles}>
      {/* Top Navigation - Compact & Mobile-Optimized */}
      <header className="sticky top-0 z-40 bg-background/98 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-2.5 md:py-3">
          <div className="flex items-center justify-between gap-3">
            <Link
              href={`/${lang}/ebooks/${slug}`}
              className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors min-w-0 flex-shrink"
            >
              <Home className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">{ebookTitle}</span>
            </Link>

            <div className="flex items-center gap-1 md:gap-2">
              {prevChapter && (
                <Link
                  href={`/${lang}/ebooks/${slug}/${prevChapter.slug}`}
                  className="p-2 hover:bg-muted transition-colors touch-target"
                  title={lang === 'pt' ? 'Capítulo anterior' : 'Previous chapter'}
                  aria-label={lang === 'pt' ? 'Capítulo anterior' : 'Previous chapter'}
                >
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                </Link>
              )}
              <span className="text-xs md:text-sm text-muted-foreground px-1.5 md:px-2 font-medium tabular-nums">
                {chapter.chapter_number} / {chapters.length}
              </span>
              {nextChapter && (hasAccess || nextChapter.is_free_preview) && (
                <Link
                  href={`/${lang}/ebooks/${slug}/${nextChapter.slug}`}
                  className="p-2 hover:bg-muted transition-colors touch-target"
                  title={lang === 'pt' ? 'Próximo capítulo' : 'Next chapter'}
                  aria-label={lang === 'pt' ? 'Próximo capítulo' : 'Next chapter'}
                >
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Reading Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-border">
          <div
            className="h-full bg-primary transition-all duration-150"
            style={{
              width: `${((chapter.chapter_number - 1) / chapters.length) * 100}%`
            }}
          />
        </div>
      </header>

      {/* Chapter Content */}
      <main className="container mx-auto px-4 py-6 md:py-10 lg:py-12">
        <article className="max-w-3xl mx-auto">
          {/* Chapter Cover Image */}
          {chapter.cover_image_url && (
            <div className="mb-8 md:mb-10 -mx-4 md:mx-0 md:rounded-lg overflow-hidden shadow-lg">
              <img
                src={chapter.cover_image_url}
                alt={chapterTitle}
                className="w-full h-48 md:h-64 lg:h-80 object-cover"
              />
            </div>
          )}

          {/* Chapter Header */}
          <header className="mb-8 md:mb-10 pb-6 md:pb-8 border-b border-border">
            <p className="text-xs md:text-sm text-[var(--ebook-primary)] font-semibold mb-2 md:mb-3 uppercase tracking-wide">
              {lang === 'pt' ? 'Capítulo' : 'Chapter'} {chapter.chapter_number}
            </p>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground leading-tight mb-0">
              {chapterTitle}
            </h1>
            {chapter.estimated_read_time_minutes > 0 && (
              <p className="mt-3 md:mt-4 text-xs md:text-sm text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>{chapter.estimated_read_time_minutes} {lang === 'pt' ? 'min de leitura' : 'min read'}</span>
              </p>
            )}
          </header>

          {/* Chapter Body */}
          <RichContentRenderer content={chapterContent || ''} />

          {/* Chapter Navigation */}
          <nav className="mt-12 md:mt-16 pt-8 border-t border-border">
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {prevChapter ? (
                <Link
                  href={`/${lang}/ebooks/${slug}/${prevChapter.slug}`}
                  className="p-3 md:p-4 border border-border hover:border-[var(--ebook-primary)]/60 hover:bg-muted/30 transition-all group"
                >
                  <p className="text-xs text-muted-foreground mb-1 md:mb-1.5">
                    {lang === 'pt' ? 'Anterior' : 'Previous'}
                  </p>
                  <p className="text-xs md:text-sm font-semibold group-hover:text-[var(--ebook-primary)] transition-colors flex items-center gap-2 line-clamp-2 leading-snug">
                    <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                    <span>{lang === 'pt' && prevChapter.title_pt ? prevChapter.title_pt : prevChapter.title_en}</span>
                  </p>
                </Link>
              ) : (
                <div />
              )}

              {nextChapter && (hasAccess || nextChapter.is_free_preview) ? (
                <Link
                  href={`/${lang}/ebooks/${slug}/${nextChapter.slug}`}
                  className="p-3 md:p-4 border border-border hover:border-[var(--ebook-primary)]/60 hover:bg-muted/30 transition-all group text-right col-start-2"
                >
                  <p className="text-xs text-muted-foreground mb-1 md:mb-1.5">
                    {lang === 'pt' ? 'Próximo' : 'Next'}
                  </p>
                  <p className="text-xs md:text-sm font-semibold group-hover:text-[var(--ebook-primary)] transition-colors flex items-center justify-end gap-2 line-clamp-2 leading-snug">
                    <span>{lang === 'pt' && nextChapter.title_pt ? nextChapter.title_pt : nextChapter.title_en}</span>
                    <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                  </p>
                </Link>
              ) : nextChapter ? (
                <Link
                  href={`/${lang}/ebooks/${slug}`}
                  className="p-3 md:p-4 border border-[var(--ebook-primary)]/30 bg-[var(--ebook-primary)]/5 hover:bg-[var(--ebook-primary)]/10 transition-all text-right col-start-2"
                >
                  <p className="text-xs text-muted-foreground mb-1">
                    {lang === 'pt' ? 'Continuar lendo?' : 'Continue reading?'}
                  </p>
                  <p className="text-xs md:text-sm font-semibold text-[var(--ebook-primary)]">
                    {lang === 'pt' ? 'Assinar para continuar' : 'Subscribe to continue'}
                  </p>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </nav>
        </article>
      </main>
    </div>
  );
}
