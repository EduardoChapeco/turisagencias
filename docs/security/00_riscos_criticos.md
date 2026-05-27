# Auditoria de Segurança: Riscos Críticos

Este documento lista os riscos de segurança de alto nível identificados na arquitetura atual do Turis Agências, com foco em RLS, spoofing, vazamento de dados e autenticação.

## 1. RLS (Row Level Security) e Visibilidade de Dados
**Descrição do Risco:**
O banco de dados utiliza RLS para garantir que um Agente de Turismo só veja os dados pertencentes ao seu `org_id` (sua agência).
No entanto, em tabelas como `kanban_cards` e `proposals`, é necessário assegurar que o RLS não apenas filtre pelo `org_id`, mas também limite a visibilidade por `agent_id` ou `owner_id`, caso a agência não queira que um vendedor veja a carteira de clientes do outro.
**Impacto:** Médio a Alto (Conflito de carteira de clientes).
**Status:** Quebrado em alguns cenários / A auditar e reforçar.

## 2. Separação: Global Master vs Admin Agência
**Descrição do Risco:**
Se a dashboard (`AiDashboard.tsx` ou similar) carregar dados baseados apenas no client-side role check sem impor políticas RLS estritas, um usuário mal intencionado poderia manipular o state local (ex: via DevTools no `useAuthStore`) e "se dar" o status de Super Admin, podendo ver chaves de API globais.
**Impacto:** Crítico (Vazamento em massa ou Account Takeover de outras Agências).
**Mitigação Mínima:** Tudo que for dado do Super Admin deve vir de APIs / Views protegidas por um check server-side (`auth.uid() IN (SELECT id FROM super_admins)`).

## 3. Tokens de Acesso Temporário e Magic Links
**Descrição do Risco:**
O Portal do Viajante (`TravelerPortal.tsx`) usa um `token` público para carregar as informações do embarque e vouchers sem exigir login. Se os tokens não expiram (sem TTL) ou são facilmente adivinháveis (sequenciais/curtos em vez de UUIDs), um atacante poderia fazer "force browsing" e iterar sobre milhares de URLs de vouchers alheios, vazando dados de passageiros.
**Impacto:** Alto (Vazamento de PII e dados de Viagem).
**Mitigação Mínima:** Uso obrigatório de UUID v4 para links públicos e expiração automática pós-viagem.

## 4. Manipulação de Preços no Frontend (Comissões e Checkout)
**Descrição do Risco:**
No bloco `FinancePaymentButtonBlock`, a URL ou payload de checkout precisa ser assinada. Se o frontend apenas envia `amount: 1500` para a Edge Function de cobrança, um atacante pode interceptar a requisição e mudar o valor para `amount: 10`, comprando a viagem com desconto não autorizado.
**Impacto:** Crítico (Prejuízo Financeiro direto).
**Mitigação Mínima:** A Edge Function de processamento de pagamentos deve SEMPRE recalcular e buscar o preço validado na tabela `proposals` ou `quotations` em vez de confiar no valor enviado no payload.

## 5. XSS (Cross-Site Scripting) em Builder e Blogs
**Descrição do Risco:**
O Visual Builder salva blocos de HTML/JSON estruturados. Se os campos (como os nomes dos Blocos, Rich Text) não forem devidamente escapados ao serem renderizados pelo `PublicSiteView.tsx`, um atacante com permissão de Agente pode inserir um `<script>alert(document.cookie)</script>` na landing page pública da sua própria agência, infectando os visitantes finais.
**Impacto:** Médio a Alto (Phishing ou session hijacking do cliente final).
**Mitigação:** Uso do DOMPurify ou do comportamento padrão do React (que já escapa strings normais). Auditar qualquer uso de `dangerouslySetInnerHTML`.
