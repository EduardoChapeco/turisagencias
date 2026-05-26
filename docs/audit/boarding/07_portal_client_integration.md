# 07 Portal Client Integration

## Acesso do Cliente
O cliente deve visualizar uma página focada e segura de check-in (`/portal/:token/checkin`).

1. A URL do portal será gerada via Edge Function garantindo um Token temporário.
2. No Portal, o Cliente verá o seu Cartão de Embarque (se anexado pelo agente) através de uma **Signed URL** gerada dinamicamente com validade de 2h.
3. Botões Públicos: O portal do cliente utilizará a mesma Edge Function (`airline-build-action-link`) sob o capô, para que ele possa ele mesmo clicar em "Fazer Check-in" e ir pro site da LATAM preenchido, sem expor as credenciais da agência.
