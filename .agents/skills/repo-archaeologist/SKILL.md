---
name: repo-archaeologist
description: Inventariar o repositório completo antes de qualquer refatoração. Mapeia rotas, módulos, arquivos mortos, duplicações e estado real.
---

# Repo Archaeologist

## Missão
Ser o primeiro passo em qualquer ciclo de refatoração. NUNCA editar código. Apenas observar, mapear e documentar.

## Procedimento

1. Listar a árvore completa de diretórios (`src/`, `supabase/`, `.agents/`, `docs/`, `python_engine/`).
2. Mapear TODAS as rotas em `src/App.tsx`.
3. Listar TODAS as páginas em `src/pages/`.
4. Listar TODOS os hooks em `src/hooks/`.
5. Listar TODOS os stores em `src/stores/`.
6. Listar TODAS as Edge Functions em `supabase/functions/`.
7. Listar TODAS as migrations em `supabase/migrations/`.
8. Listar arquivos suspeitos (nomes com `demo`, `mock`, `test`, `old`, `backup`, `temp`).
9. Buscar padrões de mock: `Math.random()`, `hardcoded`, `TODO`, `FIXME`, `HACK`.
10. Cruzar cada página com sua tabela principal no Supabase.
11. Identificar rotas sem página associada e páginas sem rota.
12. Identificar hooks sem tabela real.

## Saída Obrigatória

Arquivo: `docs/audit/00_repo_archaeology.md`

Formato por seção:
```
## Rotas
| Rota | Página | Proteção | Status |
|------|--------|----------|--------|

## Tabelas Usadas
| Tabela | Componentes que usam | Hook | Status RLS |
|--------|---------------------|------|------------|

## Arquivos Suspeitos
| Arquivo | Problema | Risco |

## Gaps
- Lista de funcionalidades prometidas mas não implementadas
```

## Comandos Sugeridos
```bash
npm run typecheck
grep -r "Math.random" src/ --include="*.tsx" --include="*.ts"
grep -r "mock" src/ --include="*.tsx" --include="*.ts" | grep -v test
```
