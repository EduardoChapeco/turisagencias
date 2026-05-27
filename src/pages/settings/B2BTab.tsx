import { useState } from 'react';
import { KeyRound, Plus, Trash2, Eye, EyeOff, Power, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useB2bCredentials, useSaveB2bCredential } from '@/hooks/useB2bCredentials';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const PORTALS = [
 { value: 'orinter', label: 'Orinter Tour', icon: '🏖️' },
 { value: 'cvc', label: 'CVC Corp', icon: '✈️' },
 { value: 'flytour', label: 'Flytour', icon: '🌍' },
 { value: 'meta', label: 'Meta Turismo', icon: '🗺️' },
 { value: 'trend', label: 'Trend Operadora', icon: '📦' },
 { value: 'custom', label: 'Outro Portal', icon: '🔗' },
];

export function B2BTab() {
 const { data: credentials, isLoading } = useB2bCredentials();
 const save = useSaveB2bCredential();
 const qc = useQueryClient();
 const { toast } = useToast();
 const [showForm, setShowForm] = useState(false);
 const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
 const [form, setForm] = useState({ portal_name: 'orinter', username: '', password: '' });

 const handleToggleActive = async (id: string, current: boolean) => {
 const { error } = await supabase
 .from('b2b_credentials')
 .update({ is_active: !current, updated_at: new Date().toISOString() })
 .eq('id', id);
 if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
 else qc.invalidateQueries({ queryKey: ['b2b_credentials'] });
 };

 const handleDelete = async (id: string) => {
 if (!confirm('Remover esta credencial?')) return;
 const { error } = await supabase.from('b2b_credentials').delete().eq('id', id);
 if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
 else qc.invalidateQueries({ queryKey: ['b2b_credentials'] });
 };

 const handleSave = async () => {
 if (!form.username || !form.password) return;
 await save.mutateAsync(form);
 setForm({ portal_name: 'orinter', username: '', password: '' });
 setShowForm(false);
 };

 const portalLabel = (name: string) => PORTALS.find(p => p.value === name) ?? { label: name, icon: '🔗' };

 return (
 <div className="grid md:grid-cols-2 gap-8">
 {/* Form card */}
 <Card className="premium-card">
 <CardHeader>
 <CardTitle className="text-lg flex items-center gap-2">
 <KeyRound size={18} className="text-vj-green" /> Credenciais B2B
 </CardTitle>
 <CardDescription>
 Gerencie logins em portais de operadoras para automação de cotações e reservas.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 {!showForm ? (
 <Button onClick={() => setShowForm(true)} className="w-full gap-2 h-12 rounded-2xl">
 <Plus size={16} /> Adicionar Portal
 </Button>
 ) : (
 <div className="space-y-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
 <div>
 <label className="text-[10px] font-bold uppercase text-zinc-400">Portal</label>
 <select
 value={form.portal_name}
 onChange={e => setForm(p => ({ ...p, portal_name: e.target.value }))}
 className="mt-1 w-full h-10 border border-zinc-200 rounded-xl px-3 text-sm bg-white"
 >
 {PORTALS.map(p => (
 <option key={p.value} value={p.value}>{p.icon} {p.label}</option>
 ))}
 </select>
 </div>
 <div>
 <label className="text-[10px] font-bold uppercase text-zinc-400">Usuário / CPF / Email</label>
 <Input
 placeholder="seu@login.com"
 value={form.username}
 onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
 className="mt-1 h-10 rounded-xl"
 />
 </div>
 <div>
 <label className="text-[10px] font-bold uppercase text-zinc-400">Senha</label>
 <Input
 type="password"
 placeholder="••••••••"
 value={form.password}
 onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
 className="mt-1 h-10 rounded-xl"
 />
 </div>
 <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2">
 <Lock size={14} className="text-amber-600 flex-none mt-0.5" />
 <p className="text-xs text-amber-700">
 Credenciais são usadas <strong>exclusivamente</strong> pela extensão do navegador para automação.
 Armazenadas com hash seguro.
 </p>
 </div>
 <div className="flex gap-2">
 <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowForm(false)}>
 Cancelar
 </Button>
 <Button
 size="sm"
 className="flex-1 bg-vj-green hover:bg-vj-green/90 text-white"
 disabled={!form.username || !form.password || save.isPending}
 onClick={handleSave}
 >
 {save.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
 Salvar
 </Button>
 </div>
 </div>
 )}
 </CardContent>
 </Card>

 {/* Credentials list */}
 <Card className="premium-card">
 <CardHeader>
 <CardTitle className="text-lg">Portais Configurados</CardTitle>
 </CardHeader>
 <CardContent>
 {isLoading ? (
 <div className="space-y-3">
 <Skeleton className="h-16 rounded-xl" />
 <Skeleton className="h-16 rounded-xl" />
 </div>
 ) : !credentials?.length ? (
 <div className="text-center py-16 opacity-30">
 <KeyRound size={40} className="mx-auto mb-2" />
 <p className="text-sm">Nenhum portal configurado</p>
 </div>
 ) : (
 <div className="space-y-3">
 {credentials.map((cred: any) => {
 const portal = portalLabel(cred.portal_name);
 return (
 <div
 key={cred.id}
 className={`p-4 rounded-2xl border flex items-center gap-3 transition-colors ${
 cred.is_active ? 'border-zinc-100 bg-white' : 'border-zinc-100 bg-zinc-50/50 opacity-60'
 }`}
 >
 <span className="text-2xl">{portal.icon}</span>
 <div className="flex-1 min-w-0">
 <p className="font-bold text-sm">{portal.label}</p>
 <p className="text-xs text-zinc-400 font-mono truncate">
 {showPasswords[cred.id] ? cred.username : cred.username.replace(/(.{3}).*/, '$1•••••')}
 </p>
 </div>
 <div className="flex items-center gap-1">
 <Button
 variant="ghost" size="icon"
 className="h-8 w-8 text-zinc-400 hover:text-zinc-700"
 onClick={() => setShowPasswords(p => ({ ...p, [cred.id]: !p[cred.id] }))}
 title="Mostrar/ocultar"
 >
 {showPasswords[cred.id] ? <EyeOff size={14} /> : <Eye size={14} />}
 </Button>
 <Button
 variant="ghost" size="icon"
 className={`h-8 w-8 ${cred.is_active ? 'text-vj-green' : 'text-zinc-400'} hover:text-vj-green`}
 onClick={() => handleToggleActive(cred.id, cred.is_active)}
 title={cred.is_active ? 'Desativar' : 'Ativar'}
 >
 <Power size={14} />
 </Button>
 <Button
 variant="ghost" size="icon"
 className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
 onClick={() => handleDelete(cred.id)}
 title="Remover"
 >
 <Trash2 size={14} />
 </Button>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </CardContent>
 </Card>
 </div>
 );
}
