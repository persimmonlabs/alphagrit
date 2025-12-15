'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

interface SiteHeaderProps {
  lang: string;
}

/**
 * Site Header for Interior Pages
 *
 * Auth-aware navigation that shows on all interior pages (ebooks, blog, dashboard, etc.)
 * Shows DASHBOARD when logged in, LOGIN when not.
 * Shows EBOOKS link only for admin users.
 */
export default function SiteHeader({ lang }: SiteHeaderProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);

      // Check if user is admin
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        setIsAdmin(profile?.role === 'admin');
      } else {
        setIsAdmin(false);
      }

      setIsLoading(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: { user?: unknown } | null) => {
        setIsLoggedIn(!!session?.user);

        // Re-check admin status on auth state change
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', (session.user as { id: string }).id)
            .single();

          setIsAdmin(profile?.role === 'admin');
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
    router.push(`/${lang}`);
    router.refresh();
  };

  // Only show EBOOKS link to admin users
  const navLinks = [
    { label: lang === 'pt' ? 'BLOG' : 'BLOG', href: `/${lang}/blog` },
    ...(isAdmin ? [{ label: lang === 'pt' ? 'EBOOKS' : 'EBOOKS', href: `/${lang}/ebooks` }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={`/${lang}`}
            className="font-heading font-bold text-xl tracking-tighter hover:opacity-70 transition-opacity"
          >
            ALPHAGRIT
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {/* Auth links - always show LOGIN for non-logged-in users */}
            {!isLoading ? (
              <>
                {isLoggedIn ? (
                  <>
                    <Link
                      href={`/${lang}/dashboard`}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {lang === 'pt' ? 'PAINEL' : 'DASHBOARD'}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {lang === 'pt' ? 'SAIR' : 'LOGOUT'}
                    </button>
                  </>
                ) : (
                  <Link
                    href={`/${lang}/auth/login`}
                    className="text-sm font-medium px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    {lang === 'pt' ? 'ENTRAR' : 'LOGIN'}
                  </Link>
                )}
              </>
            ) : (
              /* Show LOGIN button even during loading for immediate visibility */
              <Link
                href={`/${lang}/auth/login`}
                className="text-sm font-medium px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                {lang === 'pt' ? 'ENTRAR' : 'LOGIN'}
              </Link>
            )}
            <LanguageSwitcher currentLang={lang} />
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {/* Auth links - always show LOGIN for non-logged-in users */}
              {!isLoading ? (
                <>
                  {isLoggedIn ? (
                    <>
                      <Link
                        href={`/${lang}/dashboard`}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {lang === 'pt' ? 'PAINEL' : 'DASHBOARD'}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
                      >
                        {lang === 'pt' ? 'SAIR' : 'LOGOUT'}
                      </button>
                    </>
                  ) : (
                    <Link
                      href={`/${lang}/auth/login`}
                      className="text-sm font-medium px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {lang === 'pt' ? 'ENTRAR' : 'LOGIN'}
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  href={`/${lang}/auth/login`}
                  className="text-sm font-medium px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {lang === 'pt' ? 'ENTRAR' : 'LOGIN'}
                </Link>
              )}
              <div className="pt-2 border-t border-border">
                <LanguageSwitcher currentLang={lang} />
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
