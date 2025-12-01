import type { Locale } from '@/i18n-config';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, Calendar, ArrowLeft, User } from 'lucide-react';
import { getBlogPostBySlug, getBlogPostSlugs, type BlogPost } from '@/lib/supabase/blog';
import { RichContentRenderer } from '@/components/ebook';

export const dynamic = 'force-dynamic';

function formatDate(dateString: string | null, lang: Locale) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
    year: 'numeric',
    month: 'long',
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
      {/* Header Image */}
      {post.cover_image_url && (
        <div className="w-full h-64 md:h-96 overflow-hidden">
          <img
            src={post.cover_image_url}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <article className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Back Link */}
          <Link
            href={`/${lang}/blog`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === 'pt' ? 'Voltar ao Blog' : 'Back to Blog'}
          </Link>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <span className="px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full capitalize">
              {post.category}
            </span>
            {post.published_at && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(post.published_at, lang)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.estimated_read_time_minutes} min {lang === 'pt' ? 'de leitura' : 'read'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            {title}
          </h1>

          {/* Author */}
          <div className="flex items-center gap-3 pb-8 border-b border-neutral-800">
            {post.author_avatar_url ? (
              <img
                src={post.author_avatar_url}
                alt={post.author_name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <User className="w-6 h-6 text-orange-500" />
              </div>
            )}
            <div>
              <p className="font-medium">{post.author_name}</p>
              <p className="text-sm text-muted-foreground">
                {lang === 'pt' ? 'Autor' : 'Author'}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="mt-8">
            <RichContentRenderer content={content || ''} />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-neutral-800">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                {lang === 'pt' ? 'Tags' : 'Tags'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-neutral-800 text-muted-foreground rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Back to Blog CTA */}
          <div className="mt-12 p-8 bg-neutral-900 border border-neutral-800 rounded-xl text-center">
            <h3 className="text-xl font-semibold mb-2">
              {lang === 'pt' ? 'Gostou do artigo?' : 'Enjoyed this article?'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {lang === 'pt'
                ? 'Confira mais artigos no nosso blog ou explore nossos e-books.'
                : 'Check out more articles on our blog or explore our e-books.'}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href={`/${lang}/blog`}
                className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-foreground font-medium rounded-lg transition-colors"
              >
                {lang === 'pt' ? 'Ver mais artigos' : 'More articles'}
              </Link>
              <Link
                href={`/${lang}/ebooks`}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
              >
                {lang === 'pt' ? 'Ver E-books' : 'Browse E-books'}
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
