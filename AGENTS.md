# AGENTS.md — Turis Agências

## 1. Produto

Turis Agências é uma plataforma SaaS multi-tenant para agências e mini-operadoras de turismo.

Fluxo canônico completo:
Lead → CRM → Cotação → Proposta → Aceite → Reserva → Formulário → Contrato → Pagamento → Voucher → Embarque → Pós-venda → Comissão

Módulos ativos:
- Site Builder (CMS Narrativo com blocos, versionamento, publicação)
- Blog / Portal de Notícias / Linkbio
- Central de Ajuda (artigos, FAQs, tickets, status)
- IA Contextual / RAG (chat público, scoring de leads, geração de roteiros)
- CRM (leads, clientes, kanban, fichas)
- Cotações (motor Python, cenários, scoring)
- Propostas (editor, PDF, aceite)
- Contratos (templates, assinatura eletrônica, cofre imutável)
- Vouchers (OCR, gerador, WhatsApp)
- Grupos / Embarques / Portais do Viajante
- Financeiro / Comissões (motor server-side)
- Admin Agência + Admin Master (isolamento rígido)

## 2. Regras Absolutas de Desenvolvimento

1. NUNCA declarar funcionalidade como real sem prova no banco de dados.
2. NUNCA usar mock, Math.random() ou dados hardcoded em produção.
3. NUNCA misturar painel de admin global com painel de agente/agência.
4. NUNCA expor service_role no client-side.
5. NUNCA bypassar RLS — org_id deve vir de auth.user_org_id(), nunca do payload do cliente.
6. NUNCA editar tudo de uma vez — PRs focados por domínio.
7. SEMPRE gerar Artifact de plano antes de refatorar.
8. SEMPRE criar PRs pequenos e reversíveis.
9. SEMPRE rodar build + typecheck + teste antes de considerar completo.
10. SEMPRE atualizar docs após implementação.
11. NUNCA apagar arquivos sem inventário prévio (use repo-archaeologist skill).
12. NUNCA alterar schema sem migration SQL versionada.
13. NUNCA expor dados de comissão, over ou margem para o agente ou público.
14. NUNCA publicar conteúdo de IA sem aprovação humana.

## 3. Design System (OMEGA v6.5 / Bento Grid)

- UI flat/premium — zero sombras pesadas (apenas Radix dialogs/poppers).
- Sidebar finíssima com ícones centralizados.
- Sem overflow lateral.
- Tokens obrigatórios: `--vj-*` definidos em `src/index.css`.
- Sem estilos hardcoded — sempre tokens ou classes utilitárias.
- Componentes: Radix UI via Shadcn.
- Tipografia: Inter (Google Fonts).
- Grid: Bento Grid em todas as dashboards.

## 4. Segurança

- Multi-tenant estrito por org_id.
- RLS habilitada em TODAS as tabelas.
- Tokens de acesso público com TTL e shadow_token para B2C.
- Storage: políticas por bucket.
- Logs em todas as ações críticas (cofre imutável para contratos).
- Roles server-side: super_admin, org_admin, agent, support, finance, public.
- IA pública: acessa APENAS knowledge_chunks com approved_for_public_ai=true.

## 5. Stack Tecnológica

- Frontend: React 18 + TypeScript + Vite
- Estilo: Vanilla CSS + tokens (sem Tailwind)
- Components: Shadcn/Radix UI
- State: Zustand (authStore, builderStore)
- Data fetching: TanStack Query
- Backend: Supabase (Postgres + Auth + Storage + Edge Functions)
- AI Engine: Python FastAPI (LangGraph) + pgvector
- PDF: jsPDF + html2canvas
- Drag & Drop: dnd-kit
- Maps: Leaflet
- Tests: Vitest + Playwright

## 6. Workflow Padrão

```
1. Auditar com skill relevante → gerar docs/audit/*.md
2. Planejar PR com pr-planner skill → gerar docs/roadmap/pr_plan.md
3. Pedir aprovação explícita do usuário
4. Implementar apenas o PR aprovado
5. Rodar: npm run build && npm run typecheck && npm test
6. Atualizar docs
7. Reportar evidências
```

## 7. Skills Disponíveis

Ver `.agents/skills/` para todos os skills disponíveis.

Skills atuais:
- `repo-archaeologist` — Inventariar repositório antes de refatorar
- `design-system-auditor` — Auditar conformidade com Design System OMEGA v6.5
- `page-contract-tracer` — Rastrear páginas até tabelas/RLS/Edge Functions
- `builder-cms-auditor` — Auditar Builder CMS (blocos, versões, publicação)
- `supabase-rls-redteam` — Red team de segurança RLS e multi-tenant
- `tourism-business-auditor` — Verificar fidelidade ao fluxo real de agência
- `contracts-vouchers-auditor` — Auditar contratos, vouchers, cofre imutável
- `admin-roles-commissions` — Auditar roles, isolamento e motor de comissões
- `rag-public-ai-auditor` — Auditar RAG, IA pública e vazamento de dados
- `pr-planner` — Transformar achados em PRs pequenos e reversíveis
- `supabase` — Integração Supabase (DB, Auth, Edge Functions, Storage)
- `supabase-postgres-best-practices` — Boas práticas Postgres/Supabase
- `voyage-database-architect` — Arquitetura de dados e formulários complexos
- `voyage-python-engine` — Integração Frontend ↔ Motor Python FastAPI
- `voyage-visual-auditor` — Auditoria visual UI/UX com modelos multimodais

## 8. Variáveis de Ambiente Críticas

- `SUPABASE_URL` — nunca hardcode
- `SUPABASE_ANON_KEY` — client-side seguro
- `SUPABASE_SERVICE_ROLE_KEY` — NUNCA no client
- `PYTHON_ENGINE_URL` — Motor IA FastAPI
- `OPENAI_API_KEY` / `GOOGLE_AI_KEY` — apenas Edge Functions
