# Tabelas Reais Detectadas
> Baseado no `types.ts` gerado pelo Supabase. A conexão direta via CLI (`psql`) não foi possível.

## Tabelas Core
- `organizations`
- `profiles`

## CRM e Vendas
- `clients`
- `quotations`
- `proposals`
- `itineraries`
- `kanban_boards`
- `kanban_cards`

## Financeiro
- `payments`
- `financial_transactions`
- `suppliers`
- **GAP Crítico**: Faltam tabelas de comissão (`agent_commission_rules`, etc.).

## Builder / CMS
- `builder_projects`
- `builder_versions`
- **GAP Crítico**: O PRD cita `builder_sites` e `builder_pages`, mas o schema gerado atual só possui `builder_projects` e `builder_versions`. O projeto usa `public_sites` no lugar de `builder_sites`.

## Automação
- `automation_rules`
- **GAP**: Verificar presença de `automation_jobs`.

## IA e Conhecimento
- `ai_knowledge_base`
- `ai_agents`
- `ai_tasks`
