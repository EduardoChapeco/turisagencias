# Fase 7 - Auditoria de Publicação e Versionamento

O sistema de publicação está funcional, mas precisa de refatoração para comportar Drafts assíncronos de forma segura.

## Fluxo de Publicação Atual (VisualBuilder.tsx)

1. **Upsert do Projeto:** Se o `projectId` não existir, ele cria o registro no `builder_projects`.
2. **Auto-incremento:** Consulta o banco para achar o último `version_number` e incrementa +1.
3. **Snapshot Imutável:** Insere um novo registro em `builder_versions` passando a árvore JSON inteira (`nodes` / `content_schema`).
4. **Pointer de Produção:** Faz um `update` na tabela de projetos apontando o `current_version_id` para a nova versão.

## Matriz de Versionamento

| AÇÃO | FUNCIONAMENTO | STATUS | RISCO |
|---|---|---|---|
| **Salvar Draft** | Fica apenas na memória do navegador (Zustand dirty state). Se fechar a aba, perde o progresso que não foi publicado. | **FAKE / PARCIAL** | Alto risco de perda de dados. |
| **Autosave** | Não implementado. O usuário precisa obrigatoriamente clicar em "Publicar". | **FAKE** | O Autosave precisa ser um upsert contínuo de uma versão status = `draft`. |
| **Preview** | O Preview no builder (`isPreview`) apenas desativa as bordas e a sidebar, mostrando o HTML real da árvore atual. | **REAL** | Não usa token de segurança, apenas state local. |
| **Publicar** | Gera um novo snapshot (linha nova em `builder_versions`). | **REAL** | Tabela vai inchar com o tempo (precisa de limpeza). |
| **Reverter Versão** | Não há botão ou ação na UI para visualizar versões antigas e restaurá-las (rollback). O banco de dados suporta (já que não há overwrite de versões passadas), mas a UI não faz a chamada. | **QUEBRADO / PARCIAL** | - |

> [!WARNING]
> A ausência de gravação de drafts contínuos no backend é um risco severo para UX. É necessário alterar o fluxo para:
> - O Editor sempre edita a versão com status `draft_snapshot`.
> - O Autosave atualiza essa mesma linha a cada 3 segundos.
> - O botão "Publicar" duplica essa linha e muda o status para `published`, ou atualiza o ponteiro de live view.
