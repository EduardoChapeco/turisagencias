import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useCreateQuotation } from '@/hooks/useQuotations';
import { useClients } from '@/hooks/useClients';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, Sparkles, Loader2 } from 'lucide-react';
import type { InstallmentOption, QuotationFormValues } from '@/types';

export default function QuotationNew() {
  const navigate = useNavigate();
  const createQuotation = useCreateQuotation();
  const { data: clients } = useClients();
  const { toast } = useToast();
  const [extracting, setExtracting] = useState(false);
  const [aiExtracted, setAiExtracted] = useState(false);
  const [aiRawResponse, setAiRawResponse] = useState<QuotationFormValues['ai_raw_response']>(null);
  const [form, setForm] = useState({
    destination: '', hotel_name: '', hotel_stars: '',
    check_in: '', check_out: '', num_nights: '',
    meal_plan: '', room_type: '', total_value: '',
    currency: 'BRL', client_id: '', whatsapp_text: '',
  });
  const [installments, setInstallments] = useState<InstallmentOption[]>([]);

  const update = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtracting(true);
    setAiExtracted(false);
    setAiRawResponse(null);
    setInstallments([]);

    try {
      // Convert to base64
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(file);
      });

      // Call AI extraction
      const { data, error } = await supabase.functions.invoke('extract-quotation', {
        body: { imageBase64: base64 },
      });

      if (error) throw error;
      if (data?.data) {
        const d = data.data as Partial<QuotationFormValues>;

        setForm(p => ({
          ...p,
          destination: d.destination || '',
          hotel_name: d.hotel_name || '',
          hotel_stars: d.hotel_stars?.toString() || '',
          check_in: d.check_in || '',
          check_out: d.check_out || '',
          num_nights: d.num_nights?.toString() || '',
          meal_plan: d.meal_plan || '',
          room_type: d.room_type || '',
          total_value: d.total_value?.toString() || '',
          currency: d.currency || 'BRL',
          whatsapp_text: d.whatsapp_text || '',
        }));

        setInstallments(d.installments ?? []);
        setAiExtracted(true);
        setAiRawResponse(d);
        toast({ title: '✨ Dados extraídos com IA!', description: 'Revise os campos antes de salvar.' });
      }
    } catch (error: unknown) {
      const description = error instanceof Error ? error.message : 'Não foi possível extrair os dados da cotação.';
      toast({ title: 'Erro na extração', description, variant: 'destructive' });
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createQuotation.mutateAsync({
      destination: form.destination || undefined,
      hotel_name: form.hotel_name || undefined,
      hotel_stars: form.hotel_stars ? parseInt(form.hotel_stars) : undefined,
      check_in: form.check_in || undefined,
      check_out: form.check_out || undefined,
      num_nights: form.num_nights ? parseInt(form.num_nights) : undefined,
      meal_plan: form.meal_plan || undefined,
      room_type: form.room_type || undefined,
      total_value: form.total_value ? parseFloat(form.total_value) : undefined,
      currency: form.currency,
      installments: installments.length > 0 ? JSON.parse(JSON.stringify(installments)) : undefined,
      whatsapp_text: form.whatsapp_text || undefined,
      client_id: form.client_id || undefined,
      ai_extracted: aiExtracted,
      ai_raw_response: aiRawResponse,
    });
    if (result) navigate(`/quotations/${result.id}`);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/quotations')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-heading text-2xl font-bold">Nova Cotação</h1>
        </div>

        {/* AI Extraction Card */}
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" /> Extração por IA
            </CardTitle>
            <CardDescription>Faça upload de um print ou PDF da cotação para preencher automaticamente.</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex items-center justify-center border-2 border-dashed border-accent/30 rounded-lg p-6 hover:bg-accent/10 transition-colors">
                {extracting ? (
                  <div className="flex items-center gap-2 text-accent">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Extraindo dados com IA...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Upload className="h-5 w-5" />
                    <span>Clique para enviar imagem ou PDF</span>
                  </div>
                )}
              </div>
            </Label>
            <input id="file-upload" type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} disabled={extracting} />
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Destino</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Destino</Label>
                <Input value={form.destination} onChange={(e) => update('destination', e.target.value)} placeholder="Cancún, México" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hotel</Label>
                  <Input value={form.hotel_name} onChange={(e) => update('hotel_name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Estrelas</Label>
                  <Select value={form.hotel_stars} onValueChange={(v) => update('hotel_stars', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {[3, 4, 5].map(s => <SelectItem key={s} value={s.toString()}>{s} estrelas</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Check-in</Label>
                  <Input type="date" value={form.check_in} onChange={(e) => update('check_in', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Check-out</Label>
                  <Input type="date" value={form.check_out} onChange={(e) => update('check_out', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Noites</Label>
                  <Input type="number" value={form.num_nights} onChange={(e) => update('num_nights', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Regime</Label>
                  <Select value={form.meal_plan} onValueChange={(v) => update('meal_plan', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_inclusive">All Inclusive</SelectItem>
                      <SelectItem value="half_board">Meia Pensão</SelectItem>
                      <SelectItem value="bed_breakfast">Café da Manhã</SelectItem>
                      <SelectItem value="room_only">Só Hospedagem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Quarto</Label>
                  <Input value={form.room_type} onChange={(e) => update('room_type', e.target.value)} placeholder="Superior" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Valores</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor Total</Label>
                  <Input type="number" step="0.01" value={form.total_value} onChange={(e) => update('total_value', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Moeda</Label>
                  <Select value={form.currency} onValueChange={(v) => update('currency', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">BRL (R$)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {installments.length > 0 && (
                <div className="space-y-2">
                  <Label>Parcelas (extraídas por IA)</Label>
                  <div className="text-sm space-y-1">
                      {installments.map((inst, i) => (
                      <p key={i} className="text-muted-foreground">
                        {inst.type}: {inst.installment_count}x de R$ {inst.value?.toFixed(2)}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Cliente e WhatsApp</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select value={form.client_id} onValueChange={(v) => update('client_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione um cliente (opcional)" /></SelectTrigger>
                  <SelectContent>
                    {clients?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Texto WhatsApp</Label>
                <Textarea value={form.whatsapp_text} onChange={(e) => update('whatsapp_text', e.target.value)} rows={8} placeholder="Texto formatado para enviar ao cliente..." />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/quotations')}>Cancelar</Button>
            <Button type="submit" disabled={createQuotation.isPending}>
              {createQuotation.isPending ? 'Salvando...' : 'Salvar Cotação'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
