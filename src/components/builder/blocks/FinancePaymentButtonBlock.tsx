import React from 'react';
import { CreditCard, Lock } from 'lucide-react';

export const FinancePaymentButtonBlock = {
  type: 'financePaymentButton',
  category: 'commerce',
  label: 'Payment Button',
  icon: CreditCard,
  renderComponent: ({ data }: any) => (
    <div className="flex flex-col items-center gap-2 p-4">
      <button className="flex items-center justify-center gap-2 w-full max-w-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-md">
        <CreditCard size={20} />
        {data?.buttonText || 'Pay Now - $2,170.00'}
      </button>
      <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
        <Lock size={12} />
        <span>Secure encrypted payment</span>
      </div>
    </div>
  ),
  settingsComponent: ({ data, onChange }: any) => (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Button Text</label>
      <input 
        className="border rounded p-2 text-sm"
        value={data?.buttonText || ''} 
        onChange={(e) => onChange({ ...data, buttonText: e.target.value })} 
        placeholder="Pay Now"
      />
    </div>
  )
};
