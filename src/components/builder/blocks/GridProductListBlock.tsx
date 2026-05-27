import React from 'react';
import { Grid } from 'lucide-react';

export const GridProductListBlock = {
 type: 'gridProductList',
 category: 'commerce',
 label: 'Product Grid',
 icon: Grid,
 renderComponent: ({ data }: any) => (
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
 {[1, 2, 3].map((item) => (
 <div key={item} className="p-4 border rounded flex flex-col gap-2 bg-white">
 <div className="h-40 bg-gray-100 rounded w-full"></div>
 <h3 className="font-semibold text-lg">{data?.titlePrefix || 'Product'} {item}</h3>
 <p className="text-gray-600">{data?.pricePrefix || '$'}{(item * 29.99).toFixed(2)}</p>
 <button className="bg-black text-white px-4 py-2 rounded mt-2">View</button>
 </div>
 ))}
 </div>
 ),
 settingsComponent: ({ data, onChange }: any) => (
 <div className="flex flex-col gap-2">
 <label className="text-sm font-medium">Columns (Desktop)</label>
 <select 
 className="border rounded p-2 text-sm"
 value={data?.columns || '3'} 
 onChange={(e) => onChange({ ...data, columns: e.target.value })}
 >
 <option value="2">2 Columns</option>
 <option value="3">3 Columns</option>
 <option value="4">4 Columns</option>
 </select>
 </div>
 )
};
