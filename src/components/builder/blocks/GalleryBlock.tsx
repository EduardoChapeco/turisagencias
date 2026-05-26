import React from 'react';
import { BlockDef } from '../core/types';
import { Image as ImageIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';

export const GalleryBlock: BlockDef = {
  type: 'gallery',
  label: 'Bento Gallery',
  category: 'media',
  icon: ImageIcon,
  
  defaultProps: {
    images: [
      'https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop'
    ]
  },
  
  defaultStyles: {
    paddingTop: 'py-16',
    paddingBottom: 'pb-16',
    backgroundColor: 'bg-white',
  },

  renderComponent: ({ node }) => {
    const { images } = node.props;
    const { paddingTop, paddingBottom, backgroundColor } = node.styles;
    
    return (
      <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} px-6`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-[600px]">
            {images[0] && (
              <div className="md:col-span-2 md:row-span-2 rounded-3xl overflow-hidden relative group">
                <img src={images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gallery 1" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              </div>
            )}
            {images[1] && (
              <div className="md:col-span-2 rounded-3xl overflow-hidden relative group">
                <img src={images[1]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gallery 2" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              </div>
            )}
            {images[2] && (
              <div className="rounded-3xl overflow-hidden relative group">
                <img src={images[2]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gallery 3" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              </div>
            )}
            {images[3] && (
              <div className="rounded-3xl overflow-hidden relative group">
                <img src={images[3]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Gallery 4" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              </div>
            )}
          </div>
        </div>
      </section>
    );
  },

  settingsComponent: ({ node, onChange }) => {
    return (
      <div className="space-y-4">
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-400">
          Você tem {node.props.images?.length || 0} imagens na galeria. Clique em uma imagem no painel principal para substituí-la.
        </div>
      </div>
    );
  }
};
