# Layouts, Grids & Cards Audit — Turis Agências

This audit maps page layout shells, grid spacing constraints, and card alignment formats, pointing out custom overrides that break visual rhythm.

---

## 1. Grid & Spacing Deviations

Standard layouts in Turis Agências must utilize predefined grid and gap configurations to align components correctly.

| File / Component | Identified Spacing Segments | Expected DS Pattern | Class | Correct Action |
|---|---|---|---|---|
| [PublicQuotation.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/pages/PublicQuotation.tsx) | `gap-6 md:gap-8` | `gap-vj-xl` | `DS_DESVIO_LEVE` | Standardize using `--vj-gap-xl` mappings |
| [ProposalEditor.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/pages/ProposalEditor.tsx) | `min-h-[1123px]` | Fixed editor panel spacing | `DS_OK` | Exempted (designed for print frame consistency) |
| [Onboarding.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/pages/Onboarding.tsx) | `space-y-6 md:space-y-8` | `space-y-vj-xl` | `DS_DESVIO_LEVE` | Standardize vertical flow spaces |

---

## 2. Page Margins & App Shell Compliance

The internal agent panel uses `AppLayout` and `AppSidebar` to control dashboard padding. However, some sub-pages duplicate outer paddings or introduce inconsistent outer containers:

1.  **Multiple Max Width Constraints:** Dashboard views use `max-w-7xl` or `max-w-5xl` without semantic rationale, causing pages to resize differently on wide screens.
2.  **Card Border Redundancy:** Cards nested inside pre-padded layout components are sometimes given duplicate borders, bloating the UI's density.
3.  **Bento Grid Card Heights:** The Bento layout on `/` (Index Dashboard) does not specify strict relative height boundaries on cards, leading to visual misalignment when dynamic data or custom logs are rendered.
