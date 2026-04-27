import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, X, Compass, Zap, Building2, ChevronLeft, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: plans, isLoading } = useSubscriptionPlans();

  return (
    <div className="min-h-screen bg-vj-bg text-vj-txt font-sans">
      <nav className="w-full bg-white/90 backdrop-blur-md  py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-vj-green rounded-lg flex items-center justify-center cursor-pointer" onClick={() => navigate('/')}>
              <Compass className="text-white h-5 w-5" />
            </div>
            <span className="font-black text-xl tracking-tighter">Turis AI</span>
          </div>
          <Button variant="ghost" onClick={() => navigate('/')} className="font-bold flex items-center">
            <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>
        </div>
      </nav>

      <section className="pt-20 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-vj-green/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-3xl mx-auto text-center mb-16 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Planos para escalar sua agência</h1>
          <p className="text-xl text-vj-txt2">Do freelancer à consolidadora B2B. Escolha o poder que você precisa.</p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {isLoading && <div className="col-span-3 py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-vj-green" /></div>}
          {!isLoading && plans?.map((plan, index) => {
            const isDark = plan.is_popular;
            
            return (
              <div key={plan.id} className={`p-8 rounded-3xl border flex flex-col transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 ${isDark ? 'bg-zinc-950 text-white border-zinc-800  relative' : 'bg-white border-zinc-200 hover:border-vj-green/50'}`} style={{ animationDelay: `${(index+1)*100}ms` }}>
                
                {isDark && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-vj-green text-white text-xs font-black uppercase px-4 py-1 rounded-full flex items-center gap-1  -green/20">
                    <Zap className="w-3 h-3" /> Mais Popular
                  </div>
                )}
                
                <h3 className={`font-black text-2xl mb-2 flex items-center gap-2 ${isDark ? '' : ''}`}>
                  {plan.name === 'Enterprise' && <Building2 className="w-5 h-5 text-vj-txt3" />} {plan.name}
                </h3>
                <p className={`${isDark ? 'text-zinc-400' : 'text-vj-txt2'} text-sm mb-6 h-10`}>{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-black">
                    {plan.price_monthly.toLocaleString('pt-BR', { style: 'currency', currency: plan.currency || 'BRL' }).replace(',00', '')}
                  </span>
                  <span className={isDark ? "text-zinc-500" : "text-vj-txt3"}>/mês</span>
                </div>
                
                <Button 
                  onClick={() => plan.name === 'Enterprise' ? window.location.href="mailto:contato@turis.app" : navigate(user ? '/' : '/signup')} 
                  variant={isDark ? "default" : "outline"}
                  className={`w-full rounded-xl h-12 font-bold mb-8 ${isDark ? 'premium-button' : 'border-2 hover:bg-zinc-50'}`}
                >
                  {plan.name === 'Enterprise' ? 'Falar com Vendas' : 'Começar Agora'}
                </Button>
                
                <div className="space-y-4 flex-1">
                  {plan.features?.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-medium">
                      <CheckCircle2 className={`w-5 h-5 shrink-0 ${plan.name === 'Enterprise' ? 'text-zinc-900' : 'text-vj-green'}`} /> 
                      <span className={isDark ? "text-zinc-200" : ""}>{f}</span>
                    </div>
                  ))}
                  {plan.missing_features?.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-medium text-zinc-400">
                      <X className="w-5 h-5 text-zinc-300 shrink-0" /> <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
      
      <footer className="py-8 text-center text-vj-txt3 text-sm border-t border-vj-border/60 bg-white">
        © {new Date().getFullYear()} Turis Agências (Turis AI). Todos os direitos reservados.
      </footer>
    </div>
  );
}
