# Auditoria de Casts Perigosos (`as any`)

Mais de 400 usos de `as any` foram encontrados no código. Abaixo os críticos associados ao Supabase que mascaram o schema:

## Casts Críticos do Supabase
1. `src/pages/PublicTravelerInfo.tsx:6` - `const travelerInfoDb = supabase as any;`
2. `src/pages/admin/AdminDashboard.tsx`
   - `.from('ai_tasks' as any)`
   - `.from('global_keys' as any)`
   - `.from('ai_decision_logs' as any)`

## Outros Casts Comuns
- `src/pages/Settings.tsx` - `.map((k: any) => ...)`
- `src/pages/TravelerPortal.tsx` - `catch (err: any)` e `(i: any) => i.status === 'paid'`
- Formulários - `const defaultContent: any = type === 'text' ...`

## Ação (PR-03)
O plano `any-removal-plan.md` será criado para varrer os `supabase as any` de produção. Erros em catch blocks devem usar `import { logError }` em vez de tipar como `any`.
