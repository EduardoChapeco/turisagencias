# Telas Financeiras Necessárias

## 1. Visão do Financeiro (Admin Agência)
Apenas a *role* `finance` ou `admin` da org tem acesso:
- **Painel de Fechamento**: Visão mensal consolidada (Total de vendas bruto, total de over, repasse aos agentes).
- **Filtros Flexíveis**: Filtrar por `Operadora` ou `Agente`.
- **Botão de Ajuste**: Permite que o financeiro aplique uma modificação manual `adjustment_amount` na comissão (ex: Estorno), sendo obrigatório o preenchimento do campo `change_reason` (motivo do estorno).
- **Conferência (Conciliação)**: Botão de toggle "Marcar Venda como Conferida" na linha da tabela de comissões, travando edições.

## 2. Visão do Agente de Viagens (Minhas Comissões)
Apenas a *role* `agent` tem acesso, restrito aos seus próprios dados:
- **Resumo do Mês Atual**: Meta (progress bar até os 100k+), Comissão Projetada e Comissão Confirmada.
- **Transparência Limitada**: O agente enxerga `Venda Bruta` e `Taxas`, além de ver a sua `Comissão Final`. Ele NÃO enxerga as alíquotas de negociação da agência com a operadora, protegendo o *know-how* comercial.
- **Visualização de Pendências**: Mostra boletos atrasados de seus clientes que podem bloquear o repasse da comissão.
