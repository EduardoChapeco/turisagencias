import { CheckCircle2, Loader2, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  confirmName: string;
  setConfirmName: (v: string) => void;
  confirmEmail: string;
  setConfirmEmail: (v: string) => void;
  confirmNotes: string;
  setConfirmNotes: (v: string) => void;
  confirmLoading: boolean;
  confirmSuccess: boolean;
  confirmError: string;
  handleConfirm: () => void;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  confirmName,
  setConfirmName,
  confirmEmail,
  setConfirmEmail,
  confirmNotes,
  setConfirmNotes,
  confirmLoading,
  confirmSuccess,
  confirmError,
  handleConfirm
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(17, 17, 16, 0.4)', backdropFilter: 'blur(4px)', padding: 16 }}>
      <div style={{ background: 'var(--vj-bg)', width: '100%', maxWidth: 420, borderRadius: 24, padding: 32, position: 'relative', boxShadow: '0 24px 48px rgba(0,0,0,0.1)' }}>
        <button 
          onClick={onClose}
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
              <button onClick={onClose} style={{ background: 'var(--vj-green)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 100, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
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
  );
}
