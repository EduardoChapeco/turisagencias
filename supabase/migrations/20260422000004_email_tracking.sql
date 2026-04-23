-- create email_tracking_logs table
CREATE TABLE IF NOT EXISTS public.email_tracking_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL, -- 'quotation', 'ticket', 'crm_card', 'general'
    entity_id UUID,            -- reference to the entity
    recipient_email TEXT,
    subject TEXT,
    opened_at TIMESTAMP WITH TIME ZONE,
    open_count INTEGER DEFAULT 0,
    last_ip TEXT,
    last_user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- set up row level security
ALTER TABLE public.email_tracking_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tracking logs for their org"
    ON public.email_tracking_logs
    FOR SELECT
    USING (org_id = public.get_my_org_id());

-- The edge function needs to be able to UPDATE this table without RLS block, since it's anonymous (the email client fetching the pixel).
-- Or we use service_role key in the edge function, which bypasses RLS. So no insert/update policy needed for anonymous.

-- indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_tracking_logs_entity_id ON public.email_tracking_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_logs_org_id ON public.email_tracking_logs(org_id);

-- enable realtime for ui updates
ALTER PUBLICATION supabase_realtime ADD TABLE email_tracking_logs;

-- RPC to increment email open safely
CREATE OR REPLACE FUNCTION public.increment_email_open(_log_id UUID, _ip TEXT, _ua TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.email_tracking_logs
    SET 
        opened_at = COALESCE(opened_at, now()),
        open_count = open_count + 1,
        last_ip = _ip,
        last_user_agent = _ua,
        updated_at = now()
    WHERE id = _log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_email_open_simple(_log_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.email_tracking_logs
    SET 
        open_count = open_count + 1,
        updated_at = now()
    WHERE id = _log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
