import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Shield, Mail } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useB2bCredentials, useSaveB2bCredential, useEmailInbound } from '@/hooks/useB2bCredentials';

export function IntegrationsTab() {
  const { data: creds, isLoading: credsLoading } = useB2bCredentials();
  const saveB2b = useSaveB2bCredential();
  const { data: emails, isLoading: emailsLoading } = useEmailInbound(20);

  const [b2bPortal, setB2bPortal] = useState('orinter');
  const [b2bUser, setB2bUser] = useState('');
  const [b2bPass, setB2bPass] = useState('');

  const handleSaveB2b = async () => {
    if (!b2bUser.trim() || !b2bPass.trim()) return;
    await saveB2b.mutateAsync({ portal_name: b2bPortal, username: b2bUser, password: b2bPass });
    setB2bUser(''); setB2bPass('');
  };

  const intentBadge: Record<string, string> = {
    new_lead: 'bg-vj-green/10 text-vj-green',
    ticket_reply: 'bg-blue-50 text-blue-600',
    operator_invoice: 'bg-yellow-50 text-yellow-700',
    '2fa_code': 'bg-red-50 text-red-600',
    other: 'bg-zinc-100 text-zinc-500',
  };
  const intentLabel: Record<string, string> = {
    new_lead: '✈ Novo Lead', ticket_reply: '↩ Resposta', operator_invoice: '📄 Fatura', '2fa_code': '🔑 2FA Code', other: 'Outro'
  };

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Cofre B2B */}
        <Card className="premium-card overflow-hidden">
          <div className="p-1.5 bg-zinc-950 text-white font-mono text-[10px] text-center uppercase tracking-widest flex items-center justify-center gap-2">
            <Shield className="w-3 h-3 text-vj-green" /> Cofre de Credenciais RPA
          </div>
          <CardHeader>
            <CardTitle className="text-lg">Portais B2B (Orinter/Flytour)</CardTitle>
            <CardDescription>Credenciais usadas pelo Playwright para cotar e emitir pacotes automaticamente.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Portal</Label>
              <Select value={b2bPortal} onValueChange={setB2bPortal}>
                <SelectTrigger className="h-12 rounded-2xl border-zinc-100 bg-zinc-50 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orinter">Orinter / Infotravel</SelectItem>
                  <SelectItem value="flytour">Flytour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Usuário B2B</Label>
              <Input placeholder="usuario.agencia@operadora.com.br" value={b2bUser} onChange={e => setB2bUser(e.target.value)} className="h-12 rounded-2xl border-zinc-100 bg-zinc-50" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Senha / Token de Acesso</Label>
              <Input type="password" placeholder="••••••••••••••••" value={b2bPass} onChange={e => setB2bPass(e.target.value)} className="h-12 rounded-2xl border-zinc-100 bg-zinc-50" />
            </div>
            <Button className="w-full premium-button h-12" onClick={handleSaveB2b} disabled={!b2bUser || !b2bPass || saveB2b.isPending}>
              {saveB2b.isPending ? 'Salvando no Cofre...' : 'Salvar Credencial Segura'}
            </Button>
            {/* Lista de Credenciais Salvas */}
            {!credsLoading && creds && creds.length > 0 && (
              <div className="pt-3 border-t border-zinc-100 space-y-2">
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Acessos Ativos</p>
                {creds.map((c: any) => (
                  <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                    <div className="h-2 w-2 rounded-full bg-vj-green animate-pulse" />
                    <span className="text-xs font-bold uppercase flex-1">{c.portal_name}</span>
                    <span className="text-xs text-muted-foreground">{c.username}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gmail / Webhook info */}
        <Card className="premium-card overflow-hidden">
          <div className="p-1.5 bg-blue-600 text-white font-mono text-[10px] text-center uppercase tracking-widest">
            Endpoint da Extensão Gmail (Leitura Inteligente)
          </div>
          <CardHeader>
            <CardTitle className="text-lg">Integração Gmail + 2FA Automático</CardTitle>
            <CardDescription>Cole este webhook na sua extensão do Chrome. A IA classifica cada e-mail e age: cria leads, responde tickets, captura códigos 2FA da Orinter.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-zinc-950 p-4 rounded-2xl">
              <code className="text-[11px] font-mono select-all break-all text-vj-green block">
                https://xhdoupxnpjbzkzuhucpp.supabase.co/functions/v1/email-webhook-ingest
              </code>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {['✈ Novo Lead → Kanban', '🔑 2FA → Python RPA', '↩ Reply → Ticket'].map(label => (
                <div key={label} className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <p className="text-[10px] font-bold text-vj-txt leading-tight">{label}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground italic">
              Versão v3 da edge function ativa — classifica com IA em tempo real + Regex Fallback sem custo.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feed de Emails Inbound */}
      <Card className="premium-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-500" /> Caixa de Entrada Inteligente
          </CardTitle>
          <CardDescription>Emails recebidos e classificados automaticamente pela IA da Turis.</CardDescription>
        </CardHeader>
        <CardContent>
          {emailsLoading ? <Skeleton className="h-40 w-full" /> :
            !emails?.length ? (
              <div className="text-center py-16 opacity-30">
                <Mail size={48} className="mx-auto mb-3" />
                <p className="text-sm">Nenhum email ingerido ainda. Configure o Webhook acima.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2 scrollbar-none">
                {emails.map((em: any) => (
                  <div key={em.id} className="flex items-start gap-4 p-4 rounded-2xl border border-zinc-100 bg-zinc-50 hover:bg-white transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${intentBadge[em.ai_intent] ?? intentBadge.other}`}>
                          {intentLabel[em.ai_intent] ?? 'Outro'}
                        </span>
                        <span className="text-[10px] text-zinc-400">{em.sender_email}</span>
                        {em.ai_confidence && <span className="text-[9px] font-mono text-zinc-400">{(em.ai_confidence * 100).toFixed(0)}% conf.</span>}
                      </div>
                      <p className="text-xs font-bold text-zinc-800 truncate">{em.subject}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5 truncate">{em.ai_summary}</p>
                    </div>
                    <p className="text-[9px] text-zinc-400 flex-shrink-0 pt-1">
                      {new Date(em.received_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            )
          }
        </CardContent>
      </Card>
    </div>
  );
}
