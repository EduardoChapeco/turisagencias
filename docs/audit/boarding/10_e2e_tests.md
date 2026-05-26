# 10 E2E Tests Plan

## Arquitetura de Testes Sugerida (Playwright / Vitest)

1. `boarding-kanban-load.spec.ts` -> Garante que o frontend renderiza os cards com os badges certos com base na carga do DB real.
2. `boarding-card-drawer.spec.ts` -> Testa se os dados populam o drawer corretamente.
3. `boarding-checkin-link-[latam|gol|azul].spec.ts` -> Testa a Edge Function para cada um dos Registry Providers com mocks de resposta.
4. `boarding-missing-fields.spec.ts` -> Testa se a UI trava o link e pede as Infos extras quando tentamos fazer um checkin LATAM passando PNR Vazio.
5. `boarding-storage-security.spec.ts` -> Bate em uma API de recuperar Boarding Pass com token de outro cliente e avalia se recebe 403 Forbidden.
