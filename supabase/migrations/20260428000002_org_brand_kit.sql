-- Migration: org_brand_kit
-- Adds brand kit columns to organizations table and creates storage bucket for assets

-- Step 1: Add columns to organizations
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS secondary_color TEXT,
  ADD COLUMN IF NOT EXISTS font_style TEXT DEFAULT 'moderna',
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS google_business_url TEXT,
  ADD COLUMN IF NOT EXISTS anac_registration TEXT,
  ADD COLUMN IF NOT EXISTS iata_code TEXT,
  ADD COLUMN IF NOT EXISTS brand_kit JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ai_credits INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_credits_reset_at TIMESTAMPTZ;

-- Step 2: Create storage bucket for org assets (logos, covers, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('org-assets', 'org-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Storage policies for org-assets
DROP POLICY IF EXISTS "Org assets are public" ON storage.objects;
CREATE POLICY "Org assets are public"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'org-assets');

-- Using a simpler policy for inserting to org-assets for now.
-- In a real production scenario, we'd check if the folder matches org_id
DROP POLICY IF EXISTS "Authenticated users can insert org assets" ON storage.objects;
CREATE POLICY "Authenticated users can insert org assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'org-assets');

DROP POLICY IF EXISTS "Authenticated users can update org assets" ON storage.objects;
CREATE POLICY "Authenticated users can update org assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'org-assets');

DROP POLICY IF EXISTS "Authenticated users can delete org assets" ON storage.objects;
CREATE POLICY "Authenticated users can delete org assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'org-assets');
