/**
 * AlphaGrit Landing Page Content Configuration
 *
 * This file defines the structure and default content for the landing page.
 * Content can be overridden by i18n dictionaries (en.ts, pt.ts).
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface LanguageOption {
  code: string;
  label: string;
}

export interface NavigationContent {
  logo: string;
  links: NavLink[];
  adminLink?: NavLink;
  languages: LanguageOption[];
}

export interface HeroContent {
  title_line1: string;
  title_line2: string;
  description: string;
  cta_primary: string;
  cta_secondary: string;
  cta_primary_href?: string;
  cta_secondary_href?: string;
}

export interface TrinityCardContent {
  number: string;
  title: string;
  description: string;
  link: string;
  href?: string;
}

export interface TrinityContent {
  cards: [TrinityCardContent, TrinityCardContent, TrinityCardContent];
}

export interface FeaturedProductContent {
  label: string;
  title: string;
  product_description: string;
  features: string[];
  cta: string;
  price: string;
  image_placeholder?: string;
  href?: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterContent {
  copyright: string;
  location: string;
  links: FooterLink[];
}

export interface BlogContent {
  title: string;
  cta: string;
  href?: string;
}

export interface LandingPageContent {
  navigation: NavigationContent;
  hero: HeroContent;
  trinity: TrinityContent;
  featured: FeaturedProductContent;
  blog: BlogContent;
  footer: FooterContent;
}

// Default content structure (will be populated from i18n dictionaries)
export const defaultLandingContent: LandingPageContent = {
  navigation: {
    logo: 'ALPHAGRIT',
    links: [
      { label: '[BLOG]', href: '/en/blog' },
      { label: '[EBOOKS]', href: '/en/ebooks' },
    ],
    adminLink: { label: '[LOGIN]', href: '/en/auth/login' },
    languages: [
      { code: 'en', label: 'EN' },
      { code: 'pt', label: 'PT' },
    ],
  },

  hero: {
    title_line1: 'Rewrite',
    title_line2: 'The Source Code',
    description: 'The modern world is designed to keep you weak. Overworked. Underpaid. Addicted. Broke. Exhausted. Disconnected from your body, trapped by dopamine loops, and enslaved by a system that profits from your mediocrity.',
    cta_primary: 'Initialize Protocol',
    cta_secondary: 'View Catalog',
    cta_primary_href: '/en/auth/signup',
    cta_secondary_href: '/en/ebooks',
  },

  trinity: {
    cards: [
      {
        number: '01',
        title: 'The Body',
        description: 'Physical sovereignty through movement, nutrition, and metabolic optimization. Build the machine that carries your mission.',
        link: 'Access Data >>',
        href: '/en/products',
      },
      {
        number: '02',
        title: 'The Mind',
        description: 'Dopamine control, focus architecture, and neural rewiring. Break free from algorithmic addiction and mental weakness.',
        link: 'Access Data >>',
        href: '/en/products',
      },
      {
        number: '03',
        title: 'The Code',
        description: 'Financial independence through skills that scale. Learn to build, deploy, and monetize systems that work while you sleep.',
        link: 'Access Data >>',
        href: '/en/products',
      },
    ],
  },

  featured: {
    label: '[LATEST_DROP]',
    title: 'Unconnected Society',
    product_description: 'The complete manual for disconnecting from digital slavery and reconnecting with reality. 200+ pages of tactical protocols for men ready to reclaim their time, attention, and autonomy.',
    features: [
      '200+ Pages of Tactics',
      'Audio Companion',
      'Lifetime Updates',
      'Community Access',
    ],
    cta: 'Secure Access',
    price: '$97',
    image_placeholder: 'VQ',
    href: '/en/products',
  },

  blog: {
    title: 'Recent Blog Posts',
    cta: 'Read All Posts',
    href: '/en/blog',
  },

  footer: {
    copyright: 'ALPHAGRIT © 2025',
    location: '[SECURE CONNECTION]',
    links: [
      { label: 'INSTAGRAM', href: 'https://instagram.com/alphagrit' },
      { label: 'TWITTER', href: 'https://twitter.com/alphagrit' },
    ],
  },
};

/**
 * Helper function to merge i18n content with default structure
 * @param dict - i18n dictionary
 * @param lang - current language code (for building language-aware routes)
 */
