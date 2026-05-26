# Auditoria de Aplicação do Design System


Mapeamento da consistência visual e uso de tokens globais do Turis Design System no Construtor.

## 🎨 1. Aplicação de Cores e Tokens
- **Tema Escuro de Fundo**: O editor do builder e as páginas públicas do site utilizam uma paleta harmoniosa baseada em tons escuros e discretos (`bg-zinc-950` e `border-zinc-800`), permitindo que a cor primária da agência se destaque.
- **Uso da Cor Primária**: A cor primária (`primary_color`) configurada no Brand Kit da agência (recuperada de `organizations`) é injetada dinamicamente nos botões principais, badges de destaque e efeitos de brilho de fundo (*glow gradient*).
- **Radius & Borders**: Cantos arredondados padronizados utilizando `rounded-2xl` e `rounded-xl` em cartões e seções de formulários, mantendo a consistência geométrica.

## 🎨 2. Componentes UI Reutilizados
- **Vite/Shadcn**: O builder reutiliza os componentes nativos do design system (`Button`, `Input`, `Textarea`, `Sheet`, `Select`, `Badge`), eliminando redundância de estilização monolítica ou CSS flutuante.

