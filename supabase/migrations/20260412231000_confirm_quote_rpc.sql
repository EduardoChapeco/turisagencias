-- Migration: confirm_public_quotation_rpc

DROP FUNCTION IF EXISTS public.confirm_public_quotation CASCADE;
DROP FUNCTION IF EXISTS public.confirm_public_quotation CASCADE;
CREATE OR REPLACE FUNCTION public.confirm_public_quotation(
  p_token text,
  p_traveler_name text,
  p_traveler_email text,
  p_notes text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.quotations
  SET 
    status = 'confirmed',
    confirmed_at = now()
  WHERE public_token = p_token;
  
  -- Optionally, you could insert a record into a notifications table or kanban here.
  -- For now, returning true to indicate successful status update.
  
  RETURN FOUND;
END;
$$;
