-- Migration: destination_guides_expansion
-- Criada em: 2026-04-11
-- Propósito: Adicionar campos necessários para webviews públicas, como slug e metadados.

ALTER TABLE destination_guides
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS public_views INT DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_destination_guides_slug ON destination_guides(slug);
