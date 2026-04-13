-- =============================================
-- Storage Buckets: media + documents
-- Sem limite de tamanho (file_size_limit = NULL)
-- Acesso público de leitura, upload somente autenticados
-- =============================================

-- Bucket para imagens e vídeos gerais (fotos de clientes, hotéis, guias, cotações)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  NULL,  -- Sem limite de tamanho
  NULL   -- Todos os tipos MIME aceitos
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = NULL,
  allowed_mime_types = NULL;

-- Bucket para documentos dos clientes (passaportes, RG, CNH, carnês profissionais)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  NULL,  -- Sem limite de tamanho
  NULL   -- Todos os tipos MIME aceitos
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = NULL,
  allowed_mime_types = NULL;

-- =============================================
-- RLS Policies — bucket: media
-- =============================================

-- Leitura pública
CREATE POLICY IF NOT EXISTS "media_public_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

-- Upload permitido somente para usuários autenticados
CREATE POLICY IF NOT EXISTS "media_auth_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Update permitido somente para usuários autenticados
CREATE POLICY IF NOT EXISTS "media_auth_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Delete permitido somente para usuários autenticados
CREATE POLICY IF NOT EXISTS "media_auth_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'media' AND auth.role() = 'authenticated');

-- =============================================
-- RLS Policies — bucket: documents
-- =============================================

CREATE POLICY IF NOT EXISTS "docs_public_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

CREATE POLICY IF NOT EXISTS "docs_auth_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "docs_auth_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "docs_auth_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documents' AND auth.role() = 'authenticated');
