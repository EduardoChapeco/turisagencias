# Inventário Visual e Matriz de Gaps — Turis Design System

Este documento inventaria as telas e componentes principais do ecossistema Turis Agências sob a ótica do Design System OMEGA v6.5 (política shadowless, consistência tipográfica Inter e paleta de cores Azul Royal).

---

## 1. Matriz de Componentes e Gaps de Design

| Tela / Página | Rota | Componentes | Tokens Usados | Hardcodes Identificados | Responsivo? | Dados Reais? | Problemas & Gaps | Ação corretiva |
|---|---|---|---|---|---|---|---|---|
| **Dashboard** | `/` | `MetricCard`, `AppSidebar`, `AppLayout`, Leaflet Map | Parcial (cores vj no CSS) | `(t as any)` no typings | ✅ Sim | ✅ Sim | Centavos no pipeline podem não estar perfeitamente formatados. | Ajustar formatação fina dos valores. |
| **GroupDashboard** | `/group-trips/:id` | `PricingCalculator`, `GroupBloqueiosTab`, `VoucherPipeline` | Parcial | Cores estáticas nas abas | ✅ Sim | ✅ Sim | A aba "Visão Geral" exibe um placeholder de "módulo em construção". | Substituir por componentes informativos reais do grupo na fase P5. |
| **Cotações** | `/quotations` | `QuotationBuilderSheet`, `QuotationDetailSheet` | Parcial (STATUS_STYLES bg-blue-50 etc) | Cores estáticas no status badge | ✅ Sim | ✅ Sim | Centavos do valor total eram truncados para `,00` na visualização de lista. | Corrigido para extrair centavos reais do Intl formatador de moeda. |
| **Portal do Viajante** | `/minha-viagem/:token` | `UploadProofDialog`, `CancelRequestDialog`, `BusSeatMap` | Parcial | `alert()` nativo para erros | ✅ Sim | ✅ Sim | Diálogos de alerta nativos e primitivos ao lançar exceções. | Corrigido para utilizar Toasts do Radix/shadcn. |
| **Portal Manager** | `/portal-manager` | Smartphone Simulator, `Switch` inputs | Parcial | Link gerado apontava para login geral em vez da viagem de teste | ✅ Sim | ✅ Sim | Dificuldade para copiar o link tokenizado direto de teste do passageiro. | Adicionado botão "Copiar Link" ao lado da reserva de teste ativa. |
| **News CMS** | `/news-cms` | Sheet curadoria, feeds editor | Parcial | Ausência de upload de imagens de capa | ✅ Sim | ✅ Sim | Os artigos RSS não permitiam alterar ou definir imagem de capa. | Adicionado campo de texto de URL de imagem de capa e preview inline no painel de curadoria. |

---

## 2. Padrões Visuais Requiridos pelo OMEGA v6.5

1. **Fonte Única:** Toda a interface usa a família `Inter` para displays, menus, headings e parágrafos normais. Apenas documentos de viagem (como roteiros digitais e propostas PDF) podem usar a fonte editorial `Outfit` para sofisticação tipográfica.
2. **Shadowless:** Nenhum card deve ter classes do Tailwind como `shadow-sm`, `shadow-md`, `shadow-lg` ou `shadow-xl`. As sombras são reservadas exclusivamente para:
   - Modais (`[role="dialog"]`)
   - Dropdowns/Popovers (`[data-radix-popper-content-wrapper]`)
   - Tooltips (`[role="tooltip"]`)
   - Card ativo em drag-and-drop (`.kanban-card-dragging`)
3. **Primary Action Color:** A cor principal das ações, destaques ativos e marcações passou a ser **Azul Royal** (`#2563EB` / HSL correspondente) substituindo os tons verdes legados.
