# Matriz de Refatoração Visual (PRs)

Esta é a trilha de pull requests para higienizar, solidificar e refinar a plataforma, aplicando o verdadeiro OMEGA v6.5 (Shadowless & Pixel Perfect).

- **PR-01: AppShell + Sidebar**
  Ajustar larguras precisas, centralizar ícones do Sidebar Rail, padronizar `AppLayout.tsx` com bounds corretos e header previsível (sem vazar).
- **PR-02: Tokens + UI Kit**
  Passar o pente fino no Shadcn UI: Button, Input, Card, e Table. Extirpar `shadow-lg` indiscriminado, uniformizar `bg-vj-green` vs blue tailwind.
- **PR-03: Dashboard e CRM**
  Limpar `Clients.tsx`, `Quotations.tsx`, `KanbanBoard.tsx`. Refinar modais densos para que encaixem corretamente sem scrolls fantasmas.
- **PR-04: Admin Separation Visual**
  Diferenciar o Master Admin (`GlobalRadarMap`, `Analytics`) da rotina do Agente, possivelmente pelo PageHeader ou subtle background differences, não misturando contextos de SaaS e operação B2C.
- **PR-05: Builder Layout**
  Melhorar o `SiteBuilderPage.tsx` para garantir que o sidebar de blocos não comprima o canvas de forma grosseira em telas curtas.
- **PR-06: Páginas Públicas (Vouchers e Itinerários)**
  Aplicar OMEGA Shadowless nos `PublicItinerary.tsx` e `PublicSiteView.tsx`, mantendo grids consistentes e focados no mobile first premium.
- **PR-07: Portal do Cliente (TravelerPortal)**
  Refatorar `TravelerPortal.tsx` para parecer um App Nativo luxuoso e coeso, fechando a ponta final da UX.
