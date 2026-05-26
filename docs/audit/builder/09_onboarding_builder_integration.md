# Auditoria de Integração com Onboarding


Auditoria de herança dos dados coletados no Onboarding da agência para os canais do Builder.

## 🔄 1. Integração com o Brand Kit e Dados Fiscais
- Ao carregar as páginas públicas ou os templates padrão no editor, o builder pesquisa os dados da organização na tabela `organizations`.
- **Logotipos e Slogans**: Se a agência já passou pelo fluxo de Onboarding, o editor insere por padrão a logo e o slogan definidos no Brand Kit nos blocos de cabeçalho e Hero.
- **Dados Fiscais e Endereço**: Os blocos de contato e rodapé puxam dinamicamente a Razão Social, CNPJ/CPF, endereço físico e horário de funcionamento cadastrados na tabela, eliminando campos mockados.

