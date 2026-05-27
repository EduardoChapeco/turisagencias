# Fase 5 - Auditoria de Segurança (Red Team)

Testes de segurança na arquitetura de edição e renderização do Builder.

## 1. Cross-Site Scripting (XSS)
- **Risco:** Injeção de scripts no rico conteúdo dos blocos.
- **Resultado:** O React lida automaticamente com a conversão de strings. Uma busca minuciosa não encontrou o uso indiscriminado de `dangerouslySetInnerHTML`. 
- **Status:** **Mitigado (SEGURO)**.

## 2. Insecure Direct Object Reference (IDOR) & RLS
- **Risco:** Um tenant (Agência A) editar a página do tenant B.
- **Resultado:** A migration `20260526000002_omega_v7_builder_schema.sql` exige que as tabelas tenham RLS usando a policy:
  `USING (org_id = public.get_my_org_id())`.
- **Status:** **Mitigado (SEGURO)** no backend. (Vide alerta sobre schema drift no relatório 02).

## 3. Storage e Uploads
- **Risco:** Upload de SVGs maliciosos ou executáveis no bucket público.
- **Resultado:** Depende diretamente do Bucket Configuration do Supabase. Pela análise do `MediaPicker.tsx`, não há limitação hardcoded de mimetype no cliente. Requer atenção nas políticas do Bucket.
- **Status:** **Alerta Amarelo**.

## 4. SSRF (Server-Side Request Forgery) em Blocos Dinâmicos
- **Risco:** Blocos que buscam URLs externas (ex: RSS).
- **Resultado:** O CMS atual não parece expor componentes que o usuário possa forçar o backend a puxar HTML de endpoints não validados via Edge Functions de renderização. 
- **Status:** **Não Aplicável / Seguro**.

> [!TIP]
> A arquitetura estrita de `BlockDef` sem usar eval() ou innerHTML protege incrivelmente bem contra XSS.
