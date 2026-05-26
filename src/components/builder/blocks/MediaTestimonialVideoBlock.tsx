import React from 'react';
import { Video } from 'lucide-react';

export const MediaTestimonialVideoBlock = {
  type: 'media_testimonial_video',
  category: 'media',
  label: 'Testimonial Video',
  icon: Video,
  renderComponent: () => (
    <div className="p-4 border border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center min-h-[150px]">
      <div className="text-center text-gray-500">
        <Video className="mx-auto h-8 w-8 mb-2 opacity-50" />
        <p>Testimonial Video Block</p>
      </div>
    </div>
  ),
  settingsComponent: () => (
    <div className="p-4 text-sm text-gray-500">
      Testimonial Video settings...
    </div>
  )
};
