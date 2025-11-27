'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { EbookChapter, getLocalizedTitle } from '@/lib/ebook/types';
import { cn } from '@/lib/utils';
import { BookOpen, Check, Lock, ChevronRight } from 'lucide-react';

interface EbookNavigationProps {
  chapters: EbookChapter[];
  currentChapterId?: string;
  completedChapters?: string[];
  hasAccess: boolean;
  ebookSlug: string;
  lang: 'en' | 'pt';
  className?: string;
}

export function EbookNavigation({
  chapters,
  currentChapterId,
  completedChapters = [],
  hasAccess,
  ebookSlug,
  lang,
  className,
}: EbookNavigationProps) {
  const pathname = usePathname();

  return (
    <nav className={cn('space-y-1', className)}>
      <h3 className="px-3 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {lang === 'pt' ? 'Capítulos' : 'Chapters'}
      </h3>

      <div className="space-y-0.5">
        {chapters.map((chapter) => {
          const isActive = chapter.id === currentChapterId;
          const isCompleted = completedChapters.includes(chapter.id);
          const canAccess = hasAccess || chapter.isFreePreview;
          const title = getLocalizedTitle(chapter, lang);

          return (
            <Link
              key={chapter.id}
              href={canAccess ? `/${lang}/ebooks/${ebookSlug}/${chapter.slug}` : '#'}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : canAccess
                    ? 'hover:bg-muted text-foreground'
                    : 'text-muted-foreground cursor-not-allowed opacity-60'
              )}
              onClick={(e) => {
                if (!canAccess) {
                  e.preventDefault();
                }
              }}
            >
              <div
                className={cn(
                  'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : isCompleted
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5" />
                ) : !canAccess ? (
                  <Lock className="w-3 h-3" />
                ) : (
                  chapter.chapterNumber
                )}
              </div>

              <span className="flex-1 text-sm font-medium truncate">{title}</span>

              {chapter.isFreePreview && !hasAccess && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/10 text-green-500">
                  {lang === 'pt' ? 'Grátis' : 'Free'}
                </span>
              )}

              {isActive && (
                <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
