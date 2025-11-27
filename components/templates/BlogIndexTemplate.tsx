'use client';

import React from 'react';
import AlphaGritNavigation from '@/components/organisms/AlphaGritNavigation';
import AlphaGritFooter from '@/components/organisms/AlphaGritFooter';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { mergeLandingContent } from '@/config/landing-content';

// Define interfaces for API data (mirroring what's in page.tsx)
interface BlogPost {
  id: string;
  title: string;
  title_pt?: string;
  title_en?: string;
  slug: string;
  excerpt?: string;
  excerpt_pt?: string;
  excerpt_en?: string;
  content: string;
  content_pt?: string;
  content_en?: string;
  author_id?: string;
  author_name?: string;
  author?: string;
  cover_image_url?: string;
  status: string; // Assuming PostStatus enum is converted to string
  published_at?: string;
  created_at: string;
  updated_at: string;
  category?: string;
  read_time?: number;
}

interface BlogIndexTemplateProps {
  content: Record<string, any>;
  lang: string;
  blogPosts: BlogPost[];
}

export default function BlogIndexTemplate({ content, lang, blogPosts }: BlogIndexTemplateProps) {
  // Build navigation content structure using the landing content config
  const landingContent = mergeLandingContent(content, lang);

  const pageTitle = content.blog?.title || 'Our Blog';
  const noPostsMessage = content.blog?.noPosts || 'No blog posts published yet. Check back soon!';
  const readMoreText = content.blog?.readMore || 'Read more';
  const byText = content.blog?.by || 'By';
  const minuteReadText = content.blog?.minuteRead || 'min read';

  // Helper function to get bilingual text
  const getLocalizedText = (post: BlogPost, field: 'title' | 'excerpt') => {
    if (field === 'title') {
      return lang === 'pt' && post.title_pt ? post.title_pt : (lang === 'en' && post.title_en ? post.title_en : post.title);
    }
    if (field === 'excerpt') {
      return lang === 'pt' && post.excerpt_pt ? post.excerpt_pt : (lang === 'en' && post.excerpt_en ? post.excerpt_en : post.excerpt);
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-black text-white font-body antialiased">
      <AlphaGritNavigation content={landingContent.navigation} currentLang={lang} />

      <main className="container mx-auto px-6 py-12 md:py-24">
        <h1 className="text-4xl md:text-5xl font-heading font-black text-center mb-12">
          {pageTitle}
        </h1>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.length > 0 ? (
            blogPosts.map((post) => {
              const localizedTitle = getLocalizedText(post, 'title') || post.title || 'Blog Post';
              const localizedExcerpt = getLocalizedText(post, 'excerpt');
              const authorName = post.author_name || post.author || 'Unknown';

              return (
                <Card key={post.id} className="bg-neutral-900 border-none h-full flex flex-col hover:border-primary/50 transition-all duration-300">
                  {post.cover_image_url && (
                    <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
                      <Image
                        src={post.cover_image_url}
                        alt={localizedTitle}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <CardHeader className="flex-grow">
                    <CardTitle className="text-2xl font-bold mb-2">
                      <Link href={`/${lang}/blog/${post.slug}`} className="hover:text-primary transition-colors duration-300">
                        {localizedTitle}
                      </Link>
                    </CardTitle>
                    {localizedExcerpt && (
                      <CardDescription className="text-neutral-400 text-base">
                        {localizedExcerpt}
                      </CardDescription>
                    )}
                    <div className="flex items-center justify-between mt-4 text-sm text-neutral-500">
                      <span>{byText} {authorName}</span>
                      {post.read_time && <span>{post.read_time} {minuteReadText}</span>}
                    </div>
                    {post.published_at && (
                      <p className="text-xs text-neutral-600 mt-1">
                        {new Date(post.published_at).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US')}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Link href={`/${lang}/blog/${post.slug}`} className="text-primary hover:underline transition-colors duration-300 font-semibold">
                      {readMoreText} &rarr;
                    </Link>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full text-center text-neutral-400 text-lg">
              {noPostsMessage}
            </div>
          )}
        </section>
      </main>

      <AlphaGritFooter content={content.footer} />
    </div>
  );
}
