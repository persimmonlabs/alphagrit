import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/i18n-config';
import { getUser, getProfile } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Globe, DollarSign, Crown, Settings } from 'lucide-react';

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

  // Fetch purchase count
  const { count: purchaseCount } = await supabase
    .from('purchases')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const hasSubscription = !!subscription;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            {lang === 'pt' ? 'Meu Perfil' : 'My Profile'}
          </h1>
          <p className="text-muted-foreground">
            {lang === 'pt' ? 'Gerencie suas informações' : 'Manage your information'}
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {profile?.full_name || user.email?.split('@')[0]}
              </h2>
              <p className="text-muted-foreground">{user.email}</p>
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
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5" />
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

        {/* Purchase Stats */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {lang === 'pt' ? 'Estatísticas' : 'Statistics'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{purchaseCount || 0}</p>
              <p className="text-sm text-muted-foreground">
                {lang === 'pt' ? 'E-books comprados' : 'E-books purchased'}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {hasSubscription ? '∞' : (purchaseCount || 0)}
              </p>
              <p className="text-sm text-muted-foreground">
                {lang === 'pt' ? 'E-books acessíveis' : 'Accessible e-books'}
              </p>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <Link
            href={`/${lang}/dashboard`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ← {lang === 'pt' ? 'Voltar para a biblioteca' : 'Back to library'}
          </Link>
        </div>
      </div>
    </div>
  );
}
