import type { Locale } from '@/i18n-config';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, ArrowLeft, User } from 'lucide-react';
import { getBlogPostBySlug, type BlogPost } from '@/lib/supabase/blog';
import { RichContentRenderer } from '@/components/ebook';

export const dynamic = 'force-dynamic';

function formatDate(dateString: string | null, lang: Locale) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function getTitle(post: BlogPost, lang: Locale) {
  return lang === 'pt' && post.title_pt ? post.title_pt : post.title_en;
}

function getContent(post: BlogPost, lang: Locale) {
  return lang === 'pt' && post.content_pt ? post.content_pt : post.content_en;
}

export default async function BlogPostPage({
  params: { lang, slug },
}: {
  params: { lang: Locale; slug: string };
}) {
  const post = await getBlogPostBySlug(slug);

  if (!post || !post.is_published) {
    notFound();
  }

  const title = getTitle(post, lang);
  const content = getContent(post, lang);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative">
        {/* Cover Image */}
        {post.cover_image_url ? (
          <div className="relative w-full h-[50vh] min-h-[400px] max-h-[600px]">
            <img
              src={post.cover_image_url}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-b from-neutral-900 to-background" />
        )}

        {/* Header Content - Overlaid on image */}
        <div className={`${post.cover_image_url ? 'absolute bottom-0 left-0 right-0' : ''}`}>
          <div className="container mx-auto px-4 pb-8">
            <div className="max-w-3xl mx-auto">
              {/* Back Link */}
              <Link
                href={`/${lang}/blog`}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {lang === 'pt' ? 'Blog' : 'Blog'}
              </Link>

              {/* Category */}
              <div className="mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-orange-500">
                  {post.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground leading-tight">
                {title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Article Body */}
      <article className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Meta Bar */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground pb-8 border-b border-neutral-800/50">
            {/* Author */}
            <div className="flex items-center gap-2">
              {post.author_avatar_url ? (
                <img
                  src={post.author_avatar_url}
                  alt={post.author_name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              <span className="font-medium text-foreground">{post.author_name}</span>
            </div>

            <span className="text-neutral-700">·</span>

            {/* Date */}
            {post.published_at && (
              <>
                <span>{formatDate(post.published_at, lang)}</span>
                <span className="text-neutral-700">·</span>
              </>
            )}

            {/* Read Time */}
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.estimated_read_time_minutes} min
            </span>
          </div>

          {/* Content */}
          <div className="py-10">
            <RichContentRenderer content={content || ''} />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 py-8 border-t border-neutral-800/50">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs text-muted-foreground bg-neutral-900 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA Footer */}
          <div className="mt-4 py-10 border-t border-neutral-800/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <p className="text-muted-foreground">
                {lang === 'pt' ? 'Explore mais conteúdo' : 'Explore more content'}
              </p>
              <div className="flex gap-3">
                <Link
                  href={`/${lang}/blog`}
                  className="px-5 py-2.5 text-sm font-medium text-foreground border border-neutral-800 rounded-lg hover:bg-neutral-900 transition-colors"
                >
                  {lang === 'pt' ? 'Mais artigos' : 'More articles'}
                </Link>
                <Link
                  href={`/${lang}/ebooks`}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {lang === 'pt' ? 'E-books' : 'E-books'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
