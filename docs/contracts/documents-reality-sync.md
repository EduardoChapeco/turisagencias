# Contratos & Documentos — Reality Sync (PR-08)

## O Cenário Anterior
A interface de contratos exibia "Assinado", "Enviado", mas o fluxo de armazenamento imutável do cofre e os templates não estavam totalmente mapeados no banco e a UI assumia campos inexistentes (ex: assinaturas complexas).

## Solução e Validação (Matriz UI vs DB)
Ao analisar o `types.ts` e as migrations recentes (ex: `20260527000009_omega_v8_vault_immutability.sql`), validamos que:

1. **`contract_records`**: A tabela principal existe, possui RLS, guarda o `pdf_url` no bucket `contract-documents`.
2. **Assinaturas**: O tracking é real (`signed_at`, `ip_address`, `device_info`).
3. **Imutabilidade**: Garantida pelo vault e RLS restritivo.
4. **`contract_templates`**: Tabela real, onde os administradores criam os modelos HTML.

**GAPs Identificados:** Nenhum gap crítico estrutural (o schema cobre o essencial). O foco aqui será manter as Edge Functions geradoras de PDF estritamente tipadas.
