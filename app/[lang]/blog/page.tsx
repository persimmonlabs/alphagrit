import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/i18n-config';
import Link from 'next/link';
import { FileText, Clock, ArrowRight, Star } from 'lucide-react';
import { getBlogPosts, getFeaturedBlogPosts, type BlogPost } from '@/lib/supabase/blog';

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

function getExcerpt(post: BlogPost, lang: Locale) {
  return lang === 'pt' && post.excerpt_pt ? post.excerpt_pt : post.excerpt_en;
}

export default async function BlogIndexPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);
  const posts = await getBlogPosts();
  const featuredPosts = await getFeaturedBlogPosts();

  if (posts.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-6" />
            <h1 className="text-3xl font-heading font-bold text-foreground mb-4">
              {lang === 'pt' ? 'Blog' : 'Blog'}
            </h1>
            <p className="text-muted-foreground mb-8">
              {lang === 'pt'
                ? 'Novos artigos em breve. Enquanto isso, confira nossos e-books!'
                : 'New articles coming soon. In the meantime, check out our e-books!'}
            </p>
            <Link
              href={`/${lang}/ebooks`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >
              {lang === 'pt' ? 'Ver E-books' : 'Browse E-books'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-neutral-900 to-background border-b border-neutral-800">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground text-center mb-4">
            {lang === 'pt' ? 'Blog' : 'Blog'}
          </h1>
          <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto">
            {lang === 'pt'
              ? 'Artigos sobre mentalidade, produtividade, fitness e muito mais.'
              : 'Articles about mindset, productivity, fitness, and more.'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              {lang === 'pt' ? 'Destaques' : 'Featured'}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/${lang}/blog/${post.slug}`}
                  className="group bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-orange-500/50 transition-colors"
                >
                  {post.cover_image_url ? (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.cover_image_url}
                        alt={getTitle(post, lang)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-neutral-800 flex items-center justify-center">
                      <FileText className="w-12 h-12 text-neutral-600" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                      <span className="px-2 py-1 bg-neutral-800 rounded capitalize">{post.category}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.estimated_read_time_minutes} min
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-orange-500 transition-colors">
                      {getTitle(post, lang)}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2">
                      {getExcerpt(post, lang)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All Posts */}
        <section>
          <h2 className="text-2xl font-bold mb-8">
            {lang === 'pt' ? 'Todos os Artigos' : 'All Articles'}
          </h2>
          <div className="space-y-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/${lang}/blog/${post.slug}`}
                className="group flex flex-col md:flex-row gap-6 bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 hover:border-orange-500/50 transition-colors"
              >
                {post.cover_image_url ? (
                  <div className="w-full md:w-48 h-32 flex-shrink-0 overflow-hidden rounded-lg">
                    <img
                      src={post.cover_image_url}
                      alt={getTitle(post, lang)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full md:w-48 h-32 flex-shrink-0 bg-neutral-800 rounded-lg flex items-center justify-center">
                    <FileText className="w-8 h-8 text-neutral-600" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                    <span className="px-2 py-1 bg-neutral-800 rounded capitalize">{post.category}</span>
                    <span>{formatDate(post.published_at, lang)}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.estimated_read_time_minutes} min
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-orange-500 transition-colors">
                    {getTitle(post, lang)}
                  </h3>
                  <p className="text-muted-foreground line-clamp-2 mb-3">
                    {getExcerpt(post, lang)}
                  </p>
                  <span className="inline-flex items-center gap-1 text-orange-500 font-medium text-sm group-hover:gap-2 transition-all">
                    {lang === 'pt' ? 'Ler mais' : 'Read more'}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
