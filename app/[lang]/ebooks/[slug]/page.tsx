import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/i18n-config';
import { getEbookBySlug } from '@/lib/supabase/ebooks';
import { hasEbookAccess } from '@/lib/supabase/server';
import { BuyButton } from '@/components/ebook/BuyButton';
import SiteHeader from '@/components/organisms/SiteHeader';

export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Clock, Lock, ChevronRight } from 'lucide-react';

export default async function EbookOverviewPage({
  params,
}: {
  params: { lang: Locale; slug: string };
}) {
  // Safely extract params with fallbacks
  const lang = params?.lang || 'en';
  const slug = params?.slug || '';

  // Load dictionary with error handling
  try {
    await getDictionary(lang);
  } catch (error) {
    console.error('[Ebook Detail] Failed to load dictionary:', error);
  }

  // Fetch ebook from Supabase with error handling
  let ebook = null;
  try {
    ebook = await getEbookBySlug(slug);
  } catch (error) {
    console.error('[Ebook Detail] Failed to fetch ebook:', error);
    notFound();
  }

  if (!ebook || ebook.status !== 'active') {
    notFound();
  }

  // Check user access via Supabase with error handling
  let hasAccess = false;
  try {
    hasAccess = await hasEbookAccess(ebook.id);
  } catch (error) {
    console.error('[Ebook Detail] Failed to check access:', error);
  }

  // Get published chapters only
  const chapters = ebook.chapters || [];

  const themeStyles = {
    '--ebook-primary': '#f97316',
    '--ebook-accent': '#ef4444',
  } as React.CSSProperties;

  // Get localized content
  const title = lang === 'pt' && ebook.title_pt ? ebook.title_pt : ebook.title_en;
  const description = lang === 'pt' && ebook.description_pt ? ebook.description_pt : ebook.description_en;

  return (
    <div className="min-h-screen bg-background" style={themeStyles}>
      <SiteHeader lang={lang} />

      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-neutral-900 to-background">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
            {/* Cover Image */}
            <div className="lg:col-span-1">
              <div className="aspect-[3/4] relative bg-muted rounded-xl overflow-hidden shadow-xl">
                {ebook.cover_image_url ? (
                  <Image
                    src={ebook.cover_image_url}
                    alt={title}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-20 h-20 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="lg:col-span-2 flex flex-col">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-foreground mb-3 md:mb-4">
                {title}
              </h1>

              {description && (
                <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6">
                  {description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 md:gap-6 text-sm text-muted-foreground mb-6 md:mb-8">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {chapters.length} {lang === 'pt' ? 'capítulos' : 'chapters'}
                </span>
                {ebook.estimated_read_time_minutes > 0 && (
                  <span className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {ebook.estimated_read_time_minutes} {lang === 'pt' ? 'min de leitura' : 'min read'}
                  </span>
                )}
              </div>

              <div className="mt-auto">
                {hasAccess ? (
                  <div className="flex flex-wrap gap-4">
                    <Link
                      href={`/${lang}/ebooks/${slug}/${chapters[0]?.slug || ''}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 bg-[var(--ebook-primary)] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm md:text-base"
                    >
                      <BookOpen className="w-5 h-5" />
                      {lang === 'pt' ? 'Começar a ler' : 'Start reading'}
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-4">
                    <BuyButton
                      lang={lang}
                      hasSubscription={hasAccess}
                    />
                    {chapters.some(ch => ch.is_free_preview) && (
                      <Link
                        href={`/${lang}/ebooks/${slug}/${chapters.find(ch => ch.is_free_preview)?.slug}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 border border-border text-foreground font-semibold rounded-lg hover:bg-muted transition-colors text-sm md:text-base"
                      >
                        {lang === 'pt' ? 'Ler amostra grátis' : 'Read free preview'}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-foreground mb-6 md:mb-8">
          {lang === 'pt' ? 'Sumário' : 'Table of Contents'}
        </h2>

        <div className="space-y-2 md:space-y-3">
          {chapters.map((chapter) => {
            const canAccess = hasAccess || chapter.is_free_preview;
            const chapterTitle = lang === 'pt' && chapter.title_pt ? chapter.title_pt : chapter.title_en;
            const chapterSummary = lang === 'pt' && chapter.summary_pt ? chapter.summary_pt : chapter.summary_en;

            const chapterContent = (
              <div className="flex items-start gap-3 md:gap-4">
                <div
                  className={`flex-shrink-0 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center text-sm md:text-base font-bold ${
                    canAccess
                      ? 'text-[var(--ebook-primary)]'
                      : 'text-muted-foreground/40'
                  }`}
                >
                  {canAccess ? chapter.chapter_number : <Lock className="w-4 h-4 md:w-4.5 md:h-4.5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 md:gap-2.5 mb-1">
                    <h3 className={`text-sm md:text-base lg:text-lg font-semibold leading-snug ${canAccess ? 'group-hover:text-[var(--ebook-primary)]' : 'text-muted-foreground/70'} transition-colors`}>
                      {chapterTitle}
                    </h3>
                    {chapter.is_free_preview && !hasAccess && (
                      <span className="text-[10px] md:text-xs px-2 py-0.5 bg-green-500/10 text-green-500 font-semibold uppercase tracking-wide flex-shrink-0">
                        {lang === 'pt' ? 'Free' : 'Free'}
                      </span>
                    )}
                  </div>
                  {chapterSummary && (
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-2">
                      {chapterSummary}
                    </p>
                  )}
                  {chapter.estimated_read_time_minutes > 0 && (
                    <p className="text-xs text-muted-foreground/70 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>{chapter.estimated_read_time_minutes} min</span>
                    </p>
                  )}
                </div>

                {canAccess && (
                  <ChevronRight className="w-5 h-5 flex-shrink-0 text-muted-foreground group-hover:text-[var(--ebook-primary)] group-hover:translate-x-0.5 transition-all" />
                )}
              </div>
            );

            // Render as Link only if user can access, otherwise render as div
            if (canAccess) {
              return (
                <Link
                  key={chapter.id}
                  href={`/${lang}/ebooks/${slug}/${chapter.slug}`}
                  className="group block p-4 md:p-5 border border-border hover:border-[var(--ebook-primary)]/60 hover:bg-muted/30 transition-all"
                >
                  {chapterContent}
                </Link>
              );
            }

            return (
              <div
                key={chapter.id}
                className="block p-4 md:p-5 border border-border/40 opacity-50 cursor-not-allowed"
              >
                {chapterContent}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
