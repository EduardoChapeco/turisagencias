# Fase 8 - Auditoria de CMS e Personalização

Este documento atesta a capacidade de customização e persistência das propriedades no Painel Inspector (Sidepanel).

## Implementação do Inspector
A arquitetura obriga cada bloco (como `HeroBlock.tsx` e `FormContactBlock.tsx`) a implementar uma função `settingsComponent`. Esse é o motor do CMS. 

| CRITÉRIO | AVALIAÇÃO | STATUS |
|---|---|---|
| **Painel Lateral (Sidepanel)** | O painel (`BuilderRightPanel.tsx`) carrega dinamicamente o formulário do bloco ativo. | **REAL** |
| **Persistência das Props** | A chamada `onChange({ props })` propaga a edição para o `useBuilderStore` e logo após, pro DB. | **REAL** |
| **Tipos de Inputs** | Os blocos usam inputs reais do Design System (`Input`, `Textarea`, `Select`). | **REAL** |
| **Editor de Mídia** | Existe um `MediaPicker.tsx` acoplado que permite escolher ou subir assets (integrado ao Storage). | **REAL** |
| **Dynamic Data Binding** | Não foi encontrado mecanismo genérico que ligue a "propriedade X" a uma "coluna do banco de CRM" automaticamente (como um lookup field genérico). As props são estáticas dentro do JSON da página. | **PARCIAL** |

## Edição de Variáveis Globais (SEO e Configurações)
O projeto define SEO através do `useBuilderStore.setProjectMeta`, que atualiza `slug`, `metaTitle` e `metaDescription` persistindo no atributo `frame_schema` da versão da página. 
- O formulário de SEO existe e é integrado.

## Veredito
O Inspector e a Engine de Customização CMS são reais. O único gap é que, para criar um novo bloco, o desenvolvedor precisa montar manualmente os inputs HTML em vez de usar um Schema JSON automatizado (ex: Uniform, Builder.io), o que aumenta o boilerplate, mas não torna o sistema falso.
