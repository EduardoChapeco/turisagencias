-- Adicionando TTL (Time to Live) em Tokens Públicos

-- 1. Quotations
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE;

CREATE OR REPLACE FUNCTION public.get_public_quotation(_token UUID)
RETURNS TABLE (
  id UUID,
  org_id UUID,
  client_id UUID,
  destination TEXT,
  hotel_name TEXT,
  check_in DATE,
  check_out DATE,
  total_price NUMERIC,
  currency TEXT,
  status TEXT,
  items JSONB,
  org_name TEXT,
  org_logo TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    q.id,
    q.org_id,
    q.client_id,
    q.destination,
    q.hotel_name,
    q.check_in,
    q.check_out,
    q.total_price,
    q.currency,
    q.status,
    q.items,
    o.name,
    o.logo_url
  FROM public.quotations q
  JOIN public.organizations o ON o.id = q.org_id
  WHERE q.share_token = _token 
    AND (q.token_expires_at IS NULL OR q.token_expires_at > now());
$$;


-- 2. Itineraries
ALTER TABLE public.itineraries ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE;
-- (RLS Policies on itineraries usually check the token in a SELECT policy, so we update the policy)
DROP POLICY IF EXISTS "Anon reads valid token" ON public.itineraries;
CREATE POLICY "Anon reads valid token"
  ON public.itineraries FOR SELECT TO anon
  USING (public_token IS NOT NULL AND (token_expires_at IS NULL OR token_expires_at > now()));


-- 3. Checklists
ALTER TABLE public.checklists ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE;

CREATE OR REPLACE FUNCTION public.get_public_checklist(_token UUID)
RETURNS TABLE (
  checklist_id UUID,
  title TEXT,
  item_id UUID,
  item_title TEXT,
  item_description TEXT,
  is_completed BOOLEAN,
  position INT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.title,
    i.id,
    i.title,
    i.description,
    i.is_completed,
    i.position
  FROM public.checklists c
  JOIN public.checklist_items i ON i.checklist_id = c.id
  WHERE c.share_token = _token
    AND c.is_visible_to_client = true
    AND (c.token_expires_at IS NULL OR c.token_expires_at > now())
  ORDER BY i.position, i.created_at
$$;

CREATE OR REPLACE FUNCTION public.toggle_public_checklist_item(_token UUID, _item_id UUID, _is_completed BOOLEAN)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _checklist_id UUID;
BEGIN
  UPDATE public.checklist_items i
  SET
    is_completed = _is_completed,
    completed_at = CASE WHEN _is_completed THEN now() ELSE NULL END
  FROM public.checklists c
  WHERE c.id = i.checklist_id
    AND c.share_token = _token
    AND c.is_visible_to_client = true
    AND (c.token_expires_at IS NULL OR c.token_expires_at > now())
    AND i.id = _item_id
  RETURNING c.id INTO _checklist_id;

  RETURN _checklist_id;
END;
$$;


-- 4. Group Bookings
ALTER TABLE public.group_bookings ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE;

DROP POLICY IF EXISTS "public read booking by token" ON public.group_bookings;
CREATE POLICY "public read booking by token"
  ON public.group_bookings FOR SELECT
  USING (public_token IS NOT NULL AND (token_expires_at IS NULL OR token_expires_at > now()));


-- 5. Kanban Checklists
ALTER TABLE public.kanban_checklists ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE;
