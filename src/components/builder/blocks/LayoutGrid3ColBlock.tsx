import React from 'react';
import { Grid3X3 } from 'lucide-react';

export const LayoutGrid3ColBlock = {
  type: 'layout_grid_3_col',
  category: 'layout',
  label: '3 Column Grid',
  icon: Grid3X3,
  renderComponent: (props: any) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 w-full">
        <div className="border-2 border-dashed border-gray-300 p-4 min-h-[100px] flex items-center justify-center text-gray-400">Column 1</div>
        <div className="border-2 border-dashed border-gray-300 p-4 min-h-[100px] flex items-center justify-center text-gray-400">Column 2</div>
        <div className="border-2 border-dashed border-gray-300 p-4 min-h-[100px] flex items-center justify-center text-gray-400">Column 3</div>
      </div>
    );
  },
  settingsComponent: (props: any) => {
    return (
      <div className="p-4 space-y-4">
        <div className="text-sm font-medium">3 Column Grid Settings</div>
        <div className="text-sm text-gray-500">Configure gap and alignment here.</div>
      </div>
    );
  }
};
