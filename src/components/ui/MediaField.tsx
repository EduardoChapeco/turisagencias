import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, FileText, Image as ImageIcon, Link, Loader2, Plus, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageCropperModal } from '@/components/ui/ImageCropperModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface MediaFieldProps {
  label?: string;
  helperText?: string;
  value?: string[];
  onChange: (urls: string[]) => void;
  bucket?: string;
  folder?: string;
  multiple?: boolean;
  accept?: string;
  allowExternalUrl?: boolean;
  enableImageEditor?: boolean;
  aspectRatio?: number;
  circular?: boolean;
  ownerType?: string;
  ownerId?: string | null;
  fieldName?: string;
  visibility?: 'public' | 'private';
  className?: string;
  tileClassName?: string;
}

type PendingImage = {
  file: File;
  previewUrl: string;
};

function safeFolder(folder: string) {
  return folder.replace(/^\/+|\/+$/g, '') || 'uploads';
}

function safeFileName(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${id}.${ext}`;
}

function isImageUrl(url: string) {
  return /\.(png|jpe?g|webp|gif|avif|bmp|svg)(\?|#|$)/i.test(url) || url.includes('/image/');
}

function isPdfUrl(url: string) {
  return /\.pdf(\?|#|$)/i.test(url);
}

function normalizeUrl(url: string) {
  const clean = url.trim();
  if (!clean) return '';
  if (/^https?:\/\//i.test(clean)) return clean;
  return '';
}

async function readImageSize(fileOrBlob: Blob): Promise<{ width: number | null; height: number | null }> {
  if (!fileOrBlob.type.startsWith('image/')) return { width: null, height: null };
  const url = URL.createObjectURL(fileOrBlob);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  } catch {
    return { width: null, height: null };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function MediaField({
  label,
  helperText,
  value = [],
  onChange,
  bucket = 'media',
  folder = 'uploads',
  multiple = true,
  accept = 'image/*,application/pdf',
  allowExternalUrl = true,
  enableImageEditor = true,
  aspectRatio = 16 / 9,
  circular = false,
  ownerType,
  ownerId,
  fieldName,
  visibility = 'public',
  className,
  tileClassName,
}: MediaFieldProps) {
  const [urls, setUrls] = useState<string[]>(value.filter(Boolean));
  const [externalOpen, setExternalOpen] = useState(false);
  const [externalUrl, setExternalUrl] = useState('');
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { organization } = useAuthStore();
  const { toast } = useToast();
  const normalizedFolder = useMemo(() => safeFolder(folder), [folder]);

  useEffect(() => {
    setUrls(value.filter(Boolean));
  }, [value]);

  useEffect(() => {
    return () => {
      if (pendingImage?.previewUrl) URL.revokeObjectURL(pendingImage.previewUrl);
    };
  }, [pendingImage]);

  const commitUrls = (nextUrls: string[]) => {
    const clean = multiple ? nextUrls.filter(Boolean) : nextUrls.filter(Boolean).slice(0, 1);
    setUrls(clean);
    onChange(clean);
  };

  const recordAsset = async (asset: {
    publicUrl: string;
    path?: string | null;
    sourceUrl?: string | null;
    mimeType?: string | null;
    sizeBytes?: number | null;
    width?: number | null;
    height?: number | null;
    status?: string;
  }) => {
    if (!organization?.id) return;
    try {
      await (supabase as any).from('media_assets').insert({
        org_id: organization.id,
        owner_type: ownerType ?? null,
        owner_id: ownerId ?? null,
        field_name: fieldName ?? null,
        bucket,
        path: asset.path ?? null,
        public_url: asset.publicUrl,
        source_url: asset.sourceUrl ?? null,
        mime_type: asset.mimeType ?? null,
        size_bytes: asset.sizeBytes ?? null,
        width: asset.width ?? null,
        height: asset.height ?? null,
        visibility,
        migration_status: asset.status ?? 'local',
      });
    } catch {
      // The media still uploaded correctly; metadata is best-effort until migrations run everywhere.
    }
  };

  const uploadFile = async (file: File | Blob, fileName: string, original?: File) => {
    const filePath = `${normalizedFolder}/${fileName}`;
    const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
      contentType: file.type || original?.type,
      upsert: false,
    });
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
    const size = await readImageSize(file);
    await recordAsset({
      publicUrl,
      path: filePath,
      mimeType: file.type || original?.type || null,
      sizeBytes: file.size || original?.size || null,
      width: size.width,
      height: size.height,
      status: 'local',
    });
    return publicUrl;
  };

  const uploadOriginalFiles = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        uploaded.push(await uploadFile(file, safeFileName(file), file));
      }
      commitUrls(multiple ? [...urls, ...uploaded] : uploaded);
      toast({ title: 'Upload concluido', description: `${uploaded.length} arquivo(s) enviado(s).` });
    } catch (error: any) {
      toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const first = files[0];
    const shouldAdjust = enableImageEditor && first.type.startsWith('image/') && files.length === 1;
    if (shouldAdjust) {
      setPendingImage({ file: first, previewUrl: URL.createObjectURL(first) });
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    await uploadOriginalFiles(files);
  };

  const handleUseOriginal = async () => {
    if (!pendingImage) return;
    const file = pendingImage.file;
    setPendingImage(null);
    await uploadOriginalFiles([file]);
  };

  const handleCropped = (url: string) => {
    commitUrls(multiple ? [...urls, url] : [url]);
    setPendingImage(null);
  };

  const addExternalUrl = async () => {
    const nextUrl = normalizeUrl(externalUrl);
    if (!nextUrl) {
      toast({ title: 'Link invalido', description: 'Use um link iniciado por http:// ou https://.', variant: 'destructive' });
      return;
    }
    if (urls.includes(nextUrl)) {
      setExternalUrl('');
      return;
    }
    await recordAsset({ publicUrl: nextUrl, sourceUrl: nextUrl, status: 'external' });
    commitUrls(multiple ? [...urls, nextUrl] : [nextUrl]);
    setExternalUrl('');
    setExternalOpen(false);
  };

  const removeUrl = (url: string) => {
    commitUrls(urls.filter((item) => item !== url));
  };

  return (
    <div className={cn('space-y-3', className)}>
      {(label || helperText) && (
        <div className="space-y-1">
          {label && <Label>{label}</Label>}
          {helperText && <p className="text-xs text-vj-txt3">{helperText}</p>}
        </div>
      )}

      {pendingImage && (
        <div className="space-y-3">
          <ImageCropperModal
            open
            imageUrl={pendingImage.previewUrl}
            onOpenChange={(open) => !open && setPendingImage(null)}
            onCropComplete={handleCropped}
            aspectRatio={aspectRatio}
            circular={circular}
            folder={normalizedFolder}
            bucket={bucket}
            fileNamePrefix={fieldName ?? 'image'}
            onUploaded={(asset) => recordAsset({ ...asset, status: 'local' })}
          />
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={handleUseOriginal} disabled={uploading}>
              {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Usar original
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {urls.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className={cn(
              'group relative h-24 w-24 overflow-hidden rounded-lg border border-vj-border bg-vj-bg',
              'flex items-center justify-center',
              tileClassName,
            )}
          >
            {isPdfUrl(url) ? (
              <FileText className="h-9 w-9 text-vj-txt3" />
            ) : isImageUrl(url) ? (
              <img src={url} alt="Midia enviada" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-9 w-9 text-vj-txt3" />
            )}

            <div className="absolute inset-x-1 top-1 flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-vj-txt hover:text-vj-green"
                title="Abrir"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                type="button"
                onClick={() => removeUrl(url)}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                title="Remover"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        {(multiple || urls.length === 0) && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || !!pendingImage}
            className={cn(
              'flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-vj-border',
              'text-vj-txt3 transition-all hover:border-vj-green/50 hover:bg-vj-green/5',
              (uploading || pendingImage) && 'cursor-not-allowed opacity-60',
            )}
          >
            {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Plus className="h-6 w-6" />}
            <span className="text-[10px] font-semibold uppercase">Upload</span>
          </button>
        )}
      </div>

      {allowExternalUrl && (
        <div className="rounded-lg border border-dashed border-vj-border bg-zinc-50/60 p-2">
          {!externalOpen ? (
            <Button type="button" variant="ghost" size="sm" className="h-8 gap-2 text-xs" onClick={() => setExternalOpen(true)}>
              <Link className="h-3.5 w-3.5" />
              Usar link externo
            </Button>
          ) : (
            <div className="flex gap-2">
              <Input
                value={externalUrl}
                onChange={(event) => setExternalUrl(event.target.value)}
                placeholder="https://..."
                className="h-9 bg-white"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void addExternalUrl();
                  }
                }}
              />
              <Button type="button" size="sm" className="h-9 gap-1" onClick={() => void addExternalUrl()}>
                <Upload className="h-3.5 w-3.5" />
                Adicionar
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => setExternalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
      />
    </div>
  );
}
