'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  currentLang: string;
  className?: string;
}

/**
 * Language Switcher Component
 *
 * Allows users to toggle between EN and PT versions of the site.
 * Sets a cookie to persist the language preference across sessions.
 */
export default function LanguageSwitcher({ currentLang, className }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLang: string) => {
    if (newLang === currentLang) return;

    // Set cookie to persist language preference (1 year expiry)
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `preferred-locale=${newLang}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;

    // Replace the locale in the current pathname
    const newPathname = pathname.replace(`/${currentLang}`, `/${newLang}`);
    router.push(newPathname);
    router.refresh();
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Globe className="w-4 h-4 text-muted-foreground" />
      <div className="flex items-center gap-1 text-sm font-medium">
        <button
          onClick={() => switchLanguage('en')}
          className={cn(
            "px-2 py-1 rounded transition-colors",
            currentLang === 'en'
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="Switch to English"
        >
          EN
        </button>
        <span className="text-muted-foreground">|</span>
        <button
          onClick={() => switchLanguage('pt')}
          className={cn(
            "px-2 py-1 rounded transition-colors",
            currentLang === 'pt'
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="Mudar para Português"
        >
          PT
        </button>
      </div>
    </div>
  );
}
