import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plane, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export default function PublicTravelerForm() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);
  const [form, setForm] = useState({
    full_name: '', cpf: '', birth_date: '', gender: '',
    nationality: 'Brasileira', phone: '', email: '',
  });

  const update = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } else if (!data) {
      setInvalidToken(true);
    } else {
      setSubmitted(true);
    }
  };

  if (invalidToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <AlertCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
            <h2 className="font-heading text-xl font-bold mb-2">Link inválido</h2>
            <p className="text-sm text-muted-foreground">Este formulário não foi encontrado ou já expirou. Entre em contato com sua agência.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <CheckCircle2 className="mx-auto h-16 w-16 text-success mb-4" />
            <h2 className="font-heading text-xl font-bold mb-2">Dados enviados!</h2>
            <p className="text-sm text-muted-foreground">Suas informações foram salvas com sucesso. A agência será notificada.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Plane className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-xl font-bold">Ficha do Viajante</h1>
          <p className="text-sm text-muted-foreground">Preencha seus dados para a viagem</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seus Dados</CardTitle>
              <CardDescription>Todos os campos são importantes para a operação da viagem.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome completo *</Label>
                <Input value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input value={form.cpf} onChange={(e) => update('cpf', e.target.value)} />
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
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nacionalidade</Label>
                  <Input value={form.nationality} onChange={(e) => update('nationality', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading || !form.full_name}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</> : 'Enviar Dados'}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
