import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/i18n-config';
import { getUser, getProfile } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Globe, DollarSign, Crown, Settings } from 'lucide-react';
import SiteHeader from '@/components/organisms/SiteHeader';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);
  const user = await getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect(`/${lang}/auth/login?redirect=/${lang}/dashboard/profile`);
  }

  const profile = await getProfile();
  const supabase = createClient();

  // Fetch subscription status
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  const hasSubscription = !!subscription;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader lang={lang} />

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
            {lang === 'pt' ? 'Meu Perfil' : 'My Profile'}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {lang === 'pt' ? 'Gerencie suas informações' : 'Manage your information'}
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-xl p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-muted rounded-full flex items-center justify-center">
              <User className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl font-semibold text-foreground truncate">
                {profile?.full_name || user.email?.split('@')[0]}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{lang === 'pt' ? 'Email:' : 'Email:'}</span>
              <span className="text-foreground">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{lang === 'pt' ? 'Idioma:' : 'Language:'}</span>
              <span className="text-foreground">
                {profile?.preferred_language === 'pt' ? 'Português' : 'English'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{lang === 'pt' ? 'Moeda:' : 'Currency:'}</span>
              <span className="text-foreground">{profile?.preferred_currency || 'USD'}</span>
            </div>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="bg-card border border-border rounded-xl p-4 md:p-6 mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4 flex items-center gap-2">
            <Crown className="w-4 h-4 md:w-5 md:h-5" />
            {lang === 'pt' ? 'Assinatura' : 'Subscription'}
          </h3>

          {hasSubscription ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                  {lang === 'pt' ? 'Ativa' : 'Active'}
                </span>
                <span className="text-sm text-muted-foreground">
                  {subscription.plan_type === 'monthly'
                    ? (lang === 'pt' ? 'Mensal' : 'Monthly')
                    : (lang === 'pt' ? 'Anual' : 'Yearly')}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {lang === 'pt' ? 'Próxima cobrança:' : 'Next billing:'}{' '}
                {new Date(subscription.current_period_end).toLocaleDateString(
                  lang === 'pt' ? 'pt-BR' : 'en-US'
                )}
              </p>
              <form action="/api/subscription/portal" method="POST">
                <button
                  type="submit"
                  className="text-sm text-orange-500 hover:text-orange-600 transition-colors"
                >
                  {lang === 'pt' ? 'Gerenciar assinatura' : 'Manage subscription'} →
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-muted-foreground">
                {lang === 'pt'
                  ? 'Você não tem uma assinatura ativa.'
                  : 'You don\'t have an active subscription.'}
              </p>
              <Link
                href={`/${lang}/ebooks`}
                className="inline-block text-sm text-orange-500 hover:text-orange-600 transition-colors"
              >
                {lang === 'pt' ? 'Ver planos de assinatura' : 'View subscription plans'} →
              </Link>
            </div>
          )}
        </div>

        {/* Access Info */}
        <div className="bg-card border border-border rounded-xl p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 md:w-5 md:h-5" />
            {lang === 'pt' ? 'Acesso' : 'Access'}
          </h3>
          <div className="bg-muted/50 rounded-lg p-3 md:p-4 text-center">
            <p className="text-xl md:text-2xl font-bold text-foreground">
              {hasSubscription ? '∞' : '1'}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground">
              {hasSubscription
                ? (lang === 'pt' ? 'Acesso ilimitado a todos os e-books' : 'Unlimited access to all e-books')
                : (lang === 'pt' ? 'Apenas capítulos gratuitos (prévia)' : 'Free chapters only (preview)')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
