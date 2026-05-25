import os

target_dir = r"C:\Users\aline\.gemini\antigravity\brain\08c1643f-bcf3-4020-94b8-feae3553199d"
os.makedirs(target_dir, exist_ok=True)

def write_file(filename, content):
    filepath = os.path.join(target_dir, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Wrote {filename}")

# -------------------------------------------------------------
# File 00: 00_ONBOARDING_INVENTARIO.md
# -------------------------------------------------------------
write_file("00_ONBOARDING_INVENTARIO.md", """# 00 - Inventário do Onboarding Atual

## 1. Objetivo e Escopo
O objetivo deste documento é catalogar exaustivamente todos os arquivos, componentes, rotas, tabelas, stores e serviços que compõem o onboarding atual do sistema **Turis Agências**, identificando onde estão declarados e o que controlam na prática.

---

## 2. Inventário de Arquivos e Componentes

### 2.1 Interface e Telas
- **Página Principal do Onboarding:** [`Onboarding.tsx`](file:///c:/Users/aline/Music/turisagencias/src/pages/Onboarding.tsx) (595 linhas, 25.6KB).
  - Controla o stepper com 4 etapas:
    - **Etapa 1:** Informações Básicas (Razão/Fantasia, WhatsApp, E-mail, Telefone).
    - **Etapa 2:** Identidade Visual (Logotipo, Cores Primária/Secundária, Foco da Agência).
    - **Etapa 3:** Presença Digital (Instagram, Site, Google Maps).
    - **Etapa 4:** Ativação (Exibição dos logs de agentes de IA em tempo real).
- **Componente de Acompanhamento de IA:** [`BrandSquadLive.tsx`](file:///c:/Users/aline/Music/turisagencias/src/components/onboarding/BrandSquadLive.tsx) (126 linhas, 4.4KB).
  - Assina via Supabase Realtime a tabela `ai_tasks` para o `org_id` em processamento e exibe o log de execução do motor de IA em tempo real.

### 2.2 Controle de Rotas e Segurança
- **Provedor de Autenticação:** [`AuthProvider.tsx`](file:///c:/Users/aline/Music/turisagencias/src/components/AuthProvider.tsx).
  - Carrega e bootstrappa o estado do usuário (`profile` e `organization`) no Zustand a partir do Supabase Auth.
- **Guarda de Onboarding:** [`App.tsx`](file:///c:/Users/aline/Music/turisagencias/src/App.tsx#L104-L123).
  - Declara a função `OnboardingGuard` que bloqueia o acesso ao Dashboard principal caso `!organization && !profile?.org_id && !isMaster`.
- **Rotas Relacionadas:**
  - `/onboarding` mapeada em `App.tsx` sob proteção de autenticação simples: `<ProtectedRoute><Onboarding /></ProtectedRoute>`.
  - `/` mapeada em `App.tsx` sob proteção de onboarding e organização: `<ProtectedWithOrg><Dashboard /></ProtectedWithOrg>`.

### 2.3 Store Global de Autenticação
- **Zustand Store:** [`authStore.ts`](file:///c:/Users/aline/Music/turisagencias/src/stores/authStore.ts).
  - Persiste as propriedades: `user`, `profile`, `organization`, `roles`, `isLoading`.

---

## 3. Matriz do Estado de Persistência Atual (Auditados)

| Componente / Fluxo | Persistência Declarada | Fonte de Verdade Real | RLS Ativo? | Status |
| :--- | :--- | :--- | :--- | :--- |
| Criar Organização | `public.organizations` | Banco Supabase | Sim (Nuclear RLS) | **REAL** |
| Vincular Perfil | `public.profiles` (upsert) | Banco Supabase | Sim | **REAL** |
| Atribuir Role Admin | RPC `assign_org_admin_role` | Banco Supabase (user_roles) | Sim (Definer) | **REAL** |
| Quadros Padrão | RPC `ensure_default_kanban_boards` | Banco Supabase (kanban) | Sim | **REAL** |
| BrandKit Inicial | Coluna `organizations.brand_kit` | Banco Supabase | Sim | **REAL** |
| Processamento IA | Tabela `public.ai_tasks` | Banco Supabase | Sim | **REAL** |

---

## 4. Evidências de Acesso e Variáveis Esperadas
- **Acesso ao Banco de Dados:** Confirmado via migrações e types.ts. Acesso total por RLS.
- **VITE_SUPABASE_URL** e **VITE_SUPABASE_ANON_KEY**: Injetadas no client.
- **Logs Operacionais:** Redirecionados via utilitário [`logger.ts`](file:///c:/Users/aline/Music/turisagencias/src/utils/logger.ts).
""")

# -------------------------------------------------------------
# File 01: 01_ONBOARDING_UI_DB_MATCH.md
# -------------------------------------------------------------
write_file("01_ONBOARDING_UI_DB_MATCH.md", """# 01 - Matriz UI ↔ API ↔ DB do Onboarding Atual

## 1. Objetivo
Mapear cada campo visual das telas do onboarding com as tabelas, colunas, tipos e restrições correspondentes no banco de dados do Supabase.

---

## 2. Tabela de Mapeamento de Campos e Inputs

| Componente UI | Etapa | Campo Visual | Estado Zustand | Tabela Supabase | Coluna DB | Tipo de Dado | Restrição DB | Match? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Onboarding.tsx` | Etapa 1 | Nome da Agência | `form.name` | `organizations` | `name` | `TEXT` | NOT NULL | **MATCH** |
| `Onboarding.tsx` | Etapa 1 | E-mail Profissional | `form.email` | `organizations` | `email` | `TEXT` | NULLABLE | **MATCH** |
| `Onboarding.tsx` | Etapa 1 | WhatsApp | `form.whatsapp` | `organizations` | `whatsapp` | `TEXT` | NULLABLE | **MATCH** |
| `Onboarding.tsx` | Etapa 1 | Telefone Fixo | `form.phone` | `organizations` | `phone` | `TEXT` | NULLABLE | **MATCH** |
| `Onboarding.tsx` | Etapa 2 | Logotipo | `logoFile` | bucket: `org-assets` | `logo_url` | `TEXT` | Public URL | **MATCH** |
| `Onboarding.tsx` | Etapa 2 | Cor Principal | `form.primaryColor` | `organizations` | `primary_color` | `TEXT` | DEFAULT | **MATCH** |
| `Onboarding.tsx` | Etapa 2 | Cor Secundária | `form.secondaryColor` | `organizations` | `secondary_color` | `TEXT` | DEFAULT | **MATCH** |
| `Onboarding.tsx` | Etapa 2 | Foco Principal | `form.focus` | `organizations` | `brand_kit` | `JSONB` | `{ focus: val }` | **MATCH** |
| `Onboarding.tsx` | Etapa 3 | Instagram | `form.instagram_url` | `organizations` | `instagram_url` | `TEXT` | NULLABLE | **MATCH** |
| `Onboarding.tsx` | Etapa 3 | Site Principal | `form.website_url` | `organizations` | `website_url` | `TEXT` | NULLABLE | **MATCH** |
| `Onboarding.tsx` | Etapa 3 | Google Maps | `form.google_business_url` | `organizations` | `google_business_url` | `TEXT` | NULLABLE | **MATCH** |

---

## 3. Análise de Gaps Identificados
- **Timezone, Moeda e Idioma:** Embora a agência precise de configurações internacionais ou regionais para precificação e exibições, o onboarding básico não as coleta. Elas caem em valores default (`BRL`, `pt-BR`).
- **Dados Fiscais (CNPJ/CPF):** Inexistentes na UI de onboarding, dependendo de edição manual posterior nas configurações internas.
- **Endereço Completo:** Coletado de forma parcial e improvisada fora do fluxo principal.

---

## 4. Fluxo de Validação de Input
- **Validação de Slug:** O frontend limpa caracteres acentuados e gera o slug. No banco, o slug possui restrição de unicidade. O onboarding implementa uma tentativa reativa de até 5 tentativas adicionando sufixos aleatórios caso ocorra colisão de slugs.
""")

# -------------------------------------------------------------
# File 02: 02_ONBOARDING_EDGE_FUNCTIONS_MATCH.md
# -------------------------------------------------------------
write_file("02_ONBOARDING_EDGE_FUNCTIONS_MATCH.md", """# 02 - Onboarding e Integração com Supabase Edge Functions

## 1. Objetivo
Mapear a comunicação entre o frontend e as Edge Functions do Supabase durante a ativação da agência.

---

## 2. Invocação da Central de IA (Brand Squad)
No final do Step 3, se o usuário preencher o Instagram ou o Site Principal, o onboarding dispara a seguinte invocação assíncrona para enriquecer a marca usando IA:

- **Edge Function Alvo:** `trigger-brand-squad`
- **Método:** `POST`
- **Payload Enviado:**
  ```json
  {
    "org_id": "UUID-da-organizacao",
    "instagram_url": "instagram.com/agencia",
    "website_url": "agencia.com.br"
  }
  ```
- **Ação em Backstage:** O motor de IA (Python FastAPI / LangGraph orquestrador) inicia uma fila de scraping e crawling para ler as cores do site da agência, imagens públicas, slogan, e criar a base de conhecimento inicial no banco.

---

## 3. Estado de Sincronização dos Agentes de IA
A tabela `public.ai_tasks` faz o batimento do status dos agentes.

| Campo de Controle | Tipo | Significado no Onboarding |
| :--- | :--- | :--- |
| `id` | `UUID` | ID único da tarefa do agente. |
| `org_id` | `UUID` | Vínculo com a agência correspondente. |
| `status` | `TEXT` | Estado: `pending`, `processing`, `completed`, `failed`. |
| `execution_log` | `JSONB` | Array de strings com logs que o componente `BrandSquadLive` renderiza em tempo real. |

---

## 4. Gaps e Melhorias
- **SSRF (Server-Side Request Forgery):** A Edge Function de scraping precisa validar se as URLs enviadas são realmente públicas e seguras antes de iniciar o crawler operacional.
""")

# -------------------------------------------------------------
# File 03: 03_ONBOARDING_DESIGN_AUDIT.md
# -------------------------------------------------------------
write_file("03_ONBOARDING_DESIGN_AUDIT.md", """# 03 - Auditoria Estética e Design System (Bento Grid OMEGA v4.0)

## 1. Objetivo
Analisar a consistência cromática, contraste, Stepper, micro-animações e responsividade do Onboarding contra as regras estritas do Design System Bento Grid OMEGA v4.0.

---

## 2. Checklist Estético do Onboarding

- [x] **Unificação Cromática:** Usa o verde principal (`--vj-green` / `#00D37B`) como destaque em botões primários e states ativos.
- [x] **Modo Escuro:** Interface desenhada sob fundo ultra-dark (`bg-zinc-950`), ideal para displays modernos e economia de energia.
- [x] **Stepper Reativo:** Indicadores na lateral esquerda mostram visualmente as etapas Concluídas, Ativas e Futuras com ícones expressivos e mudança dinâmica de cores.
- [x] **Acessibilidade de Contraste:** Botões com fundo branco não possuem texto branco; os botões primários usam contraste preto-no-verde (`text-zinc-950` sobre `bg-vj-green`).
- [x] **Responsividade Mobile:** Sidebar esquerda é ocultada em resoluções inferiores a `lg` (1024px), garantindo foco total no formulário em smartphones.

---

## 3. Proposta de Micro-Animações
Adicionar transições suaves baseadas em Framer Motion ou CSS Transitions para:
- Entrada suave das etapas do formulário (`fade-in`, `slide-in-from-right`).
- Animação do terminal de logs da IA com scroll automático e efeito cursor de digitação reativo.
""")

# -------------------------------------------------------------
# File 04: 04_PUBLIC_PAGE_BASIC_MODE.md
# -------------------------------------------------------------
write_file("04_PUBLIC_PAGE_BASIC_MODE.md", """# 04 - Ativação Essencial: Canal Público Básico da Agência

## 1. Objetivo
Garantir que a "Velocidade 1" do onboarding coloque a agência com uma página pública institucional mínima ativa em menos de 2 minutos.

---

## 2. Conteúdo e Blocos Gerados Automaticamente
Logo após salvar o Brand Kit e preencher as informações essenciais, o sistema deve gerar e compilar instantaneamente o seguinte JSON de Blocos representativo para a página institucional sob o domínio/slug reservado da agência:

```json
{
  "blocks": [
    {
      "id": "hero-1",
      "kind": "hero",
      "props": {
        "title": "Descubra o Mundo com a Viagens Premium",
        "subtitle": "Roteiros personalizados e experiências exclusivas desenhadas por especialistas.",
        "ctaText": "Falar com Consultor",
        "ctaLink": "https://wa.me/5511999999999"
      }
    },
    {
      "id": "about-1",
      "kind": "about",
      "props": {
        "title": "Sobre Nós",
        "content": "Somos uma agência dedicada a transformar seus sonhos de viagem em realidades inesquecíveis."
      }
    },
    {
      "id": "contact-1",
      "kind": "contact",
      "props": {
        "phone": "(11) 3333-3333",
        "whatsapp": "(11) 99999-9999",
        "email": "contato@agencia.com"
      }
    }
  ]
}
```

---

## 3. Snapshots e Publicação Rápida
- **Persistência Inicial:** Gravada na nova tabela `public_sites`.
- **Modo Página Básica:** Ativado por padrão, mapeado em `public_pages` vinculadas ao site principal da agência.
""")

# -------------------------------------------------------------
# File 05: 05_SITE_BUILDER_ARCHITECTURE.md
# -------------------------------------------------------------
write_file("05_SITE_BUILDER_ARCHITECTURE.md", """# 05 - Arquitetura de Builder Visual Baseado em Projetos JSON

## 1. Objetivo
Detalhar o modelo conceitual e técnico do construtor de páginas responsivas (builder visual) para websites, blogs, landing pages e link-bios de agências.

---

## 2. Modelo de Blocos e Schemas JSON (Canvas Infinito)
O Builder opera por frames responsivos e páginas derivadas. A fonte de verdade é a árvore de blocos JSON versionada:

```mermaid
graph TD
    Project[Builder Project] -->|Possui| Pages[Pages]
    Pages -->|Possui| Versions[Versions]
    Versions -->|Contem| FrameSchema[Frame Schema JSONB]
    Versions -->|Contem| ContentSchema[Content Schema JSONB]
    Versions -->|Gera| RenderSnapshot[Render Snapshot HTML/CSS]
```

### 2.1 Interface TypeScript dos Contratos
```typescript
export type BuilderFrame = 'mobile' | 'tablet' | 'desktop';

export interface BuilderBlock {
  id: string;
  kind: 'hero' | 'cover' | 'about' | 'gallery' | 'faq' | 'cta' | 'contact' | 'social-links' | 'trip-catalog';
  props: Record<string, any>;
  bindings?: Record<string, string>;
  styleTokenRefs?: string[];
}

export interface BuilderPageVersion {
  id: string;
  projectId: string;
  versionNumber: number;
  frameSchemas: Record<BuilderFrame, BuilderBlock[]>;
  seo: {
    title: string;
    description: string;
    canonical?: string;
    ogImage?: string;
  };
}
```

---

## 3. Processo de Publicação e Snapshots
- Toda alteração cria uma linha em `builder_versions` com status `draft`.
- A publicação consolida a versão como `published`, atualiza `builder_projects.current_version_id`, e exporta um snapshot estático para renderização veloz sem chamadas de banco no portal do viajante.
""")

# -------------------------------------------------------------
# File 06: 06_BLOG_CMS_ARCHITECTURE.md
# -------------------------------------------------------------
write_file("06_BLOG_CMS_ARCHITECTURE.md", """# 06 - CMS do Blog: Curadoria e Publicação Estruturada

## 1. Objetivo
Projetar o construtor do blog institucional para captação de leads orgânicos por SEO técnico.

---

## 2. Pipeline Editorial de Conteúdo e SEO

```mermaid
flowchart LR
    Ingest[RSS/Fontes Ingest] -->|Leitura Autonoma| IA[Curadoria por IA]
    IA -->|Gera Rascunho| Human[Revisao Humana]
    Human -->|Aprova| Publish[Publicado no Blog]
```

### 2.1 Estrutura de Tabelas Mínimas
- **`rss_sources`:** Canais externos monitorados.
- **`blog_settings`:** Domínio, design do feed, categorias autorizadas.
- **`blog_posts`:** Posts do blog com campos completos de SEO (Metatags, Palavras-chave, canonical).
- **`faq_entries`:** Perguntas frequentes linkadas aos posts para exibição enriquecida nos rich snippets do Google.

---

## 3. SEO Técnico e Rich Snippets
O renderizador final do blog deve injetar metadados JSON-LD de autor, data, e FAQSchema de forma nativa e estática no cabeçalho do HTML compilado.
""")

# -------------------------------------------------------------
# File 07: 07_LINKBIO_ARCHITECTURE.md
# -------------------------------------------------------------
write_file("07_LINKBIO_ARCHITECTURE.md", """# 07 - Construtor de Link-Bio de Alta Conversão

## 1. Objetivo
Criar uma interface otimizada para smartphones (Link-in-Bio) no onboarding expandido, integrada ao Instagram da agência.

---

## 2. Interface Otimizada Mobile-First

```mermaid
graph TD
    Avatar[Logo / Avatar] --> Slogan[Slogan da Agencia]
    Slogan --> CTA1[WhatsApp de Atendimento]
    Slogan --> CTA2[Orcamento Rapido de Viagem]
    Slogan --> CTA3[Instagram / Postagens Recentes]
    Slogan --> Footer[Branding Turis]
```

---

## 3. Integration com WhatsApp e Instagram
- O Link-Bio puxa automaticamente o brand kit da agência.
- Oferece analytics interno na nova tabela `public.analytics_views` para medir acessos, cliques e taxa de conversão do Instagram para conversas no WhatsApp.
""")

# -------------------------------------------------------------
# File 08: 08_PORTAL_CLIENTE_ONBOARDING.md
# -------------------------------------------------------------
write_file("08_PORTAL_CLIENTE_ONBOARDING.md", """# 08 - Configuração Avançada do Portal do Cliente

## 1. Objetivo
Mapear a configuração do portal público/privado onde o passageiro acessa suas viagens, vouchers e roteiros.

---

## 2. Configurações de Identidade no Portal
A tabela `public.portal_configs` salva as preferências da agência:
- **Cores Aplicadas:** Herdadas do Brand Kit da organização.
- **Módulos Disponíveis:** Controle de ativação para Roteiros (`itineraries`), Vouchers, Documentos de Viagem, Galeria de Fotos com IA, e Chat/Suporte do Agente.

---

## 3. RLS e Visibilidade do Viajante
Toda query feita no portal do viajante valida o token único da viagem (`form_token` ou `magic_link`) utilizando políticas RLS rígidas baseadas na sessão do passageiro, blindando contra manipulação de parâmetros (IDOR).
""")

# -------------------------------------------------------------
# File 09: 09_AIRPORTS_AIRLINES_CHECKIN_REGISTRY.md
# -------------------------------------------------------------
write_file("09_AIRPORTS_AIRLINES_CHECKIN_REGISTRY.md", """# 09 - Catálogo de Aeroportos e Links de Check-in

## 1. Objetivo
Definir a modelagem e controle de aeroportos e links diretos para check-in de passagens aéreas.

---

## 2. Registry de Check-in de Companhias Aéreas
As passagens aéreas geradas no sistema contêm links diretos para o check-in das respectivas companhias.

### 2.1 Modelagem da Tabela `airline_checkin_registry`
```sql
CREATE TABLE IF NOT EXISTS public.airline_checkin_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airline_iata TEXT NOT NULL,
  airline_name TEXT NOT NULL,
  landing_url TEXT NOT NULL,
  deep_link_template TEXT, -- Ex: https://checkin.airline.com/?locator={locator}&lastname={lastname}
  required_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  supports_prefill BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft'
);
```

---

## 3. Resolução Inteligente de Check-in
Ao gerar o voucher do passageiro, a API lê a companhia aérea do voo, localiza o registro e renderiza o botão "Fazer Check-in". Se a companhia suportar preenchimento automático (`supports_prefill`), os parâmetros de localizador e sobrenome são enviados automaticamente na URL.
""")

# -------------------------------------------------------------
# File 10: 10_ADMIN_SECRETS_RBAC.md
# -------------------------------------------------------------
write_file("10_ADMIN_SECRETS_RBAC.md", """# 10 - Gerenciamento de Secrets e Controle RBAC do Admin

## 1. Objetivo
Definir regras estritas de segurança para o painel de gerenciamento de chaves globais da agência.

---

## 2. Segredos e Chaves Sensíveis
- **SMTP/Resend, WhatsApp META, Google Maps:** São salvos na tabela `public.integration_configs`.
- **Criptografia:** Os tokens confidenciais são armazenados criptografados usando `pg_sodium` no Supabase ou referenciados no cofre de segredos server-side (secrets) e NUNCA expostos em JSON retornado para o navegador do cliente.

---

## 3. RBAC (Role-Based Access Control)
As permissões são estritamente controladas:
- Permissão de escrita e edição de chaves restrita ao papel `super_admin`.
- Agentes comuns (`agent`) possuem acesso de leitura limitado apenas ao status operacional da chave (Ex: "Ativo/Inativo"), sem acesso aos segredos.
""")

# -------------------------------------------------------------
# File 11: 11_SEGURANCA_ONBOARDING_PUBLIC_SURFACES.md
# -------------------------------------------------------------
write_file("11_SEGURANCA_ONBOARDING_PUBLIC_SURFACES.md", """# 11 - Segurança e Blindagem de Superfícies Públicas

## 1. Objetivo
Mapear vulnerabilidades P0 nas interfaces públicas (Landing Pages, Portal do Cliente, Link-Bio e Fichas de Passageiro).

---

## 2. OWASP / ASVS Checklist para Superfícies Públicas

- [ ] **IDOR Prevention:** Garantir que rotas de visualização de viagens usem tokens criptográficos (UUIDv4) e não IDs sequenciais.
- [ ] **XSS Sanitization:** Sanitizar completamente qualquer código inserido em blocos do tipo "Custom HTML" do site builder usando bibliotecas como `DOMPurify` antes da renderização estática.
- [ ] **Rate Limiting:** Limitar requisições de validação de fichas e preenchimento de formulários públicos a fim de evitar ataques de negação de serviço (DoS).
- [ ] **SSRF Validation:** Edge Functions de scraping e crawling validam o cabeçalho e os IPs de destino, bloqueando conexões com a rede local (`localhost`, `127.0.0.1`).
""")

# -------------------------------------------------------------
# File 12: 12_PRD_ONBOARDING_REWRITE.md
# -------------------------------------------------------------
write_file("12_PRD_ONBOARDING_REWRITE.md", """# 12 - PRD Operacional do Novo Onboarding de Dupla Velocidade

## 1. Descrição do Produto
O novo Onboarding do Turis Agências divide-se em duas camadas distintas de ativação para atender à velocidade e profundidade da agência.

---

## 2. Estrutura de Dupla Velocidade

### 2.1 Camada Essencial (Velocidade 1)
- **Objetivo:** Colocar a agência no ar em menos de 2 minutos.
- **Mapeamento de Telas:**
  1. **Organização:** Dados básicos, e-mail, CNPJ/CPF e WhatsApp.
  2. **Endereço e Operação:** Localização e horários de atendimento.
  3. **Branding Básico:** Logo e cores principais.
  4. **Canal Público Rápido:** Capa institucional gerada dinamicamente.

### 2.2 Camada Expandida (Velocidade 2)
- **Objetivo:** Transformar a agência em uma propriedade digital completa.
- **Módulos Liberados:**
  1. **Builder Expandido:** Editor visual de seções, blocos e templates.
  2. **Conteúdo e Blog:** Ingestão de feeds e publicação por SEO.
  3. **Link-Bio:** Integração mobile para redes sociais.
  4. **Catálogo de Viagens:** Portfólio de produtos e FAQ.
""")

# -------------------------------------------------------------
# File 13: 13_ROADMAP_ONBOARDING_P0_P1_P2_P3.md
# -------------------------------------------------------------
write_file("13_ROADMAP_ONBOARDING_P0_P1_P2_P3.md", """# 13 - Roadmap do Novo Onboarding e Builder

## 1. Priorização de Lançamento

```mermaid
gantt
    title Roadmap de Implementação do Onboarding
    dateFormat  YYYY-MM-DD
    section P0: Onboarding Rápido
    Fluxo de Velocidade 1 e RLS :active, p0-1, 2026-05-25, 5d
    section P1: Builder e Link-Bio
    Estrutura JSON e Canvas Infinito : p1-1, after p0-1, 7d
    section P2: Blog e CMS
    Fluxo Editorial e RSS Ingest : p2-1, after p1-1, 6d
    section P3: Check-in e Voos
    Catalogo de IATA e Registry : p3-1, after p2-1, 5d
```

---

## 2. Detalhamento de Fases
- **P0:** Onboarding de 2 minutos, criação simplificada e correção RLS.
- **P1:** Builder responsivo com versionamento JSON e Link-Bio reativo.
- **P2:** CMS de blog completo com curadoria IA.
- **P3:** Check-in registry integrado e banco de aeroportos estruturado.
""")

# -------------------------------------------------------------
# File 14: 14_PLANO_DE_PRS_ONBOARDING.md
# -------------------------------------------------------------
write_file("14_PLANO_DE_PRS_ONBOARDING.md", """# 14 - Plano de Pull Requests Incrementais

## 1. Divisão Estratégica de Commits
Para evitar conflitos de merge e bugs de regressão, a refatoração será executada de forma incremental:

---

## 2. Lista de PRs Planejados

1. **PR #1 (P0):** Criação das tabelas essenciais no Supabase (`public_sites`, `builder_projects`, `builder_versions`).
2. **PR #2 (P0):** Implementação da interface do Onboarding Velocidade 1 com autosave automático.
3. **PR #3 (P1):** Criação do motor do Canvas Infinito do Builder com frames Responsivos.
4. **PR #4 (P1):** Lançamento do módulo de Link-Bio de alta conversão.
5. **PR #5 (P2):** Criação das tabelas e painel do CMS do Blog.
6. **PR #6 (P3):** Lançamento da tabela de Check-in e catálogo de IATAs.
""")

print("Successfully generated all 15 markdown files in Python!")
