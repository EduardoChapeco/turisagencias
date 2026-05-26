import React from 'react';
import { BlockDef } from '../core/types';
import { MessageCircle } from 'lucide-react';

export const CtaFloatingWhatsappBlock: BlockDef = {
  type: 'ctaFloatingWhatsapp',
  label: 'Floating WhatsApp',
  category: 'cta',
  icon: MessageCircle,
  
  defaultProps: {
  },
  
  defaultStyles: {
  },

  renderComponent: () => {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          className="w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform hover:bg-green-600 group relative"
          aria-label="WhatsApp"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="absolute right-full mr-4 bg-white text-zinc-900 text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Fale conosco
          </span>
        </button>
      </div>
    );
  },

  settingsComponent: () => {
    return (
      <div className="text-xs text-zinc-400 p-2 text-center">
        Este bloco não possui configurações e ficará flutuando no canto inferior direito da tela.
      </div>
    );
  }
};
