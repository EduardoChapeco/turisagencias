import React from 'react';
import { MessageSquare } from 'lucide-react';

export const CarouselTestimonialsBlock = {
  type: 'carousel_testimonials',
  category: 'media',
  label: 'Testimonial Carousel',
  icon: MessageSquare,
  renderComponent: () => (
    <div className="p-4 border border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center min-h-[150px]">
      <div className="text-center text-gray-500">
        <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-50" />
        <p>Testimonial Carousel Block</p>
      </div>
    </div>
  ),
  settingsComponent: () => (
    <div className="p-4 text-sm text-gray-500">
      Testimonial Carousel settings...
    </div>
  )
};
