import React, { useState } from 'react';
import { BlockDef } from '../core/types';
import { Star, Loader2, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useSubmitForm } from '../hooks/useSubmitForm';
import { EditableText } from '../core/EditableText';

export const FormNpsBlock: BlockDef = {
  type: 'FormNpsBlock',
  label: 'NPS Scale',
  category: 'forms',
  icon: Star,
  
  defaultProps: {
    title: 'Em uma escala de 0 a 10',
    subtitle: 'O quanto você recomendaria nossa agência para um amigo?',
  },
  
  defaultStyles: {
    paddingTop: 'pt-12',
    paddingBottom: 'pb-12',
    backgroundColor: 'bg-white',
    textColor: 'text-zinc-950',
  },

  renderComponent: ({ node }) => {
    const { title, subtitle } = node.props;
    const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles || {};
    
    const [score, setScore] = useState<number | null>(null);
    const { handleSubmit, isSubmitting, isSuccess } = useSubmitForm({ 
      blockId: node.id, 
      source: 'NPS Form' 
    });

    return (
      <section className={`${paddingTop || ''} ${paddingBottom || ''} ${backgroundColor || ''} ${textColor || ''} px-6 text-center`}>
        <div className="max-w-3xl mx-auto">
          {isSuccess ? (
            <div className="w-full p-8 border border-emerald-200 bg-emerald-50 rounded-2xl text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-emerald-900 mb-2">Avaliação Registrada!</h3>
              <p className="text-emerald-700">Agradecemos pelo seu feedback.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col items-center">
              <EditableText
                nodeId={node.id}
                propKey="title"
                value={title}
                as="h2"
                className="text-xl font-medium mb-1 w-full block"
              />
              <EditableText
                nodeId={node.id}
                propKey="subtitle"
                value={subtitle}
                as="p"
                className="text-2xl font-bold mb-8 w-full block"
              />
              
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <button 
                    key={num} 
                    type="button"
                    onClick={() => setScore(num)}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center font-bold transition-colors ${
                      score === num 
                        ? 'bg-zinc-950 text-white border-zinc-950' 
                        : 'border-zinc-200 hover:bg-zinc-100 text-zinc-950'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              
              {/* O input escondido armazena o score para o FormData capturar */}
              <input type="hidden" name="nps_score" value={score !== null ? score : ''} required />
              
              <div className="flex justify-between w-full max-w-[600px] text-sm opacity-60 px-2 mb-6">
                <span>0 - Nada provável</span>
                <span>10 - Muito provável</span>
              </div>

              {score !== null && (
                <div className="w-full max-w-md animate-in slide-in-from-top-2 fade-in duration-300">
                  <div className="space-y-4 text-left p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                    <div className="space-y-2">
                      <Label>Seu E-mail (Opcional)</Label>
                      <Input name="email" type="email" placeholder="seu@email.com" className="bg-white" />
                    </div>
                    <div className="space-y-2">
                      <Label>Comentário (Opcional)</Label>
                      <Input name="comment" placeholder="O que motivou sua nota?" className="bg-white" />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full h-12 bg-zinc-950 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar Avaliação'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </section>
    );
  },

  settingsComponent: ({ node, onChange }) => {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
           <Star className="w-8 h-8 text-vj-green mx-auto mb-2" />
           <p className="text-xs text-zinc-400">Este bloco utiliza o motor de captura de dados real via <strong>useSubmitForm</strong>.</p>
        </div>
      </div>
    );
  }
};
