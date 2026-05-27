import React, { useState } from 'react';
import { BlockDef } from '../core/types';
import { ListTodo, Loader2, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useSubmitForm } from '../hooks/useSubmitForm';
import { EditableText } from '../core/EditableText';

export const FormLeadQuizBlock: BlockDef = {
 type: 'FormLeadQuizBlock',
 label: 'Lead Quiz',
 category: 'forms',
 icon: ListTodo,
 
 defaultProps: {
 title: 'Descubra seu perfil de viajante',
 subtitle: 'Responda a 3 perguntas e receba um roteiro personalizado.',
 buttonText: 'Começar Quiz',
 },
 
 defaultStyles: {
 paddingTop: 'pt-16',
 paddingBottom: 'pb-16',
 backgroundColor: 'bg-zinc-900',
 textColor: 'text-white',
 },

 renderComponent: ({ node }) => {
 const { title, subtitle, buttonText } = node.props;
 const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles || {};
 
 const [selectedProfile, setSelectedProfile] = useState<string>('');
 const { handleSubmit, isSubmitting, isSuccess } = useSubmitForm({ 
 blockId: node.id, 
 source: 'Lead Quiz Form' 
 });

 return (
 <section className={`${paddingTop || ''} ${paddingBottom || ''} ${backgroundColor || ''} ${textColor || ''} px-6 text-center`}>
 <div className="max-w-xl mx-auto bg-zinc-800/50 p-10 rounded-3xl border border-zinc-700/50">
 <ListTodo className="w-12 h-12 text-vj-green mx-auto mb-6" />
 <EditableText
 nodeId={node.id}
 propKey="title"
 value={title}
 as="h2"
 className="text-3xl font-bold mb-3 block"
 />
 <EditableText
 nodeId={node.id}
 propKey="subtitle"
 value={subtitle}
 as="p"
 className="opacity-80 mb-8 block"
 />
 
 {isSuccess ? (
 <div className="w-full p-8 border border-vj-green/30 bg-vj-green/10 rounded-2xl text-center">
 <CheckCircle2 className="w-12 h-12 text-vj-green mx-auto mb-4" />
 <h3 className="text-2xl font-bold text-white mb-2">Quiz Finalizado!</h3>
 <p className="text-zinc-300">Enviamos seu roteiro personalizado para o seu e-mail.</p>
 </div>
 ) : (
 <form onSubmit={handleSubmit}>
 <div className="space-y-4 mb-8 text-left">
 <button 
 type="button"
 onClick={() => setSelectedProfile('Praia e Calor')}
 className={`w-full p-4 border rounded-xl transition-colors flex justify-between items-center group ${
 selectedProfile === 'Praia e Calor' 
 ? 'border-vj-green bg-vj-green/5' 
 : 'border-zinc-700 hover:bg-zinc-700/50'
 }`}
 >
 <span>Eu prefiro praia e calor</span>
 <div className={`w-5 h-5 rounded-full border-2 ${selectedProfile === 'Praia e Calor' ? 'border-vj-green bg-vj-green' : 'border-zinc-600 group-hover:border-vj-green'}`}></div>
 </button>
 <button 
 type="button"
 onClick={() => setSelectedProfile('Montanha e Frio')}
 className={`w-full p-4 border rounded-xl transition-colors flex justify-between items-center group ${
 selectedProfile === 'Montanha e Frio' 
 ? 'border-vj-green bg-vj-green/5' 
 : 'border-zinc-700 hover:bg-zinc-700/50'
 }`}
 >
 <span>Eu prefiro montanha e frio</span>
 <div className={`w-5 h-5 rounded-full border-2 ${selectedProfile === 'Montanha e Frio' ? 'border-vj-green bg-vj-green' : 'border-zinc-600 group-hover:border-vj-green'}`}></div>
 </button>
 </div>

 {/* Campos ocultos ou revelados para capturar o Lead */}
 {selectedProfile && (
 <div className="space-y-4 mb-6 text-left animate-in slide-in-from-top-2">
 <input type="hidden" name="profile" value={selectedProfile} />
 <div className="space-y-2">
 <Label className="text-zinc-300">Para onde enviamos seu roteiro?</Label>
 <Input name="email" type="email" required placeholder="Seu melhor e-mail" className="bg-zinc-900 border-zinc-700 text-white" />
 </div>
 <div className="space-y-2">
 <Label className="text-zinc-300">Como podemos te chamar?</Label>
 <Input name="name" required placeholder="Seu nome" className="bg-zinc-900 border-zinc-700 text-white" />
 </div>
 </div>
 )}

 <button 
 type="submit" 
 disabled={!selectedProfile || isSubmitting}
 className="w-full px-8 py-4 bg-vj-green text-zinc-950 font-black rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
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
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Texto do Botão</Label>
 <Input 
 value={node.props.buttonText || ''} 
 onChange={e => onChange({ props: { ...node.props, buttonText: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>
 <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
 <ListTodo className="w-8 h-8 text-vj-green mx-auto mb-2" />
 <p className="text-xs text-zinc-400">Este bloco utiliza o motor de captura de dados real via <strong>useSubmitForm</strong>.</p>
 </div>
 </div>
 );
 }
};
