import React from 'react';
import { BlockDef } from '../core/types';
import { MessageCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useSubmitForm } from '../hooks/useSubmitForm';
import { Loader2, CheckCircle2 } from 'lucide-react';

export const FormWhatsappPrequalifierBlock: BlockDef = {
 type: 'formWhatsapp',
 label: 'WhatsApp Prequalifier',
 category: 'forms',
 icon: MessageCircle,
 
 defaultProps: {
 title: 'Fale com um Especialista',
 subtitle: 'Preencha rapidinho para te direcionarmos ao melhor consultor no WhatsApp.',
 buttonText: 'Ir para WhatsApp',
 },
 
 defaultStyles: {
 paddingTop: 'py-12',
 paddingBottom: 'pb-12',
 backgroundColor: 'bg-green-50',
 textColor: 'text-zinc-950',
 },

 renderComponent: ({ node }) => {
 const { title, subtitle, buttonText } = node.props;
 const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;
 
 // Motor Real de Supabase
 const { handleSubmit, isSubmitting, isSuccess } = useSubmitForm({ 
 blockId: node.id, 
 source: 'WhatsApp Prequalifier' 
 });

 return (
 <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6`}>
 <div className="max-w-md mx-auto text-center">
 <MessageCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
 <h2 className="text-2xl font-bold mb-2">{title}</h2>
 <p className="opacity-80 mb-6">{subtitle}</p>
 
 {isSuccess ? (
 <div className="w-full p-6 border border-green-200 bg-white rounded-2xl text-center ">
 <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
 <h3 className="text-xl font-bold text-green-900 mb-2">Tudo Certo!</h3>
 <p className="text-green-700">Redirecionando para o WhatsApp...</p>
 </div>
 ) : (
 <form className="w-full space-y-4 text-left" onSubmit={handleSubmit}>
 <div className="space-y-2">
 <Label>Como podemos te chamar?</Label>
 <Input name="name" required placeholder="Seu nome" />
 </div>
 <div className="space-y-2">
 <Label>Qual seu WhatsApp?</Label>
 <Input name="phone" type="tel" required placeholder="(11) 99999-9999" />
 </div>
 <div className="space-y-2">
 <Label>O que você busca?</Label>
 <select name="interest" required className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm">
 <option>Viagem de Lazer</option>
 <option>Viagem Corporativa</option>
 <option>Excursão em Grupo</option>
 <option>Outros</option>
 </select>
 </div>
 <button 
 type="submit"
 disabled={isSubmitting}
 className="w-full px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
 >
 {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
 <>
 <MessageCircle className="w-5 h-5" />
 {buttonText}
 </>
 )}
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
