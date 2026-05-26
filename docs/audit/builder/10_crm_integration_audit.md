# Auditoria de Integração com CRM


Auditoria de integração de leads, submissão de formulários e mapeamento no CRM.

## 🤝 1. Fluxo de Leads
- O formulário público no bloco `contact` e de pacotes da página pública permite o preenchimento de nome, email e telefone pelo visitante.
- As submissões geram leads reais no funil de vendas do CRM (tabela `leads` ou via Whatsapp direto com token de rastreamento).
- O bloco de pacotes (`packages`) exibe os pacotes em grupo com status `published` e vincula botões de compra à rota de checkout e reservas correspondente do CRM.

