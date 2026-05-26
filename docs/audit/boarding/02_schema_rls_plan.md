# 02 Schema & RLS Plan

## Novas Tabelas Mapeadas
A infraestrutura real de embarque exigirá o deploy das tabelas sugeridas pelo PRD:

1. **`airline_link_registry`**: Repositório central de links (check-in, manage booking, status) com suporte para `deep_link_template` (ex: LATAM, GOL).
2. **`trip_airline_action_links`**: O log individual de URLs geradas por tentativa de check-in de cada passageiro/viagem.
3. **`trip_checkin_status`**: Tabela de status granular (ex: `waiting_window`, `available`, `problem`).
4. **`boarding_pass_documents`**: Controle de Storage para PDFs e Pkpasses.
5. **`boarding_operation_logs`**: Auditoria isolada livre de PII direta (LGPD compliance).

## Row Level Security (RLS)
Todas as tabelas relacionadas à org e cliente devem utilizar a policy genérica atrelada à coluna `org_id`.
- **Global Table**: `airline_link_registry` não tem `org_id`. Suas policies serão baseadas em autenticação simples (apenas leitura para roles regulares e public auth).
- **Tenant Isolation**: As demais tabelas devem estender a restrição `where org_id = auth.jwt() -> 'app_metadata' ->> 'org_id'`.
