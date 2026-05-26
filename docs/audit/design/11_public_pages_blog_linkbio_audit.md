# Public Pages, Blog & Linkbio Audit — Turis Agências

This audit evaluates public-facing pages, external blogs, catalogs, and dynamic brand kit components.

---

## 1. Compliance Matrix by Public Route

| Public View | Compliant? | Brand-kit Support | Visual Defects |
|---|---|---|---|
| `/site/:slug` (Public Site) | ⚠️ Partial | ✅ Yes | Menu bar wraps too early on smaller laptop screens. |
| `/minha-viagem/:token` | ⚠️ Partial | ✅ Yes | Floating check-in cards overlap client details. |
| `/voucher/:token` | ✅ Yes | ✅ Yes | None. |
| `/noticias/:slug` (Public Blog) | ⚠️ Partial | ✅ Yes | Custom cards use legacy shadows, violating OMEGA rules. |
| `/p/:token` (Public Proposal) | ✅ Yes | ✅ Yes | None. |

---

## 2. Brand Kit & Style Guide Alignment Issues

1.  **Overuse of Hardcoded Colors:**
    Public screens override global CSS variables with static values (like `#059669` for green highlights) to show active states. These should use the brand color variables.
2.  **Inconsistent Custom Domain Headers:**
    Agency custom domain headers use a different header style than standard public routes, making them look like a separate system.
3.  **Contrast Issues on Warning Banners:**
    Amber-colored warning banners on public traveler pages have poor contrast ratios (below 3:1) for text, violating accessibility guidelines.
4.  **SEO Layout Issues:**
    Several public routes lack proper Heading (`<h1>`) hierarchy and meta tag fallbacks when dynamic data (like traveler info) is missing.
