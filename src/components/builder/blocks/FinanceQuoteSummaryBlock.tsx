import React from 'react';
import { FileSpreadsheet } from 'lucide-react';

export const FinanceQuoteSummaryBlock = {
  type: 'financeQuoteSummary',
  category: 'commerce',
  label: 'Quote Summary',
  icon: FileSpreadsheet,
  renderComponent: ({ data }: any) => (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h3 className="font-bold text-xl mb-4 border-b pb-2">{data?.title || 'Quote Summary'}</h3>
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="px-4 py-2 rounded-tl">Description</th>
            <th className="px-4 py-2">Qty</th>
            <th className="px-4 py-2 rounded-tr text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="px-4 py-3 font-medium">Flight Tickets (Round Trip)</td>
            <td className="px-4 py-3">2</td>
            <td className="px-4 py-3 text-right">$1,200.00</td>
          </tr>
          <tr className="border-b">
            <td className="px-4 py-3 font-medium">Hotel Accommodation (5 nights)</td>
            <td className="px-4 py-3">1</td>
            <td className="px-4 py-3 text-right">$850.00</td>
          </tr>
          <tr>
            <td className="px-4 py-3 font-medium">Travel Insurance</td>
            <td className="px-4 py-3">2</td>
            <td className="px-4 py-3 text-right">$120.00</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="font-bold text-base bg-gray-50">
            <td colSpan={2} className="px-4 py-3 text-right">Total:</td>
            <td className="px-4 py-3 text-right">$2,170.00</td>
          </tr>
        </tfoot>
      </table>
    </div>
  ),
  settingsComponent: ({ data, onChange }: any) => (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Table Title</label>
      <input 
        className="border rounded p-2 text-sm"
        value={data?.title || ''} 
        onChange={(e) => onChange({ ...data, title: e.target.value })} 
      />
    </div>
  )
};
