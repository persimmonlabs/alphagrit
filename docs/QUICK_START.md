# 🚀 AlphaGrit Component Library - Quick Start Guide

## What Was Done

The AlphaGrit landing page has been **completely refactored** from 147 lines of hardcoded JSX to a clean, component-based architecture:

**Before:**
```tsx
// app/[lang]/page.tsx (147 lines)
<div className="text-[13vw] leading-[0.85]">...</div>
```

**After:**
```tsx
// app/[lang]/page.tsx (28 lines)
<AlphaGritLandingTemplate content={dict} lang={lang} />
```

## File Structure

```
alphagrit/
├── components/
│   ├── library/              # 22 generic SaaS components
│   │   ├── atoms/           # Basic building blocks
│   │   ├── molecules/       # Composed components
│   │   ├── organisms/       # Complex sections
│   │   └── templates/       # Complete pages
│   ├── organisms/           # 5 AlphaGrit-specific components
│   │   ├── AlphaGritNavigation.tsx
│   │   ├── AlphaGritHero.tsx
│   │   ├── TrinityCards.tsx
│   │   ├── FeaturedProduct.tsx
│   │   └── AlphaGritFooter.tsx
│   └── templates/
│       └── AlphaGritLandingTemplate.tsx
├── config/
│   ├── design-config.ts     # Component styling presets
│   └── landing-content.ts   # Content structure & types
├── lib/
│   └── design-tokens.ts     # ALL design values (colors, fonts, spacing)
└── docs/
    ├── COMPONENT_LIBRARY_INTEGRATION.md  # Full documentation
    ├── VALIDATION_REPORT.md              # Validation results
    └── QUICK_START.md                    # This file
```

## How to Use

### 1. Update Design System-Wide

**Change brand color:**
```typescript
// lib/design-tokens.ts
export const colors = {
  brand: {
    primary: 'hsl(16 100% 50%)',  // ← Change this value
  }
};
```

**Update typography:**
```typescript
// lib/design-tokens.ts
export const typography = {
  fontSize: {
    displayHero: 'clamp(4rem, 13vw, 12rem)',  // ← Adjust hero size
  }
};
```

**Modify spacing:**
```typescript
// lib/design-tokens.ts
export const spacing = {
  padding: {
    xl: '3rem',  // ← Changes everywhere xl is used
  }
};
```

### 2. Update Content

**Edit text content:**
```typescript
// content/en.ts or content/pt.ts
export default {
  hero: {
    title_line1: "Your New Title",
    title_line2: "Your Subtitle",
    description: "Your description...",
  }
}
```

### 3. Customize Component Styling

**Adjust component-specific styles:**
```typescript
// config/design-config.ts
export const alphaGritDesign = {
  components: {
    hero: {
      minHeight: '100vh',
      titleSize: designTokens.typography.fontSize.displayHero,
      // ← Modify these presets
    }
  }
};
```

### 4. Create New Pages

**Step 1:** Define content structure in `config/`
```typescript
// config/products-content.ts
export interface ProductPageContent {
  title: string;
  products: Product[];
}
```

**Step 2:** Create template in `components/templates/`
```tsx
// components/templates/ProductPageTemplate.tsx
export default function ProductPageTemplate({ content }) {
  return (
    <>
      <AlphaGritNavigation />
      <ProductGrid products={content.products} />
      <AlphaGritFooter />
    </>
  );
}
```

**Step 3:** Use in your page
```tsx
// app/[lang]/products/page.tsx
export default async function ProductsPage({ params: { lang } }) {
  const dict = await getDictionary(lang);
  return <ProductPageTemplate content={dict.products} lang={lang} />;
}
```

## Available Components

### AlphaGrit-Specific Organisms (Use These!)

1. **AlphaGritNavigation** - Mix-blend-difference header
   ```tsx
   <AlphaGritNavigation content={nav} currentLang={lang} />
   ```

2. **AlphaGritHero** - Massive headline section
   ```tsx
   <AlphaGritHero content={hero} />
   ```

