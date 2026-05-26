-- Migration: 20260526000001_create_news_article_versions.sql
-- Descrição: Cria a tabela de versionamento de artigos do Blog CMS para salvar histórico de edição.

CREATE TABLE IF NOT EXISTS public.news_article_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.news_articles(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  title TEXT NOT NULL,
  raw_excerpt TEXT,
  raw_content TEXT,
  image_url TEXT,
  ai_summary TEXT,
  ai_short_summary TEXT,
  ai_bullets JSONB DEFAULT '[]'::jsonb,
  ai_tags JSONB DEFAULT '[]'::jsonb,
  ai_category TEXT,
  ai_sentiment TEXT,
  ai_relevance_score INT,
  ai_travel_agency_insight TEXT,
  ai_recommended_action TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.news_article_versions ENABLE ROW LEVEL SECURITY;

-- Política de visualização (qualquer usuário autenticado ou anônimo com acesso ao artigo)
CREATE POLICY "news_article_versions_select_policy" ON public.news_article_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.news_articles a
      WHERE a.id = article_id
      AND (
        a.source_scope = 'master' 
        OR a.org_id = public.get_my_org_id()
      )
    )
  );

-- Política de gravação/gerenciamento (apenas usuários da organização do artigo ou super_admin)
CREATE POLICY "news_article_versions_all_policy" ON public.news_article_versions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.news_articles a
      WHERE a.id = article_id
      AND (
        a.org_id = public.get_my_org_id()
        OR public.has_role(auth.uid(), 'super_admin')
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.news_articles a
      WHERE a.id = article_id
      AND (
        a.org_id = public.get_my_org_id()
        OR public.has_role(auth.uid(), 'super_admin')
      )
    )
  );
