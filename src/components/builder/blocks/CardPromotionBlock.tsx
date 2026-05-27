import React from 'react';
import { Tag } from 'lucide-react';

export const CardPromotionBlock = {
 type: 'cardPromotion',
 category: 'commerce',
 label: 'Promotion Card',
 icon: Tag,
 renderComponent: ({ data }: any) => (
 <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8 ">
 <div className="absolute top-0 right-0 p-4">
 <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ">
 {data?.badgeText || 'Special Offer'}
 </div>
 </div>
 <div className="max-w-xs relative z-10">
 <h3 className="text-2xl font-bold mb-2">{data?.title || 'Summer Getaway'}</h3>
 <p className="opacity-90 mb-6">{data?.description || 'Book now and get up to 30% off on all premium packages.'}</p>
 <button className="bg-white text-indigo-700 font-semibold px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors ">
 {data?.buttonText || 'Claim Discount'}
 </button>
 </div>
 <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
 </div>
 ),
 settingsComponent: ({ data, onChange }: any) => (
 <div className="flex flex-col gap-2">
 <label className="text-sm font-medium">Title</label>
 <input 
 className="border rounded p-2 text-sm"
 value={data?.title || ''} 
 onChange={(e) => onChange({ ...data, title: e.target.value })} 
 />
 <label className="text-sm font-medium">Badge Text</label>
 <input 
 className="border rounded p-2 text-sm"
 value={data?.badgeText || ''} 
 onChange={(e) => onChange({ ...data, badgeText: e.target.value })} 
 />
 <label className="text-sm font-medium">Description</label>
 <textarea 
 className="border rounded p-2 text-sm"
 value={data?.description || ''} 
 onChange={(e) => onChange({ ...data, description: e.target.value })} 
 />
 </div>
 )
};
