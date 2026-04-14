

# Plano de Correção: Build Errors

## Contexto
O sistema foi refatorado externamente com novas tabelas (`flights`, `itinerary_days`, `quote_hotels`, etc.) e RPCs (`confirm_public_quotation`), mas o `types.ts` auto-gerado ainda não reflete essas tabelas. Isso causa erros de tipo em 3 arquivos + 1 import faltando.

## Correções

### 1. `src/hooks/useHotels.ts` — Propriedades extras no insert
`HotelFormValues` inclui `gallery_urls`, `sections`, `video_url` que não existem na tabela `hotels_bank`. O spread `{ ...payload, org_id }` injeta essas propriedades extras.

**Fix:** Desestruturar o payload antes do insert, separando os campos extras:
```ts
const { gallery_urls, sections, video_url, ...dbPayload } = payload;
// usar dbPayload no insert
```

### 2. `src/hooks/usePoliciesAndExperiences.ts` — Tabelas inexistentes
As tabelas `policy_cache` e `experiences` não existem no banco. São necessárias 2 migrations para criá-las.

**Migration:** Criar tabelas `policy_cache` e `experiences` com RLS `org_id = get_my_org_id()`.

### 3. `src/pages/HotelEdit.tsx` (linha 224) — `X` não importado
O componente usa `<X>` do lucide-react mas não está no import.

**Fix:** Adicionar `X` ao import do lucide-react.

### 4. `src/pages/PublicQuotation.tsx` — Múltiplos problemas
- **RPC `confirm_public_quotation`**: Não existe. Criar migration com a função.
- **Coluna `public_token`**: Não existe na tabela `quotations`. A tabela usa `share_token`. Fix: trocar `.eq('public_token', token)` por `.eq('share_token', token)`.
- **Relações inexistentes** (`itinerary_days`, `flights`, `quote_transfers`, etc.): Essas tabelas não existem no banco. Como o usuário disse que foram criadas externamente mas o types.ts não reflete, a solução é fazer cast `as unknown as any[]` nos acessos a essas relações e usar try/catch no select para fallback ao RPC `get_public_quotation` existente.
- **`cover_title`**: Não existe no tipo `PublicQuotationData`. Adicionar ao interface ou remover referência.

**Abordagem pragmática para PublicQuotation:** Como as sub-tabelas podem ou não existir dependendo do estado do banco, refatorar para usar a RPC `get_public_quotation` como fallback e fazer o select relacional com cast `as any` para evitar erros de tipo até que types.ts se sincronize.

### 5. Migrations necessárias

**Migration A — `policy_cache`:**
```sql
CREATE TABLE public.policy_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  criado_por uuid,
  operadora text NOT NULL,
  operadora_display text,
  tipo text DEFAULT 'condicoes_gerais',
  conteudo jsonb NOT NULL DEFAULT '{}',
  notas_internas text,
  criado_em timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.policy_cache ENABLE ROW LEVEL SECURITY;
-- 4 RLS policies (select/insert/update/delete) com org_id = get_my_org_id()
```

**Migration B — `experiences`:**
```sql
CREATE TABLE public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  nome text NOT NULL,
  tipo text,
  descricao text,
  preco numeric,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
-- 4 RLS policies
```

**Migration C — RPC `confirm_public_quotation`:**
```sql
CREATE FUNCTION public.confirm_public_quotation(
  p_token uuid, p_traveler_name text,
  p_traveler_email text DEFAULT NULL, p_notes text DEFAULT NULL
) RETURNS void ...
-- Updates quotation status to 'confirmed' where share_token = p_token
```

### Resumo de arquivos editados
- `src/hooks/useHotels.ts` — desestruturar extras do payload
- `src/hooks/usePoliciesAndExperiences.ts` — sem mudanças (tabelas criadas via migration)
- `src/pages/HotelEdit.tsx` — adicionar `X` ao import
- `src/pages/PublicQuotation.tsx` — trocar `public_token` → `share_token`, cast relações como `any`, adicionar `cover_title` ao tipo, usar fallback seguro
- `src/types/index.ts` — adicionar `cover_title` ao `PublicQuotationData`
- 3 migrations SQL

