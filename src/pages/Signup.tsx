import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Loader2, Sparkles, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Signup() {
 const navigate = useNavigate();
 const { toast } = useToast();
 const [firstName, setFirstName] = useState('');
 const [lastName, setLastName] = useState('');
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [loading, setLoading] = useState(false);

 return (
 <div className="flex min-h-screen bg-white">
 {/* Left Column: Form */}
 <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative z-10">
 <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
 <div className="text-center md:text-left">
 <div className="mx-auto md:mx-0 mb-6 h-11 w-11 flex items-center justify-center rounded-xl bg-vj-bg-dark border border-white/5">
 <Zap className="h-5 w-5 text-vj-green fill-vj-green" />
 </div>
 <h1 className="text-3xl font-black tracking-tight mb-2">Criar sua conta Turis</h1>
 <p className="text-vj-txt3 text-sm font-medium">
 Junte-se às agências mais produtivas do Brasil.
 </p>
 </div>

 <form
 className="space-y-5"
 onSubmit={async (event) => {
 event.preventDefault();
 setLoading(true);
 const { error } = await supabase.auth.signUp({
 email,
 password,
 options: {
 data: { first_name: firstName, last_name: lastName },
 emailRedirectTo: window.location.origin,
 },
 });
 setLoading(false);

 if (error) {
 toast({ title: 'Erro ao criar conta', description: error.message, variant: 'destructive' });
 return;
 }

 toast({ title: 'Conta criada!', description: 'Verifique seu e-mail para confirmar.' });
 navigate('/login');
 }}
 >
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label htmlFor="firstName" className="font-bold text-zinc-700">Nome</Label>
 <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="João" className="h-12 bg-zinc-50 border-zinc-200" required />
 </div>
 <div className="space-y-2">
 <Label htmlFor="lastName" className="font-bold text-zinc-700">Sobrenome</Label>
 <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Silva" className="h-12 bg-zinc-50 border-zinc-200" required />
 </div>
 </div>

 <div className="space-y-2">
 <Label htmlFor="email" className="font-bold text-zinc-700">E-mail Profissional</Label>
 <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@agencia.com.br" className="h-12 bg-zinc-50 border-zinc-200" required />
 </div>

 <div className="space-y-2">
 <Label htmlFor="password" className="font-bold text-zinc-700">Senha segura</Label>
 <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="h-12 bg-zinc-50 border-zinc-200" required minLength={6} />
 </div>

 <Button type="submit" className="w-full premium-button h-12 text-base mt-4" disabled={loading}>
 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar minha agência grátis'}
 </Button>
 </form>

 <p className="text-center text-sm font-medium text-zinc-500 pt-6 border-t border-zinc-100">
 Já tem uma conta? <Link to="/login" className="text-vj-green hover:underline font-bold">Entrar agora</Link>
 </p>
 </div>
 </div>

 {/* Right Column: Animated Showcase */}
 <div className="hidden lg:flex w-1/2 bg-zinc-950 flex-col items-center justify-center p-12 relative overflow-hidden">
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-vj-green/10 blur-[120px] rounded-full pointer-events-none" />
 
 <div className="max-w-lg z-10 space-y-8 animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
 <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-start gap-4 opacity-80 scale-95 -translate-x-4">
 <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
 <Sparkles className="w-6 h-6 text-orange-400" />
 </div>
 <div>
 <p className="text-zinc-300 font-medium mb-2">"A Turis AI analisa as políticas das companhias aéreas enquanto eu durmo. As notificações automatizadas no WhatsApp salvaram uma venda de R$ 50k."</p>
 <span className="text-orange-400 font-bold text-sm">— Consultora de Luxo</span>
 </div>
 </div>
 
 <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-start gap-4">
 <div className="w-12 h-12 rounded-full bg-vj-green/20 flex items-center justify-center shrink-0">
 <Building2 className="w-6 h-6 text-vj-green" />
 </div>
 <div>
 <p className="text-zinc-300 font-medium mb-2">"Abandonamos 5 ferramentas diferentes. CRM, Financeiro, Emissões e Portais dos Viajantes... tudo integrado na Turis. Reduzimos custos em 40%."</p>
 <span className="text-vj-green font-bold text-sm">— CEO da TMC Consolidadora</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

