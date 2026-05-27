# Separação do Master Admin (SaaS)

Atualmente, o Turis Agências pode sofrer do problema de "UI Poluída", onde menus de configuração de sistema vazam para agentes de viagens, ou pior, onde o painel de administração da plataforma (gerenciar agências, planos e logs) se mistura com o CRM de uma agência.

## Arquitetura de Isolamento

Para garantir que o Super Admin Global seja blindado e as operações da agência limpas:

### 1. Separação de Rotas e Layout
A aplicação Front-end terá dois layouts Shell primários:
- `AgencyShell` (Rotas `/app/*`): O CRM, Kanban, Comissões e configurações da organização atual.
- `PlatformShell` (Rotas `/master-admin/*`): O painel administrativo global SaaS. 

### 2. Autenticação e Desafio por PIN
Acessar qualquer rota `/master-admin/*` não dependerá apenas da flag `is_super_admin = true` no banco.
Exigiremos um `admin_pin_challenge` verificado server-side, onde a sessão é curta (ex: dura apenas 15 minutos de inatividade).

### 3. Redução de Vetores de Ataque
O código-fonte de administração global (`/master-admin/`) pode, eventualmente, usar `lazy loading` extremo (Code Splitting). Assim, os chunks de código JavaScript relacionados ao Super Admin nem sequer serão carregados ou baixados no navegador do cliente que faz login como `Agente de Viagens`, escondendo segredos de negócio e lógicas internas contra engenharia reversa.
