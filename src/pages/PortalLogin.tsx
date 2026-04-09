import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Plane } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePortalOrganization } from '@/hooks/usePortal';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PortalLogin() {
  const navigate = useNavigate();
  const { org_slug } = useParams<{ org_slug: string }>();
  const { toast } = useToast();
  const { data: organization } = usePortalOrganization(org_slug);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div
            className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg"
            style={{ backgroundColor: organization?.primary_color || '#1E3A5F' }}
          >
            {organization?.logo_url ? (
              <img src={organization.logo_url} alt={organization.name} className="h-7" />
            ) : (
              <Plane className="h-6 w-6 text-white" />
            )}
          </div>
          <CardTitle className="font-heading text-2xl">{organization?.name || 'Portal do Cliente'}</CardTitle>
          <CardDescription>Entre com magic link para acessar sua viagem.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!org_slug) return;
              setLoading(true);

              const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                  emailRedirectTo: `${window.location.origin}/portal/${org_slug}/home`,
                },
              });

              setLoading(false);

              if (error) {
                toast({ title: 'Erro ao enviar magic link', description: error.message, variant: 'destructive' });
                return;
              }

              toast({ title: 'Magic link enviado!', description: 'Verifique seu e-mail para acessar o portal.' });
              navigate(`/portal/${org_slug}/home`);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="portal-email">E-mail</Label>
              <Input
                id="portal-email"
                type="email"
                placeholder="cliente@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</> : 'Receber magic link'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
