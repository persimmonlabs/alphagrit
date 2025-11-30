import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/i18n-config';
import { getEbookBySlug } from '@/lib/sanity/queries';
import { urlFor } from '@/lib/sanity/client';
import { hasEbookAccess } from '@/lib/supabase/server';
import { BuyButton } from '@/components/ebook/BuyButton';

export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Clock, Lock, ChevronRight } from 'lucide-react';

export default async function EbookOverviewPage({
  params: { lang, slug },
}: {
  params: { lang: Locale; slug: string };
}) {
  const dict = await getDictionary(lang);

  // Fetch ebook from Sanity
  const ebook = await getEbookBySlug(slug);

  if (!ebook || ebook.status !== 'active') {
    notFound();
  }

  // Check user access via Supabase
  const hasAccess = await hasEbookAccess(ebook._id);

  // Get published chapters only
  const chapters = ebook.chapters?.filter(ch => ch.isPublished) || [];

  const themeStyles = {
    '--ebook-primary': ebook.themeConfig?.primaryColor || '#f97316',
    '--ebook-accent': ebook.themeConfig?.accentColor || '#ef4444',
  } as React.CSSProperties;

  const currency = lang === 'pt' ? 'BRL' : 'USD';
  const price = lang === 'pt' ? ebook.price_brl : ebook.price_usd;
  const priceFormatted = new Intl.NumberFormat(lang === 'pt' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency,
  }).format(price || 0);

  // Get localized content
  const title = lang === 'pt' && ebook.title.pt ? ebook.title.pt : ebook.title.en;
  const description = lang === 'pt' && ebook.description?.pt ? ebook.description.pt : ebook.description?.en;
  const coverImageUrl = ebook.coverImage ? urlFor(ebook.coverImage).width(600).height(800).url() : null;

  return (
    <div className="min-h-screen bg-background" style={themeStyles}>
      {/* Hero Section */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cover Image */}
            <div className="lg:col-span-1">
              <div className="aspect-[3/4] relative bg-muted rounded-xl overflow-hidden shadow-xl">
                {coverImageUrl ? (
                  <Image
                    src={coverImageUrl}
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
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                {title}
              </h1>

              {description && (
                <p className="text-lg text-muted-foreground mb-6">
                  {description}
                </p>
              )}

              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-8">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {chapters.length} {lang === 'pt' ? 'capítulos' : 'chapters'}
                </span>
                {ebook.estimatedReadTimeMinutes && (
                  <span className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {ebook.estimatedReadTimeMinutes} {lang === 'pt' ? 'min de leitura' : 'min read'}
                  </span>
                )}
              </div>

              <div className="mt-auto">
                {hasAccess ? (
                  <div className="flex flex-wrap gap-4">
                    <Link
                      href={`/${lang}/ebooks/${slug}/${chapters[0]?.slug.current || ''}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--ebook-primary)] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <BookOpen className="w-5 h-5" />
                      {lang === 'pt' ? 'Começar a ler' : 'Start reading'}
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-4">
                    <BuyButton
                      ebookId={ebook._id}
                      priceId={lang === 'pt' ? ebook.stripe_price_id_brl : ebook.stripe_price_id_usd}
                      currency={currency}
                      lang={lang}
                      priceFormatted={priceFormatted}
                    />
                    {chapters.some(ch => ch.isFreePreview) && (
                      <Link
                        href={`/${lang}/ebooks/${slug}/${chapters.find(ch => ch.isFreePreview)?.slug.current}`}
                        className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground font-semibold rounded-lg hover:bg-muted transition-colors"
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
      <section className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-8">
          {lang === 'pt' ? 'Sumário' : 'Table of Contents'}
        </h2>

        <div className="space-y-3">
          {chapters.map((chapter) => {
            const canAccess = hasAccess || chapter.isFreePreview;
            const chapterTitle = lang === 'pt' && chapter.title.pt ? chapter.title.pt : chapter.title.en;
            const chapterSummary = lang === 'pt' && chapter.summary?.pt ? chapter.summary.pt : chapter.summary?.en;

            return (
              <Link
                key={chapter._id}
                href={canAccess ? `/${lang}/ebooks/${slug}/${chapter.slug.current}` : '#'}
                className={`group block p-5 rounded-xl border transition-all ${
                  canAccess
                    ? 'border-border hover:border-[var(--ebook-primary)] hover:bg-muted/50'
                    : 'border-border/50 opacity-70 cursor-not-allowed'
                }`}
                onClick={!canAccess ? (e) => e.preventDefault() : undefined}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      canAccess
                        ? 'bg-[var(--ebook-primary)]/10 text-[var(--ebook-primary)]'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {canAccess ? chapter.chapterNumber : <Lock className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`font-semibold ${canAccess ? 'group-hover:text-[var(--ebook-primary)]' : ''} transition-colors`}>
                        {chapterTitle}
                      </h3>
                      {chapter.isFreePreview && !hasAccess && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-medium">
                          {lang === 'pt' ? 'Grátis' : 'Free'}
                        </span>
                      )}
                    </div>
                    {chapterSummary && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {chapterSummary}
                      </p>
                    )}
                    {chapter.estimatedReadTimeMinutes && (
                      <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {chapter.estimatedReadTimeMinutes} min
                      </p>
                    )}
                  </div>

                  <ChevronRight className={`w-5 h-5 flex-shrink-0 ${
                    canAccess
                      ? 'text-muted-foreground group-hover:text-[var(--ebook-primary)] group-hover:translate-x-1'
                      : 'text-muted-foreground/50'
                  } transition-all`} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
