# Publicação e Versionamento (Publish Versioning)

O processo de "Publicar" não pode simplesmente sobrescrever o estado atual em produção se quisermos ter rollback e histórico de versões.

## Fluxo de Estado

1. **Estado em Memória (`nodes`)**: 
   A cada arrasto ou edição de texto, o Zustand atualiza o estado em memória, debounced a cada segundo.
2. **Draft Automático**: 
   A cada 30 segundos de ociosidade, o sistema salva o JSON no banco de dados, vinculando-o ao ID do Projeto (`builder_projects`), na coluna `current_draft_json`.
3. **Publicação (Release)**: 
   Quando o usuário clica em **[Publicar]**:
   - Uma nova linha é inserida na tabela `builder_versions` (ou `builder_page_versions`).
   - O `content_schema` é salvo em definitivo.
   - O ID desta versão é gravado na tabela `builder_projects` (ou `builder_pages`) no campo `current_version_id` / `published_version_id`.
   - Isso garante que qualquer site público lendo a rota `/[agency_slug]/[page_slug]` consuma **exclusivamente** o JSON da tabela `builder_versions` associada ao `published_version_id`.

## Auditoria de Banco de Dados para Versionamento
- As tabelas devem separar completamente Rascunhos vs Publicados.
- Deve haver capacidade de Revert/Rollback carregando versões antigas do `builder_versions` de volta ao Draft.
