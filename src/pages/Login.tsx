import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Cloud, Loader2, ShieldCheck, TriangleAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type BridgeState = 'loading' | 'redirecting' | 'error';

function isValidRedirectUri(value: string | null) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.endsWith('.chromiumapp.org');
  } catch {
    return false;
  }
}

function encodePayload(payload: unknown) {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function friendlyBridgeMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || '');
  if (/Unauthorized/i.test(message)) return 'Sua sessão expirou. Entre novamente para autorizar a extensão.';
  if (/redirect/i.test(message)) return 'O retorno informado pela extensão é inválido.';
  return message || 'Não foi possível concluir a autorização da extensão.';
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { isLoading, user } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [bridgeState, setBridgeState] = useState<BridgeState>('loading');
  const [bridgeMessage, setBridgeMessage] = useState('Validando sua sessão na plataforma...');

  const returnTo = searchParams.get('returnTo');
  const targetPath = returnTo && returnTo.startsWith('/') ? returnTo : '/';
  const redirectUri = searchParams.get('redirect_uri');
  const source = searchParams.get('source') || 'turis-whatsapp-extension';
  const wantsExtensionFlow = Boolean(redirectUri || searchParams.get('extension_id') || searchParams.get('source'));
  const safeRedirect = useMemo(() => isValidRedirectUri(redirectUri), [redirectUri]);

  useEffect(() => {
    if (isLoading || !user || !wantsExtensionFlow) return;

    if (!safeRedirect) {
      setBridgeState('error');
      setBridgeMessage('O retorno solicitado pela extensão é inválido ou não foi informado.');
      return;
    }

    let cancelled = false;

    const bootstrap = async () => {
      try {
        setBridgeState('loading');
        setBridgeMessage('Autorizando a extensão com a sua conta...');

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error('Sessão indisponível para autorização da extensão.');
        }

        const { data, error } = await supabase.functions.invoke('extension-bootstrap', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) throw error;
        if (cancelled) return;

        const payload = {
          ...((data && typeof data === 'object') ? data : {}),
          app_url: window.location.origin,
          token: session.access_token,
          org_id: (data as Record<string, any>)?.orgId || (data as Record<string, any>)?.org_id || null,
          user_name: (data as Record<string, any>)?.agentName || (data as Record<string, any>)?.user_name || user.email || 'Equipe',
          user_email: (data as Record<string, any>)?.email || user.email || null,
          backend: {
            ...(((data as Record<string, any>)?.backend && typeof (data as Record<string, any>).backend === 'object') ? (data as Record<string, any>).backend : {}),
            supabase_access_token: session.access_token,
          },
          raw: {
            source,
            issued_at: new Date().toISOString(),
          },
        };

        const callbackUrl = new URL(redirectUri!);
        callbackUrl.searchParams.set('payload', encodePayload(payload));

        setBridgeState('redirecting');
        setBridgeMessage('Redirecionando de volta para a extensão...');
        window.location.replace(callbackUrl.toString());
      } catch (error) {
        if (cancelled) return;
        setBridgeState('error');
        setBridgeMessage(friendlyBridgeMessage(error));
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [isLoading, redirectUri, safeRedirect, source, user, wantsExtensionFlow]);

  if (!isLoading && user && !wantsExtensionFlow) {
    return <Navigate to={targetPath} replace />;
  }

  if (!isLoading && user && wantsExtensionFlow) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-vj-green text-vj-green-foreground">
              {bridgeState === 'error' ? <TriangleAlert className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
            </div>
            <CardTitle className="font-heading text-2xl">Conectar extensão</CardTitle>
            <CardDescription>
              A autorização acontece na sua sessão atual da plataforma e volta direto para o painel do WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
              {bridgeState !== 'error' && <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin text-accent" />}
              {bridgeMessage}
            </div>

            {bridgeState === 'error' && (
              <div className="flex flex-col gap-2">
                <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
                <Button variant="outline" onClick={() => window.location.replace('/')}>
                  Voltar para a plataforma
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-vj-green">
            <Cloud className="h-6 w-6 text-vj-green-foreground" />
          </div>
          <CardTitle className="font-heading text-2xl">Turis Agências</CardTitle>
          <CardDescription>
            {wantsExtensionFlow ? 'Entre na sua conta para conectar a extensão ao WhatsApp.' : 'Entre na sua conta para continuar.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setLoading(true);
              const { error } = await supabase.auth.signInWithPassword({ email, password });
              setLoading(false);

              if (error) {
                toast({ title: 'Erro ao entrar', description: error.message, variant: 'destructive' });
                return;
              }

              if (!wantsExtensionFlow) {
                navigate(targetPath, { replace: true });
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {!wantsExtensionFlow && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Não tem conta? <Link to="/signup" className="text-accent hover:underline">Criar conta</Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