3. **TrinityCards** - Three-column bordered cards
   ```tsx
   <TrinityCards content={trinity} />
   ```

4. **FeaturedProduct** - 50/50 split product showcase
   ```tsx
   <FeaturedProduct content={product} />
   ```

5. **AlphaGritFooter** - Minimal footer
   ```tsx
   <AlphaGritFooter content={footer} />
   ```

### Generic Component Library (22 Components)

Located in `components/library/` - ready to use for new pages:

**Atoms:** Alert, Badge, Button, Card, Container, Divider, Icon, Input, Spinner, Text

**Molecules:** FeatureCard, GradientText, IconBox, Logo, PricingCard, Testimonial

**Organisms:** BackgroundAtmosphere, CTASection, Footer, HeroSection, Navigation

## Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## Key Benefits

### ✅ No Hardcoded Values
Every color, size, spacing value is in `lib/design-tokens.ts`

### ✅ Type-Safe
Full TypeScript support with proper interfaces

### ✅ i18n Compatible
Works seamlessly with existing EN/PT dictionaries

### ✅ Fully Reusable
Components ready for Products page, Manifesto page, etc.

### ✅ Maintainable
Change design system-wide from single files

### ✅ Production-Ready
Build passes with 0 errors

## Design Token Categories

**Colors:**
- `colors.brand.primary` - Safety orange
- `colors.brand.black/white` - Pure black/white
- `colors.neutral[50-950]` - Gray scale

**Typography:**
- `typography.fontSize.*` - 30+ size variants
- `typography.lineHeight.*` - Line heights
- `typography.fontFamily.*` - Oswald, Manrope, JetBrains Mono

**Spacing:**
- `spacing.padding.*` - xs to 4xl
- `spacing.gap.*` - xs to 2xl
- `spacing.section.*` - sm to xl

**Layout:**
- `layout.container.max` - 1400px
- `layout.height.header` - 5rem

**Animations:**
- `animation.duration.*` - Timing
- `animation.easing.*` - Easing functions

## Common Tasks

### Change Brand Color
**File:** `lib/design-tokens.ts:70`
```typescript
primary: 'hsl(16 100% 50%)',  // Your new color
```

### Adjust Hero Text Size
**File:** `lib/design-tokens.ts:95`
```typescript
displayHero: 'clamp(4rem, 13vw, 12rem)',  // Your new size
```

### Update Navigation Links
**File:** `content/en.ts` and `content/pt.ts`
```typescript
navigation: {
  links: [
    { label: 'New Link', href: '/new' }
  ]
}
```

### Add New Trinity Card
**File:** `content/en.ts` and `content/pt.ts`
```typescript
trinity: {
  cards: [
    { number: '04', title: 'New Card', ... }
  ]
}
```

## Validation Status

✅ **All systems operational**

- TypeScript compilation: PASSED
- Production build: PASSED
- i18n integration: PASSED
- Component verification: PASSED
- Code quality: PASSED

**Build Output:**
- 0 TypeScript errors
- 0 ESLint errors
- Both `/en` and `/pt` routes generated successfully

## Next Steps

### Immediate
1. Run `npm run dev` and visually inspect the landing page
2. Test responsive design at all breakpoints
3. Test language switching (EN ↔ PT)

### Short-term
1. Create Products page using component library
2. Build Manifesto page reusing organisms
3. Add more sections (testimonials, FAQ)

### Long-term
1. Expand component library with e-commerce components
2. Create checkout flow
3. Build user dashboard
4. Add Storybook documentation

## Support

**Documentation:**
- Full guide: `COMPONENT_LIBRARY_INTEGRATION.md`
- Validation report: `VALIDATION_REPORT.md`

**Key Files:**
- Design tokens: `lib/design-tokens.ts` - All values
- Component config: `config/design-config.ts` - Styling presets
- Content types: `config/landing-content.ts` - TypeScript interfaces

---

**Built with care to preserve AlphaGrit's unique tech-dystopian aesthetic while enabling infinite customization and scalability.**
