import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

export const GalleryBeforeAfterBlock = {
  type: 'gallery_before_after',
  category: 'media',
  label: 'Before/After Slider',
  icon: SlidersHorizontal,
  renderComponent: () => (
    <div className="p-4 border border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center min-h-[150px]">
      <div className="text-center text-gray-500">
        <SlidersHorizontal className="mx-auto h-8 w-8 mb-2 opacity-50" />
        <p>Before/After Slider Block</p>
      </div>
    </div>
  ),
  settingsComponent: () => (
    <div className="p-4 text-sm text-gray-500">
      Before/After Slider settings...
    </div>
  )
};
