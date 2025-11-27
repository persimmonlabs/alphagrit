// Mock data for Wagner Nascimento's E-Book Platform
// Bilingual support: Portuguese (PT) and English (EN)

export interface Product {
  id: string;
  name: string;
  name_pt?: string;
  name_en?: string;
  slug: string;
  description_short?: string;
  description_short_pt?: string;
  description_short_en?: string;
  description_full?: string;
  description_full_pt?: string;
  description_full_en?: string;
  cover_image_url?: string;
  price_brl: number;
  price_usd: number;
  rating?: number;
  total_reviews?: number;
  category_id?: string;
  category_pt?: string;
  category_en?: string;
  status: string;
  is_featured?: boolean;
  author?: string;
  pages?: number;
  language?: string;
}

export interface Category {
  id: string;
  name: string;
  name_pt?: string;
  name_en?: string;
  slug: string;
  description?: string;
  description_pt?: string;
  description_en?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  title_pt?: string;
  title_en?: string;
  slug: string;
  excerpt?: string;
  excerpt_pt?: string;
  excerpt_en?: string;
  content?: string;
  content_pt?: string;
  content_en?: string;
  cover_image_url?: string;
  published_at?: string;
  author?: string;
  status?: string;
  category?: string;
  read_time?: number;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  content: string;
  title?: string;
  reviewer_name?: string;
  reviewer_avatar_url?: string;
  is_approved?: boolean;
  is_featured?: boolean;
  created_at?: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at?: string;
}

export interface SiteConfigSetting {
  key: string;
  value: any;
  value_type: string;
  is_public: boolean;
}

export interface FeatureFlag {
  key: string;
  is_enabled: boolean;
}

// Mock Categories
export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Mindset & Philosophy / Mentalidade & Filosofia',
    name_pt: 'Mentalidade & Filosofia',
    name_en: 'Mindset & Philosophy',
    slug: 'mindset-philosophy',
    description_pt: 'Desenvolva uma mentalidade inabalável. Aprenda sobre a filosofia da sociedade desconectada e como escapar da Matrix.',
    description_en: 'Develop an unshakeable mindset. Learn about the philosophy of disconnected society and how to escape the Matrix.',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'cat-2',
    name: 'Training & Transformation / Treinamento & Transformação',
    name_pt: 'Treinamento & Transformação',
    name_en: 'Training & Transformation',
    slug: 'training-transformation',
    description_pt: 'Transforme seu corpo com protocolos Spartan. Do sofá para o imparável.',
    description_en: 'Transform your body with Spartan protocols. From couch to unstoppable.',
    display_order: 2,
    is_active: true,
  },
  {
    id: 'cat-3',
    name: 'Nutrition & Performance / Nutrição & Performance',
    name_pt: 'Nutrição & Performance',
    name_en: 'Nutrition & Performance',
    slug: 'nutrition-performance',
    description_pt: 'Domina o Protocolo Predador: nutrição sem carboidratos essenciais.',
    description_en: 'Master the Predator Protocol: zero essential carbs nutrition.',
    display_order: 3,
    is_active: true,
  },
];

