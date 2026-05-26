import React from 'react';
import { LayoutGrid } from 'lucide-react';

export const GalleryMasonryBlock = {
  type: 'gallery_masonry',
  category: 'media',
  label: 'Masonry Gallery',
  icon: LayoutGrid,
  renderComponent: () => (
    <div className="p-4 border border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center min-h-[150px]">
      <div className="text-center text-gray-500">
        <LayoutGrid className="mx-auto h-8 w-8 mb-2 opacity-50" />
        <p>Masonry Gallery Block</p>
      </div>
    </div>
  ),
  settingsComponent: () => (
    <div className="p-4 text-sm text-gray-500">
      Masonry Gallery settings...
    </div>
  )
};
