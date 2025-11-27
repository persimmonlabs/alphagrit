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
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <span className="text-sm font-medium truncate mx-4">
            {getLocalizedTitle(currentChapter, lang)}
          </span>

          {progress && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BarChart2 className="w-4 h-4" />
              <span>{Math.round(progress.completionPercentage)}%</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-[var(--ebook-primary)] transition-all duration-300"
            style={{ width: `${progress?.completionPercentage || 0}%` }}
          />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed lg:sticky top-0 left-0 z-50 lg:z-auto',
            'h-screen w-80 bg-background border-r border-border',
            'transform transition-transform duration-200 lg:transform-none',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[var(--ebook-primary)]" />
              <span className="font-semibold text-foreground">
                {lang === 'pt' ? 'Conteúdo' : 'Contents'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Summary */}
          {progress && (
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  {lang === 'pt' ? 'Progresso' : 'Progress'}
                </span>
                <span className="font-medium text-foreground">
                  {Math.round(progress.completionPercentage)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--ebook-primary)] rounded-full transition-all duration-300"
                  style={{ width: `${progress.completionPercentage}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {progress.completedChapters.length} / {chapters.length}{' '}
                {lang === 'pt' ? 'capítulos completos' : 'chapters completed'}
              </p>
            </div>
          )}

          {/* Chapter Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
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

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="px-4 py-8 lg:px-8 lg:py-12">
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
