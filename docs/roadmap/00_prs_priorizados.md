# Roadmap de Refatoração: Turis Agências

Esta é a lista priorizada de PRs (Pull Requests) desenhada para resolver os débitos técnicos e riscos arquitetônicos identificados durante a Fase 0 da Auditoria Master, seguindo a metodologia de pequenos incrementos testáveis.

---

## PR-01: Inventário e Documentação Base
**Objetivo:** Consolidar todos os relatórios da Fase 0 (visão geral, stack, design system, contratos de dados) em arquivos markdown permanentes na pasta `docs/`. Sem código funcional alterado.
**Arquivos:** Toda a árvore `docs/audit/` e `docs/roadmap/`.
**Riscos:** Nulo.
**Critério de Aceite:** Repositório documentado para onboarding de novos devs e guias arquitetônicos.

## PR-02: Design System, Layout Shell e Sidebar
**Objetivo:** Eliminar interfaces cartoonescas ou genéricas, padronizando a UI para um estilo "premium, técnico e calmo", conforme a Regra Visual Alvo.
**Arquivos:** `src/components/layout/Shell.tsx`, `src/components/layout/Sidebar.tsx`, arquivos CSS globais.
**Riscos:** Quebra de layouts em páginas específicas que não usavam o shell.
**Testes:** Auditoria visual com Skill multimodais.

## PR-03: Separação de Painéis (Super Admin, Admin Agência, Agente)
**Objetivo:** Criar e enforçar o isolamento de acessos. O painel global (Master) será isolado. Agentes verão apenas seus próprios leads e dashboards.
**Arquivos:** `src/pages/AdminLogin.tsx`, policies em RLS de auth e profiles, guardas de rota no frontend (`RequireAuth`, `RequireRole`).
**Riscos:** Bloquear acessos legítimos de diretores se o sync de roles falhar.
**Testes:** Teste end-to-end logando com as 3 personas diferentes.

## PR-04: Contratos de Dados UI ↔ DB (Schema Alignment)
**Objetivo:** Garantir que todos os campos pedidos na UI existam no banco e vice-versa, especialmente em Formulários e CRM.
**Arquivos:** Arquivos em `src/pages/KanbanBoard.tsx` e `supabase/migrations/`.
**Critério de Aceite:** `FormData` = `Schema` (Type Safety completo).

## PR-05: CRM Persistente e Permissões de Visibilidade
**Objetivo:** Eliminar perda silenciosa de dados no CRM Kanban. Garantir sync atômico com Supabase.
**Arquivos:** `src/hooks/useKanban.ts`, `src/pages/KanbanBoard.tsx`.
**Riscos:** Conflito de merge se dois agentes moverem o card juntos.
**Testes:** Drag and drop e refresh da página.

## PR-06: Estabilização do Core do CMS (Visual Builder)
**Objetivo:** Padronizar propriedades, default_props e tipagens em `BlockRegistry`.
**Arquivos:** `src/components/builder/core/` e todos os `blocks/`.
**Critério de Aceite:** O Builder carrega e edita os blocos sem memory leaks.

## PR-07: Publicação de Sites e Páginas Públicas
**Objetivo:** Garantir que o `PublicSiteView.tsx` leia o JSON final, use fallbacks e evite ataques XSS na renderização de conteúdo do usuário. *(Nota: Inicializado com sucesso na Fase anterior)*.

## PR-08: Motor de Propostas, Contratos e Vouchers
**Objetivo:** Validar os campos jurídicos obrigatórios nos contratos gerados e a assinatura da Edge Function.
**Arquivos:** `ProposalEditor.tsx`, `PublicProposal.tsx`.
**Riscos:** Discrepância nos dados de PDF vs Tela.

## PR-09: Motor de Comissões e Finanças
**Objetivo:** Criar o schema final e UI para o cálculo correto de comissões separando Taxas vs Over.
**Arquivos:** `src/pages/finance/Commissions.tsx` (a criar) e novas migrations em `agent_commission_entries`.
**Riscos:** Bugs no cálculo podem gerar problemas financeiros reais para a agência.
**Testes:** Validação da fórmula `(venda_bruta - taxas - over_bruto) * porcentagem`.

## PR-10: Segurança, RLS e Tokens
**Objetivo:** Fechar todas as portas de manipulação de payload, spoofing de `org_id` e force browsing em rotas de tokens mágicos.
**Arquivos:** `supabase/migrations/*_rls_fix.sql`.
**Riscos:** O sistema pode se trancar ("Nuclear RLS Fix"). Rollbacks de migrações podem ser difíceis.

## PR-11: RAG, Central de Ajuda e IA Pública
**Objetivo:** Conectar as bases de conhecimento ao Agente de IA para responder clientes na landing page sem vazar dados financeiros da agência.
**Arquivos:** `src/pages/AIChat.tsx`, `supabase/functions/ai-chat-agent/`.

## PR-12: Limpeza e Garbage Collection
**Objetivo:** Deletar código morto, componentes fake não utilizados e remover dependências antigas.
**Arquivos:** Remoção de assets, `LandingPage.tsx` limpa, pacotes NPM.
