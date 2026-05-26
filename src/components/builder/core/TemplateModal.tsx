import React from 'react';
import { useBuilderStore } from './useBuilderStore';
import { Button } from '@/components/ui/button';
import { BuilderNode } from './types';
import { Layout, Palette, Blocks } from 'lucide-react';

const templates = [
  {
    id: 'tpl-agency-premium',
    name: 'Agência Premium',
    description: 'Design escuro luxuoso com hero de alto impacto, features vitrificados e tabela de preços.',
    icon: Palette,
    nodes: [
      {
        id: `hero-${Date.now()}-1`,
        type: 'hero',
        props: {
          title: 'Descubra o Mundo com Exclusividade',
          subtitle: 'Roteiros de luxo desenhados para você.',
          buttonText: 'Falar com Especialista',
          align: 'center'
        },
        styles: {
          paddingTop: 'py-32',
          paddingBottom: 'pb-32',
          backgroundColor: 'bg-zinc-950',
          textColor: 'text-white'
        }
      },
      {
        id: `features-${Date.now()}-2`,
        type: 'features',
        props: {
          title: 'Por que nós?',
          features: [
            { title: 'Curadoria Exclusiva', desc: 'Acesso aos resorts mais restritos.', iconName: 'compass' },
            { title: 'Suporte 24/7', desc: 'Atendimento via WhatsApp em qualquer fuso.', iconName: 'shield' },
            { title: 'Roteiros VJ', desc: 'Integração completa com IA.', iconName: 'zap' }
          ]
        },
        styles: {
          paddingTop: 'py-20',
          paddingBottom: 'pb-20',
          backgroundColor: 'bg-zinc-900',
          textColor: 'text-white'
        }
      },
      {
        id: `pricing-${Date.now()}-3`,
        type: 'pricing',
        props: {
          title: 'Nossos Serviços',
          subtitle: 'Selecione o estilo de viagem ideal.',
          plans: [
            { name: 'Essence', price: 'Sob Consulta', features: 'Hospedagem 5 estrelas, Transfers In/Out', isPopular: false },
            { name: 'Premium', price: 'VIP', features: 'Hospedagem 5 estrelas, Helicóptero, Jantares Michelin', isPopular: true }
          ]
        },
        styles: {
          paddingTop: 'py-24',
          paddingBottom: 'pb-24',
          backgroundColor: 'bg-zinc-950',
          textColor: 'text-white'
        }
      }
    ]
  },
  {
    id: 'tpl-linkbio',
    name: 'LinkBio OMEGA',
    description: 'Layout vertical otimizado para Instagram com botões CTA e destaques em formato grid.',
    icon: Layout,
    nodes: [
      {
        id: `hero-${Date.now()}-1`,
        type: 'hero',
        props: {
          title: '@TurisAgency',
          subtitle: 'Transformando sonhos em passaportes carimbados. Fale conosco!',
          buttonText: '',
          align: 'center'
        },
        styles: {
          paddingTop: 'py-16',
          paddingBottom: 'pb-8',
          backgroundColor: 'bg-vj-green',
          textColor: 'text-zinc-950'
        }
      },
      {
        id: `cta-${Date.now()}-2`,
        type: 'cta',
        props: {
          title: 'Solicite seu Orçamento',
          subtitle: 'Atendimento expresso via WhatsApp',
          buttonText: 'Chamar no WhatsApp'
        },
        styles: {
          paddingTop: 'pt-8',
          paddingBottom: 'pb-16',
          backgroundColor: 'bg-white',
          textColor: 'text-zinc-950'
        }
      }
    ]
  }
];

export function TemplateModal() {
  const { setNodes, setViewport } = useBuilderStore();

  const handleApplyTemplate = (nodes: BuilderNode[], isBioLink = false) => {
    setNodes(nodes);
    if (isBioLink) setViewport('mobile');
  };

  return (
    <div className="absolute inset-0 bg-white/95 z-50 flex items-center justify-center p-8 backdrop-blur-sm animate-in fade-in zoom-in-95">
      <div className="max-w-4xl w-full bg-white rounded-[2rem] shadow-2xl border border-zinc-200 p-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-vj-green/20 text-vj-green rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Blocks size={32} />
          </div>
          <h2 className="text-3xl font-black text-zinc-900 mb-2">Inicie com um Template</h2>
          <p className="text-zinc-500">Escolha um design OMEGA pré-montado ou comece do zero fechando esta janela.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map(tpl => (
            <div key={tpl.id} className="p-6 border border-zinc-200 rounded-3xl hover:border-vj-green hover:shadow-xl transition-all group bg-zinc-50 cursor-pointer" onClick={() => handleApplyTemplate(tpl.nodes as BuilderNode[], tpl.id === 'tpl-linkbio')}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-700 group-hover:text-vj-green transition-colors">
                  <tpl.icon size={24} />
                </div>
                <h3 className="font-bold text-lg text-zinc-900">{tpl.name}</h3>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed mb-6">
                {tpl.description}
              </p>
              <Button className="w-full bg-zinc-900 hover:bg-vj-green hover:text-zinc-950 transition-colors">
                Usar Template
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
