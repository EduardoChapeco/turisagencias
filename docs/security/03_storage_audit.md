# Auditoria de Storage e Edge Functions

## 1. Storage Buckets Audit
Temos buckets como `builder-assets` e `public-media`.

**Regras de Restrição (RLS Storage):**
- **Bucket `builder-assets`**: 
  - `INSERT` só é permitido via JWT válido do usuário, cujo `org_id` deve corresponder ao path da pasta no storage (`/org_id/pasta/arquivo.png`).
  - O tamanho máximo de upload é restrito pelo Supabase para impedir esgotamento de banda/storage (DDoS via Upload).
  - Tipos permitidos: `image/jpeg`, `image/png`, `image/webp`. Arquivos `.svg` ou `.html` são estritamente negados para evitar injeção de XSS na borda pública.

## 2. Edge Functions Audit
**Ameaça:** Uma Edge Function (ex: `submit-payment-proof` ou chamadas de IA) exposta sem verificação de JWT.
**Mitigação:** Todas as Deno Edge Functions do Supabase importam o cabeçalho `Authorization: Bearer <token>`. A primeira instrução de cada função DEVE chamar `supabase.auth.getUser(token)` e validar se a sessão não é nula, e se as roles ou `org_id` correspondem à ação solicitada. Nenhuma operação de banco dentro da Deno Function deve ser executada usando o `service_role_key` se puder ser executada com o `user_token` (herdando o RLS).
