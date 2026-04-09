import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, Plane } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PublicTravelerForm() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    cpf: '',
    birth_date: '',
    gender: '',
    nationality: 'Brasileira',
    phone: '',
    email: '',
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  if (invalidToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-destructive" />
            <h2 className="font-heading text-xl font-bold">Link inválido</h2>
            <p className="text-sm text-muted-foreground">Este formulário não foi encontrado ou já expirou.</p>
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
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-success" />
            <h2 className="font-heading text-xl font-bold">Dados enviados!</h2>
            <p className="text-sm text-muted-foreground">Suas informações foram salvas com sucesso.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-8">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Plane className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-xl font-bold">Ficha do viajante</h1>
          <p className="text-sm text-muted-foreground">Preencha seus dados para a viagem.</p>
        </div>

        <form
          onSubmit={async (event) => {
            event.preventDefault();
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
          }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seus dados</CardTitle>
              <CardDescription>Todos os campos ajudam a agência a preparar a viagem.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome completo</Label>
                <Input value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input value={form.cpf} onChange={(e) => update('cpf', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Data de nascimento</Label>
                  <Input type="date" value={form.birth_date} onChange={(e) => update('birth_date', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gênero</Label>
                  <Select value={form.gender} onValueChange={(value) => update('gender', value)}>
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
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</> : 'Enviar dados'}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
