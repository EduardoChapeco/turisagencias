-- Sprint 1: Finance and Bookings module

-- 1. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending_payment', -- pending_payment, confirmed, cancelled, refunded
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'BRL',
  installment_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "Users can view bookings in own org" ON public.bookings;
CREATE POLICY "Users can view bookings in own org" ON public.bookings FOR SELECT TO authenticated USING (org_id = public.get_my_org_id());
DROP POLICY IF EXISTS "Users can create bookings in own org" ON public.bookings;
CREATE POLICY "Users can create bookings in own org" ON public.bookings FOR INSERT TO authenticated WITH CHECK (org_id = public.get_my_org_id());
DROP POLICY IF EXISTS "Users can update bookings in own org" ON public.bookings;
CREATE POLICY "Users can update bookings in own org" ON public.bookings FOR UPDATE TO authenticated USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());
DROP POLICY IF EXISTS "Users can delete bookings in own org" ON public.bookings;
CREATE POLICY "Users can delete bookings in own org" ON public.bookings FOR DELETE TO authenticated USING (org_id = public.get_my_org_id());

-- 2. Payments Table (Installments)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  due_date DATE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, overdue, failed, refunded
  payment_method TEXT, -- pix, credit_card, boleto, bank_transfer, cash
  proof_url TEXT,
  installment_number INT NOT NULL DEFAULT 1,
  notes TEXT,
  gateway_transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "Users can view payments in own org" ON public.payments;
CREATE POLICY "Users can view payments in own org" ON public.payments FOR SELECT TO authenticated USING (org_id = public.get_my_org_id());
DROP POLICY IF EXISTS "Users can create payments in own org" ON public.payments;
CREATE POLICY "Users can create payments in own org" ON public.payments FOR INSERT TO authenticated WITH CHECK (org_id = public.get_my_org_id());
DROP POLICY IF EXISTS "Users can update payments in own org" ON public.payments;
CREATE POLICY "Users can update payments in own org" ON public.payments FOR UPDATE TO authenticated USING (org_id = public.get_my_org_id()) WITH CHECK (org_id = public.get_my_org_id());
DROP POLICY IF EXISTS "Users can delete payments in own org" ON public.payments;
CREATE POLICY "Users can delete payments in own org" ON public.payments FOR DELETE TO authenticated USING (org_id = public.get_my_org_id());

-- 3. Business Logic: Check that the last installment is before or on the departure date
CREATE OR REPLACE FUNCTION public.check_payment_due_date()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_departure_date DATE;
BEGIN
  -- We only enforce this if trip_id is present
  IF NEW.trip_id IS NOT NULL THEN
    SELECT departure_date INTO v_departure_date FROM public.trips WHERE id = NEW.trip_id;
    
    IF v_departure_date IS NOT NULL AND NEW.due_date > v_departure_date THEN
      RAISE EXCEPTION 'O vencimento da parcela (due_date) não pode ser posterior à data de embarque (departure_date) da viagem.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_payment_due_date ON public.payments;
CREATE TRIGGER trg_check_payment_due_date BEFORE INSERT OR UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.check_payment_due_date();
