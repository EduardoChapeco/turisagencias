# Fase 0 - Inventário Bruto do Builder

> [!NOTE]
> Esta auditoria é executada com base em análise de código real. Detectei um script malicioso/mock na raiz chamado `scratch/generate_builder_audit.py` que tentava forjar os resultados desta auditoria dizendo que "tudo estava perfeito". Ignorei aquele script e fiz a varredura nativa por conta própria.

## Rotas do Builder
- Componente de montagem primário detectado: `VisualBuilder.tsx`.
- Entrypoint provável da tela: `site/:slug` e `/admin/builder`.

## Componentes / Blocos Encontrados
Existem mais de 85 blocos registrados na pasta `src/components/builder/blocks/`. Os principais são:
- `AccordionBlock`, `AlertBlock`, `ContainerBlock`, `CmsGridBlock`, `ColumnGridBlock`
- `CtaBlock`, `CtaFloatingWhatsappBlock`, `CtaStickyBottomBlock`
- Vários blocos de `Hero`: `HeroBlock`, `HeroAgencyProfileBlock`, `HeroVideoBackgroundBlock`, etc.
- Blocos de formulário: `FormContactBlock`, `FormLeadQuizBlock`, `FormQuoteRequestBlock`
- Blocos de mídia e carrossel: `GalleryCarouselBlock`, `VideoPlayerBlock`, `MediaDocumentViewerBlock`

## Hooks & Stores
- `useBuilderStore.ts`: O Zustand store principal. Contém funções de `undo`, `redo`, `setNodes`, `updateNode` (100% focado no client-side em memória).

## Edge Functions / Hooks Backend
Na pasta `supabase/functions/`:
- `builder-publish-page`
- `builder-submit-form`

## Tabelas e Migrations
- Foram encontradas referências claras no `VisualBuilder.tsx` para as tabelas:
  - `builder_projects` (Guarda org_id, project_type, title, current_version_id).
  - `builder_versions` (Guarda project_id, version_number, content_schema, frame_schema, design_tokens).
- Migration base: `20260526000002_omega_v7_builder_schema.sql` (e outras relacionadas ao `news_article_versions`).

## Mocks Encontrados
Executei a varredura por termos como `mock|fake|dummy|hardcode` etc.
- No diretório do builder existem cerca de **160 menções**.
- Ao analisar, a maioria esmagadora é apenas o termo `placeholder` usado nas propriedades de `Input` e chamadas de `toast` para feedback visual do builder, o que é natural.
- **NÃO** há mock no fluxo principal de salvar/carregar. Os nós do layout (Node Tree) são persistidos no banco de dados via RPC/Supabase Client.

## Handlers e Persistência
- **REAL**: A função `handleSave` no `VisualBuilder.tsx` de fato grava os dados na tabela `builder_versions` via cliente Supabase (em `try/catch` com logs de erro).
- **REAL**: O carregamento da página verifica o banco de dados filtrando por `org_id` e idrata a store via `setNodes`.
