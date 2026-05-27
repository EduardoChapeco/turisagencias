---
name: builder-cms-auditor
description: Auditar o Builder CMS (blocos, templates, publicação, versionamento, URL pública, RLS).
---

# Builder CMS Auditor

## Missão
Garantir que o construtor de sites seja real: blocos registrados, dados persistidos, versões reais, publicação funcional, URL pública acessível sem autenticação.

## Checklist

### Registry de Blocos
- [ ] `registerAllBlocks()` chama quantos blocos?
- [ ] Cada bloco tem: `key`, `label`, `category`, `defaultProps`, `Component`, `Inspector`?
- [ ] Blocos de formulário usam `useSubmitForm` com edge function real?
- [ ] Blocos de pagamento conectam Stripe/Asaas real?

### Persistência
- [ ] `useBuilderStore` persiste para `builder_sites` + `builder_pages` + `builder_page_versions`?
- [ ] Autosave draft funciona sem perdas?
- [ ] Publish cria nova versão com status='published'?

### Render Público
- [ ] `PublicSiteView.tsx` busca APENAS versões com status='published'?
- [ ] URL pública não requer autenticação?
- [ ] SEO meta tags renderizadas dinamicamente?
- [ ] DOMPurify aplicado em HTML dinâmico?

### Multi-tenant
- [ ] Cada site isolado por org_id via RLS?
- [ ] Sites de org A não visíveis para org B?

## Saída Obrigatória

`docs/audit/builder_cms_audit.md`
