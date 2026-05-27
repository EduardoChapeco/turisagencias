import { useMemo, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Search, UserCheck, UserPlus, UserX, Users } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useInviteAgent, useTeamMembers, useUpdateMemberRole } from '@/hooks/useSettings';
import type { AppRole } from '@/types';

const INVITABLE_ROLES: AppRole[] = ['agent', 'support', 'org_admin'];
const MANAGEABLE_ROLES: AppRole[] = ['agent', 'support', 'org_admin', 'client'];

const ROLE_LABEL: Record<AppRole, string> = {
 super_admin: 'Super Admin',
 org_admin: 'Administrador',
 agent: 'Agente',
 support: 'Suporte',
 client: 'Cliente',
};

function roleBadge(role: AppRole) {
 const variant =
 role === 'super_admin'
 ? 'bg-red-100 text-red-700'
 : role === 'org_admin'
 ? 'bg-purple-100 text-purple-700'
 : role === 'support'
 ? 'bg-cyan-100 text-cyan-700'
 : role === 'client'
 ? 'bg-zinc-100 text-zinc-700'
 : 'bg-blue-100 text-blue-700';

 return <span className={`rounded px-2 py-1 text-xs font-bold uppercase tracking-wider ${variant}`}>{ROLE_LABEL[role]}</span>;
}

