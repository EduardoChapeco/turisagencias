-- MIGRATION: OMEGA v8 RAG, Knowledge Base, Support Center, Blog
-- Tabelas para: Memória RAG, Chat IA Público, Central de Ajuda, Blog Social

-- ==========================================
-- BLOCO 1: KNOWLEDGE BASE (RAG)
-- ==========================================

-- Fontes de Conhecimento (documentos originais)
CREATE TABLE IF NOT EXISTS knowledge_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  source_type varchar NOT NULL,
  -- 'faq', 'article', 'blog_post', 'page', 'destination_guide', 'pdf_upload', 'rss_import', 'policy'
  title varchar NOT NULL,
  source_url varchar, -- URL original (RSS, página pública)
  status varchar DEFAULT 'draft', -- 'draft', 'processing', 'active', 'archived'
  approved_for_public_ai boolean DEFAULT false,
  approved_by uuid REFERENCES profiles(id),
  approved_at timestamptz,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Chunks de texto (RAG)
CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  source_id uuid REFERENCES knowledge_sources(id) ON DELETE CASCADE,
  source_type varchar NOT NULL,
  chunk_index int NOT NULL,
  content text NOT NULL,
  content_hash varchar NOT NULL, -- SHA-256 para detectar duplicatas
  visibility varchar DEFAULT 'private', -- 'public', 'authenticated', 'private'
  pii_level varchar DEFAULT 'none', -- 'none', 'low', 'high'
  approved_for_public_ai boolean DEFAULT false,
  embedding_model varchar DEFAULT 'text-embedding-3-small',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Embeddings vetoriais (pgvector)
CREATE TABLE IF NOT EXISTS knowledge_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_id uuid REFERENCES knowledge_chunks(id) ON DELETE CASCADE,
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  embedding vector(1536),
  created_at timestamptz DEFAULT now()
);

-- Índice vetorial para busca semântica
CREATE INDEX IF NOT EXISTS knowledge_embeddings_vector_idx
  ON knowledge_embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Agentes de IA (configuração)
CREATE TABLE IF NOT EXISTS ai_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  agent_key varchar NOT NULL, -- 'public_chat', 'faq', 'blog', 'scoring', 'routing'
  display_name varchar NOT NULL,
  scope jsonb NOT NULL DEFAULT '{}',
  -- Ex: {"allowed_tables": ["faq_items", "knowledge_chunks"], "max_tokens": 2048}
  system_prompt text,
  model varchar DEFAULT 'gpt-4o-mini',
  temperature numeric DEFAULT 0.3,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT ai_agents_org_key_unique UNIQUE (org_id, agent_key)
);

-- Execuções de Agentes (audit trail)
CREATE TABLE IF NOT EXISTS ai_agent_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES ai_agents(id),
  agent_key varchar NOT NULL,
  session_id varchar, -- Session do usuário público (shadow_token)
  user_message text NOT NULL,
  assistant_response text,
  source_chunks jsonb DEFAULT '[]', -- [{chunk_id, score, content_preview}]
  input_tokens int,
  output_tokens int,
  latency_ms int,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Perfil de Tom de Voz por Agência
CREATE TABLE IF NOT EXISTS agency_tone_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  tone_description text, -- Ex: "formal, amigável, focada em família"
  forbidden_topics text[], -- Ex: ARRAY['preço de concorrente', 'over', 'comissão']
  custom_instructions text,
  greeting_message varchar DEFAULT 'Olá! Como posso ajudar?',
  farewell_message varchar DEFAULT 'Obrigado pelo contato!',
  updated_at timestamptz DEFAULT now()
);

-- Políticas de IA Pública por Org
CREATE TABLE IF NOT EXISTS public_knowledge_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  max_tokens_per_response int DEFAULT 1024,
  rate_limit_per_hour int DEFAULT 100,
  require_human_approval_before_rag boolean DEFAULT true,
  show_source_citations boolean DEFAULT true,
  fallback_message text DEFAULT 'Não encontrei informação sobre isso. Entre em contato pelo WhatsApp.',
  updated_at timestamptz DEFAULT now()
);

-- ==========================================
-- BLOCO 2: CENTRAL DE AJUDA
-- ==========================================

