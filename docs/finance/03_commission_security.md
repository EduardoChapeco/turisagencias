# Segurança do Módulo de Comissões

Comissões lidam com fluxo financeiro; não podem ser suscetíveis a interceptações.

## 1. RLS (Row Level Security) Restrito
```sql
-- Políticas na tabela agent_commission_entries
-- INSERT: Agente pode inserir, mas apenas passando os campos base (gross_sales, taxes). 
-- Um DB Trigger automaticamente irá zerar/recusar qualquer valor customizado passado no campo `final_commission` na requisição POST do frontend.
-- SELECT: Agente só pode ver WHERE agent_id = auth.uid()
-- SELECT ADMIN: Vê WHERE org_id = auth.user_org_id()
-- UPDATE: Apenas Financeiro pode atualizar, Agente não pode editar dados de repasse.
```

## 2. Bloqueio Retroativo
Se o período financeiro `agent_commission_periods.status` estiver `closed` ou `paid`, a RLS / Trigger bloqueará estritamente qualquer `UPDATE` em lançamentos deste período, forçando que ajustes sejam lançados no mês atual como créditos ou débitos.

## 3. Trilhas de Auditoria (Audit Logs)
Todo `UPDATE` manual feito pelo perfil do Financeiro num lançamento de comissão gera, via DB Trigger de After Update, uma cópia do JSON antigo e do JSON novo na tabela `agent_commission_audit_logs`. Ninguém pode `DELETE` desta tabela de auditoria.
