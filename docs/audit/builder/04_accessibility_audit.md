# Fase 4 - Auditoria de Acessibilidade (A11y)

| REQUISITO | AVALIAÇÃO | STATUS |
|---|---|---|
| **Navegação por Teclado** | O Canvas (onde os blocos são largados) e os blocos não possuem tabindex avançado para drag-and-drop por teclado, focando apenas no mouse. | **PARCIAL** |
| **Tags Semânticas** | Blocos como `HeroBlock` usam tags corretas (`<section>`, `<h1>`, `<p>`, `<button>`). | **REAL** |
| **Labels e ARIA** | Os formulários de edição (CMS Inspector) usam o componente `<Label>`, porém a amarração `htmlFor` e `id` dinâmico muitas vezes está ausente. | **PARCIAL** |
| **Alt Text (Imagens)** | Imagens via `MediaPicker` suportam alt text, mas nem todos os blocos (ex: galerias em carrossel) forçam a presença do texto alternativo. | **PARCIAL** |
| **Contraste** | Seguindo o Tailwind do projeto (`bg-vj-green` sobre `zinc-950`), os blocos atendem bem o contraste AA. | **REAL** |

> [!WARNING]
> A principal falha de acessibilidade é no fluxo de edição do Builder. Arrastar e soltar componentes não possui fallback para uso via teclado (Space/Enter para selecionar, setas para mover). O site final (gerado publicamente) herda boa acessibilidade devido às tags HTML semânticas.
