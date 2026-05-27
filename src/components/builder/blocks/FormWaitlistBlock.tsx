import React from 'react';
import { BlockDef } from '../core/types';
import { Mail } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useSubmitForm } from '../hooks/useSubmitForm';
import { Loader2, CheckCircle2 } from 'lucide-react';

export const FormWaitlistBlock: BlockDef = {
 type: 'formWaitlist',
 label: 'Waitlist',
 category: 'forms',
 icon: Mail,
 
 defaultProps: {
 title: 'Entre na Lista de Espera',
 subtitle: 'Seja o primeiro a saber quando abrirmos novas vagas.',
 buttonText: 'Inscrever-se',
 },
 
 defaultStyles: {
 paddingTop: 'py-16',
 paddingBottom: 'pb-16',
 backgroundColor: 'bg-zinc-100',
 textColor: 'text-zinc-950',
 },

 renderComponent: ({ node }) => {
 const { title, subtitle, buttonText } = node.props;
 const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
 
 // Motor Real de Supabase
 const { handleSubmit, isSubmitting, isSuccess } = useSubmitForm({ 
 blockId: node.id, 
 source: 'Waitlist Form' 
 });
 
 return (
 <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6 text-center`}>
 <div className="max-w-md mx-auto">
 <h2 className="text-3xl font-bold mb-3">{title}</h2>
 <p className="opacity-80 mb-8">{subtitle}</p>
 
 {isSuccess ? (
 <div className="w-full p-4 border border-emerald-200 bg-emerald-50 rounded-lg text-emerald-700 flex items-center justify-center gap-2 font-medium">
 <CheckCircle2 className="w-5 h-5" />
 Você está na lista de espera!
 </div>
 ) : (
 <form className="w-full flex flex-col sm:flex-row gap-3" onSubmit={handleSubmit}>
 <Input name="email" type="email" required placeholder="Seu melhor e-mail" className="h-12 bg-white flex-1" />
 <button 
 type="submit"
 disabled={isSubmitting}
 className="px-6 py-3 bg-zinc-950 text-white font-bold rounded-lg hover:bg-zinc-800 transition-colors whitespace-nowrap flex items-center justify-center disabled:opacity-50"
 >
 {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : buttonText}
 </button>
 </form>
 )}
 </div>
 </section>
 );
 },

 settingsComponent: ({ node, onChange }) => {
 return (
 <div className="space-y-4">
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
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Texto do Botão</Label>
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
