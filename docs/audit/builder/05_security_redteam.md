# Auditoria de Segurança (Red Team)


Auditoria técnica focando em mitigação de riscos OWASP, vazamento de chaves e controle de acesso multi-tenant.

## 🛡️ 1. Isolamento Multi-Tenant e RLS
- **builder_projects & builder_versions**: Ambas as tabelas utilizam políticas estritas de RLS. Um tenant autenticado só pode modificar projetos ou versões cuja coluna `org_id` corresponda ao retorno de `public.get_my_org_id()`.
- **news_article_versions**: As políticas criadas na migração limitam qualquer comando de escrita (Insert/Update/Delete) a usuários que pertençam à organização dona do artigo, prevenindo a adulteração de histórico de outras agências.

## 🛡️ 2. Sanitização de Conteúdo & XSS
- **Injeção de Links**: Implementada a função de sanitização `sanitizeHref` no renderizador público (`PublicSiteView.tsx`) e links de botão. Qualquer tentativa de salvar URLs que iniciem com o protocolo `javascript:` é interceptada e convertida para `#`, prevenindo execuções arbitrárias de código via clicks do visitante.
- **dangerouslySetInnerHTML**: O projeto não utiliza renderização perigosa de HTML direto do usuário nas páginas públicas do site builder, evitando brechas comuns em editores visuais.

