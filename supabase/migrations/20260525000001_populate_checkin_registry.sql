-- ───────────────────────────────────────────────────────────
-- OMEGA v6.0 Sprint 1 - Carga Oficial de Check-in das Aéreas
-- ───────────────────────────────────────────────────────────

INSERT INTO public.airline_checkin_registry (
  airline_iata,
  airline_name,
  landing_url,
  deep_link_template,
  required_fields,
  supports_prefill,
  notes,
  status
) VALUES 
(
  'LA',
  'LATAM Airlines Brasil',
  'https://www.latamairlines.com/br/pt/check-in',
  'https://www.latamairlines.com/br/pt/check-in?reservationCode={{pnr}}&lastName={{last_name}}',
  '[{"field": "pnr", "label": "Código de Reserva (PNR)", "required": true}, {"field": "last_name", "label": "Sobrenome do Passageiro", "required": true}]'::jsonb,
  true,
  'Suporta preenchimento direto via URL de PNR e Sobrenome.',
  'published'
),
(
  'AD',
  'Azul Linhas Aéreas Brasileiras',
  'https://www.voeazul.com.br/br/pt/check-in',
  'https://www.voeazul.com.br/br/pt/check-in?locator={{pnr}}',
  '[{"field": "pnr", "label": "Localizador (PNR)", "required": true}]'::jsonb,
  true,
  'Prefill por localizador de voo.',
  'published'
),
(
  'G3',
  'GOL Linhas Aéreas',
  'https://www.voegol.com.br/check-in',
  'https://www.voegol.com.br/check-in?locator={{pnr}}&lastName={{last_name}}',
  '[{"field": "pnr", "label": "Localizador (PNR)", "required": true}, {"field": "last_name", "label": "Sobrenome do Passageiro", "required": true}]'::jsonb,
  true,
  'Requer código localizador e sobrenome do passageiro principal.',
  'published'
)
ON CONFLICT (id) DO NOTHING;
