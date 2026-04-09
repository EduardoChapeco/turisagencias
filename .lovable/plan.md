

# VoyageOS — Plano Completo de Implementação

Plataforma SaaS de gestão para agências de viagens, baseada no PRD v1.0. Usando **Lovable Cloud** (Supabase gerenciado). O plano é dividido em **8 fases incrementais**, cada uma construindo sobre a anterior sem duplicidade ou conflito.

---

## Fase 1: Fundação (Design System + Auth + Multi-Tenancy)

**Objetivo:** Estabelecer a base visual, autenticação e isolamento de dados.

- **Design System:** Configurar tokens de cor do PRD (#1E3A5F primary, #2E86AB accent, etc.), fontes Sora + Inter via Google Fonts, variáveis CSS HSL para white-label futuro
- **Estrutura de pastas:** `/pages`, `/components/features`, `/hooks`, `/stores`, `/types`, `/lib`
- **Banco de dados — Tabelas base:** `organizations`, `profiles` (vinculada a auth.users), `user_roles` (tabela separada para roles: super_admin, org_admin, agent, support, client)
- **RLS:** Função `get_my_org_id()`, políticas de isolamento por org_id em todas as tabelas
- **Trigger:** `trg_new_user_profile` (cria profile após signup), `update_updated_at_column()` em todas as tabelas
- **Auth:** Login com Supabase Auth (email + Google OAuth), AuthProvider com `onAuthStateChange`, ProtectedRoute, RoleGuard
- **Onboarding:** Página `/onboarding` para setup inicial da agência (nome, logo, cor primária, WhatsApp)
- **Layout principal:** Sidebar com navegação (ícones + labels), header com busca global (Cmd+K), avatar do agente, sino de notificações
- **Zustand stores:** authStore (user, profile, org), notificationStore

---

## Fase 2: CRM — Clientes e Viajantes

**Objetivo:** CRUD completo de clientes e viajantes com formulário público.

- **Tabelas:** `clients`, `travelers`, `traveler_documents`, `travel_groups`, `travel_group_members`
- **RLS:** Isolamento por org_id em todas
- **Páginas:**
  - `/clients` — Lista com busca, filtros (tags, origem), paginação cursor-based
  - `/clients/new` e `/clients/:id/edit` — Formulário multi-step (dados pessoais → endereço → preferências → viajantes) com react-hook-form + zod
  - `/clients/:id` — Perfil completo com tabs: dados, viajantes vinculados, viagens, cotações, timeline
  - `/clients/:id/travelers/new` e `/clients/:id/travelers/:tid` — Ficha do viajante com upload de documentos (passaporte, RG, vacinas)
- **Formulário público do viajante:** Rota `/f/:token` — formulário sem auth via `form_token`, trigger `trg_form_completed` notifica agente
- **Componentes:** ClientCard, skeleton loaders, empty states com CTA
- **Upload:** react-dropzone para documentos, Supabase Storage buckets `client-photos` e `traveler-documents`
- **Hooks:** `useClients()`, `useTravelers()`, `useTravelerDocuments()` com React Query

---

## Fase 3: Cotações + Extração IA

**Objetivo:** Fluxo de criação de cotações com IA e página pública.

- **Tabelas:** `quotations`, `ai_keys_pool`
- **Páginas:**
  - `/quotations` — Lista com filtros (status, agente, destino), paginação
  - `/quotations/new` — Componente AIQuotationUploader: upload print/PDF → Storage bucket `quotation-sources` → Edge Function `extract-quotation` → popula formulário
  - `/quotations/:id` — Detalhes com texto WhatsApp formatado, botão "Copiar", link da página pública
- **Edge Functions:**
  - `ai-orchestra` — Orquestrador de chaves IA com fallback automático entre providers (Groq, Gemini, OpenRouter)
  - `extract-quotation` — OCR + IA para extrair dados estruturados, calcular parcelas (12x cartão, 10x boleto, 15x set+), gerar texto WhatsApp
- **Página pública:** Rota `/q/:token` — PublicQuotationPage mobile-first com logo da agência, fotos do hotel, card de valores, CTA "Quero reservar" (abre wa.me/), tracking de `viewed_at`
- **Triggers:** `trg_quotation_viewed` (notifica agente), `trg_installment_calc` (auto-calcula parcelas)
- **Settings:** `/settings/ai-keys` — Gestão do pool de chaves IA (provider, label, limites diário/mensal)
- **Hooks:** `useQuotations()`, `useAIKeys()`

---

## Fase 4: Viagens — Workspace Central

**Objetivo:** Workspace completo de cada viagem com todas as tabs.

- **Tabelas:** `trips`, `trip_flights`, `trip_travelers`, `trip_documents`
- **Páginas:**
  - `/trips` — Lista de viagens com filtros (status, destino, agente, datas), paginação
  - `/trips/new` — Criação vinculando cliente, grupo de viajantes, destino, datas
  - `/trips/:id` — Workspace com tabs:
    - **Resumo:** header com foto destino, status badge, datas, hotel, regime, valor, câmbio
    - **Voos:** Lista de segmentos aéreos (FlightSegment component), CRUD de voos, status de check-in, upload boarding pass
    - **Viajantes:** Lista dos viajantes da viagem com ticket number, assento, link form público
    - **Documentos:** Upload e gestão de vouchers, boletos, contratos, e-tickets com toggle visibilidade cliente (DocumentTile component)
    - **Tickets:** (implementado na Fase 6)
    - **Checklist:** (implementado na Fase 6)
- **Triggers:** `trg_trip_status_notification`, `trg_flight_change_alert`, `trg_num_nights_calc`, `trg_document_uploaded`
- **Edge Function:** `process-pdf-voucher` — Extrai dados de voucher PDF e preenche trip automaticamente
- **Componentes:** TripCard, TripStatusBadge, FlightSegment, DocumentTile
- **Storage buckets:** `trip-documents`, `boarding-passes`
- **Hooks:** `useTrips()`, `useTripFlights()`, `useTripDocuments()`

---

## Fase 5: Kanban Boards

**Objetivo:** Substituir o Trello com boards de vendas e embarques.

- **Tabelas:** `kanban_boards`, `kanban_columns`, `kanban_cards`
- **Páginas:**
  - `/kanban/sales` — Board de vendas com colunas default (Cotação a Fazer → Enviado → Em Andamento → Aguardando Retorno → Confirmado → Perdido), drag-and-drop, cards vinculados a cliente + cotação
  - `/kanban/departures` — Board de embarques por mês, cards = viagens a embarcar com ID operadora, localizador, data/hora, status check-in
  - `/settings/kanban` — Configuração de colunas (nome, cor, ordem, WIP limit)
- **Componentes:** KanbanCard (prioridade colorida, label destino, avatar cliente), drag-and-drop nativo
- **pg_cron:** `kanban_overdue_check` — flag cards com due_date vencida (segunda-feira 9h)
- **Hooks:** `useKanbanBoards()`, `useKanbanCards()`

---

## Fase 6: Suporte, Checklists e Banco de Hotéis

**Objetivo:** Tickets de suporte com thread, checklists compartilháveis e banco de hotéis curado.

- **Tabelas:** `tickets`, `ticket_messages`, `checklists`, `checklist_items`, `hotels_bank`
- **Tickets:**
  - `/tickets` — Lista com filtros (status, prioridade, tipo, agente)
  - `/tickets/:id` — Thread de mensagens (agente/cliente/IA), notas internas, anexos, resolução
  - Integração na tab Tickets do workspace da viagem
  - Trigger `trg_ticket_message_notification`
- **Checklists:**
  - Templates reutilizáveis e instâncias por viagem
  - Rota pública `/c/:token` — Cliente marca items via `share_token`
  - Integração na tab Checklist do workspace da viagem
  - `/settings/templates` — Templates de checklist
- **Banco de Hotéis:**
  - `/hotels` — Grid visual com foto de capa, nome, cidade, estrelas, rating
  - `/hotels/new` e `/hotels/:id` — Formulário com upload múltiplo de fotos, mapa Mapbox com pin
  - Filtros por cidade, país, regime, tags
  - Storage bucket `hotel-photos`
  - Vinculação automática com cotações quando IA identifica hotel pelo nome
- **Hooks:** `useTickets()`, `useChecklists()`, `useHotels()`

---

## Fase 7: Notificações, Portal do Cliente e Dashboard

**Objetivo:** Sistema completo de notificações, portal white-label do cliente e dashboard analítico.

- **Tabelas:** `notifications`
- **Notificações:**
  - NotificationPanel com agrupamento por tipo, badge de não-lidas, mark as read
  - Supabase Realtime subscription para notificações in-app
  - Edge Function `notify-dispatcher` — dispatcher central (in_app, email via Resend)
  - Edge Function `send-email` — Templates: cotação, confirmação, documento pronto, boas-vindas
- **Portal do Cliente (white-label):**
  - `/portal/:org_slug` — Login via magic link (Edge Function `client-portal-auth`)
  - `/portal/:org_slug/home` — Carteira de viagens, próxima viagem em destaque com countdown
  - `/portal/:org_slug/trip/:id` — Workspace visão cliente: resumo, voos, documentos (signed URLs), checklist, guia destino, abertura de ticket
  - `/portal/:org_slug/tickets` e `/portal/:org_slug/documents`
  - Design com cores da organização (`primary_color`)
- **Dashboard:**
  - `/dashboard` — BentoGrid responsivo 4x4: viagens ativas, cotações pendentes, check-ins próximos, tickets abertos, embarques próximos 7 dias, feed de atividade realtime
- **pg_cron jobs:** `trip_upcoming_alerts` (30/15/7/1 dia), `checkin_reminders` (24h antes), `document_expiry_check` (passaportes/vistos vencendo), `quotation_expiry` (expirar cotações >30 dias), `reset_ai_daily/monthly`
- **Settings:** `/settings` (org), `/settings/agents` (gestão de agentes), `/settings/integrations`

---

## Fase 8: IA Avançada, Guias de Destino e Base de Conhecimento

**Objetivo:** Chat IA interno/cliente, squad de agentes especializados, guias de destino e knowledge base.

- **Tabelas:** `ai_knowledge_base`, `destination_guides`
- **Base de Conhecimento:**
  - `/knowledge-base` — Upload de documentos (regras de cias, vistos, políticas), chunks com embeddings pgvector
- **Chat IA Interno:**
  - `/ai-chat` e AIAssistantDrawer (drawer flutuante disponível em qualquer tela)
  - Edge Function `ai-chat-agent` — RAG com knowledge base, contexto do trip/cliente aberto
  - Squad de agentes especializados: AéreoAgent, VistoAgent, HotelAgent, DocumentoAgent, SuporteAgent, OrchestratorAgent
- **Chat IA no Portal Cliente:**
  - FAQs automáticas, busca info da viagem do cliente, escalação para agente humano
- **Guias de Destino:**
  - Edge Function `generate-destination-guide` — IA gera guia com Mapbox, dicas, contatos, clima, moeda
  - Envio automático 30 dias antes da viagem
  - Visualização no portal do cliente com mapa interativo
- **Edge Functions restantes:**
  - `generate-quotation-page` — HTML estático da cotação com fotos do hotel
  - `flight-alert-webhook` — Webhook para alterações de voo (email encaminhado)
  - `send-whatsapp-webhook` — Payload para integração futura WhatsApp API
  - `form-traveler-public` e `checklist-share` — Endpoints públicos

---

## Padrões Transversais (aplicados em todas as fases)

- **React Query** para todas as chamadas Supabase com staleTime configurado (clientes 5min, viagens 2min, notificações 30s)
- **react-hook-form + zod** em todos os formulários com validação inline em português
- **Skeleton loaders** em todas as listas e cards
- **Empty states** com ilustração e CTA
- **Toast notifications** (success/error/info, auto-dismiss 4s)
- **Confirmação para ações destrutivas** com modal "Digite [nome] para confirmar"
- **Lazy loading** de rotas com React.lazy() + Suspense
- **Paginação cursor-based** em todas as listas
- **TypeScript estrito** com types gerados do Supabase
- **Busca global (Cmd+K)** — clientes, viagens, cotações, hotéis

