# Global Shell Audit — Turis Agências

This audit inspects the main wrapper layouts, sidebar structures, navigation headers, and command menus across agency and tenant dashboards.

---

## 1. Mapped Shell Configurations

| Shell Component | Target File | Consumers / Routes | Compliance Status | Identified Inconsistencies |
|---|---|---|---|---|
| `AppLayout` | [AppLayout.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/AppLayout.tsx) | `/`, `/clients`, `/quotations`, `/itineraries`, etc. | ⚠️ Partial | Legacy green border markers in mobile menu button toggles. |
| `AppSidebar` | [AppSidebar.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/AppSidebar.tsx) | All `AppLayout` views | ✅ OK | None. Matches OMEGA v6.5. |
| `PortalShell` | Handled inline | `/portal/:org_slug/home`, etc. | ⚠️ Partial | Missing top-bar breadcrumb navigation. |

---

## 2. Global Shell Visual Defects

1.  **Sidebar Logout Trigger:**
    In [AppSidebar.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/AppSidebar.tsx) (lines 334+), the logout action button is directly visible in the sidebar layout next to the settings button, bypassing the standard User Profile dropdown menu layout typically used in modern SaaS.
2.  **Breadcrumbs Hierarchy:**
    The breadcrumbs widget is absent on settings and analytics sub-tabs, leaving the user with generic, uninformative header text labels that lack navigation links.
3.  **Command Menu Overlap:**
    The global search bar in [AppLayout.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/AppLayout.tsx) does not bind to a standard Command Menu (`Cmd+K`), restricting users to simple static text filters instead of keyboard-navigable shortcuts.
