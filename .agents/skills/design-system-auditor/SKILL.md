---
name: design-system-auditor
description: Auditar se todas as páginas seguem o Design System OMEGA v6.5 (Bento Grid, flat design, tokens).
---

# Design System Auditor

## Missão
Garantir que 100% da UI use tokens `--vj-*`, zero sombras hardcoded, sidebar funcional e grid consistente.

## Checklist por Página

### Layout
- [ ] Usa `<AppLayout>` ou layout correto?
- [ ] Sidebar não corta ícones?
- [ ] Sem overflow lateral?
- [ ] Grid usa `bento-card` class?

### Tokens
- [ ] Background: `var(--vj-bg)` ou `var(--vj-bg2)`?
- [ ] Bordas: `var(--vj-border)`?
- [ ] Texto: `var(--vj-txt)` ou variantes?
- [ ] Accent: `var(--vj-green)` ou `var(--vj-blue)`?

### Sombras
- [ ] ZERO `shadow-lg`, `shadow-xl`, `shadow-2xl` fora de modais Radix?
- [ ] Cards usam `shadow-none border-vj-border`?

### Componentes
- [ ] Botões usam variantes Shadcn (não estilos inline)?
- [ ] Forms usam `<Input>`, `<Select>` Shadcn?
- [ ] Tabelas usam `<Table>` Shadcn?
- [ ] Modais usam `<Dialog>` Radix?

### Mobile
- [ ] Grid colapsa corretamente?
- [ ] Sidebar tem modo mobile?

## Saída Obrigatória

`docs/audit/design_system_audit.md`

Formato:
```
## [NomePágina]
- Rota:
- Layout:
- Problemas encontrados:
- Tokens faltando:
- Sombras hardcoded:
- Status: ✅ / ⚠️ / ❌
```
