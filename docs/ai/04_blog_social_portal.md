# 04 Blog & Social Portal Architecture

## Workflow Editorial Assistido por IA
A plataforma permite que as agências publiquem conteúdo de forma profissional e escalável, apoiadas por IA:
1. **Ingestão:** Admins podem fornecer URLs (notícias de turismo, guias do Tripadvisor).
2. **Draft (AI):** A IA lê o conteúdo original (via Edge Function) e gera um resumo original, sugerindo tags, slug e SEO metadata. NUNCA realiza cópia (plágio evitado no prompt).
3. **Revisão:** O artigo é salvo como rascunho. **Trigger DB bloqueia publicação sem `approved_by` humano.**
4. **Publicação:** O artigo aparece no site público e alimenta o `knowledge_sources` para o motor RAG interno/público.

## SEO e Linkbio
- Todos os posts suportam tags `<meta>` customizadas (`seo_title`, `seo_description`).
- Posts recentes podem ser consumidos por um componente do Linkbio (integrado via CMS).
- CTAs (Call to Action) customizáveis (`cta_text`, `cta_url`) guiam o tráfego do blog para conversões no WhatsApp ou páginas de pacotes.

## Notas Editoriais Internas
- Autores e Agentes podem trocar mensagens e aprovações privadas usando a tabela `blog_post_notes`.
- Estas notas são bloqueadas pela RLS e jamais renderizadas no frontend público.
