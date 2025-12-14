import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/i18n-config';
import { getChapterBySlug } from '@/lib/supabase/ebooks';
import { hasEbookAccess } from '@/lib/supabase/server';
import { RichContentRenderer } from '@/components/ebook';

export const dynamic = 'force-dynamic';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, BookOpen, Home } from 'lucide-react';

export default async function ChapterReaderPage({
  params: { lang, slug, chapterSlug },
}: {
  params: { lang: Locale; slug: string; chapterSlug: string };
}) {
  const dict = await getDictionary(lang);

  // Fetch ebook and chapter from Supabase
  const result = await getChapterBySlug(slug, chapterSlug);

  if (!result || result.ebook.status !== 'active') {
    notFound();
  }

  const { ebook, chapter } = result;

  // Check if chapter is published
  if (!chapter.is_published) {
    notFound();
  }

  // Check user access via Supabase
  const hasAccess = await hasEbookAccess(ebook.id);

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
    <div className="min-h-screen bg-background" style={themeStyles}>
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              href={`/${lang}/ebooks/${slug}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">{ebookTitle}</span>
            </Link>

            <div className="flex items-center gap-2">
              {prevChapter && (
                <Link
                  href={`/${lang}/ebooks/${slug}/${prevChapter.slug}`}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title={lang === 'pt' ? 'Capítulo anterior' : 'Previous chapter'}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>
              )}
              <span className="text-sm text-muted-foreground px-2">
                {chapter.chapter_number} / {chapters.length}
              </span>
              {nextChapter && (hasAccess || nextChapter.is_free_preview) && (
                <Link
                  href={`/${lang}/ebooks/${slug}/${nextChapter.slug}`}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title={lang === 'pt' ? 'Próximo capítulo' : 'Next chapter'}
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Chapter Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <article className="max-w-3xl mx-auto">
          {/* Chapter Cover Image */}
          {chapter.cover_image_url && (
            <div className="mb-8 -mx-4 md:mx-0 md:rounded-xl overflow-hidden">
              <img
                src={chapter.cover_image_url}
                alt={chapterTitle}
                className="w-full h-48 md:h-64 object-cover"
              />
            </div>
          )}

          {/* Chapter Header */}
          <header className="mb-8 pb-8 border-b border-border">
            <p className="text-sm text-[var(--ebook-primary)] font-medium mb-2">
              {lang === 'pt' ? 'Capítulo' : 'Chapter'} {chapter.chapter_number}
            </p>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              {chapterTitle}
            </h1>
            {chapter.estimated_read_time_minutes > 0 && (
              <p className="mt-4 text-sm text-muted-foreground">
                {chapter.estimated_read_time_minutes} {lang === 'pt' ? 'min de leitura' : 'min read'}
              </p>
            )}
          </header>

          {/* Chapter Body */}
          <RichContentRenderer content={chapterContent || ''} />

          {/* Chapter Navigation */}
          <nav className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center justify-between gap-4">
              {prevChapter ? (
                <Link
                  href={`/${lang}/ebooks/${slug}/${prevChapter.slug}`}
                  className="flex-1 p-4 rounded-xl border border-border hover:border-[var(--ebook-primary)] hover:bg-muted/50 transition-all group"
                >
                  <p className="text-xs text-muted-foreground mb-1">
                    {lang === 'pt' ? 'Anterior' : 'Previous'}
                  </p>
                  <p className="font-semibold group-hover:text-[var(--ebook-primary)] transition-colors flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    {lang === 'pt' && prevChapter.title_pt ? prevChapter.title_pt : prevChapter.title_en}
                  </p>
                </Link>
              ) : (
                <div className="flex-1" />
              )}

              {nextChapter && (hasAccess || nextChapter.is_free_preview) ? (
                <Link
                  href={`/${lang}/ebooks/${slug}/${nextChapter.slug}`}
                  className="flex-1 p-4 rounded-xl border border-border hover:border-[var(--ebook-primary)] hover:bg-muted/50 transition-all group text-right"
                >
                  <p className="text-xs text-muted-foreground mb-1">
                    {lang === 'pt' ? 'Próximo' : 'Next'}
                  </p>
                  <p className="font-semibold group-hover:text-[var(--ebook-primary)] transition-colors flex items-center justify-end gap-2">
                    {lang === 'pt' && nextChapter.title_pt ? nextChapter.title_pt : nextChapter.title_en}
                    <ChevronRight className="w-4 h-4" />
                  </p>
                </Link>
              ) : nextChapter ? (
                <Link
                  href={`/${lang}/ebooks/${slug}`}
                  className="flex-1 p-4 rounded-xl border border-border bg-[var(--ebook-primary)]/10 text-right"
                >
                  <p className="text-xs text-muted-foreground mb-1">
                    {lang === 'pt' ? 'Continuar lendo?' : 'Continue reading?'}
                  </p>
                  <p className="font-semibold text-[var(--ebook-primary)]">
                    {lang === 'pt' ? 'Assinar para continuar' : 'Subscribe to continue'}
                  </p>
                </Link>
              ) : (
                <div className="flex-1" />
              )}
            </div>
          </nav>
        </article>
      </main>
    </div>
  );
}
