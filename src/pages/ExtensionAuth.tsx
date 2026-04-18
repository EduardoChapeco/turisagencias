import { useEffect, useMemo, useState } from 'react';
import { Loader2, ShieldCheck, TriangleAlert } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

function friendlyMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || '');
  if (/Unauthorized/i.test(message)) return 'Sua sessão expirou. Entre novamente para autorizar a extensão.';
  if (/redirect/i.test(message)) return 'O retorno informado pela extensão é inválido.';
  return message || 'Não foi possível concluir a autorização da extensão.';
}

export default function ExtensionAuth() {
  const location = useLocation();
  const { user, isLoading } = useAuthStore();
  const [bridgeState, setBridgeState] = useState<BridgeState>('loading');
  const [message, setMessage] = useState('Validando sua sessão na plataforma...');

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const redirectUri = params.get('redirect_uri');
  const source = params.get('source') || 'turis-whatsapp-extension';
  const safeRedirect = isValidRedirectUri(redirectUri);
  const returnTo = useMemo(
    () => `/auth/chrome-extension${location.search}`,
    [location.search],
  );

  useEffect(() => {
    if (isLoading) return;

    if (!safeRedirect) {
      setBridgeState('error');
      setMessage('O retorno solicitado pela extensão é inválido ou não foi informado.');
      return;
    }

    if (!user) {
      window.location.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    let cancelled = false;

    const bootstrap = async () => {
      try {
        setBridgeState('loading');
        setMessage('Autorizando a extensão com a sua conta...');

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
        setMessage('Redirecionando de volta para a extensão...');
        window.location.replace(callbackUrl.toString());
      } catch (error) {
        if (cancelled) return;
        setBridgeState('error');
        setMessage(friendlyMessage(error));
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [isLoading, redirectUri, returnTo, safeRedirect, source, user]);

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
            {message}
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
