---
version: "6.5"
name: "Turis Agências OMEGA v6.5"
description: >
  Design system da plataforma SaaS de gestão de viagens Turis Agências.
  Arquitetura visual: Shadowless, Premium, Minimalista, Neutra e Altamente Produtiva.
---

## 1. Princípios Visuais
- **Shadowless (Sem Sombras)**: Profundidade é demarcada exclusivamente por bordas finas (`1px` border) e contrastes entre branco e fundos pastéis claros.
- **Hierarquia Clara**: Espaços em branco (whitespace) são tratados como elementos ativos do design.
- **Calma Cognitiva**: Interfaces de CRM são propensas ao excesso de informação. Minimize o uso de acentos coloridos, usando cores vibrantes estritamente para ações decisivas (ex: Conversão, Faturamento).

## 2. Tokens
- As cores da aplicação devem derivar do sistema de tokens estabelecido (ex: `vj-txt`, `vj-bg`, `vj-border`, `vj-green`). É TERMINANTEMENTE PROIBIDO hardcodar cores arbitrárias como `text-[#1e1e1e]` ou usar escalas Tailwind aleatórias sem motivo.

## 3. Sidebar (AppSidebar)
- A barra lateral primária (quando colapsada) opera em modo `rail`, com exatos 56px a 64px.
- Ícones de navegação devem medir de 18px a 20px, estritamente centralizados.
- Não usar `shadow-xl` ou sombras laterais para demarcar a sidebar, use um `border-r border-zinc-200` simples e limpo.

## 4. Topbar (AppLayout Header)
- O Header é estático/fixado, de altura previsível (`h-[60px]`).
- A topbar NÃO DEVE cobrir ou invadir o main view. O z-index deve ser `z-40` ou `z-50`, alinhado à estratégia de popovers.

## 5. App Shell
- A estrutura global (`main`) deve ocupar a altura exata da tela quando for um dashboard rígido (`h-screen overflow-hidden`), repassando o scroll para as colunas filhas (ex: Kanban).
- Em páginas fluidas (ex: Settings, Analytics), o `main` deve scrollar naturalmente e esconder barras laterais horizontais (`overflow-x-hidden`).

## 6. Page Layout (Grids)
- Dashboards com múltiplos cards devem adotar o modelo Bento Grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`).
- Toda página principal deve iniciar com o componente padronizado `PageHeader`.

## 7. Cards
- Não utilize drop-shadow ou box-shadow. Cards usam fundo branco, raio generoso (`rounded-xl` ou `rounded-2xl`) e borda leve `border border-zinc-200`.

## 8. Forms
- Inputs têm altura padrão (ex: `h-9` ou `h-10`).
- Usar labels discretas (`text-[10px] uppercase font-bold text-vj-txt3`).
- Sem placeholders cartunizados.

## 9. Tables
- Alta densidade de informação pede linhas limpas. Bordas inferiores (`border-b border-vj-border`) com hover state muito suave (`hover:bg-vj-surface-hover`).
- Proibir scroll horizontal na página inteira, tabelas largas devem ter um container próprio com `overflow-x-auto`.

## 10. Kanban
- Deve forçar 100% de altura útil subtraindo o header (`h-[calc(100vh-60px)]`). Scroll ocorre verticalmente dentro de cada raia (board list), nunca horizontalmente na página primária.

## 11. Builder
- O Painel lateral de ferramentas não deve espremer grosseiramente a preview do site. O iframe do SitePreview deve manter aspect ratios lógicos (mobile vs desktop).

## 12. Public Pages
- Padrões B2C. Mobile-first rigoroso. Altamente dinâmicas, sem uso de sombras datadas (Shadowless total), botões arredondados premium.

## 13. Admin Global
- Deve se distinguir sutilmente da visão da Agência. Tons levemente mais frios e austeros ou um selo "Master" permanente.

## 14. Admin Agência
- Gestão e Setup (Settings, Team, Customization). Forms fluidos e limpos.

## 15. Agent Workspace
- Operacional (Quotations, Trips). Maximização de tela, painéis compactos, abas (Tabs) rápidas.

## 16. Mobile
- Gavetas (Drawers/Sheets) saindo da base ou da lateral substituem sidebars fixas e modais centrais flutuantes.

## 17. Acessibilidade
- Contraste legível.
- Tooltips devem explicar botões icon-only.

## 18. Do / Don't
- DO: Use Flexbox e Gap.
- DON'T: Não use Margins aleatórias para alinhar elementos (ex: `ml-[23px]`).
- DO: Botões de submeter têm estado de loading (Loader2 spinner).
- DON'T: Ocultar feedbacks de sucesso/erro (sempre use toasts ou alertas fixos).

## 19. Checklist de PR Visual
- [ ] Z-index validado (modais sobrepõem topbars?)
- [ ] Sidebar testada em tela menor (1024px)?
- [ ] Responsividade Mobile aprovada?
- [ ] Respeita o paradigma Shadowless?
- [ ] Erradicação de Hardcodes (textos ou cores em formato HEX perdidos no TSX)?
