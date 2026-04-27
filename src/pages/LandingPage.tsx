import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Globe2, Sparkles, Zap, ShieldCheck, ChevronRight, LayoutDashboard, Compass, Bot, Plane } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-vj-bg text-vj-txt font-sans">
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md  py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-vj-green rounded-xl flex items-center justify-center">
              <Compass className="text-white h-6 w-6" />
            </div>
            <span className="font-black text-xl tracking-tighter">Turis AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-vj-txt2">
            <a href="#features" className="hover:text-vj-green transition-colors">Recursos</a>
            <a href="#ai" className="hover:text-vj-green transition-colors">Agente Inteligente</a>
            <a href="#pricing" className="hover:text-vj-green transition-colors">Planos</a>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Button onClick={() => navigate('/')} className="premium-button rounded-xl px-6">
                Acessar Painel <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')} className="font-bold hidden sm:flex">Login</Button>
                <Button onClick={() => navigate('/signup')} className="premium-button rounded-xl px-6">Começar Grátis</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-[0.03] pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-vj-green/10 text-vj-green font-bold text-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4" /> Nova versão da plataforma disponível
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            A plataforma definitiva para <br className="hidden md:block"/>
            <span className="highlight-text">Agências de Viagem do Futuro.</span>
          </h1>
          <p className="text-xl text-vj-txt2 mb-10 max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Cotações em segundos, portais dinâmicos para clientes e um Motor de Inteligência Artificial que trabalha 24/7 para sua agência vender mais.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Button onClick={() => navigate(user ? '/' : '/signup')} className="premium-button h-14 px-8 text-lg w-full sm:w-auto rounded-2xl">
              Transformar minha Agência
            </Button>
            <Button variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto rounded-2xl border-2 border-vj-border bg-white/50 backdrop-blur-sm font-bold hover:bg-white hover:text-vj-green">
              Falar com Especialista
            </Button>
          </div>
        </div>

        {/* Bento Grid Preview */}
        <div className="max-w-6xl mx-auto mt-20 relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          <div className="absolute inset-0 bg-gradient-to-t from-vj-bg via-transparent to-transparent z-10" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-80 rotate-1 scale-95 hover:rotate-0 hover:scale-100 transition-all duration-500">
            <div className="col-span-2 bento-card bg-white p-6 h-64 border border-vj-border/60 flex flex-col">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><LayoutDashboard className="text-vj-green" /> Painel de Vendas (Kanban)</h3>
              <div className="flex-1 rounded-xl bg-zinc-50 border border-zinc-100 p-4">
                 <div className="flex gap-4">
                    <div className="w-1/3 h-32 bg-white rounded-lg  border border-zinc-100 p-2 space-y-2">
                       <div className="h-4 w-1/2 bg-zinc-200 rounded" />
                       <div className="h-16 w-full bg-zinc-50 rounded border border-zinc-100" />
                       <div className="h-16 w-full bg-zinc-50 rounded border border-zinc-100" />
                    </div>
                    <div className="w-1/3 h-32 bg-white rounded-lg  border border-zinc-100 p-2 space-y-2">
                       <div className="h-4 w-1/2 bg-zinc-200 rounded" />
                       <div className="h-16 w-full bg-zinc-50 rounded border border-zinc-100" />
                    </div>
                 </div>
              </div>
            </div>
            <div className="bento-card bg-zinc-950 p-6 h-64 border border-zinc-800 text-white flex flex-col">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Bot className="text-vj-green" /> Motor Turis AI</h3>
              <p className="text-zinc-400 text-sm mb-4">Análise automática de PDFs e conversão em Cotações.</p>
              <div className="mt-auto h-20 bg-zinc-900 rounded-xl border border-zinc-800 p-3 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-vj-green/20 flex items-center justify-center animate-pulse"><Sparkles className="w-4 h-4 text-vj-green" /></div>
                 <div className="space-y-1.5 flex-1">
                   <div className="h-2 w-3/4 bg-zinc-700 rounded" />
                   <div className="h-2 w-1/2 bg-zinc-800 rounded" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Tudo que sua agência precisa.</h2>
            <p className="text-vj-txt2 text-lg">Substitua dezenas de planilhas e sistemas lentos por uma única plataforma inteligente.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {[
               { icon: Globe2, title: 'Portal do Viajante', desc: 'Seu cliente acessa vouchers, roteiros e informações da viagem em um portal web dinâmico.' },
               { icon: Zap, title: 'Extração por IA', desc: 'Faça upload do PDF da operadora e nossa IA cria a cotação e o roteiro automaticamente.' },
               { icon: ShieldCheck, title: 'Auditor de Embarque', desc: 'O sistema verifica proativamente as regras de viagem e notifica sua equipe de pendências.' },
               { icon: Plane, title: 'Gestão Completa', desc: 'De cotações a grupos de excursão, frotas de ônibus e financeiro. Tudo em um só lugar.' },
             ].map((f, i) => (
               <div key={i} className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100 hover: hover:-green/5 transition-all group">
                 <div className="w-12 h-12 bg-white rounded-2xl  flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   <f.icon className="w-6 h-6 text-vj-green" />
                 </div>
                 <h3 className="font-bold text-xl mb-3">{f.title}</h3>
                 <p className="text-vj-txt2 leading-relaxed">{f.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-6 bg-vj-bg relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-vj-green/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-6">Pronto para modernizar sua agência?</h2>
          <p className="text-xl text-vj-txt2 mb-10">Junte-se às agências mais inovadoras e comece a escalar suas vendas com a Turis AI.</p>
          <Button onClick={() => navigate('/signup')} className="premium-button h-16 px-10 text-xl rounded-full  -green/30">
            Criar Conta Gratuitamente
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 text-center text-vj-txt3 text-sm border-t border-vj-border/60 bg-white">
        © {new Date().getFullYear()} Turis Agências (Turis AI). Todos os direitos reservados.
      </footer>
    </div>
  );
}
