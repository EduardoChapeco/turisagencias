import React from 'react';
import { Music } from 'lucide-react';

export const MediaAudioPlayerBlock = {
  type: 'media_audio_player',
  category: 'media',
  label: 'Audio Player',
  icon: Music,
  renderComponent: () => (
    <div className="p-4 border border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center min-h-[150px]">
      <div className="text-center text-gray-500">
        <Music className="mx-auto h-8 w-8 mb-2 opacity-50" />
        <p>Audio Player Block</p>
      </div>
    </div>
  ),
  settingsComponent: () => (
    <div className="p-4 text-sm text-gray-500">
      Audio Player settings...
    </div>
  )
};
