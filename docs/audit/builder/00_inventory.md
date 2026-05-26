# Auditoria 00 - Inventário do Builder Turis

**Data da Auditoria:** Maio 2026
**Objetivo:** Levantar o estado atual do Construtor de Sites da Turis Agências em relação ao PRD OMEGA v7.0.

## 1. Componentes e Rotas Encontradas
Atualmente, o projeto `turisagencias` possui uma rota focada no construtor que renderiza o componente `VisualBuilder.tsx`.
**Path Principal:** `src/components/builder/VisualBuilder.tsx`

### Situação Atual:
- **Painel Esquerdo (`BuilderSidebar.tsx`):** Lista blocos registrados no sistema. Recentemente expandido para 28 blocos (foco em Turismo, Layout, UI e Typografia). Falta suporte nativo a arrastar assets do OS e tabs completas de camadas/páginas.
- **Canvas Central (`BuilderCanvas.tsx`):** Renderização reativa via estado Zustand (`useBuilderStore`). Utiliza drag-and-drop da biblioteca `@dnd-kit/core`.
- **Painel Direito:** O painel de propriedades existe mas é genérico para a maioria dos elementos. Falta a quebra em abas "Conteúdo | Layout | Estilo | Responsivo | Dados | Ações".

## 2. Tabelas de Banco de Dados (Supabase) Atuais vs Necessárias
Atualmente o banco de dados tem um suporte básico implementado:
- `builder_projects`: Salva o cabeçalho e meta informações.
- `builder_versions`: Salva versões históricas baseadas no schema `content_schema` (JSON).

**Falta Implementar (Gap Analysis):**
O PRD exige refatorar isso para a hierarquia: `Org -> Sites -> Pages -> Versions`. O sistema atual não possui tabelas claras para controle detalhado de SEO por página, integração com CRM para analytics nativa ou galerias gerenciadas via Edge Storage.

## 3. Blocos Existentes no Registry (`src/components/builder/blocks/index.ts`)
O construtor já dispõe de blocos criados recentemente com padrão OMEGA v6.5, mas precisa ser migrado para o modelo de registry avançado do PRD (v7.0):
- HeroBlock, FeaturesBlock, PricingBlock, GalleryBlock, FaqBlock, CtaBlock, TestimonialsBlock, StatsBlock, FormContainerBlock, CmsGridBlock.
- Blocos Micro: Heading, Paragraph, Divider, Spacer, ColumnGrid, Container.
- Blocos Interativos: Accordion, Alert, Video, Steps, Timeline, PricingCards, Team, LogoTicker, Header, Footer, Newsletter.

## Conclusão da Auditoria 00
O sistema não possui construtores duplicados "fakes", mas possui um construtor que estava sendo iterado como MVP (v6.5) que será agora reestruturado arquiteturalmente para o v7.0 de acordo com as diretrizes do novo PRD. O próximo passo é refatorar as rotas, criar os schemas SQL exigidos e integrar o novo fluxo de dados.
