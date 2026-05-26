# Modals, Sheets & Drawers Audit — Turis Agências

This audit inspects Dialogs, Sheets, Drawers, and Popover overlay components, evaluating interactive accessibility and visual integration.

---

## 1. Inventory of Dialogs & Sheets

| File | Component | usage | Close Button | Mobile Wrap | Compliant? |
|---|---|---|---|---|---|
| [ClientEditSheet.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/ClientEditSheet.tsx) | `Sheet` | Edit Client | Native `<button>` | ✅ Yes | ⚠️ Partial |
| [QuotationBuilderSheet.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/QuotationBuilderSheet.tsx) | `Sheet` | Quote Builder | standard X button | ✅ Yes | ✅ Yes |
| [ProposalAiImportSheet.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/ProposalAiImportSheet.tsx) | `Sheet` | AI PDF Import | standard X button | ✅ Yes | ✅ Yes |
| [QuotationAiImportSheet.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/QuotationAiImportSheet.tsx) | `Sheet` | AI Quote Import | standard X button | ✅ Yes | ✅ Yes |
| [TicketDetailSheet.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/TicketDetailSheet.tsx) | `Sheet` | Support ticket | standard X button | ✅ Yes | ✅ Yes |

---

## 2. Interactive & Accessibility Deviations

1.  **Duplicate Overlay Wrapper:**
    The `ClientEditSheet` features custom background styles on its sheet header that compete with the default viewport backdrop filter. The overlay opacity should be standardized.
2.  **Keyboard Escape Binding (`ESC`):**
    Some Sheets containing third-party Leaflet Maps or visual builders intercept standard browser escape sequences. This prevents the user from closing the sheets via keyboard inputs, violating basic accessibility directives.
3.  **Dropdown Menu Shadows:**
    Radix popovers and context menus do not share a single, unified shadow class. Some drop shadows are excessively soft, while others are too dark. These must be locked to the unified `shadow-lg` standard.
4.  **Confirm Dialogs:**
    Multiple destructive actions (such as card deletion and ticket closures) use native browser `window.confirm()` popups. These must be replaced with the custom `AlertDialog` component for a unified, professional user experience.
