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
DROP POLICY IF EXISTS "media_public_select" ON storage.objects;
DROP POLICY IF EXISTS "media_public_select" ON storage.objects;
CREATE POLICY "media_public_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

-- Upload permitido somente para usuários autenticados
DROP POLICY IF EXISTS "media_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "media_auth_insert" ON storage.objects;
CREATE POLICY "media_auth_insert" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');

-- Update permitido somente para usuários autenticados
DROP POLICY IF EXISTS "media_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "media_auth_update" ON storage.objects;
CREATE POLICY "media_auth_update" ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media');

-- Delete permitido somente para usuários autenticados
DROP POLICY IF EXISTS "media_auth_delete" ON storage.objects;
DROP POLICY IF EXISTS "media_auth_delete" ON storage.objects;
CREATE POLICY "media_auth_delete" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'media');

-- =============================================
-- RLS Policies — bucket: documents
-- =============================================

DROP POLICY IF EXISTS "docs_public_select" ON storage.objects;
DROP POLICY IF EXISTS "docs_public_select" ON storage.objects;
CREATE POLICY "docs_public_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "docs_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "docs_auth_insert" ON storage.objects;
CREATE POLICY "docs_auth_insert" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

DROP POLICY IF EXISTS "docs_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "docs_auth_update" ON storage.objects;
CREATE POLICY "docs_auth_update" ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "docs_auth_delete" ON storage.objects;
DROP POLICY IF EXISTS "docs_auth_delete" ON storage.objects;
CREATE POLICY "docs_auth_delete" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents');
