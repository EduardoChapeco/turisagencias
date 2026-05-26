# 03 Airline Links Registry

## Registros Oficiais Prioritários
O sistema irá popular a tabela `airline_link_registry` com as seguintes definições verificadas (que atuarão como regras globais para o "Botão de Check-in").

### LATAM Airlines (LA)
- **Tipo de link**: `checkin`
- **Official URL**: `https://www.latamairlines.com/br/pt/minhas-viagens`
- **Deep Link Template**: `https://www.latamairlines.com/br/pt/cartao-de-embarque?orderId={{orderId}}&lastName={{lastName}}&segmentIndex={{segmentIndex}}&itineraryId={{itineraryId}}&tripPassengerId={{tripPassengerId}}`
- **Campos Obrigatórios**: `orderId`, `lastName`, `segmentIndex`, `itineraryId`, `tripPassengerId` (para Deep Link). Para página genérica: `booking_reference`, `last_name`.
- **Janela**: Típica de 48h antes do voo.
- **Status**: `needs_review` (Validação humana será necessária antes de habilitar Deep Link agressivo em PRD).

### GOL Linhas Aéreas (G3)
- **Tipo de link**: `checkin`
- **Official URL**: `https://b2c.voegol.com.br/checkin/`
- **Deep Link Template**: Sem prefill estável público. Usar redirect e exibir os dados (Localizador, Origem) para cópia fácil pelo Agente.
- **Campos Obrigatórios**: `booking_reference`, `departure_airport_iata`.

### Azul Linhas Aéreas (AD)
- **Tipo de link**: `checkin`
- **Official URL**: `https://www.voeazul.com.br/br/pt/home/check-in`
- **Deep Link Template**: N/A (Usar pre-fill genérico se disponível na API deles).
- **Campos Obrigatórios**: `booking_reference`, `origin`.

### TAP Air Portugal (TP)
- **Tipo de link**: `checkin`
- **Official URL**: `https://www.flytap.com/pt-br/check-in`
- **Campos Obrigatórios**: `booking_reference`, `last_name`.
