<objective>
Massively improve the ebook visualizer UI to be modern, mobile-first, intuitive, and visually stunning with proper hierarchy. This is a Next.js 14 e-commerce platform for ebooks with a subscription model. The current implementation works but lacks visual polish and modern design patterns.
</objective>

<context>
This is an ebook reading platform built with:
- Next.js 14 (App Router), TypeScript
- Tailwind CSS with shadcn/ui design tokens
- Dark mode by default (pure black background #000)
- Primary color: Safety Orange (hsl 16 100% 50%)
- Font families: heading (uppercase, tight tracking), body (sans-serif)
- Current border-radius: 0px (sharp corners)

Key files to modify:
@components/ebook/layouts/ChapterLayout.tsx
@components/ebook/layouts/EbookNavigation.tsx
@components/ebook/BlockRenderer.tsx
@components/ebook/RichContentRenderer.tsx
@components/ebook/blocks/TextBlock.tsx
@components/ebook/blocks/QuoteBlock.tsx
@components/ebook/blocks/CalloutBlock.tsx
@app/[lang]/ebooks/page.tsx (catalog)
@app/[lang]/ebooks/[slug]/page.tsx (ebook detail)
@app/[lang]/ebooks/[slug]/[chapterSlug]/page.tsx (chapter reader)
@components/templates/ebook/EbookReaderTemplate.tsx
</context>

<requirements>
1. MOBILE-FIRST: Design for mobile screens first, then enhance for desktop. Touch-friendly tap targets, proper spacing, readable text on small screens.

2. VISUAL HIERARCHY: Establish clear content hierarchy with:
   - Distinct heading levels (h1 > h2 > h3) with proper size ratios
   - Breathing room between sections (use whitespace strategically)
   - Visual weight for important elements (CTAs, current chapter, etc.)
   - Subtle visual cues for navigation state (active, hover, locked)

3. TYPOGRAPHY IMPROVEMENTS:
   - Optimal reading line-length (max 65-75 characters)
   - Proper line-height for body text (1.6-1.8 for readability)
   - Size progression that works on mobile (base 16px, scale up)
   - First paragraph drop cap or emphasis for chapter starts

4. CHAPTER READER REFINEMENTS:
   - Sticky header: smaller, less intrusive, essential info only
   - Reading progress indicator (thin line or percentage)
   - Improved prev/next navigation cards (cleaner, less cluttered)
   - Better content spacing between blocks
   - Smooth scroll behavior

5. CATALOG & DETAIL PAGE IMPROVEMENTS:
   - Grid layout with proper gaps and card sizing
   - Cover images with subtle hover effects (not jarring)
   - Clear subscription CTA hierarchy
   - Better table of contents styling (chapters list)

6. NAVIGATION SIDEBAR (EbookReaderTemplate):
   - Cleaner chapter list with better spacing
   - Subtle active state (not overpowering)
   - Progress bar that feels integrated
   - Mobile drawer: better animation, proper close handling

7. CONTENT BLOCKS (TextBlock, QuoteBlock, CalloutBlock):
   - More refined styling that matches the minimal aesthetic
   - Better spacing between blocks
   - Subtle borders/backgrounds that don't compete with content
   - Quote blocks: elegant, minimal, impactful
   - Callouts: clear but not shouting
</requirements>

<constraints>
- Maintain existing functionality - this is UI improvement only
- Keep the black background and orange accent (brand colors)
- Use existing Tailwind classes and design tokens where possible
- Stay consistent with shadcn/ui patterns
- No new dependencies - work with existing stack
- Keep sharp corners (--radius: 0px) - it's intentional
- Preserve i18n (en/pt) support
- Don't break mobile responsiveness - improve it
</constraints>

<implementation>
Focus on these high-impact changes:

1. **Typography Scale** (RichContentRenderer.tsx):
   - Increase body text size on mobile
   - Better heading hierarchy with more contrast
   - Improved prose classes for readability
   - Max-width constraint for optimal line length

2. **Chapter Reader** ([chapterSlug]/page.tsx):
   - Compact sticky header with just essentials
   - Reading progress bar (thin, at top)
   - Better spacing in article content
   - Refined navigation cards at bottom

3. **Catalog Grid** (ebooks/page.tsx):
   - Better card aspect ratios
   - Refined hover states
   - Cleaner metadata display
   - Mobile: full-width cards or 2-col tight grid

4. **Ebook Detail** ([slug]/page.tsx):
   - Hero section with better proportions
   - Cleaner chapter list styling
   - Better CTA button placement
   - Improved locked chapter indicators

5. **Navigation Sidebar** (EbookNavigation.tsx, EbookReaderTemplate.tsx):
   - Tighter chapter list
   - Better active/completed states
   - Cleaner mobile drawer
   - Progress section more subtle

6. **Content Blocks**:
   - QuoteBlock: elegant left border, subtle background
   - CalloutBlock: minimal, just colored left border
   - TextBlock: proper prose styling
</implementation>

<output>
Modify the existing files in place. Do not create new files unless absolutely necessary.

Key files to edit:
- `./components/ebook/RichContentRenderer.tsx`
- `./components/ebook/layouts/ChapterLayout.tsx`
- `./components/ebook/layouts/EbookNavigation.tsx`
- `./components/ebook/blocks/TextBlock.tsx`
- `./components/ebook/blocks/QuoteBlock.tsx`
- `./components/ebook/blocks/CalloutBlock.tsx`
- `./app/[lang]/ebooks/page.tsx`
- `./app/[lang]/ebooks/[slug]/page.tsx`
- `./app/[lang]/ebooks/[slug]/[chapterSlug]/page.tsx`
- `./components/templates/ebook/EbookReaderTemplate.tsx`
</output>

<verification>
Before completing, verify:
1. Run `npm run build` to ensure no TypeScript errors
2. Run `npm run lint` to check for linting issues
3. Test on mobile viewport (375px width) - content should be readable and touch-friendly
4. Test on desktop (1440px width) - layout should use space effectively
5. Verify chapter navigation works correctly
6. Confirm reading progress and chapter states display properly
7. Check that locked/free chapter states are visually distinct
</verification>

<success_criteria>
- Typography is readable and has clear hierarchy
- Mobile experience feels native and touch-friendly
- Visual design is minimal but polished
- Navigation is intuitive and unobtrusive
- Content blocks are refined and consistent
- No regressions in functionality
- Build passes without errors
</success_criteria>
