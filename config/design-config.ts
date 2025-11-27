/**
 * AlphaGrit Design Configuration
 *
 * Visual design settings specific to AlphaGrit's brand aesthetic.
 * These settings control the look and feel of all components.
 */

import { designTokens } from '@/lib/design-tokens';

export const alphaGritDesign = {
  // Global theme settings
  theme: {
    mode: 'dark' as const,
    background: designTokens.colors.brand.black,
    foreground: designTokens.colors.brand.white,
    accent: designTokens.colors.brand.primary,
  },

  // Typography presets
  typography: {
    heading: {
      fontFamily: designTokens.typography.fontFamily.heading,
      textTransform: 'uppercase' as const,
      letterSpacing: designTokens.typography.letterSpacing.tighter,
      fontWeight: designTokens.typography.fontWeight.bold,
    },
    body: {
      fontFamily: designTokens.typography.fontFamily.body,
      lineHeight: designTokens.typography.lineHeight.relaxed,
    },
    mono: {
      fontFamily: designTokens.typography.fontFamily.mono,
      fontSize: designTokens.typography.fontSize.xs,
      letterSpacing: designTokens.typography.letterSpacing.widest,
      textTransform: 'uppercase' as const,
    },
  },

  // Component-specific styling
  components: {
    // Navigation/Header
    navigation: {
      position: 'fixed' as const,
      mixBlendMode: 'difference' as const,
      height: designTokens.layout.height.header,
      padding: `${designTokens.spacing.padding.md} ${designTokens.spacing.padding.lg}`,
      zIndex: designTokens.zIndex.fixed,
    },

    // Logo
    logo: {
      fontSize: designTokens.typography.fontSize['2xl'],
      fontWeight: designTokens.typography.fontWeight.bold,
      letterSpacing: designTokens.typography.letterSpacing.tighter,
      textTransform: 'uppercase' as const,
    },

    // Navigation Links
    navLinks: {
      fontSize: designTokens.typography.fontSize.xs,
      fontFamily: designTokens.typography.fontFamily.mono,
      letterSpacing: designTokens.typography.letterSpacing.widest,
      textTransform: 'uppercase' as const,
      gap: designTokens.spacing.gap.xl,
    },

    // Language Switcher
    languageSwitcher: {
      fontSize: designTokens.typography.fontSize.xs,
      fontFamily: designTokens.typography.fontFamily.mono,
      gap: designTokens.spacing.gap.sm,
    },

    // Hero Section
    hero: {
      minHeight: '100vh',
      padding: designTokens.spacing.section.xl,
      titleSize: designTokens.typography.fontSize.displayHero,
      titleLineHeight: designTokens.typography.lineHeight.ultraTight,
      titleLetterSpacing: designTokens.typography.letterSpacing.tighter,
      titleFontWeight: designTokens.typography.fontWeight.black,
      descriptionMaxWidth: designTokens.layout.container.md,
      descriptionColor: designTokens.colors.neutral[400],
    },

    // Buttons
    button: {
      primary: {
        background: designTokens.colors.brand.white,
        color: designTokens.colors.brand.black,
        borderRadius: designTokens.borderRadius.full,
        padding: `${designTokens.spacing.padding.md} ${designTokens.spacing.padding.xl}`,
        fontSize: designTokens.typography.fontSize.base,
        fontWeight: designTokens.typography.fontWeight.semibold,
        height: '3.5rem',
        hover: {
          background: designTokens.colors.neutral[200],
        },
      },
      secondary: {
        background: 'transparent',
        color: designTokens.colors.brand.white,
        textDecoration: 'underline',
        textUnderlineOffset: '4px',
        hover: {
          opacity: designTokens.opacity.medium,
        },
      },
      featured: {
        background: designTokens.colors.brand.primary,
        color: designTokens.colors.brand.black,
        borderRadius: designTokens.borderRadius.full,
        padding: `${designTokens.spacing.padding.lg} ${designTokens.spacing.padding['3xl']}`,
        fontSize: designTokens.typography.fontSize.lg,
        fontWeight: designTokens.typography.fontWeight.bold,
        height: '4rem',
        hover: {
          background: designTokens.colors.brand.white,
        },
      },
    },

    // Trinity Cards
    trinityCards: {
      container: {
        padding: designTokens.spacing.section.lg,
      },
      card: {
        border: `${designTokens.borderWidth.thin} solid ${designTokens.colors.neutral[900]}`,
        borderRadius: designTokens.borderRadius.none,
        padding: designTokens.spacing.padding['2xl'],
        transition: `colors ${designTokens.animation.duration.slow} ${designTokens.animation.easing.ease}`,
        hover: {
          background: `${designTokens.colors.neutral[900]} / 0.3`,
        },
      },
      number: {
        fontSize: designTokens.typography.fontSize.base,
        fontFamily: designTokens.typography.fontFamily.mono,
        color: designTokens.colors.neutral[600],
        marginBottom: designTokens.spacing.gap.lg,
      },
      title: {
        fontSize: {
          mobile: designTokens.typography.fontSize['5xl'],
          desktop: designTokens.typography.fontSize['7xl'],
        },
        marginBottom: designTokens.spacing.gap.md,
        transition: `margin-left ${designTokens.animation.duration.normal} ${designTokens.animation.easing.ease}`,
        hover: {
          marginLeft: designTokens.spacing.gap.md,
        },
      },
      description: {
        fontSize: designTokens.typography.fontSize.lg,
        color: designTokens.colors.neutral[400],
        lineHeight: designTokens.typography.lineHeight.relaxed,
        marginBottom: designTokens.spacing.gap.lg,
      },
      link: {
        fontSize: designTokens.typography.fontSize.sm,
        fontFamily: designTokens.typography.fontFamily.mono,
        color: designTokens.colors.brand.primary,
        textTransform: 'uppercase' as const,
      },
    },

    // Featured Product
    featuredProduct: {
      container: {
        padding: designTokens.spacing.section.lg,
      },
      layout: {
        display: 'grid',
        gridTemplateColumns: {
          mobile: '1fr',
          desktop: '1fr 1fr',
        },
        gap: designTokens.spacing.gap['2xl'],
      },
      imageContainer: {
        aspectRatio: '3/4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: designTokens.colors.neutral[900],
      },
      imagePlaceholder: {
        fontSize: designTokens.typography.fontSize['9xl'],
        color: designTokens.colors.neutral[800],
        fontWeight: designTokens.typography.fontWeight.black,
      },
      label: {
        fontSize: designTokens.typography.fontSize.xs,
        fontFamily: designTokens.typography.fontFamily.mono,
        color: designTokens.colors.neutral[500],
        marginBottom: designTokens.spacing.gap.md,
      },
      title: {
        fontSize: {
          mobile: designTokens.typography.fontSize['6xl'],
          desktop: designTokens.typography.fontSize['8xl'],
        },
        fontWeight: designTokens.typography.fontWeight.black,
        lineHeight: designTokens.typography.lineHeight.tight,
        marginBottom: designTokens.spacing.gap.lg,
      },
      description: {
        fontSize: designTokens.typography.fontSize.lg,
        color: designTokens.colors.neutral[400],
        lineHeight: designTokens.typography.lineHeight.relaxed,
        marginBottom: designTokens.spacing.gap.xl,
      },
      featureList: {
        gap: designTokens.spacing.gap.md,
        marginBottom: designTokens.spacing.gap.xl,
      },
      featureBullet: {
        width: '0.375rem',
        height: '0.375rem',
        background: designTokens.colors.brand.primary,
        borderRadius: designTokens.borderRadius.full,
      },
      featureText: {
        fontSize: designTokens.typography.fontSize.base,
        color: designTokens.colors.neutral[300],
      },
      priceContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: designTokens.spacing.gap.lg,
        marginTop: designTokens.spacing.gap.xl,
      },
      price: {
        fontSize: designTokens.typography.fontSize['4xl'],
        fontWeight: designTokens.typography.fontWeight.black,
        color: designTokens.colors.brand.white,
      },
    },

    // Footer
    footer: {
      borderTop: `${designTokens.borderWidth.thin} solid ${designTokens.colors.neutral[900]}`,
      padding: `${designTokens.spacing.padding.xl} ${designTokens.spacing.padding.lg}`,
      fontSize: designTokens.typography.fontSize.xs,
      fontFamily: designTokens.typography.fontFamily.mono,
      color: designTokens.colors.neutral[600],
      gap: designTokens.spacing.gap.lg,
    },
  },

  // Animation presets
  animations: {
    hover: {
      opacity: {
        duration: designTokens.animation.duration.normal,
        easing: designTokens.animation.easing.ease,
      },
      transform: {
        duration: designTokens.animation.duration.normal,
        easing: designTokens.animation.easing.ease,
      },
      colors: {
        duration: designTokens.animation.duration.slow,
        easing: designTokens.animation.easing.ease,
      },
    },
  },

  // Breakpoints
  breakpoints: designTokens.breakpoints,
} as const;

export default alphaGritDesign;
