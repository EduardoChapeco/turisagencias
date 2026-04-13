import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, Plane, Globe, FileText, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

export default function PublicTravelerForm() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    // Step 1: Identificação
    full_name: '',
    cpf: '',
    birth_date: '',
    gender: '',
    nationality: 'Brasileira',
    // Step 2: Passaporte
    passport_number: '',
    passport_expiry: '',
    rg: '',
    // Step 3: Contato
    phone: '',
    email: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    // Step 4: Preferências
    seat_preference: '',
    meal_preference: '',
    special_needs: '',
    loyalty_programs: '',
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const STEP_TITLES = [
    'Identificação Pessoal',
    'Documentos de Viagem',
    'Contatos e Emergência',
    'Preferências de Bordo',
  ];

  if (invalidToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-zinc-950 dark:to-blue-950/20 px-4">
        <Card className="w-full max-w-md text-center shadow-xl rounded-3xl border-vj-border">
          <CardContent className="py-12">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="font-heading text-xl font-bold">Link Inválido ou Expirado</h2>
            <p className="text-sm text-muted-foreground mt-2">Este formulário não foi encontrado. Solicite um novo link à sua agência de viagens.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-green-50 dark:from-zinc-950 dark:to-green-950/20 px-4">
        <Card className="w-full max-w-md text-center shadow-xl rounded-3xl border-vj-border">
          <CardContent className="py-12 space-y-4">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="font-heading text-2xl font-bold">Dados Recebidos!</h2>
            <p className="text-muted-foreground">Suas informações foram enviadas com segurança à agência. Você receberá uma confirmação por e-mail.</p>
            <p className="text-xs text-muted-foreground pt-4">Pode fechar esta janela.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!token || !form.full_name) return;
    setLoading(true);

    const { data, error } = await supabase.rpc('submit_traveler_form', {
      _token: token,
      _full_name: form.full_name,
      _cpf: form.cpf || null,
      _birth_date: form.birth_date || null,
      _gender: form.gender || null,
      _nationality: form.nationality || null,
      _phone: form.phone || null,
      _email: form.email || null,
    });

    setLoading(false);

    if (error) {
      toast({ title: 'Erro ao enviar', description: error.message, variant: 'destructive' });
      return;
    }

    if (!data) {
      setInvalidToken(true);
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-zinc-950 dark:via-blue-950/10 dark:to-zinc-950 py-8 px-4">
      <div className="mx-auto max-w-lg space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-vj-green rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
            <Plane className="h-8 w-8 text-vj-green-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-bold">Ficha do Viajante</h1>
          <p className="text-sm text-muted-foreground">Preencha com atenção. Todos os dados são usados para emissão de bilhetes e documentação de viagem.</p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground font-medium">
            <span>Etapa {step} de {totalSteps}: {STEP_TITLES[step - 1]}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Identificação */}
        {step === 1 && (
          <Card className="shadow-lg rounded-2xl border-vj-border">
            <CardHeader className="border-b border-vj-border">
              <CardTitle className="flex items-center gap-2 text-base"><FileText className="h-5 w-5 text-vj-green" /> Identificação Pessoal</CardTitle>
              <CardDescription>Nome exatamente como no documento de viagem.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label className="font-semibold">Nome Completo *</Label>
                <Input value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required placeholder="Como está no passaporte/RG" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input value={form.cpf} onChange={(e) => update('cpf', e.target.value)} placeholder="000.000.000-00" />
                </div>
                <div className="space-y-2">
                  <Label>Data de Nascimento</Label>
                  <Input type="date" value={form.birth_date} onChange={(e) => update('birth_date', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gênero</Label>
                  <Select value={form.gender} onValueChange={(v) => update('gender', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                      <SelectItem value="nao_informar">Prefiro não informar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nacionalidade</Label>
                  <Input value={form.nationality} onChange={(e) => update('nationality', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Documentos */}
        {step === 2 && (
          <Card className="shadow-lg rounded-2xl border-vj-border">
            <CardHeader className="border-b border-vj-border">
              <CardTitle className="flex items-center gap-2 text-base"><Globe className="h-5 w-5 text-vj-green" /> Documentos de Viagem</CardTitle>
              <CardDescription>Necessário para voos internacionais e vistos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>RG</Label>
                  <Input value={form.rg} onChange={(e) => update('rg', e.target.value)} placeholder="00.000.000-0" />
                </div>
                <div className="space-y-2">
                  <Label>Número do Passaporte</Label>
                  <Input value={form.passport_number} onChange={(e) => update('passport_number', e.target.value)} placeholder="AB123456" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Validade do Passaporte</Label>
                <Input type="date" value={form.passport_expiry} onChange={(e) => update('passport_expiry', e.target.value)} />
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 rounded-xl text-xs text-amber-700 dark:text-amber-300">
                ⚠️ Passaporte deve ter no mínimo 6 meses de validade além do retorno da viagem.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Contato e Emergência */}
        {step === 3 && (
          <Card className="shadow-lg rounded-2xl border-vj-border">
            <CardHeader className="border-b border-vj-border">
              <CardTitle className="flex items-center gap-2 text-base"><Phone className="h-5 w-5 text-vj-green" /> Contato e Emergência</CardTitle>
              <CardDescription>Obrigatório para comunicação durante a viagem.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefone / WhatsApp *</Label>
                  <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+55 (48) 9 ..." required />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="seu@email.com" />
                </div>
              </div>
              <div className="pt-2 border-t border-vj-border">
                <p className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Contato de Emergência</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Contato</Label>
                    <Input value={form.emergency_contact_name} onChange={(e) => update('emergency_contact_name', e.target.value)} placeholder="Nome do familiar" />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone de Emergência</Label>
                    <Input value={form.emergency_contact_phone} onChange={(e) => update('emergency_contact_phone', e.target.value)} placeholder="+55 (48) 9 ..." />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Preferências */}
        {step === 4 && (
          <Card className="shadow-lg rounded-2xl border-vj-border">
            <CardHeader className="border-b border-vj-border">
              <CardTitle className="flex items-center gap-2 text-base"><Plane className="h-5 w-5 text-vj-green" /> Preferências de Bordo</CardTitle>
              <CardDescription>Personalize sua experiência durante o voo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preferência de Assento</Label>
                  <Select value={form.seat_preference} onValueChange={(v) => update('seat_preference', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="window">Janela</SelectItem>
                      <SelectItem value="aisle">Corredor</SelectItem>
                      <SelectItem value="any">Sem preferência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Restrição Alimentar</Label>
                  <Input value={form.meal_preference} onChange={(e) => update('meal_preference', e.target.value)} placeholder="Vegetariano, Sem Glúten..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Programas de Fidelidade / Milhas</Label>
                <Input value={form.loyalty_programs} onChange={(e) => update('loyalty_programs', e.target.value)} placeholder="LATAM Pass #123, Smiles #456..." />
              </div>
              <div className="space-y-2">
                <Label>Necessidades Especiais / Mobilidade Reduzida</Label>
                <Textarea value={form.special_needs} onChange={(e) => update('special_needs', e.target.value)} placeholder="Ex: Cadeira de rodas, alergia grave a amendoim..." rows={2} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1">
              ← Anterior
            </Button>
          )}
          {step < totalSteps ? (
            <Button type="button" onClick={() => setStep(s => s + 1)} className="flex-1" disabled={step === 1 && !form.full_name}>
              Próxima Etapa →
            </Button>
          ) : (
            <Button
              type="button"
              className="flex-1"
              disabled={loading || !form.full_name}
              onClick={handleSubmit}
            >
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</> : '✓ Enviar Ficha Completa'}
            </Button>
          )}
        </div>
        
        <p className="text-center text-xs text-muted-foreground">Seus dados são armazenados com segurança e usados exclusivamente pela agência para sua viagem.</p>
      </div>
    </div>
  );
}
