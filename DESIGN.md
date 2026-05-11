---
version: "1.0"
name: "Turis Agências OMEGA v5"
description: >
  Design system da plataforma SaaS de gestão de viagens Turis Agências.
  Arquitetura visual: Bento Grid OMEGA + Google Material Design 3 — Shadowless, Premium, Minimalista.

colors:
  primary:         "#22c55e"     # vj-green — CTA principal (Emerald 500)
  primary-hover:   "#16a34a"     # Emerald 600
  primary-bg:      "#f0fdf4"     # vj-green-bg — superfície leve
  secondary:       "#09090b"     # vj-bg-dark / títulos (Zinc 950)
  surface:         "#ffffff"     # vj-surface — cards e painéis
  background:      "#f8f9fa"     # vj-bg — fundo global
  on-surface:      "#09090b"     # vj-txt — texto principal
  on-surface-muted:"#52525b"    # vj-txt2 — subtexto
  on-surface-faint:"#a1a1aa"    # vj-txt3 — hints/placeholders
  border:          "#e4e4e7"     # vj-border
  border-strong:   "#d4d4d8"     # vj-border2
  danger:          "#ef4444"     # vj-red
  danger-bg:       "#fef2f2"     # vj-red-bg
  warning:         "#d4511a"     # vj-orange
  warning-bg:      "#fff4ee"     # vj-orange-bg
  info:            "#3b82f6"     # vj-blue
  info-bg:         "#eff6ff"     # vj-blue-bg

typography:
  display:
    fontFamily:    "Outfit"
    fontSize:      "2.25rem"
    fontWeight:    "900"
    letterSpacing: "-0.03em"
    lineHeight:    "1.1"
  h1:
    fontFamily:    "Outfit"
    fontSize:      "1.875rem"
    fontWeight:    "800"
    letterSpacing: "-0.02em"
  h2:
    fontFamily:    "Outfit"
    fontSize:      "1.5rem"
    fontWeight:    "700"
    letterSpacing: "-0.02em"
  h3:
    fontFamily:    "Outfit"
    fontSize:      "1.125rem"
    fontWeight:    "700"
    letterSpacing: "-0.01em"
  body-md:
    fontFamily:    "Inter"
    fontSize:      "0.875rem"
    fontWeight:    "400"
    lineHeight:    "1.6"
  body-sm:
    fontFamily:    "Inter"
    fontSize:      "0.75rem"
    fontWeight:    "400"
  label:
    fontFamily:    "Inter"
    fontSize:      "0.625rem"
    fontWeight:    "700"
    letterSpacing: "0.1em"
    textTransform: "uppercase"

rounded:
  sm:   "8px"
  md:   "12px"    # --radius padrão
  lg:   "16px"
  xl:   "1.5rem"  # --r-xl — cards
  2xl:  "2rem"    # --r-2xl — modais/sheets
  full: "9999px"  # chips/badges

spacing:
  xs:   "4px"
  sm:   "8px"
  md:   "16px"
  lg:   "24px"
  xl:   "32px"
  2xl:  "48px"

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor:       "#ffffff"
    rounded:         "{rounded.md}"
    padding:         "0 20px"
    height:          "40px"
    typography:      "{typography.body-md}"
    fontWeight:      "700"

  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"

  button-outline:
    backgroundColor: "{colors.surface}"
    textColor:       "{colors.on-surface}"
    rounded:         "{rounded.md}"
    padding:         "0 20px"
    height:          "40px"

  bento-card:
    backgroundColor: "{colors.surface}"
    rounded:         "{rounded.xl}"
    padding:         "{spacing.lg}"
    border:          "1px solid {colors.border}"

  bento-card-hover:
    border:          "1px solid {colors.primary}"

  kanban-card:
    backgroundColor: "{colors.surface}"
    rounded:         "{rounded.md}"
    padding:         "12px 12px 12px 24px"
    border:          "1px solid {colors.border}"

  status-badge-emitido:
    backgroundColor: "#eff6ff"
    textColor:       "#1d4ed8"
    rounded:         "{rounded.full}"

  status-badge-assinado:
    backgroundColor: "#f0fdf4"
    textColor:       "#15803d"
    rounded:         "{rounded.full}"

  status-badge-rascunho:
    backgroundColor: "#f4f4f5"
    textColor:       "#52525b"
    rounded:         "{rounded.full}"

  status-badge-cancelado:
    backgroundColor: "#fef2f2"
    textColor:       "#b91c1c"
    rounded:         "{rounded.full}"

  input:
    backgroundColor: "{colors.surface}"
    textColor:       "{colors.on-surface}"
    rounded:         "{rounded.md}"
    height:          "40px"
    padding:         "0 12px"
    border:          "1px solid {colors.border}"

  sheet:
    backgroundColor: "{colors.surface}"
    rounded:         "0"
    width:           "min(672px, 100vw)"

  sidebar:
    backgroundColor: "{colors.surface}"
    width:           "240px"
    border:          "1px solid {colors.border}"
