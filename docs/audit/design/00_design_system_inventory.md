# Design System Inventory — Turis Design System OMEGA v6.5

This document maps all the visual foundation files, CSS variable tokens, configuration sheets, and base UI components found across the Turis Agências codebase.

---

## 1. Core Stylesheets & Visual Tokens

The foundation of the visual identity resides in:
*   **Tailwind Config:** [tailwind.config.ts](file:///c:/Users/Usuario/Documents/turisagencias/tailwind.config.ts)
*   **Global Reset & Component Styles:** [src/index.css](file:///c:/Users/Usuario/Documents/turisagencias/src/index.css)
*   **Specific Stylesheets:**
    *   [src/styles/premium-design.css](file:///c:/Users/Usuario/Documents/turisagencias/src/styles/premium-design.css) - Contains supplementary glassmorphism and layout patterns.
    *   [src/styles/viaja-public.css](file:///c:/Users/Usuario/Documents/turisagencias/src/styles/viaja-public.css) - Specific public-facing portal layout files.

---

## 2. Active CSS Variable Mappings (OMEGA v6.5 Standards)

### Core Colors & Layouts
| Token Variable | Default Value (Light) | Dark Mode Value | Target Brand Equivalent |
|---|---|---|---|
| `--vj-bg` | `#FAFAFA` | `#0F172A` | Background slate |
| `--vj-bg-dark` | `#0F172A` | `#09090B` | Deep dashboard background |
| `--vj-white` | `#ffffff` | `#000000` | Pure surface background |
| `--vj-surface` | `#ffffff` | `#1E293B` | Card surface |
| `--vj-txt` | `#111827` | `#F8FAFC` | Primary Typography |
| `--vj-txt2` | `#475569` | `#94A3B8` | Secondary Typography |
| `--vj-txt3` | `#64748B` | `#64748B` | Disabled/Subtle Typography |

### Semantics & Actions (Royal Blue Action Model)
| Token Variable | Light Value | Dark Value | Semantic Intent |
|---|---|---|---|
| `--vj-green` / `--vj-primary` | `#2563EB` | `#3B82F6` | **Azul Royal** - Primary actions |
| `--vj-green-bg` | `#EFF6FF` | `rgba(59,130,246,0.1)`| Primary subtle highlight |
| `--vj-orange` / `--vj-yellow`| `#D97706` | `#F59E0B` | Amber - Warning alerts |
| `--vj-orange-bg` | `#FEF3C7` | `rgba(245,158,11,0.1)`| Warning subtle highlight |
| `--vj-red` | `#DC2626` | `#EF4444` | Red - Destructive alerts / critical states |
| `--vj-red-bg` | `#FEE2E2` | `rgba(239,68,68,0.1)` | Destructive subtle highlight |

---

## 3. UI Kit Baseline Components

All modules are expected to consume standard Shadcn wrappers located under [src/components/ui/](file:///c:/Users/Usuario/Documents/turisagencias/src/components/ui/):
*   **Buttons:** [button.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/ui/button.tsx)
*   **Form Controls:** [input.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/ui/input.tsx), [textarea.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/ui/textarea.tsx), [select.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/ui/select.tsx), [checkbox.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/ui/checkbox.tsx), [switch.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/ui/switch.tsx)
*   **Card Containers:** [card.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/ui/card.tsx), [BentoGrid.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/ui/BentoGrid.tsx)
*   **Overlays & Drawers:** [dialog.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/ui/dialog.tsx), [sheet.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/ui/sheet.tsx), [drawer.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/ui/drawer.tsx), [popover.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/ui/popover.tsx)

---

## 4. Key Gaps & Inconsistencies Found

1.  **Tailwind Class Duplications:** High volumes of inline classes like `bg-blue-50 border-blue-100 text-blue-900` bypassing the semantic tokens (found in [ClientEditSheet.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/ClientEditSheet.tsx)).
2.  **Shadowless Violations:** Multiple page wrappers and button styles contain legacy shadow classes (`shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`) that violate the flat visual standard of OMEGA v6.5.
3.  **Lowercase HTML Button Tags:** Native `<button>` tags scattered inside `AppLayout.tsx`, `ClientEditSheet.tsx`, etc., bypassing keyboard focus rings and disabled styling.
4.  **Legacy Green Actions:** Colors mapping to green are overridden locally in some files, confusing the user since primary actions should strictly map to **Royal Blue** (`#2563EB`).
