# Implementation PRs Recomendados (Segurança)

Para fechar os gaps reportados pela Red Team, as seguintes ações de PR são imediatas:

### PR-SEC-01: Nuclear RLS Fix & Tokens
- Reforçar que a coluna `token_hash` na tabela `traveler_tokens` nunca vaze num `SELECT *`.
- Atualizar a função RPC `get_public_quotation` para verificar um TTL (Time-To-Live) no token.

### PR-SEC-02: Hardening do Storage 
- Alterar as policies dos Buckets públicos para aplicar a restrição MIME Type explicitamente bloqueando `image/svg+xml`.

### PR-SEC-03: XSS Purify Pipeline
- Envolver todos os dados injetados via banco no Builder com o módulo `DOMPurify` no processo de renderização React (`VisualBuilder` e `PublicSiteView`).
