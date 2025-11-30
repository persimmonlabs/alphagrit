import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/i18n-config';
import AlphaGritLandingTemplate from '@/components/templates/AlphaGritLandingTemplate';
import { getEbooks } from '@/lib/sanity/queries';
import { urlFor } from '@/lib/sanity/client';

export const dynamic = 'force-dynamic';

/**
 * AlphaGrit Home Page
 *
 * Main landing page using the AlphaGrit Landing Template.
 * Fetches ebooks from Sanity CMS.
 */
export default async function Home({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  // Load internationalized static content
  const dict = await getDictionary(lang);

  // Fetch ebooks from Sanity
  let featuredProducts: any[] = [];

  try {
    const ebooks = await getEbooks();
    // Transform Sanity ebooks to the format expected by FeaturedProduct
    featuredProducts = ebooks.slice(0, 3).map(ebook => ({
      id: ebook._id,
      name: lang === 'pt' && ebook.title.pt ? ebook.title.pt : ebook.title.en,
      slug: ebook.slug.current,
      price_brl: ebook.price_brl || 0,
      price_usd: ebook.price_usd || 0,
      status: ebook.status,
      is_featured: true,
      cover_image_url: ebook.coverImage ? urlFor(ebook.coverImage).width(400).height(533).url() : undefined,
      description: lang === 'pt' && ebook.description?.pt ? ebook.description.pt : ebook.description?.en,
      chapters_count: ebook.chapters?.filter(ch => ch.isPublished).length || 0,
    }));
  } catch (error) {
    console.error('Error fetching ebooks from Sanity:', error);
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
