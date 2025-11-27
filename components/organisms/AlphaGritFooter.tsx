'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { FooterContent } from '@/config/landing-content';
import alphaGritDesign from '@/config/design-config';
import designTokens from '@/lib/design-tokens';

interface AlphaGritFooterProps {
  content: FooterContent;
}

/**
 * AlphaGrit Footer Component
 *
 * Minimal footer with copyright, location, and social links.
 * Uses monospace font styling consistent with AlphaGrit aesthetic.
 */
export default function AlphaGritFooter({ content }: AlphaGritFooterProps) {
  const footerDesign = alphaGritDesign.components.footer;

  return (
    <footer
      className="w-full"
      style={{
        borderTop: footerDesign.borderTop,
        padding: footerDesign.padding,
      }}
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: designTokens.layout.container.max,
        }}
      >
        <div
          className={cn(
            'flex flex-col md:flex-row items-center justify-between',
            'gap-4 md:gap-8'
          )}
          style={{
            fontSize: footerDesign.fontSize,
            fontFamily: footerDesign.fontFamily,
            color: footerDesign.color,
          }}
        >
          {/* Copyright */}
          <div className="font-mono text-xs tracking-widest">
            {content.copyright}
          </div>

          {/* Location */}
          <div className="font-mono text-xs tracking-widest">
            {content.location}
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            {content.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'font-mono text-xs tracking-widest',
                  'hover:text-white hover:opacity-70',
                  'transition-opacity duration-300'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
