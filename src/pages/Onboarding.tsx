import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plane } from 'lucide-react';

export default function Onboarding() {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, organization, setOrganization, setProfile, setRoles } = useAuthStore();

  if (organization) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading) return;

    const agencyName = name.trim();
    const sanitizedWhatsapp = whatsapp.replace(/\D/g, '');
    const slug = agencyName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    if (!agencyName || !slug) {
      toast({ title: 'Dados inválidos', description: 'Informe um nome válido para a agência.', variant: 'destructive' });
      return;
    }

    setLoading(true);

    const orgId = crypto.randomUUID();

    const { error: orgError } = await supabase
      .from('organizations')
      .insert({ id: orgId, name: agencyName, slug, whatsapp: sanitizedWhatsapp || null });

    if (orgError) {
      const description = orgError.code === '23505'
        ? 'Já existe uma agência com esse identificador. Tente outro nome.'
        : orgError.message || 'Erro ao criar agência';

      toast({ title: 'Erro', description, variant: 'destructive' });
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({ org_id: orgId })
      .eq('user_id', user.id)
      .select()
      .maybeSingle();

    if (profileError || !profile) {
      toast({ title: 'Erro', description: profileError?.message || 'Erro ao vincular usuário à agência', variant: 'destructive' });
      setLoading(false);
      return;
    }

    const { error: roleError } = await supabase.rpc('assign_org_admin_role', { _user_id: user.id });

    if (roleError) {
      toast({ title: 'Aviso', description: 'Agência criada, mas houve uma falha ao atualizar permissões. Recarregue a página.', variant: 'destructive' });
    }

    const [{ data: org, error: orgFetchError }, { data: rolesData, error: rolesError }] = await Promise.all([
      supabase.from('organizations').select('*').eq('id', orgId).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', user.id),
    ]);

    if (orgFetchError || !org) {
      toast({ title: 'Aviso', description: 'Agência criada, mas o carregamento final falhou. Recarregue a página.', variant: 'destructive' });
      setLoading(false);
      return;
    }

    if (rolesError) {
      toast({ title: 'Aviso', description: 'Agência criada, mas os papéis não puderam ser recarregados.', variant: 'destructive' });
    }

    setOrganization(org);
    setProfile(profile);
    setRoles((rolesData ?? []).map((item) => item.role));

    toast({ title: 'Agência criada!', description: `${agencyName} está pronta para uso.` });
    setLoading(false);
    navigate('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Plane className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="font-heading text-2xl">Configure sua agência</CardTitle>
          <CardDescription>Preencha os dados básicos para começar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da agência</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Viagens Fantásticas" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp (com DDD)</Label>
              <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="11999999999" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Criando...' : 'Criar agência'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
