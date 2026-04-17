import { supabase } from '@/integrations/supabase/client';

export type SecureBucket = 'client-media' | 'finance-docs' | 'contracts';

export const StorageService = {
  /**
   * Faz upload de um arquivo para um bucket. 
   * Pode ser sobrescrito se já existir.
   */
  async uploadFile(bucket: SecureBucket, path: string, file: File): Promise<string> {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
        cacheControl: '3600',
      });

    if (error) {
      throw error;
    }

    return path;
  },

  /**
   * Pega a URL Pública (Usar apenas para avatares/capas estritamente não confidenciais).
   */
  getPublicUrl(bucket: SecureBucket, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Pega Signed URL (Usar para Documentos, Passaportes, RGs, Contratos por LGPD).
   * URL expira em 60 minutos (3600s).
   */
  async getSignedUrl(bucket: SecureBucket, path: string, expiresInSeconds = 3600): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSeconds);

    if (error) {
      throw error;
    }

    return data.signedUrl;
  },

  /**
   * Remove arquivo do storage
   */
  async removeFile(bucket: SecureBucket, path: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      throw error;
    }
  }
};
