# Auditoria de RLS (Row Level Security)

## Status Inicial
Não é possível listar as policies exatas do banco diretamente via CLI sem conexão.
Porém, podemos inferir através do `types.ts` e do código fonte (`.from()`) que a aplicação tenta usar RLS.

## Riscos Detectados (Red Team)
- A ausência de tabelas de comissão indica que o RLS não existe nelas.
- Formulários públicos inserem dados. Precisam de política `WITH CHECK (true)` para INSERT.
- Há um histórico de migrations de "nuclear rls fix" que precisa ser validado nos testes.

## Ação Necessária (PR-10)
Garantir que todas as tabelas (especialmente `builder_projects`, `builder_versions`, e novas tabelas financeiras) possuam:
1. `ENABLE ROW LEVEL SECURITY`
2. Policy de `SELECT` usando `org_id = (SELECT get_my_org_id())`
3. Isolamento entre `super_admin` e `org_admin`.
