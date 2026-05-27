# 05 Security & Privacy (IA & Knowledge Base)

## Conformidade e LGPD
O motor de RAG e a base de conhecimento foram desenhados para proteger dados de clientes e agências de viagens.
- Toda informação ingerida possui uma flag obrigatória `pii_level`.
- Dados com PII *low* ou *high* **jamais** podem ter `approved_for_public_ai = true`.
- Exclusão de Org propaga (Cascade Delete) apagando instantaneamente seus chunks e embeddings do pgvector.

## Multi-tenant Hard-Enforcement
Não confiamos em verificações apenas na UI ou em filtros de query.
- Todas as tabelas RAG (`knowledge_chunks`, `knowledge_embeddings`, `ai_agent_runs`) possuem `ENABLE ROW LEVEL SECURITY`.
- Para acessar embeddings de uma Org B usando chave da Org A, o banco barra silenciosamente retornando zero linhas.

## WORM Storage (Cofre Imutável)
O ecossistema jurídico da agência (`contract_vault_records`) opera como um cofre de dados imutáveis (Write Once, Read Many).
- Um *Trigger Before Update/Delete* levanta exceção caso qualquer agente tente apagar ou modificar um contrato assinado.
- Estes arquivos **nunca** alimentam o motor de RAG para evitar vazamento semântico acidental.

## Shadow Tokens B2C
Clientes que abrem tickets, entram no chat IA ou assinam contratos, muitas vezes não possuem conta logada no Supabase Auth.
- Geramos UUIDs (Shadow Tokens) armazenados em localStorage (`turis_b2c_shadow_token`).
- Estes tokens permitem correlacionar sessoes (ex: agrupar tickets do mesmo usuário) mas expiram se limpos, preservando privacidade e impedindo cross-site tracking excessivo.
