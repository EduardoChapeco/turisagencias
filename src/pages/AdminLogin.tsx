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

 // Removed inline dashboard. Redirects handled on success.

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
 useAuthStore.getState().setMasterAuthenticated(true);
 toast({ title: 'Acesso Liberado', description: 'Redirecionando para o Centro de Comando...' });
 navigate('/admin/dashboard');
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
