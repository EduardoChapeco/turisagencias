import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Plane, Sparkles, MailCheck } from 'lucide-react';
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
  const [sent, setSent] = useState(false);

  // Forçar tema root na base se necessário para combinar com o cliente
  useEffect(() => {
    if (organization?.primary_color) {
      document.documentElement.style.setProperty('--primary', organization.primary_color);
    }
  }, [organization]);

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden selection:bg-primary/20">
      {/* Background dinâmico inspirado em viagens de luxo / World ID */}
      <div className="absolute inset-0 z-0 bg-slate-950">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-slate-900 to-slate-950 opacity-80" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-accent/20 rounded-full blur-[120px] opacity-20 mix-blend-screen" />
      </div>

      <div className="z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Logo Flutuante (Above Card) */}
        <div className="flex justify-center mb-6 drop-shadow-xl">
           <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-2xl border border-white/10"
              style={{ backgroundColor: organization?.primary_color || '#1E3A5F' }}
            >
              {organization?.logo_url ? (
                <img src={organization.logo_url} alt={organization.name} className="h-10 w-10 object-contain drop-shadow-sm" />
              ) : (
                <Plane className="h-8 w-8 text-white drop-shadow-md" />
              )}
            </div>
        </div>

        <Card className="border-0 shadow-2xl bg-white/5 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-950/40 rounded-[2rem] overflow-hidden text-white border-t border-l border-white/10">
          <CardHeader className="text-center pt-10 pb-6 px-8">
            <CardTitle className="font-heading text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
               {organization?.name || 'Bem-vindo'}
            </CardTitle>
            <CardDescription className="text-zinc-400 mt-2 text-base">
               Acesso seguro à sua viagem exclusiva.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            {sent ? (
              <div className="flex flex-col items-center justify-center text-center space-y-4 py-4 animate-in zoom-in-95 duration-500">
                 <div className="h-16 w-16 bg-success/10 rounded-full flex items-center justify-center border border-success/20">
                   <MailCheck className="h-8 w-8 text-success" />
                 </div>
                 <div>
                   <h3 className="font-heading font-semibold text-lg text-white">Link Mágico Enviado!</h3>
                   <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                     Cheque a caixa de entrada de <strong>{email}</strong>. Clique no link seguro para ser autenticado instantaneamente.
                   </p>
                 </div>
                 <Button 
                   variant="ghost" 
                   className="mt-6 text-zinc-400 hover:text-white" 
                   onClick={() => setSent(false)}
                 >
                   Tentar outro e-mail
                 </Button>
              </div>
            ) : (
              <form
                className="space-y-5"
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
                    toast({ title: 'Falha na conexão segura', description: error.message, variant: 'destructive' });
                    return;
                  }

                  setSent(true);
                }}
              >
                <div className="space-y-3">
                  <Label htmlFor="portal-email" className="text-zinc-300 font-medium ml-1">Seu e-mail de viajante</Label>
                  <div className="relative">
                    <Input
                      id="portal-email"
                      type="email"
                      placeholder="viajante@email.com"
                      value={email}
                      className="h-14 bg-black/40 border-white/10 text-white placeholder:text-zinc-600 rounded-2xl px-5 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all font-medium"
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <Button 
                   type="submit" 
                   size="lg"
                   className="w-full h-14 rounded-2xl font-semibold tracking-wide text-base bg-white text-zinc-950 hover:bg-zinc-200 hover:scale-[1.02] transition-all" 
                   disabled={loading || !email.trim()}
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Gerando acesso...</>
                  ) : (
                    <><Sparkles className="mr-2 h-5 w-5 opacity-70" /> Acessar Meu Portal</>
                  )}
                </Button>

                <p className="text-center text-xs text-zinc-500 mt-6 font-medium">
                  Autenticação sem senha via Magic Link
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