// Mock Products - Wagner's 5 Ebooks
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'UNSTOPPABLE: The Science and Mentality Behind Those Who Never Give Up',
    name_pt: 'IMPARÁVEL: A Ciência e Mentalidade por Trás daqueles que Nunca Desistem',
    name_en: 'UNSTOPPABLE: The Science and Mentality Behind Those Who Never Give Up',
    slug: 'unstoppable-science-mentality',
    description_short_pt: 'Combine filosofia estoica com pesquisa de neurociência. Desbloqueia o Córtex Cingulado Anterior Médio e ativa o Modo Guerra.',
    description_short_en: 'Combine stoic philosophy with neuroscience research. Unlock the anterior mid-cingulate cortex and activate War Mode.',
    description_full_pt: 'UNSTOPPABLE não é apenas outro livro de auto-ajuda. É um manual científico baseado em neurociência e filosofia estoica que mostra exatamente como desenvolver uma mentalidade que nunca desiste. Wagner Nascimento combina décadas de pesquisa neurológica com sabedoria prática para criar um sistema que transforma a forma como você pensa, age e vive. Este não é o caminho da "Matrix" - é o caminho de quem entendeu "O Código" e decidiu sair do sistema.',
    description_full_en: 'UNSTOPPABLE is not just another self-help book. It\'s a scientific manual based on neuroscience and stoic philosophy that shows exactly how to develop a mindset that never gives up. Wagner Nascimento combines decades of neurological research with practical wisdom to create a system that transforms how you think, act, and live. This is not the path of the "Matrix" - it\'s the path of those who understood "The Code" and decided to exit the system.',
    price_brl: 299.90,
    price_usd: 39.99,
    category_id: 'cat-1',
    category_pt: 'Mentalidade & Filosofia',
    category_en: 'Mindset & Philosophy',
    status: 'active',
    is_featured: true,
    rating: 4.9,
    total_reviews: 427,
    author: 'Wagner Nascimento',
    pages: 520,
    cover_image_url: 'https://images.unsplash.com/photo-1507842072343-583f20270319?w=500&h=700&fit=crop',
  },
  {
    id: 'prod-2',
    name: 'THE BLUEPRINT: Premium Edition',
    name_pt: 'THE BLUEPRINT: Edição Premium',
    name_en: 'THE BLUEPRINT: Premium Edition',
    slug: 'the-blueprint-premium',
    description_short_pt: 'Um guia completo para transformação total. Este é o projeto aprovado para aqueles sério sobre mudança real.',
    description_short_en: 'A complete guide to total transformation. This is the blueprint approved for those serious about real change.',
    description_full_pt: 'THE BLUEPRINT é o sistema de transformação completo de Wagner Nascimento. Baseado em mais de 15 anos de experiência, este livro detalha cada aspecto da transformação pessoal - da mentalidade até aos hábitos diários. Aqui você encontra os princípios subjacentes que separam os "imparáveis" do resto. Não há desculpas. Não há "tentar". Apenas ação pura baseada em um plano testado.',
    description_full_en: 'THE BLUEPRINT is Wagner Nascimento\'s complete transformation system. Based on over 15 years of experience, this book details every aspect of personal transformation - from mindset to daily habits. Here you find the underlying principles that separate the "unstoppable" from the rest. No excuses. No "try." Just pure action based on a proven plan.',
    price_brl: 249.90,
    price_usd: 34.99,
    category_id: 'cat-1',
    category_pt: 'Mentalidade & Filosofia',
    category_en: 'Mindset & Philosophy',
    status: 'active',
    is_featured: true,
    rating: 4.8,
    total_reviews: 392,
    author: 'Wagner Nascimento',
    pages: 480,
    cover_image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&h=700&fit=crop',
  },
  {
    id: 'prod-3',
    name: 'WinterArc: Spartan Body Protocol',
    name_pt: 'WinterArc: Protocolo Corpo Spartan',
    name_en: 'WinterArc: Spartan Body Protocol',
    slug: 'winterarc-spartan-body',
    description_short_pt: 'Transformação completa do corpo em 12 semanas. Descer do sofá para Espartano - sem compromissos.',
    description_short_en: 'Complete body transformation in 12 weeks. From couch to Spartan - no compromises.',
    description_full_pt: 'WinterArc é um protocolo de treinamento de 12 semanas que foi testado com centenas de pessoas. Este não é um programa de "ganho rápido" - é um programa de transformação real. Wagner detalha cada sessão de treinamento, cada exercício, cada variação. Você aprenderá a construir disciplina, foco e um corpo que reflete sua mentalidade Spartan. O protocolo foi desenhado para aqueles que estão prontos para verdadeira transformação.',
    description_full_en: 'WinterArc is a 12-week training protocol that has been tested with hundreds of people. This is not a "quick gains" program - it\'s a real transformation program. Wagner details every training session, every exercise, every variation. You will learn to build discipline, focus, and a body that reflects your Spartan mindset. The protocol was designed for those ready for true transformation.',
    price_brl: 199.90,
    price_usd: 29.99,
    category_id: 'cat-2',
    category_pt: 'Treinamento & Transformação',
    category_en: 'Training & Transformation',
    status: 'active',
    is_featured: true,
    rating: 4.7,
    total_reviews: 298,
    author: 'Wagner Nascimento',
    pages: 450,
    cover_image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=700&fit=crop',
  },
  {
    id: 'prod-4',
    name: 'Predator Protocol: The Science of Zero Essential Carbs',
    name_pt: 'Protocolo Predador: A Ciência de Zero Carboidratos Essenciais',
    name_en: 'Predator Protocol: The Science of Zero Essential Carbs',
    slug: 'predator-protocol-nutrition',
    description_short_pt: 'Domine a abordagem nutricional que redefine a performance. Sem desculpas, sem ajustes - apenas predador puro.',
    description_short_en: 'Master the nutritional approach that redefines performance. No excuses, no adjustments - just pure predator.',
    description_full_pt: 'O Protocolo Predador é a abordagem nutricional definitiva para quem está sério sobre performance máxima. Wagner explora a ciência por trás do zero essencial carboidratos - uma abordagem contra-intuitiva mas profundamente eficaz. Você aprenderá qual alimentos comer, quando comê-los, e por quê cada decisão alimentar determina seu nível de performance. Este é comida como arma, não como conforto.',
    description_full_en: 'The Predator Protocol is the definitive nutritional approach for those serious about maximum performance. Wagner explores the science behind zero essential carbs - a counter-intuitive but deeply effective approach. You will learn what foods to eat, when to eat them, and why each dietary decision determines your performance level. This is food as weapon, not comfort.',
    price_brl: 179.90,
    price_usd: 24.99,
    category_id: 'cat-3',
    category_pt: 'Nutrição & Performance',
    category_en: 'Nutrition & Performance',
    status: 'active',
    is_featured: false,
    rating: 4.6,
    total_reviews: 187,
    author: 'Wagner Nascimento',
    pages: 380,
    cover_image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=700&fit=crop',
  },
  {
    id: 'prod-5',
    name: 'The Code: Understanding The Matrix & Escaping the System',
    name_pt: 'The Code: Entendendo a Matrix e Escapando do Sistema',
    name_en: 'The Code: Understanding The Matrix & Escaping the System',
    slug: 'the-code-matrix',
    description_short_pt: 'Por que a maioria das pessoas são servos? Como reconhecer "A Matrix"? Como viver como livre?',
    description_short_en: 'Why are most people slaves? How to recognize "The Matrix"? How to live as free?',
    description_full_pt: 'The Code é a análise filosófica profunda de Wagner sobre a sociedade moderna. Ele disseca como a "Matrix" funciona - os sistemas que mantêm pessoas em prisão mental, financeira e social. Mas mais importante, ele oferece a saída. Baseado em princípios estoicos antigos combinado com compreensão moderna, The Code mostra como viver como um ser verdadeiramente livre. Não é propaganda. É verdade desconfortável e caminhos reais para liberdade.',
    description_full_en: 'The Code is Wagner\'s deep philosophical analysis of modern society. He dissects how the "Matrix" works - the systems that keep people in mental, financial, and social prison. But more importantly, he offers the exit. Based on ancient stoic principles combined with modern understanding, The Code shows how to live as a truly free being. It\'s not propaganda. It\'s uncomfortable truth and real paths to freedom.',
    price_brl: 219.90,
    price_usd: 29.99,
    category_id: 'cat-1',
    category_pt: 'Mentalidade & Filosofia',
    category_en: 'Mindset & Philosophy',
    status: 'active',
    is_featured: false,
    rating: 4.8,
    total_reviews: 356,
    author: 'Wagner Nascimento',
    pages: 420,
    cover_image_url: 'https://images.unsplash.com/photo-1446080653992-aa0361f1dd71?w=500&h=700&fit=crop',
  },
];

