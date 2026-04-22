-- ====================================================================
-- Migration: align_schemas_to_frontend
-- Purpose: Fix missing columns from conflicting migrations and ensure 
--          all fields expected by the frontend hooks are present.
-- ====================================================================

-- 1. TICKETS
ALTER TABLE public.tickets 
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_to UUID,
  ADD COLUMN IF NOT EXISTS created_by UUID;

-- 2. KANBAN CARDS
ALTER TABLE public.kanban_cards 
  ADD COLUMN IF NOT EXISTS trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_to UUID,
  ADD COLUMN IF NOT EXISTS estimated_value NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS task_type TEXT,
  ADD COLUMN IF NOT EXISTS linked_card_ids UUID[];

-- 3. QUOTATIONS
ALTER TABLE public.quotations 
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS itinerary JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS transports JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS excursions JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS pricing_mode TEXT DEFAULT 'per_person',
  ADD COLUMN IF NOT EXISTS notes_internal TEXT,
  ADD COLUMN IF NOT EXISTS valid_until DATE,
  ADD COLUMN IF NOT EXISTS included_items TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS excluded_items TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS installments JSONB;

-- 4. CLIENTS
ALTER TABLE public.clients 
  ADD COLUMN IF NOT EXISTS cpf TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS zip_code TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS origin TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS passport_url TEXT,
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS passport_number TEXT,
  ADD COLUMN IF NOT EXISTS passport_expiry DATE,
  ADD COLUMN IF NOT EXISTS portal_access_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- 5. GROUP TRIPS (just in case)
ALTER TABLE public.group_trips 
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id),
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS subtitle TEXT,
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS gallery_urls TEXT[],
  ADD COLUMN IF NOT EXISTS destination TEXT,
  ADD COLUMN IF NOT EXISTS origin_city TEXT,
  ADD COLUMN IF NOT EXISTS departure_date DATE,
  ADD COLUMN IF NOT EXISTS return_date DATE,
  ADD COLUMN IF NOT EXISTS num_days INT,
  ADD COLUMN IF NOT EXISTS num_nights INT,
  ADD COLUMN IF NOT EXISTS price_per_pax NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'BRL',
  ADD COLUMN IF NOT EXISTS max_pax INT,
  ADD COLUMN IF NOT EXISTS current_pax INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS description_md TEXT,
  ADD COLUMN IF NOT EXISTS includes TEXT[],
  ADD COLUMN IF NOT EXISTS excludes TEXT[],
  ADD COLUMN IF NOT EXISTS important_notes TEXT,
  ADD COLUMN IF NOT EXISTS transport_type TEXT,
  ADD COLUMN IF NOT EXISTS bus_layout_id UUID,
  ADD COLUMN IF NOT EXISTS installments_count INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS payment_due_offset_days INT DEFAULT 5,
  ADD COLUMN IF NOT EXISTS contract_template_id UUID,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS booking_count INT DEFAULT 0;

-- 6. TICKET MESSAGES (align body/content)
-- Migration 1 uses `content`, migration 2 uses `body`
ALTER TABLE public.ticket_messages
  ADD COLUMN IF NOT EXISTS body TEXT,
  ADD COLUMN IF NOT EXISTS content TEXT;

-- Trigger to sync body and content if one is updated
CREATE OR REPLACE FUNCTION public.sync_ticket_message_content()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.body IS NOT NULL AND NEW.content IS NULL THEN
    NEW.content := NEW.body;
  ELSIF NEW.content IS NOT NULL AND NEW.body IS NULL THEN
    NEW.body := NEW.content;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_ticket_message_content ON public.ticket_messages;
CREATE TRIGGER trg_sync_ticket_message_content
BEFORE INSERT OR UPDATE ON public.ticket_messages
FOR EACH ROW EXECUTE FUNCTION public.sync_ticket_message_content();

-- 7. FINANCIAL TRANSACTIONS
ALTER TABLE public.financial_transactions
  ADD COLUMN IF NOT EXISTS group_trip_id UUID REFERENCES public.group_trips(id) ON DELETE SET NULL;
