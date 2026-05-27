import React from 'react';
import { Star } from 'lucide-react';

export const CardReviewBlock = {
 type: 'cardReview',
 category: 'commerce',
 label: 'Review Card',
 icon: Star,
 renderComponent: ({ data }: any) => (
 <div className="p-6 border rounded-xl bg-white flex flex-col gap-4">
 <div className="flex text-yellow-400 gap-1">
 {[1, 2, 3, 4, 5].map((star) => (
 <Star key={star} size={18} fill="currentColor" />
 ))}
 </div>
 <p className="text-gray-700 italic">
 "{data?.reviewText || 'An absolutely amazing experience! The service was impeccable and everything was perfectly organized.'}"
 </p>
 <div className="flex items-center gap-3 mt-2">
 <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
 <div>
 <p className="font-semibold text-sm">{data?.authorName || 'Sarah Johnson'}</p>
 <p className="text-xs text-gray-500">{data?.authorRole || 'Verified Customer'}</p>
 </div>
 </div>
 </div>
 ),
 settingsComponent: ({ data, onChange }: any) => (
 <div className="flex flex-col gap-2">
 <label className="text-sm font-medium">Review Text</label>
 <textarea 
 className="border rounded p-2 text-sm"
 value={data?.reviewText || ''} 
 onChange={(e) => onChange({ ...data, reviewText: e.target.value })} 
 />
 <label className="text-sm font-medium">Author Name</label>
 <input 
 className="border rounded p-2 text-sm"
 value={data?.authorName || ''} 
 onChange={(e) => onChange({ ...data, authorName: e.target.value })} 
 />
 </div>
 )
};
