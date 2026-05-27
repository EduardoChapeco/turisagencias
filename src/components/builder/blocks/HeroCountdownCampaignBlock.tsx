import React from 'react';
import { BlockDef } from '../core/types';
import { LayoutTemplate, Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { EditableText } from '../core/EditableText';

export const HeroCountdownCampaignBlock: BlockDef = {
 type: 'hero-countdown-campaign',
 label: 'Hero com Contagem Regressiva',
 category: 'hero',
 icon: LayoutTemplate,
 
 defaultProps: {
 campaignLabel: 'Black Friday Antecipada',
 title: '50% OFF em Pacotes Internacionais',
 subtitle: 'Aproveite nossa promoção exclusiva por tempo limitadíssimo.',
 buttonText: 'Acessar Ofertas',
 days: '03',
 hours: '12',
 minutes: '45',
 seconds: '20'
 },
 
 defaultStyles: {
 paddingTop: 'py-20',
 paddingBottom: 'pb-20',
 backgroundColor: 'bg-red-600',
 textColor: 'text-white',
 },

 renderComponent: ({ node }) => {
 const { campaignLabel, title, subtitle, buttonText, days, hours, minutes, seconds } = node.props;
 const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
 
 return (
 <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6 relative overflow-hidden flex flex-col items-center justify-center text-center`}>
 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
 
 <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
 <div className="flex items-center gap-2 mb-4 bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider backdrop-blur-sm">
 <Clock className="w-4 h-4" />
 <EditableText nodeId={node.id} propKey="campaignLabel" value={campaignLabel} as="span" />
 </div>
 
 <EditableText
 nodeId={node.id}
 propKey="title"
 value={title}
 as="h1"
 className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-tight"
 />
 
 <EditableText
 nodeId={node.id}
 propKey="subtitle"
 value={subtitle}
 as="p"
 className="text-lg md:text-xl font-medium opacity-90 max-w-2xl mb-12"
 />
 
 <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12">
 {[
 { label: 'Dias', value: days, key: 'days' },
 { label: 'Horas', value: hours, key: 'hours' },
 { label: 'Minutos', value: minutes, key: 'minutes' },
 { label: 'Segundos', value: seconds, key: 'seconds' }
 ].map((time) => (
 <div key={time.label} className="flex flex-col items-center">
 <div className="bg-white text-red-600 w-16 h-16 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-3xl md:text-5xl font-black mb-2">
 <EditableText nodeId={node.id} propKey={time.key} value={time.value} as="span" />
 </div>
 <span className="text-xs md:text-sm font-bold uppercase tracking-wider opacity-80">{time.label}</span>
 </div>
 ))}
 </div>

 <EditableText
 nodeId={node.id}
 propKey="buttonText"
 value={buttonText}
 as="button"
 className="px-10 py-5 bg-zinc-900 hover:bg-black text-white font-black uppercase tracking-wider rounded-xl transition-transform hover:scale-105 "
 />
 </div>
 </section>
 );
 },

 settingsComponent: ({ node, onChange }) => {
 return (
 <div className="space-y-4">
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Rótulo da Campanha</Label>
 <Input 
 value={node.props.campaignLabel || ''} 
 onChange={e => onChange({ props: { ...node.props, campaignLabel: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Título</Label>
 <Input 
 value={node.props.title || ''} 
 onChange={e => onChange({ props: { ...node.props, title: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Subtítulo</Label>
 <Input 
 value={node.props.subtitle || ''} 
 onChange={e => onChange({ props: { ...node.props, subtitle: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <div className="grid grid-cols-4 gap-2">
 <div className="space-y-1">
 <Label className="text-[9px] uppercase text-zinc-500 font-bold">Dias</Label>
 <Input value={node.props.days || ''} onChange={e => onChange({ props: { ...node.props, days: e.target.value } })} className="bg-zinc-900 border-zinc-800 text-white text-center text-sm h-9" />
 </div>
 <div className="space-y-1">
 <Label className="text-[9px] uppercase text-zinc-500 font-bold">Hrs</Label>
 <Input value={node.props.hours || ''} onChange={e => onChange({ props: { ...node.props, hours: e.target.value } })} className="bg-zinc-900 border-zinc-800 text-white text-center text-sm h-9" />
 </div>
 <div className="space-y-1">
 <Label className="text-[9px] uppercase text-zinc-500 font-bold">Min</Label>
 <Input value={node.props.minutes || ''} onChange={e => onChange({ props: { ...node.props, minutes: e.target.value } })} className="bg-zinc-900 border-zinc-800 text-white text-center text-sm h-9" />
 </div>
 <div className="space-y-1">
 <Label className="text-[9px] uppercase text-zinc-500 font-bold">Seg</Label>
 <Input value={node.props.seconds || ''} onChange={e => onChange({ props: { ...node.props, seconds: e.target.value } })} className="bg-zinc-900 border-zinc-800 text-white text-center text-sm h-9" />
 </div>
 </div>
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Botão</Label>
 <Input 
 value={node.props.buttonText || ''} 
 onChange={e => onChange({ props: { ...node.props, buttonText: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 </div>
 );
 }
};
