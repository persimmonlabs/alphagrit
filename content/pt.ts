import { en } from './en'

export const pt: typeof en = {
  // Metadados do site
  metadata: {
    siteTitle: "Alpha Grit",
    siteDescription: "Transforme sua mente. Transforme seu corpo. Torne-se imparável.",
  },

  // Navegação
  nav: {
    manifesto: "[MANIFESTO]",
    products: "[PRODUTOS]",
    ebooks: "[EBOOKS]",
    login: "[ENTRAR]",
    blog: "[BLOG]",
    dashboard: "[PAINEL]",
    logout: "[SAIR]",
  },

  // Seção hero
  hero: {
    status: "Status do Sistema: Operacional",
    title_line1: "Reescreva",
    title_line2: "O Código Fonte",
    description: "O mundo moderno foi projetado para mantê-lo fraco, distraído e dependente. Fornecemos o armamento digital para se desconectar do ruído e reconstruir sua biologia e psicologia.",
    cta_primary: "Inicializar Protocolo",
    cta_secondary: "Ver Catálogo",
  },

  // Seção de cards
  cards: {
    body: { title: "O Corpo", desc: "Soberania física. Aprenda a manipular o hardware.", link: "Acessar Dados >>" },
    mind: { title: "A Mente", desc: "Controle de dopamina e arquitetura de foco.", link: "Acessar Dados >>" },
    code: { title: "O Código", desc: "Independência financeira através de alavancagem digital.", link: "Acessar Dados >>" },
  },

  // Produto em destaque
  featured: {
    label: "[LANÇAMENTO]",
    title: "Sociedade Desconectada",
    link: "// Ver Todos os Arquivos",
    badge: "NOVIDADE",
    product_title: "O Projeto",
    product_desc: "O manual completo para se desconectar da matrix. Inclui protocolos de nutrição, modelos mentais e estratégias financeiras.",
    features: ["200+ Páginas de Táticas", "Áudio Complementar", "Atualizações Vitalícias"],
    cta: "Garantir Acesso",
    price: "R$497",
  },

  // Blog
  blog: {
    title: "Base de Conhecimento",
    noPosts: "Nenhum artigo disponível ainda. Volte em breve.",
    readMore: "Ler mais",
    backToBlog: "Voltar ao Blog",
    relatedArticles: "Artigos Relacionados",
    minuteRead: "min de leitura",
    publishedOn: "Publicado em",
    by: "Por",
  },

  // Dashboard
  dashboard: {
    title: "Meu Painel",
    nav: {
      overview: "Visão Geral",
      profile: "Meu Perfil",
      orders: "Histórico de Pedidos",
      downloads: "Meus Downloads",
      logout: "Sair",
    },
    myPurchases: "Minhas Compras",
    myLibrary: "Minha Biblioteca",
    noPurchases: "Nenhuma compra ainda. Navegue pelos nossos ebooks para começar.",
    downloadButton: "Baixar",
    purchaseDate: "Comprado em",
    orderNumber: "Pedido #",
    viewProducts: "Ver Ebooks",
    subscription: "Assinatura",
    activeSubscription: "Assinatura Ativa",
    manageSubscription: "Gerenciar Assinatura",
    noSubscription: "Sem assinatura ativa",
    subscribeNow: "Assinar Agora",
  },

  // Autenticação
  auth: {
    login: "Entrar",
    signup: "Criar Conta",
    logout: "Sair",
    email: "Email",
    password: "Senha",
    fullName: "Nome Completo",
    confirmPassword: "Confirmar Senha",
    forgotPassword: "Esqueceu a senha?",
    noAccount: "Não tem uma conta?",
    hasAccount: "Já tem uma conta?",
    continueWith: "Ou continue com",
    signingIn: "Entrando...",
    creatingAccount: "Criando conta...",
    checkEmail: "Verifique seu email",
    emailSent: "Enviamos um link de confirmação para o seu email. Clique no link para ativar sua conta.",
    backToHome: "Voltar para início",
    minPassword: "Mínimo 6 caracteres",
  },

  // Ebooks
  ebooks: {
    title: "Biblioteca de E-Books",
    subtitle: "Transforme sua vida com nossos guias completos",
    noEbooks: "Nenhum ebook disponível ainda. Volte em breve.",
    readNow: "Ler Agora",
    buyNow: "Comprar Agora",
    comingSoon: "Em breve",
    paymentsComingSoon: "Pagamentos serão habilitados em breve.",
    free: "Grátis",
    chapters: "Capítulos",
    chapter: "Capítulo",
    freePreview: "Prévia Gratuita",
    purchaseRequired: "Compra necessária",
    previous: "Anterior",
    next: "Próximo",
    tableOfContents: "Índice",
    backToEbook: "Voltar ao ebook",
  },

  // Erros
  errors: {
    pageNotFound: "Página não encontrada",
    pageNotFoundDesc: "A página que você procura não existe ou foi movida.",
    somethingWrong: "Algo deu errado",
    unexpectedError: "Encontramos um erro inesperado. Por favor, tente novamente ou volte para a página inicial.",
    tryAgain: "Tentar novamente",
    goHome: "Ir para início",
    browseEbooks: "Ver ebooks",
    errorId: "ID do Erro",
    unauthorized: "Por favor, faça login para continuar.",
    paymentError: "Erro no pagamento. Por favor, tente novamente.",
    notConfigured: "Este recurso ainda não está disponível.",
  },

  // Formulários
  forms: {
    submit: "Enviar",
    cancel: "Cancelar",
    save: "Salvar",
    loading: "Carregando...",
    required: "Obrigatório",
    optional: "Opcional",
    success: "Sucesso!",
    error: "Erro",
  },

  // Rodapé
  footer: {
    rights: "© 2025 TODOS OS DIREITOS RESERVADOS.",
    location: "[CONEXÃO SEGURA]",
    price: "R$497",
    terms: "Termos de Serviço",
    privacy: "Política de Privacidade",
    contact: "Contato",
  },

  // Legal
  legal: {
    termsTitle: "Termos de Serviço",
    privacyTitle: "Política de Privacidade",
    lastUpdated: "Última atualização",
  },
}
