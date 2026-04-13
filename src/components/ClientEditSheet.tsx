import { useState, useEffect } from 'react';
import { UserPlus, Save, Globe, Shield, Tag, X, Camera, FileText, Plane } from 'lucide-react';
import { SheetPage } from '@/components/ui/SheetPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { MediaUploader } from '@/components/ui/MediaUploader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateClient, useUpdateClient } from '@/hooks/useClients';
import { supabase } from '@/integrations/supabase/client';

const ORIGIN_OPTIONS = ['Instagram', 'Indicação', 'Google', 'Facebook', 'WhatsApp', 'Site', 'Evento', 'Outro'];

export interface ClientEditSheetProps {
  id?: string | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: (id: string) => void;
}

export function ClientEditSheet({ id, open, onClose, onSuccess }: ClientEditSheetProps) {
  const isUpdate = !!id;
  const createClient = useCreateClient();
  const updateClient = useUpdateClient?.();

  const [form, setForm] = useState<any>({
    name: '', email: '', phone: '', cpf: '', birth_date: '',
    address: '', city: '', state: '', zip_code: '', country: 'Brasil',
    origin: '', notes: '',
    passport_number: '', passport_expiry: '',
    passport_url: '',
    documents: [],
    photo_url: '',
    portal_access_enabled: false,
    preferred_destinations: '',
    preferred_airlines: '',
    seat_preference: '',
    meal_preference: '',
    loyalty_programs: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && isUpdate && id) {
      setLoading(true);
      (supabase.from('clients').select('*').eq('id', id).single() as any)
        .then(({ data }: any) => {
          if (data) {
            const prefs = (data.preferences as any) || {};
            setForm({
              ...data,
              preferred_destinations: prefs.destinations || '',
              preferred_airlines: prefs.airlines || '',
              seat_preference: prefs.seat || '',
              meal_preference: prefs.meal || '',
              loyalty_programs: prefs.loyalty || '',
              passport_number: prefs.passport_number || '',
              passport_expiry: prefs.passport_expiry || '',
              passport_url: prefs.passport_url || '',
              preferences: data.preferences || {},
              documents: data.preferences?.documents || [],
              tags: data.tags || [],
            });
          }
        })
        .finally(() => setLoading(false));
    } else if (open && !isUpdate) {
      setForm({
        name: '', email: '', phone: '', cpf: '', birth_date: '',
        address: '', city: '', state: '', zip_code: '', country: 'Brasil',
        origin: '', notes: '',
        passport_number: '', passport_expiry: '',
        passport_url: '', documents: [], photo_url: '',
        portal_access_enabled: false,
        preferred_destinations: '', preferred_airlines: '',
        seat_preference: '', meal_preference: '', loyalty_programs: '',
        tags: [],
      });
      setTagInput('');
    }
  }, [open, isUpdate, id]);

  const update = (field: string, value: any) => setForm((p: any) => ({ ...p, [field]: value }));

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) update('tags', [...form.tags, t]);
    setTagInput('');
  };

  const removeTag = (tag: string) => update('tags', form.tags.filter((t: string) => t !== tag));

  const handleSave = async () => {
    if (!form.name?.trim()) return;

    const preferences = {
      ...(form.preferred_destinations ? { destinations: form.preferred_destinations } : {}),
      ...(form.preferred_airlines ? { airlines: form.preferred_airlines } : {}),
      ...(form.seat_preference ? { seat: form.seat_preference } : {}),
      ...(form.meal_preference ? { meal: form.meal_preference } : {}),
      ...(form.loyalty_programs ? { loyalty: form.loyalty_programs } : {}),
      ...(form.passport_number ? { passport_number: form.passport_number } : {}),
      ...(form.passport_expiry ? { passport_expiry: form.passport_expiry } : {}),
    };

    const payload = {
      name: form.name.trim(),
      email: form.email || null,
      phone: form.phone || null,
      cpf: form.cpf || null,
      birth_date: form.birth_date || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      zip_code: form.zip_code || null,
      country: form.country || null,
      origin: form.origin || null,
      notes: form.notes || null,
      photo_url: form.photo_url || null,
      passport_url: form.passport_url || null,
      documents: form.documents || [],
      portal_access_enabled: form.portal_access_enabled,
      tags: form.tags,
      preferences: Object.keys(preferences).length > 0 ? preferences : null,
    };

    if (isUpdate && updateClient) {
      const res = await updateClient.mutateAsync({ id: id!, ...payload });
      onSuccess?.(res.id);
    } else {
      const res = await createClient.mutateAsync(payload as any);
      onSuccess?.(res.id);
    }
    onClose();
  };

  const isPending = createClient.isPending || (updateClient?.isPending ?? false);

  return (
    <SheetPage
      open={open}
      onClose={onClose}
      title={isUpdate ? 'Editar Cliente' : 'Novo Cliente'}
      subtitle="CRM da agência — dados completos do viajante"
      icon={UserPlus}
      sections={[
        { id: 'identidade', label: 'Identidade' },
        { id: 'documentos', label: 'Documentos' },
        { id: 'preferencias', label: 'Preferências' },
        { id: 'endereco', label: 'Endereço' },
        { id: 'portal', label: 'Portal & Tags' },
      ]}
      footer={
        <div className="flex w-full justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={() => void handleSave()}
            disabled={loading || !form.name || isPending}
            className="bg-vj-green text-white hover:bg-vj-green/90"
          >
            <Save className="mr-2 h-4 w-4" />
            {isUpdate ? 'Atualizar Cliente' : 'Criar Cliente'}
          </Button>
        </div>
      }
    >
      {(activeSection) => {
        if (loading) return <div className="text-sm text-vj-txt3 animate-pulse py-8 text-center">Carregando dados...</div>;

        return (
          <>
            {activeSection === 'identidade' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="font-semibold text-vj-txt flex items-center gap-2">
                    <Camera className="h-4 w-4 text-vj-green" /> Foto do Cliente
                  </Label>
                  <MediaUploader
                    multiple={false}
                    existingUrls={form.photo_url ? [form.photo_url] : []}
                    onUploadComplete={(urls) => update('photo_url', urls[0])}
                    folder="clients/photos"
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Nome Completo *</Label>
                    <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Ana Carolina Silva" className="border-vj-border bg-vj-bg" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>E-mail</Label>
                      <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="border-vj-border bg-vj-bg" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Telefone / WhatsApp</Label>
                      <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+55 48 9..." className="border-vj-border bg-vj-bg" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>CPF</Label>
                      <Input value={form.cpf} onChange={(e) => update('cpf', e.target.value)} placeholder="000.000.000-00" className="border-vj-border bg-vj-bg" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Data de Nascimento</Label>
                      <Input type="date" value={form.birth_date} onChange={(e) => update('birth_date', e.target.value)} className="border-vj-border bg-vj-bg" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Canal de Aquisição</Label>
                      <Select value={form.origin} onValueChange={(v) => update('origin', v)}>
                        <SelectTrigger className="border-vj-border bg-vj-bg"><SelectValue placeholder="Como chegou?" /></SelectTrigger>
                        <SelectContent>
                          {ORIGIN_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Observações Internas</Label>
                    <Textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={3} placeholder="Notas privadas..." className="border-vj-border bg-vj-bg resize-none" />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'documentos' && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <Label className="font-semibold text-vj-txt flex items-center gap-2">
                    <Globe className="h-4 w-4 text-vj-green" /> Passaporte
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Número</Label>
                      <Input value={form.passport_number} onChange={(e) => update('passport_number', e.target.value)} placeholder="AB123456" className="border-vj-border bg-vj-bg" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Validade</Label>
                      <Input type="date" value={form.passport_expiry} onChange={(e) => update('passport_expiry', e.target.value)} className="border-vj-border bg-vj-bg" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Upload da Foto do Passaporte</Label>
                    <MediaUploader
                      multiple={false}
                      existingUrls={form.passport_url ? [form.passport_url] : []}
                      onUploadComplete={(urls) => update('passport_url', urls[0])}
                      folder="clients/passports"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-vj-border space-y-4">
                  <Label className="font-semibold text-vj-txt flex items-center gap-2">
                    <FileText className="h-4 w-4 text-vj-green" /> Outros Documentos (RG, CNH, Vacinas...)
                  </Label>
                  <MediaUploader
                    multiple
                    existingUrls={form.documents?.map?.((d: any) => d.url || d) || []}
                    onUploadComplete={(urls) => update('documents', urls.map((url) => ({ url, name: url.split('/').pop() })))}
                    folder="clients/documents"
                  />
                </div>
              </div>
            )}

            {activeSection === 'preferencias' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-vj-green/5 border border-vj-green/10 mb-2">
                  <p className="text-xs text-vj-green font-medium">✨ Estas informações alimentam o V-Agent para recomendações personalizadas</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2"><Plane className="h-3.5 w-3.5 text-vj-txt3" /> Destinos Preferidos</Label>
                  <Input value={form.preferred_destinations} onChange={(e) => update('preferred_destinations', e.target.value)} placeholder="Europa, Caribe, Ásia..." className="border-vj-border bg-vj-bg" />
                </div>
                <div className="space-y-1.5">
                  <Label>Companhias Aéreas Preferidas</Label>
                  <Input value={form.preferred_airlines} onChange={(e) => update('preferred_airlines', e.target.value)} placeholder="LATAM, GOL, Emirates..." className="border-vj-border bg-vj-bg" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Assento Preferido</Label>
                    <Select value={form.seat_preference} onValueChange={(v) => update('seat_preference', v)}>
                      <SelectTrigger className="border-vj-border bg-vj-bg"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="window">Janela</SelectItem>
                        <SelectItem value="aisle">Corredor</SelectItem>
                        <SelectItem value="middle">Centro</SelectItem>
                        <SelectItem value="any">Qualquer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Restrição Alimentar</Label>
                    <Input value={form.meal_preference} onChange={(e) => update('meal_preference', e.target.value)} placeholder="Vegetariano, Kosher..." className="border-vj-border bg-vj-bg" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Programas de Fidelidade (Milhas)</Label>
                  <Input value={form.loyalty_programs} onChange={(e) => update('loyalty_programs', e.target.value)} placeholder="LATAM Pass #123, Smiles #456..." className="border-vj-border bg-vj-bg" />
                </div>
              </div>
            )}

            {activeSection === 'endereco' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Logradouro</Label>
                  <Input value={form.address} onChange={(e) => update('address', e.target.value)} className="border-vj-border bg-vj-bg" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Cidade</Label>
                    <Input value={form.city} onChange={(e) => update('city', e.target.value)} className="border-vj-border bg-vj-bg" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Estado</Label>
                    <Input value={form.state} onChange={(e) => update('state', e.target.value)} className="border-vj-border bg-vj-bg" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>CEP</Label>
                    <Input value={form.zip_code} onChange={(e) => update('zip_code', e.target.value)} className="border-vj-border bg-vj-bg" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>País</Label>
                    <Input value={form.country} onChange={(e) => update('country', e.target.value)} className="border-vj-border bg-vj-bg" />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'portal' && (
              <div className="space-y-8">
                <div className="p-5 rounded-2xl bg-vj-green/5 border border-vj-green/10 flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-vj-txt flex items-center gap-2">
                      <Shield className="h-4 w-4 text-vj-green" /> Acesso ao Portal do Cliente
                    </h3>
                    <p className="text-xs text-vj-txt3">Permite que o cliente acesse o portal personalizado da agência via Magic Link.</p>
                  </div>
                  <Switch
                    checked={form.portal_access_enabled}
                    onCheckedChange={(c) => update('portal_access_enabled', c)}
                  />
                </div>

                <div className="space-y-4">
                  <Label className="font-semibold text-vj-txt flex items-center gap-2">
                    <Tag className="h-4 w-4 text-vj-green" /> Tags de Segmentação
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                      placeholder="VIP, Família, Corporativo..."
                      className="flex-1 border-vj-border bg-vj-bg"
                    />
                    <Button type="button" variant="outline" onClick={addTag}>+ Tag</Button>
                  </div>
                  {form.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="gap-1.5 pr-1 text-sm bg-vj-green/10 text-vj-green border border-vj-green/20">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        );
      }}
    </SheetPage>
  );
}
