import { useState, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Cloud, ArrowRight, Check, Building2, Palette, Phone, Mail, Upload, Camera, Globe, MapPin, Laptop, Layout } from 'lucide-react';
import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BrandSquadLive } from '@/components/onboarding/BrandSquadLive';
import VisualBuilder from '@/components/builder/VisualBuilder';

const FOCUS_OPTIONS = [
 { value: 'Lazer', icon: '🏖️' },
 { value: 'Corporativo', icon: '💼' },
 { value: 'Grupos', icon: '🚌' },
 { value: 'Luxo', icon: '✨' },
];

const STEPS = [
 { label: 'Informações Básicas', icon: Building2 },
 { label: 'Localização & Operação', icon: MapPin },
 { label: 'Marca & Presença', icon: Palette },
 { label: 'Ativação', icon: Cloud },
];

export default function Onboarding() {
 const navigate = useNavigate();
 const { toast } = useToast();
 const { organization, setOrganization, setProfile, setRoles, user } = useAuthStore();
 const fileInputRef = useRef<HTMLInputElement>(null);

 const [step, setStep] = useState(1);
 const [createdOrgId, setCreatedOrgId] = useState<string | null>(null);
 const [logoFile, setLogoFile] = useState<File | null>(null);
 const [logoPreview, setLogoPreview] = useState<string | null>(null);
 const [activationEvents, setActivationEvents] = useState<string[]>([]);
 const [squadCompleted, setSquadCompleted] = useState(false);
 const [showAdvancedBuilder, setShowAdvancedBuilder] = useState(false);
 // Idempotency guard: prevents double-submission
 const submittingRef = useRef(false);
 
 const [form, setForm] = useState({
 name: '',
 whatsapp: '',
 email: '',
 phone: '',
 primaryColor: '#2563EB',
 secondaryColor: '#18181B', // zinc-900
 fontStyle: 'moderna',
 focus: 'Lazer',
 instagram_url: '',
 website_url: '',
 google_business_url: '',
 // Novos campos operacionais e fiscais solicitados no PRD
 razaoSocial: '',
 cnpjCpf: '',
 timezone: 'America/Sao_Paulo',
 currency: 'BRL',
 language: 'pt-BR',
 cep: '',
 address: '',
 city: '',
 uf: '',
 country: 'Brasil',
 hours: 'Segunda a Sexta, das 9h às 18h',
 slogan: '',
 bioCurta: '',
 });
 const [loading, setLoading] = useState(false);

 // Proteger progresso de onboarding contra fechamentos acidentais de aba
 const isDirty = !!form.name || !!form.whatsapp || !!form.email || !!form.cnpjCpf || !!logoFile;
 useUnsavedChangesGuard(isDirty && step < 4, 'Você possui dados de onboarding preenchidos. Tem certeza que deseja fechar ou sair antes de concluir a ativação?');

 if (showAdvancedBuilder) {
 return (
 <VisualBuilder 
 onBack={() => setShowAdvancedBuilder(false)} 
 projectName={form.name || 'Minha Agência'} 
 />
 );
 }

 if (organization && step !== 4) {
 return <Navigate to="/" replace />;
 }

 const update = (field: string, value: string) =>
 setForm((prev) => ({ ...prev, [field]: value }));

 const fetchCep = async (cepValue: string) => {
 const cleanCep = cepValue.replace(/\D/g, '');
 if (cleanCep.length === 8) {
 try {
 const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
 const data = await response.json();
 if (!data.erro) {
 setForm(prev => ({
 ...prev,
 address: data.logradouro || '',
 city: data.localidade || '',
 uf: data.uf || '',
 country: 'Brasil'
 }));
 toast({ title: 'CEP Encontrado!', description: 'Endereço preenchido automaticamente.' });
 } else {
 toast({ title: 'CEP não encontrado', description: 'Por favor, digite o endereço manualmente.', variant: 'destructive' });
 }
 } catch (error) {
 logger.error('Erro ao buscar CEP:', error);
 }
 }
 };

 const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const val = e.target.value;
 update('cep', val);
 if (val.replace(/\D/g, '').length === 8) {
 fetchCep(val);
 }
 };

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
 // Idempotency: block duplicate submissions
 if (submittingRef.current || !user || loading) return;
 submittingRef.current = true;

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
 setActivationEvents(['Validando dados da agencia']);
 const orgId = crypto.randomUUID();

 // 1. Handle Logo Upload if present
 let finalLogoUrl = null;
 if (logoFile) {
 setActivationEvents((prev) => [...prev, 'Enviando logotipo']);
 const fileExt = logoFile.name.split('.').pop();
 const fileName = `${orgId}/logo-${Date.now()}.${fileExt}`;
 const { data: uploadData, error: uploadError } = await supabase.storage
 .from('org-assets')
 .upload(fileName, logoFile);

 if (uploadError) {
 logger.error('Logo upload error:', uploadError);
 toast({ title: 'Erro ao subir logo', description: uploadError.message, variant: 'destructive' });
 submittingRef.current = false;
 setLoading(false);
 return;
 } else if (uploadData) {
 const { data: { publicUrl } } = supabase.storage.from('org-assets').getPublicUrl(fileName);
 finalLogoUrl = publicUrl;
 }
 }

 let orgError: PostgrestError | null = null;
 setActivationEvents((prev) => [...prev, 'Criando registro da organizacao']);
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
 primary_color: form.primaryColor || '#2563EB',
 secondary_color: form.secondaryColor || '#18181B',
 font_style: form.fontStyle,
 instagram_url: form.instagram_url || null,
 website_url: form.website_url || null,
 google_business_url: form.google_business_url || null,
 brand_kit: { 
 focus: form.focus,
 slogan: form.slogan || null,
 bioCurta: form.bioCurta || null
 },
 address: {
 cep: form.cep || null,
 street: form.address || null,
 city: form.city || null,
 uf: form.uf || null,
 country: form.country || 'Brasil'
 },
 settings: {
 timezone: form.timezone || 'America/Sao_Paulo',
 currency: form.currency || 'BRL',
 language: form.language || 'pt-BR',
 razaoSocial: form.razaoSocial || null,
 cnpjCpf: form.cnpjCpf || null,
 hours: form.hours || 'Segunda a Sexta, das 9h às 18h'
 }
 });
 orgError = error;
 if (!error) break;
 if (!error.message?.includes('unique') && !error.message?.includes('duplicate')) break;
 }

 if (orgError) {
 toast({ title: 'Erro ao criar agência', description: orgError.message, variant: 'destructive' });
 submittingRef.current = false;
 setLoading(false);
 return;
 }

 // Step 2: Vincular perfil ao org — WITHOUT .select() to prevent RLS recursion
 // The UPDATE+RETURNING(*) forces Postgres to evaluate profiles_select
 // which previously triggered the infinite recursion chain.
 // We fetch the profile separately after the update.
 const { error: profileError } = await supabase
 .from('profiles')
 .upsert({ 
 user_id: user.id, 
 org_id: orgId,
 first_name: user.user_metadata?.first_name || user.email?.split('@')[0] || 'Usuário',
 last_name: user.user_metadata?.last_name || ''
 }, { onConflict: 'user_id' });

 if (profileError) {
 toast({ title: 'Erro ao vincular perfil', description: profileError.message, variant: 'destructive' });
 submittingRef.current = false;
 setLoading(false);
 return;
 }

 // Fetch profile separately (safe: SELECT with own user_id never recurses)
 const { data: profile } = await supabase
 .from('profiles')
 .select('*')
 .eq('user_id', user.id)
 .maybeSingle();

 setActivationEvents((prev) => [...prev, 'Aplicando permissoes e quadros padrao']);
 await Promise.all([
 supabase.rpc('assign_org_admin_role', { _user_id: user.id }),
 supabase.rpc('ensure_default_kanban_boards', { _org_id: orgId }),
 ]);

 setActivationEvents((prev) => [...prev, 'Configurando portal público e templates']);
 
 // 1. Criar Public Site
 const siteId = crypto.randomUUID();
 await supabase.from('public_sites').insert({
 id: siteId,
 org_id: orgId,
 slug: slug,
 status: 'published',
 is_primary: true
 });

 // 2. Criar Builder Project (Website)
 const projectId = crypto.randomUUID();
 await supabase.from('builder_sites').insert({
 id: projectId,
 org_id: orgId,
 site_id: siteId,
 project_type: 'website',
 title: 'Website Oficial'
 });

 // 3. Criar Builder Version inicial (Snapshot)
 const versionId = crypto.randomUUID();
 const initialBlocks = [
 { 
 id: 'hero', 
 kind: 'hero', 
 title: `Seja bem-vindo à ${agencyName}`, 
 subtitle: form.slogan || 'Criando experiências de viagem sob medida para você.' 
 },
 { 
 id: 'features', 
 kind: 'features', 
 items: [
 'Atendimento personalizado', 
 'Roteiros exclusivos de ' + form.focus, 
 form.hours || 'Suporte especializado'
 ] 
 },
 { 
 id: 'contact', 
 kind: 'contact', 
 email: form.email || 'contato@agencia.com', 
 phone: form.whatsapp || form.phone || '(11) 99999-9999' 
 }
 ];

 await supabase.from('builder_pages').insert({
 id: versionId,
 project_id: projectId,
 version_number: 1,
 frame_schema: { viewport: 'desktop' },
 content_schema: initialBlocks,
 design_tokens: { primary_color: form.primaryColor, secondary_color: form.secondaryColor },
 render_snapshot: initialBlocks,
 status: 'published',
 created_by: user.id
 });

 // 4. Atualizar o current_version_id no builder_sites
 await supabase.from('builder_sites')
 .update({ current_version_id: versionId })
 .eq('id', projectId);

 const [{ data: org }, { data: rolesData }] = await Promise.all([
 supabase.from('organizations').select('*').eq('id', orgId).maybeSingle(),
 supabase.from('user_roles').select('role').eq('user_id', user.id),
 ]);

 // Rede de segurança contra lag de replicação / read-after-write de banco de dados
 const updatedProfile = profile ? { ...profile, org_id: orgId } : {
 user_id: user.id,
 org_id: orgId,
 first_name: user.user_metadata?.first_name || user.email?.split('@')[0] || 'Usuário',
 last_name: user.user_metadata?.last_name || '',
 email: user.email || null,
 is_active: true,
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString()
 } as any;

 const finalOrg = org || {
 id: orgId,
 name: agencyName,
 slug: slug,
 logo_url: finalLogoUrl,
 whatsapp: form.whatsapp || null,
 email: form.email || null,
 phone: form.phone || null,
 primary_color: form.primaryColor || '#2563EB',
 secondary_color: form.secondaryColor || '#18181B',
 font_style: form.fontStyle,
 instagram_url: form.instagram_url || null,
 website_url: form.website_url || null,
 google_business_url: form.google_business_url || null,
 brand_kit: { 
 focus: form.focus,
 slogan: form.slogan || null,
 bioCurta: form.bioCurta || null
 },
 address: {
 cep: form.cep || null,
 street: form.address || null,
 city: form.city || null,
 uf: form.uf || null,
 country: form.country || 'Brasil'
 },
 settings: {
 timezone: form.timezone || 'America/Sao_Paulo',
 currency: form.currency || 'BRL',
 language: form.language || 'pt-BR',
 razaoSocial: form.razaoSocial || null,
 cnpjCpf: form.cnpjCpf || null,
 hours: form.hours || 'Segunda a Sexta, das 9h às 18h'
 },
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString()
 } as any;

 setOrganization(finalOrg);
 setProfile(updatedProfile);
 setRoles((rolesData ?? []).map((item) => item.role));
 if (form.instagram_url || form.website_url) {
 setActivationEvents((prev) => [...prev, 'Iniciando enriquecimento de marca por IA']);
 supabase.functions.invoke('trigger-brand-squad', {
 body: {
 org_id: orgId,
 instagram_url: form.instagram_url,
 website_url: form.website_url,
 }
 }).catch(err => logger.error('Falha ao iniciar Central:', err));
 }

 setCreatedOrgId(orgId);
 setStep(4);
 submittingRef.current = false;
 setLoading(false);
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
 <p className="text-zinc-400 text-sm">Estes dados serão usados em orçamentos, portal e notas fiscais.</p>
 </div>

 <div className="space-y-4">
 <div className="space-y-2">
 <Label htmlFor="agencyName" className="text-zinc-300 text-sm">Nome da Agência *</Label>
 <div className="relative">
 <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
 <Input
 id="agencyName"
 value={form.name}
 onChange={(e) => update('name', e.target.value)}
 placeholder="Ex: Viagens Premium"
 className={`${inputCls} pl-10`}
 autoFocus
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-2">
 <Label htmlFor="razaoSocial" className="text-zinc-300 text-sm">Razão Social</Label>
 <Input
 id="razaoSocial"
 value={form.razaoSocial}
 onChange={(e) => update('razaoSocial', e.target.value)}
 placeholder="Ex: Viagens Premium LTDA"
 className={inputCls}
 />
 </div>
 <div className="space-y-2">
 <Label htmlFor="cnpjCpf" className="text-zinc-300 text-sm">CNPJ / CPF</Label>
 <Input
 id="cnpjCpf"
 value={form.cnpjCpf}
 onChange={(e) => update('cnpjCpf', e.target.value)}
 placeholder="Ex: 00.000.000/0001-00"
 className={inputCls}
 />
 </div>
 </div>

 <div className="space-y-2">
 <Label className="text-zinc-300 text-sm">E-mail Profissional *</Label>
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

 <div className="grid grid-cols-3 gap-3">
 <div className="space-y-2">
 <Label className="text-zinc-300 text-sm">Moeda</Label>
 <select
 value={form.currency}
 onChange={(e) => update('currency', e.target.value)}
 className="w-full bg-zinc-900 border border-zinc-700 h-12 text-white px-3 focus:border-vj-green focus:ring-vj-green rounded-xl text-sm"
 >
 <option value="BRL">BRL (R$)</option>
 <option value="USD">USD ($)</option>
 <option value="EUR">EUR (€)</option>
 </select>
 </div>
 <div className="space-y-2">
 <Label className="text-zinc-300 text-sm">Idioma</Label>
 <select
 value={form.language}
 onChange={(e) => update('language', e.target.value)}
 className="w-full bg-zinc-900 border border-zinc-700 h-12 text-white px-3 focus:border-vj-green focus:ring-vj-green rounded-xl text-sm"
 >
 <option value="pt-BR">Português</option>
 <option value="en-US">Inglês</option>
 <option value="es-ES">Espanhol</option>
 </select>
 </div>
 <div className="space-y-2">
 <Label className="text-zinc-300 text-sm">Timezone</Label>
 <select
 value={form.timezone}
 onChange={(e) => update('timezone', e.target.value)}
 className="w-full bg-zinc-900 border border-zinc-700 h-12 text-white px-3 focus:border-vj-green focus:ring-vj-green rounded-xl text-xs"
 >
 <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
 <option value="America/Manaus">Manaus (GMT-4)</option>
 <option value="America/Fortaleza">Fortaleza (GMT-3)</option>
 <option value="America/Noronha">Noronha (GMT-2)</option>
 </select>
 </div>
 </div>
 </div>

 <Button
 className="w-full h-12 premium-button font-bold text-sm gap-2"
 onClick={() => {
 if (!form.name.trim()) {
 toast({ title: 'Nome obrigatório', description: 'Por favor, informe o nome da agência.', variant: 'destructive' });
 return;
 }
 if (!form.email.trim()) {
 toast({ title: 'E-mail obrigatório', description: 'Por favor, informe o e-mail da agência.', variant: 'destructive' });
 return;
 }
 setStep(2);
 }}
 >
 Continuar <ArrowRight size={16} />
 </Button>
 </div>
 )}

 {/* Step 2 — Location & Operation */}
 {step === 2 && (
 <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
 <div>
 <h2 className="text-2xl font-black mb-1">Onde sua agência opera?</h2>
 <p className="text-zinc-400 text-sm">Insira os dados de localização física ou matriz fiscal e os horários.</p>
 </div>

 <div className="space-y-4">
 <div className="space-y-2">
 <Label htmlFor="cep" className="text-zinc-300 text-sm">CEP</Label>
 <Input
 id="cep"
 value={form.cep}
 onChange={handleCepChange}
 placeholder="Ex: 01001-000"
 maxLength={9}
 className={inputCls}
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="address" className="text-zinc-300 text-sm">Endereço Completo (Rua, Número, Bairro)</Label>
 <Input
 id="address"
 value={form.address}
 onChange={(e) => update('address', e.target.value)}
 placeholder="Ex: Av. Paulista, 1000 - Apto 50"
 className={inputCls}
 />
 </div>

 <div className="grid grid-cols-4 gap-3">
 <div className="col-span-2 space-y-2">
 <Label htmlFor="city" className="text-zinc-300 text-sm">Cidade</Label>
 <Input
 id="city"
 value={form.city}
 onChange={(e) => update('city', e.target.value)}
 placeholder="Ex: São Paulo"
 className={inputCls}
 />
 </div>
 <div className="space-y-2">
 <Label htmlFor="uf" className="text-zinc-300 text-sm">Estado / UF</Label>
 <Input
 id="uf"
 value={form.uf}
 onChange={(e) => update('uf', e.target.value)}
 placeholder="Ex: SP"
 maxLength={2}
 className={inputCls}
 />
 </div>
 <div className="space-y-2">
 <Label htmlFor="country" className="text-zinc-300 text-sm">País</Label>
 <Input
 id="country"
 value={form.country}
 onChange={(e) => update('country', e.target.value)}
 placeholder="Brasil"
 className={inputCls}
 />
 </div>
 </div>

 <div className="space-y-2">
 <Label htmlFor="hours" className="text-zinc-300 text-sm">Horário de Funcionamento</Label>
 <Input
 id="hours"
 value={form.hours}
 onChange={(e) => update('hours', e.target.value)}
 placeholder="Ex: Segunda a Sexta, das 9h às 18h"
 className={inputCls}
 />
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

 {/* Step 3 — Marca & Presença */}
 {step === 3 && (
 <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300 max-w-xl">
 <div>
 <h2 className="text-2xl font-black mb-1">Identidade & Presença</h2>
 <p className="text-zinc-400 text-sm">Defina o DNA visual da sua agência e seus canais digitais.</p>
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

 {/* Cores e Slogan */}
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
 <Label htmlFor="slogan" className="text-zinc-300 text-sm">Slogan da Agência</Label>
 <Input
 id="slogan"
 value={form.slogan}
 onChange={(e) => update('slogan', e.target.value)}
 placeholder="Ex: Viagens extraordinárias sob medida"
 className={inputCls}
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="bioCurta" className="text-zinc-300 text-sm">Bio Curta (Quem somos / Proposta de valor)</Label>
 <Input
 id="bioCurta"
 value={form.bioCurta}
 onChange={(e) => update('bioCurta', e.target.value)}
 placeholder="Ex: Especialistas em roteiros de luxo na Europa e exóticos no Sudeste Asiático."
 className={inputCls}
 />
 </div>

 <div className="space-y-2">
 <Label className="text-zinc-300 text-sm">Nicho de Atuação (Foco)</Label>
 <div className="grid grid-cols-4 gap-2">
 {FOCUS_OPTIONS.map((f) => (
 <button
 key={f.value}
 type="button"
 onClick={() => update('focus', f.value)}
 className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
 form.focus === f.value
 ? 'bg-vj-green/15 border-vj-green text-white'
 : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
 }`}
 >
 <span className="text-lg">{f.icon}</span>
 {f.value}
 </button>
 ))}
 </div>
 </div>

 {/* Canais Digitais */}
 <div className="space-y-3">
 <Label className="text-zinc-300 text-sm">Canais & Redes Sociais</Label>
 
 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-2">
 <Label className="text-xs text-zinc-400">Instagram</Label>
 <div className="relative">
 <Camera className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-500" />
 <Input
 value={form.instagram_url}
 onChange={(e) => update('instagram_url', e.target.value)}
 placeholder="instagram.com/sua_agencia"
 className={`${inputCls} pl-10 h-10 text-xs`}
 />
 </div>
 </div>

 <div className="space-y-2">
 <Label className="text-xs text-zinc-400">Site Principal (Se houver)</Label>
 <div className="relative">
 <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
 <Input
 value={form.website_url}
 onChange={(e) => update('website_url', e.target.value)}
 placeholder="suaagencia.com.br"
 className={`${inputCls} pl-10 h-10 text-xs`}
 />
 </div>
 </div>
 </div>

 <div className="space-y-2">
 <Label className="text-xs text-zinc-400">Google Meu Negócio (Maps)</Label>
 <div className="relative">
 <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
 <Input
 value={form.google_business_url}
 onChange={(e) => update('google_business_url', e.target.value)}
 placeholder="Link de localização no Google Maps"
 className={`${inputCls} pl-10 h-10 text-xs`}
 />
 </div>
 </div>
 </div>
 </div>
 
 <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-400 flex gap-3">
 <Cloud className="w-5 h-5 text-vj-green shrink-0 mt-0.5" />
 <p>
 Ao finalizar, a <strong>Central de IA</strong> visitará esses links para sintetizar o tom de voz e os dados da sua marca em tempo real.
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
 onClick={handleComplete}
 disabled={loading}
 >
 {loading ? 'Criando agência...' : 'Finalizar & Iniciar IA'} <ArrowRight size={16} />
 </Button>
 </div>
 </div>
 )}

 {/* Step 4 — AI Activation */}
 {step === 4 && (
 <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300 w-full max-w-2xl">
 <div className="text-center">
 <h2 className="text-2xl font-black mb-2">Central de IA Trabalhando</h2>
 <p className="text-zinc-400 text-sm max-w-md mx-auto">
 Configurando e ativando o ecossistema digital da{' '}
 <span className="text-white font-semibold">{form.name}</span>.
 </p>
 </div>

 {/* BrandSquadLive visualization */}
 <BrandSquadLive
 orgId={createdOrgId || ''}
 primaryColor={form.primaryColor}
 onComplete={() => setSquadCompleted(true)}
 />

 {squadCompleted ? (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in zoom-in duration-500 mt-6">
 {/* Option 1: Essential Speed */}
 <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-vj-green/40 transition-colors flex flex-col justify-between space-y-4">
 <div className="space-y-2">
 <div className="w-10 h-10 rounded-xl bg-vj-green/10 flex items-center justify-center text-vj-green">
 <Laptop className="w-5 h-5" />
 </div>
 <h3 className="font-bold text-base text-white">Ativação Essencial</h3>
 <p className="text-xs text-zinc-400 leading-relaxed">
 Sua agência está oficialmente online com página básica de vendas, Portal do Cliente ativo e claims de segurança do administrador master prontas para uso.
 </p>
 </div>
 <Button
 className="w-full h-11 premium-button font-bold text-xs gap-2"
 onClick={() => navigate('/')}
 >
 Acessar Painel <ArrowRight size={14} />
 </Button>
 </div>

 {/* Option 2: Expanded Speed */}
 <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-vj-green/40 transition-colors flex flex-col justify-between space-y-4">
 <div className="space-y-2">
 <div className="w-10 h-10 rounded-xl bg-vj-green/10 flex items-center justify-center text-vj-green">
 <Layout className="w-5 h-5" />
 </div>
 <h3 className="font-bold text-base text-white">Ativação Expandida</h3>
 <p className="text-xs text-zinc-400 leading-relaxed">
 Desbloqueie o construtor visual de páginas responsivas (Site Builder), o CMS do Blog de captação, Link-Bio do Instagram e base de conhecimento da IA.
 </p>
 </div>
 <Button
 variant="outline"
 className="w-full h-11 border-zinc-700 bg-transparent text-white hover:bg-zinc-800 hover:text-white font-bold text-xs gap-2 rounded-xl"
 onClick={() => setShowAdvancedBuilder(true)}
 >
 Abrir Construtor Visual <ArrowRight size={14} />
 </Button>
 </div>
 </div>
 ) : (
 <div className="text-center text-xs text-zinc-500 animate-pulse">
 Aguardando a conclusão da estruturação da agência...
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
