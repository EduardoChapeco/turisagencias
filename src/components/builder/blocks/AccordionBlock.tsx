import React, { useCallback } from 'react';
import { FoldVertical, ChevronDown } from 'lucide-react';
import { BlockDef } from '../core/types';
import { EditableText } from '../core/EditableText';
import { ArrayField } from '../core/ArrayField';
import { useBuilderStore } from '../core/useBuilderStore';
import { BuilderNode } from '../core/types';

// Helper para encontrar props de um nó na árvore
function findNodeProps(nodes: BuilderNode[], nodeId: string): Record<string, any> {
  for (const n of nodes) {
    if (n.id === nodeId) return n.props;
    if (n.children) {
      const found = findNodeProps(n.children, nodeId);
      if (found) return found;
    }
  }
  return {};
}

export const AccordionBlock: BlockDef = {
  type: 'AccordionBlock',
  label: 'Accordion',
  category: 'interactive',
  icon: FoldVertical,
  defaultProps: {
    title: 'Perguntas Frequentes',
    items: [
      {
        id: '1',
        question: 'Qual é a política de reembolso?',
        answer: 'Oferecemos 30 dias de garantia de devolução de dinheiro. Entre em contato com nosso suporte.',
      },
      {
        id: '2',
        question: 'Vocês oferecem suporte técnico?',
        answer: 'Sim, fornecemos suporte 24/7 via email e chat para todos os planos premium.',
      },
      {
        id: '3',
        question: 'Posso atualizar meu plano depois?',
        answer: 'Absolutamente! Você pode atualizar ou rebaixar seu plano a qualquer momento nas configurações da conta.',
      }
    ],
  },
  defaultStyles: {
    paddingTop: 'py-16',
    paddingBottom: 'pb-16',
    backgroundColor: 'bg-white',
  },
  renderComponent: ({ node }) => {
    const { title, items } = node.props;
    const updateNode = useBuilderStore(state => state.updateNode);
    const nodes = useBuilderStore(state => state.nodes);

    const updateItem = useCallback((index: number, key: string, value: string) => {
      const currentProps = findNodeProps(nodes, node.id);
      const newItems = [...(currentProps.items || [])];
      newItems[index] = { ...newItems[index], [key]: value };
      updateNode(node.id, { props: { ...currentProps, items: newItems } });
    }, [nodes, node.id, updateNode]);

    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <EditableText
          nodeId={node.id}
          propKey="title"
          value={title}
          className="text-3xl font-bold text-slate-900 mb-8 text-center block"
        />
        
        <div className="space-y-3">
          {items.map((item: any, index: number) => (
            <details key={item.id || index} className="group border border-slate-200 rounded-xl bg-white [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between p-6 cursor-pointer text-slate-900 font-medium">
                <span className="w-full mr-4 font-semibold text-vj-txt">{item.question}</span>
                <ChevronDown className="w-5 h-5 text-slate-500 transition-transform duration-300 group-open:rotate-180 flex-shrink-0" />
              </summary>
              <div className="px-6 pb-6 text-slate-600 text-base leading-relaxed border-t border-slate-100 pt-4">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    );
  },
  settingsComponent: ({ node, onChange }) => {
    return (
      <div className="space-y-6">
        <ArrayField
          title="Itens do Accordion"
          items={node.props.items || []}
          onChange={(items) => onChange({ props: { ...node.props, items } })}
          defaultItem={{ question: 'Nova Pergunta', answer: 'Nova Resposta' }}
          schema={[
            { key: 'question', label: 'Título / Pergunta', type: 'text' },
            { key: 'answer', label: 'Conteúdo / Resposta', type: 'textarea' }
          ]}
        />
      </div>
    );
  },
};
