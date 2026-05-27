# Colunas Críticas
> Baseado no `types.ts` atual.

- **organizations**: `id`, `name`, `slug`, `created_at`
- **profiles**: `id`, `org_id`, `role`, `first_name`, `last_name`
- **builder_projects**: `id`, `org_id`, `site_id`, `project_type`, `current_version_id`, `view_count`
- **builder_versions**: `id`, `project_id`, `version_number`, `frame_schema`, `content_schema`

## GAPs Identificados
- Várias colunas no `builder_projects` necessárias para a canonicalização (ex: `published_at`, `is_published`) não existem ou diferem do planejado.
