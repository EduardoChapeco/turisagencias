# Auditoria de Rotas Reais

As rotas extraídas do `App.tsx` indicam um projeto robusto, mas com necessidade de organização no `routeRegistry` (PR-01).

## Auth & Públicas
- `/login`, `/admin/login`, `/signup`, `/onboarding`
- `/pricing`, `/auth/chrome-extension`
- `/f/:token` (Form), `/q/:token` (Quotation), `/p/:token` (Proposal), `/c/:token` (Checklist)
- `/g/:slug` (Group Trip Pública), `/voucher/:token`
- `/site/:slug` (Public Site View), `/noticias/:slug`

## App (Private / Agent / Support / Admin)
- `/` (Dashboard Index)
- `/radar`, `/radar-global`
- `/clients`, `/quotations`, `/proposals`, `/itineraries`, `/contracts`, `/vouchers`
- Kanban: `/kanban/sales`, `/kanban/departures`, `/kanban/tasks`
- `/ai-chat`, `/settings`, `/site-builder`, `/app/group-trips`

## Admin Master & Admin Agency
- `/app/finance/payments`, `/app/finance/suppliers`, `/app/finance/transactions`, `/app/finance/commissions`
- `/admin/dashboard`, `/admin/agencies/:id`, `/admin/commissions`
- `/admin/support`, `/admin/blog`

**Status**: Rotas são reais, mas usam componentes "inline" `<RoleGuard>` e `<ProtectedRoute>`. A FASE 1 vai extrair isso para o `routeRegistry.ts` canônico.
