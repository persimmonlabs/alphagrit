'use client';

import Link from 'next/link';
import { EbookChapter, EbookSection, getLocalizedTitle, getLocalizedHeading } from '@/lib/ebook/types';
import { BlockRenderer } from '../BlockRenderer';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Clock, Bookmark, BookmarkCheck } from 'lucide-react';

interface ChapterLayoutProps {
  chapter: EbookChapter;
  sections: EbookSection[];
  prevChapter?: EbookChapter | null;
  nextChapter?: EbookChapter | null;
  ebookSlug: string;
  lang: 'en' | 'pt';
  bookmarkedSections?: string[];
  onBookmark?: (sectionId: string) => void;
}

export function ChapterLayout({
  chapter,
  sections,
  prevChapter,
  nextChapter,
  ebookSlug,
  lang,
  bookmarkedSections = [],
  onBookmark,
}: ChapterLayoutProps) {
  const title = getLocalizedTitle(chapter, lang);

  return (
    <article className="max-w-3xl mx-auto">
      {/* Chapter Header */}
      <header className="mb-12 pb-8 border-b border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <span className="font-medium">
            {lang === 'pt' ? 'Capítulo' : 'Chapter'} {chapter.chapterNumber}
          </span>
          {chapter.estimatedReadTimeMinutes && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {chapter.estimatedReadTimeMinutes} {lang === 'pt' ? 'min' : 'min read'}
              </span>
            </>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
          {title}
        </h1>

        {chapter.summaryEn && (
          <p className="mt-4 text-lg text-muted-foreground">
            {lang === 'pt' && chapter.summaryPt ? chapter.summaryPt : chapter.summaryEn}
          </p>
        )}
      </header>

      {/* Chapter Content */}
      <div className="space-y-16">
        {sections.map((section) => {
          const heading = getLocalizedHeading(section, lang);
          const isBookmarked = bookmarkedSections.includes(section.id);

          return (
            <section key={section.id} id={`section-${section.id}`} className="scroll-mt-24">
              {heading && (
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    {heading}
                  </h2>
                  {onBookmark && (
                    <button
                      type="button"
                      onClick={() => onBookmark(section.id)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-5 h-5 text-primary" />
                      ) : (
                        <Bookmark className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                  )}
                </div>
              )}

              <div
                className={cn(
                  section.sectionType === 'two-column' && 'md:columns-2 md:gap-8',
                  section.sectionType === 'full-width' && 'max-w-none'
                )}
              >
                {section.blocks && section.blocks.length > 0 && (
                  <BlockRenderer blocks={section.blocks} lang={lang} />
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Chapter Navigation */}
      <nav className="mt-16 pt-8 border-t border-border">
        <div className="flex items-center justify-between gap-4">
          {prevChapter ? (
            <Link
              href={`/${lang}/ebooks/${ebookSlug}/${prevChapter.slug}`}
              className="group flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors max-w-[45%]"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground mb-1">
                  {lang === 'pt' ? 'Anterior' : 'Previous'}
                </div>
                <div className="text-sm font-medium truncate group-hover:text-primary">
                  {getLocalizedTitle(prevChapter, lang)}
                </div>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextChapter ? (
            <Link
              href={`/${lang}/ebooks/${ebookSlug}/${nextChapter.slug}`}
              className="group flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors max-w-[45%] text-right"
            >
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground mb-1">
                  {lang === 'pt' ? 'Próximo' : 'Next'}
                </div>
                <div className="text-sm font-medium truncate group-hover:text-primary">
                  {getLocalizedTitle(nextChapter, lang)}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary flex-shrink-0" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </nav>
    </article>
  );
}
