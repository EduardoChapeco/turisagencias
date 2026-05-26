import React from 'react';
import { Video } from 'lucide-react';

export const SectionHeroVideoBlock = {
  type: 'section_hero_video',
  category: 'layout',
  label: 'Hero Video',
  icon: Video,
  renderComponent: (props: any) => {
    return (
      <div className="relative w-full h-[500px] bg-slate-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-50 bg-black flex items-center justify-center text-white">
          <span className="text-xl border border-white p-4 rounded bg-black/50">Video Background Placeholder</span>
        </div>
        <div className="relative z-10 text-center text-white p-8 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Hero Title</h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">Engaging subtitle for the video hero section goes here.</p>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold text-white">Get Started</button>
        </div>
      </div>
    );
  },
  settingsComponent: (props: any) => {
    return (
      <div className="p-4 space-y-4">
        <div className="text-sm font-medium">Hero Video Settings</div>
        <div className="space-y-2">
          <label className="text-xs text-gray-500">Video URL</label>
          <input type="text" placeholder="https://..." className="w-full text-sm p-2 border rounded" />
        </div>
      </div>
    );
  }
};
