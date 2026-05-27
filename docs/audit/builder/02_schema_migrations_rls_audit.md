# Fase 2 - Auditoria de Tabelas, Schemas e Migrations

Analisei a base de dados utilizando os schemas da pasta `supabase/migrations`.

## Descoberta de Drift (Falha de Sincronia) Crítica
> [!WARNING]
> Existe uma **discrepância grave (Schema Drift)** entre o Frontend (`VisualBuilder.tsx`) e o banco de dados atualizado.
> - O `VisualBuilder.tsx` está manipulando as tabelas `builder_projects` e `builder_versions` (criadas na migration de *25/05*).
> - No entanto, existe a migration `20260526000002_omega_v7_builder_schema.sql` (criada em *26/05*) que define o padrão oficial como `builder_sites`, `builder_pages` e `builder_page_versions`. 
> 
> **Impacto:** O builder "funciona" por legado, mas não está alimentando a nova arquitetura unificada exigida pelo Design System Omega v7. 

## Matriz de Tabelas (Base v7 Oficial)

| TABELA | EXISTE? | COLUNAS PRINCIPAIS | RLS | POLICIES | TRIGGERS | USADA PELA UI? | STATUS / GAP |
|---|---|---|---|---|---|---|---|
| `builder_sites` | Sim | org_id, type, slug, domain | Sim | Sim (por org_id) | updated_at | **NÃO** | **GAP**: UI aponta pra `builder_projects`. |
| `builder_pages` | Sim | site_id, title, draft_content | Sim | Sim | FK link | **NÃO** | **GAP** |
| `builder_page_versions`| Sim | page_id, version_number, content_json | Sim | Sim | - | **NÃO** | **GAP** |
| `builder_blocks_registry` | Sim | block_type, schema_json, default_props| Não | Não | - | **NÃO** | **GAP**: Registry do client é fixo no TypeScript. |
| `builder_templates` | Sim | scope, category, content_json | Sim | Sim | - | ? | Não avaliada ainda. |
| `builder_assets` | Sim | bucket, path, mime_type | Sim | Sim | - | Parcial | O `MediaPicker` precisa ser validado. |
| `builder_form_submissions`| Sim | site_id, page_id, lead_id, payload | Sim | Sim | - | Parcial | Edge Function precisa ser auditada. |

## Auditoria de Segurança (RLS)
> [!TIP]
> As políticas RLS nas tabelas V7 estão bem configuradas para Multi-tenant:
> `USING (org_id = public.get_my_org_id())`
>
> Contudo, enquanto a UI não for refatorada para as novas tabelas, o projeto não ganha os benefícios da nova arquitetura. O plano de refatoração final precisará do **PR-04 — Builder Core** apontando para as tabelas `builder_pages`.
