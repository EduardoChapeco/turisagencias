# 04 Edge Functions Plan

## Funções Planejadas

1. **`airline-registry-refresh`**
   - **Objetivo**: Validar links oficiais para evitar URLs mortas.
   - **Ação**: Faz ping HTTP `HEAD` no `official_url` e atualiza `last_verified_at` e `verification_status`.

2. **`airline-build-action-link`**
   - **Objetivo**: O motor principal que compila a URL de check-in / bagagem baseada nas regras de `airline_link_registry`.
   - **Ação**: Valida payload, substitui tags `{{key}}`, mascara PII, loga na tabela `trip_airline_action_links` e devolve a string pronta.

3. **`boarding-update-checkin-status`**
   - **Objetivo**: Motor de transição de estado da coluna do kanban (`not_available` -> `available` -> `in_progress` -> `done_external`).

4. **`boarding-attach-pass`**
   - **Objetivo**: Assinar e transacionar o upload de PDF/Pkpass para a tabela de storage `boarding_pass_documents`.

5. **`boarding-send-whatsapp-message`**
   - **Objetivo**: Renderizar templates de mensagens com localizador e link (evitando PII desnecessária) para cópia rápida do Agente.

6. **`boarding-create-client-portal-link`**
   - **Objetivo**: Gerar e revogar tokens magic-link temporários para o passageiro acessar seu cartão e status via portal.
