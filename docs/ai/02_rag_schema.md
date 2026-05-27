# 02 RAG Schema Documentation

## Tabelas Principais do Motor RAG

### `knowledge_sources`
Armazena a referência aos documentos originais antes do chunking.
- **Campos Chave:** `source_type` (faq, article, blog_post, page), `status`, `approved_for_public_ai`
- **RLS:** `org_id = auth.user_org_id()`

### `knowledge_chunks`
Armazena fragmentos de texto prontos para busca vetorial.
- **Campos Chave:** `content`, `content_hash` (SHA-256 para deduplicação), `pii_level` (none/low/high).
- **RLS:** Isolado por Org. Acesso público permitido apenas se `visibility='public' AND approved_for_public_ai=true AND pii_level='none'`.

### `knowledge_embeddings`
Guarda os vetores dimensionais. Extensão `pgvector` é obrigatória.
- **Campos Chave:** `embedding` (vector(1536))
- **Índice:** IVFFlat para busca de vizinhos mais próximos (Cosine Similarity).

### `ai_agents`
Define o escopo e personalidade de diferentes agentes na plataforma.
- **Campos Chave:** `agent_key`, `scope` (JSON de tabelas permitidas), `system_prompt`.

### `ai_agent_runs`
Audit trail absoluto de todas as requisições, respostas e chunks utilizados.
- **Campos Chave:** `user_message`, `assistant_response`, `source_chunks`, `latency_ms`.

### `agency_tone_profiles`
Restrições de comportamento de LLM aplicadas a cada agência.
- **Campos Chave:** `forbidden_topics` (array de strings que devem ser passadas no prompt negativo).
