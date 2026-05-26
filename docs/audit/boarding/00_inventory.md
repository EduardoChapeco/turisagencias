# 00 Inventory

## Rotas
- `/departures` -> renderiza `DeparturesKanban.tsx`

## Componentes (src/components/kanban)
- `DepartureBoardCard.tsx`: Card visual do Kanban.
- `DepartureCardSheet.tsx`: Drawer que abre ao clicar no card.
- `DeparturesKanban.tsx`: Página principal do Kanban, gerencia Drag & Drop via `@dnd-kit/core`.

## Hooks (src/hooks/useKanbanBoards.ts)
- Usa hooks genéricos: `useKanbanBoard`, `useCreateKanbanCard`, `useUpdateKanbanCard`, `useDeleteKanbanCard`.
- Não há hooks específicos para operações de "embarque" ou "passageiros".

## Services / Edge Functions
- Edge Functions: Ausentes para funções de check-in, envio de bilhetes, ou link registry. 
- Mocks atuais: Nenhuma função gera URLs dinamicamente. O agente precisa colar a URL manualmente.

## Schema Atual 
- O Kanban usa as tabelas genéricas: `kanban_boards`, `kanban_columns`, `kanban_cards`.
- O card do Kanban de embarque usa o JSONB `metadata` para armazenar `destination`, `check_in_date`, `flight_locator`, e `airline_checkin_url`.

## Políticas (RLS)
- O Kanban atual usa RLS baseada na tabela genérica de kanbans, permitindo visualização de cards por org_id, mas não isola operações sensíveis ou tokens públicos.

## Duplicidades e Fakes
- FAKE: O botão de "Check-in" do `DepartureCardSheet` apenas abre o link salvo no texto, sem consultar API, PNR ou companhia.
- FAKE: Não existem dados de passageiros (`travelers`) atrelados ao card, apenas um texto livre "description" ou checklists genéricos.
- FAKE: "Boarding pass" e controle de bagagem não existem.
