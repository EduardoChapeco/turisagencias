import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';

export const FinanceInvoiceStatusBlock = {
 type: 'financeInvoiceStatus',
 category: 'commerce',
 label: 'Invoice Status',
 icon: CheckCircle,
 renderComponent: ({ data }: any) => {
 const isPaid = node.props.status === 'paid';
 
 return (
 <div className={`flex items-center gap-3 p-4 rounded-lg border ${
 isPaid ? 'bg-green-50 border-green-200 text-green-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'
 }`}>
 {isPaid ? <CheckCircle className="text-green-500" size={24} /> : <Clock className="text-yellow-500" size={24} />}
 <div>
 <p className="font-semibold">{isPaid ? 'Payment Received' : 'Payment Pending'}</p>
 <p className="text-sm opacity-80">
 {isPaid ? 'Invoice #INV-2026-001 has been fully paid.' : 'Awaiting payment for Invoice #INV-2026-001.'}
 </p>
 </div>
 </div>
 );
 },
 settingsComponent: ({ node, onChange }) => (
 <div className="flex flex-col gap-2">
 <label className="text-sm font-medium">Status</label>
 <select 
 className="border rounded p-2 text-sm"
 value={node.props.status || 'pending'} 
 onChange={(e) => onChange({ props: { ...node.props,  status: e.target.value } })}
 >
 <option value="pending">Pending</option>
 <option value="paid">Paid</option>
 </select>
 </div>
 )
};
