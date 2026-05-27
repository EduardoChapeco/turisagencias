import React from 'react';
import { CreditCard, Lock } from 'lucide-react';
import { BlockDef } from '../core/types';
import { EditableText } from '../core/EditableText';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const FinancePaymentButtonBlock: BlockDef = {
 type: 'FinancePaymentButtonBlock',
 category: 'commerce',
 label: 'Payment Button',
 icon: CreditCard,
 defaultProps: {
 buttonText: 'Pay Now',
 checkoutUrl: '',
 amount: '0.00',
 currency: 'BRL',
 description: 'Pagamento Seguro',
 },
 defaultStyles: {
 paddingTop: 'pt-8',
 paddingBottom: 'pb-8',
 backgroundColor: 'bg-white',
 },
 renderComponent: ({ node }) => {
 const { buttonText, checkoutUrl, amount, currency, description } = node.props;
 const hasValidUrl = checkoutUrl && checkoutUrl.trim() !== '';

 return (
 <div className="flex flex-col items-center gap-3 p-6 max-w-md mx-auto">
 <div className="text-center mb-2">
 <EditableText
 nodeId={node.id}
 propKey="description"
 value={description}
 className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1 block"
 />
 {amount && amount !== '0.00' && (
 <div className="text-3xl font-black text-slate-900 flex items-center justify-center gap-1">
 <span className="text-lg text-slate-500">{currency}</span> {amount}
 </div>
 )}
 </div>

 {hasValidUrl ? (
 <a 
 href={checkoutUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center justify-center gap-2 w-full bg-vj-green hover:bg-emerald-600 text-white font-bold py-4 px-6 rounded-xl transition-all hover: hover:-translate-y-1"
 >
 <CreditCard size={20} />
 {buttonText}
 </a>
 ) : (
 <button 
 disabled
 className="flex items-center justify-center gap-2 w-full bg-slate-200 text-slate-500 font-bold py-4 px-6 rounded-xl transition-colors opacity-70 cursor-not-allowed"
 >
 <CreditCard size={20} />
 {buttonText} (Configure o Link)
 </button>
 )}
 
 <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mt-2">
 <Lock size={12} className="text-emerald-500" />
 <span>Pagamento seguro e criptografado</span>
 </div>
 </div>
 );
 },
 settingsComponent: ({ node, onChange }) => {
 const { buttonText, checkoutUrl, amount, currency } = node.props;
 
 return (
 <div className="space-y-4">
 <div className="space-y-2">
 <Label className="text-xs uppercase text-zinc-500 font-bold">Texto do Botão</Label>
 <Input 
 className="border-zinc-800 bg-zinc-900 text-white"
 value={buttonText || ''} 
 onChange={(e) => onChange({ props: { ...node.props, buttonText: e.target.value } })} 
 placeholder="Ex: Pagar Agora"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-xs uppercase text-zinc-500 font-bold">URL de Checkout (Stripe/Asaas)</Label>
 <Input 
 className="border-zinc-800 bg-zinc-900 text-white"
 value={checkoutUrl || ''} 
 onChange={(e) => onChange({ props: { ...node.props, checkoutUrl: e.target.value } })} 
 placeholder="https://pay.asaas.com/..."
 />
 </div>
 <div className="grid grid-cols-2 gap-2">
 <div className="space-y-2">
 <Label className="text-xs uppercase text-zinc-500 font-bold">Valor</Label>
 <Input 
 className="border-zinc-800 bg-zinc-900 text-white"
 value={amount || ''} 
 onChange={(e) => onChange({ props: { ...node.props, amount: e.target.value } })} 
 placeholder="0.00"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-xs uppercase text-zinc-500 font-bold">Moeda</Label>
 <select
 className="w-full h-9 border border-zinc-800 bg-zinc-900 text-white rounded-md px-3 text-sm"
 value={currency || 'BRL'}
 onChange={(e) => onChange({ props: { ...node.props, currency: e.target.value } })}
 >
 <option value="BRL">BRL</option>
 <option value="USD">USD</option>
 <option value="EUR">EUR</option>
 </select>
 </div>
 </div>
 </div>
 );
 }
};
