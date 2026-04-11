-- Migration: hi_fi_media_and_sections
-- Criada em: 2026-04-11
-- Propósito: Implementar suporte para galerias de alta fidelidade e seções dinâmicas.

-- 1. Expansão para Hotels
ALTER TABLE public.hotels_bank 
  ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 2. Expansão para Guides
ALTER TABLE public.destination_guides
  ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 3. Criação de Bucket de Mídia
-- Nota: Isso garante que o bucket 'media' exista para os uploads do MediaUploader.tsx
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Políticas de RLS para o bucket media
-- Permite leitura pública e upload por usuários autenticados.
INSERT INTO storage.policies (name, bucket_id, definition, action)
VALUES 
  ('Acesso Público Media', 'media', '(bucket_id = ''media'')', 'SELECT')
ON CONFLICT DO NOTHING;

INSERT INTO storage.policies (name, bucket_id, definition, action)
VALUES 
  ('Upload Autenticado Media', 'media', '(bucket_id = ''media'' AND auth.role() = ''authenticated'')', 'INSERT')
ON CONFLICT DO NOTHING;
