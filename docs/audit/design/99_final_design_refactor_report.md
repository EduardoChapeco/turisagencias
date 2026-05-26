# Relatório Final — Auditoria e Refactor de Design System (OMEGA v6.5)

Este relatório final apresenta os resultados da auditoria de design realizada no Turis Agências e define o roadmap de refatoração para garantir a conformidade com as diretrizes do OMEGA v6.5.

---

## 1. Veredito Executivo

*   **Status Geral:** ⚠️ Necessita de Padronização.
*   **Maior Inconsistência:** O uso de sombras legadas (`shadow-sm`, `shadow-md`, etc.) e cores hardcoded em botões e cards de status que desviam da política *shadowless* do OMEGA v6.5.
*   **Maior Causa de Botões Diferentes:** A presença de tags nativas `<button>` estilizadas com classes Tailwind ad-hoc em vez de utilizarem o componente `Button` padrão.
*   **Maior Causa de Grids Diferentes:** Grids customizados criados individualmente em telas como a listagem de cotações e onboarding, resultando em desalinhamentos visuais.
*   **Maior Risco Visual:** Telas do Visual Builder e páginas públicas apresentando paletas de cores legadas (verde) para ações primárias, em vez de adotarem o **Azul Royal** (`#2563EB`).
*   **Primeiro PR Recomendado:** **PR-02 — Conexão de Tokens e Themes**. Consolidar e simplificar as variáveis CSS em `index.css` e mapeá-las corretamente no `tailwind.config.ts`.

---

## 2. Rotas Auditadas

Foram auditadas todas as 40+ rotas do aplicativo (agente, admin e portal público). A matriz de consistência completa foi documentada em [01_routes_pages_visual_matrix.md](file:///c:/Users/Usuario/Documents/turisagencias/docs/audit/design/01_routes_pages_visual_matrix.md).

---

## 3. Design System Encontrado

O inventário de tokens e componentes de interface foi registrado em [00_design_system_inventory.md](file:///c:/Users/Usuario/Documents/turisagencias/docs/audit/design/00_design_system_inventory.md). Embora a base do OMEGA v6.5 esteja declarada em `index.css`, há muitos desvios locais espalhados pelo código.

---

## 4. Próximos Passos & Roadmap de PRs

Para executar as correções de forma segura e incremental, adotaremos o seguinte roadmap de desenvolvimento:

1.  **PR-02 (Conexão de Tokens & Themes):** Centralizar as definições de variáveis CSS em `index.css` e unificar a paleta cromática de Azul Royal.
2.  **PR-03 (Refatoração de Componentes Base):** Atualizar os componentes de UI (`Button`, `Input`, `Card`, `Sheet`, `Dialog`) para seguir estritamente as regras de design flat e sem sombras do OMEGA.
3.  **PR-04 (Consolidação do Shell do App):** Padronizar as barras de navegação lateral e menus de perfil no `AppLayout` e `AppSidebar`.
4.  **PR-05 (Substituição de Inputs e Botões Nativos):** Mapear e substituir todas as tags `<button>` e `<input>` cruas por suas contrapartes do kit de UI.
5.  **PR-06 (Padronização de Sombras & Cards):** Remover todas as classes de sombra de cards e seções estáticas da aplicação.
