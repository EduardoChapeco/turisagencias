# Fase 1 - Matriz UI ↔ Hook ↔ Service ↔ DB

Abaixo está o mapeamento técnico da arquitetura de interação do Builder.

| AÇÃO | UI/COMPONENTE | HOOK/STORE | SERVICE | EDGE/RPC | TABELA | COLUNAS AFETADAS | RLS | REIDRATA? | STATUS |
|---|---|---|---|---|---|---|---|---|---|
| **Criar Projeto / Site** | `VisualBuilder` (On mount) | `useBuilderStore.setProjectMeta` | `supabase.from('builder_projects').insert` | N/A | `builder_projects` | `org_id`, `project_type`, `title` | Sim | Sim (on mount) | **REAL** |
| **Salvar Nova Versão / Publicar** | Botão `Publicar` no Header | `useBuilderStore` -> `handleSave` | `supabase.from('builder_versions').insert` | N/A | `builder_versions` | `project_id`, `version_number`, `content_schema`, `status` | Sim | Sim | **REAL** |
| **Atualizar Current Version** | Após Salvar Nova Versão | `handleSave` | `supabase.from('builder_projects').update` | N/A | `builder_projects` | `current_version_id`, `updated_at` | Sim | Sim | **REAL** |
| **Adicionar Bloco** | `BuilderSidebar` -> Drop | `useBuilderStore.addNode` | Zustand Local (Memória) | N/A | (Draft) | N/A | N/A | Via History | **PARCIAL** (Persiste ao Publicar) |
| **Editar Propriedades (Inspector)** | `BuilderRightPanel` / Inputs | `useBuilderStore.updateNode` | Zustand Local (Memória) | N/A | (Draft) | N/A | N/A | Via History | **PARCIAL** (Persiste ao Publicar) |
| **Undo / Redo** | Botões de Toolbar | `useBuilderStore.undo / redo` | Zustand Local (Memória) | N/A | (Draft) | N/A | N/A | Sim | **REAL** (Client Side) |
| **Trocar Viewport** | Toolbar (Desktop/Mobile) | `useBuilderStore.setViewport` | Zustand Local | N/A | N/A | N/A | N/A | N/A | **REAL** |
| **Preview** | Botão Eye (Preview) | `useBuilderStore.setIsPreview` | Zustand Local | N/A | N/A | N/A | N/A | N/A | **REAL** |

> [!NOTE]
> Observou-se que não existe um botão de "Salvar Draft" separado de "Publicar". O método `handleSave` no código atual insere a versão e **imediatamente** atualiza a versão principal no `builder_projects` como `current_version_id` (status `published`). 
> Isso significa que o conceito de "Draft" vive apenas na sessão do navegador (Zustand dirty state). Para um CMS completo, seria ideal ter separação entre salvar o trabalho em andamento no banco e a efetivação da "Publicação". Por ora, essa limitação configura um estado **PARCIAL** do lifecycle de drafts.
