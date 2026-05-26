# Responsive Audit — Turis Agências

This audit maps responsive layouts, checking for component scaling, viewport overflows, and usability issues across mobile and desktop breakpoints.

---

## 1. Breakdown by Viewport Size

| Screen Breakpoint | Target Size | Evaluated Views | Responsive Compliant? | Defect Summary |
|---|---|---|---|---|
| iPhone Mobile | `390x844` | Traveler Portal, Forms, Onboarding | ✅ Yes | None. |
| iPad Portrait | `768x1024` | Dashboard, CRM Board | ⚠️ Partial | Kanban board has horizontal overflow without visual swipe helpers. |
| Small Laptop | `1024x768` | Site Builder, Proposal Editor | ⚠️ Partial | Visual builder sidebar columns wrap unexpectedly. |
| HD Desktop | `1440x900` | All views | ✅ Yes | None. |

---

## 2. Desktop-to-Mobile Breakpoint Defects

1.  **Kanban Boards Horizontal Scroll:**
    On mobile viewports, the Kanban Board forces a horizontal scroll. However, it lacks swipe gesture support and visual scrollbars, making navigation difficult for touch-screen users.
2.  **Traveler Portal Overlap:**
    The portal sidebar elements overlap the client details card on mobile screens (viewport sizes under `400px`).
3.  **Site Builder Inspector Panel Wrap:**
    The settings panel inside the Visual Builder wraps controls onto multiple lines on mid-sized screens, cluttering the workspace.
4.  **Tabelle Spacing:**
    Standard lists inside `DataTable` components do not hide secondary columns (such as dates or tags) on mobile viewports. This causes columns to truncate or wrap awkwardly, making text unreadable.
