import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Link2, Search, Loader2, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

// Curated high-resolution travel photos from Unsplash
const TOURISM_PRESETS = [
  // Praias
  {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150&auto=format&fit=crop&q=60',
    title: 'Praia Tropical Maldivas',
    category: 'praia'
  },
  {
    url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1080&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=150&auto=format&fit=crop&q=60',
    title: 'Bora Bora Resort',
    category: 'praia'
  },
  {
    url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1080&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=150&auto=format&fit=crop&q=60',
    title: 'Copacabana Rio',
    category: 'praia'
  },
  // Cidades e Cultura
  {
    url: 'https://images.unsplash.com/photo-1499856871958-5b9647a640d0?w=1080&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1499856871958-5b9647a640d0?w=150&auto=format&fit=crop&q=60',
    title: 'Torre Eiffel Paris',
    category: 'cidade'
  },
  {
    url: 'https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?w=1080&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?w=150&auto=format&fit=crop&q=60',
    title: 'Coliseu Roma',
    category: 'cidade'
  },
  {
    url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1080&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=150&auto=format&fit=crop&q=60',
    title: 'Opera House Sydney',
    category: 'cidade'
  },
  // Aventura e Natureza
  {
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1080&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=150&auto=format&fit=crop&q=60',
    title: 'Montanhas Alpinas',
    category: 'natureza'
  },
  {
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=150&auto=format&fit=crop&q=60',
    title: 'Vale de Yosemite',
    category: 'natureza'
  },
  {
    url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1080&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=150&auto=format&fit=crop&q=60',
    title: 'Santorini Pôr do Sol',
    category: 'natureza'
  },
  // Hoteis e Resorts
  {
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1080&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150&auto=format&fit=crop&q=60',
    title: 'Piscina Resort de Luxo',
    category: 'hotel'
  },
  {
    url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1080&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=150&auto=format&fit=crop&q=60',
    title: 'Bungalow nas águas',
    category: 'hotel'
  },
  {
    url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1080&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=150&auto=format&fit=crop&q=60',
    title: 'Quarto Deluxe Suite',
    category: 'hotel'
  },
  // Aviacao
  {
    url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1080&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=150&auto=format&fit=crop&q=60',
    title: 'Avião de Passageiros em Voo',
    category: 'voo'
  },
  {
    url: 'https://images.unsplash.com/photo-1483450388369-9ed95738483c?w=1080&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1483450388369-9ed95738483c?w=150&auto=format&fit=crop&q=60',
    title: 'Janela da Asa do Avião',
    category: 'voo'
  },
  {
    url: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1080&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=150&auto=format&fit=crop&q=60',
    title: 'Cabine Primeira Classe',
    category: 'voo'
  }
];

const getAiSuggestions = (kind: string | undefined): string[] => {
  switch (kind) {
    case 'hero':
      return ['Paradisíaca', 'Voo', 'Paris', 'Resort'];
    case 'gallery':
      return ['Santorini', 'Rio', 'Montanhas', 'Bora Bora'];
    case 'features':
      return ['Sydney', 'Yosemite', 'Roma', 'Coliseu'];
    case 'testimonials':
      return ['Praia', 'Resort', 'Santorini', 'Copacabana'];
    case 'pricing':
    case 'packages':
      return ['Resort', 'Suite', 'Classe', 'Bungalow'];
    case 'blog':
      return ['Eiffel', 'Coliseu', 'Voo', 'Yosemite'];
    default:
      return ['Praia', 'Paris', 'Resort', 'Montanhas'];
  }
};

interface MediaPickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  blockKind?: string;
}

