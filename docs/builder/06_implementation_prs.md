# PRs de Implementação Recomendados (Builder)

Para não sobrecarregar o sistema com uma alteração gigantesca (Big Bang), a implementação da reestruturação do CMS deverá ser feita nos seguintes Pull Requests (PRs) focados e pequenos:

### PR-01: Migração e Setup das Tabelas (Schema Update)
- Criar as migrations com as tabelas `builder_sites`, `builder_pages`, `builder_page_versions`.
- Mover os dados existentes da tabela temporária `builder_projects` (se houver dados úteis) para o novo formato unificado, mantendo consistência na separação Linkbio/Website/Blog.

### PR-02: O Motor de Publicação e Versionamento
- Refatorar o componente de Header do `VisualBuilder.tsx`.
- Desacoplar o botão "Publicar" do salvamento de draft automático em background.
- Implementar a Rota Pública (Renderizador), garantindo que ela consuma apenas da tabela `builder_page_versions` e não dos rascunhos voláteis.

### PR-03: Blocos Essenciais Nível 1
- Construir a primeira leva dos blocos listados na Auditoria, focando nos componentes estáticos.
- `hero_split`, `gallery` (básico), `faq_accordion`.
- Garantir os schemas rigorosos do Zustand para esses novos blocos.

### PR-04: Blocos Essenciais Nível 2 (Dinâmicos)
- Implementar o sistema de `data_bindings` básico onde blocos como `grid_services` ou `blog_grid` podem realizar o pull autônomo dos pacotes e posts publicados, respectivamente.

### PR-05: Red Team & CMS Hardening
- Implementar as medidas corretivas contra SSRF, limpar as saídas com o `DOMPurify` no rendering e bloquear protocolos `javascript:` em todos os URLs gerados no site público.
