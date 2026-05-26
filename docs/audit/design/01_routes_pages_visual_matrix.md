# Routes & Pages Visual Matrix — Turis Agências

This matrix inventories all routes in the system, mapping shell layouts, token compliance, UI Kit usage, responsive status, and identified visual defects.

---

## 1. Internal Agent/Admin Routes

| Route | Page Component | Shell | UI Kit? | Tokens? | Responsive? | Detected Visual Issues |
|---|---|---|---|---|---|---|
| `/` | `Dashboard` | `AppShell` | ✅ Yes | ✅ Yes | ✅ Yes | Centavos format issues in pipeline summary widget. |
| `/clients` | `Clients` | `AppShell` | ✅ Yes | ✅ Yes | ✅ Yes | Standard client table scrollbar visible despite standard global reset. |
| `/quotations` | `Quotations` | `AppShell` | ✅ Yes | ⚠️ Partial | ✅ Yes | Status badges using custom overrides (`bg-blue-50` inline classes). |
| `/itineraries` | `Itineraries` | `AppShell` | ✅ Yes | ✅ Yes | ✅ Yes | None. |
| `/itineraries/:id/builder` | `ItineraryBuilder` | `AppShell` | ✅ Yes | ⚠️ Partial | ⚠️ Tablet scale | Fixed canvas width issues on mid-size tablet viewports. |
| `/kanban/sales` | `KanbanBoard` | `AppShell` | ✅ Yes | ✅ Yes | ✅ Yes | None. |
| `/kanban/departures` | `DeparturesKanban` | `AppShell` | ✅ Yes | ✅ Yes | ✅ Yes | None. |
| `/kanban/tasks` | `TasksKanban` | `AppShell` | ✅ Yes | ✅ Yes | ✅ Yes | None. |
| `/settings` | `Settings` | `AppShell` | ✅ Yes | ✅ Yes | ✅ Yes | None. |
| `/site-builder` | `SiteBuilderPage` | `BuilderShell` | ✅ Yes | ⚠️ Partial | ⚠️ Desktop-first | Sidebar controls use native sliders bypassing theme tokens. |
| `/portal-manager` | `PortalManagerPage` | `AppShell` | ✅ Yes | ✅ Yes | ✅ Yes | Simulation window shadow violates flat policy (should be shadowless). |
| `/finance/payments` | `Payments` | `AdminShell` | ✅ Yes | ✅ Yes | ✅ Yes | None. |
| `/finance/suppliers` | `Suppliers` | `AdminShell` | ✅ Yes | ✅ Yes | ✅ Yes | None. |
| `/finance/transactions` | `Transactions` | `AdminShell` | ✅ Yes | ✅ Yes | ✅ Yes | None. |
| `/legal/contracts` | `ContractTemplates` | `AdminShell` | ✅ Yes | ✅ Yes | ✅ Yes | None. |
| `/contracts` | `ContractRecords` | `AppShell` | ✅ Yes | ✅ Yes | ✅ Yes | None. |
| `/vouchers` | `Vouchers` | `AppShell` | ✅ Yes | ✅ Yes | ✅ Yes | None. |
| `/automations` | `Automations` | `AdminShell` | ✅ Yes | ✅ Yes | ✅ Yes | None. |
| `/admin/dashboard` | `AdminDashboard` | `AdminShell` | ✅ Yes | ✅ Yes | ✅ Yes | None. |

---

## 2. Public & Traveler-Facing Portal Routes

| Route | Page Component | Shell | UI Kit? | Tokens? | Responsive? | Detected Visual Issues |
|---|---|---|---|---|---|---|
| `/login` | `Login` | None | ✅ Yes | ✅ Yes | ✅ Yes | Login card shadow violates flat policy (should be shadowless). |
| `/signup` | `Signup` | None | ✅ Yes | ✅ Yes | ✅ Yes | Shadow visible. |
| `/pricing` | `Pricing` | None | ✅ Yes | ✅ Yes | ✅ Yes | Pricing cards heights inconsistent on mobile wrap. |
| `/f/:token` | `PublicTravelerForm` | None | ✅ Yes | ✅ Yes | ✅ Yes | Validation errors use native browser tooltips instead of Sonner. |
| `/q/:token` | `PublicQuotation` | None | ✅ Yes | ⚠️ Partial | ✅ Yes | Layout columns spacing overflows viewport. |
| `/roteiro/:token` | `PublicItinerary` | None | ✅ Yes | ✅ Yes | ✅ Yes | Font style Outfit overrides other headers. |
| `/minha-viagem/:token` | `TravelerPortal` | None | ✅ Yes | ⚠️ Partial | 📱 Mobile-first | Floating check-in status overlays traveler card details. |
| `/portal/t/:token/checkin`| `TravelerCheckinPortal`| `PortalShell` | ✅ Yes | ✅ Yes | 📱 Mobile-first | Airline display showing IATA code directly on UI header. (Fixed!) |
| `/p/:token` | `PublicProposal` | None | ✅ Yes | ✅ Yes | ⚠️ Fixed layout | Print layout overflow on small desktop. |
| `/g/:slug` | `PublicGroupTrip` | None | ✅ Yes | ✅ Yes | ✅ Yes | Seats preview overflows on small iPhone SE layout. |
| `/voucher/:token` | `PublicBookingVoucher` | None | ✅ Yes | ✅ Yes | ✅ Yes | Voucher background color is pure black instead of slate dark. |
| `/site/:slug` | `PublicSiteView` | `PublicShell` | ✅ Yes | ✅ Yes | ✅ Yes | Header navigation menu wraps early. |