export function MediaPicker({ value, onChange, label = 'Imagem / Mídia', blockKind }: MediaPickerProps) {
  const { organization } = useAuthStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'upload' | 'unsplash' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customUrl, setCustomUrl] = useState(value || '');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'As imagens devem ter no máximo 5MB.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setUploading(true);
      const orgId = organization?.id || 'public-assets';
      const fileExt = file.name.split('.').pop();
      const fileName = `media/${orgId}/${crypto.randomUUID()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('org-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      if (data) {
        const { data: { publicUrl } } = supabase.storage.from('org-assets').getPublicUrl(fileName);
        onChange(publicUrl);
        setCustomUrl(publicUrl);
        toast({
          title: 'Upload concluído!',
          description: 'A imagem foi salva e aplicada com sucesso.'
        });
      }
    } catch (err: any) {
      logger.error('Error uploading image to storage:', err);
      toast({
        title: 'Falha no upload',
        description: err.message || 'Erro desconhecido ao subir arquivo.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const filteredPresets = TOURISM_PRESETS.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white">
      <div className="flex items-center justify-between">
        <label className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">{label}</label>
        {value && (
          <button 
            type="button" 
            onClick={() => { onChange(''); setCustomUrl(''); }} 
            className="text-[10px] text-red-500 hover:text-red-400 font-semibold"
          >
            Remover
          </button>
        )}
      </div>

      {/* Preview */}
      {value && (
        <div className="relative group border border-zinc-800 rounded-xl overflow-hidden aspect-video bg-zinc-950">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <span className="text-[10px] bg-zinc-900 border border-zinc-850 px-2 py-1 rounded-md text-zinc-300">Alterar</span>
          </div>
        </div>
      )}

      {/* Tabs selectors */}
      <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-850">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'upload' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Upload size={12} />
          Upload Local
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('unsplash')}
          className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'unsplash' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <ImageIcon size={12} />
          Biblioteca
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'url' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Link2 size={12} />
          Link / URL
        </button>
      </div>

      {/* Tabs Content */}
      <div className="pt-2 min-h-[120px]">
        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div 
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed border-zinc-800 hover:border-vj-green bg-zinc-950 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center ${
              uploading ? 'pointer-events-none opacity-60' : ''
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload} 
            />
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-vj-green animate-spin" />
                <p className="text-[10px] text-zinc-400 font-semibold uppercase">Enviando para o Storage...</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-zinc-600" />
                <div>
                  <p className="text-xs font-semibold text-zinc-200">Arraste ou clique para subir</p>
                  <p className="text-[9px] text-zinc-500 mt-0.5">Formatos de imagem até 5MB</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Unsplash Presets Tab */}
        {activeTab === 'unsplash' && (
          <div className="space-y-2">
            {/* Search and Filters */}
            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar..."
                  className="bg-zinc-950 border-zinc-850 h-8 pl-7 text-[10px] text-white"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-zinc-950 border border-zinc-850 h-8 rounded-lg px-2 text-[10px] text-zinc-300 focus:outline-none"
              >
                <option value="all">Todas</option>
                <option value="praia">Praia</option>
                <option value="cidade">Cidades</option>
                <option value="natureza">Natureza</option>
                <option value="hotel">Resorts</option>
                <option value="voo">Vôos</option>
              </select>
            </div>

            {/* AI Suggestions Chips */}
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-500 font-semibold flex items-center gap-1">
                <Sparkles size={10} className="text-amber-400" /> Sugestões de Busca IA:
              </span>
              <div className="flex flex-wrap gap-1">
                {getAiSuggestions(blockKind).map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearchQuery(term);
                      logger.info(`[AI SUGGESTION] Applied Unsplash search term: ${term}`);
                    }}
                    className="text-[9px] bg-zinc-950 border border-zinc-850 hover:border-amber-400/50 hover:bg-zinc-900/60 px-2 py-0.5 rounded-full text-zinc-300 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-1.5 max-h-[180px] overflow-y-auto pr-1">
              {filteredPresets.map((preset, idx) => {
                const isSelected = value === preset.url;
                return (
                  <div 
                    key={idx}
                    onClick={() => onChange(preset.url)}
                    className={`relative rounded-lg overflow-hidden aspect-video bg-zinc-950 cursor-pointer border hover:border-vj-green group transition-all ${
                      isSelected ? 'border-vj-green' : 'border-zinc-850'
                    }`}
                    title={preset.title}
                  >
                    <img src={preset.thumbnail} alt={preset.title} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-vj-green/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow-md" />
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredPresets.length === 0 && (
                <p className="text-zinc-500 text-[10px] italic col-span-3 text-center py-6">Nenhum resultado encontrado.</p>
              )}
            </div>
          </div>
        )}

        {/* External URL Tab */}
        {activeTab === 'url' && (
          <div className="space-y-2">
            <Input
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="Cole a URL direta da imagem (ex: https://site.com/foto.jpg)"
              className="bg-zinc-950 border-zinc-850 h-9 text-xs text-white"
            />
            <Button
              type="button"
              onClick={() => {
                if (customUrl.trim()) {
                  onChange(customUrl.trim());
                  toast({ title: 'URL aplicada!' });
                }
              }}
              className="w-full h-8 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold"
            >
              Aplicar URL
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
