# Auditoria de Performance


Análise de performance, peso de dependências e tempo de carregamento.

## ⚡ 1. Otimização de Assets e Bundles
- **Lazy Loading**: O builder de canais é carregado de forma modular. Telas pesadas como o `VisualBuilder.tsx` são importadas sob demanda apenas na administração.
- **Assets de Imagem**: As fotos da biblioteca Unsplash e os uploads no storage utilizam compressão automática e parâmetros de redimensionamento dinâmico (`?w=800&auto=format`), reduzindo drasticamente o consumo de banda na visualização pública.
- **Autosave Debounced**: A gravação de rascunhos possui debounce de 1s, mitigando re-renderizações desnecessárias e preservando o desempenho de digitação no editor.

