# Matriz UI ↔ Hook ↔ Service ↔ DB

AÇÃO | UI/COMPONENTE | HANDLER | HOOK/STORE | SERVICE | EDGE/RPC | TABELA/BUCKET | COLUNAS | RLS | REIDRATA? | TESTE | STATUS
--- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ---
Criar site | VisualBuilder | handleSave | useBuilderStore | Supabase Client | N/A | builder_projects | id, org_id, title | Sim | Sim | Passou | REAL
Salvar draft | Toolbar | handleSave | useBuilderStore | Supabase Client | N/A | builder_versions | content_schema | Sim | Sim | Passou | REAL
Publicar | Toolbar | handleSave | useBuilderStore | Supabase Client | N/A | builder_projects | current_version_id | Sim | Sim | Passou | REAL
