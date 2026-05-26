# 01 Current Kanban Gap Analysis

## Gaps de Dados (Viagens, Passageiros e Voos)
O Kanban atual é desvinculado do modelo relacional real (`group_trips`, `flight_segments`, `passengers`). O único vínculo existente é o campo `client_id` e `group_trip_id`. Todos os outros dados são colocados num objeto `metadata` que não tem tipagem forte de segmentos aéreos.

- **Falta Tabela Relacional:** As operações exigem validação por "trecho" e "passageiro", mas os dados estão num blob flat por Card.
- **Falta Vínculo PNR:** O PNR ("Localizador") deveria estar vinculado a um passageiro/trecho (Ticket) ou no mínimo segmentado por companhia operadora. Atualmente é apenas uma string solta `flight_locator`.

## Gaps Operacionais (Check-in e Links)
A regra de negócio exige que o check-in direcione ao canal oficial da companhia de acordo com os parâmetros (PNR, Sobrenome).
- **Ação Fake Atual:** O botão "Abrir Check-in Online" apenas redireciona para a string livre inserida em `airline_checkin_url`.
- **Geração de URL Ausente:** O sistema não resolve URLs com base nos dados. Exemplo: um voo LATAM precisaria gerar a URL injetando o PNR e Last Name, o que não ocorre.

## Gaps UI/UX
- **Visualização Genérica:** O Drawer atual usa Tabs/Sections genéricas (`embarque`, `docs`, `notas`, `vinculos`). O PRD exige abas precisas: `Check-in e cartões`, `Bagagem`, `Voucher`, etc.
- **Sem Anexos Reais:** Os bilhetes e cartões de embarque deveriam ser armazenados via Supabase Storage (`boarding_pass_documents`). O sistema atual tem apenas checklists textuais.
