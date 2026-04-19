
-- Add missing columns to kanban_cards
ALTER TABLE public.kanban_cards
  ADD COLUMN IF NOT EXISTS estimated_value numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS whatsapp text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS email text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT NULL;

-- kanban_tags
CREATE TABLE IF NOT EXISTS public.kanban_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#2E86AB',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, name)
);
ALTER TABLE public.kanban_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_tags_org" ON public.kanban_tags;
DROP POLICY IF EXISTS "kanban_tags_org" ON public.kanban_tags;
DROP POLICY IF EXISTS "kanban_tags_org" ON public.kanban_tags;
DROP POLICY IF EXISTS "kanban_tags_org" ON public.kanban_tags;
CREATE POLICY "kanban_tags_org" ON public.kanban_tags FOR ALL TO authenticated
  USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());

-- kanban_notes
CREATE TABLE IF NOT EXISTS public.kanban_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES public.kanban_cards(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.kanban_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_notes_org" ON public.kanban_notes;
DROP POLICY IF EXISTS "kanban_notes_org" ON public.kanban_notes;
DROP POLICY IF EXISTS "kanban_notes_org" ON public.kanban_notes;
DROP POLICY IF EXISTS "kanban_notes_org" ON public.kanban_notes;
CREATE POLICY "kanban_notes_org" ON public.kanban_notes FOR ALL TO authenticated
  USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());
DROP TRIGGER IF EXISTS set_kanban_notes_updated_at ON public.kanban_notes;
DROP TRIGGER IF EXISTS set_kanban_notes_updated_at ON public.kanban_notes;
DROP TRIGGER IF EXISTS set_kanban_notes_updated_at ON public.kanban_notes;
DROP TRIGGER IF EXISTS set_kanban_notes_updated_at ON public.kanban_notes;
CREATE TRIGGER set_kanban_notes_updated_at BEFORE UPDATE ON public.kanban_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- kanban_checklists
CREATE TABLE IF NOT EXISTS public.kanban_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES public.kanban_cards(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Checklist',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.kanban_checklists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_checklists_org" ON public.kanban_checklists;
DROP POLICY IF EXISTS "kanban_checklists_org" ON public.kanban_checklists;
DROP POLICY IF EXISTS "kanban_checklists_org" ON public.kanban_checklists;
DROP POLICY IF EXISTS "kanban_checklists_org" ON public.kanban_checklists;
CREATE POLICY "kanban_checklists_org" ON public.kanban_checklists FOR ALL TO authenticated
  USING (org_id = public.get_my_org_id())
  WITH CHECK (org_id = public.get_my_org_id());

-- kanban_checklist_items
CREATE TABLE IF NOT EXISTS public.kanban_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id uuid NOT NULL REFERENCES public.kanban_checklists(id) ON DELETE CASCADE,
  title text NOT NULL,
  is_checked boolean NOT NULL DEFAULT false,
  checked_at timestamptz DEFAULT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.kanban_checklist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "kanban_checklist_items_via_checklist" ON public.kanban_checklist_items;
DROP POLICY IF EXISTS "kanban_checklist_items_via_checklist" ON public.kanban_checklist_items;
DROP POLICY IF EXISTS "kanban_checklist_items_via_checklist" ON public.kanban_checklist_items;
DROP POLICY IF EXISTS "kanban_checklist_items_via_checklist" ON public.kanban_checklist_items;
CREATE POLICY "kanban_checklist_items_via_checklist" ON public.kanban_checklist_items FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.kanban_checklists cl WHERE cl.id = checklist_id AND cl.org_id = public.get_my_org_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.kanban_checklists cl WHERE cl.id = checklist_id AND cl.org_id = public.get_my_org_id()
    )
  );
