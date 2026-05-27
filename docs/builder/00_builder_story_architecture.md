# Builder/CMS Narrativo: Story & Architecture

## A História do Criador (UX)

O objetivo principal do novo **Turis Builder** é eliminar a complexidade dos "editores estranhos" e substituir por escolhas intencionais.

**Jornada Ideal:**
1. O usuário seleciona o que deseja construir: Site Institucional, Landing Page, Blog, Linkbio, etc.
2. A tela oferece três opções claras: **[Criar Novo]**, **[Usar Template]**, **[Editar Existente]**.
3. O ambiente de edição (Canvas) é limpo e segmentado:
   - **Esquerda:** Páginas, Blocos e Assets.
   - **Centro:** Preview Responsivo.
   - **Direita:** Propriedades e Inspector do bloco selecionado.
   - **Topo:** Salvar, Publicar, Preview, Histórico, SEO e IA.

## Arquitetura Obrigatória: Document Builder vs Responsive Page Builder

Nunca devemos misturar os construtores de tela da agência. Eles possuem finalidades e motores distintos.

### 1. Document Builder (Motor de Documentos B2B/B2C)
Este motor lida com layouts A4, PDFs, e documentos densos transacionais.
- Propostas
- Vouchers
- Contratos (Assinaturas)
- Roteiros em PDF
- Mapas de Assento (Ônibus)

### 2. Responsive Page Builder (CMS)
Este motor lida com renderização web pública, SEO e interatividade.
- Sites Institucionais
- Landings de Captura e Promoção
- Linkbio
- Blog & Catálogo de Viagens
- Páginas de Suporte / FAQ

## Auditoria e Escopo

Antes de instanciar novos blocos, a auditoria provará que o ciclo de vida atual do `VisualBuilder.tsx` obedece as regras do novo CMS. A estrutura será apoiada nas novas tabelas do Supabase que armazenam estados, estilos globais e eventos de publicação separados.
