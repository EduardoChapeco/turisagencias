-- Migration: traveler_info_pages
-- Criada em: 2026-04-11
-- Propósito: Criar tabela para as páginas de informações úteis a viajantes (Dicas de viagem, o que levar, etc).

CREATE TABLE IF NOT EXISTS traveler_info_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    cover_image_url TEXT,
    content_blocks JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array de blocos {type: 'text'|'alert'|'image', content: ...}
    is_published BOOLEAN DEFAULT false,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_traveler_info_org_id ON traveler_info_pages(org_id);
CREATE INDEX IF NOT EXISTS idx_traveler_info_slug ON traveler_info_pages(slug);

ALTER TABLE traveler_info_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their organization info pages" ON traveler_info_pages;
CREATE POLICY "Users can view their organization info pages" ON traveler_info_pages FOR SELECT
    USING (org_id = get_my_org_id());

DROP POLICY IF EXISTS "Users can insert their organization info pages" ON traveler_info_pages;
CREATE POLICY "Users can insert their organization info pages" ON traveler_info_pages FOR INSERT
    WITH CHECK (org_id = get_my_org_id());

DROP POLICY IF EXISTS "Users can update their organization info pages" ON traveler_info_pages;
CREATE POLICY "Users can update their organization info pages" ON traveler_info_pages FOR UPDATE
    USING (org_id = get_my_org_id());

DROP POLICY IF EXISTS "Users can delete their organization info pages" ON traveler_info_pages;
CREATE POLICY "Users can delete their organization info pages" ON traveler_info_pages FOR DELETE
    USING (org_id = get_my_org_id());

-- Permite visualização anônima caso seja publicado
DROP POLICY IF EXISTS "Public info pages are viewable by everyone" ON traveler_info_pages;
CREATE POLICY "Public info pages are viewable by everyone" ON traveler_info_pages FOR SELECT
    USING (is_published = true);
