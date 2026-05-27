# Auditoria RLS & Segurança (Red Team) — Reality Sync PR-10

## Objetivo
Garantir o isolamento multi-tenant absoluto em todas as tabelas do sistema (onde a agência A não consegue ver dados da agência B), garantir a segurança das Edge Functions e do bucket de storage.

## Verificações Críticas Realizadas
1. **`builder_projects` & `builder_versions`**:
   - `org_id` está protegido via RLS.
   - O RLS force a leitura de `org_id = (SELECT get_my_org_id())`.

2. **Comissões Financeiras**:
   - RLS implementado para `agent_commission_rules` e `agent_commission_entries`.
   - O Agent só vê as SUAS comissões, não as da agência inteira (restrição `agent_id = auth.uid()`).
   - O Admin Financeiro pode ver as comissões de toda a `org_id`.
   - Modificação impedida pelo frontend. Apenas a RPC `calculate_agent_commission` pode computar.

3. **Bucket de Contratos (`contract-documents`)**:
   - Configurado como Privado. Apenas Signed URLs com TTL funcionam para visualização.

4. **Automações**:
   - Fila `automation_jobs` blindada. Frontend só insere regra, quem roda é o ambiente de confiança (Edge Function `process-automations` / db trigger).

## Segurança de Inteligência Artificial (RAG Público)
**Vulnerabilidade Encontrada Anteriormente:** Risco da IA pública (ex: chat público do portal da agência) usar o knowledge base inteiro (incluindo contratos fechados e orçamentos confidenciais) para responder ao usuário final.

**Solução:**
Foi implementado um bloqueio RLS nos embeddings (ou via view filtrada), exigindo `approved_for_public_ai = true` para que um chunk da knowledge base vaze para a IA voltada para o cliente. As chaves globais (Super Admin) foram migradas para o `ExtendedSupabaseClient` de forma a remover `as any` casting e aumentar a tipagem em `AdminDashboard.tsx`.

## Próximos Passos (Ops)
1. Rodar red-teaming automatizado no ambiente de Staging.
2. Fazer bypass test com token B2C tentado ler `clients` (já bloqueado por default auth.role()).
