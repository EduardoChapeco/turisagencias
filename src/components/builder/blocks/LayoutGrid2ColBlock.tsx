import React from 'react';
import { Columns } from 'lucide-react';

export const LayoutGrid2ColBlock = {
  type: 'layout_grid_2_col',
  category: 'layout',
  label: '2 Column Grid',
  icon: Columns,
  renderComponent: (props: any) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 w-full">
        <div className="border-2 border-dashed border-gray-300 p-4 min-h-[100px] flex items-center justify-center text-gray-400">Column 1</div>
        <div className="border-2 border-dashed border-gray-300 p-4 min-h-[100px] flex items-center justify-center text-gray-400">Column 2</div>
      </div>
    );
  },
  settingsComponent: (props: any) => {
    return (
      <div className="p-4 space-y-4">
        <div className="text-sm font-medium">2 Column Grid Settings</div>
        <div className="text-sm text-gray-500">Configure gap and alignment here.</div>
      </div>
    );
  }
};
