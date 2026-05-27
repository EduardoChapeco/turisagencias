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
 { id: `b-${Date.now()}-1`, type: 'hero_dark_luxury', props: {}, styles: {} },
 { id: `b-${Date.now()}-2`, type: 'section_feature_zigzag', props: {}, styles: {} },
 { id: `b-${Date.now()}-3`, type: 'travel_package_grid', props: {}, styles: {} },
 { id: `b-${Date.now()}-4`, type: 'testimonials', props: {}, styles: {} },
 { id: `b-${Date.now()}-5`, type: 'footer', props: {}, styles: {} }
 ]
 },
 {
 id: 'tpl-quotation',
 name: 'Orçamento Turis',
 description: 'Apresente cotações para seus clientes com roteiro, voos, hotel e resumo financeiro.',
 icon: Blocks,
 nodes: [
 { id: `b-${Date.now()}-6`, type: 'hero_centered_minimal', props: {}, styles: {} },
 { id: `b-${Date.now()}-7`, type: 'travel_flight_summary', props: {}, styles: {} },
 { id: `b-${Date.now()}-8`, type: 'travel_hotel_summary', props: {}, styles: {} },
 { id: `b-${Date.now()}-9`, type: 'travel_itinerary_timeline', props: {}, styles: {} },
 { id: `b-${Date.now()}-10`, type: 'finance_quote_summary', props: {}, styles: {} },
 { id: `b-${Date.now()}-11`, type: 'finance_payment_button', props: {}, styles: {} }
 ]
 },
 {
 id: 'tpl-linkbio',
 name: 'LinkBio OMEGA',
 description: 'Layout vertical otimizado para Instagram com botões sociais e links.',
 icon: Layout,
 nodes: [
 { id: `b-${Date.now()}-12`, type: 'hero_linkbio_profile', props: {}, styles: {} },
 { id: `b-${Date.now()}-13`, type: 'linkbio_social_icons', props: {}, styles: {} },
 { id: `b-${Date.now()}-14`, type: 'linkbio_button_list', props: {}, styles: {} },
 { id: `b-${Date.now()}-15`, type: 'cta_floating_whatsapp', props: {}, styles: {} }
 ]
 },
 {
 id: 'tpl-blog',
 name: 'Portal / Blog',
 description: 'Crie uma página de artigos ou notícias para sua agência de turismo.',
 icon: Layout,
 nodes: [
 { id: `b-${Date.now()}-16`, type: 'hero_search_booking', props: {}, styles: {} },
 { id: `b-${Date.now()}-17`, type: 'blog_featured_post', props: {}, styles: {} },
 { id: `b-${Date.now()}-18`, type: 'blog_post_grid', props: {}, styles: {} },
 { id: `b-${Date.now()}-19`, type: 'newsletter', props: {}, styles: {} },
 { id: `b-${Date.now()}-20`, type: 'footer', props: {}, styles: {} }
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
 <div className="max-w-4xl w-full bg-white rounded-[2rem] border border-zinc-200 p-10">
 <div className="text-center mb-10">
 <div className="w-16 h-16 bg-vj-green/20 text-vj-green rounded-2xl flex items-center justify-center mx-auto mb-6">
 <Blocks size={32} />
 </div>
 <h2 className="text-3xl font-black text-zinc-900 mb-2">Inicie com um Template</h2>
 <p className="text-zinc-500">Escolha um design OMEGA pré-montado ou comece do zero fechando esta janela.</p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {templates.map(tpl => (
 <div key={tpl.id} className="p-6 border border-zinc-200 rounded-3xl hover:border-vj-green hover: transition-all group bg-zinc-50 cursor-pointer" onClick={() => handleApplyTemplate(tpl.nodes as BuilderNode[], tpl.id === 'tpl-linkbio')}>
 <div className="flex items-center gap-4 mb-4">
 <div className="w-12 h-12 bg-white rounded-xl border border-zinc-100 flex items-center justify-center text-zinc-700 group-hover:text-vj-green transition-colors">
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
