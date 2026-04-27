-- Add seat_map_visible_to_client column to group_trips if it doesn't exist
ALTER TABLE public.group_trips
  ADD COLUMN IF NOT EXISTS seat_map_visible_to_client BOOLEAN NOT NULL DEFAULT false;
