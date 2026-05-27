# Superfície de Ataque e Ameaças (Attack Surface)

O Turis Agências é uma plataforma Multitenant. A pior vulnerabilidade imaginável é o vazamento trans-tenant (uma agência ler dados da outra) ou a exfiltração de dados B2C (cliente vazando dados de outros clientes).

## Vetores Mapeados e Nível de Risco

| Entidade Crítica | Ameaça (Red Team) | Risco | Mecanismo de Prevenção |
| ---------------- | ----------------- | ----- | ---------------------- |
| **Propostas/Orçamentos** | Alteração de ID na rota `/proposta/:id` para ver propostas alheias. | **CRÍTICO** | RLS e Validação Server-Side no RPC `get_public_quotation`. |
| **Vouchers & Contratos** | Forjar token para visualizar contrato assinado. | **CRÍTICO** | Tokens com Hash de alta entropia. Não usar UUIDs previsíveis se possível. |
| **Upload de Comprovantes** | Enviar malware no portal do cliente (Extensão `php` ou `svg` com script). | **ALTO** | Allowed MIME Types no Supabase Storage. Edge Function anti-malware proxy. |
| **Org ID Payload Injection** | O atacante intercepta POST e muda o campo `org_id` no corpo para salvar dados no concorrente. | **CRÍTICO** | RLS ignorando payload e usando `auth.user_org_id()` derivado do JWT de sessão inalterável. |
| **Magic Links** | Reutilização de Link Expirado ou sem limite de uso. | **MÉDIO** | Controle estrito de `used_count` e `expires_at` via Edge Functions. |
| **SSRF (Server-Side Request Forgery)** | Forçar o CMS do builder ou RSS Reader a puxar dados internos da infraestrutura. | **ALTO** | Isolar requisições web externas através de proxy ou validação restrita de URIs (Fetch Whitelist). |
