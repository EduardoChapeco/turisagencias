---
name: contracts-vouchers-auditor
description: Auditar contratos, propostas, vouchers e geradores de PDF/PNG. Verificar cofre imutável, assinaturas e templates.
---

# Contracts & Vouchers Auditor

## Escopo
- `ContractTemplates.tsx` — templates editáveis
- `ContractRecords.tsx` — histórico de contratos
- `VoucherMasterPipeline.tsx` — gerador de vouchers OCR
- `PublicProposal.tsx` — visualização pública com aceite
- `PublicBookingVoucher.tsx` — voucher público
- `SignatureCertificate.tsx` — certificado de assinatura
- `contract_vault_records` + `contract_signatures` — cofre imutável

## Checklist

### Templates
- [ ] Templates salvos em tabela real (não hardcoded)?
- [ ] Variáveis dinâmicas ({{nome_cliente}}, {{destino}}) funcionam?
- [ ] Template engine real (não string.replace naive)?

### Proposta / Aceite
- [ ] Aceite registra IP + User Agent + Timestamp?
- [ ] Hash SHA-256 calculado no servidor?
- [ ] Registro na `contract_vault_records` é imutável (trigger WORM)?

### Voucher
- [ ] Nome da agência dinâmico (`organization.name`)?
- [ ] Logo dinâmica (`organization.logo_url`)?
- [ ] PDF/PNG exportado sem dados sensíveis B2B?

### Cofre
- [ ] Trigger `block_vault_tampering` ativo?
- [ ] UPDATE e DELETE bloqueados?
- [ ] Certificado público acessível via `/certificate/:hash`?

## Saída Obrigatória

`docs/audit/contracts_vouchers_audit.md`
