import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { user, setOrganization, setProfile, setRoles } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Create org
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name, slug, whatsapp: whatsapp || null })
      .select()
      .single();

    if (orgError || !org) {
      toast({ title: 'Erro', description: orgError?.message || 'Erro ao criar agência', variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Link profile to org
    const { data: profile } = await supabase
      .from('profiles')
      .update({ org_id: org.id })
      .eq('user_id', user.id)
      .select()
      .single();

    // Add org_admin role
    await supabase.from('user_roles').insert({ user_id: user.id, role: 'org_admin' as any });

    setOrganization(org as any);
    if (profile) setProfile(profile as any);
    setRoles(['agent', 'org_admin']);

    toast({ title: 'Agência criada!', description: `${name} está pronta para uso.` });
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
