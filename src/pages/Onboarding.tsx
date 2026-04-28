import { useState, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Cloud, ArrowRight, Check, Building2, Palette, Phone, Mail, Upload, Instagram, Globe, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const FOCUS_OPTIONS = [
  { value: 'Lazer', icon: '🏖️' },
  { value: 'Corporativo', icon: '💼' },
  { value: 'Grupos', icon: '🚌' },
  { value: 'Luxo', icon: '✨' },
];

const STEPS = [
  { label: 'Informações Básicas', icon: Building2 },
  { label: 'Identidade Visual', icon: Palette },
  { label: 'Presença Digital', icon: Globe },
  { label: 'Ativação', icon: Cloud },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { organization, setOrganization, setProfile, setRoles, user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: '',
    whatsapp: '',
    email: '',
    phone: '',
    primaryColor: '#00D37B',
    secondaryColor: '#18181B', // zinc-900
    fontStyle: 'moderna',
    focus: 'Lazer',
    instagram_url: '',
    website_url: '',
    google_business_url: '',
  });
  const [loading, setLoading] = useState(false);

  if (organization) {
    return <Navigate to="/" replace />;
  }

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: 'Arquivo muito grande', description: 'A logo deve ter no máximo 2MB.', variant: 'destructive' });
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleComplete = async () => {
    if (!user || loading) return;

    const agencyName = form.name.trim();
    let slug = agencyName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    if (!agencyName || !slug) {
      toast({ title: 'Dados inválidos', description: 'Informe um nome para a agência.', variant: 'destructive' });
      setStep(1);
      return;
    }

    setLoading(true);
    const orgId = crypto.randomUUID();

    // 1. Handle Logo Upload if present
    let finalLogoUrl = null;
    if (logoFile) {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${orgId}/logo-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('org-assets')
        .upload(fileName, logoFile);

      if (uploadError) {
        console.error('Logo upload error:', uploadError);
        toast({ title: 'Erro ao subir logo', description: uploadError.message, variant: 'destructive' });
        // continue anyway, logo can be uploaded later
      } else if (uploadData) {
        const { data: { publicUrl } } = supabase.storage.from('org-assets').getPublicUrl(fileName);
        finalLogoUrl = publicUrl;
      }
    }

    let orgError: any = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidateSlug = attempt === 0 ? slug : `${slug}-${Math.random().toString(36).slice(2, 7)}`;
      const { error } = await supabase.from('organizations').insert({
        id: orgId,
        name: agencyName,
        slug: candidateSlug,
        logo_url: finalLogoUrl,
        whatsapp: form.whatsapp || null,
        email: form.email || null,
        phone: form.phone || null,
        primary_color: form.primaryColor || '#00D37B',
        secondary_color: form.secondaryColor || '#18181B',
        font_style: form.fontStyle,
        instagram_url: form.instagram_url || null,
        website_url: form.website_url || null,
        google_business_url: form.google_business_url || null,
        brand_kit: { focus: form.focus },
      });
      orgError = error;
      if (!error) break;
      if (!error.message?.includes('unique') && !error.message?.includes('duplicate')) break;
    }

    if (orgError) {
      toast({ title: 'Erro ao criar agência', description: orgError.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({ org_id: orgId })
      .eq('user_id', user.id)
      .select('*')
      .maybeSingle();

    if (profileError || !profile) {
      toast({ title: 'Erro ao vincular', description: profileError?.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    await Promise.all([
      supabase.rpc('assign_org_admin_role', { _user_id: user.id }),
      supabase.rpc('ensure_default_kanban_boards', { _org_id: orgId }),
    ]);

    const [{ data: org }, { data: rolesData }] = await Promise.all([
      supabase.from('organizations').select('*').eq('id', orgId).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', user.id),
    ]);

    setOrganization(org ?? null);
    setProfile(profile);
    setRoles((rolesData ?? []).map((item) => item.role));
    
    // 3. Trigger AI Squad if there are URLs provided
    if (form.instagram_url || form.website_url) {
      // Fire and forget (runs in background)
      supabase.functions.invoke('trigger-brand-squad', {
        body: {
          org_id: orgId,
          instagram_url: form.instagram_url,
          website_url: form.website_url,
        }
      }).catch(err => console.error("Falha ao iniciar Squad:", err));
    }

    toast({ title: '🎉 Agência criada!', description: `${agencyName} está pronta para uso.` });
    setLoading(false);
    navigate('/');
  };

  const inputCls =
    'bg-zinc-900 border-zinc-700 h-12 !text-white placeholder:text-zinc-500 focus:border-vj-green focus:ring-vj-green rounded-xl';

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 border-r border-zinc-800 p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-vj-green/10 blur-[120px] rounded-full pointer-events-none -mr-48 -mt-48" />
        
        <div className="z-10">
          <div className="h-12 w-12 bg-vj-green rounded-2xl flex items-center justify-center mb-10">
            <Cloud className="h-6 w-6 text-zinc-950" />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-3">
            O futuro da sua agência começa agora.
          </h1>
          <p className="text-zinc-400 leading-relaxed text-sm">
            Configure seu espaço em menos de 2 minutos e libere o poder da IA na sua operação.
          </p>
        </div>

        {/* Step indicators */}
        <div className="space-y-3 mb-8 z-10">
          {STEPS.map((s, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            const Icon = s.icon;
            return (
              <div
                key={n}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                  active ? 'bg-zinc-800/80 border border-zinc-700' : ''
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                    done
                      ? 'bg-vj-green text-zinc-950'
                      : active
                      ? 'bg-zinc-700 border border-vj-green text-vj-green'
                      : 'bg-zinc-900 border border-zinc-700 text-zinc-600'
                  }`}
                >
                  {done ? <Check size={14} /> : <Icon size={14} />}
                </div>
                <span
                  className={`text-sm font-medium ${
                    active ? 'text-white' : done ? 'text-zinc-300' : 'text-zinc-600'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-zinc-600 z-10">© 2026 Turis · Todos os direitos reservados</p>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md py-12">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="h-9 w-9 bg-vj-green rounded-xl flex items-center justify-center">
              <Cloud className="h-5 w-5 text-zinc-950" />
            </div>
            <span className="font-black text-lg">Turis</span>
          </div>

          {/* Step 1 — Basic info */}
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <div>
                <h2 className="text-2xl font-black mb-1">Como devemos chamar?</h2>
                <p className="text-zinc-400 text-sm">Estes dados serão usados em orçamentos e vouchers.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300 text-sm">Nome da Agência *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      placeholder="Ex: Viagens Premium"
                      className={`${inputCls} pl-10`}
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && form.name && setStep(2)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300 text-sm">E-mail Profissional</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      placeholder="contato@agencia.com"
                      className={`${inputCls} pl-10`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-zinc-300 text-sm">WhatsApp</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input
                        value={form.whatsapp}
                        onChange={(e) => update('whatsapp', e.target.value)}
                        placeholder="(11) 99999-9999"
                        className={`${inputCls} pl-10`}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300 text-sm">Telefone Fixo</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      placeholder="(11) 3333-3333"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              <Button
                className="w-full h-12 premium-button font-bold text-sm gap-2"
                onClick={() =>
                  form.name
                    ? setStep(2)
                    : toast({ title: 'Nome obrigatório', variant: 'destructive' })
                }
              >
                Continuar <ArrowRight size={16} />
              </Button>
            </div>
          )}

          {/* Step 2 — Visual identity */}
          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <div>
                <h2 className="text-2xl font-black mb-1">Identidade Visual</h2>
                <p className="text-zinc-400 text-sm">A cara da sua agência no Portal do Viajante e Orçamentos.</p>
              </div>

              <div className="space-y-6">
                
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label className="text-zinc-300 text-sm">Logotipo (PNG ou SVG)</Label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-700 hover:border-vj-green bg-zinc-900/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/png, image/jpeg, image/svg+xml"
                      onChange={handleLogoUpload}
                    />
                    {logoPreview ? (
                      <div className="relative">
                        <img src={logoPreview} alt="Logo preview" className="max-h-24 max-w-[200px] object-contain rounded-lg" />
                        <div className="absolute -bottom-2 -right-2 bg-zinc-800 rounded-full p-1 border border-zinc-700">
                          <Check size={14} className="text-vj-green" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                          <Upload size={20} className="text-zinc-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-white">Clique para fazer upload</p>
                          <p className="text-xs text-zinc-500 mt-1">Máximo 2MB</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-300 text-sm">Cor Principal</Label>
                    <div className="flex gap-2 items-center">
                      <div className="relative shrink-0">
                        <input
                          type="color"
                          value={form.primaryColor}
                          onChange={(e) => update('primaryColor', e.target.value)}
                          className="w-10 h-10 rounded-xl border border-zinc-700 cursor-pointer bg-transparent p-1"
                        />
                      </div>
                      <Input
                        value={form.primaryColor}
                        onChange={(e) => update('primaryColor', e.target.value)}
                        className={`${inputCls} h-10 font-mono text-xs uppercase`}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-zinc-300 text-sm">Cor Secundária</Label>
                    <div className="flex gap-2 items-center">
                      <div className="relative shrink-0">
                        <input
                          type="color"
                          value={form.secondaryColor}
                          onChange={(e) => update('secondaryColor', e.target.value)}
                          className="w-10 h-10 rounded-xl border border-zinc-700 cursor-pointer bg-transparent p-1"
                        />
                      </div>
                      <Input
                        value={form.secondaryColor}
                        onChange={(e) => update('secondaryColor', e.target.value)}
                        className={`${inputCls} h-10 font-mono text-xs uppercase`}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300 text-sm">Foco Principal</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {FOCUS_OPTIONS.map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => update('focus', f.value)}
                        className={`p-3 rounded-xl border text-sm font-semibold flex items-center gap-2 transition-all ${
                          form.focus === f.value
                            ? 'bg-vj-green/15 border-vj-green text-white'
                            : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                        }`}
                      >
                        <span>{f.icon}</span>
                        {f.value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="w-1/3 h-12 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl"
                  onClick={() => setStep(1)}
                >
                  Voltar
                </Button>
                <Button
                  className="flex-1 h-12 premium-button font-bold text-sm gap-2"
                  onClick={() => setStep(3)}
                >
                  Continuar <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 — Digital Presence */}
          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <div>
                <h2 className="text-2xl font-black mb-1">Presença Digital</h2>
                <p className="text-zinc-400 text-sm">
                  Deixe nossa IA visitar seus perfis para extrair automaticamente o DNA da sua marca e treinar seus agentes de vendas.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300 text-sm">Instagram da Agência</Label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-500" />
                    <Input
                      value={form.instagram_url}
                      onChange={(e) => update('instagram_url', e.target.value)}
                      placeholder="instagram.com/sua_agencia"
                      className={`${inputCls} pl-10`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300 text-sm">Site Principal</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                    <Input
                      value={form.website_url}
                      onChange={(e) => update('website_url', e.target.value)}
                      placeholder="suaagencia.com.br"
                      className={`${inputCls} pl-10`}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-zinc-300 text-sm">Google Meu Negócio</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                    <Input
                      value={form.google_business_url}
                      onChange={(e) => update('google_business_url', e.target.value)}
                      placeholder="Link do Google Maps"
                      className={`${inputCls} pl-10`}
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-400 flex gap-3">
                <Cloud className="w-5 h-5 text-vj-green shrink-0 mt-0.5" />
                <p>
                  No próximo passo, nosso <strong>Esquadrão de IA</strong> vai visitar essas URLs e escanear suas imagens, grid e tom de voz para configurar sua identidade automaticamente.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="w-1/3 h-12 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl"
                  onClick={() => setStep(2)}
                >
                  Voltar
                </Button>
                <Button
                  className="flex-1 h-12 premium-button font-bold text-sm gap-2"
                  onClick={() => setStep(4)}
                >
                  Iniciar IA <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4 — Activation */}
          {step === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300 text-center">
              <div
                className="mx-auto w-24 h-24 rounded-2xl flex items-center justify-center relative"
                style={{ backgroundColor: `${form.primaryColor}20` }}
              >
                <Cloud className="w-10 h-10 animate-pulse" style={{ color: form.primaryColor }} />
                
                {/* Decorative scanning rings */}
                <div className="absolute inset-0 border border-vj-green/30 rounded-2xl animate-ping opacity-75" style={{ animationDuration: '3000ms' }} />
              </div>

              <div>
                <h2 className="text-2xl font-black mb-2">Treinando a OMEGA...</h2>
                <p className="text-zinc-400 text-sm max-w-xs mx-auto">
                  Estamos configurando <span className="text-white font-semibold">{form.name}</span>, criando o banco de dados e preparando os agentes de IA.
                </p>
              </div>

              {/* Fake AI Progress (will be real in phase 2) */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-left space-y-3">
                 <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-vj-green animate-pulse" />
                    <span className="text-zinc-300">Banco de dados provisionado</span>
                 </div>
                 <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-vj-green animate-pulse delay-75" />
                    <span className="text-zinc-300">Políticas de segurança aplicadas</span>
                 </div>
                 {form.instagram_url && (
                   <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-vj-green/50 animate-pulse delay-150" />
                      <span className="text-zinc-400">Agent_Scout visitando o Instagram...</span>
                   </div>
                 )}
              </div>

              <Button
                className="w-full h-12 premium-button font-bold text-base gap-2 mt-4"
                onClick={handleComplete}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Aguarde...
                  </>
                ) : (
                  <>Completar Configuração <Check size={16} /></>
                )}
              </Button>
              
              {!loading && (
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  Voltar e ajustar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

