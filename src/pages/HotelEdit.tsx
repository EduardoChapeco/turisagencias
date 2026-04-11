import { useState, useEffect } from 'react';
import { Building2, Save } from 'lucide-react';
import { SheetPage } from '@/components/ui/SheetPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateHotel, useUpdateHotel } from '@/hooks/useHotels';
import { supabase } from '@/integrations/supabase/client';

export interface HotelEditProps {
  id: string | null; // null for Create
  open: boolean;
  onClose: () => void;
  onSuccess?: (id: string) => void;
}

export function HotelEdit({ id, open, onClose, onSuccess }: HotelEditProps) {
  const isUpdate = !!id;
  const createHotel = useCreateHotel();
  const updateHotel = useUpdateHotel();

  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    city: '',
    state: '',
    country: 'Brasil',
    zip_code: '',
    phone: '',
    website: '',
    email: '',
    cover_image_url: '',
    tags: '',
    regime_options: '',
    amenities: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && isUpdate && id) {
      setLoading(true);
      supabase
        .from('hotels_bank')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          if (data) {
            setForm({
              name: data.name,
              category: data.category?.toString() ?? '',
              description: data.description ?? '',
              city: data.city ?? '',
              state: data.state ?? '',
              country: data.country ?? 'Brasil',
              zip_code: data.zip_code ?? '',
              phone: data.phone ?? '',
              website: data.website ?? '',
              email: data.email ?? '',
              cover_image_url: data.cover_image_url ?? '',
              tags: data.tags ? data.tags.join(', ') : '',
              regime_options: data.regime_options ? data.regime_options.join(', ') : '',
              amenities: (data as any).amenities ? (data as any).amenities.join(', ') : '',
            });
          }
        })
        .finally(() => setLoading(false));
    } else if (open && !isUpdate) {
      // Reset form
      setForm({
        name: '', category: '', description: '', city: '', state: '', country: 'Brasil',
        zip_code: '', phone: '', website: '', email: '', cover_image_url: '',
        tags: '', regime_options: '', amenities: ''
      });
    }
  }, [open, isUpdate, id]);

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    const payload = {
      name: form.name,
      category: form.category ? Number(form.category) : null,
      description: form.description || null,
      city: form.city || null,
      state: form.state || null,
      country: form.country || null,
      zip_code: form.zip_code || null,
      phone: form.phone || null,
      website: form.website || null,
      email: form.email || null,
      cover_image_url: form.cover_image_url || null,
      tags: form.tags ? form.tags.split(',').map((x) => x.trim()).filter(Boolean) : [],
      regime_options: form.regime_options ? form.regime_options.split(',').map((x) => x.trim()).filter(Boolean) : [],
      amenities: form.amenities ? form.amenities.split(',').map((x) => x.trim()).filter(Boolean) : [],
    };

    if (isUpdate) {
      const dbRes = await updateHotel.mutateAsync({ id: id!, ...payload });
      onSuccess?.(dbRes.id);
      onClose();
    } else {
      const dbRes = await createHotel.mutateAsync(payload as any);
      onSuccess?.(dbRes.id);
      onClose();
    }
  };

  return (
    <SheetPage
      open={open}
      onClose={onClose}
      title={isUpdate ? 'Editar Hotel' : 'Novo Hotel'}
      subtitle="Dados do estabelecimento no banco de parceiros"
      icon={Building2}
      sections={[
        { id: 'geral', label: 'Dados Básicos' },
        { id: 'contato', label: 'Local e Contato' },
        { id: 'detalhes', label: 'Comodidades e Info' },
      ]}
      footer={
        <div className="flex w-full justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={() => void handleSave()}
            disabled={loading || !form.name || createHotel.isPending || updateHotel.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {isUpdate ? 'Atualizar hotel' : 'Salvar hotel'}
          </Button>
        </div>
      }
    >
      {(activeSection) => {
        if (loading) return <div className="text-sm text-cb-muted animate-pulse">Carregando dados...</div>;

        return (
          <>
            {activeSection === 'geral' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Nome do Hotel *</Label>
                  <Input value={form.name} onChange={(e) => update('name', e.target.value)} className="border-cb-border" />
                </div>
                <div className="space-y-1.5">
                  <Label>Categoria (Estrelas)</Label>
                  <Input type="number" min="1" max="5" value={form.category} onChange={(e) => update('category', e.target.value)} className="border-cb-border" />
                </div>
                <div className="space-y-1.5">
                  <Label>Descrição</Label>
                  <Textarea rows={5} value={form.description} onChange={(e) => update('description', e.target.value)} className="resize-none border-cb-border" />
                </div>
                <div className="space-y-1.5">
                  <Label>URL da Imagem de Capa</Label>
                  <Input value={form.cover_image_url} onChange={(e) => update('cover_image_url', e.target.value)} placeholder="https://..." className="border-cb-border" />
                </div>
              </div>
            )}
            
            {activeSection === 'contato' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Cidade</Label>
                    <Input value={form.city} onChange={(e) => update('city', e.target.value)} className="border-cb-border" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Estado</Label>
                    <Input value={form.state} onChange={(e) => update('state', e.target.value)} className="border-cb-border" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>País</Label>
                    <Input value={form.country} onChange={(e) => update('country', e.target.value)} className="border-cb-border" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>CEP / ZipCode</Label>
                    <Input value={form.zip_code} onChange={(e) => update('zip_code', e.target.value)} className="border-cb-border" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Telefone</Label>
                    <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="border-cb-border" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>E-mail</Label>
                    <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="border-cb-border" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Website</Label>
                  <Input type="url" value={form.website} onChange={(e) => update('website', e.target.value)} placeholder="https://" className="border-cb-border" />
                </div>
              </div>
            )}

            {activeSection === 'detalhes' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Comodidades (separadas por vírgula)</Label>
                  <Input value={form.amenities} onChange={(e) => update('amenities', e.target.value)} placeholder="Piscina, Wi-Fi, Spa..." className="border-cb-border" />
                </div>
                <div className="space-y-1.5">
                  <Label>Opções de Regime (separadas por vírgula)</Label>
                  <Input value={form.regime_options} onChange={(e) => update('regime_options', e.target.value)} placeholder="Café, Meia Pensão, All Inclusive..." className="border-cb-border" />
                </div>
                <div className="space-y-1.5">
                  <Label>Tags Internas (separadas por vírgula)</Label>
                  <Input value={form.tags} onChange={(e) => update('tags', e.target.value)} placeholder="Praia, Romântico, Luxo..." className="border-cb-border" />
                </div>
              </div>
            )}
          </>
        );
      }}
    </SheetPage>
  );
}
