# Documents Visual Audit — Turis Agências

This audit maps print layout configurations, exportable PDFs, voucher layouts, and fixed-ratio printable pages.

---

## 1. Compliance Matrix by Export Type

| Document Type | Canvas Frame | Fonts Used | Print Layout | Custom Tokens? | Compliance Status |
|---|---|---|---|---|---|
| Voucher | `800px` standard | Inter, Outfit | ✅ Compliant | ✅ Yes | ✅ OK |
| Proposal | `794px` standard | Inter, Outfit | ✅ Compliant | ✅ Yes | ✅ OK |
| Contract | `800px` standard | Inter | ✅ Compliant | ✅ Yes | ✅ OK |
| Itinerary | `800px` standard | Outfit | ✅ Compliant | ✅ Yes | ✅ OK |

---

## 2. Print Layout & Formatting Deficiencies

1.  **Print Breakpoints Violations:**
    The print viewports (`@media print`) on `/p/:token` (Public Proposal) do not explicitly hide layout sidebars and workspace wrappers. This causes background sidebar artifacts to appear on exported PDFs.
2.  **Outfit Editorial Font Consistency:**
    Outfit is the designated editorial font for travel headings. However, some voucher subheadings fall back to Arial or times-roman, creating styling discrepancies.
3.  **PDF Margins & Safe Areas:**
    Multi-page PDF exports lack safe margins. This can cause text to get cut off at page breaks.
4.  **Inconsistent Print Button Styles:**
    The printable layout header uses custom green print action buttons. These buttons violate OMEGA's primary Royal Blue color standard.
