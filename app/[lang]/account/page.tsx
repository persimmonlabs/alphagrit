import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/i18n-config';
import { getUser, getProfile } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Crown, CreditCard } from 'lucide-react';
import { ManageSubscriptionButton } from '@/components/ebook/ManageSubscriptionButton';
import SiteHeader from '@/components/organisms/SiteHeader';

export const dynamic = 'force-dynamic';

export default async function AccountPage({
  params: { lang },
  searchParams,
}: {
  params: { lang: Locale };
  searchParams: { success?: string };
}) {
  const showSuccessMessage = searchParams.success === 'subscription';
  const dict = await getDictionary(lang);
  const user = await getUser();

  if (!user) {
    redirect(`/${lang}/auth/login?redirect=/${lang}/account`);
  }

  const supabase = createClient();
  const profile = await getProfile();

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
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <h2 className="text-lg font-bold text-green-400 mb-1">
              {lang === 'pt' ? 'Assinatura Ativada!' : 'Subscription Activated!'}
            </h2>
            <p className="text-sm text-green-300/80">
              {lang === 'pt'
                ? 'Você agora tem acesso a todos os e-books.'
                : 'You now have access to all ebooks.'}
            </p>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
            {lang === 'pt' ? 'Minha Conta' : 'My Account'}
          </h1>
          <p className="text-muted-foreground">
            {lang === 'pt' ? 'Gerencie seu perfil e assinatura' : 'Manage your profile and subscription'}
          </p>
        </div>

        {/* Profile Section */}
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center">
              <User className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {profile?.full_name || user.email?.split('@')[0]}
              </h2>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Section */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">
              {lang === 'pt' ? 'Assinatura' : 'Subscription'}
            </h2>
          </div>

          {hasSubscription ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-5 h-5 text-orange-500" />
                <span className="font-semibold text-foreground">
                  {lang === 'pt' ? 'Assinante Premium' : 'Premium Subscriber'}
                </span>
                <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                  {lang === 'pt' ? 'Ativo' : 'Active'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                {lang === 'pt' ? 'Acesso ilimitado a todos os e-books' : 'Unlimited access to all ebooks'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {lang === 'pt' ? 'Renova em:' : 'Renews:'}{' '}
                {new Date(subscription.current_period_end).toLocaleDateString(
                  lang === 'pt' ? 'pt-BR' : 'en-US'
                )}
              </p>
              <ManageSubscriptionButton lang={lang} returnUrl={`/${lang}/account`} />
            </div>
          ) : (
            <div>
              <p className="text-muted-foreground mb-4">
                {lang === 'pt'
                  ? 'Você não tem uma assinatura ativa. Assine para ter acesso a todos os e-books.'
                  : "You don't have an active subscription. Subscribe to access all ebooks."}
              </p>
              <Link
                href={`/${lang}/ebooks`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
              >
                {lang === 'pt' ? 'Ver Planos' : 'View Plans'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
