import React from 'react';
import { FileText, Calendar } from 'lucide-react';

export const CardBlogArticleBlock = {
  type: 'cardBlogArticle',
  category: 'commerce',
  label: 'Blog Article Card',
  icon: FileText,
  renderComponent: ({ data }: any) => (
    <div className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="h-48 bg-gray-200 w-full flex items-center justify-center text-gray-400">Thumbnail</div>
      <div className="p-5">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <Calendar size={14} />
          <span>{data?.date || 'October 12, 2026'}</span>
        </div>
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{data?.title || '10 Tips for Budget Travel'}</h3>
        <p className="text-gray-600 text-sm line-clamp-3">
          {data?.excerpt || 'Discover the best ways to travel the world without breaking the bank...'}
        </p>
      </div>
    </div>
  ),
  settingsComponent: ({ data, onChange }: any) => (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Article Title</label>
      <input 
        className="border rounded p-2 text-sm"
        value={data?.title || ''} 
        onChange={(e) => onChange({ ...data, title: e.target.value })} 
      />
      <label className="text-sm font-medium">Excerpt</label>
      <textarea 
        className="border rounded p-2 text-sm"
        value={data?.excerpt || ''} 
        onChange={(e) => onChange({ ...data, excerpt: e.target.value })} 
      />
    </div>
  )
};
