# Plano — Grupos Terrestres, Carnês, Ônibus Virtual, Voucher, Contrato Digital

> **Status**: Iteração 1 — Fundação (build estável, schema, página pública compartilhável, builder básico)

## Auditoria do Design System (estado atual)

### O que já está aplicado corretamente
- **SheetPage** padronizado em 70vw com sidebar vertical de seções (`src/components/ui/SheetPage.tsx`).
- Tokens HSL em `index.css` (--green, --bg, --txt, --border) consumidos via classes `vj-*` no Tailwind.
- BentoGrid com classes `bento-cell-{sm,md,lg,full,tall}`.
- Sidebar usando shadcn `Sidebar` collapsible.

### Pendências identificadas (não-bloqueantes desta iteração)
1. **Cor primária**: o usuário pediu "azul piscina quase verdinho". Hoje está verde escuro `#1a7a4a`. Vou propor mudança gradual em iteração separada para não romper screenshots/contratos já renderizados.
2. **Tabs com scroll quebrado**: existem páginas usando `<Tabs>` shadcn sem wrapper `overflow-x-auto`. Auditar em fase posterior.
3. **Z-index de Select dentro de SheetPage** (200) — Select padrão do Radix usa portal com z-50. Já existem casos quebrados.
4. **Bento propagado**: Index.tsx usa `bento-grid-premium` (estilo dark moderno), enquanto outras páginas (Clients, Trips) usam tabelas. **Decisão**: manter bento só no Dashboard; CRUDs continuam em DataTable que é o padrão SaaS correto. Não é "genérico" — é a UX certa para listas grandes.

### Páginas em SheetPage 70% (status)
| Página | Componente | Status |
|---|---|---|
| Cliente | ClientEditSheet | ✅ |
| Viagem | TripEditSheet | ✅ |
| Cotação | QuotationBuilderSheet | ✅ |
| Card Kanban (Tarefa) | TaskCardSheet | ✅ |
| Card Kanban (Embarque) | DepartureCardSheet | ✅ |
| Hotel | HotelEdit (page route) | ⚠️ é página, não sheet — manter (formulário longo) |
| Guia | GuideEdit (page route) | ⚠️ idem |
| TravelerInfo | TravelerInfoEdit | ⚠️ idem |

**Decisão**: Hotel/Guia/TravelerInfo permanecem como páginas dedicadas porque têm editor de blocos rico de conteúdo. Não é inconsistência — é o padrão correto para "editor de página", semelhante ao Notion/Substack.

---

## Fase 0 — Estabilização do build (esta iteração)

- [x] `getClaims` → `getUser(token)` em `ai-chat-agent` e `extract-quotation`
- [x] Reordenar declaração de `aiConfig` em `ai-chat-agent`

## Fase 1 — Schema (esta iteração)

Tabelas novas:

### `group_trips`
Roteiro terrestre comercializável publicamente.
- `org_id`, `title`, `subtitle`, `slug` (público), `cover_image_url`, `gallery_urls[]`
- `destination`, `origin_city`, `departure_date`, `return_date`, `num_days`, `num_nights`
- `price_per_pax` (numeric), `currency`, `max_pax`, `current_pax`
- `description_md` (texto rico), `includes[]`, `excludes[]`, `important_notes`
- `transport_type` (bus/van), `bus_layout_id` (FK para `bus_layouts`)
- `status` (draft/published/closed/cancelled), `is_public`
- `payment_due_offset_days` (default 1) — última parcela X dias antes da viagem
- `installments_count` (default 1)
- `contract_template_id` (FK opcional)

### `group_trip_days`
Dia-a-dia detalhado.
- `group_trip_id`, `day_number`, `title`, `description_md`
- `media[]` (jsonb com {url, type:'image'|'video', caption})
- `highlights[]`

### `bus_layouts`
Layouts reutilizáveis de ônibus/van/avião.
- `org_id`, `name`, `vehicle_type` (bus/van/plane)
- `rows`, `cols`, `seat_map` (jsonb com matriz de assentos {label, type:'seat'|'aisle'|'door'|'wc'})

