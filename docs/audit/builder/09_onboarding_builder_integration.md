# Fase 9 e 13 - Integração com Onboarding e Agency Public Page

## Integração com Brand Kit e Onboarding
- **Risco/Problema:** O fluxo de onboarding cria o registro da agência no CRM, mas **não** gera automaticamente uma página padrão no `builder_sites`. O usuário entra no Builder com a página em branco (ou default).
- Os componentes de Agência (ex: `HeroAgencyProfileBlock.tsx`) requerem que o usuário digite o nome da agência e cole as URLs do logo na mão. Eles **não** herdam automaticamente do banco de dados `organizations` ou `brand_kit`.
- **Status:** **PARCIAL / FAKE**. A intenção de ter uma página pública existe, mas ela não é "Smart". Ela age apenas como um layout estático onde o usuário digita os dados de novo.

## Portal do Cliente
- Não há blocos que realizem injeção direta de login SSO do portal do cliente, apenas botões de link genéricos.
