# 03 Support Center Architecture

## Visão Pública B2C
- **Rotas:** `/[org_slug]/ajuda`
- Os clientes acessam FAQs e Artigos (knowledge base) isolados por Org, buscando resolver dúvidas antes de acionar a agência.
- **UI:** Inclui caixa de busca unificada, navegação por categorias (Pagamentos, Embarque, Contratos) e feedback de utilidade (👍/👎).

## Módulo de Tickets (support_tickets)
- Formulário público gera entrada na tabela sem exigir autenticação, usando `shadow_token` via LocalStorage para rastrear a sessão do usuário.
- O campo `ticket_number` é gerado via Trigger de Banco de Dados (`TUR-2026-0001`), garantindo integridade.
- Status permitidos: `open`, `in_progress`, `resolved`, `closed`.

## Base de Conhecimento
- **support_articles:** Permite rich-text (HTML) sanitizado. Organizados por categorias e tags.
- **faq_items:** Simples Q&A (Question & Answer), renderizado geralmente como Accordions na interface.
- Ambas as entidades podem alimentar automaticamente o motor RAG (tabela knowledge_sources) dependendo das configurações da Agência.
