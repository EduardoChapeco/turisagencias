# 05 Kanban UI Plan

## Cards Compactos
- **Mudança**: Exibir distintivos (badges) reais de "Voucher", "Check-in", "Cartão" consultando `trip_checkin_status`.
- **Alertas**: Implementar um sinalizador de "Campos Faltantes" (Amarelo) se o Registry da Companhia Principal precisar de um dado (Ex: PNR) e ele estiver vazio no card.

## Drawer Completo (`DepartureCardSheet.tsx`)
- **Aba Resumo**: Destino, datas e dados essenciais.
- **Aba Passageiros/Voos**: Lista de todos os segmentos aéreos associados a `trip_id`.
- **Aba Check-in e Cartões (Nova)**: Interface primária. Para cada trecho:
  - Exibe o Botão de "Fazer Check-in".
  - Se a Edge Function retornar `missing_data`, renderiza Inline Inputs (Sobrenome, OrderId) para preencher ali mesmo, validando e destravando o Deep Link.
  - Seção de drag&drop para PDF do Cartão de Embarque.
- **Aba Documentos / Portal**: Status de envio e preview da URL mágica.
