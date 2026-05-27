# Roles & Permissions Matrix

Para acabar com a mistura de painéis (Dashboard vs Master Admin), a separação de papéis na plataforma obedece à seguinte estrutura, protegida através de RLS (Row Level Security) e verificação Edge-Side.

## 1. Super Admin Global
*Apenas funcionários e devs da Plataforma SaaS (Turis Agências).*
- **Visibilidade:** Rota `/master-admin` (protegida por PIN/MFA e checagem de sessão curta).
- **Escopo:** Todas as agências (`organizations`), Fila de Agentes, Feature Flags, Logs de Servidor (Edge Functions), Gerenciamento Financeiro SaaS e Templates Globais.
- **Isolamento:** Este painel não divide `Layout` com o CRM dos usuários e usa Auth Token explícito do banco de dados global.

## 2. Admin Agência (Proprietário / Diretor)
*Acesso Master dentro do seu Tenant (`org_id`).*
- **Escopo:** Vê todos os leads, comissões de todos os agentes da sua organização, e pode configurar metas. Modifica permissões internas. Pode publicar ou despublicar o Site/Builder. Pode gerenciar API Keys de IA da agência.
- **Configurações Limitadas:** Não tem acesso a dados de outras agências nem a logs técnicos/sistema.

## 3. Financeiro
*Focado no Backoffice.*
- **Escopo:** Pagamentos, fechamentos de comissão, comprovantes e faturamento.
- **Não acessa:** Configurações de domínio, builder, perfis de integração AI profunda (geralmente).

## 4. Agente de Viagens
*Usuário principal de rotina.*
- **Escopo:** Lida com orçamentos, CRM, Kanban e Vouchers. Vê apenas seus próprios leads (ou os que lhe foram atribuídos).
- **Segurança Oculta:** NÃO visualiza "comissão over_bruto / over_taxa_operadora" ou regras de margens globais de agência. Vê apenas sua comissão final calculada. Não vê dados de outros agentes (protegido via `RLS` por `agent_id`).

## Recomendação de RLS Core
Nenhum "role" é confiado se for setado no lado do cliente (via `localStorage` ou variável de React). 
O Supabase injeta o `app.role` ou `org_role` no JWT claims através de hooks do `auth.users`, ou através da tabela `user_roles`, validado estritamente por políticas `auth.uid() = user_id`.
