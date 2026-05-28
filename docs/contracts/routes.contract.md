# Contract: System Routes & Navigation

Este contrato define a matriz de roteamento (Route Registry) oficial da plataforma Turis Agências.

## 1. Visão Geral

Todas as rotas do aplicativo estão tipadas através do `AppRouteContract`. O `App.tsx` e o `AppSidebar.tsx` não inventam rotas ou menus independentes, eles leem das fontes:
- `src/app/router/routeRegistry.ts` (definição canônica de rota e segurança)
- `src/app/navigation/navigationRegistry.ts` (definição de menu baseada em papeis)
- `src/app/guards/routePermissions.ts` (lógica de verificação de papel e dependências de dados)

## 2. Tipos Canônicos

```typescript
type AppRouteLayout = 'app' | 'admin_master' | 'agency_admin' | 'agent' | 'public' | 'client_portal' | 'auth';
type AppRouteVisibility = 'private' | 'public' | 'token' | 'admin_secret';

type AppRouteContract = {
  id: string;
  path: string;
  component: string;
  layout: AppRouteLayout;
  visibility: AppRouteVisibility;
  requiredRoles: string[];
  dataDependencies: string[];
  tables?: string[];
  rlsCritical: boolean;
};
```

## 3. Topologia Atual

| ID | Path | Layout | Roles | RLS Critical |
|---|---|---|---|---|
| `auth_login` | `/login` | `auth` | `[]` | No |
| `onboarding` | `/onboarding` | `app` | `[]` | Yes |
| `admin_dashboard` | `/admin/dashboard` | `admin_master` | `['super_admin']` | Yes |
| `crm_clients` | `/clients` | `app` | `['org_admin', 'super_admin', 'agent', 'support']` | Yes |
| `sales_quotations` | `/quotations` | `app` | `['org_admin', 'super_admin', 'agent', 'support']` | Yes |
| `fin_payments` | `/finance/payments` | `agency_admin` | `['org_admin', 'super_admin', 'support']` | Yes |
| `cms_builder` | `/site-builder` | `app` | `['org_admin', 'super_admin', 'agent', 'support']` | Yes |

*Nota: a lista completa em tempo de execução encontra-se na constante exportada `routeRegistry`.*

## 4. Auditoria Contínua
Toda rota adicionada deve obrigatoriamente ser mapeada no arquivo `routeRegistry.ts`. Se um componente de tela for adicionado sem o registro no `routeRegistry`, o teste `routes-contract.test.ts` (futuro PR-13) irá quebrar a build de CI.
