# Buttons Audit — Turis Agências

This audit maps button component usage, identifying custom wrappers and standard UI Button violations.

---

## 1. Native `<button>` Tags Violations (Should consume `Button`)

Standard buttons must be imported from [src/components/ui/button.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/ui/button.tsx) to guarantee consistency in hover, active, focus, outline, and focus ring accessibility states.

| File | Line | Usage | Custom Styles | Class | Correct Action |
|---|---|---|---|---|---|
| [AppLayout.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/AppLayout.tsx) | 50 | `<button className="md:hidden ...">` | Mobile toggle menu styles | `DS_DESVIO_MODERADO` | Replace with `Button` size `icon` |
| [AppLayout.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/AppLayout.tsx) | 81 | `<button className="group flex items-center ...">` | Profile dropdown wrapper | `DS_DESVIO_MODERADO` | Replace with standard `Button` size `icon` or keep flat styling |
| [ClientEditSheet.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/ClientEditSheet.tsx) | 406 | `<button className="absolute right-3 ...">` | Absolute position Close icon | `DS_DESVIO_LEVE` | Replace with standard `Button` variant `ghost` size `icon` |
| [ClientEditSheet.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/ClientEditSheet.tsx) | 615 | `<button type="button" ...>` | Tag removal inline buttons | `DS_DESVIO_LEVE` | Replace with standard `Button` variant `ghost` size `xs` |

---

## 2. Buttons Style Violations (Bypassing Variants)

| File | Line | Component | Styling Segment | Class | Correct Action |
|---|---|---|---|---|---|
| [ClientEditSheet.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/ClientEditSheet.tsx) | 392 | `Button` | `border-vj-green text-vj-green hover:bg-vj-green hover:text-white` | `DS_HARDCODE` | Consume semantic variants `outline` or `success` |
| [Proposals.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/pages/Proposals.tsx) | 105 | `Button` | `bg-vj-green hover:bg-vj-green/90 font-bold gap-1.5 shadow-sm` | `DS_HARDCODE` | Consolidate green to Royal Blue default primary or use `success` |
| [PublicProposal.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/pages/PublicProposal.tsx) | 144 | `Button` | `bg-vj-green text-white hover:bg-vj-green/90 text-xs font-bold gap-1.5 shadow-sm` | `DS_HARDCODE` | Remove shadow and hardcoded hover overrides |
