-- Migration: fix_gaps_and_contracts
-- Fixes missing columns and corrects RLS policies identified in the Master Audit

-- 1. Add loyalty points and membership to clients
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS loyalty_points INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_member BOOLEAN DEFAULT false;

-- 2. Add extra media and codes to quotations
ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS code TEXT,
  ADD COLUMN IF NOT EXISTS pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 3. Fix subscription_plans RLS policy
-- Remove the hacky 'email LIKE %aline%' policy and replace with proper super_admin check
DROP POLICY IF EXISTS "Only super admins can modify subscription plans" ON public.subscription_plans;
CREATE POLICY "Only super admins can modify subscription plans"
  ON public.subscription_plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'super_admin'
    )
  );

-- 4. Ensure payments and bookings tables have proper generic super_admin bypass if needed
-- This just ensures the RLS for the tables created in Sprint E are solid.
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Payments
DROP POLICY IF EXISTS "Org members can view payments" ON public.payments;
CREATE POLICY "Org members can view payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    org_id = public.get_my_org_id()
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin')
  );

DROP POLICY IF EXISTS "Org admins can manage payments" ON public.payments;
CREATE POLICY "Org admins can manage payments"
  ON public.payments FOR ALL
  TO authenticated
  USING (
    (org_id = public.get_my_org_id() AND public.has_role(auth.uid(), 'org_admin'))
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin')
  );

-- Bookings
DROP POLICY IF EXISTS "Org members can view bookings" ON public.bookings;
CREATE POLICY "Org members can view bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (
    org_id = public.get_my_org_id()
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin')
  );

DROP POLICY IF EXISTS "Org admins can manage bookings" ON public.bookings;
CREATE POLICY "Org admins can manage bookings"
  ON public.bookings FOR ALL
  TO authenticated
  USING (
    (org_id = public.get_my_org_id() AND public.has_role(auth.uid(), 'org_admin'))
    OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin')
  );
