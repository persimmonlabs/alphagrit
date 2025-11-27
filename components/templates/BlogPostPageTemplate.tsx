'use client';

import React from 'react';
import AlphaGritNavigation from '@/components/organisms/AlphaGritNavigation';
import AlphaGritFooter from '@/components/organisms/AlphaGritFooter';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Define interface for API data (mirroring what's in page.tsx)
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

interface BlogPostPageTemplateProps {
  content: Record<string, any>;
  lang: string;
  blogPost: BlogPost;
  relatedPosts?: BlogPost[];
}

export default function BlogPostPageTemplate({ content, lang, blogPost, relatedPosts = [] }: BlogPostPageTemplateProps) {
  // Helper function to get bilingual text
  const getLocalizedField = (post: BlogPost, field: 'title' | 'excerpt' | 'content') => {
    const fieldMap = {
      title: { pt: post.title_pt, en: post.title_en, fallback: post.title },
      excerpt: { pt: post.excerpt_pt, en: post.excerpt_en, fallback: post.excerpt },
      content: { pt: post.content_pt, en: post.content_en, fallback: post.content },
    };

    const fieldData = fieldMap[field];
    return lang === 'pt' && fieldData.pt ? fieldData.pt : (lang === 'en' && fieldData.en ? fieldData.en : fieldData.fallback);
  };

  const pageTitle = getLocalizedField(blogPost, 'title') || 'Blog Post';
  const pageContent = getLocalizedField(blogPost, 'content') || '';
  const authorName = blogPost.author_name || blogPost.author || 'Unknown';
  const publishDate = blogPost.published_at
    ? new Date(blogPost.published_at).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const backToBlogText = content.blog?.backToBlog || 'Back to Blog';
  const relatedArticlesText = content.blog?.relatedArticles || 'Related Articles';
  const byText = content.blog?.by || 'By';
  const publishedOnText = content.blog?.publishedOn || 'Published on';
  const minuteReadText = content.blog?.minuteRead || 'min read';

  return (
    <div className="min-h-screen bg-black text-white font-body antialiased">
      <AlphaGritNavigation content={content.navigation} currentLang={lang} />

      <main className="container mx-auto px-6 py-12 md:py-24">
        {/* Back Button */}
        <div className="max-w-4xl mx-auto mb-8">
          <Link href={`/${lang}/blog`}>
            <Button variant="ghost" className="text-neutral-400 hover:text-white">
              &larr; {backToBlogText}
            </Button>
          </Link>
        </div>

        {/* Article */}
        <article className="max-w-4xl mx-auto">
          {blogPost.cover_image_url && (
            <div className="relative w-full h-96 rounded-lg overflow-hidden mb-8">
              <Image
                src={blogPost.cover_image_url}
                alt={pageTitle}
                fill
                style={{ objectFit: 'cover' }}
                sizes="100vw"
                priority
              />
            </div>
          )}

          <h1 className="text-4xl md:text-6xl font-heading font-black mb-6">
            {pageTitle}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-neutral-400 text-sm mb-8 pb-8 border-b border-neutral-800">
            <span className="font-semibold">{byText} {authorName}</span>
            <span>•</span>
            <span>{publishedOnText} {publishDate}</span>
            {blogPost.read_time && (
              <>
                <span>•</span>
                <span>{blogPost.read_time} {minuteReadText}</span>
              </>
            )}
            {blogPost.category && (
              <>
                <span>•</span>
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs uppercase tracking-wider">
                  {blogPost.category}
                </span>
              </>
            )}
          </div>

          <div
            className="prose prose-invert prose-lg max-w-none prose-headings:font-heading prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-neutral-300 prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:text-primary prose-code:bg-neutral-900 prose-code:px-1 prose-code:py-0.5 prose-code:rounded"
            dangerouslySetInnerHTML={{ __html: pageContent }}
          />
        </article>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="max-w-6xl mx-auto mt-24">
            <h2 className="text-3xl font-heading font-bold mb-8">{relatedArticlesText}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.slice(0, 3).map((post) => {
                const relatedTitle = getLocalizedField(post, 'title') || post.title || 'Blog Post';
                const relatedExcerpt = getLocalizedField(post, 'excerpt');

                return (
                  <Card key={post.id} className="bg-neutral-900 border-none hover:border-primary/50 transition-all duration-300">
                    {post.cover_image_url && (
                      <div className="relative w-full h-40 rounded-t-lg overflow-hidden">
                        <Image
                          src={post.cover_image_url}
                          alt={relatedTitle}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">
                        <Link href={`/${lang}/blog/${post.slug}`} className="hover:text-primary transition-colors duration-300">
                          {relatedTitle}
                        </Link>
                      </CardTitle>
                      {relatedExcerpt && (
                        <CardDescription className="text-neutral-400 text-sm line-clamp-2">
                          {relatedExcerpt}
                        </CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Call-to-Action Section */}
        <section className="max-w-4xl mx-auto mt-24 p-8 bg-gradient-to-r from-primary/20 to-transparent border border-primary/30 rounded-lg">
          <h3 className="text-2xl font-heading font-bold mb-4">
            {lang === 'pt' ? 'Quer Aprender Mais?' : 'Want to Learn More?'}
          </h3>
          <p className="text-neutral-300 mb-6">
            {lang === 'pt'
              ? 'Explore nossos ebooks e aprenda com conteúdo de alta qualidade criado por especialistas.'
              : 'Explore our ebooks and learn from high-quality content created by experts.'}
          </p>
          <Link href={`/${lang}/products`}>
            <Button className="bg-primary hover:bg-primary/90 text-black font-bold">
              {lang === 'pt' ? 'Ver Produtos' : 'View Products'}
            </Button>
          </Link>
        </section>
      </main>

      <AlphaGritFooter content={content.footer} />
    </div>
  );
}
