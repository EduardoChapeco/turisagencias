# Inventário Página por Página e Contratos

Este documento mapeia as principais rotas da aplicação, seus objetivos, integrações reais (Tabelas, Edge Functions, Hooks) e o status atual.

---

## 1. Login & Autenticação
**Página:** `src/pages/Login.tsx`, `src/pages/Signup.tsx`
**Rota:** `/login`, `/signup`
**Quem acessa:** Agentes e Diretores.
**Módulo:** Auth
**Objetivo real:** Autenticar usuários via email/senha ou magic link.
**Componentes principais:** Formulário de Login, Input OTP, Toasts.
**Inputs:** Email, Password.
**Hooks/Services:** `useAuthStore`, `supabase.auth.signInWithPassword`.
**Tabelas:** Nenhuma diretamente no frontend (usa GoTrue do Supabase).
**Problemas:** O magic link usa o padrão do Supabase; é necessário auditar o TTL do token para garantir segurança.
**Status:** REAL.
**Ação recomendada:** Manter. Validar se há vazamento de dados de org na sessão.

---

## 2. Admin Login
**Página:** `src/pages/AdminLogin.tsx`
**Rota:** `/admin/login`
**Quem acessa:** Super Admin (Dono da Plataforma).
**Módulo:** Admin Global
**Objetivo real:** Acesso ao master da plataforma.
**Tabelas:** Pode checar `profiles.role` ou tabelas dedicadas.
**Problemas:** Risco de bypass se a rota não tiver RLS severo no backend (não basta esconder no frontend).
**Status:** PARCIAL (Carece de checagem server-side de role `super_admin`).
**Ação recomendada:** Refatorar a verificação de segurança, exigindo MFA ou PIN de hardware.

---

## 3. CRM / Kanban
**Página:** `src/pages/KanbanBoard.tsx`, `src/pages/KanbanCardPage.tsx`
**Rota:** `/crm`, `/crm/card/:id`
**Quem acessa:** Agentes e Admin Agência.
**Módulo:** Vendas / CRM
**Objetivo real:** Gestão de Leads e conversões.
**Hooks/Services:** `useKanban`, `updateCardPosition`.
**Tabelas:** `kanban_cards`, `kanban_columns`.
**Problemas:** Necessário auditar se todos os agentes podem ver todos os cards ou apenas os próprios (falha de RLS).
**Status:** REAL.
**Ação recomendada:** Revisão de RLS em `kanban_cards` para isolar visibilidade por `agent_id`.

---

## 4. Cotações e Motor Python
**Página:** `src/pages/Quotations.tsx`
**Rota:** `/finance/quotations`
**Módulo:** Financeiro / Cotações
**Objetivo real:** Solicitar cotações ao Motor IA (Python FastAPI).
**Hooks/Services:** `useQuotations`, `trigger-python-engine` (Edge Function).
**Tabelas:** `quotations`, `quotation_versions`.
**Problemas:** Se a Edge Function falhar, a UI pode não reidratar corretamente o erro.
**Status:** REAL.
**Ação recomendada:** Validar tratativas de erro e fallbacks na interface.

---

## 5. Site Builder (Visual CMS)
**Página:** `src/pages/SiteBuilderPage.tsx`, `src/components/builder/VisualBuilder.tsx`
**Rota:** `/builder/sites/:slug`
**Módulo:** CMS
**Objetivo real:** Criação de sites dinâmicos (landing pages, linkbio, blogs).
**Tabelas:** `builder_sites`, `builder_pages`, `builder_page_versions`.
**Problemas:** Funcionalidade core atualizada. Os blocos interativos agora são dinâmicos.
**Status:** REAL.
**Ação recomendada:** Auditar a higienização do JSON gravado contra XSS.

---

## 6. Página Pública da Agência
**Página:** `src/pages/PublicSiteView.tsx`
**Rota:** `/site/:slug`, domínio mapeado.
**Módulo:** Portal Público
**Objetivo real:** Renderizar o `content_json` gerado pelo VisualBuilder para clientes finais.
**Hooks/Services:** `supabase.from('builder_sites')`
**Problemas:** Recém-refatorado para consumir o `BlockRegistry`. Faltam testes de performance e LCP (Largest Contentful Paint).
**Status:** REAL.
**Ação recomendada:** Monitorar Analytics e implementar SSR/Edge Caching futuramente.

---

## 7. Portal do Viajante (Traveler Portal)
**Página:** `src/pages/TravelerPortal.tsx`
**Rota:** `/portal/traveler/:token`
**Módulo:** Portal Cliente
**Objetivo real:** Exibição de vouchers, pagamentos e chat direto com a agência.
**Problemas:** O token de acesso precisa ter tempo de vida (TTL) configurado.
**Status:** REAL.
**Ação recomendada:** Auditar RLS para garantir que a leitura pública (`anon`) seja estritamente controlada pelo token criptográfico, impedindo force-browsing.
