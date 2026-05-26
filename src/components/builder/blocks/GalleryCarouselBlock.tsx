import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

export const GalleryCarouselBlock = {
  type: 'gallery_carousel',
  category: 'media',
  label: 'Image Carousel',
  icon: ImageIcon,
  renderComponent: () => (
    <div className="p-4 border border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center min-h-[150px]">
      <div className="text-center text-gray-500">
        <ImageIcon className="mx-auto h-8 w-8 mb-2 opacity-50" />
        <p>Image Carousel Block</p>
      </div>
    </div>
  ),
  settingsComponent: () => (
    <div className="p-4 text-sm text-gray-500">
      Image Carousel settings...
    </div>
  )
};
