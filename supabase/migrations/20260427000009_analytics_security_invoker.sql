-- Migration: omega_v5_analytics_views_security
-- Propósito: Adicionar SECURITY INVOKER nas views de analytics para herdar RLS do usuário.
-- Views criadas sem SECURITY DEFINER respeitam as políticas RLS do chamador.

-- Recriar view com segurança explícita
DROP VIEW IF EXISTS public.org_analytics_summary;

CREATE OR REPLACE VIEW public.org_analytics_summary
WITH (security_invoker = true) AS
SELECT
  o.id AS org_id,
  o.name AS org_name,
  o.plan,
  o.parent_org_id,
  COUNT(DISTINCT q.id) FILTER (WHERE q.created_at >= now() - interval '30 days') AS quotations_30d,
  COUNT(DISTINCT q.id) FILTER (WHERE q.status = 'confirmed' AND q.created_at >= now() - interval '30 days') AS confirmed_30d,
  COALESCE(SUM(q.total_value) FILTER (WHERE q.status = 'confirmed' AND q.created_at >= now() - interval '30 days'), 0) AS revenue_30d,
  COUNT(DISTINCT c.id) AS total_clients,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status IN ('open','in_progress') AND t.created_at >= now() - interval '30 days') AS open_tickets_30d,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'closed' AND t.created_at >= now() - interval '30 days') AS sla_breaches_30d,
  ROUND(
    CASE WHEN COUNT(DISTINCT q.id) FILTER (WHERE q.created_at >= now() - interval '30 days') > 0
    THEN (COUNT(DISTINCT q.id) FILTER (WHERE q.status = 'confirmed' AND q.created_at >= now() - interval '30 days') * 100.0
         / COUNT(DISTINCT q.id) FILTER (WHERE q.created_at >= now() - interval '30 days'))
    ELSE 0 END
  , 1) AS conversion_rate_pct
FROM public.organizations o
LEFT JOIN public.quotations q ON q.org_id = o.id
LEFT JOIN public.clients c ON c.org_id = o.id
LEFT JOIN public.tickets t ON t.org_id = o.id
GROUP BY o.id, o.name, o.plan, o.parent_org_id;

GRANT SELECT ON public.org_analytics_summary TO authenticated, service_role;

DROP VIEW IF EXISTS public.quotations_monthly_trend;

CREATE OR REPLACE VIEW public.quotations_monthly_trend
WITH (security_invoker = true) AS
SELECT
  org_id,
  DATE_TRUNC('month', created_at) AS month,
  COUNT(*)::int AS total,
  COUNT(*) FILTER (WHERE status = 'confirmed')::int AS confirmed,
  COALESCE(SUM(total_value) FILTER (WHERE status = 'confirmed'), 0) AS revenue
FROM public.quotations
WHERE created_at >= now() - interval '6 months'
GROUP BY org_id, DATE_TRUNC('month', created_at)
ORDER BY month DESC;

GRANT SELECT ON public.quotations_monthly_trend TO authenticated, service_role;
