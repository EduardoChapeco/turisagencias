# Plano de Remoção de `any` (PR-03)

| Arquivo | Tipo Cast | Causa Raiz / Campo Ausente | Ação de Correção (Substituição) | Pode ser temporário? |
|---------|-----------|----------------------------|---------------------------------|----------------------|
| `src/pages/PublicTravelerInfo.tsx:6` | `supabase as any` | Tipagem incorreta do client | `supabase` já é tipado. Remover o cast. | NÃO |
| `src/pages/admin/AdminDashboard.tsx` | `.from('ai_tasks' as any)` | Tabela falta em `types.ts` ou erro de inferência | Gerar novos tipos via Supabase CLI ou forçar cast seguro | NÃO |
| `src/pages/admin/AdminDashboard.tsx` | `.from('global_keys' as any)` | Tabela `global_keys` não existe nos types | Adicionar tabela via migration ou usar tipo correto | NÃO |
| `src/pages/TravelerPortal.tsx` | `catch (err: any)` | TS1196 catch tipado | Mudar para `unknown` e usar type guard ou `logError` | NÃO |
| `src/pages/Settings.tsx` | `.map((k: any)` | Array sem tipagem genérica | Tipar a resposta da API via TanStack Query | SIM (baixa prioridade) |

**Foco Principal**: Substituir TODOS os usos de `supabase as any` ou `.from(... as any)` por código type-safe.
