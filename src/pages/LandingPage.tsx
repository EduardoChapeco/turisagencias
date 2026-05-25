import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe2, Sparkles, Zap, ShieldCheck, ChevronRight,
  LayoutDashboard, Compass, Bot, Plane, FileText,
  Users, TrendingUp, ArrowRight, Check, Star,
  MessageSquare, MapPin, CreditCard
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

// ── Feature Card ──
function FeatureCard({ icon: Icon, title, desc, tag }: { icon: React.ComponentType<{ className?: string }>, title: string, desc: string, tag?: string }) {
  return (
    <div className="group relative bg-white border border-vj-border rounded-2xl p-6 hover:border-vj-green/40 hover:-translate-y-0.5 transition-all duration-200 cursor-default">
      {tag && (
        <span className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-[0.15em] px-2 py-1 rounded-full bg-vj-green/10 text-vj-green">
          {tag}
        </span>
      )}
      <div className="h-11 w-11 rounded-xl bg-vj-green/8 border border-vj-green/20 flex items-center justify-center mb-5 group-hover:bg-vj-green/12 transition-colors">
        <Icon className="h-5 w-5 text-vj-green" />
      </div>
      <h3 className="font-bold text-[15px] text-vj-txt mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-vj-txt2 leading-relaxed">{desc}</p>
    </div>
  );
}

// ── Stat Badge ──
function StatBadge({ value, label }: { value: string, label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-6 py-4 rounded-2xl bg-white border border-vj-border">
      <span className="text-2xl font-black text-vj-txt tracking-tight">{value}</span>
      <span className="text-[11px] font-bold text-vj-txt3 uppercase tracking-[0.12em]">{label}</span>
    </div>
  );
}

// ── Testimonial Card ──
function TestimonialCard({ quote, name, role, highlight }: { quote: string, name: string, role: string, highlight?: string }) {
  return (
    <div className="bg-white border border-vj-border rounded-2xl p-6 hover:border-vj-green/30 transition-all duration-200">
      <div className="flex gap-0.5 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 text-vj-yellow fill-vj-yellow" />
        ))}
      </div>
      <p className="text-sm text-vj-txt2 leading-relaxed mb-4">"{quote}"</p>
      {highlight && (
        <div className="mb-4 px-3 py-2 rounded-xl bg-vj-green/8 border border-vj-green/20">
          <p className="text-xs font-bold text-vj-green">{highlight}</p>
        </div>
      )}
      <div className="flex items-center gap-3 pt-4 border-t border-vj-border">
        <div className="h-8 w-8 rounded-full bg-vj-bg-dark flex items-center justify-center text-white text-xs font-black">
          {name[0]}
        </div>
        <div>
          <p className="text-xs font-black text-vj-txt">{name}</p>
          <p className="text-[10px] text-vj-txt3 font-bold uppercase tracking-widest mt-0.5">{role}</p>
        </div>
      </div>
    </div>
  );
}

const features = [
  { icon: FileText, title: 'Cotações por IA em Segundos', desc: 'Faça upload do PDF da operadora. A IA lê, extrai e monta a proposta completa com itinerário, hotéis e valores.', tag: 'IA' },
  { icon: Globe2, title: 'Portal do Viajante', desc: 'Cada cliente acessa vouchers, roteiros, checklists e informações da viagem num portal web premium com a sua marca.' },
  { icon: ShieldCheck, title: 'Auditor de Embarque', desc: 'Verificação automática de documentos, vistos e regras 48h antes do voo. Sua equipe é notificada de pendências.' },
  { icon: LayoutDashboard, title: 'Funil de Vendas Kanban', desc: 'Visualize e mova oportunidades entre etapas. Do lead à conversão, tudo num Kanban intuitivo e em tempo real.' },
  { icon: Plane, title: 'Gestão de Grupos', desc: 'Pacotes, excursões, frotas de ônibus e controle de pax por assento. Tudo integrado ao financeiro e contratos.' },
  { icon: MessageSquare, title: 'WhatsApp Inteligente', desc: 'Envie propostas, cobranças e roteiros direto pelo WhatsApp com links rastreáveis e mensagens personalizadas.' },
  { icon: CreditCard, title: 'Financeiro Integrado', desc: 'Controle de parcelas, conciliação automática, notificações de vencimento e relatórios por agente.' },
  { icon: Bot, title: 'Motor de IA Próprio', desc: 'Agentes especializados em turismo analisam seus dados, sugerem abordagens e automatizam tarefas repetitivas.' },
];

