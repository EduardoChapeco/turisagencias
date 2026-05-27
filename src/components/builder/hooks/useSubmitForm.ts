import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBuilderStore } from '../core/useBuilderStore';
import { toast } from 'sonner';

export interface UseSubmitFormOptions {
  blockId: string;
  source?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useSubmitForm({ blockId, source = 'website_form', onSuccess, onError }: UseSubmitFormOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const siteId = useBuilderStore(state => state.siteId);
  const pageId = useBuilderStore(state => state.pageId);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Precisamos do org_id para a Edge Function. Vamos buscar do site_id.
      let orgId = null;
      if (siteId) {
        const { data: siteData } = await (supabase as any)
          .from('builder_sites')
          .select('org_id')
          .eq('id', siteId)
          .single();
        if (siteData) orgId = siteData.org_id;
      }

      // Fallback: se não achar pelo site, tenta pela página
      if (!orgId && pageId) {
         const { data: pageData } = await (supabase as any)
          .from('builder_pages')
          .select('org_id')
          .eq('id', pageId)
          .single();
         if (pageData) orgId = pageData.org_id;
      }

      // Sem org_id = página não está publicada. Bloqueamos o envio real.
      if (!orgId) {
        toast.error('Este formulário não está conectado a uma página publicada. Publique a página primeiro.', {
          description: 'O formulário só pode receber dados quando vinculado a uma organização real.',
          duration: 6000,
        });
        setIsSubmitting(false);
        return;
      }

      // Chama a Edge Function que insere no banco e cria o Lead no CRM
      const shadowToken = localStorage.getItem('turis_b2c_shadow_token');

      const { data: result, error } = await supabase.functions.invoke('builder-submit-form', {
        body: {
          org_id: orgId,
          site_id: siteId,
          page_id: pageId,
          block_id: blockId,
          source,
          formData: data,
          shadowToken,
          utm: {} // To do: add utm capture logic
        }
      });

      if (error) throw error;
      if (result?.error) throw new Error(result.error);

      setIsSuccess(true);
      form.reset();
      
      // Fire Global Tracking Events
      if (typeof window !== 'undefined') {
        if (window.fbq) window.fbq('track', 'Lead');
        if (window.gtag) window.gtag('event', 'generate_lead', { event_category: 'engagement', event_label: source });
      }

      toast.success('Formulário enviado com sucesso!');
      onSuccess?.();

    } catch (error: any) {
      console.error('Form submission error:', error);
      toast.error('Erro ao enviar o formulário. Tente novamente.');
      onError?.(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting,
    isSuccess,
  };
}
