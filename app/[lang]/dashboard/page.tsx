import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/i18n-config';
import { createClient } from '@/lib/supabase/server';
import { getUser, getProfile } from '@/lib/supabase/server';
import { getEbooks } from '@/lib/supabase/ebooks';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Crown, Clock, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);
  const user = await getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect(`/${lang}/auth/login?redirect=/${lang}/dashboard`);
  }

  const supabase = createClient();
  const profile = await getProfile();

  // Fetch user's subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  // Fetch user's individual purchases
  const { data: purchases } = await supabase
    .from('purchases')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch all active ebooks from Supabase
  const allEbooks = await getEbooks();

  // Get purchased ebook IDs (check both ebook_id and legacy sanity_ebook_id)
  const purchasedEbookIds = new Set([
    ...(purchases?.map(p => p.ebook_id).filter(Boolean) || []),
    ...(purchases?.map(p => p.sanity_ebook_id).filter(Boolean) || [])
  ]);

  // Filter ebooks user has access to
  const accessibleEbooks = subscription
    ? allEbooks // Subscriber has access to all
    : allEbooks.filter(ebook => purchasedEbookIds.has(ebook.id));

  const hasSubscription = !!subscription;
  const hasPurchases = purchases && purchases.length > 0;
  const hasAccess = hasSubscription || hasPurchases;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
            {lang === 'pt' ? 'Minha Biblioteca' : 'My Library'}
          </h1>
          <p className="text-muted-foreground">
            {lang === 'pt'
              ? `Bem-vindo de volta, ${profile?.full_name || user.email}`
              : `Welcome back, ${profile?.full_name || user.email}`}
          </p>
        </div>

        {/* Subscription Status */}
        {hasSubscription && (
          <div className="mb-8 p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold text-foreground">
                {lang === 'pt' ? 'Assinante Premium' : 'Premium Subscriber'}
              </h2>
            </div>
            <p className="text-muted-foreground mb-4">
              {lang === 'pt'
                ? 'Você tem acesso ilimitado a todos os e-books.'
                : 'You have unlimited access to all e-books.'}
            </p>
            <p className="text-sm text-muted-foreground">
              {lang === 'pt' ? 'Renovação:' : 'Renews:'}{' '}
              {new Date(subscription.current_period_end).toLocaleDateString(
                lang === 'pt' ? 'pt-BR' : 'en-US'
              )}
            </p>
          </div>
        )}

        {/* No Access State */}
        {!hasAccess && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {lang === 'pt' ? 'Sua biblioteca está vazia' : 'Your library is empty'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {lang === 'pt'
                ? 'Compre um e-book ou assine para começar a ler.'
                : 'Purchase an e-book or subscribe to start reading.'}
            </p>
            <Link
              href={`/${lang}/ebooks`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >
              {lang === 'pt' ? 'Ver E-books' : 'Browse E-books'}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* E-books Grid */}
        {hasAccess && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {accessibleEbooks.map((ebook) => {
              const title = lang === 'pt' && ebook.title_pt ? ebook.title_pt : ebook.title_en;
              const chapterCount = ebook.chapters?.length || 0;
              const firstChapterSlug = ebook.chapters?.[0]?.slug;

              return (
                <Link
                  key={ebook.id}
                  href={firstChapterSlug
                    ? `/${lang}/ebooks/${ebook.slug}/${firstChapterSlug}`
                    : `/${lang}/ebooks/${ebook.slug}`
                  }
                  className="group bg-card border border-border rounded-xl overflow-hidden hover:border-orange-500/50 transition-all hover:shadow-lg"
                >
                  <div className="aspect-[3/4] relative bg-muted">
                    {ebook.cover_image_url ? (
                      <Image
                        src={ebook.cover_image_url}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                    {/* Read Now Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {lang === 'pt' ? 'Ler agora' : 'Read now'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors">
                      {title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="w-4 h-4" />
                      <span>
                        {chapterCount} {lang === 'pt' ? 'capítulos' : 'chapters'}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Browse More Link */}
        {hasAccess && (
          <div className="mt-12 text-center">
            <Link
              href={`/${lang}/ebooks`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {lang === 'pt' ? 'Ver todos os e-books disponíveis' : 'Browse all available e-books'} →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
