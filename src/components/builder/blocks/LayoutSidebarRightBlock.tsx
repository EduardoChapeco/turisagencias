import React from 'react';
import { PanelRight } from 'lucide-react';

export const LayoutSidebarRightBlock = {
  type: 'layout_sidebar_right',
  category: 'layout',
  label: 'Sidebar Right',
  icon: PanelRight,
  renderComponent: (props: any) => {
    return (
      <div className="flex flex-col md:flex-row gap-4 p-4 w-full">
        <div className="w-full md:w-3/4 border-2 border-dashed border-gray-300 p-4 min-h-[200px] flex items-center justify-center text-gray-400">
          Main Content (3/4)
        </div>
        <div className="w-full md:w-1/4 border-2 border-dashed border-gray-300 p-4 min-h-[200px] flex items-center justify-center text-gray-400">
          Sidebar (1/4)
        </div>
      </div>
    );
  },
  settingsComponent: (props: any) => {
    return (
      <div className="p-4 space-y-4">
        <div className="text-sm font-medium">Right Sidebar Settings</div>
        <div className="text-sm text-gray-500">Configure sidebar width and breakpoint.</div>
      </div>
    );
  }
};
