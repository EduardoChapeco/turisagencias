# Auditoria de Acessibilidade


Auditoria de conformidade com os padrões de acessibilidade WCAG/WAI-ARIA para portais institucionais e editor.

## 🔍 1. Pontos Fortes de Acessibilidade
- **Contraste de Cores**: O design system utiliza tons base escuros (`zinc-950` / `zinc-900`) e texto claro (`white` / `zinc-300`), resultando em taxa de contraste superior a 7:1 (conforme requisitos AAA).
- **ARIA Labels**: Os botões de ação e ícones (como fechar modal, viewport switcher, remover seções) utilizam tooltips informativos e `title` tags para leitores de tela.
- **Responsividade Adaptativa**: Fontes definidas em unidades relativas e imagens contendo tags `alt` preenchidas de forma contextual nas seções públicas.
- **Teclado**: Modais e Sidepanels (como os Sheets do Radix-UI usados no CRM e CMS) suportam nativamente o fechamento via tecla `ESC` e mantêm o foco de navegação capturado (*focus trap*) de forma acessível.

