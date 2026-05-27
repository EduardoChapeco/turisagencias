# Plano de Refatoração (Roadmap)

Baseado nos gaps críticos e "fakes" encontrados, proponho os seguintes Pull Requests pequenos e isolados para alcançar o nível de produção desejado (CMS Real).

## PR-01: Correção do Schema Drift (Backend vs Frontend)
- **Escopo:** Sincronizar o `VisualBuilder.tsx` para usar o padrão da migration `omega_v7`.
- **Arquivos:** `VisualBuilder.tsx`, `useBuilderStore.ts`.
- **Ação:** Trocar inserts e selects de `builder_projects` para `builder_sites` e `builder_pages`. Inserir suporte ao site_id/page_id.

## PR-02: Bundle Optimization & Lazy Loading
- **Escopo:** Evitar que o navegador carregue >85 blocos de uma vez.
- **Arquivos:** `src/components/builder/blocks/index.ts`, `registry.ts`.
- **Ação:** Separar o `renderComponent` usando `React.lazy()`. O `settingsComponent` e meta-dados continuam síncronos.

## PR-03: Real Drafts e Autosave
- **Escopo:** Garantir que nenhuma alteração seja perdida em caso de refresh.
- **Arquivos:** `useBuilderStore.ts`, `VisualBuilder.tsx`.
- **Ação:** Criar um autosave debounce de 3 segundos que faz upsert na tabela `builder_page_versions` com status = `draft_snapshot`. O botão "Publicar" duplica e altera para `published`.

## PR-04: Refatoração do LinkBio (Remoção do Fake)
- **Escopo:** Permitir URLs customizadas e tracking.
- **Arquivos:** `LinkBioButtonListBlock.tsx`.
- **Ação:** Modificar o schema do Inspector para receber array de objetos reais (text, url) e alterar renderização para habilitar evento de clique integrando com a tabela `builder_analytics_events`.

## PR-05: CMS Dinâmico para o Blog
- **Escopo:** Acabar com o mock estático do Blog.
- **Arquivos:** `BlogPostGridBlock.tsx`, Edge Functions.
- **Ação:** Usar React Query ou Supabase Client para dar `select` nativo na tabela de `blog_posts` / `news_article_versions`, substituindo a prop estática.

## PR-06: Acessibilidade do Editor (A11y)
- **Escopo:** Permitir uso do drag-and-drop por teclado.
- **Ação:** Inserir bibliotecas focadas em a11y como `@dnd-kit/core` caso o atual não suporte. Adicionar `aria-labels` nos botões do `BuilderRightPanel`.
