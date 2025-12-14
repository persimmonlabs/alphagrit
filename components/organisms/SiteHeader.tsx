'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Menu, X } from 'lucide-react';

interface SiteHeaderProps {
  lang: string;
}

/**
 * Site Header for Interior Pages
 *
 * Auth-aware navigation that shows on all interior pages (ebooks, blog, dashboard, etc.)
 * Shows DASHBOARD when logged in, LOGIN when not.
 */
export default function SiteHeader({ lang }: SiteHeaderProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      setIsLoading(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: { user?: unknown } | null) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
    router.push(`/${lang}`);
    router.refresh();
  };

  const navLinks = [
    { label: lang === 'pt' ? 'BLOG' : 'BLOG', href: `/${lang}/blog` },
    { label: lang === 'pt' ? 'EBOOKS' : 'EBOOKS', href: `/${lang}/ebooks` },
  ];

  const authLink = isLoggedIn
    ? { label: lang === 'pt' ? 'PAINEL' : 'DASHBOARD', href: `/${lang}/dashboard` }
    : { label: lang === 'pt' ? 'ENTRAR' : 'LOGIN', href: `/${lang}/auth/login` };

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
            {!isLoading && (
              <>
                <Link
                  href={authLink.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {authLink.label}
                </Link>
                {isLoggedIn && (
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {lang === 'pt' ? 'SAIR' : 'LOGOUT'}
                  </button>
                )}
              </>
            )}
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
              {!isLoading && (
                <>
                  <Link
                    href={authLink.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {authLink.label}
                  </Link>
                  {isLoggedIn && (
                    <button
                      onClick={handleLogout}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
                    >
                      {lang === 'pt' ? 'SAIR' : 'LOGOUT'}
                    </button>
                  )}
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
