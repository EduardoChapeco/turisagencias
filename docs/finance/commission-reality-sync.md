# Módulo Financeiro — Motor de Comissões Reality Sync

## Objetivo
Mover o cálculo de comissões do client-side para o server-side através de tabelas reais, RLS rigoroso e uma RPC dedicada.

## Tabelas Criadas
1. `agent_commission_rules`: Regras de comissão (porcentagem base, fixo, tiered, metas).
2. `agent_commission_periods`: Agrupamento mensal para fechamento e pagamento.
3. `agent_commission_entries`: Entradas individuais atreladas a uma venda (`quotation`, `group_booking`).
4. `agent_commission_adjustments`: Bônus, deduções manuais.

## Isolamento (RLS)
- O agente (`role = agent`) só tem permissão de leitura sobre SEUS PRÓPRIOS períodos e entradas (via `agent_id = auth.uid()`).
- O `org_admin` e `finance` podem ler e aprovar períodos de toda a organização.
- Nenhuma role pode "inserir" comissão diretamente pelo frontend via supabase-js sem passar pela RPC `calculate_agent_commission`.

## RPC: `calculate_agent_commission`
Aceita valores brutos, aplica a regra ativa (ex: tax do operador de over) e retorna JSONB. Previne adulteração no client-side.

**Status**: REAL (Aguardando deploy e rebuild de types.ts)
