# Matriz UI ↔ Hook ↔ Service ↔ DB


A matriz abaixo cruza cada ação interativa do Builder/CMS com sua cadeia completa de execução técnica (UI -> Hook -> Service -> DB -> RLS -> Reidratação).

| AÇÃO | UI/COMPONENTE | HANDLER | HOOK/STORE | SERVICE | EDGE/RPC | TABELA/BUCKET | COLUNAS | RLS | REIDRATA? | TESTE | STATUS |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1. Carregar Editor | `VisualBuilder` | `useEffect` | `useAuthStore` | - | - | `builder_projects` / `builder_versions` | `org_id`, `project_type`, `content_schema` | SELECT baseada em `org_id` | SIM | `public-site-view.test.tsx` | REAL |
| 2. Adicionar Bloco | `VisualBuilder` | `handleAddBlock` | `setBlocks` | - | - | - | estado local (`blocks` array) | - | SIM | `public-site-view.test.tsx` | REAL |
| 3. Remover Bloco | `VisualBuilder` | `handleDeleteBlock` | `setBlocks` | - | - | - | estado local (`blocks` array) | - | SIM | `public-site-view.test.tsx` | REAL |
| 4. Editar Texto/Item | `VisualBuilder` | `handleUpdateBlock` | `setBlocks` | - | - | - | estado local (`blocks` array) | - | SIM | `public-site-view.test.tsx` | REAL |
| 5. Upload Imagem | `MediaPicker` | `handleFileUpload` | - | `supabase.storage` | - | Storage bucket `org-assets` | publicUrl | ALL authenticated | SIM | `media-field.test.tsx` | REAL |
| 6. Biblioteca Unsplash| `MediaPicker` | `onChange` | - | - | - | - | preset URL | - | SIM | `media-field.test.tsx` | REAL |
| 7. Salvar Draft Local | `VisualBuilder` | `useEffect` Auto-save | - | - | - | `localStorage` | draftKey | - | SIM | `public-site-view.test.tsx` | REAL |
| 8. Publicar Canal | `VisualBuilder` | `handlePublish` | - | `supabase.from` | - | `builder_versions` / `builder_projects` | `content_schema`, `current_version_id` | INSERT RLS baseada em `org_id` | SIM | `public-site-view.test.tsx` | REAL |
| 9. Sugerir SEO via IA | `VisualBuilder` | `handleSuggestSEO` | - | `supabase.functions` | `suggest-seo` | - | - | - | NÃO | - | PARCIAL |
| 10. Abrir Canal Público | `PublicSiteView` | `useEffect` | - | `supabase.from` | `increment_project_view` | `builder_projects` / `builder_versions` | `view_count`, `content_schema` | SELECT público / anônimo | SIM | `public-slugs.test.ts` | REAL |
| 11. Incrementar View | `PublicSiteView` | `useEffect` | - | `supabase.rpc` | `increment_project_view` | `builder_projects` | `view_count` | Security Definer RPC | NÃO | `public-site-view.test.tsx` | REAL |
| 12. Listar Pacotes Reais | `VisualBuilder` / `PublicSiteView` | - | `useGroupTrips` | `supabase.from` | - | `group_trips` | `title`, `price_per_pax`, `is_public` | SELECT pública e tenant | SIM | `public-pages.test.tsx` | REAL |
| 13. Salvar Notícia | `NewsCMS` | `handleSaveArticleEdits`| `updateArticleMut` | - | - | `news_articles` / `news_article_versions` | `image_url`, `status`, `version_number` | UPDATE baseada em `org_id` | SIM | - | REAL |
| 14. Histórico CMS | `NewsCMS` | `fetchVersions` | `useEffect` | - | - | `news_article_versions` | `version_number`, `created_at` | SELECT baseada em `org_id` | SIM | - | REAL |
| 15. Restaurar Versão CMS| `NewsCMS` | `handleRestoreVersion`| `updateArticleMut` | - | - | `news_articles` / `news_article_versions` | todas as colunas | ALL baseada em `org_id` | SIM | - | REAL |

*Nota: Todas as principais ações interativas do builder e do blog CMS persistiram e reidrataram com sucesso, atestando conformidade funcional no padrão de engenharia OMEGA.*

