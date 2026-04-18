-- Adicionando coluna para geração de Rascunho IA de Emails (Inbox Webhook)
ALTER TABLE public.email_messages ADD COLUMN IF NOT EXISTS ai_draft_response TEXT;
