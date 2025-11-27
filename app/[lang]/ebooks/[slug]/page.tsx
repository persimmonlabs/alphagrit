import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/i18n-config';
import { serverApiClient } from '@/lib/api-client-server';

export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Clock, Lock, Check, ChevronRight, ShoppingCart } from 'lucide-react';
import { cookies } from 'next/headers';

interface EbookResponse {
  id: string;
  product_id: string;
  total_chapters: number;
  estimated_read_time_minutes: number | null;
  theme_config: {
    primaryColor: string;
    accentColor: string;
    fontFamily: string;
  } | null;
  status: string;
}

interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  description_short: string | null;
  description_full: string | null;
  cover_image_url: string | null;
  price_brl: number;
  price_usd: number;
}

interface ChapterResponse {
  id: string;
  ebook_id: string;
  chapter_number: number;
  display_order: number;
  title_en: string;
  title_pt: string | null;
  slug: string;
  summary_en: string | null;
  summary_pt: string | null;
  estimated_read_time_minutes: number | null;
  is_free_preview: boolean;
  is_published: boolean;
}

interface AccessResponse {
  has_access: boolean;
  ebook_id: string;
  product_id: string;
}

export default async function EbookOverviewPage({
  params: { lang, slug },
}: {
  params: { lang: Locale; slug: string };
}) {
  const dict = await getDictionary(lang);

  let product: ProductResponse | null = null;
  let ebook: EbookResponse | null = null;
  let chapters: ChapterResponse[] = [];
  let hasAccess = false;

  try {
    // Fetch product by slug
    const productsResponse = await serverApiClient<ProductResponse[]>(`/products/products/?slug=${slug}`);
    if (productsResponse.length === 0) {
      notFound();
    }
    product = productsResponse[0];

    // Fetch ebook by product ID
    const ebookResponse = await serverApiClient<EbookResponse>(`/ebooks/by-product/${product.id}`);
    ebook = ebookResponse;

    // Fetch chapters
    chapters = await serverApiClient<ChapterResponse[]>(`/ebooks/${ebook.id}/chapters?published_only=true`);

    // Check user access (mock user ID for now - would come from auth)
    // In production, get user ID from session/cookie
    const cookieStore = cookies();
    const userId = cookieStore.get('user_id')?.value;

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
  } catch (error) {
    console.error('Error fetching ebook:', error);
    notFound();
  }

  if (!product || !ebook) {
    notFound();
  }

  const themeStyles = {
    '--ebook-primary': ebook.theme_config?.primaryColor || '#f97316',
    '--ebook-accent': ebook.theme_config?.accentColor || '#ef4444',
  } as React.CSSProperties;

  const currency = lang === 'pt' ? 'BRL' : 'USD';
  const price = lang === 'pt' ? product.price_brl : product.price_usd;
  const priceFormatted = new Intl.NumberFormat(lang === 'pt' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency,
  }).format(price);

  return (
    <div className="min-h-screen bg-background" style={themeStyles}>
      {/* Hero Section */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cover Image */}
            <div className="lg:col-span-1">
              <div className="aspect-[3/4] relative bg-muted rounded-xl overflow-hidden shadow-xl">
                {product.cover_image_url ? (
                  <Image
                    src={product.cover_image_url}
                    alt={product.name}
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
                {product.name}
              </h1>

              {product.description_short && (
                <p className="text-lg text-muted-foreground mb-6">
                  {product.description_short}
                </p>
              )}

              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-8">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {ebook.total_chapters} {lang === 'pt' ? 'capítulos' : 'chapters'}
                </span>
                {ebook.estimated_read_time_minutes && (
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
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--ebook-primary)] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <BookOpen className="w-5 h-5" />
                      {lang === 'pt' ? 'Começar a ler' : 'Start reading'}
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-4">
                    <Link
                      href={`/${lang}/products/${slug}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--ebook-primary)] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {lang === 'pt' ? 'Comprar' : 'Buy now'} - {priceFormatted}
                    </Link>
                    {chapters.some(ch => ch.is_free_preview) && (
                      <Link
                        href={`/${lang}/ebooks/${slug}/${chapters.find(ch => ch.is_free_preview)?.slug}`}
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
            const canAccess = hasAccess || chapter.is_free_preview;
            const title = lang === 'pt' && chapter.title_pt ? chapter.title_pt : chapter.title_en;
            const summary = lang === 'pt' && chapter.summary_pt ? chapter.summary_pt : chapter.summary_en;

            return (
              <Link
                key={chapter.id}
                href={canAccess ? `/${lang}/ebooks/${slug}/${chapter.slug}` : `/${lang}/products/${slug}`}
                className={`group block p-5 rounded-xl border transition-all ${
                  canAccess
                    ? 'border-border hover:border-[var(--ebook-primary)] hover:bg-muted/50'
                    : 'border-border/50 opacity-70'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      canAccess
                        ? 'bg-[var(--ebook-primary)]/10 text-[var(--ebook-primary)]'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {canAccess ? chapter.chapter_number : <Lock className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`font-semibold ${canAccess ? 'group-hover:text-[var(--ebook-primary)]' : ''} transition-colors`}>
                        {title}
                      </h3>
                      {chapter.is_free_preview && !hasAccess && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-medium">
                          {lang === 'pt' ? 'Grátis' : 'Free'}
                        </span>
                      )}
                    </div>
                    {summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {summary}
                      </p>
                    )}
                    {chapter.estimated_read_time_minutes && (
                      <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {chapter.estimated_read_time_minutes} min
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

      {/* Full Description */}
      {product.description_full && (
        <section className="border-t border-border">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
              {lang === 'pt' ? 'Sobre este e-book' : 'About this e-book'}
            </h2>
            <div
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description_full }}
            />
          </div>
        </section>
      )}
    </div>
  );
}
