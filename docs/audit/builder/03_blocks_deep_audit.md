# Auditoria Bloco a Bloco


Análise detalhada de cada bloco cadastrado no registry e renderizado no canvas.

## 🧱 1. Bloco Hero Banner (`hero`)
- **Propriedades Editáveis**: `title`, `subtitle`, `imageUrl`, `layoutVariant`, `align`, `paddingY`, `bgPattern`.
- **Variantes de Layout**:
  - `centered`: Conteúdo centralizado clássico.
  - `split`: Imagem lateral e texto lado a lado (coluna dupla).
  - `fullscreen`: Fundo de imagem total (Full bleed cover) com overlay escuro.
  - `glass`: Card flutuante sobre fundo fosco com efeito blur.
- **Persistência**: Gravado no JSON do bloco dentro do content_schema.

## 🧱 2. Bloco de Recursos (`features`)
- **Propriedades Editáveis**: `items` (lista de strings), `layoutVariant`, `paddingY`, `bgPattern`.
- **Variantes de Layout**:
  - `grid`: Grade simples de 3 colunas de cards.
  - `timeline`: Passos lineares horizontais (*timeline* de passos da viagem).
  - `list`: Lista vertical limpa com ícones e checkmarks verdes.

## 🧱 3. Bloco de Contatos (`contact`)
- **Propriedades Editáveis**: `email`, `phone`, `layoutVariant`, `paddingY`, `bgPattern`.
- **Variantes de Layout**:
  - `standard`: Card com email, whatsapp e texto explicativo.
  - `footer`: Rodapé contendo dados fiscais, de endereço e mídias sociais estruturadas de forma mono-espaçada.

## 🧱 4. Bloco de Texto (`text`)
- **Propriedades Editáveis**: `content`, `layoutVariant`, `align`, `paddingY`, `bgPattern`.
- **Variantes de Layout**:
  - `centered`: Parágrafo centrado com espaçamento.
  - `twocol`: Texto dividido em duas colunas de leitura confortável.
  - `blockquote`: Citação literária de destaque com borda lateral esquerda verde grossa.

## 🧱 5. Bloco de Depoimentos (`testimonials`)
- **Propriedades Editáveis**: `testimonials` (lista de objetos quote/author/role), `layoutVariant`, `paddingY`.
- **Variantes de Layout**:
  - `grid`: Grade com múltiplos depoimentos.
  - `list`: Lista vertical de cartões.

## 🧱 6. Bloco de FAQ (`faq`)
- **Propriedades Editáveis**: `faqItems` (lista de objetos question/answer), `layoutVariant`, `paddingY`.
- **Variantes de Layout**:
  - `accordion`: Acordeão para perguntas frequentes.
  - `grid`: Grade de duas colunas.

## 🧱 7. Bloco de Catálogo & Preços (`pricing`)
- **Propriedades Editáveis**: `pricingItems` (lista de objetos title/price/description/features), `layoutVariant`, `paddingY`.
- **Variantes de Layout**:
  - `grid`: Cartões lado a lado.
  - `vip`: Cartão VIP centralizado em destaque com borda dourada.

## 🧱 8. Bloco de Galeria de Fotos (`gallery`)
- **Propriedades Editáveis**: `images` (URLs editáveis via MediaPicker), `layoutVariant`, `paddingY`.
- **Variantes de Layout**:
  - `grid`: Grade simples 3x3.
  - `masonry`: Mosaico com alturas variáveis de imagem.

## 🧱 9. Bloco de Pacotes Reais (`packages`)
- **Propriedades Editáveis**: `layoutVariant`, `paddingY`.
- **Variantes de Layout**:
  - `grid`: Grade de pacotes ativos.
  - `list`: Lista vertical simplificada.
- **Conexão Real**: Consulta via React Query os dados de `group_trips` com status `published` e `is_public` no banco de dados.

