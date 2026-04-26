import { MediaField } from '@/components/ui/MediaField';

interface MediaUploaderProps {
  onUploadComplete: (urls: string[]) => void;
  existingUrls?: string[];
  bucket?: string;
  folder?: string;
  multiple?: boolean;
  accept?: string;
  label?: string;
  helperText?: string;
  allowExternalUrl?: boolean;
  enableImageEditor?: boolean;
  aspectRatio?: number;
  circular?: boolean;
  ownerType?: string;
  ownerId?: string | null;
  fieldName?: string;
}

export function MediaUploader({
  onUploadComplete,
  existingUrls = [],
  bucket = 'media',
  folder = 'uploads',
  multiple = true,
  accept = 'image/*,application/pdf',
  label,
  helperText,
  allowExternalUrl = true,
  enableImageEditor = true,
  aspectRatio = 16 / 9,
  circular = false,
  ownerType,
  ownerId,
  fieldName,
}: MediaUploaderProps) {
  return (
    <MediaField
      label={label}
      helperText={helperText}
      value={existingUrls}
      onChange={onUploadComplete}
      bucket={bucket}
      folder={folder}
      multiple={multiple}
      accept={accept}
      allowExternalUrl={allowExternalUrl}
      enableImageEditor={enableImageEditor}
      aspectRatio={aspectRatio}
      circular={circular}
      ownerType={ownerType}
      ownerId={ownerId}
      fieldName={fieldName}
    />
  );
}
