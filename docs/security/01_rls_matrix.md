# RLS Matrix (Row Level Security)

A arquitetura anti-hacker do Turis Agências baseia-se pesadamente na negação de confiança ao Cliente/Navegador. Tudo passa pelo RLS do Postgres.

## Core Rule: Nunca confie no JSON Body
Se o front enviar: `{"org_id": "outra_agencia", "name": "Hack"}` para salvar um lead.
**Política RLS de INSERT:**
```sql
CREATE POLICY "org_insert_policy" ON leads
FOR INSERT
WITH CHECK ( org_id = (select auth.user_org_id()) );
```
Isso faz com que o Postgres jogue erro 403 se o org_id do body diferir do org_id do Token Assinado pelo servidor.

## RLS por Módulos

### 1. CRM e Clients
- **Agentes**: `SELECT` permitido apenas se `assigned_to = auth.uid()` ou se `org_id` coincidir E eles possuírem flag de leitura global da equipe no `user_roles`.
- **Proprietários**: `SELECT` livre para todos de seu `org_id`.

### 2. Builder (CMS)
- **Leitura Pública**: `SELECT` permitido na tabela `builder_page_versions` apenas onde `status = 'published'`. O `builder_pages` public data fica aberto sem token. Rascunhos exigem token JWT.

### 3. Faturamento & Pagamentos
- RLS rigoroso em `agent_commission_entries`. Um agente nunca pode fazer `UPDATE` no status do pagamento que define o recebimento da sua comissão.
