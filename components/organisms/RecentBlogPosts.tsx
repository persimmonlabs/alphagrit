'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import designTokens from '@/lib/design-tokens';
import { LandingPageContent } from '@/config/landing-content'; // Assuming BlogPost content might come from here for static parts

// Define simple interface for BlogPost, ideally imported from a shared types file
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  cover_image_url?: string;
  published_at?: string; // ISO string or Date object
}

interface RecentBlogPostsProps {
  blogPosts: BlogPost[];
  content?: LandingPageContent; // Optional for static content like section title
}

/**
 * RecentBlogPosts Section
 * Displays a list of recent blog posts fetched dynamically.
 * Assumes a grid layout for multiple posts.
 */
export default function RecentBlogPosts({ blogPosts, content }: RecentBlogPostsProps) {
  if (!blogPosts || blogPosts.length === 0) {
    return null; // Don't render section if no blog posts
  }

  // Fallback content if provided, e.g., for section title
  const sectionTitle = content?.blog?.title || 'Recent Blog Posts';
  const ctaText = content?.blog?.cta || 'Read All Posts';

  return (
    <section
      className="w-full px-6 md:px-12 py-24"
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
        <h2 className="text-center font-heading font-black text-4xl md:text-5xl mb-12">
          {sectionTitle}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link
              href={`/blog/${post.slug}`} // Assuming blog posts are routed by slug
              key={post.id}
              className="group block bg-neutral-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {post.cover_image_url && (
                <div className="relative w-full h-48">
                  <Image
                    src={post.cover_image_url}
                    alt={post.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="font-heading font-bold text-xl mb-2 group-hover:text-primary transition-colors duration-300">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-neutral-400 text-sm mb-4">
                    {post.excerpt}
                  </p>
                )}
                {post.published_at && (
                  <p className="text-neutral-500 text-xs">
                    Published: {new Date(post.published_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Optional: Call to action to view all blog posts */}
        {content?.blog?.href && (
          <div className="text-center mt-12">
            <Link
              href={content.blog.href}
              className={cn(
                'inline-flex items-center justify-center rounded-full',
                'bg-white text-black hover:bg-neutral-200',
                'font-bold transition-all duration-300',
                'h-12 px-8 text-sm' // Tailor button style as needed
              )}
            >
              {ctaText}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
