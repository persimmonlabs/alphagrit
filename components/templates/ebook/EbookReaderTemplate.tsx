'use client';

import { useState } from 'react';
import { Ebook, EbookChapter, EbookSection, EbookReadingProgress, getLocalizedTitle } from '@/lib/ebook/types';
import { EbookNavigation } from '@/components/ebook/layouts/EbookNavigation';
import { ChapterLayout } from '@/components/ebook/layouts/ChapterLayout';
import { cn } from '@/lib/utils';
import { Menu, X, BookOpen, BarChart2 } from 'lucide-react';

interface EbookReaderTemplateProps {
  ebook: Ebook;
  chapters: EbookChapter[];
  currentChapter: EbookChapter;
  sections: EbookSection[];
  hasAccess: boolean;
  progress?: EbookReadingProgress | null;
  ebookSlug: string;
  lang: 'en' | 'pt';
  onUpdateProgress?: (chapterId: string, sectionId?: string) => void;
  onBookmark?: (sectionId: string) => void;
}

export function EbookReaderTemplate({
  ebook,
  chapters,
  currentChapter,
  sections,
  hasAccess,
  progress,
  ebookSlug,
  lang,
  onUpdateProgress,
  onBookmark,
}: EbookReaderTemplateProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Find prev/next chapters
  const currentIndex = chapters.findIndex((ch) => ch.id === currentChapter.id);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  // Apply theme
  const themeStyles = {
    '--ebook-primary': ebook.themeConfig?.primaryColor || '#f97316',
    '--ebook-accent': ebook.themeConfig?.accentColor || '#ef4444',
  } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-background" style={themeStyles}>
      {/* Mobile Header - Compact & Clean */}
      <div className="lg:hidden sticky top-0 z-40 bg-background/98 backdrop-blur-md border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-3 py-2.5">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-1 hover:bg-muted transition-colors touch-target"
            aria-label={lang === 'pt' ? 'Abrir menu' : 'Open menu'}
          >
            <Menu className="w-5 h-5" />
          </button>

          <span className="text-xs md:text-sm font-medium truncate mx-3 flex-1 text-center">
            {getLocalizedTitle(currentChapter, lang)}
          </span>

          {progress && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold tabular-nums flex-shrink-0">
              <span>{Math.round(progress.completionPercentage)}%</span>
            </div>
          )}
        </div>

        {/* Progress Bar - Thinner & More Subtle */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-border">
          <div
            className="h-full bg-[var(--ebook-primary)] transition-all duration-300"
            style={{ width: `${progress?.completionPercentage || 0}%` }}
          />
        </div>
      </div>

      {/* Mobile Sidebar Overlay - Better Animation */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-label={lang === 'pt' ? 'Fechar menu' : 'Close menu'}
        />
      )}

      <div className="lg:flex">
        {/* Sidebar - Refined Styling */}
        <aside
          className={cn(
            'fixed lg:sticky top-0 left-0 z-50 lg:z-auto',
            'h-screen w-72 md:w-80 bg-background border-r border-border',
            'transform transition-transform duration-300 ease-out lg:transform-none',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          {/* Sidebar Header - Cleaner */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4.5 h-4.5 text-[var(--ebook-primary)]" />
              <span className="font-semibold text-sm text-foreground">
                {lang === 'pt' ? 'Conteúdo' : 'Contents'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 hover:bg-muted transition-colors touch-target"
              aria-label={lang === 'pt' ? 'Fechar menu' : 'Close menu'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Summary - More Subtle */}
          {progress && (
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted-foreground font-medium">
                  {lang === 'pt' ? 'Progresso' : 'Progress'}
                </span>
                <span className="font-semibold text-foreground tabular-nums">
                  {Math.round(progress.completionPercentage)}%
                </span>
              </div>
              <div className="h-1.5 bg-muted overflow-hidden">
                <div
                  className="h-full bg-[var(--ebook-primary)] transition-all duration-300"
                  style={{ width: `${progress.completionPercentage}%` }}
                />
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground font-medium">
                {progress.completedChapters.length} / {chapters.length}{' '}
                {lang === 'pt' ? 'completos' : 'completed'}
              </p>
            </div>
          )}

          {/* Chapter Navigation - Better Scrolling */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <EbookNavigation
              chapters={chapters}
              currentChapterId={currentChapter.id}
              completedChapters={progress?.completedChapters}
              hasAccess={hasAccess}
              ebookSlug={ebookSlug}
              lang={lang}
            />
          </div>
        </aside>

        {/* Main Content - Better Spacing */}
        <main className="flex-1 min-w-0">
          <div className="px-4 py-6 md:py-10 lg:px-12 lg:py-12">
            <ChapterLayout
              chapter={currentChapter}
              sections={sections}
              prevChapter={prevChapter}
              nextChapter={nextChapter}
              ebookSlug={ebookSlug}
              lang={lang}
              bookmarkedSections={progress?.bookmarks}
              onBookmark={onBookmark}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
