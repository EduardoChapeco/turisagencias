# Auditoria Página a Página

## 1. CRM e Painel
### Clients.tsx
- Rota: `/clients`
- Módulo: CRM
- Perfil: Agente / Admin
- Layout usado: `AppLayout` (Fluid)
- Shell: Dashboard standard com `PageHeader`
- Sidebar/topbar: `AppSidebar` e HeaderBar interno ao AppLayout.
- Grid principal: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` e listas (Bento grid premium)
- Modais/sheets: `ClientEditSheet`, `ClientQuickView`, `FichaClienteMaster` (Sheet full-screen)
- Responsividade: Quebra em telas pequenas, sheets abrem em 100% width.
- Sombras: Alguns cards de hover no CRM usam sombras sutis, necessita adequação ao OMEGA Shadowless.
- Problema de z-index: `FichaClienteMaster` no `ClientQuickView` pode sobrepor elementos incorretos se abertos simultaneamente.
- Dados: Reais da API.
- Status: Necessita limpeza de hover shadows para fit no OMEGA v4.

### KanbanBoard.tsx
- Rota: `/board`
- Módulo: CRM
- Perfil: Agente / Admin
- Layout usado: `AppLayout` (Full height, no scroll body)
- Sidebar/topbar: Mantém padrão.
- Problema de overflow: Kanban lists às vezes vazam horizontalmente ou forçam scroll no `main` em vez de na própria lista. A barra lateral não colapsa 100% amigável.
- Status: Necessita refatoração de grid (`h-[calc(100vh-60px)]`) e remoção de bordas espessas.

## 2. Configurações e Admin
### Settings.tsx
- Rota: `/settings`
- Layout usado: `AppLayout`
- Status: Ok, usa formulários padrão e Tabs. Falta coesão no espaçamento dos botões de 'Save' (alguns colam no rodapé).

### Analytics.tsx
- Rota: `/analytics`
- Status: Funcional, Recharts injetado (B2C Funnel). Problema potencial de overflow horizontal no mobile para o gráfico de barras.

## 3. Builder
### SiteBuilderPage.tsx
- Rota: `/builder/:siteId`
- Status: Painel complexo. Sidebar esquerda fixa, Header próprio. 
- Problema UX: Em telas de 13 polegadas, a sidebar do builder comprime demais o renderizador central. O componente `PublicSiteView` dentro do iframe/preview pode herdar scroll bars duplicadas.

## 4. Páginas Públicas
### PublicSiteView.tsx / PublicQuotation.tsx
- Rota: `/:slug`, `/quotation/:id`
- Status: Totalmente fluido.
- Z-index: Widget B2C Chat usa `z-50`, Botão de whatsapp em `PublicQuotation` também pode brigar por z-index.
- Dados: Dinâmicos lidos via RLS público.
