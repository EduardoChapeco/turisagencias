-- Normalize ticket message storage to the canonical `content` column.
-- Older migrations temporarily kept `body` and a sync trigger; the frontend now
-- writes and reads `content` only, while org isolation continues through tickets.

ALTER TABLE public.ticket_messages
  ADD COLUMN IF NOT EXISTS content text;

UPDATE public.ticket_messages
SET content = COALESCE(NULLIF(content, ''), body)
WHERE (content IS NULL OR content = '')
  AND body IS NOT NULL;

ALTER TABLE public.ticket_messages
  ALTER COLUMN content SET NOT NULL;

DROP TRIGGER IF EXISTS trg_sync_ticket_message_content ON public.ticket_messages;
DROP FUNCTION IF EXISTS public.sync_ticket_message_content();

ALTER TABLE public.ticket_messages
  DROP COLUMN IF EXISTS body;
