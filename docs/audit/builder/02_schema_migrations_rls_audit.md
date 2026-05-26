# Auditoria de Tabelas, Schemas e RLS


Auditoria profunda sobre a existência física de tabelas, RLS e políticas de segurança aplicadas no Supabase.

## 📊 1. Mapeamento de Tabelas Reais

### Tabela `builder_projects`
- **Existe?** SIM
- **Colunas**: `id` (UUID, PK), `org_id` (UUID, FK para organizations), `site_id` (UUID, Nullable), `project_type` (TEXT: website/linkbio/blog), `title` (TEXT), `current_version_id` (UUID, FK para builder_versions), `view_count` (INT, Default 0), `created_at` (TIMESTAMPTZ).
- **Índices**: `builder_projects_org_id_project_type_idx` (Unique).
- **RLS Habilitado?** SIM.
- **Políticas**:
  - `Select`: Público/anônimo pode ler para permitir a exibição pública do site.
  - `All`: Usuários autenticados pertencentes ao mesmo `org_id` do projeto.

### Tabela `builder_versions`
- **Existe?** SIM
- **Colunas**: `id` (UUID, PK), `project_id` (UUID, FK para builder_projects), `version_number` (INT), `frame_schema` (JSONB: SEO metaTitle, description, slug), `content_schema` (JSONB: lista de blocos), `design_tokens` (JSONB), `render_snapshot` (JSONB), `status` (TEXT: published/draft), `created_by` (UUID, FK para auth.users), `created_at` (TIMESTAMPTZ).
- **RLS Habilitado?** SIM.
- **Políticas**:
  - `Select`: Público pode selecionar apenas versões com status = 'published'.
  - `All`: Apenas usuários autenticados pertencentes à agência proprietária do projeto.

### Tabela `news_article_versions`
- **Existe?** SIM (Criada na migração SQL `20260526000001_create_news_article_versions.sql`).
- **Colunas**: `id` (UUID), `article_id` (UUID), `version_number` (INT), `title` (TEXT), `raw_excerpt` (TEXT), `raw_content` (TEXT), `image_url` (TEXT), `ai_summary` (TEXT), `ai_short_summary` (TEXT), `ai_bullets` (JSONB), `ai_tags` (JSONB), `status` (TEXT), `created_by` (UUID), `created_at` (TIMESTAMPTZ).
- **RLS Habilitado?** SIM.
- **Políticas**:
  - `news_article_versions_select_policy`: Permite select se o usuário tiver acesso ao artigo de origem (da mesma agência ou escopo 'master').
  - `news_article_versions_all_policy`: Permite gerenciamento (insert/update/delete) apenas para agentes da agência proprietária ou `super_admin`.

## ⚙️ 2. Triggers e Hooks
- **updated_at**: Trigger automático configurado em `builder_projects` e `news_articles` para atualizar data de modificação.
- **increment_project_view**: Função RPC cadastrada como `SECURITY DEFINER` que incrementa de forma isolada e segura o contador `view_count` em `builder_projects` sem exigir privilégios de gravação para usuários anônimos.

