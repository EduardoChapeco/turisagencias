# Builder & CMS Design Audit — Turis Agências

This audit maps the Site Builder, Blog News CMS, layout canvas grids, block library, and inspector panels.

---

## 1. Visual Alignment Matrix

| Builder Sub-section | UI Component | Tokens Used | Compliant? | Detected Visual Defects |
|---|---|---|---|---|
| Sidebar Blocks Selector | Standard Card | ⚠️ Partial | ⚠️ Partial | Shadow classes bypass flat policy rules. |
| Viewport Switcher | Button Group | ✅ Yes | ✅ Yes | None. |
| Inspector Panel | Form controls | ⚠️ Partial | ⚠️ Partial | Native form inputs are used instead of UI kit components. |
| Canvas Frame Layout | Print boundary | ✅ Yes | ✅ Yes | None. |

---

## 2. Identified Inconsistencies & Corrective Actions

1.  **Non-standard Typography Control Sliders:**
    In [VisualBuilder.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/builder/VisualBuilder.tsx), font size adjustment sliders use native browser `<input type="range" />` elements. These elements lack consistent styling and should be replaced with the custom Slider component.
2.  **Visual Builder Card Shadows:**
    The block list cards inside the left sidebar use custom shadows (`shadow-sm`, `shadow-md`), violating OMEGA's flat design policy.
3.  **Color Picker Swatches:**
    The inspector's color picker uses hardcoded background color values. It should display the primary OMEGA v6.5 brand colors first.
4.  **Autosave Feedback:**
    The top bar lacks an autosave status indicator (e.g., a simple badge showing "Draft" or "Published"), leaving users unsure if their changes are saved.
