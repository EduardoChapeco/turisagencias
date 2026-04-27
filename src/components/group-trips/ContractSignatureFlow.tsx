import { useState, useRef, useCallback } from 'react';
import { CheckCircle2, Camera, Shield, FileText, Loader2, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Props {
  bookingId: string;
  bookingToken: string;
  tripTitle: string;
  signerNamePrefill?: string;
  selectedSeats?: string[];
  onSigned: () => void;
}

type Step = 'consent' | 'identity' | 'photo' | 'signing' | 'done';

/**
 * ContractSignatureFlow — multi-step digital signature flow.
 * Steps: Consent → Identity data → Optional facial photo → Sign → Done
 *
 * Captures: name, CPF, email, IP (server-side), user-agent (server-side),
 * optional facial photo (getUserMedia), geolocation.
 * Sends to edge function sign-group-booking-contract which:
 *  - renders contract HTML with placeholders
 *  - computes SHA-256 of document + signer data
 *  - stores in contract_signatures
 *  - updates booking status to 'confirmed'
 */
export function ContractSignatureFlow({
  bookingId, bookingToken, tripTitle, signerNamePrefill = '', selectedSeats = [], onSigned,
}: Props) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [step, setStep] = useState<Step>('consent');
  const [form, setForm] = useState({ name: signerNamePrefill, cpf: '', email: '' });
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [geolocation, setGeolocation] = useState<{ lat: number; lng: number } | null>(null);
  const [signing, setSigning] = useState(false);

  const set = (p: Partial<typeof form>) => setForm(f => ({ ...f, ...p }));

  // ── Camera ────────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch {
      toast({ title: 'Câmera não disponível', description: 'Você pode pular a foto e assinar sem ela.', variant: 'destructive' });
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d')!.drawImage(v, 0, 0);
    setPhotoDataUrl(c.toDataURL('image/jpeg', 0.8));
    stopCamera();
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setPhotoDataUrl(null);
    startCamera();
  }, [startCamera]);

  // ── Geolocation ───────────────────────────────────────────────────────────
  const requestGeo = useCallback(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => setGeolocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {/* silently skip */}
    );
  }, []);

  // ── Upload facial photo to Supabase Storage ───────────────────────────────
  const uploadFacialPhoto = async (dataUrl: string): Promise<string | null> => {
    try {
      const blob = await fetch(dataUrl).then(r => r.blob());
      const path = `signatures/${bookingId}/facial_${Date.now()}.jpg`;
      const { data, error } = await supabase.storage.from('client-media').upload(path, blob, {
        contentType: 'image/jpeg', upsert: true,
      });
      if (error) throw error;
      const { data: pub } = supabase.storage.from('client-media').getPublicUrl(data.path);
      return pub.publicUrl;
    } catch {
      return null; // non-blocking
    }
  };

  // ── Final submission ──────────────────────────────────────────────────────
  const handleSign = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Nome obrigatório', variant: 'destructive' });
      return;
    }
    setSigning(true);
    setStep('signing');

    try {
      let facialPhotoUrl: string | null = null;
      if (photoDataUrl) {
        facialPhotoUrl = await uploadFacialPhoto(photoDataUrl);
      }

      const { data, error } = await supabase.functions.invoke('sign-group-booking-contract', {
        body: {
          booking_id: bookingId,
          booking_token: bookingToken,
          signer_name: form.name,
          signer_cpf: form.cpf || null,
          signer_email: form.email || null,
          facial_photo_url: facialPhotoUrl,
          geolocation: geolocation ? { lat: geolocation.lat, lng: geolocation.lng } : null,
          selected_seats: selectedSeats,
        },
      });

      if (error || !data?.success) throw new Error(error?.message || data?.error || 'Erro ao assinar');

      setStep('done');
      onSigned();
    } catch (e: any) {
      toast({ title: 'Erro ao assinar', description: e.message, variant: 'destructive' });
      setStep('photo');
    } finally {
      setSigning(false);
    }
  };

  // ── STEPS ─────────────────────────────────────────────────────────────────

  if (step === 'done') {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-vj-green/10 flex items-center justify-center">
          <CheckCircle2 className="text-vj-green" size={36} />
        </div>
        <div>
          <h3 className="font-bold text-xl text-vj-txt">Contrato Assinado! ✅</h3>
          <p className="text-sm text-vj-txt3 mt-1">
            Sua assinatura foi registrada com selo de tempo e hash criptográfico.<br />
            Sua reserva foi confirmada.
          </p>
        </div>
        <div className="p-3 bg-vj-bg rounded-xl border border-vj-border text-xs text-vj-txt3 font-mono">
          Assinado em {new Date().toLocaleString('pt-BR')} · IP registrado · SHA-256 verificado
        </div>
      </div>
    );
  }

  if (step === 'signing') {
    return (
      <div className="text-center space-y-4 py-12">
        <Loader2 className="mx-auto animate-spin text-vj-green" size={36} />
        <p className="font-semibold text-vj-txt">Registrando assinatura...</p>
        <p className="text-xs text-vj-txt3">Calculando hash SHA-256 · Registrando IP · Carimbando timestamp</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-1">
        {(['consent', 'identity', 'photo'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-1">
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${
              ['consent', 'identity', 'photo'].indexOf(step) >= i
                ? 'bg-vj-green' : 'bg-vj-border'
            }`} />
          </div>
        ))}
      </div>

      {/* ── STEP 1: Consent ─────────────────────────────────────────────── */}
      {step === 'consent' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <Shield className="text-blue-600 flex-none" size={24} />
            <div>
              <p className="font-semibold text-sm text-blue-900">Assinatura Eletrônica Segura</p>
              <p className="text-xs text-blue-700 mt-0.5">
                Conforme MP 2.200-2/2001, sua assinatura eletrônica tem validade jurídica.
                Coletamos: nome, CPF (opcional), endereço IP, user-agent, data/hora e foto (opcional).
              </p>
            </div>
          </div>

          <div className="p-4 bg-vj-bg rounded-xl border border-vj-border">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-vj-green" />
              <p className="font-semibold text-sm">Contrato de Serviços Turísticos</p>
            </div>
            <p className="text-xs text-vj-txt3">
              Pacote: <strong className="text-vj-txt">{tripTitle}</strong><br />
              Reserva: <strong className="text-vj-txt font-mono">{bookingToken.slice(0, 8).toUpperCase()}</strong>
            </p>
          </div>

          <Button className="w-full gap-2" onClick={() => { setStep('identity'); requestGeo(); }}>
            <FileText size={16} /> Li e aceito — Prosseguir para assinar
          </Button>
        </div>
      )}

      {/* ── STEP 2: Identity ────────────────────────────────────────────── */}
      {step === 'identity' && (
        <div className="space-y-4">
          <div>
            <Label>Nome completo *</Label>
            <Input value={form.name} onChange={e => set({ name: e.target.value })} placeholder="Exatamente como no documento" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>CPF (opcional)</Label>
              <Input value={form.cpf} onChange={e => set({ cpf: e.target.value })} placeholder="000.000.000-00" />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input type="email" value={form.email} onChange={e => set({ email: e.target.value })} placeholder="seu@email.com" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep('consent')}>Voltar</Button>
            <Button className="flex-1 gap-2" disabled={!form.name.trim()} onClick={() => setStep('photo')}>
              <Camera size={16} /> Próximo: foto
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Photo ───────────────────────────────────────────────── */}
      {step === 'photo' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <Camera size={16} className="text-amber-600 flex-none" />
            <p className="text-xs text-amber-800">
              <strong>Foto facial opcional</strong> — Aumenta a segurança jurídica do contrato (KYC simples).
            </p>
          </div>

          {!photoDataUrl && !cameraActive && (
            <Button variant="outline" className="w-full gap-2 h-16" onClick={startCamera}>
              <Camera size={18} /> Ativar câmera para selfie
            </Button>
          )}

          {cameraActive && (
            <div className="space-y-2">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-vj-green/30 rounded-xl" />
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-1.5" onClick={stopCamera}>
                  <X size={14} /> Cancelar
                </Button>
                <Button className="flex-1 gap-1.5" onClick={takePhoto}>
                  <Camera size={14} /> Tirar foto
                </Button>
              </div>
            </div>
          )}

          {photoDataUrl && (
            <div className="space-y-2">
              <div className="relative rounded-xl overflow-hidden aspect-video bg-black">
                <img src={photoDataUrl} alt="Foto" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2">
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-white/90" onClick={retakePhoto}>
                    <RotateCcw size={14} />
                  </Button>
                </div>
                <div className="absolute bottom-2 left-2 bg-vj-green/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={10} /> Foto capturada
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep('identity')}>Voltar</Button>
            <Button
              className="flex-1 gap-2 bg-gradient-to-r from-vj-green to-emerald-600 text-white"
              onClick={handleSign}
              disabled={signing}
            >
              {signing ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
              {photoDataUrl ? 'Assinar com foto' : 'Assinar sem foto'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
