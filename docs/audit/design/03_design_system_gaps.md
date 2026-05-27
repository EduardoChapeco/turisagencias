# Design System Gaps (Gargalos)

### 1. Inconsistência de Botões
- Encontramos usos mistos de botões padrão do shadcn/ui e classes manuais (`bg-blue-600 hover:bg-blue-700`).
- No OMEGA v4, as chamadas principais (como `Save` ou `New`) devem utilizar a classe `.premium-button` ou variáveis `bg-vj-green`. Existe poluição de Tailwind literal.

### 2. Efeito "Cartoon" (Sombras)
- Elementos como `shadow-xl` espalhados pelo CRM causam peso visual excessivo. O Design "Shadowless" de ponta a ponta não está sendo seguido à risca, especialmente nas Views Públicas legadas e modais do Builder.

### 3. FichaClienteMaster vs UI Moderna
- O painel `FichaClienteMaster` usa `bg-slate-200` e uma estética muito densa para encaixar num PDF (`w-[800px] h-[1131px]`). Ele não responde bem à interface de tela menor, necessitando obrigatoriamente de overflow scrollado. Isso foi desenhado para "Fixed Document", mas entra em conflito visual com as abas limpas.

### 4. Cores Hardcoded
- `border-zinc-200`, `border-slate-200`, `border-vj-border`. O uso misturado de tokens nominais (`vj-border`) e tokens Tailwind (`slate-200`) quebra o theming e suporte a Dark Mode real no futuro.
