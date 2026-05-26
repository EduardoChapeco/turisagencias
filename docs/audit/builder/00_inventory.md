# Inventário Bruto do Builder


Este inventário apresenta o mapeamento físico dos componentes, rotas, hooks, tabelas e migrações do Builder e do CMS do Turis Agências.

## 🚀 1. Rotas do Builder e Páginas Públicas
No arquivo `src/App.tsx`, as seguintes rotas controlam a experiência do Builder e do renderizador público:
- **Editor do Builder**: Protegido sob a rota `/admin` / `/builder` ou embutido de forma contextual.
- **Visualização Pública do Site**: `/site/:slug` (Aponta para `PublicSiteView.tsx`)
- **Visualização Pública do LinkBio**: `/site/:slug/bio` (Aponta para `PublicSiteView.tsx` no modo LinkBio)
- **Visualização Pública do Blog**: `/site/:slug/blog` (Aponta para `PublicSiteView.tsx` no modo Blog)
- **Páginas Individuais de Pacotes**: `/g/:slug` ou `/g/:id` (Aponta para `PublicGroupTrip.tsx`)

## 🛠️ 2. Componentes e Páginas do Frontend
### Construtor de Sites e Lojas (Builder)
- [VisualBuilder.tsx](file:///c:/Users/aline/Music/turisagencias/src/components/builder/VisualBuilder.tsx) (43.53 kB) - Core do page builder, canvas de arrastar/adicionar seções, painel inspetor lateral e persistência de draft local.
- [MediaPicker.tsx](file:///c:/Users/aline/Music/turisagencias/src/components/builder/MediaPicker.tsx) (14.58 kB) - Seletor de imagens com suporte a upload real no Supabase Storage (`org-assets` bucket), biblioteca Unsplash e URLs diretas.

### Curadoria e Gestão de Conteúdo (CMS)
- [NewsCMS.tsx](file:///c:/Users/aline/Music/turisagencias/src/pages/NewsCMS.tsx) (26.09 kB) - Curadoria de artigos RSS, filtros, edição de metadados, reclassificação com IA, upload de capa com MediaPicker e painel de versionamento histórico.

### Renderizador Público (Renderer)
- [PublicSiteView.tsx](file:///c:/Users/aline/Music/turisagencias/src/pages/PublicSiteView.tsx) (26.45 kB) - Renderizador responsivo de sites, blogs e link-bios a partir do snapshot versionado do banco.

## 📦 3. Banco de Dados e Schemas
As tabelas que sustentam a persistência física no Supabase são:
1. `builder_projects`: Registra os canais de cada organização (tipo `website`, `linkbio` ou `blog`), contendo `slug`, `current_version_id` e a métrica de visualizações `view_count`.
2. `builder_versions`: Tabela de snapshots de versão que guarda o JSON schema dos blocos (`content_schema`), SEO (`frame_schema`) e chaves de design (`design_tokens`).
3. `news_articles`: Tabela principal que guarda artigos coletados por feed RSS e enriquecidos com IA.
4. `news_article_versions`: Tabela de histórico que guarda versões anteriores de artigos do CMS (com RLS e políticas seguras).
5. `organizations`: Guarda metadados da agência e o Brand Kit (`primary_color`, `secondary_color`, `brand_kit`).
6. `group_trips`: Tabela de pacotes reais consultada pelo bloco de viagens em grupo do builder.

## 🕵️ 4. Mocks, Hardcodes e Fallbacks Identificados
- **Rascunhos Locais**: O autosave debotado utiliza o `localStorage` do navegador para manter o draft local antes da publicação oficial. Chave: `turisagencias:builder:draft:USER_ID:PROJECT_TYPE`.
- **Valores Estáticos de Presets**: Presets curados de imagens do Unsplash para facilitar a escolha rápida de fotos de turismo de praia, hotelaria, voos e destinos.

