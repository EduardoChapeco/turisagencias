# 00 Memory Architecture

## Visão Geral do RAG para Agências de Turismo
Em um contexto SaaS de turismo B2B2C, a IA Contextual (RAG) funciona como um cérebro operacional que serve múltiplos propósitos: atende clientes no portal B2C (chat público), auxilia agentes B2B na criação de roteiros, sugere conteúdos para o blog, e automatiza atendimento nível 1 (FAQ/Suporte).

A diferença crucial do nosso sistema é o isolamento multi-tenant: cada organização (agência) possui um banco de vetores estritamente separado via Row Level Security (RLS) no PostgreSQL (pgvector).

## Fluxo de Processamento (Pipeline de Ingestão)
1. **Documento:** Um artigo, página do builder, guia de destino ou FAQ é criado/publicado.
2. **Chunking:** O texto é quebrado em partes menores (chunks) mantendo coerência semântica e limites de tokens do embedding.
3. **Classificação de Privacidade:** Cada chunk recebe uma tag obrigatória (`pii_level: 'none' | 'low' | 'high'`) e o flag `approved_for_public_ai`.
4. **Embedding:** Uma chamada à API da OpenAI (text-embedding-3-small) gera um vetor de 1536 dimensões.
5. **Armazenamento:** O vetor é gravado na tabela `knowledge_embeddings` (com `org_id` garantindo isolamento) usando pgvector.

## Fluxo de Recuperação (Retrieval)
1. Usuário envia uma pergunta.
2. Sistema converte a pergunta em vetor.
3. Função RPC `match_knowledge_chunks` calcula similaridade de cosseno (Cosine Similarity).
4. **Filtro de Segurança Rígido:** A query de busca obriga `org_id = current_org` e, se a IA for pública, exige `approved_for_public_ai = true` e `pii_level = 'none'`.
5. O LLM recebe o prompt de sistema condicionado pelo `agency_tone_profiles` + contexto recuperado + pergunta do usuário.

## Perfis de Tom (agency_tone_profiles)
Cada agência define:
- Como a IA deve falar (formal, descolada, direta).
- Mensagens de saudação e fallback ("Não encontrei isso, chame no WhatsApp").
- **Tópicos Proibidos:** Um array rigoroso repassado via System Prompt instruindo o LLM a NUNCA abordar assuntos como: margens, comissão interna e fornecedores B2B não-white-label.
