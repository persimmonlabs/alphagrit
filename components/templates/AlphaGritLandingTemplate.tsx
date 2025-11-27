'use client';

import React from 'react';
import AlphaGritNavigation from '@/components/organisms/AlphaGritNavigation';
import AlphaGritHero from '@/components/organisms/AlphaGritHero';
import TrinityCards from '@/components/organisms/TrinityCards';
import FeaturedProduct from '@/components/organisms/FeaturedProduct';
import RecentBlogPosts from '@/components/organisms/RecentBlogPosts'; // NEW IMPORT
import AlphaGritFooter from '@/components/organisms/AlphaGritFooter';
import { mergeLandingContent, LandingPageContent } from '@/config/landing-content';

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

interface AlphaGritLandingTemplateProps {
  content: Record<string, any>;
  lang: string;
  featuredProducts: Product[]; // New prop
  recentBlogPosts: BlogPost[]; // New prop
  siteSettings: SiteConfigSetting[]; // New prop
  featureFlags: FeatureFlag[]; // New prop
}

/**
 * AlphaGrit Landing Page Template
 *
 * Complete landing page composition using AlphaGrit-specific components.
 * Maintains the exact visual appearance of the original design while
 * eliminating hardcoded values and enabling full customization.
 *
 * Sections:
 * 1. Navigation (mix-blend-difference header)
 * 2. Hero (massive headline with CTAs)
 * 3. Trinity Cards (Body, Mind, Code)
 * 4. Featured Product (latest drop)
 * 5. Footer (minimal with social links)
 */
export default function AlphaGritLandingTemplate({
  content,
  lang,
  featuredProducts, // Destructure new prop
  recentBlogPosts,  // Destructure new prop
  siteSettings,     // Destructure new prop
  featureFlags,     // Destructure new prop
}: AlphaGritLandingTemplateProps) {
  // Merge i18n content with default structure, passing language for route building
  const landingContent: LandingPageContent = mergeLandingContent(content, lang);

  return (
    <div className="min-h-screen bg-black text-white font-body antialiased">
      {/* Navigation */}
      <AlphaGritNavigation
        content={landingContent.navigation}
        currentLang={lang}
      />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <AlphaGritHero content={landingContent.hero} siteSettings={siteSettings} featureFlags={featureFlags} />

        {/* Trinity Cards Section */}
        <TrinityCards content={landingContent.trinity} />

        {/* Featured Product Section */}
        <FeaturedProduct content={landingContent.featured} products={featuredProducts} />

        {/* Recent Blog Posts Section */}
        <RecentBlogPosts blogPosts={recentBlogPosts} content={landingContent} />
      </main>

      {/* Footer */}
      <AlphaGritFooter content={landingContent.footer} />
    </div>
  );
}
