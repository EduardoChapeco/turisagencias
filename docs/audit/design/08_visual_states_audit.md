# Visual States Audit — Turis Agências

This audit maps loading indicators, error recovery banners, empty board prompts, and transition animations.

---

## 1. Compliance Matrix by Module

| Page / Component | Loading State | Empty State | Error Bound? | Compliant? |
|---|---|---|---|---|
| `/` (Dashboard) | Spinner | N/A | ✅ Yes | ✅ Yes |
| `/clients` | Skeleton rows | N/A | ✅ Yes | ✅ Yes |
| `/quotations` | Loader spinner | `EmptyState` | ✅ Yes | ✅ Yes |
| `/kanban/sales` | Spinner | Column empty banner | ✅ Yes | ✅ Yes |
| `/site-builder` | ⚠️ Infinite spinner if project empty | ⚠️ Blank white screen | ⚠️ No | ❌ Broken |
| `/portal-manager` | Loader spinner | N/A | ✅ Yes | ✅ Yes |
| `/finance/payments` | Loading skeletons | `EmptyState` | ✅ Yes | ✅ Yes |
| `/vouchers` | Loading skeletons | `EmptyState` | ✅ Yes | ✅ Yes |

---

## 2. Identified Visual Defect Logs

1.  **Infinite Loading Screens:**
    The Visual Builder does not gracefully handle network timeouts or token expiration. This can lock the user in an infinite spinning loading overlay instead of redirecting them back to `/site-builder` with a helpful error prompt.
2.  **Generic Empty Boards:**
    Kanban columns (sales, departures, tasks) display empty space when empty. They lack standard illustrations or text prompts guiding the user on how to add cards.
3.  **Missing Autosave Indicators:**
    The quote editor and visual builder perform auto-saves in the background. However, they do not show a visual indicator (like "Saving..." or "All changes saved") to reassure the user.
4.  **Error Screen Detail Exposure:**
    Errors shown to travelers on public portal routes sometimes expose raw database schema details or stack traces, violating security guidelines.
