# Regras de Cálculos de Comissões (Canonização de Planilhas)

Após a análise dos requisitos, modelamos um motor canônico (server-side) para converter as antigas planilhas de agentes no sistema Antigravity.

## Variáveis do Modelo
- `venda_bruta`: Preço final pago pelo cliente.
- `taxas`: Encargos como embarque, emissão (geralmente não geram comissão base).
- `over_bruto`: Valor de over repassado pela operadora (markup adicional).

### Passo 1: Descobrir a Base Comissionável
A agência não recebe comissão sobre as taxas da operadora, e o over é tratado à parte.
`tarifa_base_comissao = venda_bruta - taxas - over_bruto`

### Passo 2: Calcular a Taxa sobre o Over
Se o pagamento foi no cartão, a operadora cobra taxa sobre o markup.
`over_taxa_operadora = (forma_pagamento == 'CC') ? over_bruto * taxa_operadora_configurada : 0`
`over_liquido = over_bruto - over_taxa_operadora`

### Passo 3: Aplicar a Meta (Tier Commission)
Se a `venda_bruta_mensal` do agente (Total Sales do `agent_commission_periods`) exceder a meta (ex: 100k):
`percentual_comissao_meta = 1.5%` (Senão `1.0%`)

### Passo 4: O Pagamento Final
`comissao_base = tarifa_base_comissao * percentual_comissao_meta`
`comissao_over = over_liquido * percentual_over_do_agente (ex: 30%)`

**`comissao_total = comissao_base + comissao_over + (incentivos - descontos)`**

## Proteção Sistêmica
Estes cálculos devem viver exclusivamente no Back-End. O Front-end fornece o "Input" (`venda_bruta`, `taxas`, `over_bruto`) e um *Database Trigger* ou *Edge Function* computa e bloqueia a inserção de campos como `comissao_total` vindos da UI.