-- Artigos da Central de Ajuda
CREATE TABLE IF NOT EXISTS support_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  title varchar NOT NULL,
  slug varchar NOT NULL,
  summary varchar,
  content text NOT NULL, -- HTML sanitizado
  category varchar NOT NULL, -- 'pagamentos', 'embarque', 'contratos', 'politicas', 'pre-embarque'
  tags text[] DEFAULT '{}',
  views int DEFAULT 0,
  helpful_votes int DEFAULT 0,
  not_helpful_votes int DEFAULT 0,
  status varchar DEFAULT 'draft', -- 'draft', 'published', 'archived'
  is_pinned boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id),
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT support_articles_slug_org_unique UNIQUE (org_id, slug)
);

-- FAQs
CREATE TABLE IF NOT EXISTS faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  question varchar NOT NULL,
  answer text NOT NULL,
  category varchar NOT NULL,
  display_order int DEFAULT 0,
  is_pinned boolean DEFAULT false,
  is_published boolean DEFAULT true,
  helpful_votes int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tickets de Suporte
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_number varchar NOT NULL UNIQUE, -- auto-gerado: TUR-2026-0001
  requester_name varchar NOT NULL,
  requester_email varchar NOT NULL,
  requester_phone varchar,
  subject varchar NOT NULL,
  description text NOT NULL,
  category varchar NOT NULL,
  priority varchar DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  status varchar DEFAULT 'open', -- 'open', 'in_progress', 'waiting_client', 'resolved', 'closed'
  assigned_to uuid REFERENCES profiles(id),
  client_id uuid REFERENCES clients(id), -- se autenticado
  shadow_token varchar, -- para rastreamento sem auth
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Respostas de Tickets
CREATE TABLE IF NOT EXISTS support_ticket_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES support_tickets(id) ON DELETE CASCADE,
  author_id uuid REFERENCES profiles(id), -- NULL se for resposta do cliente
  author_name varchar NOT NULL, -- nome visível (agente ou cliente)
  content text NOT NULL,
  is_internal_note boolean DEFAULT false, -- nota interna (não visível ao cliente)
  attachments jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Sequência para número de ticket
CREATE SEQUENCE IF NOT EXISTS support_ticket_seq START 1;

-- Função para gerar número de ticket
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number := 'TUR-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('support_ticket_seq')::text, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_generate_ticket_number ON support_tickets;
CREATE TRIGGER tr_generate_ticket_number
BEFORE INSERT ON support_tickets
FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();

-- ==========================================
-- BLOCO 3: BLOG / PORTAL SOCIAL
-- ==========================================

-- Posts do Blog
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  title varchar NOT NULL,
  slug varchar NOT NULL,
  summary varchar,
  cover_image_url varchar,
  content text NOT NULL, -- HTML sanitizado
  tags text[] DEFAULT '{}',
  category varchar,
  cta_text varchar,
  cta_url varchar,
  status varchar DEFAULT 'draft', -- 'draft', 'ai_draft', 'pending_review', 'published', 'archived'
  ai_generated boolean DEFAULT false,
  source_url varchar, -- para posts vindos de RSS
  seo_title varchar,
  seo_description varchar,
  seo_slug varchar,
  approved_by uuid REFERENCES profiles(id), -- OBRIGATÓRIO para publicar
  approved_at timestamptz,
  published_at timestamptz,
  views int DEFAULT 0,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT blog_posts_slug_org_unique UNIQUE (org_id, slug)
);

-- Notas editoriais internas (não públicas)
CREATE TABLE IF NOT EXISTS blog_post_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_id uuid REFERENCES profiles(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Guias de Destinos
CREATE TABLE IF NOT EXISTS destination_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  destination_name varchar NOT NULL,
  slug varchar NOT NULL,
  cover_image_url varchar,
  content text NOT NULL,
  highlights jsonb DEFAULT '[]', -- [{icon, title, description}]
  best_time_to_visit varchar,
  visa_info text,
  currency_info text,
  seo_title varchar,
  seo_description varchar,
  status varchar DEFAULT 'draft', -- 'draft', 'published'
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT destination_guides_slug_org_unique UNIQUE (org_id, slug)
);

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='destination_guides' AND column_name='status') THEN
    ALTER TABLE destination_guides ADD COLUMN status varchar DEFAULT 'draft';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='support_articles' AND column_name='status') THEN
    ALTER TABLE support_articles ADD COLUMN status varchar DEFAULT 'draft';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='status') THEN
    ALTER TABLE blog_posts ADD COLUMN status varchar DEFAULT 'draft';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='approved_by') THEN
    ALTER TABLE blog_posts ADD COLUMN approved_by uuid REFERENCES profiles(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='published_at') THEN
    ALTER TABLE blog_posts ADD COLUMN published_at timestamptz;
  END IF;