// Mock Blog Posts - Wagner's Philosophy
export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Zero Essential Carbs: The Science Behind the Predator Protocol',
    title_pt: 'Zero Carboidratos Essenciais: A Ciência por Trás do Protocolo Predador',
    title_en: 'Zero Essential Carbs: The Science Behind the Predator Protocol',
    slug: 'zero-carbs-predator-protocol',
    excerpt_pt: 'Desconstrução científica da abordagem nutricional que desafia tudo que você foi ensinado sobre carboidratos. Por que sua avó estava errada.',
    excerpt_en: 'Scientific breakdown of the nutritional approach that challenges everything you\'ve been taught about carbs. Why grandma was wrong.',
    content_pt: 'A industria de alimentos foi construída sobre uma mentira simples: você precisa de carboidratos. Wagner explica os hormônios, a insulina, e por que o zero carboidrato essencial é a abordagem que maximiza a performance humana. Quando você remove esses gatilhos, seu corpo funciona como uma máquina pura.',
    content_en: 'The food industry was built on one simple lie: you need carbs. Wagner explains the hormones, insulin, and why zero essential carbs is the approach that maximizes human performance. When you remove these triggers, your body functions as a pure machine.',
    author: 'Wagner Nascimento',
    status: 'published',
    published_at: '2024-11-20T10:00:00Z',
    cover_image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop',
    read_time: 8,
  },
  {
    id: 'blog-2',
    title: 'War Mode: How to Activate Your Anterior Mid-Cingulate Cortex',
    title_pt: 'Modo Guerra: Como Ativar Seu Córtex Cingulado Anterior Médio',
    title_en: 'War Mode: How to Activate Your Anterior Mid-Cingulate Cortex',
    slug: 'war-mode-brain',
    excerpt_pt: 'Neurociência do estado mental de disciplina máxima. Isso não é motivação - é neurologia pura.',
    excerpt_en: 'Neuroscience of maximum discipline mindset. This isn\'t motivation - it\'s pure neurology.',
    content_pt: 'A maioria das pessoas não entendem que disciplina é um órgão. O córtex cingulado anterior médio é a parte do seu cérebro que controla a atenção, a força de vontade e a resiliência. Wagner detalha como ativar essa região através de estímulos específicos, criando um estado mental que não pode ser abalado.',
    content_en: 'Most people don\'t understand that discipline is an organ. The anterior mid-cingulate cortex is the part of your brain that controls attention, willpower, and resilience. Wagner details how to activate this region through specific stimuli, creating a mental state that cannot be shaken.',
    author: 'Wagner Nascimento',
    status: 'published',
    published_at: '2024-11-15T14:30:00Z',
    cover_image_url: 'https://images.unsplash.com/photo-1507842072343-583f20270319?w=800&h=400&fit=crop',
    read_time: 10,
  },
  {
    id: 'blog-3',
    title: 'The Matrix and Modern Servitude: Why Employment is a Trap',
    title_pt: 'A Matrix e Servidão Moderna: Por Que Emprego é Uma Armadilha',
    title_en: 'The Matrix and Modern Servitude: Why Employment is a Trap',
    slug: 'matrix-employment-trap',
    excerpt_pt: 'Uma análise incômoda sobre como a maioria das pessoas trocou liberdade por segurança ilusória. A Sociedade Desconectada começa com você.',
    excerpt_en: 'An uncomfortable analysis of how most people traded freedom for illusory security. The Unconnected Society starts with you.',
    content_pt: 'Wagner não tira conclusões - ele apresenta fatos. O sistema de emprego moderno foi projetado para manter você em uma prisão mental. Você troca seu tempo (sua vida) por um salário que mal permite que você sobreviva. Você se torna dependente do sistema e nunca questiona se há outra forma. Este é o teste da verdade: se você parasse de trabalhar amanhã, quantos dias você poderia sobreviver?',
    content_en: 'Wagner doesn\'t pull punches - he presents facts. The modern employment system was designed to keep you in a mental prison. You trade your time (your life) for a salary that barely allows you to survive. You become dependent on the system and never question if there\'s another way. This is the reality check: if you stopped working tomorrow, how many days could you survive?',
    author: 'Wagner Nascimento',
    status: 'published',
    published_at: '2024-11-10T09:15:00Z',
    cover_image_url: 'https://images.unsplash.com/photo-1446080653992-aa0361f1dd71?w=800&h=400&fit=crop',
    read_time: 12,
  },
  {
    id: 'blog-4',
    title: 'Spartan Body Blueprint: From Couch to Unstoppable',
    title_pt: 'Projeto Corpo Espartano: Do Sofá para o Imparável',
    title_en: 'Spartan Body Blueprint: From Couch to Unstoppable',
    slug: 'spartan-body-blueprint',
    excerpt_pt: 'O plano de 12 semanas completo que transformou centenas de vidas. Não é uma promessa - é um protocolo testado.',
    excerpt_en: 'The complete 12-week plan that has transformed hundreds of lives. It\'s not a promise - it\'s a tested protocol.',
    content_pt: 'O WinterArc Spartan Body Protocol não foi construído em uma universidade ou laboratório. Foi construído na vida real, com pessoas reais. Wagner observou o que funciona e o que não funciona, depois documentou cada detalhe. Se você seguir o protocolo, seu corpo mudará. Sua mentalidade mudará. Você se tornará imparável.',
    content_en: 'The WinterArc Spartan Body Protocol wasn\'t built in a university or lab. It was built in real life, with real people. Wagner observed what works and what doesn\'t, then documented every detail. If you follow the protocol, your body will change. Your mindset will change. You will become unstoppable.',
    author: 'Wagner Nascimento',
    status: 'published',
    published_at: '2024-11-05T11:45:00Z',
    cover_image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=400&fit=crop',
    read_time: 9,
  },
];

// Mock Reviews
export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    product_id: 'prod-1',
    user_id: 'user-1',
    rating: 5,
    content: 'UNSTOPPABLE changed my life. The neuroscience section alone is worth the price. Wagner doesn\'t sugar-coat anything - it\'s raw truth.',
    title: 'This is THE book',
    reviewer_name: 'Marcus Thompson',
    is_approved: true,
    is_featured: true,
    created_at: '2024-11-20T10:00:00Z',
  },
  {
    id: 'rev-2',
    product_id: 'prod-3',
    user_id: 'user-2',
    rating: 5,
    content: 'WinterArc delivered exactly what it promised. I followed the protocol to the letter and transformed my body in 12 weeks. Imparável.',
    title: 'Life-changing protocol',
    reviewer_name: 'Sofia Ramirez',
    is_approved: true,
    is_featured: true,
    created_at: '2024-11-18T14:20:00Z',
  },
  {
    id: 'rev-3',
    product_id: 'prod-2',
    user_id: 'user-3',
    rating: 4,
    content: 'THE BLUEPRINT is comprehensive and actionable. Some sections are dense, but that\'s the point - Wagner doesn\'t waste words.',
    title: 'Complete system',
    reviewer_name: 'James Chen',
    is_approved: true,
    is_featured: false,
    created_at: '2024-11-16T11:30:00Z',
  },
];

