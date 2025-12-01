-- Blog CMS Schema for Supabase
-- Run this in Supabase SQL Editor

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_pt TEXT,
  slug TEXT UNIQUE NOT NULL,
  excerpt_en TEXT,
  excerpt_pt TEXT,
  content_en TEXT, -- HTML content from TipTap
  content_pt TEXT,
  cover_image_url TEXT,
  author_name TEXT DEFAULT 'Alpha Grit',
  author_avatar_url TEXT,
  category TEXT DEFAULT 'general', -- general, mindset, productivity, fitness, nutrition, etc.
  tags TEXT[] DEFAULT '{}',
  estimated_read_time_minutes INTEGER DEFAULT 5,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);

-- Updated_at trigger (reuse existing function if available)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Blog posts: Anyone can read published posts
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON blog_posts;
CREATE POLICY "Anyone can view published blog posts" ON blog_posts
  FOR SELECT USING (is_published = true);

-- Blog posts: Admins can do everything
DROP POLICY IF EXISTS "Admins can manage blog posts" ON blog_posts;
CREATE POLICY "Admins can manage blog posts" ON blog_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Storage bucket for blog images (run separately if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);

-- =====================================================
-- SEED DATA: Sample blog posts
-- =====================================================

INSERT INTO blog_posts (title_en, title_pt, slug, excerpt_en, excerpt_pt, content_en, content_pt, category, tags, estimated_read_time_minutes, is_featured, is_published, published_at)
VALUES
(
  'The Power of Morning Routines',
  'O Poder das Rotinas Matinais',
  'power-of-morning-routines',
  'Discover how successful people start their day and how you can build your own powerful morning routine.',
  'Descubra como pessoas de sucesso comecam o dia e como voce pode construir sua propria rotina matinal poderosa.',
  '<h2>Why Morning Routines Matter</h2><p>The way you start your morning sets the tone for your entire day. Successful entrepreneurs, athletes, and thought leaders all share one thing in common: they have intentional morning routines.</p><h2>Key Components of an Effective Morning Routine</h2><ul><li><strong>Wake up early</strong> - Give yourself time before the world demands your attention</li><li><strong>Hydrate first</strong> - Drink water before coffee to kickstart your metabolism</li><li><strong>Move your body</strong> - Even 10 minutes of exercise increases energy and focus</li><li><strong>Set intentions</strong> - Review your goals and priorities for the day</li></ul><h2>Building Your Routine</h2><p>Start small. Pick one or two habits and build from there. Consistency beats intensity every time.</p>',
  '<h2>Por Que as Rotinas Matinais Importam</h2><p>A maneira como voce comeca sua manha define o tom para todo o seu dia. Empreendedores de sucesso, atletas e lideres de pensamento tem algo em comum: eles tem rotinas matinais intencionais.</p><h2>Componentes Chave de uma Rotina Matinal Eficaz</h2><ul><li><strong>Acorde cedo</strong> - De a si mesmo tempo antes que o mundo exija sua atencao</li><li><strong>Hidrate-se primeiro</strong> - Beba agua antes do cafe para acelerar seu metabolismo</li><li><strong>Mova seu corpo</strong> - Mesmo 10 minutos de exercicio aumentam a energia e o foco</li><li><strong>Defina intencoes</strong> - Revise seus objetivos e prioridades para o dia</li></ul><h2>Construindo Sua Rotina</h2><p>Comece pequeno. Escolha um ou dois habitos e construa a partir dai. Consistencia supera intensidade sempre.</p>',
  'productivity',
  ARRAY['morning-routine', 'productivity', 'habits', 'success'],
  5,
  true,
  true,
  NOW() - INTERVAL '7 days'
),
(
  'Building Mental Toughness',
  'Construindo Resiliencia Mental',
  'building-mental-toughness',
  'Mental toughness is a skill that can be developed. Learn the strategies used by elite performers to strengthen their mindset.',
  'Resiliencia mental e uma habilidade que pode ser desenvolvida. Aprenda as estrategias usadas por performers de elite para fortalecer sua mentalidade.',
  '<h2>What is Mental Toughness?</h2><p>Mental toughness is the ability to stay focused, confident, and resilient in the face of adversity. Its not about suppressing emotions - its about managing them effectively.</p><h2>The Four Pillars</h2><ol><li><strong>Confidence</strong> - Believe in your ability to overcome challenges</li><li><strong>Focus</strong> - Concentrate on what you can control</li><li><strong>Composure</strong> - Stay calm under pressure</li><li><strong>Commitment</strong> - Stay dedicated to your goals despite setbacks</li></ol><h2>Daily Practices</h2><p>Mental toughness is built through consistent practice. Cold exposure, difficult workouts, and intentional discomfort all contribute to building your mental resilience.</p>',
  '<h2>O Que e Resiliencia Mental?</h2><p>Resiliencia mental e a capacidade de permanecer focado, confiante e resiliente diante da adversidade. Nao se trata de suprimir emocoes - e sobre gerencia-las de forma eficaz.</p><h2>Os Quatro Pilares</h2><ol><li><strong>Confianca</strong> - Acredite na sua capacidade de superar desafios</li><li><strong>Foco</strong> - Concentre-se no que voce pode controlar</li><li><strong>Compostura</strong> - Mantenha a calma sob pressao</li><li><strong>Comprometimento</strong> - Mantenha-se dedicado aos seus objetivos apesar dos contratempos</li></ol><h2>Praticas Diarias</h2><p>Resiliencia mental e construida atraves de pratica consistente. Exposicao ao frio, treinos dificeis e desconforto intencional contribuem para construir sua resiliencia mental.</p>',
  'mindset',
  ARRAY['mental-toughness', 'mindset', 'resilience', 'discipline'],
  6,
  true,
  true,
  NOW() - INTERVAL '3 days'
),
(
  '5 Nutrition Myths Debunked',
  '5 Mitos de Nutricao Desmentidos',
  'nutrition-myths-debunked',
  'Separate fact from fiction with these common nutrition myths that might be holding you back from your fitness goals.',
  'Separe fato de ficcao com estes mitos comuns de nutricao que podem estar impedindo voce de alcancar seus objetivos fitness.',
  '<h2>Myth 1: Carbs Are the Enemy</h2><p>Carbohydrates are not inherently bad. They are your bodys preferred energy source, especially for high-intensity activities. The key is choosing quality carbs and timing them appropriately.</p><h2>Myth 2: You Need to Eat Every 2-3 Hours</h2><p>Your metabolism doesnt "slow down" if you dont eat frequently. What matters most is your total daily intake, not meal frequency.</p><h2>Myth 3: Fat Makes You Fat</h2><p>Dietary fat doesnt automatically become body fat. Excess calories from any source lead to weight gain. Healthy fats are essential for hormone production and nutrient absorption.</p><h2>Myth 4: Protein Will Make You Bulky</h2><p>Protein helps build and repair muscle, but you wont get "bulky" without intentional heavy training and a significant caloric surplus.</p><h2>Myth 5: You Need Supplements to Get Results</h2><p>Supplements are meant to supplement a good diet, not replace it. Focus on whole foods first.</p>',
  '<h2>Mito 1: Carboidratos Sao o Inimigo</h2><p>Carboidratos nao sao inerentemente ruins. Eles sao a fonte de energia preferida do seu corpo, especialmente para atividades de alta intensidade. A chave e escolher carboidratos de qualidade e cronometra-los adequadamente.</p><h2>Mito 2: Voce Precisa Comer a Cada 2-3 Horas</h2><p>Seu metabolismo nao "desacelera" se voce nao comer frequentemente. O que mais importa e sua ingestao diaria total, nao a frequencia das refeicoes.</p><h2>Mito 3: Gordura Faz Voce Engordar</h2><p>Gordura dietetica nao se torna automaticamente gordura corporal. Calorias em excesso de qualquer fonte levam ao ganho de peso. Gorduras saudaveis sao essenciais para producao hormonal e absorcao de nutrientes.</p><h2>Mito 4: Proteina Vai Te Deixar Grande Demais</h2><p>Proteina ajuda a construir e reparar musculos, mas voce nao ficara "grande" sem treinamento pesado intencional e um superavit calorico significativo.</p><h2>Mito 5: Voce Precisa de Suplementos para Ter Resultados</h2><p>Suplementos sao feitos para suplementar uma boa dieta, nao substitui-la. Foque em alimentos integrais primeiro.</p>',
  'nutrition',
  ARRAY['nutrition', 'myths', 'diet', 'health'],
  7,
  false,
  true,
  NOW() - INTERVAL '1 day'
);
