---
version: "2.0"
name: "Turis Agências OMEGA v6.5"
description: >
  Design system da plataforma SaaS de gestão de viagens Turis Agências.
  Arquitetura visual: Google AI Studio/Gemini-inspired Stitch-like UI — Shadowless, Premium, Minimalista, Neutra e Altamente Produtiva.
---

## 1. Overview / Brand & Style

O Turis Agências OMEGA v6.5 é regido por uma estética minimalista, clara, respirada e sofisticada. O layout busca reduzir ruídos cognitivos, fornecendo uma interface calma e fluida.

### Filosofia "Shadowless" (Sem Sombras)
- **Nenhum box-shadow** em cards ou containers comuns. A profundidade é demarcada exclusivamente por bordas finas (`1px` border) e cores de fundo sutis (como contrastes entre branco e cinza claro).
- **Sombras de elevação** são permitidas apenas em elementos flutuantes reais: overlays, dropdowns, tooltips e modais (`box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06)`).

---

## 2. Colors (Paleta de Cores)

A paleta é neutra, clara, elegante e baseada em tons frios/slate.

```yaml
colors:
  bg-app: "#FAFAFA"            # Fundo principal da aplicação
  bg-shell: "#FFFFFF"          # Fundo de shells/estruturas
  surface: "#FFFFFF"           # Cards, painéis e formulários
  surface-muted: "#F5F7FA"     # Superfícies levemente sombreadas/tabelas
  surface-subtle: "#F8FAFC"    # Hints ou sub-seções
  surface-hover: "#F1F5F9"     # Hover de itens/tabela
  surface-active: "#EEF4FF"    # Item selecionado/ativo
  border-hairline: "#E5E7EB"   # Linhas divisorias internas
  border-subtle: "#DDE3EA"     # Borda padrão de inputs e cards
  border-strong: "#CBD5E1"     # Borda de foco ou separadores fortes
  text-primary: "#111827"      # Cor do texto principal
  text-secondary: "#475569"    # Subtítulos e descrições
  text-muted: "#64748B"        # placeholders, legendas
  text-soft: "#94A3B8"         # Dicas e ícones desativados
  text-inverse: "#FFFFFF"      # Texto sobre fundos escuros/botões
  primary: "#2563EB"           # Azul Royal — Ação primária e foco
  primary-hover: "#1D4ED8"     # Azul escuro para hover
  primary-soft: "#DBEAFE"      # Azul claro para backgrounds de status
  primary-subtle: "#EFF6FF"    # Azul levíssimo para hovers ativos
  accent-violet: "#7C3AED"     # Destaques específicos (Ex: IA Avançada)
  accent-cyan: "#0891B2"       # Módulo extra
  accent-green: "#16A34A"      # Sucesso/Aprovado
  accent-amber: "#D97706"      # Alerta/Pendente
  accent-rose: "#E11D48"       # Erro/Cancelado
```

---

## 3. Typography (Tipografia)

Tipografia baseada em **Inter** de ponta a ponta para maximizar a coerência visual.

```yaml
typography:
  display:
    fontFamily: "Inter, sans-serif"
    fontSize: "40px"
    fontWeight: "700"
    letterSpacing: "-0.035em"
    lineHeight: "1.1"
  h1:
    fontFamily: "Inter, sans-serif"
    fontSize: "32px"
    fontWeight: "700"
    letterSpacing: "-0.03em"
  h2:
    fontFamily: "Inter, sans-serif"
    fontSize: "24px"
    fontWeight: "600"
    letterSpacing: "-0.02em"
  body-md:
    fontFamily: "Inter, sans-serif"
    fontSize: "14px"
    fontWeight: "400"
    lineHeight: "1.6"
  body-sm:
    fontFamily: "Inter, sans-serif"
    fontSize: "13px"
    fontWeight: "400"
    lineHeight: "1.5"
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "13px"
    fontWeight: "500"
    lineHeight: "1.2"
```

---

## 4. Spacing (Espaçamento)

Uso rígido da escala baseada em múltiplos de 4px:
`0px`, `4px` (`gap-1`), `8px` (`gap-2`), `12px` (`gap-3`), `16px` (`gap-4`), `24px` (`gap-6`), `32px` (`gap-8`).

---

## 5. Radius (Cantos Semi-arredondados)

- **xs** (6px): Badges menores ou elementos minúsculos.
- **sm** (8px): Inputs em grids apertados.
- **md** (12px): Botões e inputs padrão.
- **lg** (16px): Cards de informações e grids bento.
- **xl** (24px): Side panels, sheets e modais de topo.

---

## 6. Components (Componentes Base)

### 6.1 Buttons (Botões)
- **Primary**: Background `var(--vj-primary)` (`#2563EB`), sem sombra. Hover muda para `#1D4ED8` com transição suave.
- **Secondary / Outline**: Background branco, borda `var(--vj-border)` (`#DDE3EA`).
- Todo botão assíncrono DEVE conter indicador de loading (`<Loader2 className="animate-spin" />`).

### 6.2 Cards (Bento Cards)
- Background branco, borda fina `border border-zinc-200`, `rounded-2xl` (16px), sem sombra.
- Microinterações no hover: `hover:border-vj-primary/30 hover:-translate-y-0.5 transition-all duration-200`.

---

## 7. Do's and Don'ts (Diretrizes)

### Do's (Fazer)
- Manter telas respiradas e com amplo uso de espaços em branco.
- Utilizar cores apenas para acentuações contextuais de status ou botões primários.
- Preservar transições rápidas (`transition-all duration-200`) em todas as interações.

### Don'ts (Não Fazer)
- Não usar neumorphism ou glassmorphism pesado.
- Não introduzir sombras (`shadow-lg`, `shadow-xl`) em cards e sidebars.
- Não espalhar classes utilitárias de cores arbitrárias como `bg-[#123456]` ou margens customizadas `mt-[13px]`.

---

## 8. Fixed Documents vs Responsive Pages (Layout Segregation)

### A. Documentos de Saída Fixa (Pixel-Perfect)
- Propostas A4, Contratos, Vouchers, Recibos e Mapas de Assento de ônibus.
- **Regra**: Container travado em largura física (ex: `w-[794px]` para A4, `w-[400px]` para Story).
- **Zoom**: Controlado client-side usando `transform: scale(zoom)` reativo.

### B. Páginas Responsivas (Fluid Layouts)
- Landing page, Blog, Portal do Viajante, News CMS.
- **Regra**: Viewport adaptável com grid responsivo Tailwind (`md:`, `lg:`).

---

## 9. QA / Audit Rules

Toda alteração deve ser submetida a verificações estritas:
1. `npx tsc --noEmit` para garantir ausência de erros de compilação.
2. `npx vitest run` para cobertura de regressões de testes unitários.
3. Validação de contratos de payloads de API com schemas JSONB do banco.
