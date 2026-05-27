# Auditoria de Tokens e Slugs

## 1. Tokens Temporários (Magic Links e Sessões B2C)
O Portal do Viajante não exige login tradicional (senha). Ele usa um "Magic Link Token" para conceder acesso às reservas, faturas e boletos.

**Regras de Geração:**
- Os tokens devem estar salvos no banco de dados (`traveler_tokens`) como um hash forte e não uma string em plain-text adivinhável.
- Deve haver um `expires_at`.
- Para ações definitivas (como Confirmar Pagamento no Gateway Stripe/Asaas), o token passa por Edge Function validation.

## 2. Slugs de Rotas Públicas
Rotas como `turisagencias.com/minha-agencia/portal` ou `/[slug]/proposta/:id`.

**Políticas Anti-Takeover:**
- O sistema bloqueia a alteração do slug da agência caso outro usuário já detenha aquele slug.
- A exclusão de um slug joga a rota para um banco de redirecionamentos (`builder_redirects`) caso a agência deseje fazer proxy de slugs legados 301.