---

## Overview

O Turis Agências OMEGA v5 é uma plataforma SaaS B2B para agências de turismo brasileiras.
O design segue os princípios do **Bento Grid OMEGA + Google Material Design 3** adaptado ao contexto brasileiro:
premium sem excessos, funcional sem ser genérico.

### Filosofia "Shadowless"
- Nenhum `box-shadow` em cards comuns — profundidade via `border` fina e `border-color` de destaque no hover
- Sombras APENAS em overlays/dropdowns/tooltips (`box-shadow: 0 8px 32px rgba(0,0,0,0.12)`)
- Bordas levíssimas `border-vj-border` (`#e4e4e7`) definem separações sem peso visual

### Fontes Obrigatórias
- **Outfit** (pesos 700–900): Títulos, headings, labels em uppercase
- **Inter** (pesos 400–700): Corpo de texto, inputs, dados

### Padrões de Micro-interação (OBRIGATÓRIO)
Todo elemento interativo DEVE ter:
```css
transition: all 0.2s ease;
/* hover: border-color levemente colorida, subtle translateY(-1px) */
/* active: scale(0.97) */
```
Nunca deixar elementos estáticos sem feedback visual.

## Colors

- **Primary (`#22c55e`):** Verde Emerald — CTA, links, ícones ativos, bordas de foco
- **Secondary (`#09090b`):** Ink — textos principais, backgrounds escuros (logotipo)
- **Surface (`#ffffff`):** Cards, modais, formulários — branco puro
- **Background (`#f8f9fa`):** Fundo da aplicação — cinza levíssimo
- **Border (`#e4e4e7`):** Separadores — zinc-200

## Typography

Headings usam Outfit (Black/ExtraBold), corpo usa Inter.
Labels de seção usam `text-[10px] font-black uppercase tracking-[0.15em] text-vj-txt3`.
Nunca usar placeholder genérico. Sempre adicionar peso visual com `font-bold` mínimo em labels.

## Components

### Cards (Bento)
Sempre `rounded-2xl` (1.5rem), borda `border border-vj-border`, bg branco.
Hover: `hover:border-vj-green/40 hover:-translate-y-0.5 transition-all duration-200`.

### Badges de Status
Usar as classes de componente definidas (emitido=azul, assinado=verde, rascunho=cinza, cancelado=vermelho).
NUNCA usar cores genéricas (`red`, `green`) sem ton correto do sistema.

### Formulários (Inputs, Selects, Textareas)
Altura padrão `h-10`, borda `border-vj-border`, bg branco, rounded `rounded-xl`.
Focus ring: `focus:ring-2 focus:ring-vj-green/30`.

### Sidebar
Largura `240px` (colapsada: `64px`), bg branco, sem sombra.
Itens ativos: bg `vj-green`, texto branco.
Itens inativos: hover `bg-zinc-50`.

### OCR Drop Zones
Borda tracejada `border-2 border-dashed border-vj-border`.
Hover: `hover:border-vj-green/50`.
Ícone centralizado com fundo `bg-vj-bg border border-vj-border rounded-full`.

## Motion

Todos os hoveres usam `duration-200`. Entradas de listas usam `duration-300`.
Nunca usar `duration-500` em micro-interações — parece lento.
Preferir `ease-out` para entradas, `ease-in-out` para hovers.
