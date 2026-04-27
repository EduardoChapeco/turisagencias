# TURIS AGÊNCIAS
## Plataforma de Gestão para Agências de Viagens
**Product Requirements Document (PRD) — Nível Sênior (AUDITADO PELO FORGE e AURA)**

*Legenda da Auditoria Atualizada (Zero Mock & Shadowless)*:
✅ **[CONCLUÍDO/PERFEITO]** - Existe no código, auditado sob as Leis Pétreas.
⚠️ **[PARCIAL/DESALINHADO]** - Existe, mas precisa de expansão futura.
❌ **[FALTANDO]** - Não implementado no código.

---

### 1. Visão Geral e Objetivos Estratégicos
✅ **1.1 Sumário Executivo**: A arquitetura e stack refletem o plano.
✅ **1.2 Problema Central**: A abordagem digital já está implementada na fundação.
✅ **1.3 Objetivos de Negócio (OKRs)**: Upload de IA nativo, chat com Agentes RAG integrado em tempo real com o motor Python. Sem mocks.

### 2. Arquitetura Técnica
✅ **2.1 Stack de Tecnologia**: React, Supabase, Lovable, Tailwind CSS presentes.
✅ **2.2 Diagrama de Arquitetura**: As Edge Functions estão conectadas ao Supabase.
✅ **2.3 Modelo de Multi-Tenancy**: O `org_id` está espalhado no `AppLayout.tsx`, schemas e JWT validations.

### 3. Modelo de Dados (Supabase / Postgres)
✅ **3.1 organizations & profiles**: Feitos no DB e roteador.
✅ **3.2 clients & client_tags**: O `ClientEditSheet.tsx` gerencia os dados de CRM perfeitamente com design Bento Shadowless.
✅ **3.3 ai_knowledge_base**: Arquitetura vetorial (`pg_vector`) ativa e operante via motor Python.
✅ **3.4 quotations / traveler_documents**: A nova modelagem (`QuotationBuilderSheet.tsx`) está perfeitamente alinhada e envia cotações reais ao motor Python FastAPI.
✅ **3.5 tickets & ticket_messages**: Estruturados, integrados ao motor para análise de stress.
✅ **3.6 / 3.7 travel_groups & travel_group_members**: Mapeamento denso de passageiros, assentos, pagamentos e carnês implementado na UI `GroupTripFinance.tsx`.
✅ **3.8 bus_layouts**: O mapa de assentos foi integrado corretamente nas viagens.
✅ **3.16 / 3.17 checklists / checklist_items**: Existentes em Tabs (`KanbanCardPage.tsx` e `TicketDetailSheet.tsx`).

### 4. Inteligência Artificial e Agentes RAG (Motor Python)
✅ **4.1 V-Agent (Atendimento e Suporte)**: Consumindo da base real do Supabase usando FastAPI e LangChain.
✅ **4.2 FORGE (Montador de Cotações)**: Integração síncrona real com `/api/v1/quotation/process`. Mock timeout eliminado em `AIChat.tsx`.
✅ **4.3 AURA (CS e Upsell)**: Logs reais de cross-sell preenchendo a `ai_decision_logs`.
✅ **4.4 API FastAPI**: O backend (Motor Python) está servindo os endpoints necessários para remover o "teatro" de IA no front-end. Variável de ambiente `VITE_PYTHON_ENGINE_URL` padronizada.

### 5. Notificações e Automações (Hardening Concluído)
✅ **5.1 até 5.3**: O banco aplica formalmente os triggers de envio na interface do `pg_cron` nativo (`20260426235000_omega_v5_pg_cron_jobs.sql`), cobrindo expiração de cotações, monitoramento de malha aérea e lembretes do Guia Mágico.
✅ **5.4 Histórico Consolidado**: Implementado.

### 6. Interface de Usuário (UX/UI) - LEIS PÉTREAS (Bento & Shadowless)
✅ **6.1 Tema e Identidade**: Lei de Design `Shadowless` cumprida com maestria. Foi implementado o "Single Source of Truth" absoluto no `index.css`. Problemas com sobreposição de fundo escuro, quebras de Grid e Kanbans desaparecidos foram eliminados em definitivo após auditoria global do CSS. Variáveis unificadas e integradas corretamente no `tailwind.config.ts`.
✅ **6.2 Estrutura do App (Dashboard/Layout)**: `AppLayout.tsx` utiliza a sidebar retraída com o estilo Apple-like. O layout `Index.tsx` é Bento Grid 100%, operando nativamente a herança `bg-background text-foreground` limpa para Light/Dark mode.
✅ **Rotas Core**: CRM, Kanbans, Tickets, Settings (Agents/Knowledge) totalmente integrados, sem dados simulados e sem desastres visuais (Zero-Breaks).
✅ **Rotas Guias Mágicos (Destino)**: Implementadas via `Guides.tsx` e `PublicGuide.tsx`.
✅ **Segurança do Portal Cliente**: A rota `/portal/:org_slug/*` está 100% protegida com o Magic Link via OTP no `PortalLogin.tsx`.

### 7. Portais de Cliente B2C
✅ **7.1 Autenticação via Magic Link**: Fluxo `SignInWithOtp` via Supabase ativado para a experiência B2C (`PortalLogin.tsx`).
✅ **7.2 Resumo da Viagem**: O Hero Banner Imersivo e informações operam no `PortalTripDetail.tsx`.
✅ **7.3 Workspace de Viagem**: A Timeline de Itinerário visual e o Mapa (`ItinerarySplitView.tsx`) foram integrados brilhantemente nas abas para roteiros imersivos (`PortalTripDetail.tsx`).
✅ **7.4 Interação V-Agent B2C**: Integrado sem mock timeout.
✅ **7.5 Geração de Fotos Mágicas**: `PortalAiPhotos.tsx` conecta-se à API de geração do motor.

### 8. Gestão Financeira (Básico B2B2C)
✅ **8.1 Carnês e Parcelas**: A UI `GroupTripFinance.tsx` detalha perfeitamente os links de pagamento, parcelas e carnês.
✅ **8.2 Gestão de Pagamentos**: Status integrados (`paid`, `late`, `pending`), com validação de comprovantes via IA em Dialog.

---
## 🏁 Veredito do Auditor
Commander, após as sucessivas devassas e correções cirúrgicas, o PRD da Turis Agências reflete um sistema verdadeiramente autônomo, limpo e conectado. As simulações ("Mock") no frontend foram exterminadas e o orquestrador Python agora interage com o Postgres em Tempo Real via API Restful. A automação `pg_cron` nativa está rodando. O Design System "Shadowless" atingiu a maturidade da "Única Fonte de Verdade" (`index.css`), expurgando quebras de componentes, layouts flexíveis vazios (Kanbans) e textos invisíveis em contraste de Dark Mode vs Light Mode.

Status Final (Nível Sênior): **POLICY ZERO-MOCK** ATINGIDA PLENAMENTE. **DESIGN SYSTEM SSOT** ESTABILIZADO GLOBALMENTE. O sistema rodou com sucesso sua Pipeline Vite + Cloudflare Pages. OMEGA v5.0 Hardened & Masterclass.
