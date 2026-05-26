# 08 WhatsApp Templates

## Integração Segura
As mensagens do WhatsApp geradas pela Edge Function `boarding-send-whatsapp-message` não farão disparo automático em massa (para evitar banimentos da Meta). Elas gerarão o Payload formatado para a tela do Agente, permitindo copiar/colar via WhatsApp Web ou acionar a API oficial da Baileys (caso plugada).

## Templates

### 1. Missing Data (Faltam Dados)
```text
Olá, {{primeiroNome}}! Para finalizarmos seu pré-embarque da viagem para {{destino}}, precisamos confirmar alguns dados:
{{listaCamposFaltantes}}

Você pode preencher pelo link seguro abaixo:
{{portalLink}}
```

### 2. Check-in Disponível (Aviso Padrão)
```text
Olá, {{primeiroNome}}! Seu check-in já está disponível para o voo {{companhiaAerea}} {{numeroVoo}} de {{origem}} para {{destino}}.

Acesse pelo link oficial:
{{linkGeradoOficial}}

Tenha em mãos seu documento e o localizador {{pnrMascarado}}.
```

### 3. Cartão de Embarque Anexado
```text
Olá, {{primeiroNome}}! Segue seu cartão de embarque/informações do voo.

Voo: {{companhiaAerea}} {{numeroVoo}}
Trecho: {{origem}} → {{destino}}
Data/horário: {{dataEmbarque}}
Localizador: {{pnr}}

Recomendamos chegar com antecedência e conferir documentos.
Link Seguro para baixar PDF: {{portalSignedLink}}
```
