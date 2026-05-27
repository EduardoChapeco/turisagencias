# Design System e UI/UX (Bento Grid OMEGA v4.0)

Este documento dita as regras absolutas de Design e Arquitetura Visual do SaaS "Turis Agências". 

## Princípios (A Regra Visual Alvo)
O Turis Agências não é um app lúdico nem um jogo Tycoon. É a principal ferramenta de trabalho de Agentes de Turismo e Financeiros, que encaram a tela por 8 a 10 horas diárias.

A UI interna DEVE ser:
- **Calma e Silenciosa:** Sem sombras pesadas (Drop shadows gigantes).
- **Quase Flat e Bordas Finas:** Os cards (Bento Grid) usam bordas `border-zinc-200` (light mode) ou `border-zinc-800` (dark mode), com raios de borda padronizados (`rounded-xl` ou `rounded-2xl`).
- **Navegação (Shell):** 
  - A *Sidebar Rail* deve ser **finíssima**. Ícones pequenos, centralizados e precisamente alinhados (Lucide React de tamanho `w-5 h-5`).
  - Labels só devem aparecer em estado expandido ou como tooltips para não poluir a tela no modo compacto.
  - O conteúdo principal (`main`) **nunca** deve invadir a área da sidebar ou passar por baixo dela.
- **TopBar Limpa:** Sem poluição, usada para breadcrumbs, pesquisa rápida e avatar de usuário.
- **Tipografia:** Tipografia clara (Inter/Roboto) via classes nativas do Tailwind. Uso rígido de hierarquia visual, evitando textos excessivamente em negrito a menos que seja um valor monetário ou título.
- **Micro-interações:** Sem botões piscando. Estados de Hover devem mudar sutilemente o fundo (ex: `hover:bg-zinc-100`) ou a borda.

## Paleta de Cores e Tokens
- **Fundo Principal (Light):** `bg-zinc-50` ou `bg-white`.
- **Fundo Secundário (Superfícies):** `bg-white`.
- **Bordas (Divider):** `border-zinc-200` ou `border-zinc-100`.
- **Fundo Principal (Dark):** `bg-zinc-950`.
- **Fundo Secundário (Dark):** `bg-zinc-900`.
- **Texto Principal:** `text-zinc-900` (Light) / `text-zinc-50` (Dark).
- **Texto Mudo (Muted):** `text-zinc-500` / `text-zinc-400`.
- **Acento Primário (Brand):** **VJ Green** (ou a cor escolhida pelo Brand Kit da organização). Botões principais usam `bg-vj-green text-white hover:bg-vj-green/90`.

## Componentes Permitidos
Qualquer novo componente deve estender o design do `shadcn/ui` que já está instalado.
1. **Botões:** Componente `<Button>` (`src/components/ui/button.tsx`).
2. **Inputs:** `<Input>`, `<Select>`. Labels devem estar no topo.
3. **Cards:** `<Card>`, `<CardHeader>`, `<CardContent>`.
4. **Modais/Drawers:** `<Dialog>`, `<Sheet>` para manter o foco.

## Anti-Patterns Absolutos
🚫 **Dashboard Genérico e Poluído:** Gráficos sem sentido agrupados numa tela inicial inútil.
🚫 **Cores Berrantes de Fundo:** Evitar blocos coloridos como Red ou Blue saturados, usando apenas tons de Zinc/Slate e um "accent" sutil.
🚫 **Corte de Ícones:** Se um ícone ou label estiver cortado pela responsividade, o layout está quebrado. Use `min-w-0`, `flex-shrink-0`, ou remova o item em telas pequenas.
