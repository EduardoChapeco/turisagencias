# Auditoria de Publicação e Versionamento


Auditoria dos fluxos de publicação, versionamento e snapshots de dados.

## 📦 1. Fluxo de Publicação e Snapshots
- **Drafts Locais**: Enquanto o usuário edita a página, as alterações são salvas automaticamente no `localStorage` sob o padrão `turisagencias:builder:draft:USER_ID:PROJECT_TYPE` com debounce de 1 segundo. Isso impede a perda de rascunhos em caso de fechamento do navegador.
- **Snapshots no Banco**: Ao clicar em **"Publicar"**, a aplicação realiza um insert na tabela `builder_versions` incrementando o `version_number` e gravando as listas JSON completas no `content_schema`.
- **Atualização de Versão**: O projeto atualiza o `current_version_id` na tabela `builder_projects`. A rota pública `PublicSiteView.tsx` apenas carrega a versão ativa publicada, garantindo que edições de rascunho em andamento não afetem o site de produção.

