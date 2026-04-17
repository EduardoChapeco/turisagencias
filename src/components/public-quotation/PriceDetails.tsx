interface PriceDetailsProps {
  data: any;
  priceItems: any[];
  flights: any[];
  transfers: any[];
  installments: any[];
  paxAdultos?: number;
  paxCriancas?: number;
  cancelamento?: string;
  cancelamentoData?: string;
  excludedItems: string[];
  pricingLabel: string;
  fmt: (value: number | null, currency?: string) => string;
  fmtDate: (d: string | null) => string;
  daysLeft: number | null;
  whatsappUrl: string | null;
  onConfirmClick: () => void;
}

export function PriceDetails({
  data, priceItems, flights, transfers, installments, 
  paxAdultos, paxCriancas, cancelamento, cancelamentoData, 
  excludedItems, pricingLabel, fmt, fmtDate, daysLeft, 
  whatsappUrl, onConfirmClick
}: PriceDetailsProps) {
  const hasPriceDetails = data.total_value || installments.length > 0 || priceItems.length > 0;
  if (!hasPriceDetails) return null;

  return (
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
            {(paxAdultos ?? 0) > 0 && <span>👤 {paxAdultos} adulto{(paxAdultos ?? 0) > 1 ? 's' : ''}</span>}
            {(paxCriancas ?? 0) > 0 && <span>👶 {paxCriancas} criança{(paxCriancas ?? 0) > 1 ? 's' : ''}</span>}
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
              <button className="vj-btn-block vj-btn-white" onClick={onConfirmClick}>
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
  );
}
