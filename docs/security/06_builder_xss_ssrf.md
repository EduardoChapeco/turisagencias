# Master Admin Security & Proteção Contra XSS/SSRF

## 1. Segurança do Admin Global
O acesso às páginas `/master-admin/*` não carrega tokens secretamente em plain-text no localStorage.
**Restrições:**
1. Sessões expiram após um tempo limite reduzido (ex: 15 minutos de inatividade).
2. Qualquer tentativa de alteração de estado (ex: Excluir uma Agência) enviada do painel Master precisa re-assinar a transação através de um Pin Dinâmico (MFA).
3. A API do Postgres possui uma Policy específica:
   `auth.jwt() -> 'app_role' = 'super_admin'`

## 2. Proteção XSS (Cross-Site Scripting) no Builder
**Riscos de Componentes HTML Customizados e Rich Text:**
- Se deixarmos um criador injetar componentes `<div dangerouslySetInnerHTML={{ __html: block.content }} />`, o código JavaScript `eval()` e tags de script podem roubar tokens de visitantes.
- Todo `<RichText />` publicamente renderizado passa pelo `DOMPurify` no Front-end (React) e Server-Side (no Next.js/SSR caso exista).

## 3. Prevenção de SSRF (Server-Side Request Forgery)
- Módulos que permitem "Importar RSS" ou "Gerar Preview de URL" no painel da agência devem ser roteados via uma API controlada.
- A Edge Function recusará resolver DNS locais (`localhost`, `10.0.x.x`, `192.168.x.x`, infra da AWS/GCP meta-data `169.254.169.254`).
