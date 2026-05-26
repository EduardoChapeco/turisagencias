import React from 'react';
import { Camera } from 'lucide-react';

export const GalleryInstagramFeedBlock = {
  type: 'gallery_instagram_feed',
  category: 'media',
  label: 'Instagram Feed',
  icon: Camera,
  renderComponent: () => (
    <div className="p-4 border border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center min-h-[150px]">
      <div className="text-center text-gray-500">
        <Camera className="mx-auto h-8 w-8 mb-2 opacity-50" />
        <p>Instagram Feed Block</p>
      </div>
    </div>
  ),
  settingsComponent: () => (
    <div className="p-4 text-sm text-gray-500">
      Instagram Feed settings...
    </div>
  )
};
