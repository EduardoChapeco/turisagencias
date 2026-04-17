import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useCreateClient } from '@/hooks/useClients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, UserPlus, Tag, Globe, Shield, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ClientFormValues } from '@/types';

const ORIGIN_OPTIONS = ['Instagram', 'Indicação', 'Google', 'Facebook', 'WhatsApp', 'Site', 'Evento', 'Outro'];

export default function ClientNew() {
  const navigate = useNavigate();
  const createClient = useCreateClient();
  
  const [form, setForm] = useState({
    name: '', email: '', phone: '', cpf: '', birth_date: '',
    address: '', city: '', state: '', zip_code: '', country: 'Brasil',
    origin: '', notes: '',
    // PRD fields
    passport_number: '', passport_expiry: '',
    portal_access: false,
    preferred_destinations: '',
    preferred_airlines: '',
    seat_preference: '',
    meal_preference: '',
    loyalty_programs: '',
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const update = (field: string, value: any) => setForm((p) => ({ ...p, [field]: value }));

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ClientFormValues = {
      name: form.name.trim(),
      ...(form.email ? { email: form.email.trim() } : {}),
      ...(form.phone ? { phone: form.phone.trim() } : {}),
      ...(form.cpf ? { cpf: form.cpf.trim() } : {}),
      ...(form.birth_date ? { birth_date: form.birth_date } : {}),
      ...(form.address ? { address: form.address.trim() } : {}),
      ...(form.city ? { city: form.city.trim() } : {}),
      ...(form.state ? { state: form.state.trim() } : {}),
      ...(form.zip_code ? { zip_code: form.zip_code.trim() } : {}),
      ...(form.country ? { country: form.country.trim() } : {}),
      ...(form.origin ? { origin: form.origin.trim() } : {}),
      ...(form.notes ? { notes: form.notes.trim() } : {}),
      ...(form.passport_number ? { passport_number: form.passport_number.trim() } : {}),
      ...(form.passport_expiry ? { passport_expiry: form.passport_expiry } : {}),
      portal_access_enabled: form.portal_access,
      ...(tags.length ? { tags } : {}),
      // preferences as JSON object
      preferences: {
        ...(form.preferred_destinations ? { destinations: form.preferred_destinations } : {}),
        ...(form.preferred_airlines ? { airlines: form.preferred_airlines } : {}),
        ...(form.seat_preference ? { seat: form.seat_preference } : {}),
        ...(form.meal_preference ? { meal: form.meal_preference } : {}),
        ...(form.loyalty_programs ? { loyalty: form.loyalty_programs } : {}),
      },
    };

    const result = await createClient.mutateAsync(payload);
    if (result) navigate(`/clients/${result.id}`);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-xl" onClick={() => navigate('/clients')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-heading text-3xl font-bold text-vj-green flex items-center gap-3">
              <UserPlus className="h-8 w-8 text-accent" />
              Novo Cliente
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Cadastro completo no CRM da agência</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Dados Pessoais */}
          <Card className="border-vj-border ">
            <CardHeader className="bg-vj-bg border-b border-vj-border">
              <CardTitle>Identidade do Cliente</CardTitle>
              <CardDescription>Dados obrigatórios para o cadastro no CRM e emissão de bilhetes.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 p-6">
              <div className="space-y-2 sm:col-span-2">
                <Label className="font-semibold">Nome completo *</Label>
                <Input value={form.name} onChange={(e) => update('name', e.target.value)} required placeholder="Ex: Ana Carolina Silva" />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="cliente@email.com" />
              </div>
              <div className="space-y-2">
                <Label>Telefone / WhatsApp</Label>
                <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+55 (48) 9 9999-9999" />
              </div>
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input value={form.cpf} onChange={(e) => update('cpf', e.target.value)} placeholder="000.000.000-00" />
              </div>
              <div className="space-y-2">
                <Label>Data de Nascimento</Label>
                <Input type="date" value={form.birth_date} onChange={(e) => update('birth_date', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Passaporte */}
          <Card className="border-vj-border ">
            <CardHeader className="bg-vj-bg border-b border-vj-border">
              <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-accent" /> Documentos de Viagem</CardTitle>
              <CardDescription>Passaporte e documentos para emissão de voos internacionais.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 p-6">
              <div className="space-y-2">
                <Label>Número do Passaporte</Label>
                <Input value={form.passport_number} onChange={(e) => update('passport_number', e.target.value)} placeholder="AB123456" />
              </div>
              <div className="space-y-2">
                <Label>Validade do Passaporte</Label>
                <Input type="date" value={form.passport_expiry} onChange={(e) => update('passport_expiry', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="border-vj-border ">
            <CardHeader className="bg-vj-bg border-b border-vj-border">
              <CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5 text-accent" /> Tags de Segmentação</CardTitle>
              <CardDescription>Categorize o cliente para filtros automáticos e campanhas de marketing.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  placeholder="Ex: VIP, Família, Corporativo..."
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addTag}>Adicionar</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1.5 pr-1 text-sm">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preferências de Viagem */}
          <Card className="border-vj-border ">
            <CardHeader className="bg-vj-bg border-b border-vj-border">
              <CardTitle>Perfil de Preferências de Viagem</CardTitle>
              <CardDescription>Alimenta o V-Agent com contexto para recomendações personalizadas.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 p-6">
              <div className="space-y-2">
                <Label>Destinos Preferidos</Label>
                <Input value={form.preferred_destinations} onChange={(e) => update('preferred_destinations', e.target.value)} placeholder="Europa, Caribe, Ásia..." />
              </div>
              <div className="space-y-2">
                <Label>Companhias Preferidas</Label>
                <Input value={form.preferred_airlines} onChange={(e) => update('preferred_airlines', e.target.value)} placeholder="LATAM, GOL, Emirates..." />
              </div>
              <div className="space-y-2">
                <Label>Preferência de Assento</Label>
                <Select value={form.seat_preference} onValueChange={(v) => update('seat_preference', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="window">Janela</SelectItem>
                    <SelectItem value="aisle">Corredor</SelectItem>
                    <SelectItem value="middle">Centro</SelectItem>
                    <SelectItem value="any">Qualquer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Restrição Alimentar</Label>
                <Input value={form.meal_preference} onChange={(e) => update('meal_preference', e.target.value)} placeholder="Vegetariano, Kosher, Sem Glúten..." />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Programas de Fidelidade (Milhas)</Label>
                <Input value={form.loyalty_programs} onChange={(e) => update('loyalty_programs', e.target.value)} placeholder="LATAM Pass #123456, Smiles #789..." />
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card className="border-vj-border ">
            <CardHeader className="bg-vj-bg border-b border-vj-border">
              <CardTitle>Endereço</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3 p-6">
              <div className="space-y-2 sm:col-span-3">
                <Label>Logradouro</Label>
                <Input value={form.address} onChange={(e) => update('address', e.target.value)} />
              </div>
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
            </CardContent>
          </Card>

          {/* Origem e Notas */}
          <Card className="border-vj-border ">
            <CardHeader className="bg-vj-bg border-b border-vj-border">
              <CardTitle>Origem e Observações</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 p-6">
              <div className="space-y-2">
                <Label>Canal de Aquisição</Label>
                <Select value={form.origin} onValueChange={(v) => update('origin', v)}>
                  <SelectTrigger><SelectValue placeholder="Como conheceu a agência?" /></SelectTrigger>
                  <SelectContent>
                    {ORIGIN_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Observações Internas</Label>
                <Textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={3} placeholder="Notas privadas visíveis apenas para a equipe..." />
              </div>
            </CardContent>
          </Card>

          {/* Portal Access */}
          <Card className="border-vj-border ">
            <CardHeader className="bg-vj-bg border-b border-vj-border">
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-vj-green" /> Acesso ao Portal do Cliente</CardTitle>
              <CardDescription>Se ativo, o cliente poderá acessar o Portal personalizado da agência via Magic Link.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between p-4 border border-vj-border rounded-xl bg-vj-green/10">
                <div>
                  <p className="font-semibold text-sm">Habilitar Acesso ao Portal</p>
                  <p className="text-xs text-muted-foreground mt-0.5">O cliente receberá link de acesso ao app de viagens personalizado.</p>
                </div>
                <Switch checked={form.portal_access} onCheckedChange={(c) => update('portal_access', c)} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate('/clients')}>Cancelar</Button>
            <Button type="submit" disabled={createClient.isPending} size="lg" className="px-8">
              {createClient.isPending ? 'Salvando...' : 'Criar Cliente no CRM'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
