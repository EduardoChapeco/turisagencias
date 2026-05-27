import React, { useState } from 'react';
import { LayoutGrid, Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const GalleryMasonryBlock = {
  type: 'gallery_masonry',
  category: 'media',
  label: 'Masonry Gallery',
  icon: LayoutGrid,
  defaultProps: {
    images: [
      { url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1', alt: 'Travel 1' },
      { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', alt: 'Travel 2' },
      { url: 'https://images.unsplash.com/photo-1499678329028-1014352cac0e', alt: 'Travel 3' },
    ],
    columns: 3,
    gap: '16px'
  },
  defaultStyles: {
    padding: '24px',
    backgroundColor: '#ffffff'
  },
  renderComponent: ({ node }) => {
    const { images = [], columns = 3, gap = '16px' } = node.props || {};
    
    return (
      <div 
        style={node.styles}
        className="w-full"
      >
        {images.length === 0 ? (
          <div className="p-4 border border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center min-h-[150px]">
            <div className="text-center text-gray-500">
              <LayoutGrid className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>Adicione imagens na barra lateral</p>
            </div>
          </div>
        ) : (
          <div 
            style={{
              columnCount: columns,
              columnGap: gap
            }}
          >
            {images.map((img: any, idx: number) => (
              <div key={idx} style={{ marginBottom: gap, breakInside: 'avoid' }}>
                <img 
                  src={img.url} 
                  alt={img.alt || `Gallery image ${idx}`}
                  className="w-full rounded-lg shadow-sm object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
  settingsComponent: ({ node, onChange }) => {
    const { images = [], columns = 3, gap = '16px' } = node.props || {};

    const addImage = () => {
      onChange({ props: { ...node.props, images: [...images, { url: '', alt: '' }] } });
    };

    const updateImage = (index: number, field: string, value: string) => {
      const newImages = [...images];
      newImages[index] = { ...newImages[index], [field]: value };
      onChange({ props: { ...node.props, images: newImages } });
    };

    const removeImage = (index: number) => {
      onChange({ props: { ...node.props, images: images.filter((_: any, i: number) => i !== index) } });
    };

    return (
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>Colunas</Label>
          <Input 
            type="number" 
            min={1} 
            max={6}
            value={columns} 
            onChange={e => onChange({ props: { ...node.props, columns: parseInt(e.target.value) } })}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Espaçamento (Gap)</Label>
          <Input 
            type="text" 
            value={gap} 
            onChange={e => onChange({ props: { ...node.props, gap: e.target.value } })}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center justify-between">
            Imagens
            <Button variant="ghost" size="sm" onClick={addImage}><Plus className="h-4 w-4" /></Button>
          </Label>
          
          <div className="space-y-3">
            {images.map((img: any, idx: number) => (
              <div key={idx} className="flex flex-col gap-2 p-2 border rounded relative bg-gray-50">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute top-1 right-1 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeImage(idx)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
                <div className="space-y-1 mt-4">
                  <Label className="text-xs">URL da Imagem</Label>
                  <Input 
                    className="h-8 text-sm"
                    value={img.url} 
                    onChange={e => updateImage(idx, 'url', e.target.value)} 
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Texto Alternativo</Label>
                  <Input 
                    className="h-8 text-sm"
                    value={img.alt} 
                    onChange={e => updateImage(idx, 'alt', e.target.value)} 
                    placeholder="Ex: Praia de Copacabana"
                  />
                </div>
              </div>
            ))}
            {images.length === 0 && <p className="text-xs text-gray-500">Nenhuma imagem adicionada.</p>}
          </div>
        </div>
      </div>
    );
  }
};
