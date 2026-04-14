import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, MapPin, CheckCircle2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { parseInstallments } from '@/lib/utils';
import type { PublicQuotationData } from '@/types';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { TurisBadge } from '@/components/ui/TurisBadge';

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

  // Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmNotes, setConfirmNotes] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(false);
  const [confirmError, setConfirmError] = useState('');

  const handleConfirm = async () => {
    if (!token || !confirmName) {
      setConfirmError('Preencha seu nome para continuar.');
      return;
    }
    setConfirmLoading(true);
    setConfirmError('');
    try {
      const { error } = await supabase.rpc('confirm_public_quotation', {
        p_token: token,
        p_traveler_name: confirmName,
        p_traveler_email: confirmEmail,
        p_notes: confirmNotes
      });
      if (error) throw error;
      setConfirmSuccess(true);
    } catch (err: unknown) {
      setConfirmError('Ocorreu um erro ao confirmar a cotação.');
    } finally {
      setConfirmLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    
    // Using standard select now that RLS allows Anon read with valid token check
    supabase
      .from('quotations')
      .select(`
        *,
        organizations(name, logo_url, whatsapp, primary_color),
        itinerary_days(
          id, day_number, date, city, country, label,
          itinerary_items(description, order_position)
        ),
        flights(
          id, direction, airline_name, airline_code, cabin_class, is_recommended, total_price,
          flight_segments(
            segment_order, departure_airport_code, departure_airport_city,
            arrival_airport_code, arrival_airport_city,
            departure_datetime, arrival_datetime, duration_minutes,
            is_direct, stops, connection_info
          ),
          flight_amenities(icon, label)
        ),
        quote_hotels(
          id, check_in, check_out, nights, room_type, total_price,
          hotel_id
        ),
        quote_transfers(
          id, tipo, nome, fornecedor, data_inicio, data_fim,
          instrucoes, ponto_encontro, adultos, criancas, valor_total, order_position
        ),
        quote_price_items(icon, label, amount, order_position),
        quote_includes(icon, title, description, order_position),
        quote_experiences(
          id, nome, tipo, fornecedor, data_inicio, data_fim,
          adultos, criancas, valor_total, order_position
        )
      `)
      .eq('share_token', token)
      .single()
      .then(({ data: row, error }) => {
        setLoading(false);
        if (error || !row) { setNotFound(true); return; }
        
        const mappedData: any = {
          ...row,
          org_name: (row.organizations as any)?.name,
          org_logo: (row.organizations as any)?.logo_url,
          org_whatsapp: (row.organizations as any)?.whatsapp,
          org_primary_color: (row.organizations as any)?.primary_color,
          installments: parseInstallments(row.installments),
          // Sort itinerary days by day_number
          itinerary: ((row as any).itinerary_days as any[] || []).sort((a: any, b: any) => a.day_number - b.day_number),
          flights_data: ((row as any).flights as any[] || []).sort((a: any, b: any) => {
            if (a.direction === 'outbound' && b.direction === 'return') return -1;
            if (a.direction === 'return' && b.direction === 'outbound') return 1;
            return 0;
          }),
          transfers: ((row as any).quote_transfers as any[] || []).sort((a: any, b: any) => a.order_position - b.order_position),
          price_items: ((row as any).quote_price_items as any[] || []).sort((a: any, b: any) => a.order_position - b.order_position),
          includes_items: ((row as any).quote_includes as any[] || []).sort((a: any, b: any) => a.order_position - b.order_position),
          excursions: ((row as any).quote_experiences as any[] || []).sort((a: any, b: any) => a.order_position - b.order_position),
          included_items: [],
          excluded_items: [],
        };
        
        setData(mappedData);
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
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--vj-bg)' }}>
        <Loader2 style={{ width: 32, height: 32, animation: 'spin 1s linear infinite', color: 'var(--vj-green)' }} />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--vj-bg)', padding: 16 }}>
        <div style={{ textAlign: 'center', padding: 40, background: 'var(--vj-white)', borderRadius: 22, border: '1px solid var(--vj-border)', maxWidth: 380 }}>
          <MapPin style={{ width: 40, height: 40, color: 'var(--vj-txt3)', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--vj-txt)' }}>Cotação não encontrada</p>
          <p style={{ fontSize: 13, color: 'var(--vj-txt2)', marginTop: 8, lineHeight: 1.6 }}>
            O link pode estar expirado, inválido ou a proposta já foi fechada.
          </p>
        </div>
      </div>
    );
  }

  const installments = data.installments ?? [];
  const itinerary: any[] = (data as any).itinerary ?? [];
  const flights: any[] = (data as any).flights_data ?? [];
  const transfers: any[] = (data as any).transfers ?? [];
  const priceItems: any[] = (data as any).price_items ?? [];
  const includesItems: any[] = (data as any).includes_items ?? [];
  const excursions: any[] = (data as any).excursions ?? [];
  const includedItems: string[] = (data as any).included_items ?? [];
  const excludedItems: string[] = (data as any).excluded_items ?? [];
  const coverImageUrl = (data as any).cover_image_url || data.hotel_photo_url;
  const pricingMode = (data as any).pricing_mode || 'per_person';
  const validUntil = (data as any).valid_until;
  const cancelamento = (data as any).cancelamento_texto_raw;
  const cancelamentoData = (data as any).cancelamento_data_limite;
  const paxAdultos = (data as any).pax_adultos;
  const paxCriancas = (data as any).pax_criancas;
  // transports kept for legacy compat
  const transports = flights;

  const pricingLabel = pricingMode === 'per_couple' ? 'Por casal' :
    pricingMode === 'per_family' ? 'Por família' :
    pricingMode === 'total' ? 'Pacote total' : 'Por pessoa';

  const hasPriceDetails = data.total_value || installments.length > 0 || priceItems.length > 0;

  const whatsappUrl = data.org_whatsapp
    ? `https://wa.me/55${data.org_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
        data.whatsapp_text || `Olá! Gostaria de confirmar a cotação para ${data.destination || 'a viagem'}.`
      )}`
    : null;

  // Urgency: days until expiry
  const daysLeft = validUntil ? Math.ceil((new Date(validUntil).getTime() - Date.now()) / 86400000) : null;

  // Agent initials
  const agentInitials = data.org_name
    ? data.org_name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
    : 'AG';

  const ref = token ? `#${token.slice(0, 8).toUpperCase()}` : '';

  // Se o data contiver destination via db migrations
  const isDestinationValid = data.destination || (data as any).cover_title;


  return (
    <>
    <PublicLayout
      orgName={data.org_name}
      orgLogo={data.org_logo}
      tabs={[
        { id: 'cot', label: 'Cotação', active: true },
        ...(itinerary.length > 0 ? [{ id: 'itin', label: 'Roteiro' }] : []),
      ]}
      ctaLabel="Reservar →"
      onCtaClick={() => setIsConfirmOpen(true)}
      ctaSecondaryLabel={whatsappUrl ? 'Perguntar' : undefined}
      onCtaSecondaryClick={whatsappUrl ? () => window.open(whatsappUrl, '_blank') : undefined}
    >

      {/* CONFIRMATION MODAL OVERLAY */}
      {isConfirmOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(17, 17, 16, 0.4)', backdropFilter: 'blur(4px)', padding: 16 }}>
          <div style={{ background: 'var(--vj-bg)', width: '100%', maxWidth: 420, borderRadius: 24, padding: 32, position: 'relative', boxShadow: '0 24px 48px rgba(0,0,0,0.1)' }}>
            <button 
              onClick={() => setIsConfirmOpen(false)}
              style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--vj-txt3)' }}
            >
              <X size={20} />
            </button>

            {confirmSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle2 size={56} color="var(--vj-green)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--vj-txt)', marginBottom: 8 }}>Solicitação Confirmada!</h3>
                <p style={{ color: 'var(--vj-txt2)', fontSize: 14, lineHeight: 1.5 }}>
                  Nossa equipe já foi notificada sobre seu interesse. Entraremos em contato em breve para prosseguir com o pagamento e a emissão.
                </p>
                <div style={{ marginTop: 24 }}>
                  <button onClick={() => setIsConfirmOpen(false)} style={{ background: 'var(--vj-green)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 100, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                    Fechar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--vj-txt)', marginBottom: 8 }}>Confirmar Reserva</h3>
                <p style={{ color: 'var(--vj-txt2)', fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
                  Ótima escolha! Preencha os dados abaixo para sinalizar seu aceite. Nossa equipe cuidará do resto.
                </p>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--vj-txt)' }}>Nome Completo *</label>
                  <input type="text" value={confirmName} onChange={e => setConfirmName(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--vj-border)', background: '#fff', outline: 'none', color: 'var(--vj-txt)' }} placeholder="Como devemos lhe chamar" />
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--vj-txt)' }}>E-mail ou WhatsApp</label>
                  <input type="text" value={confirmEmail} onChange={e => setConfirmEmail(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--vj-border)', background: '#fff', outline: 'none', color: 'var(--vj-txt)' }} placeholder="Para nosso retorno" />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--vj-txt)' }}>Observações (Opcional)</label>
                  <textarea rows={3} value={confirmNotes} onChange={e => setConfirmNotes(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--vj-border)', background: '#fff', outline: 'none', color: 'var(--vj-txt)', resize: 'none' }} placeholder="Algum detalhe extra sobre acompanhantes ou pagamento..." />
                </div>

                {confirmError && (
                  <div style={{ padding: 12, background: 'var(--vj-red-bg)', color: 'var(--vj-red)', fontSize: 13, borderRadius: 12, marginBottom: 16 }}>
                    {confirmError}
                  </div>
                )}

                <button 
                  disabled={confirmLoading}
                  onClick={handleConfirm}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--vj-green)', color: '#fff', border: 'none', padding: 16, borderRadius: 100, fontWeight: 600, fontSize: 15, cursor: confirmLoading ? 'not-allowed' : 'pointer', opacity: confirmLoading ? 0.7 : 1 }}
                >
                  {confirmLoading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
                  {confirmLoading ? 'Enviando...' : 'Confirmar Interesse'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
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
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--vj-txt)' }}>{data.org_name}</div>
              <div style={{ fontSize: 10, color: 'var(--vj-txt3)' }}>Agência de Viagens</div>
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
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--vj-blue)' }}>Ver rota →</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VOOS / TRANSPORTES — schema relacional correto */}
        {flights.length > 0 && (
          <div className="vj-section-gap">
            <div className="vj-sh">
              <div>
                <div className="vj-sh-title">✈️ Voos</div>
                <div className="vj-sh-sub">{flights.length} trecho{flights.length > 1 ? 's' : ''} do roteiro</div>
              </div>
            </div>
            {flights.map((flight: any, i: number) => {
              const segs: any[] = [...(flight.flight_segments || [])].sort((a: any, b: any) => a.segment_order - b.segment_order);
              const firstSeg = segs[0];
              const lastSeg = segs[segs.length - 1];
              const isReturn = flight.direction === 'return';
              return (
                <div key={i} className="vj-flight-card">
                  <div className="vj-flight-header">
                    <div className="vj-fh-left">
                      <div className="vj-airline-logo">{isReturn ? '↩️' : '✈️'}</div>
                      <div>
                        <div className="vj-fh-name">{flight.airline_name || 'Aéreo'}</div>
                        <div className="vj-fh-sub">
                          {isReturn ? 'Voo de Volta' : 'Voo de Ida'}
                          {flight.cabin_class ? ` · ${flight.cabin_class === 'economy' ? 'Econômica' : flight.cabin_class === 'business' ? 'Executiva' : flight.cabin_class}` : ''}
                          {segs.length > 1 ? ` · ${segs.length - 1} conexão` : ' · Direto'}
                        </div>
                      </div>
                    </div>
                    <div className="vj-fh-tags">
                      {flight.is_recommended && <span className="vj-tag vj-tag-blue">⭐ Recomendado</span>}
                      <span className="vj-tag vj-tag-green">Incluído</span>
                    </div>
                  </div>
                  {segs.length > 0 && (
                    <div className="vj-flight-body">
                      <div>
                        <div className="vj-fb-time">
                          {firstSeg.departure_datetime ? new Date(firstSeg.departure_datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </div>
                        <div className="vj-fb-city">{firstSeg.departure_airport_city || firstSeg.departure_airport_code}</div>
                        <div className="vj-fb-code">{firstSeg.departure_airport_code}</div>
                      </div>
                      <div className="vj-fb-arrow">
                        <div className="vj-fb-line" />
                        <div className="vj-fb-dur">✈️</div>
                        <div className="vj-fb-stop-ok">
                          {segs.length > 1 ? `${segs.length - 1} esc.` : 'Direto'}
                        </div>
                      </div>
                      <div>
                        <div className="vj-fb-time">
                          {lastSeg?.arrival_datetime ? new Date(lastSeg.arrival_datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </div>
                        <div className="vj-fb-city">{lastSeg?.arrival_airport_city || lastSeg?.arrival_airport_code}</div>
                        <div className="vj-fb-code">{lastSeg?.arrival_airport_code}</div>
                      </div>
                    </div>
                  )}
                  {/* Segments detail for connections */}
                  {segs.length > 1 && (
                    <div className="vj-flight-details">
                      {segs.map((seg: any, si: number) => (
                        <div key={si} className="vj-fd-pill">
                          {seg.departure_airport_code} → {seg.arrival_airport_code}
                          {seg.connection_info && ` · ${seg.connection_info}`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TRANSFERS */}
        {transfers.length > 0 && (
          <div className="vj-section-gap">
            <div className="vj-sh">
              <div>
                <div className="vj-sh-title">🚗 Transfers & Receptivo</div>
                <div className="vj-sh-sub">{transfers.length} serviço{transfers.length > 1 ? 's' : ''} de transfer</div>
              </div>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {transfers.map((t: any, i: number) => (
                <div key={i} className="vj-flight-card">
                  <div className="vj-flight-header">
                    <div className="vj-fh-left">
                      <div className="vj-airline-logo">
                        {t.tipo === 'privativo' ? '🚐' : t.tipo === 'nautico' ? '⛵' : '🚗'}
                      </div>
                      <div>
                        <div className="vj-fh-name">{t.nome || 'Transfer'}</div>
                        <div className="vj-fh-sub">
                          {t.fornecedor || ''}
                          {t.tipo ? ` · ${t.tipo === 'in' ? 'Chegada' : t.tipo === 'out' ? 'Saída' : t.tipo === 'round' ? 'Ida & Volta' : t.tipo}` : ''}
                        </div>
                      </div>
                    </div>
                    <span className="vj-tag vj-tag-green">Incluído</span>
                  </div>
                  {(t.ponto_encontro || t.instrucoes) && (
                    <div className="vj-flight-details">
                      {t.ponto_encontro && <div className="vj-fd-pill">📍 {t.ponto_encontro}</div>}
                      {t.instrucoes && <div className="vj-fd-pill" style={{ color: 'var(--vj-txt2)' }}>ℹ️ {t.instrucoes}</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ITINERÁRIO — usando schema relacional correto */}
        {itinerary.length > 0 && (
          <div className="vj-section-gap">
            <div className="vj-sh">
              <div>
                <div className="vj-sh-title">🗺️ Itinerário — Dia a Dia</div>
                <div className="vj-sh-sub">{itinerary.length} dia{itinerary.length > 1 ? 's' : ''} de roteiro personalizado</div>
              </div>
            </div>
            <div className="vj-itin-scroll">
              {itinerary.map((day: any, i: number) => {
                const items: any[] = [...(day.itinerary_items || [])].sort((a: any, b: any) => a.order_position - b.order_position);
                return (
                  <div key={i} className="vj-itin-card">
                    <div className="vj-ic-day">Dia {day.day_number ?? i + 1}</div>
                    <div className="vj-ic-date">
                      {day.date
                        ? new Date(day.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
                        : day.label}
                    </div>
                    <div className="vj-ic-city">{day.city}{day.country ? `, ${day.country}` : ''}</div>
                    {items.length > 0 && (
                      <div className="vj-ic-items">
                        {items.map((item: any, j: number) => (
                          <div key={j} className="vj-ic-item">
                            <div className="vj-ic-item-dot" />
                            {item.description}
                          </div>
                        ))}
                      </div>
                    )}
                    {day.label && items.length === 0 && (
                      <div className="vj-ic-items">
                        <div className="vj-ic-item">
                          <div className="vj-ic-item-dot" />
                          {day.label}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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

        {/* PREÇOS — usa price_items relacionais quando disponível */}
        {hasPriceDetails && (
          <div className="vj-price-section vj-section-gap">
            {/* Breakdown */}
            <div className="vj-price-breakdown">
              <div className="vj-sh" style={{ marginBottom: 16 }}>
                <div>
                  <div className="vj-sh-title">💰 Detalhes do Valor</div>
                </div>
              </div>

              {/* Itens relacionais */}
              {priceItems.length > 0 ? priceItems.map((item: any, i: number) => (
                <div key={i} className="vj-pb-row">
                  <span className="vj-pb-label"><span className="vj-pb-label-icon">{item.icon || '—'}</span> {item.label}</span>
                  <span className="vj-pb-val">{item.amount ? fmt(item.amount, data.currency ?? 'BRL') : 'incluído'}</span>
                </div>
              )) : (
                <>
                  {flights.length > 0 && (
                    <div className="vj-pb-row">
                      <span className="vj-pb-label"><span className="vj-pb-label-icon">✈️</span> Passagem aérea</span>
                      <span className="vj-pb-val">incluído</span>
                    </div>
                  )}
                  {data.hotel_name && data.num_nights && (
                    <div className="vj-pb-row">
                      <span className="vj-pb-label"><span className="vj-pb-label-icon">🏨</span> {data.hotel_name} ({data.num_nights} noites)</span>
                      <span className="vj-pb-val">incluído</span>
                    </div>
                  )}
                  {transfers.length > 0 && (
                    <div className="vj-pb-row">
                      <span className="vj-pb-label"><span className="vj-pb-label-icon">🚗</span> Transfers</span>
                      <span className="vj-pb-val">incluído</span>
                    </div>
                  )}
                </>
              )}

              {data.total_value && (
                <div className="vj-pb-total">
                  <span className="vj-pb-total-l">Total ({pricingLabel.toLowerCase()})</span>
                  <span className="vj-pb-total-v">{fmt(data.total_value, data.currency ?? 'BRL')}</span>
                </div>
              )}

              {/* PAX info */}
              {(paxAdultos || paxCriancas) && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--vj-border)', display: 'flex', gap: 16, fontSize: 12, color: 'var(--vj-txt3)' }}>
                  {paxAdultos > 0 && <span>👤 {paxAdultos} adulto{paxAdultos > 1 ? 's' : ''}</span>}
                  {paxCriancas > 0 && <span>👶 {paxCriancas} criança{paxCriancas > 1 ? 's' : ''}</span>}
                </div>
              )}

              {/* Cancelamento */}
              {cancelamento && (
                <div style={{ marginTop: 16, padding: '12px 14px', background: '#fff8ed', border: '1px solid #f59e0b40', borderRadius: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#b45309', marginBottom: 4 }}>⚠️ Política de Cancelamento</div>
                  <div style={{ fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
                    {cancelamentoData && <strong style={{ display: 'block', marginBottom: 4 }}>Prazo sem multa: {fmtDate(cancelamentoData)}</strong>}
                    {cancelamento}
                  </div>
                </div>
              )}

              {/* Não incluído */}
              {excludedItems.length > 0 && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--vj-border)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--vj-txt3)', marginBottom: 10 }}>Não incluído</div>
                  {excludedItems.map((item, i) => (
                    <div key={i} className="vj-pb-row" style={{ color: 'var(--vj-txt3)' }}>
                      <span className="vj-pb-label"><span className="vj-pb-label-icon">❌</span> {item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTA Card */}
            <div className="vj-price-cta">
              {/* Urgency banner when expiry is close */}
              {daysLeft !== null && daysLeft <= 5 && daysLeft >= 0 && (
                <div style={{ padding: '10px 16px', background: daysLeft <= 2 ? '#fee2e2' : '#fff8ed', borderRadius: 12, marginBottom: 12, border: `1px solid ${daysLeft <= 2 ? '#fca5a5' : '#fde68a'}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{daysLeft <= 2 ? '🔴' : '🟡'}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: daysLeft <= 2 ? '#dc2626' : '#d97706' }}>
                      {daysLeft === 0 ? 'Expira hoje!' : `Expira em ${daysLeft} dia${daysLeft > 1 ? 's' : ''}!`}
                    </div>
                    <div style={{ fontSize: 11, color: daysLeft <= 2 ? '#b91c1c' : '#b45309' }}>Confirme agora para garantir a disponibilidade.</div>
                  </div>
                </div>
              )}
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
                    <button className="vj-btn-block vj-btn-white" onClick={() => setIsConfirmOpen(true)}>
                      ✅ Confirmar reserva
                    </button>
                    <button className="vj-btn-block vj-btn-outline-w" onClick={() => window.open(whatsappUrl, '_blank')}>
                      💬 Fazer pergunta
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

        {/* INCLUDES GRID — usa includes_items relacionais quando disponível */}
        {(includesItems.length > 0 || includedItems.length > 0 || flights.length > 0 || data.hotel_name || transfers.length > 0) && (
          <div className="vj-includes-grid vj-section-gap">
            {includesItems.length > 0 ? includesItems.map((inc: any, i: number) => (
              <div key={i} className="vj-inc-card">
                <div className="vj-inc-icon">{inc.icon || '✅'}</div>
                <div>
                  <div className="vj-inc-title">{inc.title}</div>
                  {inc.description && <div className="vj-inc-sub">{inc.description}</div>}
                </div>
              </div>
            )) : (
              <>
                {flights.length > 0 && (
                  <div className="vj-inc-card">
                    <div className="vj-inc-icon">✈️</div>
                    <div>
                      <div className="vj-inc-title">Passagem aérea</div>
                      <div className="vj-inc-sub">{flights.map((f: any) => f.direction === 'outbound' ? 'Ida' : 'Volta').join(' + ')}</div>
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
                {transfers.length > 0 && (
                  <div className="vj-inc-card">
                    <div className="vj-inc-icon">🚗</div>
                    <div>
                      <div className="vj-inc-title">Transfers</div>
                      <div className="vj-inc-sub">{transfers.map((t: any) => t.nome).filter(Boolean).join(' · ') || 'Receptivo local'}</div>
                    </div>
                  </div>
                )}
                {includedItems.map((item, i) => (
                  <div key={i} className="vj-inc-card">
                    <div className="vj-inc-icon">✅</div>
                    <div>
                      <div className="vj-inc-title">{item}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
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
        <div style={{ marginTop: 40, textAlign: 'center', fontSize: 11, color: 'var(--vj-txt3)', padding: '20px 0', borderTop: '1px solid var(--vj-border)' }}>
          Proposta gerada pela plataforma Turis Agencias · Turis Agencias.
          Valores e disponibilidade sujeitos a confirmação até a emissão formal.
        </div>
      </div>

      {/* Footer */}
      <div className="vj-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--vj-green)' }} />
          <span style={{ fontWeight: 600 }}>{data.org_name}</span>
        </div>
        {data.org_whatsapp && (
          <a href={`https://wa.me/55${data.org_whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
            📱 {data.org_whatsapp}
          </a>
        )}
      </div>
    </PublicLayout>
    <TurisBadge />
    </>
  );
}

