import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SheetPage } from '@/components/ui/SheetPage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, UserPlus, Users, MoreVertical, Edit2, Trash2, MailIcon, Shield, Percent } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useTeamMembers, useCreateTeamMember, useUpdateTeamMember, useDeleteTeamMember, TeamMember } from '@/hooks/useTeam';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PageSkeleton } from '@/components/ui/EmptyState';

const TEAM_SECTIONS = [
  { id: 'dados', label: 'Dados do Agente', icon: UserPlus },
  { id: 'acesso', label: 'Acesso e Comissão', icon: Shield },
];

export default function Team() {
  const { profile } = useAuthStore();
  const { data: members, isLoading } = useTeamMembers(profile?.org_id);
  const createMember = useCreateTeamMember();
  const updateMember = useUpdateTeamMember();
  const deleteMember = useDeleteTeamMember();

  const [search, setSearch] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'agent' as TeamMember['role'],
    commission_rate: 0,
    status: 'active' as TeamMember['status']
  });

  const handleOpenNew = () => {
    setEditingMember(null);
    setFormData({ full_name: '', email: '', role: 'agent', commission_rate: 0, status: 'pending' });
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (m: TeamMember) => {
    setEditingMember(m);
    setFormData({
      full_name: m.full_name,
      email: m.email,
      role: m.role,
      commission_rate: m.commission_rate,
      status: m.status
    });
    setIsSheetOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.full_name || !formData.email) return;
    if (editingMember) {
      await updateMember.mutateAsync({ id: editingMember.id, ...formData });
    } else {
      await createMember.mutateAsync({ org_id: profile!.org_id!, ...formData });
    }
    setIsSheetOpen(false);
  };

  const isPending = createMember.isPending || updateMember.isPending;

  const filtered = members?.filter(m => m.full_name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase())) || [];

  if (isLoading) return <AppLayout><PageSkeleton /></AppLayout>;

  return (
    <AppLayout fullHeight>
      <div className="flex flex-col h-full gap-4">
        <PageHeader 
          title="Equipe & Comissionamento" 
          description="Controle de acesso, papéis e taxas de comissionamento de rede."
          icon={Users}
          actions={
            <Button onClick={handleOpenNew} className="rounded-full gap-2 px-6">
              <UserPlus size={16}/> Convidar Membro
            </Button>

          }
        />

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border  flex-1 flex flex-col min-h-0">
          <div className="relative mb-6 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Buscar por nome ou email..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>

          <div className="flex-1 overflow-auto rounded-xl border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted sticky top-0 z-10 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Funcionário / Agente</th>
                  <th className="px-4 py-3 font-medium">Acesso</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Taxa de Comissão</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Nenhum membro encontrado.
                    </td>
                  </tr>
                ) : (
                  filtered.map(m => (
                    <tr key={m.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                           <span className="font-bold">{m.full_name}</span>
                           <span className="text-xs text-muted-foreground flex items-center gap-1"><MailIcon size={10}/>{m.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                         <span className={`px-2 py-1 rounded text-xs uppercase font-bold tracking-wider ${
                            m.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                         }`}>
                           {m.role}
                         </span>
                      </td>
                      <td className="px-4 py-3">
                         <Badge variant={m.status === 'active' ? 'default' : m.status === 'pending' ? 'secondary' : 'destructive'} 
                                className={m.status === 'active' ? 'bg-green-500' : m.status === 'pending' ? 'bg-amber-500 hover:bg-amber-600' : ''}>
                           {m.status === 'pending' ? 'Aguardando Login' : m.status === 'active' ? 'Ativo' : 'Suspenso'}
                         </Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold">{m.commission_rate}%</td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreVertical size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem onClick={() => handleOpenEdit(m)} className="gap-2 cursor-pointer">
                              <Edit2 size={14}/> Editar Permissões
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => { if(confirm('Remover o acesso deste membro?')) deleteMember.mutateAsync(m.id); }} 
                              className="gap-2 cursor-pointer text-red-600 focus:text-red-700"
                            >
                              <Trash2 size={14}/> Revogar Acesso
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <SheetPage
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title={editingMember ? 'Editar Perfil de Acesso' : 'Convidar Novo Membro'}
        subtitle="Gerencie os acessos e comissões da sua equipe"
        icon={Users}
        sections={TEAM_SECTIONS}
        defaultSection="dados"
        footer={
          <div className="flex items-center gap-3 w-full justify-end">
            <Button variant="ghost" onClick={() => setIsSheetOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.full_name || !formData.email || isPending}
              className="rounded-full px-8 bg-vj-green hover:bg-vj-green/90"
            >
              {isPending ? 'Salvando...' : editingMember ? 'Salvar Alterações' : 'Enviar Convite'}
            </Button>
          </div>
        }
      >
        {(activeSection) => (
          <>
            {activeSection === 'dados' && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="font-semibold">Nome Completo *</Label>
                  <Input
                    value={formData.full_name}
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                    placeholder="Ex: Maria Santos"
                    className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-semibold flex items-center gap-2"><MailIcon size={14} /> E-mail Corporativo *</Label>
                  <Input
                    type="email"
                    disabled={!!editingMember}
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="agente@agencia.com.br"
                    className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                  />
                  {!!editingMember && <p className="text-xs text-zinc-500">O e-mail de acesso não pode ser alterado após o convite.</p>}
                </div>
                {!editingMember && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
                    ℹ️ Peça ao usuário para acessar o portal de login com este e-mail. O primeiro acesso será configurado por ele.
                  </div>
                )}
              </div>
            )}

            {activeSection === 'acesso' && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="font-semibold flex items-center gap-2"><Shield size={14} /> Nível de Acesso</Label>
                  <Select value={formData.role} onValueChange={(v: any) => setFormData({...formData, role: v})}>
                    <SelectTrigger className="h-12 rounded-xl bg-zinc-50 border-zinc-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">👑 Administrador (Acesso Total)</SelectItem>
                      <SelectItem value="agent">🧳 Agente (Somente Vendas)</SelectItem>
                      <SelectItem value="viewer">👁️ Visualizador (Somente Leitura)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold flex items-center gap-2"><Percent size={14} /> Taxa de Comissão (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={formData.commission_rate}
                    onChange={e => setFormData({...formData, commission_rate: Number(e.target.value)})}
                    className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                  />
                </div>

                {editingMember && (
                  <div className="space-y-1.5">
                    <Label className="font-semibold">Status da Conta</Label>
                    <Select value={formData.status} onValueChange={(v: any) => setFormData({...formData, status: v})}>
                      <SelectTrigger className="h-12 rounded-xl bg-zinc-50 border-zinc-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">✅ Ativo (Acesso Liberado)</SelectItem>
                        <SelectItem value="suspended">🔒 Suspenso (Acesso Bloqueado)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </SheetPage>
    </AppLayout>
  );
}
