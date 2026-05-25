-- ───────────────────────────────────────────────────────────
-- OMEGA v6.0 Sprint 2 - Eliminação de Colunas Duplicadas nas Cotações
-- ───────────────────────────────────────────────────────────

-- 1. Remover o trigger de sincronização antigo
DROP TRIGGER IF EXISTS trg_sync_quotation_pax ON public.quotations;
DROP FUNCTION IF EXISTS public.sync_quotation_pax_columns();

-- 2. Eliminar as colunas duplicadas da tabela public.quotations
ALTER TABLE public.quotations
  DROP COLUMN IF EXISTS adults,
  DROP COLUMN IF EXISTS pax_adultos,
  DROP COLUMN IF EXISTS children,
  DROP COLUMN IF EXISTS pax_criancas,
  DROP COLUMN IF EXISTS markup_percent;

-- 3. Recriar a função e o trigger simplificados apenas para recalcular total_pax
CREATE OR REPLACE FUNCTION public.recalculate_quotation_total_pax()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.total_pax := COALESCE(NEW.num_adults, 0) + COALESCE(NEW.pax_seniores, 0) + 
                   COALESCE(NEW.num_children, 0) + COALESCE(NEW.pax_infantil, 0);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_recalculate_quotation_total_pax
  BEFORE INSERT OR UPDATE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.recalculate_quotation_total_pax();
