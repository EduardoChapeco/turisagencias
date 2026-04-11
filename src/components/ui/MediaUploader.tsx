import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, Loader2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MediaUploaderProps {
  onUploadComplete: (urls: string[]) => void;
  existingUrls?: string[];
  bucket?: string;
  folder?: string;
  multiple?: boolean;
}

export function MediaUploader({ 
  onUploadComplete, 
  existingUrls = [], 
  bucket = 'media', 
  folder = 'uploads',
  multiple = true 
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>(existingUrls);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        newUrls.push(publicUrl);
      }

      const updatedUrls = multiple ? [...previews, ...newUrls] : newUrls;
      setPreviews(updatedUrls);
      onUploadComplete(updatedUrls);
      toast({ title: 'Upload concluído!', description: `${newUrls.length} arquivos enviados.` });
    } catch (error: any) {
      toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (urlToRemove: string) => {
    const updatedUrls = previews.filter(url => url !== urlToRemove);
    setPreviews(updatedUrls);
    onUploadComplete(updatedUrls);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {previews.map((url, i) => (
          <div key={url + i} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-cb-border bg-cb-s1">
            <img src={url} alt="Preview" className="w-full h-full object-cover" />
            <button 
              onClick={() => removeImage(url)}
              className="absolute top-1 right-1 p-1 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "w-24 h-24 rounded-lg border-2 border-dashed border-cb-border flex flex-col items-center justify-center gap-1 hover:border-cb-accent/50 hover:bg-cb-accent/5 transition-all text-cb-muted",
            uploading && "opacity-50 cursor-not-allowed"
          )}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <Plus className="h-6 w-6" />
              <span className="text-[10px] font-medium uppercase">Adicionar</span>
            </>
          )}
        </button>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        multiple={multiple} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
}
