# CMS Schema do Builder

## Tabelas Mínimas Recomendadas

```sql
-- 1. builder_sites: Gerencia os domínios e a configuração global do site da agência
CREATE TABLE builder_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id),
  type varchar NOT NULL, -- 'website', 'linkbio', 'blog'
  slug varchar NOT NULL UNIQUE,
  custom_domain varchar UNIQUE,
  status varchar DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. builder_pages: As páginas individuais de cada site
CREATE TABLE builder_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES builder_sites(id) ON DELETE CASCADE,
  slug varchar NOT NULL,
  title varchar NOT NULL,
  published_version_id uuid, -- referência circular para a versão ativa
  created_at timestamptz,
  updated_at timestamptz
);

-- 3. builder_page_versions: Histórico de todas as publicações
CREATE TABLE builder_page_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES builder_pages(id) ON DELETE CASCADE,
  version_number int NOT NULL,
  content_json jsonb NOT NULL,
  seo_json jsonb,
  status varchar, -- 'published', 'archived'
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- 4. builder_assets: Mídias enviadas via construtor
CREATE TABLE builder_assets (
  id uuid PRIMARY KEY,
  org_id uuid REFERENCES organizations(id),
  file_url varchar,
  asset_type varchar,
  size_bytes bigint,
  created_at timestamptz
);
```

As tabelas de Formulários (`builder_form_submissions`) e Analytics (`builder_analytics_events`) são tratadas separadamente no core para alimentar o CRM diretamente.
