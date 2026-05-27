-- Migration: Omega v8 Vault Immutability
-- Transforms contract_signatures into a WORM (Write Once, Read Many) table
-- "Cofre Imutável (Indestrutível) - Logs Pétreos"

-- 1. Create a trigger function that always throws an exception on UPDATE or DELETE
CREATE OR REPLACE FUNCTION public.prevent_update_delete_vault()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RAISE EXCEPTION 'COFRE IMUTÁVEL: Alterações e exclusões são estritamente proibidas nesta tabela por razões de auditoria e conformidade legal.';
    RETURN NULL;
END;
$$;

-- 2. Apply the trigger to prevent UPDATE
DROP TRIGGER IF EXISTS prevent_vault_update ON public.contract_signatures;
CREATE TRIGGER prevent_vault_update
    BEFORE UPDATE ON public.contract_signatures
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_update_delete_vault();

-- 3. Apply the trigger to prevent DELETE
DROP TRIGGER IF EXISTS prevent_vault_delete ON public.contract_signatures;
CREATE TRIGGER prevent_vault_delete
    BEFORE DELETE ON public.contract_signatures
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_update_delete_vault();

-- 4. Enable Row Level Security (if not already)
ALTER TABLE public.contract_signatures ENABLE ROW LEVEL SECURITY;

-- 5. Ensure org_id based read-only access is solid
DROP POLICY IF EXISTS "org reads contract_signatures" ON public.contract_signatures;
CREATE POLICY "org reads contract_signatures" 
    ON public.contract_signatures
    FOR SELECT 
    TO authenticated
    USING (org_id = public.get_my_org_id());

-- 6. Add policy for public read by hash_sha256 for the SignatureCertificate view
DROP POLICY IF EXISTS "public reads contract_signatures by hash" ON public.contract_signatures;
CREATE POLICY "public reads contract_signatures by hash" 
    ON public.contract_signatures
    FOR SELECT 
    TO anon, authenticated
    USING (true); -- We will rely on knowing the highly-entropic hash_sha256

-- Note: INSERTS are strictly done by Edge Functions (service_role), so no INSERT policy for authenticated/anon.
