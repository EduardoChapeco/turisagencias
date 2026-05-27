import { logger } from '@/utils/logger';

import { useState, useEffect } from 'react';
import { UserPlus, Save, Globe, Shield, Tag, X, Camera, FileText, Plane, MapPin, Plus, Trash2, Star } from 'lucide-react';
import { SheetPage } from '@/components/ui/SheetPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { MediaUploader } from '@/components/ui/MediaUploader';
import { AvatarUploader } from '@/components/ui/AvatarUploader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateClient, useUpdateClient, useClient } from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';

const ORIGIN_OPTIONS = ['Instagram', 'Indicação', 'Google', 'Facebook', 'WhatsApp', 'Site', 'Evento', 'Outro'];
const DOC_TYPES = ['Passaporte', 'RG', 'CNH', 'CPF', 'CRM (Médico)', 'OAB (Advogado)', 'Visto', 'Outro'];
const MEMBER_TIERS = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

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
 const { toast } = useToast();

 const [form, setForm] = useState<any>({
 name: '', email: '', phone: '', cpf: '', birth_date: '',
 address: '', city: '', state: '', zip_code: '', country: 'Brasil',
 origin: '', notes: '',
 photo_url: '',
 cover_url: '',
 gallery_urls: [],
 documents: [],
 proof_of_address_url: '',
 // Passaporte — colunas flat (NÃO preferences JSONB)
 passport_number: '',
 passport_expiry: '',
 passport_url: '',
 // Fidelidade — colunas flat
 is_member: false,
 loyalty_points: 0,
 member_tier: '',
 portal_access_enabled: false,
 preferred_destinations: '',
 preferred_airlines: '',
 seat_preference: '',
 meal_preference: '',
 loyalty_programs: '',
 tags: [] as string[],
 });
 const [tagInput, setTagInput] = useState('');
 const [cepLoading, setCepLoading] = useState(false);
 const [isFormDirty, setIsFormDirty] = useState(false);

 // Unsaved changes guard para a ficha do cliente
 useUnsavedChangesGuard(isFormDirty && open, 'Você possui alterações não salvas na ficha do cliente. Tem certeza que deseja fechar?');

 // Fetch client if editing
 const { data: existingClient, isLoading: isClientLoading } = useClient(isUpdate ? id || undefined : undefined);

 useEffect(() => {
 if (open && isUpdate && existingClient) {
 const prefs = (existingClient.preferences as Record<string, any>) || {};

 // Migrate legacy unstructured documents to structured blocks if needed
 let docs = prefs.documents || [];
 if (docs.length > 0 && typeof docs[0] === 'string') {
 docs = docs.map((url: string) => ({ type: 'Outro', url }));
 }

 setForm({
 ...existingClient,
 // Colunas flat de endereço
 address: (existingClient.address as string) || '',
 city: (existingClient.city as string) || '',
 state: (existingClient.state as string) || '',
 zip_code: (existingClient.zip_code as string) || '',
 country: (existingClient.country as string) || 'Brasil',
 // Passaporte — colunas flat (lê direto, não do JSONB)
 passport_number: (existingClient.passport_number as string) || '',
 passport_expiry: (existingClient.passport_expiry as string) || '',
 passport_url: (existingClient.passport_url as string) || '',
 // Fidelidade — colunas flat
 is_member: (existingClient.is_member as boolean) || false,
 loyalty_points: (existingClient.loyalty_points as number) || 0,
 member_tier: (existingClient.member_tier as string) || '',
 cover_url: (existingClient.cover_url as string) || '',
 // Preferências (JSONB)
 preferred_destinations: prefs.destinations || '',
 preferred_airlines: prefs.airlines || '',
 seat_preference: prefs.seat || '',
 meal_preference: prefs.meal || '',
 loyalty_programs: prefs.loyalty || '',
 proof_of_address_url: prefs.proof_of_address_url || '',
 gallery_urls: prefs.gallery_urls || [],
 documents: docs,
 tags: existingClient.tags || [],
 });
 } else if (open && !isUpdate) {
 setForm({
 name: '', email: '', phone: '', cpf: '', birth_date: '',
 address: '', city: '', state: '', zip_code: '', country: 'Brasil',
 origin: '', notes: '',
 documents: [], photo_url: '', cover_url: '', gallery_urls: [], proof_of_address_url: '',
 passport_number: '', passport_expiry: '', passport_url: '',
 is_member: false, loyalty_points: 0, member_tier: '',
 portal_access_enabled: false,
 preferred_destinations: '', preferred_airlines: '',
 seat_preference: '', meal_preference: '', loyalty_programs: '',
 tags: [],
 });
 setTagInput('');
 }
 setIsFormDirty(false); // Reset dirty flag on form load or reset
 }, [open, isUpdate, existingClient]);

 const update = (field: string, value: any) => {
 setForm((p: any) => ({ ...p, [field]: value }));
 setIsFormDirty(true);
 };

 const addTag = () => {
 const t = tagInput.trim();
 if (t && !form.tags.includes(t)) update('tags', [...form.tags, t]);
 setTagInput('');
 };

 const removeTag = (tag: string) => update('tags', form.tags.filter((t: string) => t !== tag));

 const fetchCep = async (cep: string) => {
 const cleanCep = cep.replace(/\D/g, '');
 if (cleanCep.length !== 8) return;

 setCepLoading(true);
 try {
 const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
 const data = await res.json();
 if (!data.erro) {
 setForm((prev: any) => ({
 ...prev,
 address: `${data.logradouro}${data.bairro ? ` - ${data.bairro}` : ''}`,
 city: data.localidade,
 state: data.uf,
 country: 'Brasil'
 }));
 toast({ title: 'Endereço encontrado!' });
 } else {
 toast({ title: 'CEP não encontrado', variant: 'destructive' });
 }
 } catch(err) {
 logger.error(err);
 } finally {
 setCepLoading(false);
 }
 };

 const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const v = e.target.value;
 update('zip_code', v);
 if (v.replace(/\D/g, '').length === 8) fetchCep(v);
 };

 const addDocumentBlock = () => {
 const newDocs = [...form.documents, { id: crypto.randomUUID(), type: 'Passaporte', number: '', expiry: '', url: '' }];
 update('documents', newDocs);
 };

 const updateDocumentBlock = (index: number, field: string, val: any) => {
 const newDocs = [...form.documents];
 newDocs[index] = { ...newDocs[index], [field]: val };
 update('documents', newDocs);
 };

 const removeDocumentBlock = (index: number) => {
 const newDocs = [...form.documents];
 newDocs.splice(index, 1);
 update('documents', newDocs);
 };

 const handleSave = async () => {
 if (!form.name?.trim()) return;

 const basePreferences = isUpdate && existingClient && typeof existingClient.preferences === 'object'
 ? existingClient.preferences
 : {};

 const preferences = {
 ...basePreferences,
 ...(form.preferred_destinations ? { destinations: form.preferred_destinations } : {}),
 ...(form.preferred_airlines ? { airlines: form.preferred_airlines } : {}),
 ...(form.seat_preference ? { seat: form.seat_preference } : {}),
 ...(form.meal_preference ? { meal: form.meal_preference } : {}),
 ...(form.loyalty_programs ? { loyalty: form.loyalty_programs } : {}),
 ...(form.proof_of_address_url ? { proof_of_address_url: form.proof_of_address_url } : {}),
 ...(form.gallery_urls?.length ? { gallery_urls: form.gallery_urls } : {}),
 ...(form.documents?.length ? { documents: form.documents } : {}),
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
 cover_url: form.cover_url || null,
 // Passaporte — colunas flat (nunca vai para JSONB)
 passport_number: form.passport_number || null,
 passport_expiry: form.passport_expiry || null,
 passport_url: form.passport_url || null,
 // Fidelidade — colunas flat
 is_member: form.is_member || false,
 loyalty_points: form.loyalty_points ? Number(form.loyalty_points) : 0,
 member_tier: form.member_tier || null,
 portal_access_enabled: form.portal_access_enabled,
 tags: form.tags,
 preferences: Object.keys(preferences).length > 0 ? preferences : null,
 };

 if (isUpdate && updateClient) {
 const res = await updateClient.mutateAsync({ id: id!, ...payload });
 setIsFormDirty(false);
 onSuccess?.(res.id);
 } else {
 const res = await createClient.mutateAsync(payload);
 setIsFormDirty(false);
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
 subtitle="CRM Avançado — Ficha completa do viajante"
 icon={UserPlus}
 sections={[
 { id: 'identidade', label: 'Identidade e Fotos' },
 { id: 'documentos', label: 'Documentos e Passaporte' },
 { id: 'preferencias', label: 'Preferências (IA)' },
 { id: 'endereco', label: 'Endereço Completo' },
 { id: 'fidelidade', label: 'Fidelidade & Membro' },
 { id: 'portal', label: 'Acesso & Tags' },
 ]}
 footer={
 <div className="flex w-full justify-end gap-2">
 <Button variant="outline" onClick={onClose}>Cancelar</Button>
 <Button
 onClick={() => void handleSave()}
 disabled={!form.name || isPending}
 className="bg-vj-green text-white hover:bg-vj-green/90"
 >
 <Save className="mr-2 h-4 w-4" />
 {isUpdate ? 'Salvar Cliente' : 'Criar Cliente'}
 </Button>
 </div>
 }
 >
 {(activeSection) => {
 if (isClientLoading && isUpdate) return <div className="text-sm text-vj-txt3 animate-pulse py-8 text-center">Carregando ficha do cliente...</div>;

 return (
 <>
 {activeSection === 'identidade' && (
 <div className="space-y-8">
 <div className="flex gap-6 items-center">
 <AvatarUploader
 url={form.photo_url}
 fallbackName={form.name}
 onUpload={(url) => update('photo_url', url)}
 bucket="client-media"
 />
 <div className="flex-1 space-y-1">
 <Label className="text-base font-semibold">Foto de Perfil Principal</Label>
 <p className="text-xs text-vj-txt3">Clique no avatar para recortar e enviar uma imagem perfeitamente alinhada.</p>
 </div>
 </div>

 <div className="space-y-4 pt-4 border-t border-vj-border">
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
 <Label>WhatsApp / Telefone</Label>
 <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+55..." className="border-vj-border bg-vj-bg" />
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
 <div className="space-y-1.5">
 <Label>Observações Internas (Somente Agentes)</Label>
 <Textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={3} placeholder="Notas confidenciais..." className="border-vj-border bg-vj-bg resize-none" />
 </div>
 </div>

 <div className="space-y-3 pt-6 border-t border-vj-border">
 <div className="space-y-1">
 <Label className="text-base font-semibold flex items-center gap-2 text-vj-txt">
 <Camera className="w-4 h-4 text-vj-green" /> Galeria / Fotos Extras
 </Label>
 <p className="text-xs text-vj-txt3 mb-3">Guarde cópias de fotos com a família, em viagens anteriores, etc.</p>
 </div>
 <MediaUploader
 multiple={true}
 existingUrls={form.gallery_urls || []}
 onUploadComplete={(urls) => update('gallery_urls', [...urls])}
 bucket="client-media"
 folder="clients/gallery"
 aspectRatio={4 / 3}
 ownerType="client"
 ownerId={id ?? null}
 fieldName="preferences.gallery_urls"
 />
 </div>
 </div>
 )}

 {activeSection === 'documentos' && (
 <div className="space-y-6">
 {/* Passaporte — colunas flat dedicadas */}
 <div className="p-4 rounded-vj-lg bg-vj-blue-bg border border-vj-blue/30 space-y-4">
 <Label className="text-base font-semibold text-vj-txt flex items-center gap-2">
 <Plane className="h-4 w-4 text-vj-blue" /> Passaporte Principal
 </Label>
 <p className="text-xs text-vj-txt2">Campos indexáveis — armazenados em colunas dedicadas para busca e alerta de vencimento.</p>
 <div className="grid sm:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <Label>Número do Passaporte</Label>
 <Input value={form.passport_number} onChange={(e) => update('passport_number', e.target.value)} placeholder="Ex: AB123456" className="border-vj-border bg-vj-bg" />
 </div>
 <div className="space-y-1.5">
 <Label>Validade</Label>
 <Input type="date" value={form.passport_expiry} onChange={(e) => update('passport_expiry', e.target.value)} className="border-vj-border bg-vj-bg" />
 </div>
 </div>
 <div className="space-y-2">
 <Label className="text-xs text-vj-txt3">Scan do Passaporte (.pdf, .jpg)</Label>
 <MediaUploader
 multiple={false}
 accept="image/*,application/pdf"
 existingUrls={form.passport_url ? [form.passport_url] : []}
 onUploadComplete={(urls) => update('passport_url', urls[0])}
 bucket="client-media"
 folder="clients/passports"
 ownerType="client"
 ownerId={id ?? null}
 fieldName="passport_url"
 />
 </div>
 </div>

 {/* Outros documentos (estruturado em JSONB) */}
 <div className="flex items-center justify-between pb-2 border-b border-vj-border">
 <Label className="text-base font-semibold text-vj-txt flex items-center gap-2">
 <FileText className="h-5 w-5 text-vj-green" /> Outros Documentos
 </Label>
 <Button onClick={addDocumentBlock} size="sm" variant="outline" className="text-vj-green focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
 <Plus className="w-4 h-4 mr-1" /> Adicionar Mídia/Documento
 </Button>
 </div>
 
 {form.documents?.length === 0 && (
 <div className="text-center py-8 text-vj-txt3 text-sm bg-vj-surface rounded-vj-lg border border-dashed border-vj-border">
 Nenhum documento adicional. Adicione RGs, vistos ou registros profissionais.
 </div>
 )}
 
 <div className="space-y-6">
 {form.documents?.map((doc: any, index: number) => (
 <div key={doc.id || index} className="p-4 rounded-vj-lg border border-vj-border bg-vj-surface relative space-y-4">
 <Button
 variant="ghost"
 size="icon"
 onClick={() => removeDocumentBlock(index)}
 className="absolute right-3 top-3 h-8 w-8 text-vj-txt3 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-ring"
 title="Remover documento"
 >
 <Trash2 className="w-4 h-4" />
 </Button>

 <div className="grid sm:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <Label>Tipo de Documento</Label>
 <Select value={doc.type} onValueChange={(v) => updateDocumentBlock(index, 'type', v)}>
 <SelectTrigger className="border-vj-border bg-vj-bg"><SelectValue placeholder="Tipo" /></SelectTrigger>
 <SelectContent>
 {DOC_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-1.5">
 <Label>Numeração / Identificador</Label>
 <Input value={doc.number || ''} onChange={e => updateDocumentBlock(index, 'number', e.target.value)} placeholder="Ex: AB123456" className="border-vj-border bg-vj-bg" />
 </div>
 <div className="space-y-1.5">
 <Label>Validade (Opcional)</Label>
 <Input type="date" value={doc.expiry || ''} onChange={e => updateDocumentBlock(index, 'expiry', e.target.value)} className="border-vj-border bg-vj-bg" />
 </div>
 </div>

 <div className="space-y-2 pt-2 border-t border-vj-border/50">
 <Label className="text-xs text-vj-txt3">Anexo Oficial (.pdf, .jpg)</Label>
 <MediaUploader
 multiple={false}
 accept="image/*,application/pdf"
 existingUrls={doc.url ? [doc.url] : []}
 onUploadComplete={(urls) => updateDocumentBlock(index, 'url', urls[0])}
 bucket="client-media"
 folder="clients/documents"
 ownerType="client"
 ownerId={id ?? null}
 fieldName={`preferences.documents.${index}.url`}
 />
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {activeSection === 'preferencias' && (
 <div className="space-y-5">
 <div className="p-4 rounded-vj-lg bg-vj-green/5 border border-vj-green/10 mb-2">
 <p className="text-xs text-vj-green font-medium">✨ Estas informações alimentam o V-Agent IA para gerar recomendações sob medida.</p>
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
 <SelectTrigger className="border-vj-border bg-vj-bg"><SelectValue placeholder="Nenhum" /></SelectTrigger>
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
 <div className="space-y-6">
 <div className="grid grid-cols-[1fr_2fr] gap-3">
 <div className="space-y-1.5">
 <Label className="flex items-center gap-2">CEP <span className="text-[10px] bg-vj-green/10 text-vj-green px-1.5 rounded">ViaCEP</span></Label>
 <Input disabled={cepLoading} value={form.zip_code} onChange={handleCepChange} placeholder="00000-000" className="border-vj-border bg-vj-bg" />
 </div>
 <div className="space-y-1.5">
 <Label>Logradouro / Rua</Label>
 <Input value={form.address} onChange={(e) => update('address', e.target.value)} className="border-vj-border bg-vj-bg" />
 </div>
 </div>
 <div className="grid grid-cols-3 gap-3">
 <div className="space-y-1.5 col-span-2">
 <Label>Cidade</Label>
 <Input value={form.city} onChange={(e) => update('city', e.target.value)} className="border-vj-border bg-vj-bg" />
 </div>
 <div className="space-y-1.5">
 <Label>Estado</Label>
 <Input value={form.state} onChange={(e) => update('state', e.target.value)} placeholder="UF" className="border-vj-border bg-vj-bg" />
 </div>
 </div>
 <div className="space-y-1.5">
 <Label>País</Label>
 <Input value={form.country} onChange={(e) => update('country', e.target.value)} className="border-vj-border bg-vj-bg" />
 </div>

 <div className="pt-4 border-t border-vj-border space-y-3">
 <Label className="text-base font-semibold text-vj-txt flex items-center gap-2">
 <MapPin className="w-4 h-4 text-vj-green" /> Comprovante de Residência
 </Label>
 <p className="text-xs text-vj-txt3">Luz, Água, Internet. Pode subir PDF ou Imagem.</p>
 <MediaUploader
 multiple={false}
 accept="image/*,application/pdf"
 existingUrls={form.proof_of_address_url ? [form.proof_of_address_url] : []}
 onUploadComplete={(urls) => update('proof_of_address_url', urls[0])}
 bucket="client-media"
 folder="clients/documents"
 ownerType="client"
 ownerId={id ?? null}
 fieldName="preferences.proof_of_address_url"
 />
 </div>
 </div>
 )}

 {activeSection === 'fidelidade' && (
 <div className="space-y-6">
 <div className="p-5 rounded-vj-lg bg-vj-orange-bg border border-vj-orange/30 flex items-center justify-between">
 <div className="space-y-1">
 <h3 className="font-bold text-vj-txt flex items-center gap-2">
 <Star className="h-4 w-4 text-vj-orange" /> Membro do Clube
 </h3>
 <p className="text-xs text-vj-txt2">Cliente faz parte do programa de fidelidade da agência.</p>
 </div>
 <Switch
 checked={form.is_member}
 onCheckedChange={(c) => update('is_member', c)}
 />
 </div>

 {form.is_member && (
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <Label>Tier / Nível</Label>
 <Select value={form.member_tier || ''} onValueChange={(v) => update('member_tier', v)}>
 <SelectTrigger className="border-vj-border bg-vj-bg"><SelectValue placeholder="Selecione o nível" /></SelectTrigger>
 <SelectContent>
 {MEMBER_TIERS.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-1.5">
 <Label>Pontos Acumulados</Label>
 <Input
 type="number"
 min="0"
 value={form.loyalty_points}
 onChange={(e) => update('loyalty_points', e.target.value)}
 placeholder="0"
 className="border-vj-border bg-vj-bg"
 />
 </div>
 </div>
 )}
 </div>
 )}

 {activeSection === 'portal' && (
 <div className="space-y-8">
 <div className="p-5 rounded-vj-lg bg-vj-green/5 border border-vj-green/10 flex items-center justify-between">
 <div className="space-y-1">
 <h3 className="font-bold text-vj-txt flex items-center gap-2">
 <Shield className="h-4 w-4 text-vj-green" /> Acesso ao Portal do Cliente
 </h3>
 <p className="text-xs text-vj-txt3">Permite que o cliente acesse roteiros na versão Magic Link do Viaja. Se o link estourar os limites da agência, desative preventivamente.</p>
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
 <button 
 type="button" 
 onClick={() => removeTag(tag)} 
 className="hover:text-red-500 transition-colors focus-visible:ring-1 focus-visible:ring-ring rounded"
 aria-label={`Remover tag ${tag}`}
 >
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
