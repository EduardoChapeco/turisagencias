---
name: rag-public-ai-auditor
description: Auditar memória RAG, IA pública, central de ajuda, blog e conteúdo. Garantir que IA pública só use conteúdo aprovado.
---

# RAG & Public AI Auditor

## Missão
A IA pública NUNCA pode vazar: comissão, over, margem, dados internos, documentos de outros clientes, chaves, logs técnicos, rascunhos privados.

## Fontes Permitidas para IA Pública
```
agency_public_profile
faq_items (published=true)
support_articles (published=true)
blog_posts (status='published')
builder_page_versions (status='published')
destination_guides
knowledge_chunks (approved_for_public_ai=true, pii_level='none')
```

## Fontes PROIBIDAS
```
agent_commission_entries
agent_commission_rules
contract_vault_records (content)
client documents
profile.phone (privado)
internal_notes
admin_settings
api_keys
supabase secrets
```

## Checklist

- [ ] knowledge_chunks tem campo `approved_for_public_ai boolean`?
- [ ] knowledge_chunks tem campo `pii_level enum('none','low','high')`?
- [ ] Edge Function de chat público filtra APENAS chunks aprovados?
- [ ] Resposta da IA cita a fonte (source_type + source_id)?
- [ ] Logs de chamada IA em `ai_agent_runs`?
- [ ] Isolamento por org_id nos embeddings?
- [ ] Aprovação humana antes de adicionar chunk ao RAG público?

## Saída Obrigatória

`docs/ai/rag_public_ai_audit.md`
