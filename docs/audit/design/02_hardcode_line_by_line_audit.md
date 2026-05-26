# Hardcode Line-by-Line Audit — Turis Agências

This document lists precise source code lines containing hardcoded colors, fonts, shadow styles, margins, or padding values that bypass standard design tokens.

---

## 1. Inventory of Color Hardcodes

| File | Line | Hardcode Segment | DS Token Equivalent | Action Required | Class |
|---|---|---|---|---|---|
| [ClientEditSheet.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/ClientEditSheet.tsx) | 356 | `bg-blue-50/50 border border-blue-100` | `bg-vj-blue-bg border border-vj-blue/30` | Map to semantic blue | `DS_HARDCODE` |
| [ClientEditSheet.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/ClientEditSheet.tsx) | 358 | `text-blue-500` | `text-vj-blue` | Map to semantic blue | `DS_HARDCODE` |
| [ClientEditSheet.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/ClientEditSheet.tsx) | 360 | `text-blue-600` | `text-vj-blue` | Map to semantic blue | `DS_HARDCODE` |
| [ClientEditSheet.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/ClientEditSheet.tsx) | 541 | `bg-amber-50/50 border border-amber-100` | `bg-vj-orange-bg border border-vj-orange/30` | Map to semantic orange | `DS_HARDCODE` |
| [ClientEditSheet.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/ClientEditSheet.tsx) | 544 | `text-amber-500` | `text-vj-orange` | Map to semantic orange | `DS_HARDCODE` |

---

## 2. Inventory of Shadow Policy Violations (OMEGA v6.5 Shadowless Core)

According to OMEGA v6.5, standard cards, dashboards, buttons, inputs, and layout blocks must be flat (shadowless). The following lines violate this:

| File | Line | Violation Segment | Required Change | Class |
|---|---|---|---|---|
| [Hotels.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/pages/Hotels.tsx) | 76 | `shadow-lg` | Remove shadow class | `DS_HARDCODE` |
| [Index.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/pages/Index.tsx) | 177 | `shadow-sm` | Remove shadow class | `DS_HARDCODE` |
| [Proposals.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/pages/Proposals.tsx) | 105 | `shadow-sm` | Remove shadow class | `DS_HARDCODE` |
| [PublicNewsArticle.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/pages/PublicNewsArticle.tsx) | 155 | `shadow-sm` | Remove shadow class | `DS_HARDCODE` |
| [PublicNewsArticle.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/pages/PublicNewsArticle.tsx) | 198 | `shadow-sm` | Remove shadow class | `DS_HARDCODE` |
| [PublicNewsArticle.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/pages/PublicNewsArticle.tsx) | 214 | `shadow-sm` | Remove shadow class | `DS_HARDCODE` |
| [PublicProposal.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/pages/PublicProposal.tsx) | 117 | `shadow-sm` | Remove shadow class | `DS_HARDCODE` |
| [PublicProposal.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/pages/PublicProposal.tsx) | 144 | `shadow-sm` | Remove shadow class | `DS_HARDCODE` |
| [ProposalEditor.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/pages/ProposalEditor.tsx) | 377 | `shadow-xl` | Remove shadow (keep flat border) | `DS_HARDCODE` |

---

## 3. Inline Styles Violations

| File | Line | Hardcode Style Attribute | Token Equivalent | Class |
|---|---|---|---|---|
| [ProposalEditor.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/pages/ProposalEditor.tsx) | 377 | `rounded-3xl` | `rounded-vj-xl` | `DS_HARDCODE` |
