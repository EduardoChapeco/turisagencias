# Estado Real do Sistema — Turis Agências
> Gerado em: 2026-05-27 | Branch: reality-sync

## Sumário Executivo

| Indicador | Valor |
|-----------|-------|
| Total arquivos src/ | 466 |
| Total migrations | ~115 |
| Edge Functions | 28 |
| Tabelas tipadas (types.ts) | ~80+ |
| Casts `as any` encontrados | 464 linhas |
| Casts `supabase as any` críticos | 2 confirmados |
| Mocks/Fakes em produção | A classificar |
| Build status | NÃO VERIFICADO |

## 1. Estrutura de Arquivos

### Src (principais pastas)
- `src/components/` — UI Components (builder, crm, kanban, group-trips, ui/, onboarding/)
- `src/pages/` — ~60 páginas (admin/, finance/, group-trips/, portal/, settings/, legal/, automations/)
- `src/hooks/` — ~55 hooks (useClients, useQuotations, useVouchers, useBuilderStore, etc.)
- `src/stores/` — authStore.ts (Zustand)
- `src/domains/builder/` — blockContracts.ts, blockRegistry.ts
- `src/integrations/supabase/` — client.ts, types.ts (10.046 linhas)
- `src/test/` — 12 arquivos de teste

### Supabase Migrations
- **Total**: ~115 arquivos
- **Mais antiga**: 20260409170724
- **Mais recente**: 20260527000009_omega_v8_vault_immutability.sql
- **Conflito detectado**: Dois arquivos com timestamp 20260527000000 e 20260527000001

### Edge Functions (28 total)
| Função | Status |
|--------|--------|
| admin-auth | REAL |
| ai-chat-agent | REAL |
| airline-build-action-link | REAL |
| airline-build-deep-link | REAL |
| boarding-create-client-portal-link | REAL |
| boarding-get-portal-data | REAL |
| build-proposal | REAL |
| builder-publish-page | REAL |
| builder-submit-form | REAL |
| email-webhook-ingest | REAL |
| ext-process-quotation | REAL |
| extension-bootstrap | REAL |
| extension-sync | REAL |
| extract-quotation | REAL |
| extract-quotation-feedback | REAL |
| generate-embedding | REAL |
| generate-itinerary | REAL |
| geocode-address | REAL |
| interpret-request | REAL |
| invite-agent | REAL |
| ocr-extractor | REAL |
| process-automations | REAL |
| public-ai-chat | REAL |
| radar-crawler-squad | REAL |
| score-quotation | REAL |
| send-quotation | REAL |
| send-ticket-email | REAL |
| sign-group-booking-contract | REAL |
| track-email-open | REAL |
| trigger-brand-squad | REAL |
| trigger-python-engine | REAL |

## 2. Tabelas Tipadas Detectadas (types.ts — amostra)

| Tabela | Tem org_id | Status |
|--------|-----------|--------|
| public_sites | ✅ | REAL |
| builder_projects | ✅ | REAL |
| builder_versions | ✅ | REAL |
| airline_checkin_registry | ❌ | REAL (global) |
| activities | ❌ | REAL |
| admin_pins | ❌ | REAL |
| ai_agents | ✅ | REAL |
| ai_decision_logs | ✅ | REAL |
| ai_keys_pool | ✅ | REAL |
| ai_knowledge_base | ✅ | REAL |
| ai_radar_news | ❌ | REAL |
| ai_tasks | ✅ | REAL |
| organizations | — | REAL |
| profiles | — | REAL |

## 3. Casts Perigosos (`as any`)

- **Total de linhas com `as any`**: 464
- **Críticos (supabase as any)**: 
  - `src/pages/PublicTravelerInfo.tsx:6` — `const travelerInfoDb = supabase as any;`
  - `src/pages/admin/AdminDashboard.tsx:50` — `.from('ai_tasks' as any)`
  - `src/pages/admin/AdminDashboard.tsx:88` — `.from('global_keys' as any)`
  - `src/pages/admin/AdminDashboard.tsx:101` — `.from('ai_decision_logs' as any)`
  - `src/pages/admin/AdminDashboard.tsx:148/166` — `.from('global_keys' as any)`

## 4. Mocks/Fakes Detectados

- `Math.random()` — encontrado em componentes (a verificar se em produção)
- `setTimeout` — encontrado em vários hooks (a verificar se mock ou UX)
- `localStorage` — encontrado (a verificar se mock ou feature real)
- `TODO/FIXME` — múltiplos (a catalogar)

## 5. Gaps Críticos Identificados

| Gap | Impacto | Ação |
|-----|---------|------|
| `builder_sites` não existe nos types | Builder usa `builder_projects` em vez disso | Documentar e alinhar |
| `builder_pages` não existe nos types | PRD cita, mas código usa `builder_versions` | Documentar e alinhar |
| `agent_commission_rules` ausente | Módulo financeiro incompleto | Migration PR-07 |
| `agent_commission_entries` ausente | Módulo financeiro incompleto | Migration PR-07 |
| `agent_commission_periods` ausente | Módulo financeiro incompleto | Migration PR-07 |
| `automation_jobs` — verificar | Automações podem ser FAKE | Verificar PR-09 |
| Timestamp duplicado em migrations | Conflito de deploy | Corrigir |

## 6. Classificação Preliminar de Módulos

| Módulo | Status | Motivo |
|--------|--------|--------|
| Auth / Login | REAL | authStore.ts + Supabase Auth |
| CRM / Clients | REAL | useClients hook + tabela clients |
| Quotations | REAL | useQuotations + tabela quotations |
| Proposals | REAL | useProposals + tabela proposals |
| Contracts | PARCIAL | tabela existe, cofre imutável verificar |
| Vouchers | PARCIAL | useVouchers existe, campos a verificar |
| Builder/CMS | PARCIAL | builder_projects real, mas schema diverge do PRD |
| Commissions | FAKE | Tabelas não existem nos types gerados |
| Automations | PARCIAL | process-automations EF existe, tabelas verificar |
| RAG / IA Pública | PARCIAL | ai_knowledge_base existe, public-ai-chat EF existe |
| Admin Master | PARCIAL | rotas existem, separação incompleta |
| Group Trips | REAL | tabela + hooks + UI completos |
| Portal Viajante | REAL | boarding-get-portal-data EF + UI |
| Blog / CMS | PARCIAL | tabelas news_articles, UI existe |
| Financeiro | PARCIAL | pagamentos parcial, comissões FAKE |
| Design System | DESATUALIZADO | mix de tokens + classes inline |
