# Auditoria de Estrutura: AppShell, Grid e Sidebar

## AppShell (`AppLayout.tsx`)
- **Problema de Overflow**: O `main` no AppLayout não delimita estritamente o `overflow-x: hidden` para impedir que tabelas de dados vaze e crie scroll duplo no navegador.
- **Header z-index**: Está como `z-50`, mas algumas sheets/modais com `z-[60]` (Tailwind modais) podem falhar ou entrar em conflito se não usarem os portais corretos do Radix UI.
- **Background**: Usa `bg-white/90 backdrop-blur-xl`. É funcional, mas em rolagem muito forte pode engasgar renderização se a página tiver muito repaint.

## Sidebar (`AppSidebar.tsx`)
- **Largura Fixa**: No modo colapsado (`rail`), o ícone está levemente descentralizado se o padding horizontal não for exato. O target é `w-14` ou `w-16` exato (56px-64px).
- **Conteúdo Passando por Baixo?**: Se o sidebar provider injetar fixed absolute e o margin-left não bater, ocorre sobreposição. 
- **Z-Index**: Deve estar acima do header ou abaixo? No layout atual, o Header não pega a tela toda (Fica a direita da sidebar) ou pega a tela toda? (Precisa checar a estrutura flex).

## Tabelas e Grids
- Páginas como `Quotations.tsx` e `Clients.tsx` renderizam listas em Cards Bento. O grid é `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`.
- Quando o nome do cliente é gigante, usa-se `truncate`. Está correto e sem vazamentos, porém ícones da sidebar podem se achatar se o `min-w-0` faltar na hierarquia flex.
