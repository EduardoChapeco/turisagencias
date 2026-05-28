# Auditoria RAG e IA Pública (PR-09)

## 1. Tabelas de Conhecimento (RAG)
**Status:** MIGRATION CRIADA, CÓDIGO DESATUALIZADO
- A migration `20260527000007_omega_v8_rag_knowledge.sql` implementa uma arquitetura OMEGA v8 incrivelmente robusta para RAG.
- Ela cria as tabelas `knowledge_sources`, `knowledge_chunks`, `knowledge_embeddings` e `ai_agent_runs`.
- Adiciona proteções em nível de banco (`approved_for_public_ai`, `pii_level`).
- As políticas de RLS garantem isolamento total de `org_id`.

## 2. Edge Function `ai-chat-agent`
**Status:** VULNERABILIDADE & DESALINHAMENTO
- A Edge Function `/functions/ai-chat-agent/index.ts` ainda está consultando a tabela antiga/inexistente `ai_knowledge_base`.
- A função NÃO grava o log de auditoria em `ai_agent_runs` (não há registro de quantos tokens foram gastos ou que respostas a IA deu).
- Ela utiliza `service_role` key e, portanto, bypassa RLS, precisando explicitamente adicionar as cláusulas de isolamento.
- A query atual também não tem filtro vetorial (usa apenas `.limit(3)` mockado ao invés de buscar por similaridade com pgvector).

## 3. Blog e Central de Ajuda
**Status:** REAL
- A migration já implementou triggers de proteção: `enforce_blog_approval` que impede a publicação de posts (alterando para status `published`) sem que haja aprovação humana (`approved_by IS NOT NULL`).

## 4. Plano de Ação (PR-09)
Precisamos sincronizar a realidade da Edge Function de Chat com a realidade do Banco de Dados:
1. Refatorar `ai-chat-agent/index.ts` para buscar em `knowledge_chunks` com filtro explícito de `approved_for_public_ai = true` e `visibility = 'public'`.
2. Adicionar o log da interação em `ai_agent_runs`, guardando `user_message`, `assistant_response`, `session_id`, `input_tokens` e `output_tokens`.
3. Garantir o bypass de RLS seguro (filtrando `org_id = orgId`).
