'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NavigationContent } from '@/config/landing-content';
import alphaGritDesign from '@/config/design-config';
import { createClient } from '@/lib/supabase/client';

interface AlphaGritNavigationProps {
  content: NavigationContent;
  currentLang: string;
}

/**
 * AlphaGrit Navigation Component
 *
 * Distinctive mix-blend-difference header with language switcher.
 * Auth-aware: shows DASHBOARD when logged in, LOGIN when not.
 */
export default function AlphaGritNavigation({
  content,
  currentLang,
}: AlphaGritNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const design = alphaGritDesign.components.navigation;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      setIsLoading(false);
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: { user?: unknown } | null) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${currentLang}`);
    router.refresh();
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 mix-blend-difference"
      style={{
        height: design.height,
      }}
    >
      <div
        className="flex items-center justify-between h-full mx-auto"
        style={{
          padding: design.padding,
          maxWidth: '1400px',
        }}
      >
        {/* Logo */}
        <Link
          href={`/${currentLang}`}
          className={cn(
            'font-heading font-bold uppercase tracking-tighter',
            'hover:opacity-50 transition-opacity duration-300'
          )}
          style={{
            fontSize: alphaGritDesign.components.logo.fontSize,
          }}
        >
          {content.logo}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {content.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'font-mono text-xs tracking-widest uppercase',
                'hover:opacity-50 transition-opacity duration-300'
              )}
            >
              {link.label}
            </Link>
          ))}
          {/* Auth-aware link: DASHBOARD when logged in, LOGIN when not */}
          {!isLoading && (
            isLoggedIn ? (
              <Link
                href={`/${currentLang}/dashboard`}
                className={cn(
                  'font-mono text-xs tracking-widest uppercase',
                  'hover:opacity-50 transition-opacity duration-300',
                  'opacity-50'
                )}
              >
                {currentLang === 'pt' ? '[PAINEL]' : '[DASHBOARD]'}
              </Link>
            ) : (
              <Link
                href={`/${currentLang}/auth/login`}
                className={cn(
                  'font-mono text-xs tracking-widest uppercase',
                  'hover:opacity-50 transition-opacity duration-300',
                  'opacity-50'
                )}
              >
                {currentLang === 'pt' ? '[ENTRAR]' : '[LOGIN]'}
              </Link>
            )
          )}
        </nav>

        {/* Language Switcher */}
        <div className="flex items-center gap-2 font-mono text-xs tracking-widest">
          {content.languages.map((lang, index) => (
            <React.Fragment key={lang.code}>
              <Link
                href={`/${lang.code}`}
                className={cn(
                  'transition-opacity duration-300',
                  currentLang === lang.code
                    ? 'opacity-100'
                    : 'opacity-30 hover:opacity-50'
                )}
              >
                {lang.label}
              </Link>
              {index < content.languages.length - 1 && (
                <span className="opacity-30">/</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </header>
  );
}
