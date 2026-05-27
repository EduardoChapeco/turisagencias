import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, UserCheck, UserX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/authStore';
import { useTeamMembers, useInviteAgent, useUpdateMemberRole } from '@/hooks/useSettings';
import type { AppRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export function AgentesTab() {
 const { data: members, isLoading } = useTeamMembers();
 const inviteAgent = useInviteAgent();
 const updateRole = useUpdateMemberRole();
 const { profile } = useAuthStore();
 const [updatingCommission, setUpdatingCommission] = useState<string | null>(null);

 const handleUpdateCommission = async (profileId: string, model: string) => {
 setUpdatingCommission(profileId);
 try {
 const { error } = await supabase
 .from('profiles')
 .update({ commission_plan: model } as any)
 .eq('id', profileId);
 if (error) throw error;
 // Idealmente recarregaria os members via invalidateQueries
 } catch (e) {
 console.error(e);
 } finally {
 setUpdatingCommission(null);
 }
 };

 const [inviteEmail, setInviteEmail] = useState('');
 const [inviteRole, setInviteRole] = useState<AppRole>('agent');

 const handleInvite = async () => {
 if (!inviteEmail.trim()) return;
 await inviteAgent.mutateAsync({ email: inviteEmail.trim(), role: inviteRole });
 setInviteEmail('');
 };

 const roleLabel = (role: string) => {
 const map: Record<string, string> = { super_admin: 'Super Admin', org_admin: 'Administrador', agent: 'Agente', support: 'Suporte', client: 'Cliente' };
 return map[role] ?? role;
 };

 return (
 <div className="grid md:grid-cols-2 gap-6">
 <Card className="premium-card">
 <CardHeader>
 <CardTitle className="text-lg flex items-center gap-2">
 <Mail className="h-4 w-4 text-vj-green" /> Convidar Membro
 </CardTitle>
 <CardDescription>O usuário receberá um email para criar sua conta na agência.</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <Input
 type="email"
 placeholder="agente@turisagencias.com"
 value={inviteEmail}
 onChange={e => setInviteEmail(e.target.value)}
 className="rounded-xl border-zinc-200"
 />
 <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as AppRole)}>
 <SelectTrigger className="h-10 rounded-xl border-zinc-200">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="agent">Agente de Viagens</SelectItem>
 <SelectItem value="support">Suporte</SelectItem>
 <SelectItem value="org_admin">Administrador</SelectItem>
 </SelectContent>
 </Select>
 <Button
 className="w-full premium-button"
 onClick={handleInvite}
 disabled={!inviteEmail.trim() || inviteAgent.isPending}
 >
 {inviteAgent.isPending ? 'Enviando...' : 'Enviar Convite'}
 </Button>
 </CardContent>
 </Card>

 <Card className="premium-card">
 <CardHeader>
 <CardTitle className="text-lg">Equipe Atual</CardTitle>
 <CardDescription>{members?.length ?? 0} profissionais ativos.</CardDescription>
 </CardHeader>
 <CardContent className="space-y-3">
 {isLoading ? (
 <Skeleton className="h-20 w-full" />
 ) : (
 members?.map((m: any) => (
 <div key={m.id} className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
 <div className="h-8 w-8 rounded-full bg-vj-green/10 flex items-center justify-center text-[10px] font-bold text-vj-green">
 {m.first_name?.[0] ?? m.email[0]}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-bold truncate">{m.first_name ?? m.email}</p>
 <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{roleLabel(m.role)}</p>
 </div>
 
 {m.role === 'agent' && (
 <div className="mr-2">
 <Select 
 defaultValue={(m as any).commission_plan || 'standard'} 
 onValueChange={(val) => handleUpdateCommission(m.id, val)}
 disabled={updatingCommission === m.id}
 >
 <SelectTrigger className="h-8 text-xs border-zinc-200 w-[110px]">
 <SelectValue placeholder="Comissão" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="standard" className="text-xs">Padrão (10%)</SelectItem>
 <SelectItem value="gold" className="text-xs">Ouro (15%)</SelectItem>
 <SelectItem value="basic" className="text-xs">Básico (5%)</SelectItem>
 </SelectContent>
 </Select>
 </div>
 )}

 {profile?.id !== m.id && (
 <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400" onClick={() => updateRole.mutate({ profileId: m.id, userId: m.user_id, is_active: !m.is_active })}>
 {m.is_active ? <UserX size={14} /> : <UserCheck size={14} className="text-vj-green" />}
 </Button>
 )}
 </div>
 ))
 )}
 </CardContent>
 </Card>
 </div>
 );
}