### `group_bookings`
Reserva feita por cliente público.
- `group_trip_id`, `client_id` (nullable se ainda não existe), `lead_name`, `lead_email`, `lead_phone`, `lead_cpf`
- `pax_count`, `seat_numbers[]`, `total_amount`, `status` (pending/confirmed/paid/cancelled)
- `signed_contract_url`, `signed_at`, `signature_method` (digital/facial)
- `facial_photo_url` (KYC simples)
- `voucher_url`, `voucher_code` (UUID legível)
- `public_token` (UUID para acesso ao status pelo cliente)

### `booking_installments`
Carnê automático.
- `booking_id`, `installment_number`, `due_date`, `amount`, `status` (pending/paid/late/canceled)
- `paid_at`, `payment_method`, `reference`

### `bus_seat_assignments`
Mapa real dos assentos por viagem.
- `group_trip_id`, `seat_label`, `booking_id` (nullable), `traveler_name`, `is_blocked`
- UNIQUE (group_trip_id, seat_label)

### `contract_signatures`
Assinaturas digitais (lei MP 2.200-2/2001 — assinatura eletrônica simples + selo de tempo + IP + foto facial).
- `booking_id`, `contract_html` (snapshot), `signer_name`, `signer_cpf`, `signer_ip`
- `signed_at`, `facial_photo_url`, `geolocation` (jsonb), `user_agent`
- `hash_sha256` (integridade do documento + assinante)

RLS: `org_id = get_my_org_id()` para gestão; `public` (anon) só lê via RPC com `public_token`/`slug`.

---

## Fase 2 — UI Builder de Grupo Terrestre (esta iteração — MVP)

- Página `/group-trips` (lista, igual padrão Trips)
- Página `/group-trips/:id` (builder com SheetPage seções: Capa, Dia-a-dia, Galeria, Inclusões, Ônibus, Pagamento, Contrato, Publicação)
- Galeria horizontal estilo Instagram (carrossel de cards grandes)
- Bloco "scroll horizontal" reutilizando `MediaCarousel`

## Fase 3 — Página Pública (esta iteração — MVP visual + reserva)

- Rota `/g/:slug` (pública, anon)
- Hero com cover, título, dias, preço a partir
- Seção dia-a-dia com galeria horizontal
- Galeria geral estilo Instagram (grid 3 colunas + lightbox)
- CTA "Reservar" → fluxo: dados → escolha de assentos → contrato → assinatura → carnê
- Após confirmação: gera voucher PDF + carnê

## Fase 4 — Ônibus Virtual (próxima iteração)

- Editor visual de layout (drag-drop matriz)
- Visualização pública: assentos livres (verde), ocupados (cinza), selecionados (amarelo)
- Componente `<BusSeatMap layout={...} occupied={[...]} onSelect={...} />`

## Fase 5 — Contrato Digital + Assinatura (próxima iteração)

- Template HTML com placeholders {{cliente.nome}}, {{viagem.titulo}}, etc.
- Tela de assinatura: preview do contrato, captura de foto facial via `getUserMedia`, IP + geo + timestamp
- Hash SHA-256 do documento+dados → `contract_signatures`
- PDF final renderizado server-side (edge function com pdf-lib)

## Fase 6 — Carnê Digital + Voucher (próxima iteração)

- Geração automática de N parcelas iguais com vencimentos: viagem - X dias dividido por N
- Página pública `/booking/:public_token` mostra parcelas com status, link de pagamento
- Voucher PDF estilo cia aérea: QR code, código, assento, dados do passageiro, política de cancelamento

## Fase 7 — Pagamento (futuro)

- Integração com gateway (Stripe/Mercado Pago/Asaas) via edge function
- Webhook atualiza `booking_installments.status`
- Notificação automática 7/3/1 dias antes do vencimento

---

## Reaproveitamento (não duplicar!)

- `MediaCarousel`, `MediaGallery`, `LazyImage`, `SectionRenderer` — já existem
- `SheetPage` — usar para builder
- `useItineraries` — referência de padrão (mas grupo terrestre é uma tabela separada)
- `contract_templates` — já existe, vamos referenciar
- `traveler_info_pages` — já tem editor de blocos público bonito; estudar reaproveitar `content_blocks`
