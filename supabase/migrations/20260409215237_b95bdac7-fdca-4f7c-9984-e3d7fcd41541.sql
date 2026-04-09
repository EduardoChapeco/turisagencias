
-- ============================================================
-- PASSO 1: Adicionar colunas faltantes nas tabelas existentes
-- ============================================================

-- organizations
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS address jsonb;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS ai_keys_config jsonb;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_prefs jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp text;

-- clients
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS assigned_agent_id uuid;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS portal_access_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS portal_user_id uuid;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}'::jsonb;

-- ============================================================
-- PASSO 2: Remover trigger duplicado
-- ============================================================
DROP TRIGGER IF EXISTS trg_promote_first_user ON auth.users;

-- ============================================================
-- PASSO 3: Garantir triggers de auth existem
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_first_user_promote ON auth.users;
CREATE TRIGGER on_first_user_promote
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.promote_first_user();
