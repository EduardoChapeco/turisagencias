import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, UserCheck, UserX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/authStore';
import { useTeamMembers, useInviteAgent, useUpdateMemberRole } from '@/hooks/useSettings';

export function AgentesTab() {
  const { data: members, isLoading } = useTeamMembers();
  const inviteAgent = useInviteAgent();
  const updateRole = useUpdateMemberRole();
  const { profile } = useAuthStore();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('agent');

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    await inviteAgent.mutateAsync({ email: inviteEmail.trim(), role: inviteRole });
    setInviteEmail('');
  };

  const roleLabel = (role: string) => {
    const map: Record<string, string> = { admin: 'Admin', manager: 'Gerente', agent: 'Agente' };
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
          <select
            className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
            value={inviteRole}
            onChange={e => setInviteRole(e.target.value)}
          >
            <option value="agent">Agente de Viagens</option>
            <option value="manager">Gerente</option>
            <option value="admin">Administrador</option>
          </select>
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
                {profile?.id !== m.id && (
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400" onClick={() => updateRole.mutate({ profileId: m.id, is_active: !m.is_active })}>
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
