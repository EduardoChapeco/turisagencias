-- Migration: admin_pins
-- Adds secure table for PIN authentication to the Admin portal

CREATE TABLE IF NOT EXISTS public.admin_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hashed_pin TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: Only Super Admins can manage pins. 
-- Regular users (even the admin themselves) cannot read this table directly
-- to avoid exposing hashed_pin to the frontend.
ALTER TABLE public.admin_pins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No direct read access to pins" ON public.admin_pins;
CREATE POLICY "No direct read access to pins"
  ON public.admin_pins FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Super admins can manage pins" ON public.admin_pins;
CREATE POLICY "Super admins can manage pins"
  ON public.admin_pins FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'super_admin'
    )
  );

-- Function to handle pin update (updates updated_at)
CREATE TRIGGER handle_admin_pins_updated_at
  BEFORE UPDATE ON public.admin_pins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
