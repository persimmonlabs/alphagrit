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
    <nav className={cn('space-y-1.5', className)}>
      <h3 className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {lang === 'pt' ? 'Capítulos' : 'Chapters'}
      </h3>

      <div className="space-y-1">
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
                'group flex items-center gap-2.5 px-2.5 py-2 transition-all',
                isActive
                  ? 'bg-primary/10 text-primary border-l-2 border-primary pl-2'
                  : canAccess
                    ? 'hover:bg-muted/50 text-foreground border-l-2 border-transparent pl-2'
                    : 'text-muted-foreground/60 cursor-not-allowed opacity-50 border-l-2 border-transparent pl-2'
              )}
              onClick={(e) => {
                if (!canAccess) {
                  e.preventDefault();
                }
              }}
            >
              <div
                className={cn(
                  'flex-shrink-0 w-5 h-5 flex items-center justify-center text-xs font-semibold',
                  isActive
                    ? 'text-primary'
                    : isCompleted
                      ? 'text-green-500'
                      : canAccess
                        ? 'text-muted-foreground'
                        : 'text-muted-foreground/50'
                )}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5" />
                ) : !canAccess ? (
                  <Lock className="w-2.5 h-2.5" />
                ) : (
                  chapter.chapterNumber
                )}
              </div>

              <span className="flex-1 text-sm font-medium truncate leading-snug">{title}</span>

              {chapter.isFreePreview && !hasAccess && (
                <span className="text-[10px] px-1.5 py-0.5 bg-green-500/10 text-green-500 font-semibold uppercase tracking-wide flex-shrink-0">
                  {lang === 'pt' ? 'Free' : 'Free'}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