// Mock Users
export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    email: 'marcus.thompson@example.com',
    full_name: 'Marcus Thompson',
    created_at: '2024-10-01T10:00:00Z',
  },
  {
    id: 'user-2',
    email: 'sofia.ramirez@example.com',
    full_name: 'Sofia Ramirez',
    created_at: '2024-10-05T14:20:00Z',
  },
  {
    id: 'user-3',
    email: 'james.chen@example.com',
    full_name: 'James Chen',
    created_at: '2024-10-10T09:15:00Z',
  },
];

// Mock Site Settings
export const MOCK_SITE_SETTINGS: SiteConfigSetting[] = [
  {
    key: 'site_name',
    value: 'Wagner Nascimento - Unstoppable',
    value_type: 'string',
    is_public: true,
  },
  {
    key: 'site_description',
    value: 'Master your mind. Transform your body. Escape the Matrix. The complete system for unstoppable living.',
    value_type: 'string',
    is_public: true,
  },
  {
    key: 'primary_color',
    value: '#00ff41',
    value_type: 'color',
    is_public: false,
  },
  {
    key: 'secondary_color',
    value: '#ff0000',
    value_type: 'color',
    is_public: false,
  },
  {
    key: 'background_color',
    value: '#0a0a0a',
    value_type: 'color',
    is_public: false,
  },
  {
    key: 'support_email',
    value: 'support@wagnernascimento.com',
    value_type: 'string',
    is_public: true,
  },
];

// Mock Feature Flags
export const MOCK_FEATURE_FLAGS: FeatureFlag[] = [
  {
    key: 'enable_blog',
    is_enabled: true,
  },
  {
    key: 'enable_reviews',
    is_enabled: true,
  },
  {
    key: 'enable_wishlist',
    is_enabled: false,
  },
  {
    key: 'enable_affiliate_program',
    is_enabled: false,
  },
];

// Mock E-books - IMPARÁVEL (Full Content from PDF)
export const MOCK_EBOOKS = [
  {
    id: 'ebook-1',
    product_id: 'prod-1', // IMPARÁVEL
    total_chapters: 7,
    estimated_read_time_minutes: 45,
    theme_config: {
      primaryColor: '#d4a574', // Gold from PDF
      accentColor: '#8b0000', // Dark red accent
      fontFamily: 'Inter',
    },
    status: 'active',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T14:30:00Z',
    published_at: '2024-01-20T14:30:00Z',
  },
];

