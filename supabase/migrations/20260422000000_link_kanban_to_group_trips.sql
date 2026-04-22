-- Migration: link_kanban_to_group_trips
-- Purpose: Add group_trip_id to kanban_cards to support excursion-based sales.

ALTER TABLE public.kanban_cards 
  ADD COLUMN IF NOT EXISTS group_trip_id UUID REFERENCES public.group_trips(id) ON DELETE SET NULL;

ALTER TABLE public.tickets 
  ADD COLUMN IF NOT EXISTS group_trip_id UUID REFERENCES public.group_trips(id) ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_kanban_cards_group_trip ON public.kanban_cards(group_trip_id);
CREATE INDEX IF NOT EXISTS idx_tickets_group_trip ON public.tickets(group_trip_id);
