import React from 'react';
import { ShoppingBag } from 'lucide-react';

export const CardProductBlock = {
 type: 'cardProduct',
 category: 'commerce',
 label: 'Product Card',
 icon: ShoppingBag,
 renderComponent: ({ data }: any) => (
 <div className="p-4 border rounded flex flex-col gap-2">
 <div className="h-40 bg-gray-200 rounded w-full flex items-center justify-center text-gray-400">Image</div>
 <h3 className="font-semibold text-lg">{data?.title || 'Product Title'}</h3>
 <p className="text-gray-600">{data?.price || '$99.00'}</p>
 <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
 {data?.buttonText || 'Buy'}
 </button>
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
 <label className="text-sm font-medium">Price</label>
 <input 
 className="border rounded p-2 text-sm"
 value={data?.price || ''} 
 onChange={(e) => onChange({ ...data, price: e.target.value })} 
 />
 </div>
 )
};
