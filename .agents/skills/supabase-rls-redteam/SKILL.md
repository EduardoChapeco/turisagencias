---
name: supabase-rls-redteam
description: Atacar o sistema como um adversário para encontrar falhas de RLS, vazamento de dados multi-tenant e bypasses de permissão.
---

# Supabase RLS Red Team

## Missão
Simular ataques reais e documentar vulnerabilidades. NÃO explorar em produção — apenas auditar o código e as policies.

## Vetores de Ataque

### 1. Injeção de org_id
- O cliente envia `org_id` no body do request.
- A policy usa `org_id = $1` do payload em vez de `auth.user_org_id()`?
- **Risco:** Agente de org A acessa dados de org B.

### 2. Troca de ID
- O cliente envia `id` de um recurso de outra org.
- A query filtra apenas por `id` sem checar `org_id`?

### 3. Bypass via supabase.from() sem RLS
- Alguma tabela sem `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`?

### 4. Storage sem policy
- Buckets com acesso público irrestrito?
- Upload sem validação de `org_id` no path?

### 5. Edge Function com service_role exposta
- Alguma Edge Function expõe `SUPABASE_SERVICE_ROLE_KEY` em resposta?

### 6. Acesso a dados financeiros
- Um agente consegue ler `agent_commission_entries` de outro agente?
- A policy verifica `agent_id = auth.uid()` para SELECT?

### 7. Publicação sem role
- Um usuário role=agent consegue publicar um site sem ser org_admin?

## Saída Obrigatória

`docs/security/rls_redteam.md`

Formato:
```
## Vetor: [nome]
- Tabela/Endpoint afetado:
- Reprodução (pseudocódigo):
- Status: VULNERÁVEL / PROTEGIDO / NÃO TESTADO
- Fix recomendado:
```
