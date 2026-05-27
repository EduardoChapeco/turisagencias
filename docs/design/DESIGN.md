# OMEGA v6.5 — Design System (Bento Grid)

O OMEGA v6.5 é o sistema de design unificado da plataforma Turis Agências. Este documento descreve as diretrizes absolutas que devem ser seguidas para qualquer nova tela, refatoração ou componente visual.

## 1. Regras Visuais (Flat Design Premium)
- **Zero Sombras:** A UI é predominantemente "flat". Evite `shadow-md`, `shadow-lg` e drop-shadows. As únicas exceções que recebem box-shadow são overlays popovers (Dropdowns, Dialogs, Tooltips) via Radix UI e cards do dnd-kit durante drag.
- **Bordas Delicadas:** Use `--vj-border` (`#DDE3EA`) para separar seções ou demarcar cards (Bento Card).
- **Backgrounds:** Fundo da aplicação: `--vj-bg` (`#FAFAFA`). Fundo de cards/painéis: `--vj-surface` (`#FFFFFF`).

## 2. Tipografia (Inter)
- **Fonte Padrão:** 'Inter', sans-serif.
- **Font-Weights:** Use apenas `400` (normal), `600` (semibold), e `700` (bold). Textos auxiliares nunca devem ser `300` (finos demais dificultam a leitura). Textos de títulos e headings nunca devem exceder `800`.
- **Hierarquia:**
  - `h1` até `h3`: lettr-spacing de `-0.025em`.
  - Labels e Badges: Letras minúsculas / Uppercase pequeno com `tracking-wider` (ex: `text-[10px] font-bold uppercase tracking-wider`).

## 3. Cores (Tokens `--vj-*`)
NUNCA use cores hardcoded (ex: `text-[#333]`, `bg-gray-100` arbitrário). Use os tokens estritos definidos no `index.css`:

### Primárias / Ação (Azul)
- `--vj-blue` (`#2563EB`) -> Ação primária, botões principais.
- `--vj-blue-bg` (`#EFF6FF`) -> Fundo leve para badges ou hover states.

### Status (Semânticas)
- `--vj-green` e `--vj-green-bg` -> Sucesso / Concluído
- `--vj-orange` e `--vj-orange-bg` -> Alertas / Ações Pendentes
- `--vj-red` e `--vj-red-bg` -> Erros / Cancelamentos / Destrutivas

### Texto
- `--vj-txt` (`#111827`) -> Textos primários (títulos, valores)
- `--vj-txt2` (`#475569`) -> Textos secundários (descrições longas)
- `--vj-txt3` (`#64748B`) -> Textos terciários (labels vazias, placeholders, hints)

## 4. Estrutura e Layout
- **Bento Grid:** Use `.bento-grid-premium` para painéis compostos de vários cards. Os cards devem usar a classe `.bento-card` ou `.premium-card`.
- **Page Header:** O topo de todas as páginas deve usar o componente `PageHeader` (ou usar as classes `.page-header`, `.page-header-left` no HTML puro). Ele deve conter apenas título, ícone e ações.

## 5. Auditoria de Conformidade
Para garantir a aderência, utilize o plugin local Tailwind (via classes `text-vj-*`) e rode varreduras nos componentes para remover cores hexadecimais perdidas no código.
