import React from 'react';
import { BlockDef } from '../core/types';
import { HelpCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrayField } from '../core/ArrayField';
import {
 Accordion,
 AccordionContent,
 AccordionItem,
 AccordionTrigger,
} from '@/components/ui/accordion';

export const FaqBlock: BlockDef = {
 type: 'faq',
 label: 'Perguntas Frequentes',
 category: 'interactive',
 icon: HelpCircle,
 
 defaultProps: {
 title: 'Dúvidas Frequentes',
 subtitle: 'Tudo o que você precisa saber antes de embarcar.',
 faqs: [
 { q: 'Como funciona o cancelamento?', a: 'Você pode cancelar gratuitamente até 7 dias antes da viagem.' },
 { q: 'Preciso de visto para esses destinos?', a: 'Depende do destino escolhido. Consulte nosso suporte para detalhes específicos de cada país.' },
 { q: 'O seguro viagem está incluso?', a: 'Todos os nossos pacotes premium incluem seguro viagem global por padrão.' }
 ]
 },
 
 defaultStyles: {
 paddingTop: 'py-20',
 paddingBottom: 'pb-20',
 backgroundColor: 'bg-white',
 textColor: 'text-zinc-950',
 },

 renderComponent: ({ node }) => {
 const { title, subtitle, faqs } = node.props;
 const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
 
 return (
 <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6`}>
 <div className="max-w-3xl mx-auto">
 <div className="text-center mb-12">
 <h2 className="text-3xl md:text-5xl font-black mb-4">{title}</h2>
 <p className="text-lg opacity-70">{subtitle}</p>
 </div>
 
 <Accordion type="single" collapsible className="w-full space-y-4">
 {faqs?.map((faq: any, i: number) => (
 <AccordionItem key={i} value={`item-${i}`} className="border border-zinc-200 rounded-2xl px-6 bg-white ">
 <AccordionTrigger className="text-lg font-bold hover:no-underline">{faq.q}</AccordionTrigger>
 <AccordionContent className="text-base opacity-80 leading-relaxed pb-6">
 {faq.a}
 </AccordionContent>
 </AccordionItem>
 ))}
 </Accordion>
 </div>
 </section>
 );
 },

 settingsComponent: ({ node, onChange }) => {
 return (
 <div className="space-y-6">
 <div className="space-y-4">
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Título</Label>
 <Input 
 value={node.props.title || ''} 
 onChange={e => onChange({ props: { ...node.props, title: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Subtítulo</Label>
 <Input 
 value={node.props.subtitle || ''} 
 onChange={e => onChange({ props: { ...node.props, subtitle: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm"
 />
 </div>
 </div>

 <ArrayField
 title="Perguntas Frequentes (FAQ)"
 items={node.props.faqs || []}
 onChange={(faqs) => onChange({ props: { ...node.props, faqs } })}
 defaultItem={{ q: 'Nova Pergunta?', a: 'Resposta detalhada...' }}
 schema={[
 { key: 'q', label: 'Pergunta', type: 'text' },
 { key: 'a', label: 'Resposta', type: 'textarea' }
 ]}
 />
 </div>
 );
 }
};
