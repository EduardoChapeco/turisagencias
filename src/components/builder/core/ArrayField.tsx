import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export type FieldSchema = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'url' | 'boolean';
  placeholder?: string;
};

interface ArrayFieldProps {
  title: string;
  items: any[];
  schema: FieldSchema[];
  onChange: (newItems: any[]) => void;
  defaultItem: any;
}

export function ArrayField({ title, items = [], schema, onChange, defaultItem }: ArrayFieldProps) {
  const updateItem = (index: number, key: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: value };
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const addItem = () => {
    onChange([...items, { ...defaultItem, id: String(Date.now()) }]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] uppercase text-zinc-500 font-bold">{title}</Label>
        <button 
          onClick={addItem}
          className="flex items-center gap-1 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-white px-2 py-1 rounded"
        >
          <Plus className="w-3 h-3" /> Adicionar
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.id || index} className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg relative">
            <button 
              onClick={() => removeItem(index)}
              className="absolute top-2 right-2 text-zinc-500 hover:text-red-400 z-10 bg-zinc-900 rounded-full"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            <div className="space-y-2 pr-6">
              {schema.map(field => (
                <div key={field.key} className="space-y-1">
                  <Label className="text-[10px] text-zinc-400">{field.label}</Label>
                  {field.type === 'textarea' ? (
                    <Textarea 
                      value={item[field.key] || ''} 
                      onChange={e => updateItem(index, field.key, e.target.value)}
                      className="bg-zinc-950 border-zinc-800 text-white text-xs min-h-[60px]"
                      placeholder={field.placeholder}
                    />
                  ) : field.type === 'boolean' ? (
                    <div className="flex items-center gap-2 pt-1 pb-2">
                      <input 
                        type="checkbox"
                        checked={item[field.key] || false}
                        onChange={e => updateItem(index, field.key, e.target.checked as any)}
                        className="rounded border-zinc-700 bg-zinc-900 text-vj-green focus:ring-vj-green/50"
                      />
                      <span className="text-xs text-white">Sim</span>
                    </div>
                  ) : (
                    <Input 
                      value={item[field.key] || ''} 
                      onChange={e => updateItem(index, field.key, e.target.value)}
                      className="bg-zinc-950 border-zinc-800 text-white text-xs h-8"
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-zinc-500 text-center py-4">Nenhum item configurado.</p>
        )}
      </div>
    </div>
  );
}
