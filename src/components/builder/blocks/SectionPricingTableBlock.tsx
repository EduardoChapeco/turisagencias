import React from 'react';
import { DollarSign } from 'lucide-react';

export const SectionPricingTableBlock = {
 type: 'section_pricing_table',
 category: 'layout',
 label: 'Pricing Table',
 icon: DollarSign,
 renderComponent: (props: any) => {
 return (
 <div className="w-full py-16 px-4 bg-gray-50">
 <div className="text-center max-w-3xl mx-auto mb-12">
 <h2 className="text-3xl font-bold">Simple, transparent pricing</h2>
 <p className="text-gray-600 mt-4">No surprise fees.</p>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
 {[ 'Basic', 'Pro', 'Enterprise' ].map((plan, idx) => (
 <div key={idx} className={`p-8 rounded-xl bg-white border ${idx === 1 ? 'border-blue-500 relative' : 'border-gray-200 '}`}>
 {idx === 1 && <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-3 py-1 text-xs rounded-full">Most Popular</span>}
 <h3 className="text-xl font-semibold mb-2">{plan}</h3>
 <div className="text-3xl font-bold mb-6">${(idx + 1) * 19}<span className="text-sm text-gray-500 font-normal">/mo</span></div>
 <ul className="space-y-3 mb-8">
 <li className="flex items-center text-gray-600"><span className="mr-2">✓</span> Feature 1</li>
 <li className="flex items-center text-gray-600"><span className="mr-2">✓</span> Feature 2</li>
 <li className="flex items-center text-gray-600"><span className="mr-2">✓</span> Feature 3</li>
 </ul>
 <button className={`w-full py-2 rounded-md font-medium ${idx === 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>Choose Plan</button>
 </div>
 ))}
 </div>
 </div>
 );
 },
 settingsComponent: (props: any) => {
 return (
 <div className="p-4 space-y-4">
 <div className="text-sm font-medium">Pricing Table Settings</div>
 <div className="text-sm text-gray-500">Configure plans and features.</div>
 </div>
 );
 }
};
