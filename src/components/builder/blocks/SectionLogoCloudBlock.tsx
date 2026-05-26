import React from 'react';
import { Building2 } from 'lucide-react';

export const SectionLogoCloudBlock = {
  type: 'section_logo_cloud',
  category: 'layout',
  label: 'Logo Cloud',
  icon: Building2,
  renderComponent: (props: any) => {
    return (
      <div className="w-full py-12 px-4 bg-white border-y border-gray-100">
        <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">Trusted by innovative teams worldwide</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 max-w-5xl mx-auto opacity-50 grayscale">
          <div className="h-8 font-bold text-xl">ACME Corp</div>
          <div className="h-8 font-bold text-xl">GlobalTech</div>
          <div className="h-8 font-bold text-xl">Quantum</div>
          <div className="h-8 font-bold text-xl">Innovate</div>
          <div className="h-8 font-bold text-xl">Nexus</div>
        </div>
      </div>
    );
  },
  settingsComponent: (props: any) => {
    return (
      <div className="p-4 space-y-4">
        <div className="text-sm font-medium">Logo Cloud Settings</div>
        <div className="text-sm text-gray-500">Manage logos and layout.</div>
      </div>
    );
  }
};