const testimonials = [
  {
    quote: 'A extração de PDF me economiza 4 horas por dia. O que antes eu digitava a mão, a Turis AI lê o PDF da CVC e monta o link do cliente em 3 segundos.',
    name: 'Mariana L.',
    role: 'Consultora de Viagens',
    highlight: '4h economizadas por dia',
  },
  {
    quote: 'O Auditor de Embarque é surreal. Ele avisa meu time se falta RG ou passaporte 48h antes do voo. Zeramos os problemas no aeroporto.',
    name: 'Ricardo M.',
    role: 'Gestor Operacional',
    highlight: '0 problemas no embarque',
  },
  {
    quote: 'O portal do cliente é lindo e profissional. Parece que a agência tem um app próprio. Os clientes amam e ficam impressionados.',
    name: 'Juliana P.',
    role: 'Diretora Comercial',
    highlight: 'NPS aumentou 40pts',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-vj-bg text-vj-txt font-sans">

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl border-b border-vj-border' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-[68px] flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-vj-bg-dark rounded-xl flex items-center justify-center border border-white/5">
              <Zap className="h-4 w-4 text-vj-green fill-vj-green" />
            </div>
            <span className="font-black text-lg tracking-tighter text-vj-txt">Turis Agências</span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            {['Recursos', 'Depoimentos', 'Planos'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-[13px] font-bold text-vj-txt2 hover:text-vj-green transition-colors duration-200"
              >
                {item}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => navigate('/')}
                className="premium-button h-9 px-5 text-sm rounded-xl flex items-center gap-2"
              >
                Acessar Painel <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="glass-button h-9 px-5 text-sm rounded-xl hidden sm:flex items-center"
                >
                  Entrar
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="premium-button h-9 px-5 text-sm rounded-xl flex items-center gap-2"
                >
                  Começar Grátis <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-40 pb-28 px-6 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:64px_64px] opacity-30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-vj-bg via-vj-bg/80 to-vj-bg pointer-events-none" />
        {/* Green glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-vj-green/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-vj-border text-xs font-bold text-vj-txt2 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-2 w-2 rounded-full bg-vj-green animate-pulse" />
            Plataforma v7 disponível · Motor IA atualizado
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.03em] leading-[1.05] mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            A plataforma definitiva para{' '}
            <span className="relative inline-block">
              <span className="text-vj-green">agências de viagem</span>
              <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 200 6" fill="none" aria-hidden>
                <path d="M0 5 C50 1, 150 1, 200 5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" fill="none" />
              </svg>
            </span>{' '}
            do futuro.
          </h1>

          <p className="text-lg md:text-xl text-vj-txt2 mb-10 max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Cotações em segundos por IA, portais dinâmicos para clientes e um motor inteligente que trabalha 24/7 para sua agência vender mais e operar melhor.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <button
              onClick={() => navigate(user ? '/' : '/signup')}
              className="premium-button h-12 px-8 text-base w-full sm:w-auto rounded-2xl flex items-center justify-center gap-2 font-bold"
            >
              Transformar minha Agência <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => document.getElementById('recursos')?.scrollIntoView({ behavior: 'smooth' })}
              className="glass-button h-12 px-8 text-base w-full sm:w-auto rounded-2xl font-bold"
            >
              Ver demonstração
            </button>
          </div>

          {/* Social Proof */}
          <div className="mt-10 flex items-center justify-center gap-3 animate-in fade-in duration-700 delay-500">
            <div className="flex -space-x-2">
              {['M', 'R', 'J', 'A', 'C'].map((l, i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full bg-vj-bg-dark text-white text-xs font-black flex items-center justify-center border-2 border-white"
                  style={{ zIndex: 5 - i }}
                >
                  {l}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex gap-0.5 mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 text-vj-yellow fill-vj-yellow" />
                ))}
              </div>
              <p className="text-xs font-bold text-vj-txt2">
                Confiado por <span className="text-vj-txt">500+ agências</span> no Brasil
              </p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="max-w-3xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-500 relative z-10">
          <StatBadge value="500+" label="Agências Ativas" />
          <StatBadge value="4h/dia" label="Tempo Economizado" />
          <StatBadge value="98%" label="Satisfação" />
          <StatBadge value="24/7" label="Motor de IA" />
        </div>

        {/* App preview — Bento grid mockup */}
        <div className="max-w-5xl mx-auto mt-20 relative animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-vj-bg to-transparent z-10 pointer-events-none" />
          <div className="rounded-2xl border border-vj-border bg-white overflow-hidden">
            {/* Mock header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-vj-border bg-zinc-50">
              <div className="flex gap-1.5">
                {['#ef4444','#eab308','#22c55e'].map(c => (
                  <div key={c} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                ))}
              </div>
              <div className="flex-1 mx-4 h-6 rounded-lg bg-vj-border/40 flex items-center px-3">
                <span className="text-[10px] text-vj-txt3 font-mono">app.turisagencias.com.br/dashboard</span>
              </div>
            </div>

            {/* Mock content */}
            <div className="flex">
              {/* Sidebar mock */}
              <div className="w-16 md:w-52 shrink-0 border-r border-vj-border p-3 space-y-1 hidden sm:block">
                <div className="h-10 rounded-xl bg-vj-green/10 border border-vj-green/20 flex items-center gap-3 px-3 mb-4">
                  <Zap className="h-4 w-4 text-vj-green shrink-0" />
                  <span className="text-xs font-bold text-vj-green hidden md:block">Painel</span>
                </div>
                {[LayoutDashboard, Users, FileText, TrendingUp, Plane].map((Icon, i) => (
                  <div key={i} className="h-9 rounded-xl flex items-center gap-3 px-3 hover:bg-zinc-50 cursor-pointer">
                    <Icon className="h-3.5 w-3.5 text-vj-txt3 shrink-0" />
                    <div className="hidden md:block h-2 rounded bg-vj-border/60 flex-1" />
                  </div>
                ))}
              </div>

              {/* Main content mock */}
              <div className="flex-1 p-4 md:p-6 bg-vj-bg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {['Pipeline', 'Clientes', 'Embarques', 'IA Ativa'].map((label, i) => (
                    <div key={i} className="bg-white rounded-xl border border-vj-border p-3">
                      <div className="h-1.5 w-8 rounded bg-vj-green/30 mb-2" />
                      <div className="h-5 w-16 rounded bg-vj-border/40 mb-1" />
                      <p className="text-[9px] text-vj-txt3 font-bold uppercase tracking-widest">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 bg-white rounded-xl border border-vj-border p-4 h-28">
                    <div className="h-2 w-24 rounded bg-vj-border/40 mb-3" />
                    <div className="flex gap-2">
                      {[3, 4, 2].map((n, i) => (
                        <div key={i} className="flex-1 space-y-1.5">
                          <div className="h-1.5 w-12 rounded bg-vj-border/30" />
                          {[...Array(n)].map((_, j) => (
                            <div key={j} className="h-6 rounded-lg bg-zinc-50 border border-vj-border/40" />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-vj-bg-dark rounded-xl border border-vj-border/20 p-4 h-28">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-3.5 w-3.5 text-vj-green" />
                      <div className="h-1.5 w-12 rounded bg-white/20" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-1.5 w-full rounded bg-white/10" />
                      <div className="h-1.5 w-3/4 rounded bg-white/10" />
                      <div className="h-1.5 w-1/2 rounded bg-vj-green/40" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="recursos" className="py-28 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-vj-green mb-4">Funcionalidades</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.025em] mb-4">
              Tudo que sua agência precisa.
            </h2>
            <p className="text-vj-txt2 text-lg font-medium leading-relaxed">
              Substitua dezenas de planilhas e sistemas lentos por uma única plataforma inteligente construída para turismo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Section ── */}
      <section id="ai" className="py-28 px-6 bg-vj-bg">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: copy */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-vj-green mb-4">Agente Inteligente</p>
              <h2 className="text-4xl font-black tracking-[-0.025em] mb-6">
                IA especializada em turismo que realmente funciona.
              </h2>
              <p className="text-vj-txt2 text-base leading-relaxed mb-8">
                Nosso Motor Turis AI não é um chatbot genérico. São agentes treinados nos processos reais de agências brasileiras — lendo PDFs de operadoras, gerenciando embarques e automatizando rotinas com precisão.
              </p>
              <ul className="space-y-3">
                {[
                  'Extração de cotações de PDFs de qualquer operadora',
                  'Análise automática de documentos de viajantes',
                  'Radar de mercado com curadoria de notícias do setor',
                  'Sugestões de abordagem comercial por histórico do cliente',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-vj-green/10 border border-vj-green/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-vj-green" />
                    </div>
                    <span className="text-sm font-medium text-vj-txt2">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/signup')}
                className="mt-10 premium-button h-11 px-7 text-sm rounded-xl flex items-center gap-2 font-bold"
              >
                Ativar o Motor de IA <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right: UI mock */}
            <div className="relative">
              <div className="absolute -inset-4 bg-vj-green/5 rounded-3xl blur-2xl" />
              <div className="relative bg-white rounded-2xl border border-vj-border overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-vj-border">
                  <div className="h-9 w-9 rounded-xl bg-vj-bg-dark flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-vj-green" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-vj-txt">Motor Turis AI</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-vj-green animate-pulse" />
                      <span className="text-[10px] font-bold text-vj-txt3 uppercase tracking-widest">Ativo · Analisando</span>
                    </div>
                  </div>
                </div>

                {/* Chat messages */}
                <div className="p-5 space-y-4">
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-black shrink-0">M</div>
                    <div className="bg-zinc-50 border border-vj-border rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
                      <p className="text-xs text-vj-txt2">Upload do PDF da CVC — Pacote Cancún 7 dias</p>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-row-reverse">
                    <div className="h-8 w-8 rounded-full bg-vj-green flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-vj-bg-dark text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs">
                      <p className="text-xs leading-relaxed">PDF lido com sucesso! Extraídos: 7 dias de itinerário, 3 hotéis, 2 voos e valores. Gerando proposta premium...</p>
                    </div>
                  </div>
                  <div className="bg-vj-green/8 border border-vj-green/20 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="h-3.5 w-3.5 text-vj-green" />
                      <span className="text-xs font-bold text-vj-green">Proposta criada em 3 segundos</span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-1.5 rounded bg-vj-green/20 w-full" />
                      <div className="h-1.5 rounded bg-vj-green/20 w-3/4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Depoimentos ── */}
      <section id="depoimentos" className="py-28 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-vj-green mb-4">Depoimentos</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.025em] mb-4">
              Agências que já transformaram sua operação.
            </h2>
            <p className="text-vj-txt2 text-lg font-medium">
              Mais de 500 agências confiam no Turis Agências para operar e vender melhor.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Planos ── */}
      <section id="planos" className="py-28 px-6 bg-vj-bg">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-vj-green mb-4">Planos</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-[-0.025em] mb-4">
            Comece hoje. Sem cartão.
          </h2>
          <p className="text-vj-txt2 text-lg font-medium mb-12">
            14 dias de teste gratuito com todas as funcionalidades. Sem compromisso.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* Starter */}
            <div className="bg-white border border-vj-border rounded-2xl p-7 text-left hover:border-vj-green/30 transition-all duration-200">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-vj-txt3 mb-4">Starter</p>
              <div className="mb-6">
                <span className="text-3xl font-black text-vj-txt">Grátis</span>
                <span className="text-sm text-vj-txt3 ml-2">por 14 dias</span>
              </div>
              <ul className="space-y-2.5 mb-7">
                {['Até 3 usuários', 'CRM de clientes', 'Cotações básicas', 'Portal do viajante'].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-vj-txt2">
                    <Check className="h-3.5 w-3.5 text-vj-green shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/signup')}
                className="glass-button w-full h-10 text-sm rounded-xl font-bold"
              >
                Criar conta grátis
              </button>
            </div>

            {/* Pro */}
            <div className="bg-vj-bg-dark border border-vj-green/40 rounded-2xl p-7 text-left relative overflow-hidden">
              <div className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-[0.15em] px-2 py-1 rounded-full bg-vj-green text-white">
                Mais popular
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-vj-txt3/60 mb-4">Pro</p>
              <div className="mb-6">
                <span className="text-3xl font-black text-white">R$297</span>
                <span className="text-sm text-zinc-500 ml-2">/mês</span>
              </div>
              <ul className="space-y-2.5 mb-7">
                {['Usuários ilimitados', 'Motor de IA completo', 'OCR de PDFs', 'Portal premium do viajante', 'WhatsApp integrado', 'Financeiro completo'].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-zinc-300">
                    <Check className="h-3.5 w-3.5 text-vj-green shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/signup')}
                className="premium-button w-full h-10 text-sm rounded-xl font-bold"
              >
                Começar com o Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="py-28 px-6 bg-white border-t border-vj-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-vj-green/10 text-vj-green font-bold text-xs mb-8">
            <MapPin className="w-3.5 h-3.5" />
            Feito para agências de turismo brasileiras
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-[-0.025em] mb-6">
            Sua agência merece uma plataforma à altura.
          </h2>
          <p className="text-xl text-vj-txt2 font-medium mb-10 leading-relaxed">
            Junte-se às agências que já saíram das planilhas e descobriram como operar com mais inteligência, menos retrabalho e mais vendas.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="premium-button h-14 px-10 text-base rounded-2xl font-bold flex items-center gap-2 mx-auto"
          >
            Criar Conta Gratuitamente <ArrowRight className="w-4 h-4" />
          </button>
          <p className="mt-4 text-sm text-vj-txt3 font-medium">
            14 dias grátis · Sem cartão · Cancele quando quiser
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 border-t border-vj-border bg-vj-bg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 bg-vj-bg-dark rounded-lg flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-vj-green fill-vj-green" />
            </div>
            <span className="text-sm font-black text-vj-txt tracking-tight">Turis Agências</span>
          </div>
          <p className="text-xs text-vj-txt3 font-medium">
            © {new Date().getFullYear()} Turis Agências. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            {['Privacidade', 'Termos', 'Suporte'].map(item => (
              <a
                key={item}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (item === 'Suporte') {
                    toast.info('Para suporte, entre em contato pelo e-mail suporte@turisagencias.com.br');
                  } else {
                    toast.info(`O documento de ${item} está em atualização para a versão OMEGA v5. Contate o suporte para dúvidas.`);
                  }
                }}
                className="text-xs font-bold text-vj-txt3 hover:text-vj-green transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
