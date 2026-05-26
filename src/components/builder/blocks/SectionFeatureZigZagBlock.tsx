import React from 'react';
import { Spline } from 'lucide-react';

export const SectionFeatureZigZagBlock = {
  type: 'section_feature_zigzag',
  category: 'layout',
  label: 'Zig Zag Features',
  icon: Spline,
  renderComponent: (props: any) => {
    return (
      <div className="w-full py-16 px-4 space-y-16">
        <div className="flex flex-col md:flex-row items-center gap-8 max-w-5xl mx-auto">
          <div className="w-full md:w-1/2 h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">Image 1</div>
          <div className="w-full md:w-1/2 space-y-4">
            <h3 className="text-2xl font-bold">Feature One</h3>
            <p className="text-gray-600">Description for the first feature goes here. This explains the benefit to the user.</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row-reverse items-center gap-8 max-w-5xl mx-auto">
          <div className="w-full md:w-1/2 h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">Image 2</div>
          <div className="w-full md:w-1/2 space-y-4">
            <h3 className="text-2xl font-bold">Feature Two</h3>
            <p className="text-gray-600">Description for the second feature goes here. It is aligned opposite to the first one.</p>
          </div>
        </div>
      </div>
    );
  },
  settingsComponent: (props: any) => {
    return (
      <div className="p-4 space-y-4">
        <div className="text-sm font-medium">Zig Zag Features Settings</div>
        <div className="text-sm text-gray-500">Add or remove feature blocks.</div>
      </div>
    );
  }
};
