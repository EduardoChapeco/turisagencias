# Automações — Reality Sync (PR-09)

## O Problema Original
A UI de automações (`/automations`) inseria regras na tabela `automation_rules`, mas não havia um motor real (job queue) agendando ou executando de fato esses eventos, gerando um estado de "cenografia".

## A Solução Real implementada
Criamos a tabela de fila de trabalhos assíncronos:
- `automation_jobs` (Fila real com `status = pending`, controle de retentativas `retry_count`, e tracking de erros).

## Arquitetura de Execução
1. **Trigger de Banco ou Cron**: Uma trigger no Postgres ou `pg_cron` varre as `automation_rules` e insere registros `pending` na tabela `automation_jobs`.
2. **Worker**: A Edge Function `process-automations` consome os jobs `pending`, muda o status para `processing`, executa a ação (disparar email, atualizar CRM, enviar webhook) e finaliza como `completed` ou `failed`.

Status: REAL (Schema e estrutura definidos. Worker existente).
