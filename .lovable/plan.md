

# Auditoria Completa do Sistema VoyageOS

## Problemas Encontrados

### CRITICO 1: Types.ts desalinhado com o banco de dados real
O arquivo `src/integrations/supabase/types.ts` (auto-gerado) contém colunas que **não existem** no banco de dados real:

- **profiles**: types tem `bio`, `email`, `is_active`, `last_seen_at`, `notification_prefs`, `whatsapp` — DB real só tem: `id, user_id, org_id, first_name, last_name, avatar_url, phone, created_at, updated_at`
- **organizations**: types tem `email`, `phone`, `address`, `ai_keys_config`, `is_active` — DB real só tem: `id, name, slug, logo_url, primary_color, whatsapp, plan, settings, created_at, updated_at`
- **clients**: types tem `assigned_agent_id`, `photo_url`, `portal_access_enabled`, `portal_user_id`, `preferences` — DB real não tem essas colunas

**Impacto**: Qualquer query que selecione `*` funciona (retorna o que existe), mas qualquer INSERT/UPDATE que envie essas colunas fantasma vai quebrar com erro `PGRST204`.

### CRITICO 2: Tabelas faltando completamente no banco
As seguintes tabelas são referenciadas por hooks e páginas mas **não existem** no DB:

```text
trips            → useTrips.ts, Trips.tsx, TripNew.tsx, TripDetail.tsx
kanban_boards    → useKanbanBoards.ts, KanbanBoard.tsx
kanban_columns   → useKanbanBoards.ts
kanban_cards     → useKanbanCards.ts
hotels_bank      → useHotels.ts, Hotels.tsx, HotelNew.tsx, HotelDetail.tsx
tickets          → useTickets.ts, Tickets.tsx, TicketDetail.tsx
ticket_messages  → useTickets.ts
checklists       → useChecklists.ts, PublicChecklist.tsx
checklist_items  → useChecklists.ts
notifications    → useNotifications.ts, NotificationPanel.tsx
```

**Impacto**: Qualquer navegação para Viagens, Kanban, Hotéis, Tickets ou Checklists vai crashar. Sidebar tem links ativos para todas essas features quebradas.

### CRITICO 3: Onboarding envia colunas inexistentes
O Onboarding envia `email` e `phone` para `organizations` — colunas que não existem. O workaround `isMissingSchemaColumnError` tenta um fallback, mas esse padrão é frágil e depende da mensagem de erro.

### CRITICO 4: `ensure_default_kanban_boards` chamado sem tabelas
Onboarding chama `supabase.rpc('ensure_default_kanban_boards')` mas as tabelas `kanban_boards` e `kanban_columns` não existem — vai falhar silenciosamente.

### MODERADO 5: Trigger duplicado
Existem 2 triggers para `promote_first_user` em `auth.users`: `on_first_user_promote` e `trg_promote_first_user`. O super_admin será promovido 2x (sem dano pelo ON CONFLICT, mas é lixo).

### MODERADO 6: Build errors nos testes
Mocks de profile nos testes (`auth-store.test.ts`, `onboarding.test.tsx`) não incluem as colunas fantasma do types.ts (`bio`, `email`, `is_active`, etc.), causando erros TS2740.

### OK: Fluxos que funcionam corretamente
- Auth: Login, Signup, trigger `handle_new_user`, trigger `promote_first_user` — todos ativos e corretos
- RLS: Todas as 8 tabelas existentes têm RLS habilitado com policies para `authenticated`
- Clients CRUD: Hook, pages, form fields todos alinham com colunas reais da tabela
- Quotations CRUD: Hook, pages, form fields corretos; installments serialização OK
- Travelers: CRUD + form público via RPC `submit_traveler_form` — OK
- Public pages: `/q/:token` e `/f/:token` — funcionais
- Edge function `extract-quotation`: Corretamente usa LOVABLE_API_KEY, CORS OK

---

## Plano de Correção

### Passo 1: Adicionar colunas faltantes nas tabelas existentes
Migration SQL para alinhar o DB com o types.ts:

- **organizations**: ADD `email text`, `phone text`, `address jsonb`, `ai_keys_config jsonb`, `is_active boolean DEFAULT true`
- **profiles**: ADD `bio text`, `email text`, `is_active boolean DEFAULT true`, `last_seen_at timestamptz`, `notification_prefs jsonb DEFAULT '{}'`, `whatsapp text`
- **clients**: ADD `assigned_agent_id uuid`, `photo_url text`, `portal_access_enabled boolean DEFAULT false`, `portal_user_id uuid`, `preferences jsonb DEFAULT '{}'`

### Passo 2: Criar tabelas faltantes (Fases 4-7)
Migration para criar as 10 tabelas ausentes com RLS:

- `trips` (com `primary_client_id`, `departure_date`, `return_date`, `status`, etc.)
- `kanban_boards`, `kanban_columns`, `kanban_cards`
- `hotels_bank` (banco de hotéis)
- `tickets`, `ticket_messages`
- `checklists`, `checklist_items`
- `notifications`

Todas com `org_id`, RLS usando `get_my_org_id()`, e updated_at triggers.

### Passo 3: Remover trigger duplicado e fix Onboarding
- DROP trigger `trg_promote_first_user` (mantém `on_first_user_promote`)
- Remover workaround `isMissingSchemaColumnError` do Onboarding — enviar email/phone diretamente já que as colunas existirão
- Remover chamada `ensure_default_kanban_boards` se as tabelas kanban forem criadas com seed automático

### Passo 4: Corrigir testes
- Atualizar mocks de profile nos testes para incluir todas as colunas do schema real

### Passo 5: Validar sidebar e rotas
- Manter todos os links no sidebar (já estão registrados)
- Garantir que as pages placeholder mostrem estados vazios adequados em vez de crashar

---

## Detalhes Técnicos

### Migration 1: Colunas faltantes (~20 ALTER TABLE statements)
### Migration 2: Tabelas novas (~10 CREATE TABLE + ~40 RLS policies + ~10 triggers)
### Arquivos editados: Onboarding.tsx, auth-store.test.ts, onboarding.test.tsx

Estimativa: 2 migrations + 3 arquivos editados.

