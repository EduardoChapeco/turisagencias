
-- Add cover_url to clients
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS cover_url text;

-- Create storage bucket for client media
INSERT INTO storage.buckets (id, name, public) VALUES ('client-media', 'client-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for client-media
DROP POLICY IF EXISTS "Authenticated users can upload client media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload client media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload client media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload client media" ON storage.objects;
CREATE POLICY "Authenticated users can upload client media" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'client-media');

DROP POLICY IF EXISTS "Authenticated users can view client media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view client media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view client media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view client media" ON storage.objects;
CREATE POLICY "Authenticated users can view client media" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'client-media');

DROP POLICY IF EXISTS "Authenticated users can update client media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update client media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update client media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update client media" ON storage.objects;
CREATE POLICY "Authenticated users can update client media" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'client-media');

DROP POLICY IF EXISTS "Authenticated users can delete client media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete client media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete client media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete client media" ON storage.objects;
CREATE POLICY "Authenticated users can delete client media" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'client-media');

-- Public read for client-media (covers visible on portal)
DROP POLICY IF EXISTS "Public can view client media" ON storage.objects;
DROP POLICY IF EXISTS "Public can view client media" ON storage.objects;
DROP POLICY IF EXISTS "Public can view client media" ON storage.objects;
DROP POLICY IF EXISTS "Public can view client media" ON storage.objects;
CREATE POLICY "Public can view client media" ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'client-media');
