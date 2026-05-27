# Fase 14 - Auditoria de Performance

Identifiquei gargalos arquiteturais graves no Builder relacionados ao bundle.

## 1. Bundle Size (O Problema do Index)
- **Problema Encontrado:** O arquivo `src/components/builder/blocks/index.ts` importa **TODOS os >85 blocos de forma síncrona** (`import { HeroBlock } ...`). 
- **Impacto:** O JS enviado para o navegador ficará inchado, carregando bibliotecas pesadas de vídeos e mapas iterativos até mesmo para quem só quer criar um linkbio de 1 bloco.
- **Correção Exigida:** Mover para `React.lazy()` (Dynamic Imports) para os componentes de renderização dos blocos (`renderComponent`). O registro deve conter só o metadado leve, carregando o chunk de renderização on-demand.

## 2. Re-renders Globais
- **Problema:** O uso do `useBuilderStore` armazena o `nodes: BuilderNode[]` (a árvore completa) e o estado UI num único objeto Zustand grande. O `updateNode` causa mutação na array root.
- **Impacto:** Sem isolamento via memoization, alterar um texto na rodapé pode trigar re-render no Header.
- **Correção:** Isolar subscriptions usando seletores finos (ex: `useBuilderStore(state => state.nodes.find(...))`).

## Veredito
**QUEBRADO/CRÍTICO para Escala**. Para suportar as dezenas de novos blocos que virão (como IA, Maps, SSR), o refator de lazy loading do block registry é o passo mais urgente na performance.
