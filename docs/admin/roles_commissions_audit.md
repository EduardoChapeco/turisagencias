# Auditoria de Roles e Comissões (PR-07)

## 1. Roles no Sistema

A tipagem atual no frontend (`src/types/index.ts`) define `AppRole`:
`'super_admin' | 'org_admin' | 'agent' | 'support' | 'client'`

**Gap Encontrado:** O role `finance` não existe na tipagem do frontend, mas as policies RLS (`20260527020000_commission_core.sql`) e algumas lógicas de negócio esperam esse role para isolar painéis financeiros de `support` e `agent`. No frontend, as rotas financeiras estão agrupadas sob um `<AdminRole>` que permite `support`. Isso é um risco, pois suporte não deveria ter acesso a fluxos de pagamento e comissões.

## 2. Isolamento Admin Global vs Agência

O sistema possui duas camadas de Admin:
- **Master Admin (`super_admin`)**: Pode ver todas as `orgs` e acessar o painel em `/admin/dashboard`. Protegido pelo `<AdminMasterLayout>`.
- **Agency Admin (`org_admin`)**: Limitado à sua `org_id`.

**Validação RLS:** A tabela `organizations` e `profiles` estão devidamente isoladas. A função `get_my_org_id()` garante que a consulta no Supabase vaze apenas dados do `tenant` correto, mitigando bypass no frontend.

## 3. Motor de Comissões

**Tabelas Reais:**
- `agent_commission_rules`
- `agent_commission_periods`
- `agent_commission_entries`
- `agent_commission_adjustments`

**Validação de Isolamento (RLS e Lógica):**
- As policies de comissão garantem que agentes (`agent_id = auth.uid()`) só vejam suas próprias entradas de comissão (`agent_commission_entries`).
- `org_admin`, `super_admin` e `finance` podem ver todas as comissões da org (via JWT role `app_metadata ->> 'role'`).
- A comissão NÃO é calculada no frontend. Existe o RPC `calculate_agent_commission(p_org_id, p_agent_id, ...)` que centraliza a lógica das metas (base_percentage) e overrides (over_operator_tax).

## 4. Recomendações e Próximos Passos (PR-07)

1. Adicionar `'finance'` a `AppRole`.
2. Criar `<FinanceRole>` no router (`App.tsx`) para isolar rotas de comissão e faturamento (removendo o acesso indevido do `'support'`).
3. Revisar `CommissionsPanel.tsx` e `MyCommissions.tsx` para garantir que `MyCommissions` chama apenas a API com o `auth.uid()` sem passar `agent_id` manipulável.
4. Implementar a proteção de visualização do "Over" e margem líquida: O endpoint ou consulta do lado do cliente para a view do agente nunca deve selecionar `over_gross` ou `commission_over` sem permissão.
