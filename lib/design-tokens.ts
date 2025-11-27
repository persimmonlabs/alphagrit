/**
 * AlphaGrit Design Tokens
 *
 * Centralized design system tokens extracted from the existing landing page.
 * All hardcoded values are now configurable from this single source of truth.
 */

export const colors = {
  // Brand Colors
  brand: {
    primary: 'hsl(16 100% 50%)',      // Safety Orange
    primaryRgb: 'rgb(255, 102, 0)',
    black: '#000000',
    white: '#FFFFFF',
  },

  // Neutral Scale (from Tailwind neutral)
  neutral: {
    50: 'rgb(250, 250, 250)',
    100: 'rgb(245, 245, 245)',
    200: 'rgb(229, 229, 229)',
    300: 'rgb(212, 212, 212)',
    400: 'rgb(163, 163, 163)',
    500: 'rgb(115, 115, 115)',
    600: 'rgb(82, 82, 82)',
    700: 'rgb(64, 64, 64)',
    800: 'rgb(38, 38, 38)',
    900: 'rgb(23, 23, 23)',
    950: 'rgb(10, 10, 10)',
  },

  // Semantic Colors
  background: '0 0% 0%',              // Pure Black (HSL)
  foreground: '0 0% 100%',            // Pure White (HSL)
  muted: '0 0% 40%',
  border: '0 0% 12%',
} as const;

export const typography = {
  // Font Families (CSS Variables from globals.css)
  fontFamily: {
    heading: 'var(--font-heading)',    // Oswald
    body: 'var(--font-body)',          // Manrope
    mono: 'var(--font-mono)',          // JetBrains Mono
  },

  // Font Sizes (extracted from landing page)
  fontSize: {
    // Display Sizes (Hero Text)
    displayHero: 'clamp(4rem, 13vw, 12rem)',  // Responsive 13vw
    display2xl: 'clamp(3rem, 9vw, 9rem)',
    displayXl: 'clamp(2.5rem, 8vw, 8rem)',
    displayLg: 'clamp(2rem, 7vw, 7rem)',
    displayMd: 'clamp(1.75rem, 6vw, 6rem)',
    displaySm: 'clamp(1.5rem, 5vw, 5rem)',

    // Standard Sizes
    '9xl': '8rem',      // 128px
    '8xl': '6rem',      // 96px
    '7xl': '4.5rem',    // 72px
    '6xl': '3.75rem',   // 60px
    '5xl': '3rem',      // 48px
    '4xl': '2.25rem',   // 36px
    '3xl': '1.875rem',  // 30px
    '2xl': '1.5rem',    // 24px
    xl: '1.25rem',      // 20px
    lg: '1.125rem',     // 18px
    base: '1rem',       // 16px
    sm: '0.875rem',     // 14px
    xs: '0.75rem',      // 12px
    '2xs': '0.625rem',  // 10px
  },

  // Line Heights
  lineHeight: {
    ultraTight: '0.85',   // Hero text
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
    loose: '2',
  },

  // Letter Spacing
  letterSpacing: {
    tightest: '-0.05em',
    tighter: '-0.025em',
    tight: '-0.0125em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.15em',    // Monospace accents
  },

  // Font Weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
} as const;

export const spacing = {
  // Extracted from px-* and py-* values
  padding: {
    xs: '0.5rem',    // 8px
    sm: '1rem',      // 16px
    md: '1.5rem',    // 24px
    lg: '2rem',      // 32px
    xl: '3rem',      // 48px
    '2xl': '4rem',   // 64px
    '3xl': '6rem',   // 96px
    '4xl': '8rem',   // 128px
  },

  // Gap values from flex/grid
  gap: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
  },

  // Section padding
  section: {
    sm: '3rem 0',    // py-12
    md: '4rem 0',    // py-16
    lg: '6rem 0',    // py-24
    xl: '8rem 0',    // py-32
  },
} as const;

export const layout = {
  // Container widths
  container: {
    max: '1400px',
    lg: '1200px',
    md: '960px',
    sm: '640px',
  },

  // Heights
  height: {
    header: '5rem',      // 80px
    button: {
      sm: '2.5rem',      // 40px
      md: '3rem',        // 48px
      lg: '3.5rem',      // 56px
      xl: '4rem',        // 64px
    },
  },

  // Widths
  width: {
    full: '100%',
    half: '50%',
    productImage: '60%',
  },
} as const;

export const borderRadius = {
  none: '0px',         // Default AlphaGrit style
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',      // Only for CTAs
} as const;

export const borderWidth = {
  none: '0',
  thin: '1px',
  normal: '2px',
  thick: '4px',
} as const;

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
} as const;

export const animation = {
  // Duration values from transitions
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
  },

  // Easing functions
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    linear: 'linear',
  },

  // Hover shifts
  hover: {
    translateY: '-0.125rem',   // -2px
    translateX: '1rem',        // 16px (used in Trinity cards)
    opacity: '0.5',
  },
} as const;

export const opacity = {
  full: '1',
  high: '0.9',
  medium: '0.5',
  low: '0.3',
  veryLow: '0.1',
  subtle: '0.05',
} as const;

// Breakpoints (from Tailwind default)
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Z-index scale
export const zIndex = {
  hide: '-1',
  base: '0',
  dropdown: '10',
  sticky: '20',
  fixed: '30',
  modalBackdrop: '40',
  modal: '50',
  popover: '60',
  tooltip: '70',
} as const;

// AlphaGrit-specific presets
export const presets = {
  // Header styles
  header: {
    height: layout.height.header,
    background: 'transparent',
    mixBlendMode: 'difference',
    position: 'fixed',
    zIndex: zIndex.fixed,
  },

  // Hero section
  hero: {
    minHeight: '100vh',
    fontSize: typography.fontSize.displayHero,
    lineHeight: typography.lineHeight.ultraTight,
    letterSpacing: typography.letterSpacing.tighter,
    fontWeight: typography.fontWeight.black,
  },

  // CTA buttons
  cta: {
    primary: {
      background: colors.brand.white,
      color: colors.brand.black,
      borderRadius: borderRadius.full,
      padding: `${spacing.padding.md} ${spacing.padding.xl}`,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      transition: `all ${animation.duration.normal} ${animation.easing.ease}`,
    },
    secondary: {
      background: 'transparent',
      color: colors.brand.white,
      textDecoration: 'underline',
      textUnderlineOffset: '4px',
    },
  },

  // Trinity cards
  trinityCard: {
    border: `${borderWidth.thin} solid ${colors.neutral[900]}`,
    borderRadius: borderRadius.none,
    padding: spacing.padding['2xl'],
    transition: `colors ${animation.duration.slow} ${animation.easing.ease}`,
    hover: {
      background: `${colors.neutral[900]} / 0.3`,
    },
  },

  // Featured product section
  featuredProduct: {
    layout: 'grid',
    gridColumns: '1fr 1fr',
    gap: spacing.gap['2xl'],
    padding: spacing.section.lg,
  },
} as const;

// Export all tokens as a single object
export const designTokens = {
  colors,
  typography,
  spacing,
  layout,
  borderRadius,
  borderWidth,
  shadows,
  animation,
  opacity,
  breakpoints,
  zIndex,
  presets,
} as const;

export default designTokens;
