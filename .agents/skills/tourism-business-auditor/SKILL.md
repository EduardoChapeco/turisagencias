---
name: tourism-business-auditor
description: Verificar se o software reflete com fidelidade a operação real de uma agência de turismo.
---

# Tourism Business Auditor

## Missão
Um operador de agência não pode usar um sistema que não reflete sua realidade. Auditar cada etapa do fluxo de vendas e operação.

## Fluxo Canônico a Auditar

```
Lead entra (site/WhatsApp/referência)
↓
Capturado no CRM (leads table)
↓
Qualificado (scoring IA opcional)
↓
Cotação criada (quotations + scenarios)
↓
Proposta enviada (proposals + PDF)
↓
Cliente aceita (proposal_signatures)
↓
Reserva feita (quotations status=booked)
↓
Formulário de viajantes (travelers table)
↓
Contrato gerado (contract_vault_records)
↓
Pagamento registrado (payments)
↓
Voucher gerado (vouchers)
↓
Embarque (group_trips ou departures)
↓
Pós-venda (satisfaction, NPS)
↓
Comissão calculada (agent_commission_entries)
```

## Por cada etapa verificar:
- Existe tabela? Migration? RLS?
- Existe UI? É funcional ou mockada?
- Existe hook? Query real?
- Documentado?

## Saída Obrigatória

`docs/audit/tourism_business_audit.md`