END $$;

-- ==========================================
-- BLOCO 4: RLS (ROW LEVEL SECURITY)
-- ==========================================

-- Knowledge Base
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_tone_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_knowledge_policies ENABLE ROW LEVEL SECURITY;

-- Chunks públicos aprovados são acessíveis sem auth (para IA pública)
CREATE POLICY "Public approved chunks" ON knowledge_chunks
  FOR SELECT USING (approved_for_public_ai = true AND pii_level = 'none' AND visibility = 'public');

CREATE POLICY "Org chunks isolation" ON knowledge_chunks
  FOR ALL USING (org_id = (select public.get_my_org_id()));

CREATE POLICY "Org sources isolation" ON knowledge_sources
  FOR ALL USING (org_id = (select public.get_my_org_id()));

CREATE POLICY "Org embeddings isolation" ON knowledge_embeddings
  FOR ALL USING (org_id = (select public.get_my_org_id()));

CREATE POLICY "Org agents isolation" ON ai_agents
  FOR ALL USING (org_id = (select public.get_my_org_id()));

CREATE POLICY "Org agent runs isolation" ON ai_agent_runs
  FOR ALL USING (org_id = (select public.get_my_org_id()));

CREATE POLICY "Org tone isolation" ON agency_tone_profiles
  FOR ALL USING (org_id = (select public.get_my_org_id()));

CREATE POLICY "Org knowledge policy isolation" ON public_knowledge_policies
  FOR ALL USING (org_id = (select public.get_my_org_id()));

-- Support Center
ALTER TABLE support_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_replies ENABLE ROW LEVEL SECURITY;

-- Artigos publicados visíveis publicamente
CREATE POLICY "Public published articles" ON support_articles
  FOR SELECT USING (status = 'published');

CREATE POLICY "Org articles admin" ON support_articles
  FOR ALL USING (org_id = (select public.get_my_org_id()));

-- FAQs publicadas visíveis publicamente
CREATE POLICY "Public published faqs" ON faq_items
  FOR SELECT USING (is_published = true);

CREATE POLICY "Org faqs admin" ON faq_items
  FOR ALL USING (org_id = (select public.get_my_org_id()));

CREATE POLICY "Org tickets isolation" ON support_tickets
  FOR ALL USING (org_id = (select public.get_my_org_id()));

CREATE POLICY "Org ticket replies isolation" ON support_ticket_replies
  FOR ALL USING (
    ticket_id IN (SELECT id FROM support_tickets WHERE org_id = (select public.get_my_org_id()))
  );

-- Blog
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE destination_guides ENABLE ROW LEVEL SECURITY;

-- Posts publicados visíveis publicamente
CREATE POLICY "Public published posts" ON blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Org blog admin" ON blog_posts
  FOR ALL USING (org_id = (select public.get_my_org_id()));

CREATE POLICY "Org blog notes" ON blog_post_notes
  FOR ALL USING (
    post_id IN (SELECT id FROM blog_posts WHERE org_id = (select public.get_my_org_id()))
  );

-- Guias publicados visíveis publicamente
CREATE POLICY "Public published guides" ON destination_guides
  FOR SELECT USING (status = 'published');

CREATE POLICY "Org guides admin" ON destination_guides
  FOR ALL USING (org_id = (select public.get_my_org_id()));

-- ==========================================
-- BLOCO 5: TRIGGER DE PROTEÇÃO DE PUBLICAÇÃO
-- ==========================================

-- Bloqueio: Blog post NÃO pode ser publicado sem aprovação humana
CREATE OR REPLACE FUNCTION enforce_blog_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND NEW.approved_by IS NULL THEN
    RAISE EXCEPTION 'POLÍTICA DE APROVAÇÃO: Posts de blog não podem ser publicados sem aprovação humana. Preencha o campo approved_by.';
  END IF;
  IF NEW.status = 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_enforce_blog_approval ON blog_posts;
CREATE TRIGGER tr_enforce_blog_approval
BEFORE INSERT OR UPDATE ON blog_posts
FOR EACH ROW EXECUTE FUNCTION enforce_blog_approval();
