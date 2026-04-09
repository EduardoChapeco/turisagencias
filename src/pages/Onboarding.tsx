import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Plane } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function isMissingSchemaColumnError(message: string | undefined, column: string) {
  if (!message) return false;
  return message.toLowerCase().includes(`could not find the '${column}' column`.toLowerCase());
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { organization, setOrganization, setProfile, setRoles, user } = useAuthStore();
  const [form, setForm] = useState({
    name: '',
    whatsapp: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  if (organization) {
    return <Navigate to="/" replace />;
  }

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Plane className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="font-heading text-2xl">Configure sua agência</CardTitle>
          <CardDescription>Preencha os dados iniciais para ativar o VoyageOS.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!user || loading) return;

              const agencyName = form.name.trim();
              const slug = agencyName
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');

              if (!agencyName || !slug) {
                toast({
                  title: 'Dados inválidos',
                  description: 'Informe um nome válido para a agência.',
                  variant: 'destructive',
                });
                return;
              }

              setLoading(true);
              const orgId = crypto.randomUUID();

              const fullOrganizationPayload = {
                id: orgId,
                name: agencyName,
                slug,
                whatsapp: form.whatsapp || null,
                email: form.email || null,
                phone: form.phone || null,
              };

              const fallbackOrganizationPayload = {
                id: orgId,
                name: agencyName,
                slug,
                whatsapp: form.whatsapp || null,
              };

              let { error: orgError } = await supabase.from('organizations').insert(fullOrganizationPayload);

              if (
                orgError &&
                (isMissingSchemaColumnError(orgError.message, 'email') || isMissingSchemaColumnError(orgError.message, 'phone'))
              ) {
                const retry = await supabase.from('organizations').insert(fallbackOrganizationPayload);
                orgError = retry.error;
              }

              if (orgError) {
                toast({
                  title: 'Erro ao criar agência',
                  description: orgError.code === '23505'
                    ? 'Já existe uma agência com esse identificador. Tente outro nome.'
                    : orgError.message,
                  variant: 'destructive',
                });
                setLoading(false);
                return;
              }

              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .update({ org_id: orgId })
                .eq('user_id', user.id)
                .select('*')
                .maybeSingle();

              if (profileError || !profile) {
                toast({
                  title: 'Erro ao vincular usuário',
                  description: profileError?.message || 'Não foi possível concluir o onboarding.',
                  variant: 'destructive',
                });
                setLoading(false);
                return;
              }

              await Promise.all([
                supabase.rpc('assign_org_admin_role', { _user_id: user.id }),
                supabase.rpc('ensure_default_kanban_boards', { _org_id: orgId }),
              ]);

              const [{ data: org }, { data: rolesData }] = await Promise.all([
                supabase.from('organizations').select('*').eq('id', orgId).maybeSingle(),
                supabase.from('user_roles').select('role').eq('user_id', user.id),
              ]);

              setOrganization(org ?? null);
              setProfile(profile);
              setRoles((rolesData ?? []).map((item) => item.role));

              toast({ title: 'Agência criada!', description: `${agencyName} está pronta para uso.` });
              setLoading(false);
              navigate('/');
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nome da agência</Label>
              <Input id="name" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Excelência Tour Chapecó" required />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} placeholder="49999999999" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="4933333333" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail da agência</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="contato@agencia.com" />
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
