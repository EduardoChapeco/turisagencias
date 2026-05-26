# Auditoria de Tabelas e Schemas

TABELA | EXISTE? | COLUNAS | RLS | POLICIES | TRIGGERS | STATUS
--- | --- | --- | --- | --- | --- | ---
builder_projects | Sim | id, org_id, project_type, current_version_id | Sim | org_id auth | set_updated_at | REAL
builder_versions | Sim | id, project_id, version_number, content_schema | Sim | org_id join | N/A | REAL
news_article_versions | Sim | id, article_id, content, created_at | Sim | auth | N/A | REAL
