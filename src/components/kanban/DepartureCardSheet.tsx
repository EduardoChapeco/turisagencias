import { useState, useEffect } from 'react';
import {
  Plane,
  CalendarDays,
  Hash,
  Package,
  Globe,
  Link2,
  Trash2,
  CheckSquare,
  FileText,
  ExternalLink,
  Send,
  Plus,
  X,
} from 'lucide-react';
import { SheetPage } from '@/components/ui/SheetPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClientSearchSelect } from '@/components/ui/ClientSearchSelect';
import { useGroupTrips } from '@/hooks/useGroupTrips';
import {
  useUpdateKanbanCard,
  useDeleteKanbanCard,
  useKanbanNotes,
  useCreateKanbanNote,
  useKanbanChecklists,
  useCreateKanbanChecklist,
  useToggleChecklistItem,
  useAddChecklistItem,
  useDeleteChecklistItem,
} from '@/hooks/useKanbanBoards';
import type { DepartureCardData, DepartureMeta } from './DepartureBoardCard';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/authStore';


/* ── Seção: Dados do Embarque ── */
function EmbarqueSection({ card }: { card: DepartureCardData }) {
  const updateCard = useUpdateKanbanCard();
  const meta = (card.metadata ?? card.meta ?? {}) as DepartureMeta;

  const [form, setForm] = useState({
    title: card.title,
    destination: meta.destination ?? '',
    package_name: meta.package_name ?? '',
    hotel_name: meta.hotel_name ?? '',
    check_in_date: meta.check_in_date ?? '',
    check_in_time: meta.check_in_time ?? '',
    flight_locator: meta.flight_locator ?? '',
    airline_name: meta.airline_name ?? '',
    airline_checkin_url: meta.airline_checkin_url ?? '',
    whatsapp: card.whatsapp ?? '',
    estimated_value: card.estimated_value?.toString() ?? '',
    description: card.description ?? '',
  });
  const [dirty, setDirty] = useState(false);

  const set = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    const newMeta: DepartureMeta = {
      destination: form.destination || undefined,
      package_name: form.package_name || undefined,
      hotel_name: form.hotel_name || undefined,
      check_in_date: form.check_in_date || undefined,
      check_in_time: form.check_in_time || undefined,
      flight_locator: form.flight_locator || undefined,
      airline_name: form.airline_name || undefined,
      airline_checkin_url: form.airline_checkin_url || undefined,
    };
    await updateCard.mutateAsync({
      id: card.id,
      title: form.title || card.title,
      description: form.description || null,
      whatsapp: form.whatsapp || null,
      estimated_value: form.estimated_value ? Number(form.estimated_value) : null,
      meta: newMeta,
      metadata: newMeta,   // keep both columns in sync
    } as { id: string } & Record<string, any>);
    setDirty(false);
  };

  return (
    <div className="space-y-5">
      {/* Título do card */}
      <div className="space-y-1.5">
        <Label htmlFor="dep-title">Título do embarque</Label>
        <Input id="dep-title" value={form.title} onChange={(e) => set('title', e.target.value)} className="border-vj-border" />
      </div>

      {/* Pacote + Destino */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 space-y-4">
        <p className="text-xs font-bold text-blue-700 uppercase tracking-wide flex items-center gap-1.5">
          <Package size={12} /> Dados da Viagem
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5 col-span-2">
            <Label htmlFor="dep-pkg" className="text-xs">Nome do Pacote / Grupo</Label>
            <Input id="dep-pkg" value={form.package_name} onChange={(e) => set('package_name', e.target.value)}
              placeholder="Ex: Cancún All Inclusive 7n" className="border-vj-border text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dep-dest" className="text-xs">Destino Principal</Label>
            <Input id="dep-dest" value={form.destination} onChange={(e) => set('destination', e.target.value)}
              placeholder="Ex: Cancún, México" className="border-vj-border text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dep-hotel" className="text-xs">Hotel / Acomodação</Label>
            <Input id="dep-hotel" value={form.hotel_name} onChange={(e) => set('hotel_name', e.target.value)}
              placeholder="Nome do hotel" className="border-vj-border text-sm" />
          </div>
        </div>
      </div>

      {/* Check-in information */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-100 space-y-4">
        <p className="text-xs font-bold text-amber-700 uppercase tracking-wide flex items-center gap-1.5">
          <CalendarDays size={12} /> Data do Embarque
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="dep-date" className="text-xs">Data do Voo ✈️</Label>
            <Input id="dep-date" type="date" value={form.check_in_date} onChange={(e) => set('check_in_date', e.target.value)}
              className="border-vj-border text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dep-time" className="text-xs">Hora de Partida</Label>
            <Input id="dep-time" type="time" value={form.check_in_time} onChange={(e) => set('check_in_time', e.target.value)}
              className="border-vj-border text-sm" />
          </div>
        </div>
      </div>

      {/* WhatsApp + Valor */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="dep-wa" className="text-xs">WhatsApp do Contato</Label>
          <Input id="dep-wa" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)}
            placeholder="49999999999" className="border-vj-border text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dep-val" className="text-xs">Valor Estimado (R$)</Label>
          <Input id="dep-val" type="number" value={form.estimated_value} onChange={(e) => set('estimated_value', e.target.value)}
            placeholder="0,00" className="border-vj-border text-sm" />
        </div>
      </div>

      {dirty && (
        <Button onClick={() => void handleSave()} disabled={updateCard.isPending} className="w-full bg-vj-green text-white hover:bg-vj-green/90">
          {updateCard.isPending ? 'Salvando...' : '💾 Salvar Alterações'}
        </Button>
      )}
    </div>
  );
}

