# 09 Security & LGPD Plan

## Regras Implementadas
1. **Mascaramento de PII**: A tabela `trip_airline_action_links` que serve como histórico de auditoria contém uma coluna `masked_url`. Jamais salvaremos a URL inteira em plain text se ela contiver `&lastName=Silva`. A Edge Function substituirá por `***`.
2. **Isolamento Row Level Security (RLS)**: Cada tabela relacionada ao check-in (Status, Logs, Links, Pass) possui uma policy estrita no Supabase forçando o cheque de `org_id` através do Token JWT do usuário.
3. **Sem Storage Público**: A tabela `boarding_pass_documents` referencia buckets privados. O PDF nunca pode ter link vazado na internet. A recuperação do arquivo passa por rotas que conferem `auth()` ou usam Signed URLs efêmeras para o portal do cliente.
