---
name: page-contract-tracer
description: Rastrear cada página até suas tabelas, hooks, RLS e Edge Functions. Provar que o dado flui da UI ao banco e volta.
---

# Page Contract Tracer

## Missão
Para cada página, provar a cadeia completa:
`UI Component → Event Handler → Hook (useQuery/useMutation) → Service/Edge Function → DB Table → RLS Policy → Resposta`

## Procedimento

1. Listar todas as páginas em `src/pages/`.
2. Para cada página, identificar:
   - Hooks de leitura (`useQuery`): qual tabela?
   - Hooks de escrita (`useMutation`): qual tabela?
   - Edge Functions chamadas
   - RLS policies que protegem as tabelas
3. Verificar se as tabelas existem nas migrations.
4. Verificar se o RLS está ativo nas tabelas.
5. Identificar páginas que fazem `supabase as any` (bypass de types).
6. Identificar chamadas a tabelas inexistentes.

## Critérios de Falha
- Tabela usada mas não existe na migration ❌
- RLS desabilitado ❌  
- `supabase as any` sem documentação ⚠️
- Mock de dados em produção ❌
- Edge Function chamada mas não deployada ⚠️

## Saída Obrigatória

`docs/audit/page_contracts.md`

Formato por página:
```
## [NomePágina] — /rota
| Camada | Detalhe | Status |
|--------|---------|--------|
| Hook leitura | useClients → tabela clients | ✅ |
| Hook escrita | useCreateClient → INSERT clients | ✅ |
| RLS | org_id = auth.user_org_id() | ✅ |
| Edge Function | — | — |
| Gaps | — | — |
```
