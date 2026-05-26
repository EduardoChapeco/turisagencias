# Kanbans & Tables Audit — Turis Agências

This audit maps complex list views, task/deal pipelines, table structures, and data grid cards.

---

## 1. Grid & Table Component Audit

| Module / Route | Core Component | Columns Style | Density | Hover States | Compliance Status |
|---|---|---|---|---|---|
| `/clients` | `DataTable` | standard grid | Medium | ✅ Yes | ✅ OK |
| `/finance/payments` | `DataTable` | standard grid | Medium | ✅ Yes | ✅ OK |
| `/kanban/sales` | `KanbanBoard` | custom headers | High | ✅ Yes | ✅ OK |
| `/kanban/departures`| `KanbanBoard` | custom headers | High | ✅ Yes | ✅ OK |
| `/vouchers` | `DataTable` | standard grid | Medium | ✅ Yes | ✅ OK |

---

## 2. Structural & Alignment Issues

1.  **Kanban Card Padding Mismatch:**
    Cards in the Sales Kanban have different padding classes than cards in the Departures Kanban. Sales cards use standard tailwind spacing, whereas Departures cards use hardcoded paddings to show the locator badge. These paddings should be standardized.
2.  **Row Actions Dropdown Shadows:**
    Row actions buttons (like Edit/Delete) inside data tables use custom menu overlays. These overlays lack consistent borders and shadows, violating the shadowless policy rules.
3.  **Horizontal Scrolling Overflow:**
    When showing more than 5 columns, the Kanban board creates a horizontal scrollbar. However, it lacks visual scroll indicators on mobile screens, making it hard to see off-screen columns.
4.  **Inconsistent Drag Indicators:**
    The drag handles on Kanban cards use different icons and placements across boards, confusing users.
