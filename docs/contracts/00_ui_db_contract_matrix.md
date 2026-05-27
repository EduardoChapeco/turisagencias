# Matriz de Contratos UI ↔ DB — Turis Agências

## Metodologia
Entidade é REAL se: tabela existe nos types gerados E é usada por hook/service E tem RLS
Entidade é PARCIAL se: tabela existe mas falta hook, RLS ou colunas esperadas
Entidade é GAP se: o frontend/PRD espera mas não foi encontrado nos types gerados

## Entidades Encontradas e Avaliadas
- **organizations** → REAL (existe nos types)
- **profiles** → REAL
- **builder_projects** → REAL (existe como builder_projects, não builder_sites)
- **builder_versions** → REAL (existe como builder_versions, não builder_page_versions)
- **builder_sites** → GAP (documentação cita, mas tipos têm public_sites)
- **builder_pages** → GAP (não encontrado nos types gerados)
- **builder_page_versions** → GAP (não encontrado nos types gerados)
- **agent_commission_rules** → GAP (não encontrado em types.ts)
- **agent_commission_entries** → GAP (não encontrado em types.ts)
- **agent_commission_periods** → GAP (não encontrado em types.ts)
- **automation_jobs** → GAP (não listado nas tabelas básicas)
- **automation_rules** → PARCIAL (existe, mas precisamos do schedule real via pg_cron)
- **quotations** → REAL
- **proposals** → REAL
- **contract_records** → REAL
- **clients** → REAL
- **travelers** → REAL
- **group_trips** → REAL
- **kanban_boards** → REAL
- **kanban_cards** → REAL
- **payments** → REAL

## Ações (PR-04, PR-07, PR-09)
As tabelas que deram GAP precisam de SQL migrations para canonizar a realidade. 
As entidades que deram REAL precisam apenas que os casts `as any` sejam limpos e hooks migrados.
