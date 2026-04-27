import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Cloud } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { organization, setOrganization, setProfile, setRoles, user } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    whatsapp: '',
    email: '',
    phone: '',
    primaryColor: '#00D37B',
    focus: 'Lazer'
  });
  const [loading, setLoading] = useState(false);

  if (organization) {
    return <Navigate to="/" replace />;
  }

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleComplete = async () => {
    if (!user || loading) return;

    const agencyName = form.name.trim();
    const slug = agencyName
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

    const { error: orgError } = await supabase.from('organizations').insert({
      id: orgId,
      name: agencyName,
      slug,
      whatsapp: form.whatsapp || null,
      email: form.email || null,
      phone: form.phone || null,
    });

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

    toast({ title: 'Agência criada!', description: `${agencyName} configurada com sucesso.` });
    setLoading(false);
    navigate('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 text-white overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-vj-green/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Left Side: Brand presentation */}
        <div className="hidden md:flex flex-col justify-center pr-8 border-r border-zinc-800">
          <div className="h-16 w-16 bg-vj-green rounded-2xl flex items-center justify-center mb-8">
            <Cloud className="h-8 w-8 text-zinc-950" />
          </div>
          <h1 className="text-4xl font-black mb-4 tracking-tight">O futuro da sua agência começa agora.</h1>
          <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
            Configure seu espaço de trabalho em menos de 2 minutos e libere o poder da IA na sua operação.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm font-medium text-zinc-300">
               <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-vj-green">1</div>
               Detalhes Básicos
            </div>
            <div className={`flex items-center gap-3 text-sm font-medium ${step >= 2 ? 'text-zinc-300' : 'text-zinc-600'}`}>
               <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold ${step >= 2 ? 'bg-zinc-900 border-zinc-800 text-vj-green' : 'border-zinc-800 text-zinc-600'}`}>2</div>
               Personalização Visual
            </div>
            <div className={`flex items-center gap-3 text-sm font-medium ${step >= 3 ? 'text-zinc-300' : 'text-zinc-600'}`}>
               <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold ${step >= 3 ? 'bg-zinc-900 border-zinc-800 text-vj-green' : 'border-zinc-800 text-zinc-600'}`}>3</div>
               Ativação do Motor
            </div>
          </div>
        </div>

        {/* Right Side: The Wizard Form */}
        <div className="flex flex-col justify-center">
          <Card className="bg-zinc-900 border-zinc-800 text-white ">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">
                {step === 1 && 'Como devemos chamar?'}
                {step === 2 && 'Personalize sua marca'}
                {step === 3 && 'Tudo pronto!'}
              </CardTitle>
              <CardDescription className="text-zinc-400">
                {step === 1 && 'Estes dados serão usados em orçamentos e vouchers.'}
                {step === 2 && 'Defina as cores do seu portal de viajante.'}
                {step === 3 && 'Estamos preparando sua infraestrutura dedicada.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 1 && (
                <div className="space-y-5 animate-in slide-in-from-right-4 fade-in">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Nome da Agência *</Label>
                    <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Ex: Excelência Tour" className="bg-zinc-950 border-zinc-800 h-12" autoFocus />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">E-mail Profissional</Label>
                    <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="contato@agencia.com" className="bg-zinc-950 border-zinc-800 h-12" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-zinc-300">WhatsApp</Label>
                      <Input value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} placeholder="(11) 99999-9999" className="bg-zinc-950 border-zinc-800 h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Fixo (Opcional)</Label>
                      <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="(11) 3333-3333" className="bg-zinc-950 border-zinc-800 h-12" />
                    </div>
                  </div>
                  <Button className="w-full premium-button h-12 mt-4" onClick={() => form.name ? setStep(2) : toast({title: 'Nome obrigatório'})}>
                    Continuar <Cloud className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5 animate-in slide-in-from-right-4 fade-in">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Cor Principal</Label>
                    <div className="flex gap-4 items-center">
                       <Input type="color" value={form.primaryColor} onChange={(e) => update('primaryColor', e.target.value)} className="w-16 h-12 p-1 bg-zinc-950 border-zinc-800 cursor-pointer" />
                       <Input value={form.primaryColor} onChange={(e) => update('primaryColor', e.target.value)} className="bg-zinc-950 border-zinc-800 h-12 font-mono uppercase" />
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label className="text-zinc-300">Foco Principal</Label>
                    <div className="grid grid-cols-2 gap-3">
                       {['Lazer', 'Corporativo', 'Grupos', 'Luxo'].map(f => (
                         <div key={f} onClick={() => update('focus', f)} className={`p-4 rounded-xl border text-center cursor-pointer font-bold text-sm transition-all ${form.focus === f ? 'bg-vj-green/10 border-vj-green text-vj-green' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600'}`}>
                           {f}
                         </div>
                       ))}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" className="w-1/3 h-12 bg-zinc-950 border-zinc-800 text-zinc-300" onClick={() => setStep(1)}>Voltar</Button>
                    <Button className="w-2/3 premium-button h-12" onClick={() => setStep(3)}>Finalizar <Cloud className="w-4 h-4 ml-2" /></Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="text-center space-y-6 animate-in slide-in-from-right-4 fade-in py-8">
                   <div className="mx-auto w-20 h-20 bg-vj-green/20 rounded-full flex items-center justify-center animate-pulse">
                     <Cloud className="w-10 h-10 text-vj-green" />
                   </div>
                   <h3 className="text-xl font-bold">Criando ambiente isolado...</h3>
                   <p className="text-zinc-400 text-sm max-w-xs mx-auto">
                     A IA está configurando seu banco de dados e preparando os painéis Kanban.
                   </p>
                   <Button className="w-full premium-button h-12" onClick={handleComplete} disabled={loading}>
                     {loading ? 'Inicializando Turis AI...' : 'Acessar meu Painel'}
                   </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