export function mergeLandingContent(
  dict: Record<string, any>,
  lang: string = 'en'
): LandingPageContent {
  // Build language-aware routes
  const buildRoute = (basePath: string) => {
    if (basePath.startsWith('http')) return basePath; // Don't modify external URLs
    return `/${lang}${basePath}`;
  };

  return {
    navigation: {
      logo: dict.navigation?.logo || defaultLandingContent.navigation.logo,
      links: [
        {
          label: dict.nav?.blog || '[BLOG]',
          href: buildRoute('/blog')
        },
        {
          label: dict.nav?.ebooks || '[EBOOKS]',
          href: buildRoute('/ebooks')
        },
      ],
      adminLink: {
        label: dict.nav?.login || '[LOGIN]',
        href: buildRoute('/auth/login')
      },
      languages: defaultLandingContent.navigation.languages,
    },

    hero: {
      title_line1: dict.hero?.title_line1 || defaultLandingContent.hero.title_line1,
      title_line2: dict.hero?.title_line2 || defaultLandingContent.hero.title_line2,
      description: dict.hero?.description || defaultLandingContent.hero.description,
      cta_primary: dict.hero?.cta_primary || defaultLandingContent.hero.cta_primary,
      cta_secondary: dict.hero?.cta_secondary || defaultLandingContent.hero.cta_secondary,
      cta_primary_href: buildRoute('/auth/signup'),
      cta_secondary_href: buildRoute('/ebooks'),
    },

    trinity: {
      cards: [
        {
          number: '01',
          title: dict.cards?.body?.title || defaultLandingContent.trinity.cards[0].title,
          description: dict.cards?.body?.desc || defaultLandingContent.trinity.cards[0].description,
          link: dict.cards?.body?.link || defaultLandingContent.trinity.cards[0].link,
          href: buildRoute('/products'),
        },
        {
          number: '02',
          title: dict.cards?.mind?.title || defaultLandingContent.trinity.cards[1].title,
          description: dict.cards?.mind?.desc || defaultLandingContent.trinity.cards[1].description,
          link: dict.cards?.mind?.link || defaultLandingContent.trinity.cards[1].link,
          href: buildRoute('/products'),
        },
        {
          number: '03',
          title: dict.cards?.code?.title || defaultLandingContent.trinity.cards[2].title,
          description: dict.cards?.code?.desc || defaultLandingContent.trinity.cards[2].description,
          link: dict.cards?.code?.link || defaultLandingContent.trinity.cards[2].link,
          href: buildRoute('/products'),
        },
      ],
    },

    featured: {
      label: dict.featured?.label || defaultLandingContent.featured.label,
      title: dict.featured?.title || defaultLandingContent.featured.title,
      product_description: dict.featured?.product_desc || defaultLandingContent.featured.product_description,
      features: dict.featured?.features || defaultLandingContent.featured.features,
      cta: dict.featured?.cta || defaultLandingContent.featured.cta,
      price: dict.featured?.price || defaultLandingContent.featured.price,
      image_placeholder: defaultLandingContent.featured.image_placeholder,
      href: buildRoute('/products'),
    },

    blog: {
      title: dict.blog?.title || defaultLandingContent.blog.title,
      cta: dict.blog?.cta || defaultLandingContent.blog.cta,
      href: buildRoute('/blog'),
    },

    footer: {
      copyright: dict.footer?.rights || defaultLandingContent.footer.copyright,
      location: dict.footer?.location || defaultLandingContent.footer.location,
      links: defaultLandingContent.footer.links,
    },
  };
}

export default defaultLandingContent;
