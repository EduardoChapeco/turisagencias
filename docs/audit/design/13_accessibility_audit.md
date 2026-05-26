# Accessibility (A11y) Audit — Turis Agências

This audit evaluates the accessibility of agency interfaces, focusing on focus visibility, keyboard navigation, tab order, and screen reader labels.

---

## 1. Compliance Metric by Layout Element

| Layout Element / Page | Focus Outline | Keyboard Tab | ARIA Landmarks | Alt Images | Compliance Status |
|---|---|---|---|---|---|
| Sidebar Menu | ⚠️ Inconsistent | ✅ Yes | ✅ Yes | N/A | ⚠️ Partial |
| Client Form Input | ✅ Yes | ✅ Yes | ✅ Yes | N/A | ✅ OK |
| Kanban Cards | ❌ No | ⚠️ Partial | ❌ No | N/A | ❌ Non-compliant |
| Travel Portals | ✅ Yes | ✅ Yes | ✅ Yes | ⚠️ Partial | ⚠️ Partial |
| Modals & Dialogs | ✅ Yes | ⚠️ No focus trap | ✅ Yes | N/A | ⚠️ Partial |

---

## 2. Accessibility Deviations & Corrective Actions

1.  **Kanban Cards Focus Outlines:**
    Kanban cards in the Sales and Departures pipelines lack visual focus rings (`focus-visible:ring-2`) when navigated via keyboard Tab inputs. This makes keyboard-only navigation extremely difficult.
2.  **Missing Focus Trap on Dialog Sheets:**
    Sheets like `ClientEditSheet` and `QuotationBuilderSheet` do not implement focus trapping. This allows keyboard tab navigation to escape the sheet layout and select elements behind it.
3.  **Low Contrast Color Tokens:**
    Text elements inside warning banners (`--vj-orange-bg`) and active badges do not meet the WCAG AA contrast ratio of 4.5:1 on light theme backgrounds. These colors must be darkened to improve readability.
4.  **Icons Missing Screen Reader Labels:**
    Dynamic control buttons (such as those with only Lucide icons and no text labels) lack `aria-label` tags, preventing screen readers from identifying their function.
