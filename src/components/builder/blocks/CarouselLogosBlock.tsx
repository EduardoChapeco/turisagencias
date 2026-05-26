import React from 'react';
import { Briefcase } from 'lucide-react';

export const CarouselLogosBlock = {
  type: 'carousel_logos',
  category: 'media',
  label: 'Logo Ticker',
  icon: Briefcase,
  renderComponent: () => (
    <div className="p-4 border border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center min-h-[150px]">
      <div className="text-center text-gray-500">
        <Briefcase className="mx-auto h-8 w-8 mb-2 opacity-50" />
        <p>Logo Ticker Block</p>
      </div>
    </div>
  ),
  settingsComponent: () => (
    <div className="p-4 text-sm text-gray-500">
      Logo Ticker settings...
    </div>
  )
};
