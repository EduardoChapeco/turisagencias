import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useCreateClient } from '@/hooks/useClients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function ClientNew() {
  const navigate = useNavigate();
  const createClient = useCreateClient();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', cpf: '', birth_date: '',
    address: '', city: '', state: '', zip_code: '', country: 'Brasil',
    origin: '', notes: '',
  });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = Object.fromEntries(
      Object.entries(form).filter(([_, v]) => v !== '')
    );
    const result = await createClient.mutateAsync(cleaned as any);
    if (result) navigate(`/clients/${result.id}`);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/clients')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-heading text-2xl font-bold">Novo Cliente</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Dados Pessoais</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome completo *</Label>
                <Input value={form.name} onChange={(e) => update('name', e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} />
                </div>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Endereço</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input value={form.address} onChange={(e) => update('address', e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input value={form.city} onChange={(e) => update('city', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input value={form.state} onChange={(e) => update('state', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input value={form.zip_code} onChange={(e) => update('zip_code', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Informações Adicionais</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Origem (como conheceu a agência)</Label>
                <Input value={form.origin} onChange={(e) => update('origin', e.target.value)} placeholder="Instagram, indicação, Google..." />
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={3} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/clients')}>Cancelar</Button>
            <Button type="submit" disabled={createClient.isPending}>
              {createClient.isPending ? 'Salvando...' : 'Salvar Cliente'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
