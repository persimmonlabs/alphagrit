'use client';

import React from 'react';
import Image from 'next/image'; // Import Image component for optimized images
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { FeaturedProductContent } from '@/config/landing-content';
import alphaGritDesign from '@/config/design-config';
import designTokens from '@/lib/design-tokens';

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
  description_short?: string;
  description_full?: string;
  // Add other fields as needed from the Product entity
}

interface FeaturedProductProps {
  content: FeaturedProductContent;
  products: Product[]; // NEW PROP to receive dynamic product data
}

/**
 * AlphaGrit Featured Product Section
 *
 * 50/50 split layout with product image and details.
 * Includes feature list with orange bullet points and price display.
 * Displays dynamic product data fetched from the API.
 */
export default function FeaturedProduct({ content, products }: FeaturedProductProps) {
  const productDesign = alphaGritDesign.components.featuredProduct;
  const buttonDesign = alphaGritDesign.components.button.featured;

  // Take the first featured product from the dynamic data
  const featuredProduct = products.length > 0 ? products[0] : null;

  if (!featuredProduct) {
    // Optionally render a static placeholder or nothing if no dynamic featured product
    return (
      <section
        className="w-full px-6 md:px-12 py-24 text-center text-neutral-500"
        style={{
          paddingTop: '6rem',
          paddingBottom: '6rem',
        }}
      >
        <p>No featured products available at the moment.</p>
      </section>
    );
  }

  // Determine the product URL based on slug (now links to ebooks)
  const productUrl = `/ebooks/${featuredProduct.slug}`;
  // Note: Price display removed - subscription-only model


  return (
    <section
      className="w-full px-6 md:px-12"
      style={{
        paddingTop: '6rem',
        paddingBottom: '6rem',
      }}
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: designTokens.layout.container.max,
        }}
      >
        {/* Grid Layout */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 items-start"
          style={{
            gap: productDesign.layout.gap,
          }}
        >
          {/* Left: Product Image */}
          <div className="flex items-center justify-center">
            <div
              className="relative w-[60%] bg-neutral-900 flex items-center justify-center overflow-hidden rounded-lg" // Added overflow-hidden and rounded-lg
              style={{
                aspectRatio: productDesign.imageContainer.aspectRatio,
              }}
            >
              {featuredProduct.cover_image_url ? (
                <Image
                  src={featuredProduct.cover_image_url}
                  alt={featuredProduct.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div
                  className="font-heading font-black text-neutral-800"
                  style={{
                    fontSize: productDesign.imagePlaceholder.fontSize,
                    color: productDesign.imagePlaceholder.color,
                  }}
                >
                  {content.image_placeholder}
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col justify-center space-y-6">
            {/* Label */}
            <div
              className="font-mono uppercase text-neutral-500"
              style={{
                fontSize: productDesign.label.fontSize,
                color: designTokens.colors.neutral[500],
              }}
            >
              {content.label}
            </div>

            {/* Title */}
            <h2
              className="font-heading font-black uppercase leading-tight"
              style={{
                fontSize: productDesign.title.fontSize.mobile,
                lineHeight: productDesign.title.lineHeight,
              }}
            >
              <style jsx>{`
                @media (min-width: 768px) {
                  h2 {
                    font-size: ${productDesign.title.fontSize.desktop};
                  }
                }
              `}</style>
              {featuredProduct.name}
            </h2>

            {/* Description */}
            <p
              className="font-body text-neutral-400 leading-relaxed"
              style={{
                fontSize: productDesign.description.fontSize,
                color: designTokens.colors.neutral[400],
                lineHeight: productDesign.description.lineHeight,
              }}
            >
              {featuredProduct.description_short || content.product_description}
            </p>

            {/* Feature List (using static content for now, can be dynamic later) */}
            <ul
              className="space-y-4"
              style={{
                marginTop: productDesign.featureList.marginBottom,
              }}
            >
              {content.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  {/* Orange bullet point */}
                  <div
                    className="rounded-full flex-shrink-0"
                    style={{
                      width: productDesign.featureBullet.width,
                      height: productDesign.featureBullet.height,
                      background: productDesign.featureBullet.background,
                    }}
                  />
                  <span
                    className="font-body text-neutral-300"
                    style={{
                      fontSize: productDesign.featureText.fontSize,
                      color: designTokens.colors.neutral[300],
                    }}
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA - Price removed (subscription-only model) */}
            <div
              className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-8"
              style={{
                marginTop: productDesign.priceContainer.marginTop,
              }}
            >
              <Link
                href={productUrl}
                className={cn(
                  'inline-flex items-center justify-center',
                  'font-bold transition-all duration-300',
                  'hover:-translate-y-0.5 active:translate-y-0'
                )}
                style={{
                  background: buttonDesign.background,
                  color: buttonDesign.color,
                  borderRadius: buttonDesign.borderRadius,
                  padding: buttonDesign.padding,
                  height: buttonDesign.height,
                  fontSize: buttonDesign.fontSize,
                }}
              >
                {content.cta}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}