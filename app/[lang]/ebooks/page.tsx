import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/i18n-config';
import { serverApiClient } from '@/lib/api-client-server';

export const dynamic = 'force-dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Clock, ChevronRight } from 'lucide-react';

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
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  description_short: string | null;
  cover_image_url: string | null;
  price_brl: number;
  price_usd: number;
  status: string;
}

interface EbookWithProduct extends EbookResponse {
  product?: ProductResponse;
}

export default async function EbooksCatalogPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);

  let ebooks: EbookWithProduct[] = [];

  try {
    // Fetch published ebooks
    const ebooksResponse = await serverApiClient<EbookResponse[]>('/ebooks/?status_filter=active');

    // Fetch product details for each ebook
    const productIds = ebooksResponse.map(e => e.product_id);
    const productsResponse = await serverApiClient<ProductResponse[]>('/products/products/?status=active');

    // Map products to ebooks
    ebooks = ebooksResponse.map(ebook => ({
      ...ebook,
      product: productsResponse.find(p => p.id === ebook.product_id)
    }));
  } catch (error) {
    console.error('Error fetching ebooks:', error);
  }

  const title = lang === 'pt' ? 'E-Books' : 'E-Books';
  const subtitle = lang === 'pt'
    ? 'Explore nossa coleção de e-books interativos'
    : 'Explore our collection of interactive e-books';

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
              {title}
            </h1>
            <p className="text-xl text-muted-foreground">
              {subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* E-books Grid */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        {ebooks.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {lang === 'pt' ? 'Nenhum e-book disponível' : 'No e-books available'}
            </h2>
            <p className="text-muted-foreground">
              {lang === 'pt'
                ? 'Novos e-books serão adicionados em breve.'
                : 'New e-books will be added soon.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {ebooks.map((ebook) => (
              <Link
                key={ebook.id}
                href={`/${lang}/ebooks/${ebook.product?.slug}`}
                className="group block bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg"
              >
                {/* Cover Image */}
                <div className="aspect-[3/4] relative bg-muted">
                  {ebook.product?.cover_image_url ? (
                    <Image
                      src={ebook.product.cover_image_url}
                      alt={ebook.product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {ebook.product?.name}
                  </h3>

                  {ebook.product?.description_short && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {ebook.product.description_short}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {ebook.total_chapters} {lang === 'pt' ? 'capítulos' : 'chapters'}
                      </span>
                      {ebook.estimated_read_time_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {ebook.estimated_read_time_minutes} min
                        </span>
                      )}
                    </div>

                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
