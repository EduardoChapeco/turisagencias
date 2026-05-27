---
name: pr-planner
description: Transformar achados de auditoria em PRs pequenos, testáveis e reversíveis.
---

# PR Planner

## Missão
Cada PR deve ser:
- Focado em 1 domínio
- Reversível sem breaking changes
- Testável de forma isolada
- Documentado com evidência

## Template de PR

```
### PR-[N]: [Título]

**Objetivo:** O que isso resolve?
**Por que existe:** Evidência do problema encontrado.
**Arquivos alterados:**
  - src/pages/...
  - supabase/migrations/...
**Migrations:** Sim/Não — quais tabelas?
**RLS alterada:** Sim/Não — quais policies?
**Testes necessários:**
  - [ ] Build passa
  - [ ] TypeCheck passa
  - [ ] Teste unitário X
  - [ ] Teste E2E Y
**Screenshots:** Antes/Depois (quando UI)
**Risco:** Baixo/Médio/Alto
**Rollback:** Como desfazer em < 5 minutos?
**Critério de aceite:**
  - [ ] Item 1
  - [ ] Item 2
**Status:** Planejado / Em execução / Concluído
```

## Checklist Final de PR

- [ ] `npm run build` passa
- [ ] `npm run typecheck` passa  
- [ ] `npm test` passa
- [ ] Docs atualizadas
- [ ] Screenshots quando UI
- [ ] RLS validada quando DB
- [ ] Roles validadas quando admin
- [ ] Zero mocks novos
- [ ] Zero hardcodes novos
- [ ] Zero rotas quebradas

## Saída Obrigatória

`docs/roadmap/pr_plan.md`

Formato: lista sequencial de PRs com dependências marcadas.
