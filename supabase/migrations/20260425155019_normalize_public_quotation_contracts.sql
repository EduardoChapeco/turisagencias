-- Normalize public quotation links around public_token.
-- This removes the old share_token contract from the active schema and keeps
-- public quotation access tied to the same token used by /q/:token.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS public_token text;

UPDATE public.quotations
SET public_token = COALESCE(
  NULLIF(public_token, ''),
  CASE
    WHEN share_token IS NOT NULL THEN replace(share_token::text, '-', '')
    ELSE encode(gen_random_bytes(16), 'hex')
  END
)
WHERE public_token IS NULL OR public_token = '';

ALTER TABLE public.quotations
  ALTER COLUMN public_token SET DEFAULT encode(gen_random_bytes(16), 'hex'),
  ALTER COLUMN public_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_quotations_public_token_unique
  ON public.quotations(public_token);

DROP FUNCTION IF EXISTS public.confirm_public_quotation(text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.confirm_public_quotation(uuid, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.confirm_public_quotation CASCADE;

CREATE OR REPLACE FUNCTION public.confirm_public_quotation(
  p_token text,
  p_traveler_name text,
  p_traveler_email text DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM p_traveler_name, p_traveler_email;

  UPDATE public.quotations
  SET
    status = 'confirmed',
    confirmed_at = COALESCE(confirmed_at, now()),
    updated_at = now(),
    notes = CASE
      WHEN COALESCE(p_notes, '') = '' THEN notes
      WHEN COALESCE(notes, '') = '' THEN p_notes
      ELSE notes || E'\n\nConfirmacao publica: ' || p_notes
    END
  WHERE public_token = p_token
    AND status IN ('sent', 'viewed');

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_public_quotation(text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_public_quotation(text, text, text, text) TO anon, authenticated;

DROP FUNCTION IF EXISTS public.get_public_quotation(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_public_quotation(text) CASCADE;

CREATE OR REPLACE FUNCTION public.get_public_quotation(_token text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (to_jsonb(q)
      - 'org_id'
      - 'agent_id'
      - 'client_id'
      - 'trip_id'
      - 'notes_internal'
      - 'ai_raw_response'
      - 'id_operadora'
      - 'source_file_url')
    || jsonb_build_object(
      'organizations',
        (
          SELECT jsonb_build_object(
            'name', o.name,
            'logo_url', o.logo_url,
            'whatsapp', o.whatsapp,
            'primary_color', o.primary_color
          )
          FROM public.organizations o
          WHERE o.id = q.org_id
        ),
      'itinerary_days',
        COALESCE(
          (
            SELECT jsonb_agg(
              to_jsonb(d)
              || jsonb_build_object(
                'itinerary_items',
                  COALESCE(
                    (
                      SELECT jsonb_agg(to_jsonb(i) ORDER BY i.order_position)
                      FROM public.itinerary_items i
                      WHERE i.itinerary_day_id = d.id
                    ),
                    '[]'::jsonb
                  )
              )
              ORDER BY d.day_number
            )
            FROM public.itinerary_days d
            WHERE d.quote_id = q.id
          ),
          '[]'::jsonb
        ),
      'flights',
        COALESCE(
          (
            SELECT jsonb_agg(
              to_jsonb(f)
              || jsonb_build_object(
                'flight_segments',
                  COALESCE(
                    (
                      SELECT jsonb_agg(to_jsonb(s) ORDER BY s.segment_order)
                      FROM public.flight_segments s
                      WHERE s.flight_id = f.id
                    ),
                    '[]'::jsonb
                  ),
                'flight_amenities',
                  COALESCE(
                    (
                      SELECT jsonb_agg(to_jsonb(a) ORDER BY a.label)
                      FROM public.flight_amenities a
                      WHERE a.flight_id = f.id
                    ),
                    '[]'::jsonb
                  )
              )
              ORDER BY f.order_position, f.direction
            )
            FROM public.flights f
            WHERE f.quote_id = q.id
          ),
          '[]'::jsonb
        ),
      'quote_transfers',
        COALESCE(
          (
            SELECT jsonb_agg(to_jsonb(t) ORDER BY t.order_position)
            FROM public.quote_transfers t
            WHERE t.quote_id = q.id
          ),
          '[]'::jsonb
        ),
      'quote_price_items',
        COALESCE(
          (
            SELECT jsonb_agg(to_jsonb(p) ORDER BY p.order_position)
            FROM public.quote_price_items p
            WHERE p.quote_id = q.id
          ),
          '[]'::jsonb
        ),
      'quote_includes',
        COALESCE(
          (
            SELECT jsonb_agg(to_jsonb(inc) ORDER BY inc.order_position)
            FROM public.quote_includes inc
            WHERE inc.quote_id = q.id
          ),
          '[]'::jsonb
        ),
      'quote_experiences',
        COALESCE(
          (
            SELECT jsonb_agg(to_jsonb(e) ORDER BY e.order_position)
            FROM public.quote_experiences e
            WHERE e.quote_id = q.id
          ),
          '[]'::jsonb
        )
    )
  FROM public.quotations q
  WHERE q.public_token = _token
    AND q.status IN ('sent', 'viewed', 'confirmed')
    AND (q.token_expires_at IS NULL OR q.token_expires_at > now())
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.get_public_quotation(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_quotation(text) TO anon, authenticated;

DROP POLICY IF EXISTS "Anon quotes valid token" ON public.quotations;
DROP POLICY IF EXISTS "Anon reads valid public quotation token" ON public.quotations;

ALTER TABLE public.quotations
  DROP COLUMN IF EXISTS share_token CASCADE;
