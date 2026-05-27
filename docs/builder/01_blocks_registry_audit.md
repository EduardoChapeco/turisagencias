# Auditoria e Registro de Blocos (Blocks Registry)

Para que a experiência do Page Builder seja viável em produção, todos os blocos disponíveis devem ser auditados. O motor do Builder exige que um bloco só seja aprovado se tiver os seguintes requisitos implementados:

## Requisitos Obrigatórios de um Bloco
1. **`block_key`**: Identificador único (ex: `hero_split`, `grid_services`).
2. **`category`**: Para agrupamento no menu lateral (ex: `hero`, `cta`, `blog`).
3. **`schema` & `default_props`**: A estrutura de dados (estado inicial limpo).
4. **`renderer_editor`**: Como ele aparece DENTRO do iframe/canvas do construtor.
5. **`renderer_public`**: Como ele aparece na web pública, limpo.
6. **`inspector_fields`**: Controles de edição para a barra lateral direita.
7. **`responsive_rules`**: Tratamentos para mobile/tablet.
8. **`data_bindings`**: Como ele se conecta a dados reais (ex: pacotes do DB).

## Auditoria de Blocos Existentes vs Essenciais
| Bloco (Key) | Existe? | Editor | Público | Schema | RLS/Data | Status Atual | Ação |
| ----------- | ------- | ------ | ------- | ------ | -------- | ------------ | ---- |
| `hero_central` | Sim | Sim | Sim | Ok | N/A | Operacional | Validado |
| `hero_split` | Sim | Sim | Sim | Ok | N/A | Operacional | Validado |
| `cards_services`| Sim | Sim | Sim | Ok | N/A | Operacional | Validado |
| `gallery` | Parcial | Não | Não | Falta | N/A | Inexistente | Implementar |
| `form_lead` | Sim | Sim | Sim | Ok | Sim | Operacional | Ajustar segurança |
| `faq` | Parcial | Sim | Sim | Ok | N/A | Simples | Expandir |
| `blog_grid` | Não | Não | Não | Falta | Sim | Inexistente | Implementar |
| `linkbio_btns` | Não | Não | Não | Falta | N/A | Inexistente | Implementar |

## Conclusão da Auditoria de Componentes
Atualmente, o `VisualBuilder.tsx` possui os blocos fundamentais (Hero, Features, Pricing, Form), mas falta suporte às estruturas de CMS dinâmico (Blog Grid, Catálogos) e LinkBio. A etapa de implementação de PRs focará em injetar esses blocos base no `BlockRegistry`.
