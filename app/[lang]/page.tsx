import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/i18n-config';
import AlphaGritLandingTemplate from '@/components/templates/AlphaGritLandingTemplate';
import { getEbooks } from '@/lib/supabase/ebooks';

export const dynamic = 'force-dynamic';

/**
 * AlphaGrit Home Page
 *
 * Main landing page using the AlphaGrit Landing Template.
 * Fetches ebooks from Supabase.
 */
export default async function Home({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  // Load internationalized static content
  const dict = await getDictionary(lang);

  // Fetch ebooks from Supabase
  let featuredProducts: any[] = [];

  try {
    const ebooks = await getEbooks();
    // Transform Supabase ebooks to the format expected by FeaturedProduct
    featuredProducts = ebooks.slice(0, 3).map(ebook => ({
      id: ebook.id,
      name: lang === 'pt' && ebook.title_pt ? ebook.title_pt : ebook.title_en,
      slug: ebook.slug,
      price_brl: ebook.price_brl || 0,
      price_usd: ebook.price_usd || 0,
      status: ebook.status,
      is_featured: true,
      cover_image_url: ebook.cover_image_url,
      description: lang === 'pt' && ebook.description_pt ? ebook.description_pt : ebook.description_en,
      chapters_count: ebook.chapters?.length || 0,
    }));
  } catch (error) {
    console.error('Error fetching ebooks:', error);
  }

  // Empty arrays for features we don't use yet
  const recentBlogPosts: any[] = [];
  const siteSettings: any[] = [];
  const featureFlags: any[] = [];

  return (
    <AlphaGritLandingTemplate
      content={dict}
      lang={lang}
      featuredProducts={featuredProducts}
      recentBlogPosts={recentBlogPosts}
      siteSettings={siteSettings}
      featureFlags={featureFlags}
    />
  );
}
