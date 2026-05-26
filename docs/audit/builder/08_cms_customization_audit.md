# Auditoria de Customização do CMS


Auditoria de personalização de blocos e parametrização pelo painel inspetor (Inspector).

## 🎛️ 1. Inspector de Propriedades do Construtor
O editor possui a aba **"Editar Bloco"** que se adapta dinamicamente ao tipo de bloco selecionado:
- **Hero**: Permite alterar o título, subtítulo, imagem de fundo (usando o MediaPicker) e alternar a variante de layout para `centered`, `split`, `fullscreen` ou `glass`.
- **Text**: Permite preencher o texto descritivo e configurar o alinhamento (`left`, `center`, `right`) e espaçamento vertical.
- **Gallery**: Permite adicionar múltiplas fotos e escolher entre as variantes `grid` ou `masonry`.
- **Features**: Permite editar os itens de recurso e alternar a exibição para grade ou timeline.

*Nota: Todas as propriedades de layout e de estilo (alinhamento, padrão de fundo, padding e variante) são reidratadas em tempo real no simulador do canvas e no renderizador público.*

