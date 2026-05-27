import React from 'react';
import { Headphones } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const MediaAudioPlayerBlock = {
  type: 'media_audio_player',
  category: 'media',
  label: 'Audio Player',
  icon: Headphones,
  defaultProps: {
    audioUrl: '',
    title: 'Podcast / Guia em Áudio'
  },
  defaultStyles: {
    padding: '24px',
    backgroundColor: '#ffffff'
  },
  renderComponent: ({ node }) => {
    const { audioUrl = '', title = '' } = node.props || {};

    return (
      <div style={node.styles} className="w-full flex justify-center">
        {!audioUrl ? (
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center w-full max-w-md min-h-[120px]">
            <div className="text-center text-gray-500">
              <Headphones className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Configure a URL do arquivo de áudio (MP3/WAV)</p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md bg-gray-100 p-6 rounded-2xl shadow-sm border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-4">{title}</h4>
            <audio controls className="w-full">
              <source src={audioUrl} type="audio/mpeg" />
              Seu navegador não suporta o elemento de áudio.
            </audio>
          </div>
        )}
      </div>
    );
  },
  settingsComponent: ({ node, onChange }) => {
    return (
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>URL do Arquivo de Áudio (.mp3, .wav)</Label>
          <Input 
            value={node.props?.audioUrl || ''}
            onChange={(e) => onChange({ props: { ...node.props, audioUrl: e.target.value } })}
            placeholder="https://meusite.com/audio.mp3"
          />
        </div>
        <div className="space-y-2">
          <Label>Título / Descrição</Label>
          <Input 
            value={node.props?.title || ''}
            onChange={(e) => onChange({ props: { ...node.props, title: e.target.value } })}
            placeholder="Ex: Áudio Guia de Roma"
          />
        </div>
      </div>
    );
  }
};
