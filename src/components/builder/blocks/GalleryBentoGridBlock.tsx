import React from 'react';
import { Layout } from 'lucide-react';

export const GalleryBentoGridBlock = {
  type: 'gallery_bento_grid',
  category: 'media',
  label: 'Bento Grid',
  icon: Layout,
  renderComponent: () => (
    <div className="p-4 border border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center min-h-[150px]">
      <div className="text-center text-gray-500">
        <Layout className="mx-auto h-8 w-8 mb-2 opacity-50" />
        <p>Bento Grid Block</p>
      </div>
    </div>
  ),
  settingsComponent: () => (
    <div className="p-4 text-sm text-gray-500">
      Bento Grid settings...
    </div>
  )
};
