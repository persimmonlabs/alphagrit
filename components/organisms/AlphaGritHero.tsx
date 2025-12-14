'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { HeroContent } from '@/config/landing-content';
import alphaGritDesign from '@/config/design-config';
import designTokens from '@/lib/design-tokens';

// Define simple interfaces for the data types, ideally these would be imported from a shared types file.
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

interface AlphaGritHeroProps {
  content: HeroContent;
  siteSettings: SiteConfigSetting[]; // NEW PROP
  featureFlags: FeatureFlag[];       // NEW PROP
}

/**
 * AlphaGrit Hero Section
 *
 * Massive headline with two-line structure.
 * Preserves the ultra-tight line height and viewport-responsive sizing.
 * Can display dynamic site settings and feature flags.
 */
export default function AlphaGritHero({ content, siteSettings, featureFlags }: AlphaGritHeroProps) {
  const heroDesign = alphaGritDesign.components.hero;
  const buttonDesign = alphaGritDesign.components.button;

  // Example: Find a specific site setting or feature flag
  const holidaySaleFlag = featureFlags.find(flag => flag.key === 'HolidaySale');
  const showHolidaySaleBanner = holidaySaleFlag?.is_enabled;

  const bannerTextSetting = siteSettings.find(setting => setting.key === 'HomeBannerText'); // Assuming a key like 'HomeBannerText'
  const bannerText = bannerTextSetting?.value;

  return (
    <section
      className="flex flex-col items-center justify-center px-6 md:px-12 relative" // Added relative for banner positioning
      style={{
        minHeight: `calc(100vh - 4rem)`, // Full viewport minus sticky header height
      }}
    >
      {/* Optional: Holiday Sale Banner */}
      {showHolidaySaleBanner && (
        <div className="absolute top-0 left-0 w-full bg-red-600 text-white p-2 text-center text-sm font-bold z-10">
          {bannerText || "Holiday Sale is ON! Shop Now!"}
        </div>
      )}

      <div
        className="w-full flex flex-col items-center text-center"
        style={{ maxWidth: designTokens.layout.container.max }}
      >
        {/* Massive Two-Line Headline */}
        <h1
          className="font-heading font-black uppercase mb-6"
          style={{
            fontSize: heroDesign.titleSize,
            lineHeight: heroDesign.titleLineHeight,
            letterSpacing: heroDesign.titleLetterSpacing,
          }}
        >
          <div className="text-white">{content.title_line1}</div>
          <div
            className="text-neutral-500"
            style={{
              color: designTokens.colors.neutral[500],
            }}
          >
            {content.title_line2}
          </div>
        </h1>

        {/* Description */}
        <p
          className="font-body text-lg md:text-xl leading-relaxed mb-12"
          style={{
            maxWidth: heroDesign.descriptionMaxWidth,
            color: heroDesign.descriptionColor,
          }}
        >
          {content.description}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Primary CTA */}
          <Link
            href={content.cta_primary_href || '#'}
            className={cn(
              'inline-flex items-center justify-center',
              'font-semibold transition-all duration-300',
              'hover:-translate-y-0.5 active:translate-y-0'
            )}
            style={{
              background: buttonDesign.primary.background,
              color: buttonDesign.primary.color,
              borderRadius: buttonDesign.primary.borderRadius,
              padding: buttonDesign.primary.padding,
              height: buttonDesign.primary.height,
              fontSize: buttonDesign.primary.fontSize,
            }}
          >
            {content.cta_primary}
          </Link>

          {/* Secondary CTA */}
          <Link
            href={content.cta_secondary_href || '#'}
            className="font-body underline underline-offset-4 hover:opacity-50 transition-opacity duration-300"
            style={{
              color: buttonDesign.secondary.color,
            }}
          >
            {content.cta_secondary}
          </Link>
        </div>
      </div>
    </section>
  );
}