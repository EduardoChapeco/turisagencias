import React from 'react';
import { Megaphone } from 'lucide-react';

export const SectionCallToActionBlock = {
 type: 'section_cta',
 category: 'layout',
 label: 'Call to Action',
 icon: Megaphone,
 renderComponent: (props: any) => {
 return (
 <div className="w-full py-20 px-4 bg-blue-600 text-white text-center relative overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-50"></div>
 <div className="relative z-10 max-w-3xl mx-auto">
 <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
 <p className="text-lg md:text-xl mb-8 opacity-90 text-blue-100">Join thousands of users and start your journey today.</p>
 <div className="flex flex-col sm:flex-row justify-center gap-4">
 <button className="px-8 py-3 bg-white text-blue-600 rounded-md font-bold hover:bg-gray-50">Start Free Trial</button>
 <button className="px-8 py-3 bg-blue-800 text-white rounded-md font-bold border border-blue-500 hover:bg-blue-900">Contact Sales</button>
 </div>
 </div>
 </div>
 );
 },
 settingsComponent: (props: any) => {
 return (
 <div className="p-4 space-y-4">
 <div className="text-sm font-medium">Call to Action Settings</div>
 <div className="text-sm text-gray-500">Configure text, colors and buttons.</div>
 </div>
 );
 }
};
