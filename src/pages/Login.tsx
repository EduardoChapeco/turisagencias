import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
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

function buildExtensionPayload(data: Record<string, any> | null | undefined, userEmail: string | null, source: string) {
  const backend = data?.backend && typeof data.backend === 'object' ? data.backend : {};
  return {
    app_url: window.location.origin,
    org_id: data?.orgId || data?.org_id || null,
    user_name: data?.agentName || data?.user_name || userEmail || 'Equipe',
    user_email: data?.email || userEmail || null,
    supabase_url: backend.supabase_url || data?.supabase_url || null,
    supabase_anon_key: backend.supabase_anon_key || data?.supabase_anon_key || null,
    extension_session: data?.extension_session || null,
    backend: {
      supabase_url: backend.supabase_url || data?.supabase_url || null,
      supabase_anon_key: backend.supabase_anon_key || data?.supabase_anon_key || null,
      sync_url: backend.sync_url || data?.sync_url || null,
      quotation_url: backend.quotation_url || data?.quotation_url || null,
      extension_session_required: Boolean(backend.extension_session_required ?? true),
    },
    raw: {
      source,
      issued_at: new Date().toISOString(),
    },
  };
}

function redirectToExtension(redirectUri: string, payload?: unknown, error?: string) {
  const callbackUrl = new URL(redirectUri);
  if (payload) {
    callbackUrl.searchParams.set('payload', encodePayload(payload));
  }
  if (error) {
    callbackUrl.searchParams.set('error', error);
  }
  window.location.replace(callbackUrl.toString());
}

export default function Login() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { isLoading, user } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authSyncing, setAuthSyncing] = useState(false);
  const [bridgeState, setBridgeState] = useState<BridgeState>('loading');
  const [bridgeMessage, setBridgeMessage] = useState('Validando sua sessão na plataforma...');

  const returnTo = searchParams.get('returnTo');
  const targetPath = returnTo && returnTo.startsWith('/') ? returnTo : '/';
  const redirectUri = searchParams.get('redirect_uri');
  const source = searchParams.get('source') || 'turis-whatsapp-extension';
  const extensionId = searchParams.get('extension_id') || '';
  const wantsExtensionFlow = Boolean(redirectUri || searchParams.get('extension_id') || searchParams.get('source'));
  const safeRedirect = useMemo(() => isValidRedirectUri(redirectUri), [redirectUri]);

  useEffect(() => {
    if (!isLoading && user) setAuthSyncing(false);
  }, [isLoading, user]);

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
            'x-extension-id': extensionId,
            'x-extension-source': source,
            'x-platform-app-url': window.location.origin,
          },
        });

        if (error) throw error;
        if (cancelled) return;

        const payload = buildExtensionPayload(
          (data && typeof data === 'object') ? data as Record<string, any> : null,
          user.email || null,
          source,
        );

        setBridgeState('redirecting');
        setBridgeMessage('Redirecionando de volta para a extensão...');
        redirectToExtension(redirectUri!, payload);
      } catch (error) {
        if (cancelled) return;
        const friendlyMessage = friendlyBridgeMessage(error);
        setBridgeState('error');
        setBridgeMessage(friendlyMessage);
        redirectToExtension(redirectUri!, undefined, friendlyMessage);
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [extensionId, isLoading, redirectUri, safeRedirect, source, user, wantsExtensionFlow]);

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
    <div className="flex min-h-screen bg-white">
      {/* Left Column: Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative z-10">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center md:text-left">
            <div className="mx-auto md:mx-0 mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-vj-green">
              <Cloud className="h-6 w-6 text-zinc-950" />
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">Bem-vindo de volta</h1>
            <p className="text-zinc-500">
              {wantsExtensionFlow ? 'Entre na sua conta para conectar a extensão ao WhatsApp.' : 'Acesse seu painel inteligente para gerenciar suas operações.'}
            </p>
          </div>

          <form
            className="space-y-5"
            onSubmit={async (event) => {
              event.preventDefault();
              setLoading(true);
              setAuthSyncing(false);
              const { error } = await supabase.auth.signInWithPassword({ email, password });
              setLoading(false);

              if (error) {
                toast({ title: 'Erro ao entrar', description: error.message, variant: 'destructive' });
                return;
              }

              setAuthSyncing(true);
              if (!wantsExtensionFlow) {
                window.location.assign(targetPath);
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold text-zinc-700">E-mail Profissional</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@agencia.com.br" className="h-12 bg-zinc-50 border-zinc-200" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-bold text-zinc-700">Senha</Label>
                <a href="#" className="text-sm font-bold text-vj-green hover:underline">Esqueceu a senha?</a>
              </div>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-12 bg-zinc-50 border-zinc-200" required />
            </div>
            <Button type="submit" className="w-full premium-button h-12 text-base mt-4" disabled={loading || authSyncing}>
              {loading || authSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar na Plataforma'}
            </Button>
            {authSyncing && (
              <p className="text-center text-xs font-bold text-zinc-500">
                Validando acesso e carregando organizacao...
              </p>
            )}
          </form>

          {!wantsExtensionFlow && (
            <p className="text-center text-sm font-medium text-zinc-500 pt-6 border-t border-zinc-100">
              Ainda não tem uma conta? <Link to="/signup" className="text-vj-green hover:underline font-bold">Criar minha conta grátis</Link>
            </p>
          )}
        </div>
      </div>

      {/* Right Column: Animated Showcase */}
      <div className="hidden lg:flex w-1/2 bg-zinc-950 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-vj-green/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-lg z-10 space-y-8 animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-vj-green/20 flex items-center justify-center shrink-0">
              <Cloud className="w-6 h-6 text-vj-green" />
            </div>
            <div>
              <p className="text-zinc-300 font-medium mb-2">"A extração de PDF me economiza 4 horas por dia. O que antes eu digitava a mão, a Turis AI lê o PDF da CVC e monta o link do cliente em 3 segundos."</p>
              <span className="text-vj-green font-bold text-sm">— Consultora de Viagens</span>
            </div>
          </div>
          
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-start gap-4 opacity-80 scale-95 translate-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-zinc-300 font-medium mb-2">"Auditor de Embarque é surreal. Ele avisa meu time se falta RG ou passaporte 48h antes do voo. Zeramos os problemas de aeroporto."</p>
              <span className="text-blue-400 font-bold text-sm">— Gestor Operacional</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
