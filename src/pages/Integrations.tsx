import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Lock, Plug, CheckCircle2, AlertCircle, Loader2, KeyRound } from 'lucide-react';

export default function Integrations() {
  const { organization } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [wooba, setWooba] = useState({ client_id: '', client_secret: '', environment: 'sandbox', active: false });
  const [infotravel, setInfotravel] = useState({ api_key: '', environment: 'sandbox', active: false });

  useEffect(() => {
    async function loadCreds() {
      if (!organization?.id) return;
      try {
        const { data, error } = await supabase
          .from('b2b_credentials')
          .select('*')
          .eq('org_id', organization.id);
        
        if (error) throw error;
        
        const w = data.find(c => c.portal_name === 'wooba');
        if (w) setWooba({ client_id: w.username || '', client_secret: w.client_secret || '', environment: w.environment || 'sandbox', active: w.is_active });
        
        const it = data.find(c => c.portal_name === 'infotravel');
        if (it) setInfotravel({ api_key: it.api_key || '', environment: it.environment || 'sandbox', active: it.is_active });

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCreds();
  }, [organization?.id]);

  const saveCredentials = async (portal: string, payload: any) => {
    if (!organization?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('b2b_credentials')
        .upsert({
          org_id: organization.id,
          portal_name: portal,
          ...payload,
          updated_at: new Date().toISOString()
        }, { onConflict: 'org_id,portal_name' });

      if (error) throw error;
      toast({ title: 'Credenciais Salvas', description: `A integração com ${portal.toUpperCase()} foi atualizada com sucesso.` });
    } catch (err: any) {
      toast({ title: 'Erro ao Salvar', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AppLayout><div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-vj-green" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-vj-txt uppercase tracking-tighter flex items-center gap-3">
            <Plug className="w-6 h-6 text-vj-green" /> B2B API Gateway
          </h1>
          <p className="text-sm font-bold text-vj-txt3 mt-2">
            Configure as credenciais reais das consolidadoras para habilitar a busca e emissão no motor OMEGA.
            <br/><span className="text-rose-500">Atenção:</span> Sem chaves válidas, o motor Python interromperá a cotação.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* WOOBA */}
          <div className="bento-card bg-white p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <Plug className="w-32 h-32 text-vj-txt" />
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-vj-txt">Wooba Travel</h3>
                <p className="text-[10px] font-bold text-vj-txt3 uppercase tracking-widest mt-1">Conector REST v1</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full border border-vj-border">
                {wooba.active ? <CheckCircle2 className="w-3 h-3 text-vj-green" /> : <AlertCircle className="w-3 h-3 text-amber-500" />}
                <span className="text-[9px] font-black uppercase tracking-widest text-vj-txt2">{wooba.active ? 'Ativo' : 'Pendente'}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-vj-txt3 mb-1.5 block">Environment</label>
                <Select value={wooba.environment} onValueChange={(v) => setWooba({...wooba, environment: v})}>
                  <SelectTrigger className="h-12 rounded-xl bg-zinc-50 border-vj-border font-bold text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">Sandbox (Homologação)</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-vj-txt3 mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3 h-3" /> Client ID
                </label>
                <Input 
                  value={wooba.client_id}
                  onChange={e => setWooba({...wooba, client_id: e.target.value})}
                  className="h-12 rounded-xl bg-zinc-50 border-vj-border font-mono text-xs" 
                  placeholder="wooba_id_..."
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-vj-txt3 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3 h-3" /> Client Secret
                </label>
                <Input 
                  type="password"
                  value={wooba.client_secret}
                  onChange={e => setWooba({...wooba, client_secret: e.target.value})}
                  className="h-12 rounded-xl bg-zinc-50 border-vj-border font-mono text-xs" 
                  placeholder="••••••••••••••••"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button 
                  onClick={() => saveCredentials('wooba', { username: wooba.client_id, client_secret: wooba.client_secret, password_hash: 'managed_by_api', environment: wooba.environment, is_active: wooba.client_id.length > 0 })}
                  disabled={saving || !wooba.client_id}
                  className="premium-button h-10 px-6"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Conexão'}
                </Button>
              </div>
            </div>
          </div>

          {/* INFOTRAVEL */}
          <div className="bento-card bg-zinc-950 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <Plug className="w-32 h-32 text-white" />
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-white">Infotravel (Infotera)</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Conector SOAP/REST</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full border border-white/10">
                {infotravel.active ? <CheckCircle2 className="w-3 h-3 text-vj-green" /> : <AlertCircle className="w-3 h-3 text-amber-500" />}
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{infotravel.active ? 'Ativo' : 'Pendente'}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 block">Environment</label>
                <Select value={infotravel.environment} onValueChange={(v) => setInfotravel({...infotravel, environment: v})}>
                  <SelectTrigger className="h-12 rounded-xl bg-zinc-900 border-white/10 text-zinc-300 font-bold text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-white">
                    <SelectItem value="sandbox">Sandbox (Homologação)</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3 h-3" /> API Key (Token)
                </label>
                <Input 
                  type="password"
                  value={infotravel.api_key}
                  onChange={e => setInfotravel({...infotravel, api_key: e.target.value})}
                  className="h-12 rounded-xl bg-zinc-900 border-white/10 text-white font-mono text-xs focus-visible:ring-vj-green/20" 
                  placeholder="infotera_key_..."
                />
              </div>

              <div className="pt-2 flex justify-end mt-auto">
                <Button 
                  onClick={() => saveCredentials('infotravel', { api_key: infotravel.api_key, username: 'api_token', password_hash: 'managed_by_api', environment: infotravel.environment, is_active: infotravel.api_key.length > 0 })}
                  disabled={saving || !infotravel.api_key}
                  className="bg-vj-green hover:bg-vj-green/90 text-white  h-10 px-6 rounded-xl font-bold text-xs"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Conexão'}
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