/* ── Seção: Check-in e Cartões OMEGA ── */
import { supabase } from '@/integrations/supabase/client';

function CheckinCartoesSection({ card }: { card: DepartureCardData }) {
  const meta = (card.metadata ?? card.meta ?? {}) as DepartureMeta;
  const updateCard = useUpdateKanbanCard();
  
  const [loading, setLoading] = useState(false);
  const [linkResult, setLinkResult] = useState<{ status: string; url: string; missing_fields: string[] } | null>(null);

  // Campos locais para PNR/LastName que deveriam vir da tabela de bilhetes
  const [locator, setLocator] = useState(meta.flight_locator ?? '');
  const [lastName, setLastName] = useState('');
  const [airline, setAirline] = useState((meta as any).airline_iata ?? meta.airline_name ?? '');

  // Magic Portal Link State
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalUrl, setPortalUrl] = useState('');
  const [activeTemplate, setActiveTemplate] = useState<'missing' | 'available' | 'pass'>('missing');

  // Boarding Pass Documents State
  const [passes, setPasses] = useState<any[]>([]);
  const [loadingPasses, setLoadingPasses] = useState(false);
  const [uploadingPass, setUploadingPass] = useState(false);

  const fetchPasses = async () => {
    setLoadingPasses(true);
    try {
      const db = supabase as any;
      const { data, error } = await db
        .from('boarding_pass_documents')
        .select('*')
        .eq('trip_id', card.id);
      if (error) throw error;
      setPasses(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar cartões:', err);
    } finally {
      setLoadingPasses(false);
    }
  };

  useEffect(() => {
    fetchPasses();
  }, [card.id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPass(true);
    try {
      // 1. Upload to Supabase Storage
      const filePath = `boarding-passes/${card.id}/${Date.now()}_${file.name}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from('client-media')
        .upload(filePath, file);

      if (storageError) throw storageError;

      // 2. Fetch org_id from profile
      const orgId = useAuthStore.getState().profile?.org_id;
      if (!orgId) throw new Error("ID da organização não encontrado no perfil.");

      // 3. Insert into boarding_pass_documents
      const db = supabase as any;
      const { error: dbError } = await db
        .from('boarding_pass_documents')
        .insert({
          org_id: orgId,
          trip_id: card.id,
          storage_bucket: 'client-media',
          storage_path: filePath,
          file_name: file.name,
          mime_type: file.type,
          source: 'uploaded',
          uploaded_by: useAuthStore.getState().user?.id,
          status: 'attached'
        });

      if (dbError) throw dbError;

      alert('Cartão de embarque anexado com sucesso!');
      fetchPasses();
    } catch (err: any) {
      alert('Erro no upload: ' + err.message);
    } finally {
      setUploadingPass(false);
    }
  };

  const handleDownload = async (pass: any) => {
    try {
      const { data, error } = await supabase.storage
        .from(pass.storage_bucket)
        .createSignedUrl(pass.storage_path, 3600); // 1 hour
      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (err: any) {
      alert('Erro ao gerar link de download: ' + err.message);
    }
  };

  const handleDeletePass = async (pass: any) => {
    if (!window.confirm(`Excluir o cartão de embarque "${pass.file_name}"?`)) return;
    try {
      // Delete storage file
      await supabase.storage.from(pass.storage_bucket).remove([pass.storage_path]);
      // Delete database record
      const db = supabase as any;
      const { error } = await db
        .from('boarding_pass_documents')
        .delete()
        .eq('id', pass.id);
      if (error) throw error;
      fetchPasses();
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const saveMetaLocally = async () => {
     await updateCard.mutateAsync({
        id: card.id,
        meta: { ...meta, flight_locator: locator, airline_iata: airline, airline_name: airline } as any,
        metadata: { ...meta, flight_locator: locator, airline_iata: airline, airline_name: airline } as any,
     } as any);
  };

  const handleGenerateLink = async () => {
    setLoading(true);
    setLinkResult(null);
    try {
      await saveMetaLocally(); // Sync the manually typed data before sending

      const { data, error } = await supabase.functions.invoke('airline-build-action-link', {
        body: {
          trip_id: card.id, // using card id as trip id for this demo
          airline_iata: airline,
          link_type: 'checkin',
          payload: {
            orderId: locator,
            lastName: lastName,
            booking_reference: locator
          }
        }
      });

      if (error) throw new Error(error.message);
      setLinkResult(data);
    } catch (err: any) {
      alert("Erro ao buscar link: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePortalLink = async () => {
    setPortalLoading(true);
    try {
      await saveMetaLocally();
      const { data, error } = await supabase.functions.invoke('boarding-create-client-portal-link', {
        body: { trip_id: card.id }
      });
      if (error) throw new Error(error.message);
      setPortalUrl(data.portalUrl);
    } catch (err: any) {
      alert("Erro ao gerar link do portal: " + err.message);
    } finally {
      setPortalLoading(false);
    }
  };

  // Pre-filled WhatsApp template logic
  const getFirstName = () => {
    const fullName = card.clients?.name || 'Cliente';
    return fullName.split(' ')[0];
  };

  const getMissingFieldsList = () => {
    if (linkResult?.missing_fields?.length) {
      return linkResult.missing_fields.map(f => `- ${f}`).join('\n');
    }
    const missing = [];
    if (!locator) missing.push('- Localizador (PNR)');
    if (!lastName) missing.push('- Sobrenome do passageiro');
    if (!airline) missing.push('- Companhia aérea');
    if (missing.length === 0) return '- Documento de identificação (RG/Passaporte)';
    return missing.join('\n');
  };

  const maskPnr = (pnr: string) => {
    if (!pnr) return '***';
    if (pnr.length <= 2) return pnr + '***';
    return pnr.slice(0, 2) + '***' + pnr.slice(-1);
  };

  const templateMissingData = `Olá, ${getFirstName()}! Para finalizarmos seu pré-embarque da viagem para ${meta.destination || 'seu destino'}, precisamos confirmar alguns dados:\n${getMissingFieldsList()}\n\nVocê pode preencher pelo link seguro abaixo:\n${portalUrl || '[Gere o link do portal abaixo]'}`;

  const templateCheckinAvailable = `Olá, ${getFirstName()}! Seu check-in já está disponível para o voo de ${meta.destination || 'sua viagem'}.\n\nAcesse pelo link oficial:\n${linkResult?.url || portalUrl || '[Gere o link acima]'}\n\nTenha em mãos seu documento e o localizador ${maskPnr(locator)}.`;

  const templateBoardingPass = `Olá, ${getFirstName()}! Segue seu cartão de embarque/informações do voo.\n\nVoo: ${airline || 'Companhia'}\nTrecho: ${meta.destination || 'Destino'}\nData/horário: ${meta.check_in_date || ''} ${meta.check_in_time || ''}\nLocalizador: ${locator}\n\nRecomendamos chegar com antecedência e conferir documentos.\nLink Seguro para baixar PDF: ${portalUrl || '[Gere o link do portal abaixo]'}`;

  const currentTemplateText = 
    activeTemplate === 'missing' ? templateMissingData :
    activeTemplate === 'available' ? templateCheckinAvailable :
    templateBoardingPass;

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(currentTemplateText);
    alert('Mensagem copiada para a área de transferência!');
  };

  const handleSendWhatsApp = () => {
    const phone = card.whatsapp || card.clients?.phone || '';
    window.open(`https://api.whatsapp.com/send?phone=${phone.replace(/\D/g, '')}&text=${encodeURIComponent(currentTemplateText)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Central de Check-in */}
      <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 space-y-4">
         <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
            <Plane size={16} /> Central de Check-in Dinâmico
         </h3>
         <p className="text-xs text-blue-800">
            A geração de Check-in consulta automaticamente o Registry Oficial (LATAM, GOL, Azul, TAP) para gerar o Deep Link ou direcionar à página certa.
         </p>
         
         <div className="grid grid-cols-2 gap-3 mt-4">
           <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Cód. Companhia (Ex: LA, G3, AD, TP)</Label>
              <Input value={airline} onChange={e => setAirline(e.target.value.toUpperCase())} placeholder="LA" className="text-sm border-blue-200 bg-white" />
           </div>
           <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Localizador PNR / OrderId</Label>
              <Input value={locator} onChange={e => setLocator(e.target.value.toUpperCase())} placeholder="ABCDE1" className="text-sm border-blue-200 bg-white" />
           </div>
           <div className="space-y-1.5 col-span-2">
              <Label className="text-xs font-semibold">Sobrenome do Passageiro (Necessário em Várias)</Label>
              <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="SILVA" className="text-sm border-blue-200 uppercase bg-white" />
           </div>
         </div>

         <Button 
            onClick={handleGenerateLink} 
            disabled={loading || !airline} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4">
            {loading ? 'Consultando Registry Oficial...' : '🔗 Gerar Link Seguro de Check-in'}
         </Button>
      </div>

      {linkResult && (
         <div className={cn("p-4 rounded-xl border", linkResult.status === 'missing_data' ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200")}>
            <h4 className={cn("font-bold text-sm", linkResult.status === 'missing_data' ? "text-amber-800" : "text-green-800")}>
               Status do Registry: {linkResult.status.toUpperCase()}
            </h4>
            
            {linkResult.status === 'missing_data' && (
               <div className="mt-2 text-xs text-amber-700">
                 <p className="font-semibold mb-1">Faltam dados obrigatórios para injetar o Deep Link direto:</p>
                 <ul className="list-disc pl-4 space-y-1">
                   {linkResult.missing_fields.map(f => <li key={f}>{f}</li>)}
                 </ul>
                 <p className="mt-2">O link abaixo levará para a página genérica da companhia para preenchimento manual.</p>
               </div>
            )}

            {linkResult.status === 'ready' && (
               <p className="mt-2 text-xs text-green-700">
                 Todos os dados validados. O link redirecionará injetando o PNR diretamente.
               </p>
            )}

            <div className="mt-4 pt-4 border-t border-black/10 flex flex-col gap-2">
               <a href={linkResult.url} target="_blank" rel="noreferrer" className="w-full">
                 <Button className="w-full" variant="outline">
                   <ExternalLink size={14} className="mr-2" />
                   {linkResult.status === 'ready' ? 'Abrir Cartão de Embarque' : 'Ir para Check-in Manual'}
                 </Button>
               </a>
               <p className="text-[10px] text-center text-vj-txt3 break-all font-mono opacity-60">URL Logada: {linkResult.url.slice(0, 60)}...</p>
            </div>
         </div>
      )}

      {/* Client Portal Section */}
      <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-4">
         <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
            <Globe size={16} /> Portal do Passageiro OMEGA
         </h3>
         <p className="text-xs text-indigo-800">
            Gere o token criptografado temporário para que o passageiro visualize as passagens e realize o check-in com isolamento de dados completo.
         </p>

         {!portalUrl ? (
           <Button 
              onClick={handleGeneratePortalLink} 
              disabled={portalLoading} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
              {portalLoading ? 'Gerando Link...' : '🛡️ Ativar Portal do Viajante'}
           </Button>
         ) : (
           <div className="space-y-2">
             <Label className="text-xs font-semibold text-indigo-950">Link Seguro do Cliente:</Label>
             <div className="flex gap-2">
               <Input readOnly value={portalUrl} className="text-xs border-indigo-200 bg-white" />
               <Button onClick={() => { navigator.clipboard.writeText(portalUrl); alert('Link copiado!'); }} size="sm" variant="outline" className="border-indigo-300">
                 Copiar
               </Button>
             </div>
           </div>
         )}
      </div>

      {/* WhatsApp Templates Panel */}
      <div className="p-4 rounded-xl border border-vj-border bg-vj-surface space-y-4">
         <h3 className="text-sm font-bold text-vj-txt flex items-center gap-2">
            <Send size={16} className="text-vj-green" /> Templates de Mensagens WhatsApp
         </h3>
         <p className="text-xs text-vj-txt3">
            Selecione o modelo desejado. As informações do cliente e o portal são preenchidos dinamicamente.
         </p>

         <div className="flex gap-1.5 border-b border-vj-border pb-2">
           <button 
             type="button" 
             onClick={() => setActiveTemplate('missing')}
             className={cn("px-3 py-1 rounded text-xs font-semibold", activeTemplate === 'missing' ? "bg-vj-green/10 text-vj-green border border-vj-green/20" : "text-vj-txt3 hover:bg-vj-bg")}>
             Faltam Dados
           </button>
           <button 
             type="button" 
             onClick={() => setActiveTemplate('available')}
             className={cn("px-3 py-1 rounded text-xs font-semibold", activeTemplate === 'available' ? "bg-vj-green/10 text-vj-green border border-vj-green/20" : "text-vj-txt3 hover:bg-vj-bg")}>
             Check-in Liberado
           </button>
           <button 
             type="button" 
             onClick={() => setActiveTemplate('pass')}
             className={cn("px-3 py-1 rounded text-xs font-semibold", activeTemplate === 'pass' ? "bg-vj-green/10 text-vj-green border border-vj-green/20" : "text-vj-txt3 hover:bg-vj-bg")}>
             Passagem Anexada
           </button>
         </div>

         <div className="p-3 bg-white border border-vj-border rounded-lg text-xs font-mono text-vj-txt whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
           {currentTemplateText}
         </div>

         <div className="flex gap-2">
           <Button onClick={handleCopyTemplate} className="flex-1" variant="outline" size="sm">
             Copiar Texto
           </Button>
           <Button onClick={handleSendWhatsApp} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" size="sm">
             Enviar WhatsApp
           </Button>
         </div>
      </div>

      {/* Cartões Anexados UI */}
      <div className="p-4 rounded-xl border border-vj-border bg-vj-surface space-y-4">
         <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-vj-txt">Cartões de Embarque Anexados</h3>
            <div>
              <label htmlFor="pass-upload" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors">
                <Plus size={14} /> Anexar PDF
              </label>
              <input 
                type="file" 
                id="pass-upload" 
                className="hidden" 
                accept="application/pdf,image/*"
                onChange={handleFileUpload} 
                disabled={uploadingPass} 
              />
            </div>
         </div>

         {loadingPasses ? (
           <div className="text-xs text-vj-txt3 text-center py-4">Carregando passagens...</div>
         ) : passes.length === 0 ? (
           <EmptyState 
             icon={FileText} 
             title="Nenhum bilhete recebido" 
             description="Após realizar o check-in online, faça o upload do PDF aqui para enviar ao cliente." 
           />
         ) : (
           <div className="space-y-2">
             {passes.map(pass => (
               <div key={pass.id} className="flex items-center justify-between p-2.5 bg-white border border-vj-border rounded-lg text-xs gap-3">
                 <div className="flex items-center gap-2 min-w-0">
                   <FileText size={16} className="text-indigo-600 shrink-0" />
                   <span className="font-medium text-vj-txt truncate" title={pass.file_name}>{pass.file_name}</span>
                 </div>
                 <div className="flex gap-1 shrink-0">
                   <Button size="sm" variant="ghost" className="h-7 px-2 hover:bg-slate-100 text-indigo-600 font-semibold" onClick={() => handleDownload(pass)}>
                     Download
                   </Button>
                   <Button size="sm" variant="ghost" className="h-7 px-2 hover:bg-red-50 text-red-500 font-semibold" onClick={() => handleDeletePass(pass)}>
                     Excluir
                   </Button>
                 </div>
               </div>
             ))}
           </div>
         )}
      </div>
    </div>
  );
}

/* ── Seção: Checklist (documentação) ── */
function DocsSection({ cardId }: { cardId: string }) {
  const { data: checklists, isLoading } = useKanbanChecklists(cardId);
  const createChecklist = useCreateKanbanChecklist();
  const toggleItem = useToggleChecklistItem();
  const addItem = useAddChecklistItem();
  const deleteItem = useDeleteChecklistItem();
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});

  if (isLoading) return <div className="text-sm text-vj-txt3">Carregando...</div>;

  return (
    <div className="space-y-4">
      {(!checklists || checklists.length === 0) && (
        <EmptyState
          icon={CheckSquare}
          title="Nenhum checklist de documentos"
          description="Crie um checklist para documentos, prazos e requisitos de viagem."
          action={
            <Button size="sm" variant="outline" onClick={() => createChecklist.mutate({ card_id: cardId, title: 'Documentos & Requisitos' })} disabled={createChecklist.isPending}>
              <Plus size={14} className="mr-1" /> Criar checklist de documentos
            </Button>
          }
        />
      )}
      {checklists?.map((cl) => {
        const items = (cl as Record<string, any>).items ?? [];
        const checked = items.filter((i: any) => i.is_checked).length;
        const pct = items.length > 0 ? Math.round((checked / items.length) * 100) : 0;
        return (
          <div key={cl.id} className="bg-vj-surface border border-vj-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-sm text-vj-txt">{cl.title}</p>
              <span className="text-xs text-vj-txt3">{checked}/{items.length} · {pct}%</span>
            </div>
            <div className="h-1.5 bg-vj-bg rounded-full overflow-hidden">
              <div className="h-full bg-vj-green rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
            </div>
            <div className="space-y-1.5">
              {items.sort((a: any, b: any) => a.position - b.position).map((item: any) => (
                <div key={item.id} className="flex items-center gap-2 group">
                  <input type="checkbox" checked={item.is_checked}
                    onChange={(e) => toggleItem.mutate({ item_id: item.id, is_checked: e.target.checked, card_id: cardId })}
                    className="rounded border-vj-border accent-vj-green" id={`item-${item.id}`} />
                  <label htmlFor={`item-${item.id}`} className={cn('text-sm flex-1 cursor-pointer', item.is_checked ? 'line-through text-vj-txt3' : 'text-vj-txt')}>
                    {item.title}
                  </label>
                  <button type="button" onClick={() => deleteItem.mutate({ item_id: item.id, card_id: cardId })} className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <Input value={newItemText[cl.id] ?? ''} onChange={(e) => setNewItemText((p) => ({ ...p, [cl.id]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newItemText[cl.id]?.trim()) {
                    e.preventDefault();
                    addItem.mutate({ checklist_id: cl.id, title: newItemText[cl.id].trim(), card_id: cardId });
                    setNewItemText((p) => ({ ...p, [cl.id]: '' }));
                  }
                }}
                placeholder="Novo item (Enter)" className="border-vj-border text-sm h-8" />
            </div>
          </div>
        );
      })}
      {checklists && checklists.length > 0 && (
        <Button variant="outline" size="sm" className="border-vj-border" onClick={() => createChecklist.mutate({ card_id: cardId })} disabled={createChecklist.isPending}>
          <Plus size={14} className="mr-1" /> Adicionar checklist
        </Button>
      )}
    </div>
  );
}

/* ── Seção: Notas ── */
function NotasSection({ cardId }: { cardId: string }) {
  const { data: notes, isLoading } = useKanbanNotes(cardId);
  const createNote = useCreateKanbanNote();
  const [body, setBody] = useState('');

  const handleSend = () => {
    if (!body.trim()) return;
    createNote.mutate({ card_id: cardId, body: body.trim() });
    setBody('');
  };

  if (isLoading) return <div className="text-sm text-vj-txt3">Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="bg-vj-surface border border-vj-border rounded-xl p-3 space-y-2">
        <Textarea value={body} onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSend(); }}
          placeholder="Nota interna... (Ctrl+Enter para enviar)" rows={2} className="border-vj-border resize-none text-sm" />
        <div className="flex justify-end">
          <Button size="sm" onClick={handleSend} disabled={!body.trim() || createNote.isPending}>
            <Send size={13} className="mr-1.5" />
            {createNote.isPending ? 'Salvando...' : 'Adicionar'}
          </Button>
        </div>
      </div>
      {!notes || notes.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhuma nota" description="Adicione notas sobre documentação, pendências e follow-up." />
      ) : (
        <div className="space-y-3">
          {notes.map((note) => {
            const author = (note as Record<string, any>).author;
            const authorName = author ? `${author.first_name} ${author.last_name}`.trim() : 'Agente';
            return (
              <div key={note.id} className="border border-vj-border rounded-xl p-3 bg-white space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-vj-green/15 flex items-center justify-center text-[10px] font-bold text-vj-green">
                    {authorName[0]?.toUpperCase() ?? '?'}
                  </div>
                  <span className="text-xs font-medium text-vj-txt">{authorName}</span>
                  <span className="text-xs text-vj-txt3">
                    {new Date(note.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-vj-txt whitespace-pre-wrap pl-7">{note.body}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Seção: Vínculos ── */
function VinculosSection({ card }: { card: DepartureCardData }) {
  const updateCard = useUpdateKanbanCard();
  const { data: groupTrips } = useGroupTrips();
  const [clientId, setClientId] = useState(card.client_id ?? '');
  const [groupTripId, setGroupTripId] = useState(card.group_trip_id ?? '');

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-vj-txt3 uppercase tracking-wide">Vincular Cliente</Label>
        <ClientSearchSelect value={clientId} onChange={async (id) => { setClientId(id); await updateCard.mutateAsync({ id: card.id, client_id: id || null }); }} placeholder="Buscar cliente..." />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-vj-txt3 uppercase tracking-wide">Vincular Viagem</Label>
        <Select 
          value={groupTripId} 
          onValueChange={async (value) => { 
            const newId = value === '_empty' ? '' : value;
            setGroupTripId(newId); 
            await updateCard.mutateAsync({ id: card.id, group_trip_id: newId || null }); 
          }}
        >
          <SelectTrigger className="w-full bg-white h-10 border-vj-border rounded-md text-sm">
            <SelectValue placeholder="Nenhuma viagem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_empty">Nenhuma viagem</SelectItem>
            {groupTrips?.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.title || t.destination || `Viagem ${t.id.slice(0, 8)}`}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {card.clients && (
        <div className="surface-muted rounded-xl p-4">
          <p className="text-xs font-semibold text-vj-txt3 uppercase tracking-wide mb-1">Cliente atual</p>
          <p className="font-medium text-vj-txt">{card.clients.name}</p>
          {card.clients.phone && <p className="text-sm text-vj-txt3 mt-0.5">{card.clients.phone}</p>}
        </div>
      )}
    </div>
  );
}

/* ── Main component ── */
const SECTIONS = [
  { id: 'embarque', label: 'Resumo', icon: Plane },
  { id: 'checkin', label: 'Check-in e Cartões', icon: Globe },
  { id: 'docs', label: 'Documentos', icon: CheckSquare },
  { id: 'notas', label: 'Log', icon: FileText },
  { id: 'vinculos', label: 'Vínculos', icon: Link2 },
];

interface Props {
  card: DepartureCardData | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DepartureCardSheet({ card, isOpen, onClose, onDeleted }: Props) {
  const deleteCard = useDeleteKanbanCard();

  if (!card) return null;

  const meta = (card.metadata ?? card.meta ?? {}) as DepartureMeta;

  const handleDelete = async () => {
    if (!window.confirm(`Excluir o card "${card.title}"? Esta ação não pode ser desfeita.`)) return;
    await deleteCard.mutateAsync(card.id);
    onDeleted?.();
    onClose();
  };

  return (
    <SheetPage
      open={isOpen}
      onClose={onClose}
      title={card.title}
      subtitle={card.clients?.name ?? meta.destination ?? undefined}
      icon={Plane}
      sections={SECTIONS}
      defaultSection="embarque"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" size="sm" className="border-red-200 text-red-500 hover:bg-red-50"
            onClick={() => void handleDelete()} disabled={deleteCard.isPending}>
            <Trash2 size={14} className="mr-1.5" />
            Excluir
          </Button>
          {meta.airline_checkin_url && (
            <a href={meta.airline_checkin_url} target="_blank" rel="noreferrer">
              <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700 gap-1.5">
                <ExternalLink size={13} />
                Abrir Check-in Online
              </Button>
            </a>
          )}
          {!meta.airline_checkin_url && (
            <Button variant="ghost" size="sm" onClick={onClose}>Fechar</Button>
          )}
        </div>
      }
    >
      {(activeSection) => (
        <>
          {activeSection === 'embarque' && <EmbarqueSection card={card} />}
          {activeSection === 'checkin' && <CheckinCartoesSection card={card} />}
          {activeSection === 'docs' && <DocsSection cardId={card.id} />}
          {activeSection === 'notas' && <NotasSection cardId={card.id} />}
          {activeSection === 'vinculos' && <VinculosSection card={card} />}
        </>
      )}
    </SheetPage>
  );
}
