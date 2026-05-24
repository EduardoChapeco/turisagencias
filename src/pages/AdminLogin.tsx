import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // If not logged in as a normal user first, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If already authenticated via PIN, show the actual admin dashboard
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
              <ShieldAlert className="text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Centro de Comando Global</h1>
              <p className="text-zinc-400 text-sm">Acesso nível Deus ativado.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="font-semibold text-lg mb-4">Métricas Globais</h2>
              <p className="text-zinc-500 text-sm">Dashboard em construção (Sprint E)</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="font-semibold text-lg mb-4">Gestão de Orgs</h2>
              <p className="text-zinc-500 text-sm">Controle de clientes em construção (Sprint E)</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="font-semibold text-lg mb-4">Motor de IA</h2>
              <p className="text-zinc-500 text-sm">Monitor de esquadrões em construção (Sprint E)</p>
            </div>
          </div>
          
          <Button 
            className="mt-8 bg-zinc-800 hover:bg-zinc-700"
            onClick={() => setIsAuthenticated(false)}
          >
            Encerrar Sessão Global
          </Button>
        </div>
      </div>
    );
  }

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 8) {
      toast({ title: 'PIN Inválido', description: 'O PIN deve ter exatamente 8 dígitos.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // In a real production environment, this calls the edge function.
      // But since we are local/pages and might not have Edge Functions fully deployed right now,
      // we can do a direct DB check via an RPC function to avoid frontend exposure.
      // For now, since we created the Edge function `admin-auth`, let's invoke it.
      
      // O cabeçalho Authorization com JWT é inserido automaticamente pelo cliente do Supabase
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: { pin }
      });

      if (error) {
        // Obter mensagem de erro detalhada se houver
        let errorMsg = 'PIN incorreto ou usuário não autorizado.';
        try {
          const errData = JSON.parse(await error.response.text());
          if (errData?.error) errorMsg = errData.error;
        } catch {
          if (error.message) errorMsg = error.message;
        }
        toast({ title: 'Acesso Negado', description: errorMsg, variant: 'destructive' });
      } else if (!data?.success) {
        toast({ title: 'Acesso Negado', description: 'PIN incorreto ou usuário não autorizado.', variant: 'destructive' });
      } else {
        setIsAuthenticated(true);
        toast({ title: 'Acesso Liberado', description: 'Bem-vindo ao Centro de Comando.' });
      }
    } catch (err: any) {
      toast({ title: 'Erro de comunicação', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 mb-4">
            <Lock className="w-6 h-6 text-red-500/80" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-widest uppercase">Admin Restrito</h1>
          <p className="text-zinc-500 text-sm mt-2">Autenticação de Fator Duplo Obrigatória</p>
        </div>

        <form onSubmit={handlePinSubmit} className="space-y-4">
          <Input
            type="password"
            inputMode="numeric"
            maxLength={8}
            placeholder="••••••••"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className="h-14 text-center text-2xl tracking-[0.5em] bg-zinc-900/50 border-zinc-800 text-white focus:border-red-500/50 focus:ring-red-500/50 transition-all rounded-xl"
            autoFocus
          />
          <Button 
            type="submit" 
            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold tracking-wide rounded-xl gap-2"
            disabled={loading || pin.length !== 8}
          >
            {loading ? 'Verificando...' : 'Autenticar'} <ArrowRight size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
}
