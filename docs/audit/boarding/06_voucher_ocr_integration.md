# 06 Voucher OCR Integration

## Necessidades
A extração de vouchers (já existente na engine `ai_document_extractions` e Deno OCR) deverá popular proativamente:
1. `flight_segments` (cia aérea, IATA origem/destino, horários)
2. `passenger_tickets` (Sobrenomes, PNRs vinculados a passageiros).

## Fallback
Se o OCR extrair PNR, mas não souber atrelar ao Passageiro X ou Y, a UI do Kanban deverá permitir que o Agente faça a associação ("Ligar PNR ABCD a João Silva") antes que o link da companhia possa ser gerado.