export const MOCK_EBOOK_CHAPTERS = [
  {
    id: 'chapter-intro',
    ebook_id: 'ebook-1',
    chapter_number: 0,
    display_order: 0,
    title_en: 'Introduction: You Haven\'t Seen Your True Potential Yet',
    title_pt: 'Introdução: Você Ainda Não Viu o Seu Verdadeiro Potencial',
    slug: 'introduction',
    summary_en: 'Being unstoppable is not about never falling. It\'s about getting up when the whole world expects you to give up.',
    summary_pt: 'Ser imparável não é sobre nunca cair. É sobre se levantar quando o mundo inteiro espera que você desista.',
    estimated_read_time_minutes: 5,
    is_free_preview: true,
    is_published: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'chapter-1',
    ebook_id: 'ebook-1',
    chapter_number: 1,
    display_order: 1,
    title_en: 'Chapter 1: The Breaking Point',
    title_pt: 'Capítulo 1: O Ponto de Ruptura',
    slug: 'ponto-de-ruptura',
    summary_en: 'Every warrior is born in the moment when pain becomes unbearable.',
    summary_pt: 'Todo guerreiro nasce no momento em que a dor se torna insuportável.',
    estimated_read_time_minutes: 8,
    is_free_preview: true,
    is_published: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'chapter-2',
    ebook_id: 'ebook-1',
    chapter_number: 2,
    display_order: 2,
    title_en: 'Chapter 2: The Relentless Mind',
    title_pt: 'Capítulo 2: A Mente Implacável',
    slug: 'mente-implacavel',
    summary_en: 'Your mind is a weapon — either it dominates you, or you dominate it.',
    summary_pt: 'Sua mente é uma arma — ou ela te domina, ou você domina ela.',
    estimated_read_time_minutes: 8,
    is_free_preview: true,
    is_published: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'chapter-3',
    ebook_id: 'ebook-1',
    chapter_number: 3,
    display_order: 3,
    title_en: 'Chapter 3: Discipline as a Shield',
    title_pt: 'Capítulo 3: A Disciplina Como Escudo',
    slug: 'disciplina-como-escudo',
    summary_en: 'True power is doing what needs to be done — even when no one is watching.',
    summary_pt: 'O verdadeiro poder é fazer o que precisa ser feito — mesmo quando ninguém está olhando.',
    estimated_read_time_minutes: 6,
    is_free_preview: true,
    is_published: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'chapter-4',
    ebook_id: 'ebook-1',
    chapter_number: 4,
    display_order: 4,
    title_en: 'Chapter 4: The Body as Proof',
    title_pt: 'Capítulo 4: O Corpo Como Prova',
    slug: 'corpo-como-prova',
    summary_en: 'Your body is the mirror of your mind. You don\'t fool the mirror.',
    summary_pt: 'Seu corpo é o espelho da sua mente. Você não engana o espelho.',
    estimated_read_time_minutes: 6,
    is_free_preview: true,
    is_published: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'chapter-bonus',
    ebook_id: 'ebook-1',
    chapter_number: 5,
    display_order: 5,
    title_en: 'Exclusive Bonus: 30-Day Challenge',
    title_pt: 'Bônus Exclusivo: Desafio de 30 Dias',
    slug: 'desafio-30-dias',
    summary_en: 'Your personal reconstruction protocol. 30 days of non-negotiable habits.',
    summary_pt: 'Seu protocolo de reconstrução pessoal. 30 dias de hábitos não negociáveis.',
    estimated_read_time_minutes: 5,
    is_free_preview: true,
    is_published: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'chapter-conclusion',
    ebook_id: 'ebook-1',
    chapter_number: 6,
    display_order: 6,
    title_en: 'Conclusion: The Journey Begins Now',
    title_pt: 'Conclusão: A Jornada Começa Agora',
    slug: 'conclusao',
    summary_en: 'Day 30 is just the beginning. The real journey starts now.',
    summary_pt: 'O dia 30 é apenas o início. A verdadeira jornada começa agora.',
    estimated_read_time_minutes: 3,
    is_free_preview: true,
    is_published: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
];

export const MOCK_EBOOK_SECTIONS = [
  // Introduction Sections
  {
    id: 'section-intro-1',
    chapter_id: 'chapter-intro',
    display_order: 1,
    title_en: null,
    title_pt: null,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  // Chapter 1 Sections - O Ponto de Ruptura
  {
    id: 'section-1-1',
    chapter_id: 'chapter-1',
    display_order: 1,
    title_en: null,
    title_pt: null,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  // Chapter 2 Sections - A Mente Implacável
  {
    id: 'section-2-1',
    chapter_id: 'chapter-2',
    display_order: 1,
    title_en: null,
    title_pt: null,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  // Chapter 3 Sections - A Disciplina Como Escudo
  {
    id: 'section-3-1',
    chapter_id: 'chapter-3',
    display_order: 1,
    title_en: null,
    title_pt: null,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  // Chapter 4 Sections - O Corpo Como Prova
  {
    id: 'section-4-1',
    chapter_id: 'chapter-4',
    display_order: 1,
    title_en: null,
    title_pt: null,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  // Bonus Sections - Desafio de 30 Dias
  {
    id: 'section-bonus-1',
    chapter_id: 'chapter-bonus',
    display_order: 1,
    title_en: null,
    title_pt: null,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  // Conclusion Sections
  {
    id: 'section-conclusion-1',
    chapter_id: 'chapter-conclusion',
    display_order: 1,
    title_en: null,
    title_pt: null,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
];

export const MOCK_EBOOK_BLOCKS = [
  // ===== INTRODUCTION - Você Ainda Não Viu o Seu Verdadeiro Potencial =====
  {
    id: 'block-intro-0',
    section_id: 'section-intro-1',
    display_order: 0,
    block_type: 'image',
    content_en: {
      src: '/ebook-images/intro.png',
      alt: 'Breaking free from chains',
      caption: 'Awaken the unstoppable warrior within.',
    },
    content_pt: {
      src: '/ebook-images/intro.png',
      alt: 'Quebrando correntes',
      caption: 'Desperte o guerreiro imparável dentro de você.',
    },
    config: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'block-intro-1',
    section_id: 'section-intro-1',
    display_order: 1,
    block_type: 'quote',
    content_en: {
      text: 'Being unstoppable is not about never falling. It\'s about getting up when the whole world expects you to give up.',
      author: 'Wagner Nascimento',
    },
    content_pt: {
      text: 'Ser imparável não é sobre nunca cair. É sobre se levantar quando o mundo inteiro espera que você desista.',
      author: 'Wagner Nascimento',
    },
    config: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'block-intro-2',
    section_id: 'section-intro-1',
    display_order: 2,
    block_type: 'text',
    content_en: {
      html: '<p>We live in an era of instant gratification, where comfort is king and discipline is a forgotten relic. Modern society, with its incessant flow of distractions and easy rewards, has become a fertile field for mediocrity. It promises us everything, for nothing, and in the process, destroys our ability to fight for something that truly matters.</p><p>But within each of us resides a dormant potential, a strength that most never come to know. <strong>This e-book is not an invitation for a motivational stroll. It is a manual of internal warfare</strong>, forged for those who are tired of their own chaos and have decided, once and for all, to become unshakeable.</p>',
    },
    content_pt: {
      html: '<p>Vivemos numa era de gratificação instantânea, onde o conforto é rei e a disciplina é uma relíquia esquecida. A sociedade moderna, com o seu fluxo incessante de distrações e recompensas fáceis, tornou-se um campo fértil para a mediocridade. Promete-nos tudo, a troco de nada, e no processo, destrói a nossa capacidade de lutar por algo que realmente importa.</p><p>Mas dentro de cada um de nós reside um potencial adormecido, uma força que a maioria nunca chega a conhecer. <strong>Este e-book não é um convite para um passeio motivacional. É um manual de guerra interna</strong>, forjado para aqueles que estão cansados do seu próprio caos e decidiram, de uma vez por todas, tornarem-se inabaláveis.</p>',
    },
    config: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'block-intro-3',
    section_id: 'section-intro-1',
    display_order: 3,
    block_type: 'callout',
    content_en: {
      type: 'info',
      title: 'The Truth About Strength',
      content: '<p>We confuse strength with sporadic bursts of effort and consistency with a monotonous routine. <strong>True strength is not the ability to lift an enormous weight once; it\'s the ability to lift a reasonable weight, day after day, without fail.</strong> Consistency is the architecture of excellence. While brute force can impress, it is consistency that builds empires, both external and internal.</p>',
    },
    content_pt: {
      type: 'info',
      title: 'A Verdade Sobre a Força',
      content: '<p>Confundimos força com picos de esforço esporádicos e consistência com uma rotina monótona. <strong>A verdadeira força não é a capacidade de levantar um peso enorme uma única vez; é a capacidade de levantar um peso razoável, dia após dia, sem falhar.</strong> A consistência é a arquitetura da excelência. Enquanto a força bruta pode impressionar, é a consistência que constrói impérios, tanto externos como internos.</p>',
    },
    config: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'block-intro-4',
    section_id: 'section-intro-1',
    display_order: 4,
    block_type: 'text',
    content_en: {
      html: '<p>The modern world attacks this foundation, offering shortcuts that weaken our most important muscle: <strong>willpower</strong>.</p>',
    },
    content_pt: {
      html: '<p>O mundo moderno ataca esta fundação, oferecendo atalhos que enfraquecem o nosso músculo mais importante: <strong>a força de vontade</strong>.</p>',
    },
    config: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },

  // ===== CHAPTER 1 - O Ponto de Ruptura =====
  {
    id: 'block-1-1',
    section_id: 'section-1-1',
    display_order: 1,
    block_type: 'quote',
    content_en: {
      text: 'Every warrior is born in the moment when pain becomes unbearable.',
      author: 'Wagner Nascimento',
    },
    content_pt: {
      text: 'Todo guerreiro nasce no momento em que a dor se torna insuportável.',
      author: 'Wagner Nascimento',
    },
    config: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'block-1-2',
    section_id: 'section-1-1',
    display_order: 2,
    block_type: 'image',
    content_en: {
      src: '/ebook-images/chapter1.png',
      alt: 'Warrior emerging from fire',
      caption: 'Transformation is forged in the fire of adversity.',
    },
    content_pt: {
      src: '/ebook-images/chapter1.png',
      alt: 'Guerreiro emergindo do fogo',
      caption: 'A transformação é forjada no fogo da adversidade.',
    },
    config: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'block-1-3',
    section_id: 'section-1-1',
    display_order: 3,
    block_type: 'text',
    content_en: {
      html: '<p><strong>No one changes while comfortable.</strong> Real transformation, the kind that redefines who we are, is not a pondered choice made on a sunny afternoon. It is a decision forged in the fire of adversity, a decree issued from the depths of despair.</p><p>We call this moment the <strong>"moment zero"</strong>: the instant when the pain of remaining the same becomes greater than the pain of change. It is the point where humiliation, failure, or self-aversion become so unbearable that the only way out is total war against your own mediocrity.</p>',
    },
    content_pt: {
      html: '<p><strong>Ninguém muda enquanto está confortável.</strong> A transformação real, aquela que redefine quem somos, não é uma escolha ponderada feita numa tarde solarenga. É uma decisão forjada no fogo da adversidade, um decreto emitido das profundezas do desespero.</p><p>A este momento chamamos o <strong>"momento zero"</strong>: o instante em que a dor de permanecer o mesmo se torna superior à dor de mudar. É o ponto em que a humilhação, o fracasso ou a autoaversão se tornam tão insuportáveis que a única saída é a guerra total contra a sua própria mediocridade.</p>',
    },
    config: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'block-1-4',
    section_id: 'section-1-1',
    display_order: 4,
    block_type: 'callout',
    content_en: {
      type: 'warning',
      title: 'The Antidote Is Pain',
      content: '<p>We flee from pain as if it were poison, but in truth, it is the antidote. Society teaches us to seek comfort, to medicate discomfort, and to avoid confrontation at all costs. But it is in the direct confrontation with pain that we find our true strength.</p>',
    },
    content_pt: {
      type: 'warning',
      title: 'O Antídoto É a Dor',
      content: '<p>Fugimos da dor como se fosse um veneno, mas na verdade, ela é o antídoto. A sociedade ensina-nos a procurar o conforto, a medicar o desconforto e a evitar o confronto a todo o custo. Mas é no confronto direto com a dor que encontramos a nossa verdadeira força.</p>',
    },
    config: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'block-1-5',
    section_id: 'section-1-1',
    display_order: 5,
    block_type: 'text',
    content_en: {
      html: '<p>Facing pain head-on does not mean masochism; it means extracting the lesson it carries. <strong>Every failure, every humiliation, every moment of weakness is a barrel of fuel waiting to be ignited.</strong></p>',
    },
    content_pt: {
      html: '<p>Encarar a dor de frente não significa masoquismo; significa extrair a lição que ela carrega. <strong>Cada fracasso, cada humilhação, cada momento de fraqueza é um barril de combustível à espera de ser incendiado.</strong></p>',
    },
    config: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },

  // ===== CHAPTER 2 - A Mente Implacável =====
  {
    id: 'block-2-1',
    section_id: 'section-2-1',
    display_order: 1,
    block_type: 'quote',
    content_en: {
      text: 'Your mind is a weapon — either it dominates you, or you dominate it.',
      author: 'Wagner Nascimento',
    },
    content_pt: {
      text: 'Sua mente é uma arma — ou ela te domina, ou você domina ela.',
      author: 'Wagner Nascimento',
    },
    config: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'block-2-2',
    section_id: 'section-2-1',
    display_order: 2,
    block_type: 'image',
    content_en: {
      src: '/ebook-images/chapter2.png',
      alt: 'Brain neural connections',
      caption: 'The mind is the most decisive battlefield.',
    },
    content_pt: {
      src: '/ebook-images/chapter2.png',
      alt: 'Conexões neurais do cérebro',
      caption: 'A mente é o campo de batalha mais decisivo.',
    },
    config: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'block-2-3',
    section_id: 'section-2-1',
    display_order: 3,
    block_type: 'text',
    content_en: {
      html: '<p>The most decisive battlefield is not in the outside world, but in the space of six inches between your ears. This is where wars are won or lost before the first step is even taken. <strong>A relentless mind is not an empty or perpetually positive mind. It is a trained mind</strong>, a sharpened instrument that responds to your command, regardless of the chaos surrounding it.</p>',
    },
    content_pt: {
      html: '<p>O campo de batalha mais decisivo não é no mundo exterior, mas no espaço de seis polegadas entre as suas orelhas. É aqui que as guerras são ganhas ou perdidas antes mesmo do primeiro passo ser dado. <strong>Uma mente implacável não é uma mente vazia ou perpetuamente positiva. É uma mente treinada</strong>, um instrumento afiado que responde ao seu comando, independentemente do caos que a rodeia.</p>',
    },
    config: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'block-2-4',
    section_id: 'section-2-1',
    display_order: 4,
    block_type: 'callout',
    content_en: {
      type: 'info',
      title: 'The Two Primordial Elements',
      content: '<p>Mental training is forged through two primordial elements: <strong>repetition</strong> and <strong>discomfort</strong>.</p><ul><li><strong>Repetition</strong> is the language of the brain. It is through consistent repetition that behaviors become automated and beliefs solidify.</li><li><strong>Discomfort</strong> is the gym of the mind. Modern neuroscience reveals that the Anterior Mid-Cingulate Cortex (aMCC), crucial for willpower, is strengthened when we force ourselves to do difficult things.</li></ul>',
    },
    content_pt: {
      type: 'info',
      title: 'Os Dois Elementos Primordiais',
      content: '<p>O treino mental é forjado através de dois elementos primordiais: <strong>repetição</strong> e <strong>desconforto</strong>.</p><ul><li><strong>A repetição</strong> é a linguagem do cérebro. É através da repetição consistente que os comportamentos se automatizam e as crenças se solidificam.</li><li><strong>O desconforto</strong> é o ginásio da mente. A neurociência moderna revela que o Córtex Cingulado Anterior Médio (aMCC), crucial para a força de vontade, é fortalecido quando nos forçamos a fazer coisas difíceis.</li></ul>',
    },
    config: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },

  // ===== CHAPTER 3 - A Disciplina Como Escudo =====
  {
    id: 'block-3-1',
    section_id: 'section-3-1',
    display_order: 1,
    block_type: 'quote',
    content_en: {
      text: 'True power is doing what needs to be done — even when no one is watching.',
      author: 'Wagner Nascimento',
    },
    content_pt: {
      text: 'O verdadeiro poder é fazer o que precisa ser feito — mesmo quando ninguém está olhando.',
      author: 'Wagner Nascimento',
    },
    config: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'block-3-2',
    section_id: 'section-3-1',
    display_order: 2,
    block_type: 'image',
    content_en: {
      src: '/ebook-images/chapter3.png',
      alt: 'Person meditating at sunrise',
      caption: 'Discipline is not effort; it is identity.',
    },
    content_pt: {
      src: '/ebook-images/chapter3.png',
      alt: 'Pessoa meditando ao nascer do sol',
      caption: 'Disciplina não é esforço; é identidade.',
    },
    config: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'block-3-3',
    section_id: 'section-3-1',
    display_order: 3,
    block_type: 'text',
    content_en: {
      html: '<p>Discipline is often seen as a burden, a constant effort against our desires. <strong>This is a beginner\'s perspective.</strong></p><p>For the warrior, discipline is not effort; it is identity. It is not something you do; it is something you are. The fundamental transformation occurs when discipline stops being a series of actions and becomes your nature.</p>',
    },
    content_pt: {
      html: '<p>A disciplina é frequentemente vista como um fardo, um esforço constante contra os nossos desejos. <strong>Esta é uma perspetiva de principiante.</strong></p><p>Para o guerreiro, a disciplina não é esforço; é identidade. Não é algo que você faz; é algo que você é. A transformação fundamental ocorre quando a disciplina deixa de ser uma série de ações e se torna a sua natureza.</p>',
    },
    config: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },

  // ===== CHAPTER 4 - O Corpo Como Prova =====
  {
    id: 'block-4-1',
    section_id: 'section-4-1',
    display_order: 1,
    block_type: 'quote',
    content_en: {
      text: 'Your body is the mirror of your mind. You don\'t fool the mirror.',
      author: 'Wagner Nascimento',
    },
    content_pt: {
      text: 'Seu corpo é o espelho da sua mente. Você não engana o espelho.',
      author: 'Wagner Nascimento',
    },
    config: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'block-4-2',
    section_id: 'section-4-1',
    display_order: 2,
    block_type: 'image',
    content_en: {
      src: '/ebook-images/chapter4.png',
      alt: 'Athlete training intensely',
      caption: 'Physical discipline is the foundation of mental strength.',
    },
    content_pt: {
      src: '/ebook-images/chapter4.png',
      alt: 'Atleta treinando intensamente',
      caption: 'A disciplina física é a base da força mental.',
    },
    config: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'block-4-3',
    section_id: 'section-4-1',
    display_order: 3,
    block_type: 'text',
    content_en: {
      html: '<p>In a world obsessed with intellectual abstractions, we forget a fundamental truth: <strong>we are physical beings</strong>. Your mind does not float in a vacuum; it is embodied in a body, and the condition of that body dictates, to a large extent, the quality of your mind.</p><p>Physical discipline is not vanity; it is the foundation of mental strength. <strong>The mirror doesn\'t lie.</strong></p>',
    },
    content_pt: {
      html: '<p>Num mundo obcecado com abstrações intelectuais, esquecemo-nos de uma verdade fundamental: <strong>nós somos seres físicos</strong>. A sua mente não flutua num vácuo; ela está incorporada num corpo, e a condição desse corpo dita, em grande medida, a qualidade da sua mente.</p><p>A disciplina física não é uma vaidade; é a base da força mental. <strong>O espelho não mente.</strong></p>',
    },
    config: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },

  // ===== BONUS - Desafio de 30 Dias =====
  {
    id: 'block-bonus-1',
    section_id: 'section-bonus-1',
    display_order: 1,
    block_type: 'image',
    content_en: {
      src: '/ebook-images/bonus.png',
      alt: '30-Day Challenge Calendar',
      caption: 'Your personal reconstruction protocol.',
    },
    content_pt: {
      src: '/ebook-images/bonus.png',
      alt: 'Calendário de Desafio de 30 Dias',
      caption: 'Seu protocolo de reconstrução pessoal.',
    },
    config: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'block-bonus-2',
    section_id: 'section-bonus-1',
    display_order: 2,
    block_type: 'text',
    content_en: {
      html: '<p>This is your personal reconstruction protocol. For 30 days, you will follow a set of non-negotiable habits that will transform your mind and body. <strong>No deviations. No excuses. Only results.</strong></p>',
    },
    content_pt: {
      html: '<p>Este é o seu protocolo de reconstrução pessoal. Durante 30 dias, você seguirá um conjunto de hábitos não negociáveis que transformarão sua mente e corpo. <strong>Sem desvios. Sem desculpas. Apenas resultados.</strong></p>',
    },
    config: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'block-bonus-3',
    section_id: 'section-bonus-1',
    display_order: 3,
    block_type: 'accordion',
    content_en: {
      items: [
        {
          title: 'Wake up by 6:00 AM',
          content: '<p><strong>Objective:</strong> Morning discipline</p><p>Start your day with intention. No snooze button. No excuses. Your day begins the moment you decide to get out of bed.</p>',
        },
        {
          title: 'Drink 1L of water',
          content: '<p><strong>Objective:</strong> Hydration and energy</p><p>Before anything else, hydrate your body. This simple act sets the tone for the rest of your day.</p>',
        },
        {
          title: 'Physical training (45 min)',
          content: '<p><strong>Objective:</strong> Mental and physical strength</p><p>45 minutes of physical training. No negotiation. Your body is the proof of your discipline.</p>',
        },
        {
          title: 'Cold shower',
          content: '<p><strong>Objective:</strong> Resistance to discomfort</p><p>End with cold water. This trains your aMCC and builds your tolerance for discomfort.</p>',
        },
        {
          title: 'Reading (10 pages)',
          content: '<p><strong>Objective:</strong> Continuous growth</p><p>Feed your mind daily. 10 pages minimum. Knowledge compounds over time.</p>',
        },
        {
          title: 'Meditation (10 min)',
          content: '<p><strong>Objective:</strong> Mental control</p><p>Train your mind to be still. 10 minutes of focused breathing or meditation.</p>',
        },
        {
          title: 'Daily planning',
          content: '<p><strong>Objective:</strong> Intentionality</p><p>Plan your day with purpose. Know exactly what you will accomplish before the sun sets.</p>',
        },
      ],
    },
    content_pt: {
      items: [
        {
          title: 'Acordar até às 6:00',
          content: '<p><strong>Objetivo:</strong> Disciplina matinal</p><p>Comece seu dia com intenção. Sem botão de soneca. Sem desculpas. Seu dia começa no momento em que você decide sair da cama.</p>',
        },
        {
          title: 'Beber 1L de água',
          content: '<p><strong>Objetivo:</strong> Hidratação e energia</p><p>Antes de qualquer coisa, hidrate seu corpo. Este simples ato define o tom para o resto do seu dia.</p>',
        },
        {
          title: 'Treino físico (45 min)',
          content: '<p><strong>Objetivo:</strong> Força mental e física</p><p>45 minutos de treino físico. Sem negociação. Seu corpo é a prova da sua disciplina.</p>',
        },
        {
          title: 'Duche de água fria',
          content: '<p><strong>Objetivo:</strong> Resistência ao desconforto</p><p>Termine com água fria. Isso treina seu aMCC e constrói sua tolerância ao desconforto.</p>',
        },
        {
          title: 'Leitura (10 páginas)',
          content: '<p><strong>Objetivo:</strong> Crescimento contínuo</p><p>Alimente sua mente diariamente. 10 páginas no mínimo. O conhecimento se acumula ao longo do tempo.</p>',
        },
        {
          title: 'Meditação (10 min)',
          content: '<p><strong>Objetivo:</strong> Controle mental</p><p>Treine sua mente para ficar quieta. 10 minutos de respiração focada ou meditação.</p>',
        },
        {
          title: 'Planeamento do dia',
          content: '<p><strong>Objetivo:</strong> Intencionalidade</p><p>Planeje seu dia com propósito. Saiba exatamente o que você vai realizar antes do sol se pôr.</p>',
        },
      ],
    },
    config: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },

  // ===== CONCLUSION - A Jornada Começa Agora =====
  {
    id: 'block-conclusion-0',
    section_id: 'section-conclusion-1',
    display_order: 0,
    block_type: 'image',
    content_en: {
      src: '/ebook-images/conclusion.png',
      alt: 'Journey beginning at sunrise',
      caption: 'The real journey begins now.',
    },
    content_pt: {
      src: '/ebook-images/conclusion.png',
      alt: 'Jornada começando ao nascer do sol',
      caption: 'A verdadeira jornada começa agora.',
    },
    config: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'block-conclusion-1',
    section_id: 'section-conclusion-1',
    display_order: 1,
    block_type: 'text',
    content_en: {
      html: '<p>This book does not end here. In fact, it only begins. Every word you read was designed for one purpose: <strong>to destroy your excuses and provide the tools for real transformation</strong>.</p><p>Now, the responsibility is yours. You can close this book and return to mediocrity, or you can make the most important decision of your life: <strong>to become UNSTOPPABLE</strong>.</p>',
    },
    content_pt: {
      html: '<p>Este livro não termina aqui. Na verdade, ele apenas começa. Cada palavra que você leu foi desenhada para um propósito: <strong>destruir as suas desculpas e fornecer as ferramentas para a transformação real</strong>.</p><p>Agora, a responsabilidade é sua. Você pode fechar este livro e voltar à mediocridade, ou pode tomar a decisão mais importante da sua vida: <strong>tornar-se IMPARÁVEL</strong>.</p>',
    },
    config: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'block-conclusion-2',
    section_id: 'section-conclusion-1',
    display_order: 2,
    block_type: 'quote',
    content_en: {
      text: 'Day 30 is just the beginning. It is the proof that you are capable of taking control. Now, the real journey begins: the journey of never being ordinary again.',
      author: 'Wagner Nascimento',
    },
    content_pt: {
      text: 'O dia 30 é apenas o início. É a prova de que você é capaz de assumir o controlo. Agora, a verdadeira jornada começa: a jornada de nunca mais voltar a ser comum.',
      author: 'Wagner Nascimento',
    },
    config: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
];

export const mockData = {
  categories: MOCK_CATEGORIES,
  products: MOCK_PRODUCTS,
  blogPosts: MOCK_BLOG_POSTS,
  reviews: MOCK_REVIEWS,
  users: MOCK_USERS,
  siteSettings: MOCK_SITE_SETTINGS,
  featureFlags: MOCK_FEATURE_FLAGS,
  ebooks: MOCK_EBOOKS,
  ebookChapters: MOCK_EBOOK_CHAPTERS,
  ebookSections: MOCK_EBOOK_SECTIONS,
  ebookBlocks: MOCK_EBOOK_BLOCKS,
};
