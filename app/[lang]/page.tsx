import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/i18n-config';
import AlphaGritLandingTemplate from '@/components/templates/AlphaGritLandingTemplate';
import { serverApiClient } from '@/lib/api-client-server';

// Define simple interfaces for the data types, ideally these would be imported from a shared types file.
interface Product {
  id: string;
  name: string;
  slug: string;
  price_brl: number;
  price_usd: number;
  status: string;
  is_featured: boolean;
  cover_image_url?: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  cover_image_url?: string;
  published_at?: string;
}

interface SiteConfigSetting {
  key: string;
  value: any;
  value_type: string;
  is_public: boolean;
}

interface FeatureFlag {
  key: string;
  is_enabled: boolean;
}

/**
 * AlphaGrit Home Page
 *
 * Main landing page using the AlphaGrit Landing Template.
 * All content is managed through i18n dictionaries and configuration files.
 * Dynamic data from the FastAPI backend is fetched here and passed down.
 *
 * Key Benefits:
 * - Component-based architecture
 * - Centralized design tokens
 * - i18n support (EN/PT)
 * - No visual changes from original design
 * - Reusable components for future pages
 * - Server-side data fetching for dynamic content
 */
export default async function Home({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  // Load internationalized static content
  const dict = await getDictionary(lang);

  // Fetch dynamic data from FastAPI backend
  let featuredProducts: Product[] = [];
  let recentBlogPosts: BlogPost[] = [];
  let siteSettings: SiteConfigSetting[] = [];
  let featureFlags: FeatureFlag[] = [];

  try {
    featuredProducts = await serverApiClient<Product[]>('/products/?is_featured=true');
  } catch (error) {
    console.error('Error fetching featured products:', error);
  }

  try {
    recentBlogPosts = await serverApiClient<BlogPost[]>('/content/blog-posts/?status=published');
  } catch (error) {
    console.error('Error fetching recent blog posts:', error);
  }

  try {
    siteSettings = await serverApiClient<SiteConfigSetting[]>('/content/site-config/');
  } catch (error) {
    console.error('Error fetching site settings:', error);
  }

  try {
    featureFlags = await serverApiClient<FeatureFlag[]>('/content/feature-flags/');
  } catch (error) {
    console.error('Error fetching feature flags:', error);
  }

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
