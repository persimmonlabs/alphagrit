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
      <header className="mb-10 md:mb-14 pb-6 md:pb-8 border-b border-border">
        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 font-medium">
          <span>
            {lang === 'pt' ? 'Capítulo' : 'Chapter'} {chapter.chapterNumber}
          </span>
          {chapter.estimatedReadTimeMinutes && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                {chapter.estimatedReadTimeMinutes} {lang === 'pt' ? 'min' : 'min'}
              </span>
            </>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-foreground leading-tight mb-0">
          {title}
        </h1>

        {chapter.summaryEn && (
          <p className="mt-4 md:mt-5 text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed">
            {lang === 'pt' && chapter.summaryPt ? chapter.summaryPt : chapter.summaryEn}
          </p>
        )}
      </header>

      {/* Chapter Content */}
      <div className="space-y-12 md:space-y-16">
        {sections.map((section) => {
          const heading = getLocalizedHeading(section, lang);
          const isBookmarked = bookmarkedSections.includes(section.id);

          return (
            <section key={section.id} id={`section-${section.id}`} className="scroll-mt-20">
              {heading && (
                <div className="flex items-start justify-between gap-4 mb-5 md:mb-6">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-heading font-semibold text-foreground leading-tight">
                    {heading}
                  </h2>
                  {onBookmark && (
                    <button
                      type="button"
                      onClick={() => onBookmark(section.id)}
                      className="p-2 -mr-2 hover:bg-muted transition-colors touch-target flex-shrink-0"
                      title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
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
                  section.sectionType === 'two-column' && 'md:columns-2 md:gap-8 md:[&>*]:break-inside-avoid',
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
      <nav className="mt-12 md:mt-16 pt-8 border-t border-border">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {prevChapter ? (
            <Link
              href={`/${lang}/ebooks/${ebookSlug}/${prevChapter.slug}`}
              className="group flex items-center gap-2 md:gap-3 p-3 md:p-4 border border-border hover:border-primary/50 hover:bg-muted/50 transition-all"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:text-primary flex-shrink-0 transition-colors" />
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground mb-1">
                  {lang === 'pt' ? 'Anterior' : 'Previous'}
                </div>
                <div className="text-xs md:text-sm font-medium truncate group-hover:text-primary transition-colors">
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
              className="group flex items-center gap-2 md:gap-3 p-3 md:p-4 border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-right justify-end col-start-2"
            >
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground mb-1">
                  {lang === 'pt' ? 'Próximo' : 'Next'}
                </div>
                <div className="text-xs md:text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {getLocalizedTitle(nextChapter, lang)}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:text-primary flex-shrink-0 transition-colors" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </nav>
    </article>
  );
}