export default function Team() {
 const { profile } = useAuthStore();
 const { data: members, isLoading } = useTeamMembers();
 const inviteAgent = useInviteAgent();
 const updateMember = useUpdateMemberRole();

 const [search, setSearch] = useState('');
 const [inviteEmail, setInviteEmail] = useState('');
 const [inviteRole, setInviteRole] = useState<AppRole>('agent');

 const filteredMembers = useMemo(() => {
 const term = search.trim().toLowerCase();
 if (!term) return members ?? [];

 return (members ?? []).filter((member: any) => {
 const fullName = `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim().toLowerCase();
 const email = (member.email ?? '').toLowerCase();
 return fullName.includes(term) || email.includes(term);
 });
 }, [members, search]);

 const handleInvite = async () => {
 const email = inviteEmail.trim().toLowerCase();
 if (!email) return;
 await inviteAgent.mutateAsync({ email, role: inviteRole });
 setInviteEmail('');
 setInviteRole('agent');
 };

 const handleRoleChange = async (member: any, role: AppRole) => {
 await updateMember.mutateAsync({ profileId: member.id, userId: member.user_id, role });
 };

 const handleToggleActive = async (member: any) => {
 await updateMember.mutateAsync({
 profileId: member.id,
 userId: member.user_id,
 is_active: !member.is_active,
 });
 };

 return (
 <AppLayout fullHeight>
 <div className="flex h-full min-h-0 flex-col gap-4">
 <PageHeader
 title="Equipe"
 description="Convites, acessos e perfis conectados ao auth real da organizacao."
 icon={Users}
 />

 <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
 <Card className="rounded-3xl border">
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-lg">
 <UserPlus className="h-4 w-4 text-vj-green" />
 Convidar membro
 </CardTitle>
 <CardDescription>Cria convite real via Supabase Auth e vincula a organizacao.</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="space-y-2">
 <label className="text-sm font-semibold text-zinc-700">E-mail</label>
 <Input
 type="email"
 placeholder="agente@agencia.com.br"
 value={inviteEmail}
 onChange={(event) => setInviteEmail(event.target.value)}
 className="h-11 rounded-xl"
 />
 </div>

 <div className="space-y-2">
 <label className="text-sm font-semibold text-zinc-700">Perfil de acesso</label>
 <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as AppRole)}>
 <SelectTrigger className="h-11 rounded-xl">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {INVITABLE_ROLES.map((role) => (
 <SelectItem key={role} value={role}>
 {ROLE_LABEL[role]}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <Button
 onClick={() => void handleInvite()}
 disabled={!inviteEmail.trim() || inviteAgent.isPending}
 className="h-11 w-full rounded-xl bg-vj-green hover:bg-vj-green/90"
 >
 {inviteAgent.isPending ? 'Enviando convite...' : 'Enviar convite'}
 </Button>
 </CardContent>
 </Card>

 <Card className="flex min-h-0 flex-col rounded-3xl border">
 <CardHeader className="pb-4">
 <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
 <div>
 <CardTitle className="text-lg">Membros ativos</CardTitle>
 <CardDescription>{members?.length ?? 0} perfis vinculados a esta organizacao.</CardDescription>
 </div>
 <div className="relative w-full lg:w-72">
 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
 <Input
 placeholder="Buscar nome ou email..."
 value={search}
 onChange={(event) => setSearch(event.target.value)}
 className="h-10 rounded-xl pl-10"
 />
 </div>
 </div>
 </CardHeader>

 <CardContent className="min-h-0 flex-1">
 {isLoading ? (
 <div className="space-y-3">
 <Skeleton className="h-16 w-full rounded-2xl" />
 <Skeleton className="h-16 w-full rounded-2xl" />
 <Skeleton className="h-16 w-full rounded-2xl" />
 </div>
 ) : filteredMembers.length === 0 ? (
 <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed text-center">
 <Users className="h-8 w-8 text-zinc-400" />
 <div>
 <p className="font-semibold text-zinc-700">Nenhum membro encontrado</p>
 <p className="text-sm text-zinc-500">Ajuste o filtro ou envie um novo convite.</p>
 </div>
 </div>
 ) : (
 <div className="overflow-auto rounded-2xl border">
 <table className="w-full text-left text-sm">
 <thead className="sticky top-0 z-10 bg-muted text-xs uppercase text-muted-foreground">
 <tr>
 <th className="px-4 py-3 font-medium">Membro</th>
 <th className="px-4 py-3 font-medium">Perfil</th>
 <th className="px-4 py-3 font-medium">Status</th>
 <th className="px-4 py-3 font-medium text-right">Acoes</th>
 </tr>
 </thead>
 <tbody>
 {filteredMembers.map((member: any) => {
 const memberRole = (member.role ?? 'agent') as AppRole;
 const fullName = `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim() || member.email || 'Sem nome';
 const isSelf = profile?.id === member.id;

 return (
 <tr key={member.id} className="border-b last:border-0 hover:bg-muted/40">
 <td className="px-4 py-3">
 <div className="flex flex-col">
 <span className="font-bold text-zinc-900">{fullName}</span>
 <span className="flex items-center gap-1 text-xs text-muted-foreground">
 <Mail className="h-3 w-3" />
 {member.email || 'Sem email'}
 </span>
 </div>
 </td>
 <td className="px-4 py-3">
 {isSelf || memberRole === 'super_admin' ? (
 roleBadge(memberRole)
 ) : (
 <Select value={memberRole} onValueChange={(value) => void handleRoleChange(member, value as AppRole)}>
 <SelectTrigger className="h-9 w-[180px] rounded-xl">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {MANAGEABLE_ROLES.map((role) => (
 <SelectItem key={role} value={role}>
 {ROLE_LABEL[role]}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 )}
 </td>
 <td className="px-4 py-3">
 <Badge
 variant={member.is_active ? 'default' : 'secondary'}
 className={member.is_active ? 'bg-green-600 text-white' : ''}
 >
 {member.is_active ? 'Ativo' : 'Inativo'}
 </Badge>
 </td>
 <td className="px-4 py-3 text-right">
 {isSelf || memberRole === 'super_admin' ? (
 <span className="text-xs font-medium text-muted-foreground">Protegido</span>
 ) : (
 <Button
 variant="outline"
 size="sm"
 className="rounded-xl"
 disabled={updateMember.isPending}
 onClick={() => void handleToggleActive(member)}
 >
 {member.is_active ? (
 <>
 <UserX className="mr-2 h-4 w-4" />
 Desativar
 </>
 ) : (
 <>
 <UserCheck className="mr-2 h-4 w-4" />
 Ativar
 </>
 )}
 </Button>
 )}
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 )}
 </CardContent>
 </Card>
 </div>
 </div>
 </AppLayout>
 );
}
