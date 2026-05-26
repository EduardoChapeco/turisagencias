# Forms & Inputs Audit — Turis Agências

This audit maps form inputs and field groups across the app, ensuring proper labels, validation states, and compliance with the base UI kit.

---

## 1. Native `<input>` Tags Violations (Bypassing `Input` / `FormField`)

While hidden file inputs `<input type="file" className="hidden" />` triggered through React `useRef` are permitted exceptions, native text, date, or number inputs are violations and must use the base UI [input.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/ui/input.tsx) or [form.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/components/ui/form.tsx).

| File | Line | Usage | Custom Styles | Class | Correct Action |
|---|---|---|---|---|---|
| [Analytics.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/pages/Analytics.tsx) | 288 | `<input type="date" ...>` | Standard inline styles | `DS_DESVIO_MODERADO` | Replace with `<Input type="date" />` |
| [ContractRecords.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/pages/ContractRecords.tsx) | 279 | `<input ...>` | Custom class text inputs | `DS_DESVIO_MODERADO` | Replace with `<Input />` component |
| [KanbanCardPage.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/pages/KanbanCardPage.tsx) | 374 | `<input type="checkbox" ...>` | Inline checkbox elements | `DS_DESVIO_LEVE` | Replace with custom Checkbox component from ui kit |
| [Onboarding.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/pages/Onboarding.tsx) | 739 | `<input type="text" ...>` | Native text styling | `DS_DESVIO_GRAVE` | Replace with Shadcn `<Input />` |
| [Onboarding.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/pages/Onboarding.tsx) | 773 | `<input type="url" ...>` | Native URL text input | `DS_DESVIO_GRAVE` | Replace with Shadcn `<Input />` |
| [Onboarding.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/pages/Onboarding.tsx) | 792 | `<input type="file" ...>` | Native file selector | `DS_DESVIO_MODERADO` | Replace with standard `AvatarUploader` or `MediaUploader` |

---

## 2. Inconsistencies in Validation Errors & Focus States

1.  **Browser Native Tooltips:** In [PublicTravelerForm.tsx](file:///c:/Users/Usuario/Documents/turisagencias/src/pages/PublicTravelerForm.tsx), visual validation states rely on native HTML browser prompts instead of standard Sonner/toast errors, giving a cheap web feel.
2.  **Focus Ring Accessibility (`ring-offset`):** Native checkbox and select elements do not implement high-contrast focus borders (`focus-visible:ring-2 focus-visible:ring-vj-primary`), creating accessibility challenges for keyboard navigators.
