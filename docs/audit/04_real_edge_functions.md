# Auditoria de Edge Functions (FASE 0)

Existem 28 Edge Functions no projeto. Abaixo o status de algumas das principais relacionadas ao PRD:

## Builder / CMS
- `builder-publish-page`: REAL. Existe e publica páginas do builder.
- `builder-submit-form`: REAL. Processa formulários dos sites gerados.

## Automação & CRM
- `process-automations`: REAL. Base de varredura para trabalhos automatizados.
- `ext-process-quotation`: REAL. Processa extensões/cotações de terceiros.
- `build-proposal`: REAL. Gera as propostas em PDF/dados.

## Inteligência Artificial
- `ai-chat-agent`, `public-ai-chat`: REAL. Respondem ao cliente ou internamente.
- `trigger-python-engine`: REAL. Integração com IA Squads.

## Auth / Sistema
- `admin-auth`: REAL. Camada de autenticação admin separada.

*Todas as funções listadas acima possuem pasta real no repositório (`supabase/functions/`).*
