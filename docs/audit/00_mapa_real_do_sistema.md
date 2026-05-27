# Mapa Real do Sistema (Turis Agências)

## 1. Visão geral real do repo
O projeto "Turis Agências" é um sistema SaaS monorrepo para gestão de agências de turismo, possuindo um portal de vendas público, um CRM interno (Kanban) e um CMS próprio (Visual Builder). O repositório contém frontend em React, integrações com Supabase (Banco e Auth), e Edge Functions para tarefas assíncronas.

## 2. Stack real
- **Frontend:** React 18, Vite, Tailwind CSS, Shadcn UI, Radix UI, Zustand, React Router, React Query.
- **Backend/DB:** Supabase (Postgres), Deno (Edge Functions).
- **Testes:** Vitest, Playwright.

## 3. Pastas principais
- `src/pages`: Contém mais de 58 páginas, variando de admin a portais públicos.
- `src/components`: UI components genéricos e módulos complexos (`builder`, `crm`).
- `src/hooks`, `src/services`: Lógica de negócio e chamadas ao DB.
- `supabase/functions`: 29 Edge Functions (ex: webhook, integrações, geração de links).
- `supabase/migrations`: 119 arquivos SQL.

## 4. Rotas existentes
Mapeadas a partir dos arquivos e do App.tsx:
- `/` (Landing Page)
- `/login`, `/admin/login`, `/signup`
- `/dashboard` (AiDashboard)
- `/crm` (KanbanBoard), `/crm/card/:id`
- `/clients`, `/group-trips`, `/hotels`, `/destinations`, `/guides`
- `/finance/quotations`, `/finance/proposals`, `/finance/vouchers`, `/finance/tickets`
- `/builder/sites/:slug`, `/builder/blog`
- `/portal/traveler/:token`, `/public/group/:slug`

## 5. Páginas existentes
- Admin e CRM: `KanbanBoard.tsx`, `AiDashboard.tsx`, `Clients.tsx`, `TravelerInfo.tsx`
- Financeiro e Documentos: `Quotations.tsx`, `Proposals.tsx`, `Vouchers.tsx`, `ContractRecords.tsx`
- Público e Portais: `PublicSiteView.tsx`, `TravelerPortal.tsx`, `PublicBookingVoucher.tsx`, `PublicProposal.tsx`
- Edição de Conteúdo: `SiteBuilderPage.tsx`, `ProposalEditor.tsx`, `NewsCMS.tsx`

## 6. Módulos existentes
- **Kanban CRM:** Pipelines de vendas.
- **Visual Builder CMS:** Criação de sites, linkbios e páginas institucionais com blocos dinâmicos e persistência JSON no banco.
- **Proposals & Quotations:** Geração de orçamentos e propostas integradas ao Motor Python.
- **Group Trips & Boarding:** Gerenciamento de embarque e viagens em grupo.

## 7. Tabelas/migrations existentes
Existem 119 migrations. Tabelas cruciais identificadas:
`builder_sites`, `builder_pages`, `builder_page_versions`, `kanban_cards`, `proposals`, `quotations`, `group_trips`, `traveler_info`, `organizations`, `profiles`.

## 8. Edge Functions existentes
29 subpastas em `supabase/functions`, destacando-se:
- `process-automations`, `send-quotation`, `trigger-python-engine`
- `admin-auth`, `invite-agent`
- `builder-publish-page`, `builder-submit-form`
- `sign-group-booking-contract`, `boarding-create-client-portal-link`

## 9. Hooks/services/stores existentes
- **Zustand Stores:** `useAuthStore` (Auth), `useBuilderStore` (Site Builder).
- **Hooks React Query:** `useProposals`, `useQuotations`, `useKanban`, `useGroupTrips`.
- **Hooks Personalizados:** `useSubmitForm` (motor de ingestão de leads/NPS).

## 10. Arquivos suspeitos
- Arquivos de mockup soltos ou imagens de dashboard hardcoded na `LandingPage.tsx` e `PortalAiPhotos.tsx`.
- Existência de 119 migrations indica possível fragmentação e débitos de schema acumulados.
- Testes como `auth.test.tsx` possuem mocks pesados do supabase.

## 11. Mocks/hardcodes encontrados
Uma busca profunda detectou mocks de design/imagens principalmente na `LandingPage.tsx` (estrutural para SaaS marketing), mas o core (Builder e Kanban) não possui mocks falsos na lógica atual após refatoração recente. Contudo, relatórios e dashboards analíticos (`Analytics.tsx`) precisam ser auditados para garantir dados puramente reais.

## 12. Admin global e admin agência: onde estão misturados
A estrutura atual apresenta botões "globais" junto ao painel comum. A separação estrita usando a role `super_admin` e rotas ofuscadas precisa ser auditada. Há um `AdminLogin.tsx` separado, o que é um bom indício, mas o painel em si pode estar vazando componentes.

## 13. Design system: arquivos existentes e gaps
Utiliza Tailwind + Radix UI + shadcn. Falta de consistência entre blocos (ex: CMS e CRM têm aparências diferentes).
A criar: `docs/design-system/DESIGN.md` e regras de "Layout Shell".

## 14. Builder/CMS: arquivos existentes e gaps
- **Arquivos:** `SiteBuilderPage.tsx`, `VisualBuilder.tsx`, `PublicSiteView.tsx`, e dezenas de `blocks/`.
- **Gaps:** A renderização pública foi recentemente atualizada para usar o `BlockRegistry`, mas falta garantir que os formulários de contato fluam perfeitamente para as instâncias reais de CRM sem quebrar permissões.

## 15. Contratos/vouchers/propostas: arquivos e gaps
- **Arquivos:** `ProposalEditor.tsx`, `PublicProposal.tsx`, `PublicBookingVoucher.tsx`, `PublicQuotation.tsx`.
- **Gaps:** Precisa mapear exatamente se o `content_schema` gravado nas propostas reflete campos fixos exigidos por contratos jurídicos (ex: CPF, dados do contratante).
