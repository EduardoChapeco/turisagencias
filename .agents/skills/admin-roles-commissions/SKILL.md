---
name: admin-roles-commissions
description: Auditar isolamento de admin global vs agência, roles, permissões e motor de comissões.
---

# Admin Roles & Commissions Auditor

## Roles no Sistema

| Role | Escopo | Acesso |
|------|--------|--------|
| super_admin | Global (todas as orgs) | Admin Master |
| org_admin | Uma org | Admin Agência |
| agent | Uma org | Painel Agente |
| finance | Uma org | Módulo Financeiro |
| support | Uma org | CRM + Clientes |
| public | Sem auth | Apenas conteúdo público |

## Checklist de Isolamento

- [ ] Super admin vê dados de TODAS as orgs?
- [ ] org_admin NÃO vê dados de outra org?
- [ ] Agente NÃO vê comissão de outros agentes?
- [ ] Agente NÃO vê over/margem?
- [ ] Finance vê totais mas NÃO configurações de sistema?
- [ ] Rotas de admin master protegidas por `RoleGuard allow=['super_admin']`?

## Motor de Comissões a Auditar

### Regras (agent_commission_rules)
- Meta mensal até R$100.000 → 1% base
- Meta mensal acima R$100.000,01 → 1,5% base
- Over bruto → desconta taxa de operadora quando pagamento = cartão
- Over líquido comissiona 30%
- Configurável por org/agente/período

### Cálculo
- NUNCA calculado no frontend
- Calculado via trigger DB ou RPC server-side
- `protect_commission_tampering()` trigger ativo?

## Saída Obrigatória

`docs/admin/roles_commissions_audit.md`
