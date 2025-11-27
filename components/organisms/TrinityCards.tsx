'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { TrinityContent } from '@/config/landing-content';
import alphaGritDesign from '@/config/design-config';
import designTokens from '@/lib/design-tokens';

interface TrinityCardsProps {
  content: TrinityContent;
}

/**
 * AlphaGrit Trinity Cards
 *
 * Three-column bordered cards representing Body, Mind, Code.
 * Features subtle hover effects and numbered items.
 */
export default function TrinityCards({ content }: TrinityCardsProps) {
  const cardsDesign = alphaGritDesign.components.trinityCards;

  return (
    <section
      className="w-full px-6 md:px-12"
      style={{
        paddingTop: '6rem',
        paddingBottom: '6rem',
      }}
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: designTokens.layout.container.max,
        }}
      >
        {/* Grid of 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3">
          {content.cards.map((card, index) => (
            <Link
              key={card.number}
              href={card.href || '#'}
              className={cn(
                'group block transition-colors',
                'border-neutral-900',
                // Borders: top and bottom for all, left for first, right for last
                'border-t border-b',
                index === 0 && 'md:border-l',
                index === content.cards.length - 1 && 'md:border-r',
                // Vertical borders between cards
                index < content.cards.length - 1 && 'md:border-r'
              )}
              style={{
                borderWidth: cardsDesign.card.border.split(' ')[0],
                borderColor: designTokens.colors.neutral[900],
                padding: cardsDesign.card.padding,
                transition: cardsDesign.card.transition,
                borderRadius: cardsDesign.card.borderRadius,
              }}
            >
              <div className="flex flex-col h-full">
                {/* Number */}
                <div
                  className="font-mono text-neutral-600 mb-6"
                  style={{
                    fontSize: cardsDesign.number.fontSize,
                    marginBottom: cardsDesign.number.marginBottom,
                  }}
                >
                  {card.number}
                </div>

                {/* Title with hover effect */}
                <h3
                  className={cn(
                    'font-heading font-black uppercase mb-4',
                    'transition-all duration-300',
                    'group-hover:ml-4'
                  )}
                  style={{
                    fontSize: cardsDesign.title.fontSize.mobile,
                    marginBottom: cardsDesign.title.marginBottom,
                  }}
                >
                  <style jsx>{`
                    @media (min-width: 768px) {
                      h3 {
                        font-size: ${cardsDesign.title.fontSize.desktop};
                      }
                    }
                  `}</style>
                  {card.title}
                </h3>

                {/* Description */}
                <p
                  className="font-body text-neutral-400 leading-relaxed mb-6 flex-grow"
                  style={{
                    fontSize: cardsDesign.description.fontSize,
                    color: designTokens.colors.neutral[400],
                    lineHeight: cardsDesign.description.lineHeight,
                    marginBottom: cardsDesign.description.marginBottom,
                  }}
                >
                  {card.description}
                </p>

                {/* Link */}
                <div
                  className="font-mono text-primary uppercase"
                  style={{
                    fontSize: cardsDesign.link.fontSize,
                    color: designTokens.colors.brand.primary,
                  }}
                >
                  {card.link}
                </div>
              </div>

              {/* Hover background overlay */}
              <div
                className={cn(
                  'absolute inset-0 -z-10 opacity-0',
                  'group-hover:opacity-100 transition-opacity duration-500',
                  'pointer-events-none'
                )}
                style={{
                  background: `${designTokens.colors.neutral[900]} / 0.3`,
                }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
