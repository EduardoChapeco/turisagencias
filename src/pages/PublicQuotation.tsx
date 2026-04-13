import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { parseInstallments } from '@/lib/utils';
import type { PublicQuotationData } from '@/types';
import { PublicLayout } from '@/components/layout/PublicLayout';

const mealLabels: Record<string, string> = {
  all_inclusive: 'All Inclusive 🍽️',
  half_board: 'Meia Pensão',
  bed_breakfast: 'Café da Manhã ☕',
  room_only: 'Só Hospedagem',
};

const transportIcons: Record<string, string> = {
  aereo: '✈️', maritimo: '🚢', onibus: '🚌', trem: '🚂', carro: '🚗', outro: '🚐',
};

export default function PublicQuotation() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<PublicQuotationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token) return;
    supabase.rpc('get_public_quotation', { _token: token }).then(({ data: rows, error }) => {
      const row = rows?.[0] ?? null;
      setLoading(false);
      if (error || !row) { setNotFound(true); return; }
      setData({ ...row, installments: parseInstallments(row.installments) });
    });
  }, [token]);

  const fmt = (value: number | null, currency = 'BRL') => {
    if (!value) return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
  };

  const fmtDate = (d: string | null) =>
    d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f7f7f5' }}>
        <Loader2 style={{ width: 32, height: 32, animation: 'spin 1s linear infinite', color: '#1a7a4a' }} />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f7f7f5', padding: 16 }}>
        <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 22, border: '1px solid #e5e4e0', maxWidth: 380 }}>
          <MapPin style={{ width: 40, height: 40, color: '#9b9a96', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 18, fontWeight: 700, color: '#111110' }}>Cotação não encontrada</p>
          <p style={{ fontSize: 13, color: '#6b6a66', marginTop: 8, lineHeight: 1.6 }}>
            O link pode estar expirado, inválido ou a proposta já foi fechada.
          </p>
        </div>
      </div>
    );
  }

  const installments = data.installments ?? [];
  const itinerary: any[] = (data as any).itinerary ?? [];
  const transports: any[] = (data as any).transports ?? [];
  const excursions: any[] = (data as any).excursions ?? [];
  const includedItems: string[] = (data as any).included_items ?? [];
  const excludedItems: string[] = (data as any).excluded_items ?? [];
  const coverImageUrl = (data as any).cover_image_url || data.hotel_photo_url;
  const pricingMode = (data as any).pricing_mode || 'per_person';
  const validUntil = (data as any).valid_until;

  const pricingLabel = pricingMode === 'per_couple' ? 'Por casal' :
    pricingMode === 'per_family' ? 'Por família' :
    pricingMode === 'total' ? 'Pacote total' : 'Por pessoa';

  const whatsappUrl = data.org_whatsapp
    ? `https://wa.me/55${data.org_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
        data.whatsapp_text || `Olá! Gostaria de confirmar a cotação para ${data.destination || 'a viagem'}.`
      )}`
    : null;

  // Agent initials
  const agentInitials = data.org_name
    ? data.org_name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
    : 'AG';

  // Reference short
  const ref = token ? `#${token.slice(0, 8).toUpperCase()}` : '';

  const hasPriceDetails = data.total_value || installments.length > 0;

  return (
    <PublicLayout
      orgName={data.org_name}
      orgLogo={data.org_logo}
      tabs={[
        { id: 'cot', label: 'Cotação', active: true },
        ...(itinerary.length > 0 ? [{ id: 'itin', label: 'Roteiro' }] : []),
      ]}
      ctaLabel={whatsappUrl ? 'Reservar →' : undefined}
      onCtaClick={whatsappUrl ? () => window.open(whatsappUrl, '_blank') : undefined}
      ctaSecondaryLabel={whatsappUrl ? 'Perguntar' : undefined}
      onCtaSecondaryClick={whatsappUrl ? () => window.open(whatsappUrl, '_blank') : undefined}
    >
      {/* ══ COVER HERO ══ */}
      <div className="vj-cover">
        {coverImageUrl ? (
          <img className="vj-cover-img" src={coverImageUrl} alt={data.destination || 'Destino'} />
        ) : (
          <div className="vj-cover-fake">🏝️ 🌿 ✈️</div>
        )}
        <div className="vj-cover-overlay" />
        <div className="vj-cover-content">
          <div className="vj-cover-badge">
            <div className="vj-cover-badge-dot" />
            Cotação {ref} {validUntil ? `· válida até ${fmtDate(validUntil)}` : ''}
          </div>
          <div className="vj-cover-title">
            {data.destination || 'Sua viagem'}<br />
            <em>
              {data.num_nights ? `${data.num_nights} noites` : ''}
              {data.num_nights && data.hotel_name ? ' · ' : ''}
              {data.hotel_name || ''}
            </em>
          </div>
          <div className="vj-cover-chips">
            {data.check_in && data.check_out && (
              <div className="vj-cover-chip">
                📅 {fmtDate(data.check_in)} → {fmtDate(data.check_out)}
              </div>
            )}
            {data.hotel_name && (
              <div className="vj-cover-chip">
                🏨 {data.hotel_name}{data.hotel_stars ? ` ${'★'.repeat(data.hotel_stars)}` : ''}
              </div>
            )}
            {data.meal_plan && (
              <div className="vj-cover-chip">
                {mealLabels[data.meal_plan] || data.meal_plan}
              </div>
            )}
            {transports.length > 0 && (
              <div className="vj-cover-chip">
                {transportIcons[transports[0].type] || '✈️'} Transfers incluídos
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ SHARE BAR ══ */}
      <div className="vj-sharebar">
        <div className="vj-sb-left">
          <div className="vj-sb-agent">
            <div className="vj-av-sm">{agentInitials}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#111110' }}>{data.org_name}</div>
              <div style={{ fontSize: 10, color: '#9b9a96' }}>Agência de Viagens</div>
            </div>
          </div>
          {validUntil && (
            <div className="vj-sb-validity">⏱ Válida até {fmtDate(validUntil)}</div>
          )}
          {ref && (
            <div className="vj-sb-ref">Ref <strong>{ref}</strong></div>
          )}
        </div>
        <div className="vj-sb-right">
          {whatsappUrl && (
            <>
              <button className="vj-tbtn" onClick={() => window.open(whatsappUrl, '_blank')}>
                💬 Fazer pergunta
              </button>
              <button className="vj-tbtn vj-tbtn-solid" onClick={() => window.open(whatsappUrl, '_blank')}>
                Confirmar reserva →
              </button>
            </>
          )}
        </div>
      </div>

      {/* ══ CONTEÚDO PRINCIPAL ══ */}
      <div className="vj-wrap">

        {/* SUMMARY STRIP */}
        <div className="vj-summary-strip vj-section-gap">
          {data.destination && (
            <div className="vj-ss-item">
              <div className="vj-ss-label">Destino</div>
              <div className="vj-ss-val">{data.destination.split(',')[0]}</div>
              {data.destination.includes(',') && (
                <div className="vj-ss-sub">{data.destination.split(',').slice(1).join(',').trim()}</div>
              )}
            </div>
          )}
          {data.num_nights && (
            <div className="vj-ss-item">
              <div className="vj-ss-label">Duração</div>
              <div className="vj-ss-val">{data.num_nights}</div>
              <div className="vj-ss-sub">noites</div>
            </div>
          )}
          {excursions.length > 0 && (
            <div className="vj-ss-item">
              <div className="vj-ss-label">Passeios</div>
              <div className="vj-ss-val">{excursions.length}</div>
              <div className="vj-ss-sub">incluídos</div>
            </div>
          )}
          {data.total_value && (
            <div className="vj-ss-item">
              <div className="vj-ss-label">{pricingLabel}</div>
              <div className="vj-ss-val vj-ss-val-green">{fmt(data.total_value, data.currency ?? 'BRL')}</div>
              {installments[0] && (
                <div className="vj-ss-sub">ou {installments[0].installment_count}× de {fmt(installments[0].value)}</div>
              )}
            </div>
          )}
          {data.hotel_stars && (
            <div className="vj-ss-item">
              <div className="vj-ss-label">Categoria</div>
              <div className="vj-ss-val">{'★'.repeat(data.hotel_stars)}</div>
              <div className="vj-ss-sub">{data.meal_plan ? mealLabels[data.meal_plan] : 'Hotel'}</div>
            </div>
          )}
        </div>

        {/* DEST INFO */}
        {(data.destination || data.hotel_name) && (
          <div className="vj-dest-info vj-section-gap">
            <div className="vj-di-main">
              <div className="vj-di-photos">
                <div
                  className="vj-dip vj-dip-1"
                  style={{ background: coverImageUrl ? undefined : 'linear-gradient(160deg,#0d3b24,#1a6b4a)' }}
                >
                  {coverImageUrl
                    ? <img src={coverImageUrl} alt={data.destination || ''} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : '🏝️'
                  }
                </div>
                <div className="vj-dip" style={{ background: 'linear-gradient(135deg,#0a2a4a,#1560bd)' }}>🌊</div>
                <div className="vj-dip" style={{ background: 'linear-gradient(135deg,#2d4a1f,#4a7c3f)' }}>🌿</div>
              </div>
              <div className="vj-di-about">
                <h3>Sobre o destino</h3>
                <p>
                  {data.destination
                    ? `${data.destination} é um dos destinos mais deslumbrantes da lista de viagens personalizadas que preparamos para você. Esta proposta inclui todos os detalhes para uma experiência inesquecível.`
                    : 'Proposta de viagem personalizada preparada especialmente para você.'
                  }
                </p>
                <div className="vj-di-tags">
                  {data.hotel_name && <span className="vj-dtag">🏨 {data.hotel_name}</span>}
                  {data.meal_plan && <span className="vj-dtag">{mealLabels[data.meal_plan]}</span>}
                  {data.room_type && <span className="vj-dtag">{data.room_type}</span>}
                </div>
              </div>
            </div>

            <div className="vj-di-side">
              <div className="vj-info-card">
                <div className="vj-dic-title">📋 Detalhes da Proposta</div>
                {data.check_in && (
                  <div className="vj-dic-row">
                    <span className="vj-dic-key">Check-in</span>
                    <span className="vj-dic-val">{fmtDate(data.check_in)}</span>
                  </div>
                )}
                {data.check_out && (
                  <div className="vj-dic-row">
                    <span className="vj-dic-key">Check-out</span>
                    <span className="vj-dic-val">{fmtDate(data.check_out)}</span>
                  </div>
                )}
                {data.num_nights && (
                  <div className="vj-dic-row">
                    <span className="vj-dic-key">Noites</span>
                    <span className="vj-dic-val">{data.num_nights}</span>
                  </div>
                )}
                {data.hotel_stars && (
                  <div className="vj-dic-row">
                    <span className="vj-dic-key">Categoria</span>
                    <span className="vj-dic-val-green">{'★'.repeat(data.hotel_stars)} hotel</span>
                  </div>
                )}
                {data.meal_plan && (
                  <div className="vj-dic-row">
                    <span className="vj-dic-key">Regime</span>
                    <span className="vj-dic-val">{mealLabels[data.meal_plan] || data.meal_plan}</span>
                  </div>
                )}
                {(data as any).valid_until && (
                  <div className="vj-dic-row">
                    <span className="vj-dic-key">Validade</span>
                    <span className="vj-dic-val-orange">{fmtDate((data as any).valid_until)}</span>
                  </div>
                )}
              </div>

              {/* Map placeholder */}
              <div className="vj-map-card">
                <div className="vj-map-area">
                  <svg viewBox="0 0 320 160" fill="none" style={{ width:'100%', height:'100%' }}>
                    <rect width="320" height="160" fill="#d4e8c0"/>
                    <ellipse cx="160" cy="80" rx="60" ry="40" fill="#a8d4a0" opacity=".5"/>
                    <path d="M40 100 Q160 40 280 90" stroke="rgba(255,255,255,.6)" strokeWidth="3" fill="none"/>
                    <circle cx="160" cy="80" r="8" fill="#e53935" stroke="white" strokeWidth="2"/>
                    <circle cx="80" cy="95" r="5" fill="#1a5fa8" stroke="white" strokeWidth="1.5"/>
                    <circle cx="240" cy="75" r="5" fill="#1a5fa8" stroke="white" strokeWidth="1.5"/>
                  </svg>
                  <div className="vj-map-label">📍 {data.destination || 'Destino'}</div>
                </div>
                <div className="vj-map-footer">
                  <div>
                    <div className="vj-map-footer-txt">{data.destination}</div>
                    <div className="vj-map-footer-sub">Mapa ilustrativo</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#1a5fa8' }}>Ver rota →</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VOOS / TRANSPORTES */}
        {transports.length > 0 && (
          <div className="vj-section-gap">
            <div className="vj-sh">
              <div>
                <div className="vj-sh-title">✈️ Transportes</div>
                <div className="vj-sh-sub">{transports.length} trecho{transports.length > 1 ? 's' : ''} planejado{transports.length > 1 ? 's' : ''}</div>
              </div>
            </div>
            {transports.map((t: any, i: number) => (
              <div key={i} className="vj-flight-card">
                <div className="vj-flight-header">
                  <div className="vj-fh-left">
                    <div className="vj-airline-logo">{transportIcons[t.type] || '✈️'}</div>
                    <div>
                      <div className="vj-fh-name">{t.operator || t.type}</div>
                      <div className="vj-fh-sub">{t.from} → {t.to}</div>
                    </div>
                  </div>
                  <div className="vj-fh-tags">
                    <span className="vj-tag vj-tag-green">Incluído</span>
                  </div>
                </div>
                <div className="vj-flight-body">
                  <div>
                    <div className="vj-fb-time">{t.departure ? new Date(t.departure).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}</div>
                    <div className="vj-fb-city">{t.from}</div>
                    <div className="vj-fb-code">{t.departure ? new Date(t.departure).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : ''}</div>
                  </div>
                  <div className="vj-fb-arrow">
                    <div className="vj-fb-line" />
                    <div className="vj-fb-dur">{transportIcons[t.type] || '→'}</div>
                    <div className="vj-fb-stop-ok">Direto</div>
                  </div>
                  <div>
                    <div className="vj-fb-time">{t.arrival ? new Date(t.arrival).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}</div>
                    <div className="vj-fb-city">{t.to}</div>
                    <div className="vj-fb-code">{t.arrival ? new Date(t.arrival).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : ''}</div>
                  </div>
                  <div style={{ width: 1, height: 40, background: '#e5e4e0', margin: '0 4px' }} />
                  <div className="vj-fb-price">
                    <div className="vj-fb-price-val" style={{ fontSize: 14, color: '#1a7a4a' }}>✓</div>
                    <div className="vj-fb-price-per">Incluído</div>
                  </div>
                </div>
                {t.notes && (
                  <div className="vj-flight-details">
                    <div className="vj-fd-pill">📝 {t.notes}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ITINERÁRIO */}
        {itinerary.length > 0 && (
          <div className="vj-section-gap">
            <div className="vj-sh">
              <div>
                <div className="vj-sh-title">🗺️ Itinerário — Dia a Dia</div>
                <div className="vj-sh-sub">{itinerary.length} dia{itinerary.length > 1 ? 's' : ''} de roteiro personalizado</div>
              </div>
            </div>
            <div className="vj-itin-scroll">
              {itinerary.map((day: any, i: number) => (
                <div key={i} className="vj-itin-card">
                  <div className="vj-ic-day">Dia {day.day ?? i + 1}</div>
                  <div className="vj-ic-date">
                    {day.date ? new Date(day.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }) : day.title}
                  </div>
                  <div className="vj-ic-city">{day.location || ''}</div>
                  {day.description && (
                    <div className="vj-ic-items">
                      {day.description.split('\n').filter(Boolean).map((line: string, j: number) => (
                        <div key={j} className="vj-ic-item">
                          <div className="vj-ic-item-dot" />
                          {line}
                        </div>
                      ))}
                    </div>
                  )}
                  {day.accommodation && (
                    <div className="vj-ic-hotel">🏨 {day.accommodation}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASSEIOS */}
        {excursions.length > 0 && (
          <div className="vj-section-gap">
            <div className="vj-sh">
              <div>
                <div className="vj-sh-title">🎯 Passeios & Serviços</div>
                <div className="vj-sh-sub">Experiências selecionadas para você</div>
              </div>
            </div>
            <div className="vj-hotel-scroll">
              {excursions.map((exc: any, i: number) => (
                <div key={i} className="vj-hotel-card">
                  <div className="vj-hotel-img" style={{ background: 'linear-gradient(135deg,#0a2a4a,#1565c0)' }}>
                    🎯
                    {exc.included && <div className="vj-hotel-img-badge">INCLUSO</div>}
                  </div>
                  <div className="vj-hotel-info">
                    <div className="vj-hotel-name">{exc.title}</div>
                    {exc.duration && <div className="vj-hotel-loc">⏱ {exc.duration}</div>}
                    <div className="vj-hotel-row">
                      <div className="vj-hotel-feats">
                        {exc.price_per_person && <span className="vj-hf-pill">👤 {exc.price_per_person}/pp</span>}
                      </div>
                      {exc.price_per_couple && (
                        <span className="vj-hotel-price">{exc.price_per_couple}/casal</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PREÇOS */}
        {hasPriceDetails && (
          <div className="vj-price-section vj-section-gap">
            {/* Breakdown */}
            <div className="vj-price-breakdown">
              <div className="vj-sh" style={{ marginBottom: 16 }}>
                <div>
                  <div className="vj-sh-title">💰 Detalhes do Valor</div>
                </div>
              </div>

              {transports.length > 0 && (
                <div className="vj-pb-row">
                  <span className="vj-pb-label"><span className="vj-pb-label-icon">✈️</span> Transportes</span>
                  <span className="vj-pb-val">incluído</span>
                </div>
              )}
              {data.hotel_name && data.num_nights && (
                <div className="vj-pb-row">
                  <span className="vj-pb-label"><span className="vj-pb-label-icon">🏨</span> {data.hotel_name} ({data.num_nights} noites)</span>
                  <span className="vj-pb-val">incluído</span>
                </div>
              )}
              {excursions.filter((e: any) => e.included).map((exc: any, i: number) => (
                <div key={i} className="vj-pb-row">
                  <span className="vj-pb-label"><span className="vj-pb-label-icon">🎯</span> {exc.title}</span>
                  <span className="vj-pb-val">incluído</span>
                </div>
              ))}
              {includedItems.map((item, i) => (
                <div key={i} className="vj-pb-row">
                  <span className="vj-pb-label"><span className="vj-pb-label-icon">✅</span> {item}</span>
                  <span className="vj-pb-val">incluído</span>
                </div>
              ))}

              {data.total_value && (
                <div className="vj-pb-total">
                  <span className="vj-pb-total-l">Total ({pricingLabel.toLowerCase()})</span>
                  <span className="vj-pb-total-v">{fmt(data.total_value, data.currency ?? 'BRL')}</span>
                </div>
              )}

              {/* Não incluído */}
              {excludedItems.length > 0 && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e5e4e0' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: '#9b9a96', marginBottom: 10 }}>Não incluído</div>
                  {excludedItems.map((item, i) => (
                    <div key={i} className="vj-pb-row" style={{ color: '#9b9a96' }}>
                      <span className="vj-pb-label"><span className="vj-pb-label-icon">❌</span> {item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTA Card */}
            <div className="vj-price-cta">
              <div className="vj-price-total-card">
                <div className="vj-ptc-label">Valor total</div>
                <div className="vj-ptc-val">{fmt(data.total_value, data.currency ?? 'BRL')}</div>
                <div className="vj-ptc-sub">{pricingLabel} · todos os serviços</div>
                {installments.length > 0 && (
                  <>
                    <div className="vj-ptc-divider" />
                    <div className="vj-ptc-parc">Parcelamento em até</div>
                    {installments.map((inst, i) => (
                      <div key={i} className="vj-ptc-parc-val">
                        {inst.installment_count}× de {fmt(inst.value)}
                        <span style={{ fontSize: 11, opacity: .6, marginLeft: 6 }}>{inst.type}</span>
                      </div>
                    ))}
                  </>
                )}
                {whatsappUrl && (
                  <>
                    <button className="vj-btn-block vj-btn-white" onClick={() => window.open(whatsappUrl, '_blank')}>
                      Confirmar reserva →
                    </button>
                    <button className="vj-btn-block vj-btn-outline-w" onClick={() => window.open(whatsappUrl, '_blank')}>
                      Fazer pergunta
                    </button>
                  </>
                )}
              </div>

              <div className="vj-note-card">
                <div className="vj-nc-icon">✅</div>
                <div className="vj-nc-title">Proposta personalizada</div>
                <div className="vj-nc-text">
                  Esta cotação foi elaborada exclusivamente para você. Entre em contato para ajustes, dúvidas ou para confirmar sua reserva.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INCLUDES GRID */}
        {(includedItems.length > 0 || excursions.length > 0) && (
          <div className="vj-includes-grid vj-section-gap">
            {transports.length > 0 && (
              <div className="vj-inc-card">
                <div className="vj-inc-icon">✈️</div>
                <div>
                  <div className="vj-inc-title">Transportes</div>
                  <div className="vj-inc-sub">{transports.map((t: any) => `${t.from} → ${t.to}`).join(' · ')}</div>
                </div>
              </div>
            )}
            {data.hotel_name && (
              <div className="vj-inc-card">
                <div className="vj-inc-icon">🏨</div>
                <div>
                  <div className="vj-inc-title">{data.hotel_name}</div>
                  <div className="vj-inc-sub">
                    {data.num_nights} noites · {data.meal_plan ? mealLabels[data.meal_plan] : 'Hospedagem'}
                    {data.room_type ? ` · ${data.room_type}` : ''}
                  </div>
                </div>
              </div>
            )}
            {excursions.filter((e: any) => e.included).map((exc: any, i: number) => (
              <div key={i} className="vj-inc-card">
                <div className="vj-inc-icon">🎯</div>
                <div>
                  <div className="vj-inc-title">{exc.title}</div>
                  <div className="vj-inc-sub">{exc.description || ''}</div>
                </div>
              </div>
            ))}
            {includedItems.map((item, i) => (
              <div key={i} className="vj-inc-card">
                <div className="vj-inc-icon">✅</div>
                <div>
                  <div className="vj-inc-title">{item}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WHATSAPP TEXT (se preenchido) */}
        {data.whatsapp_text && whatsappUrl && (
          <div className="vj-note-card vj-note-card-blue vj-section-gap">
            <div className="vj-nc-icon">💬</div>
            <div className="vj-nc-title vj-nc-title-blue">Mensagem personalizada do agente</div>
            <div className="vj-nc-text vj-nc-text-blue" style={{ whiteSpace: 'pre-wrap' }}>
              {data.whatsapp_text}
            </div>
          </div>
        )}

        {/* Footer nota */}
        <div style={{ marginTop: 40, textAlign: 'center', fontSize: 11, color: '#9b9a96', padding: '20px 0', borderTop: '1px solid #e5e4e0' }}>
          Proposta gerada pela plataforma VoyageOS · Plan-Fect Harmony.
          Valores e disponibilidade sujeitos a confirmação até a emissão formal.
        </div>
      </div>

      {/* Footer */}
      <div className="vj-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a7a4a' }} />
          <span style={{ fontWeight: 600 }}>{data.org_name}</span>
        </div>
        {data.org_whatsapp && (
          <a href={`https://wa.me/55${data.org_whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
            📱 {data.org_whatsapp}
          </a>
        )}
      </div>
    </PublicLayout>
  );
}
