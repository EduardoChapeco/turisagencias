# 01 Public Chat Policy

## Diretrizes e Limites de Acesso

O Chat IA Público é desenhado sob o princípio de Privilégio Mínimo (Zero Trust). Ele NUNCA deve expor a operação interna da agência.

### O Que a IA Pública PODE Acessar
O acesso é limitado estritamente às seguintes tabelas, sob as condições especificadas:
- `agency_public_profile`
- `faq_items` (somente onde `is_published=true`)
- `support_articles` (somente onde `status='published'`)
- `blog_posts` (somente onde `status='published'`)
- `builder_page_versions` (somente `status='published'`)
- `destination_guides`
- `knowledge_chunks` (onde `approved_for_public_ai=true` AND `pii_level='none'`)

### O Que a IA Pública NÃO PODE Acessar
Filtros em nível de banco de dados e RLS bloqueiam qualquer leitura às fontes:
- Tabelas financeiras: `agent_commission_entries`, `payments`, dados de markups e overs.
- Informações privilegiadas: `internal_notes`, dados administrativos.
- Documentação privada: `private_contracts`, anexos em `client_documents`, passaportes.

### Workflow de Aprovação Humana (Human-in-the-Loop)
Para que uma informação da agência sirva como contexto para a IA pública:
1. O texto é indexado em rascunho (`approved_for_public_ai=false`).
2. Uma rotina de segurança tenta sanitizar PIIs (Personably Identifiable Information).
3. O administrador da agência (role `org_admin`) deve revisar o chunk de conhecimento.
4. Ao aprovar, o sistema registra `approved_by` e `approved_at`, mudando a flag e disponibilizando o dado para o Retrieval.

### Citando Fontes (Citation Rules)
Toda resposta pública do Chat DEVE referenciar a origem da informação. Na camada da UI (`PublicAiChat.tsx`), exibe-se um rodapé: *"Baseado em [X] fontes(s) interna(s)"*.

### Rastreabilidade e Auditoria
As interações (tanto a requisição do usuário quanto a resposta do modelo e chunks recuperados) são logados na tabela `ai_agent_runs`, utilizando `session_id` gerado via `shadow_token` (permitindo rastreabilidade sem autenticação rígida B2C).
