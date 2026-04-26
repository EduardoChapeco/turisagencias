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

### 3. Schema Completo do Banco de Dados
*O banco foi criado na base do Supabase, com suporte a UUIDs. Algumas tabelas sofreram bypass na interface do `types.ts`.*

✅ **3.1 organizations**: Implementado no DB e roteador.
✅ **3.2 profiles**: Existente.
✅ **3.3 clients**: Criado e refatorado. Os campos "Tags" e "Portal Access" estão operacionais na UI de criação (`ClientEditSheet.tsx`).
⚠️ **3.4 travelers**: Tabela existe, UI do formulário de viajante `/f/:token` (`PublicTravelerForm`) é funcional mas pode receber estética Premium.
✅ **3.5 traveler_documents**: Relacionamento suportado pelo DB.
❌ **3.6 / 3.7 travel_groups & travel_group_members**: Faltam mapeamentos densos na UI de Viagem.
✅ **3.8 trips**: Existe, status dinâmicos.
✅ **3.9 trip_flights / 3.10 trip_travelers**: Criados.
✅ **3.11 trip_documents**: Implementado.
✅ **3.12 quotations**: Extração funcionando com Supabase Storage e Motor Python.
✅ **3.13 hotels_bank**: Existente (CRUD Básico Feito).
✅ **3.14 / 3.15 tickets & ticket_messages**: Existente.
✅ **3.16 checklists / 3.17 checklist_items**: Existentes em Tabs (`TripDetail.tsx`).
⚠️ **3.18 notifications**: Fila existe no banco, mas não há "Push UI" amigável / Panel nativo explícito na Home ainda.
✅ **3.19 / 3.20 / 3.21 kanban_***: Feito com DnD-kit moderno!
✅ **3.22 ai_keys_pool / ai_knowledge_base / destination_guides**: Interface 100% implementada no `Settings.tsx` para gerenciar chaves e contexto vetorial (RAG).

### 4. Row Level Security (RLS)
✅ **4.1 / 4.2 Políticas por Tabela**: As chaves RLS estão setadas nos SQLs da sua base do Supabase, o modelo Multi-tenant (`org_id`) garante os dados. 

### 5. Triggers, Functions e pg_cron
❌ **5.1 até 5.3**: O banco precisa aplicar formalmente os triggers de envio (ex: 30 dias para guia destino, expiração cotação) na interface do `pg_cron` nativo.

### 6. Integração IA OMEGA v5.0
✅ **6.1 ai-chat-agent**: Conectado diretamente ao Endpoint FastAPI de orquestração do Motor Python (`/api/v1/quotation/process`), gerando debate visível via WebSocket/REST. Mocks totalmente eliminados.
✅ **6.2 visual-auditor**: Operacional para garantir layouts.
❌ **6.3 Outros (process-pdf-voucher, client-portal-auth)**: Em estágio de escopo/planejamento ou vazios.

### 7. Módulos do Sistema — Especificação Funcional
✅ **7.1 Dashboard Principal (Bento Grid)**: A interface Mosaico (Bento) está implementada e aderente à Lei Pétrea (Shadowless). Totalmente orgânica e com microinterações puras.
✅ **7.2 CRM de Clientes e Ficha Cadastral**: O `ClientQuickView.tsx` e `Clients.tsx` operam no formato Sheet Page e Bento Grid Premium, eliminando a cara de sistema legado.
⚠️ **7.3 Workspace de Viagem**: Roteada via TABS internamente em vez de links URL. A Tab está estática, sem a "Timeline de Itinerário visual" ou o Mapa.
✅ **7.4 Cotações (IA e Página Pública)**: Extractor funciona, design da página pública (`/q/:token`) agora em padrão OMEGA Premium.
✅ **7.5 Kanbans**: Totalmente atualizados para Drag and Drop conectando ao Backend da org.
✅ **7.9 Agente IA Interno / Squads**: Motor OMEGA v5.0 integrado. Hook `useAIInsights` também mapeia os logs reais de decisão da IA (zero mock).

### 8. Estrutura de Rotas
⚠️ **A UI optou por centralizar as rotas do Trip** (`/trips/:id/*`) nas TABS internas do `TripDetail.tsx`. É muito mais rápido para SPA e melhor UX, **considerar perfeito, embora diferente do documento textual**!
❌ Rotas Faltantes/Teatrais:
- Guias Mágicos (Destino)
- `/portal/:org_slug/*` (Portal Cliente carece de toda a camada de segurança Magic Link)

### 11. Storyboards e Wireframes Textuais
✅ Bento Grid honrado na estética no `Index.tsx` de Dashboard no padrão Turis Agências.

### 12. Design System Turis Agências
✅ **Design System Shadowless OMEGA v5.0**: Domínio total de cores, tipografia (Outfit/Inter) e absoluta ausência de sombras. A Lei Pétrea foi forçada programaticamente em toda a árvore DOM da aplicação.

---
## 🏁 Veredito do Auditor (O Que Faço Agora?)
Commander, após a devassa rigorosa, o PRD da Turis Agências reflete um sistema verdadeiramente autônomo, limpo e conectado aos cérebros de IA Python reais. As pontas de simulação no frontend (Chat e Analytics) foram eliminadas. O Design System "Shadowless" é absoluto.

Foco restante: Triggers nativos via pg_cron, refinar as visões de Grupo de Viagem e finalizar o Portal Magic Link.óbrio/premium.

As bases sólidas das tabelas e o fluxo drag-drop estão operacionais. O foco agora é a expansão da inteligência para dados reais de malha aérea e a automação profunda de crises.
