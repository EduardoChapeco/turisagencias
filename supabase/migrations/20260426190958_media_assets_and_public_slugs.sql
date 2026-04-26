CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  owner_type TEXT,
  owner_id UUID,
  field_name TEXT,
  bucket TEXT NOT NULL DEFAULT 'media',
  path TEXT,
  public_url TEXT NOT NULL,
  source_url TEXT,
  mime_type TEXT,
  size_bytes BIGINT,
  width INTEGER,
  height INTEGER,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  migration_status TEXT NOT NULL DEFAULT 'local' CHECK (migration_status IN ('local', 'external', 'migrated', 'failed')),
  migration_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org members view media assets" ON public.media_assets;
CREATE POLICY "org members view media assets" ON public.media_assets
  FOR SELECT TO authenticated
  USING (org_id = public.get_my_org_id());

DROP POLICY IF EXISTS "org members insert media assets" ON public.media_assets;
CREATE POLICY "org members insert media assets" ON public.media_assets
  FOR INSERT TO authenticated
  WITH CHECK (org_id = public.get_my_org_id());

DROP POLICY IF EXISTS "org members update media assets" ON public.media_assets;
CREATE POLICY "org members update media assets" ON public.media_assets
  FOR UPDATE TO authenticated
  USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());

DROP POLICY IF EXISTS "org members delete media assets" ON public.media_assets;
CREATE POLICY "org members delete media assets" ON public.media_assets
  FOR DELETE TO authenticated
  USING (org_id = public.get_my_org_id());

CREATE INDEX IF NOT EXISTS idx_media_assets_org_owner
  ON public.media_assets(org_id, owner_type, owner_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_public_url
  ON public.media_assets(public_url);
CREATE INDEX IF NOT EXISTS idx_media_assets_migration_status
  ON public.media_assets(migration_status);

DROP TRIGGER IF EXISTS update_media_assets_updated_at ON public.media_assets;
CREATE TRIGGER update_media_assets_updated_at
  BEFORE UPDATE ON public.media_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DO $$
BEGIN
  IF to_regclass('public.group_trips') IS NOT NULL THEN
    ALTER TABLE public.group_trips
      ADD COLUMN IF NOT EXISTS slug_locked BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS slug_updated_at TIMESTAMPTZ;
  END IF;

  IF to_regclass('public.traveler_info_pages') IS NOT NULL THEN
    ALTER TABLE public.traveler_info_pages
      ADD COLUMN IF NOT EXISTS slug_locked BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS slug_updated_at TIMESTAMPTZ;
  END IF;

  IF to_regclass('public.destination_guides') IS NOT NULL THEN
    ALTER TABLE public.destination_guides
      ADD COLUMN IF NOT EXISTS slug_locked BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS slug_updated_at TIMESTAMPTZ;
  END IF;
END $$;
