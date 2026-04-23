import { useParams, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { ClientEditSheet } from '@/components/ClientEditSheet';
import { QuotationBuilderSheet } from '@/components/QuotationBuilderSheet';
import { useClient, useUpdateClient } from '@/hooks/useClients';
import { useTravelers, useCreateTraveler, useDeleteTraveler } from '@/hooks/useTravelers';
import { supabase } from '@/integrations/supabase/client';
import { StorageService } from '@/services/storage.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SheetPage } from '@/components/ui/SheetPage';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  ArrowLeft, Plus, User, Mail, Phone, MapPin, Calendar, Copy, 
  Trash2, MessageCircle, FileText, Plane, Globe, Link, Shield, Camera, ImageIcon, Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TRAVELER_SECTIONS = [
  { id: 'dados', label: 'Dados Pessoais', icon: User },
  { id: 'relacao', label: 'Vínculo', icon: Users },
];

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: client, isLoading } = useClient(id);
  const { data: travelers, isLoading: loadingTravelers } = useTravelers(id);
  const createTraveler = useCreateTraveler();
  const deleteTraveler = useDeleteTraveler();
  const updateClient = useUpdateClient();
  const { toast } = useToast();
  const [newTraveler, setNewTraveler] = useState({ full_name: '', cpf: '', birth_date: '', email: '', phone: '', relation: '' });
  const [travelerSheetOpen, setTravelerSheetOpen] = useState(false);
  const [clientSheetOpen, setClientSheetOpen] = useState(false);
  const [quotationBuilderOpen, setQuotationBuilderOpen] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleAddTraveler = async () => {
    if (!newTraveler.full_name) return;
    await createTraveler.mutateAsync({ ...newTraveler, client_id: id });
    setNewTraveler({ full_name: '', cpf: '', birth_date: '', email: '', phone: '', relation: '' });
    setTravelerSheetOpen(false);
  };

  const copyFormLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/f/${token}`);
    toast({ title: 'Link copiado para a área de transferência!' });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4 max-w-5xl mx-auto">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full mt-6 rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  if (!client) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-24">
          <p className="text-muted-foreground text-lg mb-4">Cliente não encontrado ou removido.</p>
          <Button variant="outline" onClick={() => navigate('/clients')}>Voltar para a Lista</Button>
        </div>
      </AppLayout>
    );
  }

  // Detect basic tags to apply dynamic styling
  const isVip = client.tags?.map(t => t.toLowerCase()).includes('vip');

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/clients')} className="hover:bg-accent/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="text-sm font-medium text-muted-foreground tracking-tight">CRM / Ficha Cadastral</span>
        </div>

        {/* Header Profile - "World ID / Notion Style" */}
        <div className="relative rounded-3xl overflow-hidden  border border-vj-border bg-white">
           {/* Cover Banner */}
           <div 
             className={`h-32 w-full relative group cursor-pointer ${!client.cover_url ? (isVip ? 'bg-gradient-to-r from-purple-600 to-indigo-900' : 'bg-gradient-to-r from-primary to-accent') : ''} opacity-90`}
             onClick={() => coverInputRef.current?.click()}
           >
             {client.cover_url && (
               <img src={client.cover_url} alt="Cover" className="w-full h-full object-cover" />
             )}
             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
               <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium flex items-center gap-2">
                 <ImageIcon className="h-4 w-4" /> Alterar capa
               </span>
             </div>
           </div>
           <input 
             ref={coverInputRef}
             type="file"
             accept="image/*"
             className="hidden"
             onChange={async (e) => {
               const file = e.target.files?.[0];
               if (!file) return;
               setUploadingCover(true);
               try {
                 const ext = file.name.split('.').pop();
                 const path = `covers/${client.id}.${ext}`;
                 await StorageService.uploadFile('client-media', path, file);
                 const publicUrl = StorageService.getPublicUrl('client-media', path);
                 await updateClient.mutateAsync({ id: client.id, cover_url: publicUrl });
                 toast({ title: 'Capa atualizada!' });
               } catch (err: any) {
                 toast({ title: 'Erro ao enviar capa', description: err.message, variant: 'destructive' });
               } finally {
                 setUploadingCover(false);
               }
             }}
           />
           
           <div className="px-6 sm:px-10 pb-6 relative">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 sm:-mt-16 mb-4">
                 {/* Avatar & Title */}
                  <div className="flex items-end gap-5">
                     <div 
                       className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl border-4 border-background bg-accent/10 flex items-center justify-center overflow-hidden  relative group cursor-pointer"
                       onClick={() => photoInputRef.current?.click()}
                     >
                        {client.photo_url ? (
                          <img src={client.photo_url} alt={client.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-heading text-4xl text-vj-green font-bold">{client.name.substring(0, 2).toUpperCase()}</span>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                     </div>
                     <input
                       ref={photoInputRef}
                       type="file"
                       accept="image/*"
                       className="hidden"
                       onChange={async (e) => {
                         const file = e.target.files?.[0];
                         if (!file) return;
                         setUploadingPhoto(true);
                         try {
                           const ext = file.name.split('.').pop();
                           const path = `photos/${client.id}.${ext}`;
                           await StorageService.uploadFile('client-media', path, file);
                           const publicUrl = StorageService.getPublicUrl('client-media', path);
                           await updateClient.mutateAsync({ id: client.id, photo_url: publicUrl });
                           toast({ title: 'Foto atualizada!' });
                         } catch (err: any) {
                           toast({ title: 'Erro ao enviar foto', description: err.message, variant: 'destructive' });
                         } finally {
                           setUploadingPhoto(false);
                         }
                       }}
                     />
                    <div className="pb-2">
                       <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                         {client.name}
                         {isVip && <Badge className="bg-purple-500 hover:bg-purple-600 border-none text-xs px-2 py-0.5">VIP</Badge>}
                       </h1>
                       <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
                         <Globe className="h-3.5 w-3.5" /> 
                         <span>Cliente desde {new Date(client.created_at).toLocaleDateString('pt-BR')}</span>
                       </div>
                    </div>
                 </div>
                 
                 {/* Action Buttons */}
                 <div className="flex flex-wrap gap-2 pb-2">
                    {client.phone && (
                      <Button variant="default" className="bg-green-600 hover:bg-green-700 text-white " onClick={() => window.open(`https://wa.me/${client.phone.replace(/\D/g, '')}`, '_blank')}>
                         <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                      </Button>
                    )}
                    {client.portal_access_enabled && (
                      <Button variant="outline" className="border-vj-green text-vj-green hover:bg-vj-green/5" onClick={() => {
                        const link = `${window.location.origin}/portal-trip/${client.id}`;
                        navigator.clipboard.writeText(link);
                        toast({ title: '🔗 Link do portal copiado!', description: 'Envie por WhatsApp para o cliente acessar.' });
                      }}>
                         <Link className="h-4 w-4 mr-2" /> Copiar Magic Link
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => setClientSheetOpen(true)}>
                       Editar Ficha
                    </Button>
                 </div>
              </div>
              
              {/* Tags Area */}
              {client.tags && client.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 ml-1">
                  {client.tags.map((tag) => (
                     <Badge key={tag} variant="secondary" className="bg-vj-green/10 text-vj-green hover:bg-vj-green/10 transition-colors font-medium rounded-md px-3">
                       #{tag}
                     </Badge>
                  ))}
                </div>
              )}
           </div>
        </div>

        {/* Tab Navigation */}
        <Tabs defaultValue="info" className="mt-8">
          <TabsList className="bg-transparent border-b border-vj-border w-full justify-start h-auto p-0 rounded-none mb-6">
            <TabsTrigger value="info" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-vj-green/20 data-[state=active]: rounded-none px-6 py-3 font-medium">Dados Principais</TabsTrigger>
            <TabsTrigger value="travelers" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-vj-green/20 data-[state=active]: rounded-none px-6 py-3 font-medium">Viajantes Vinculados <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">{travelers?.length || 0}</span></TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-vj-green/20 data-[state=active]: rounded-none px-6 py-3 font-medium">Timeline de Viagens</TabsTrigger>
            <TabsTrigger value="docs" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-vj-green/20 data-[state=active]: rounded-none px-6 py-3 font-medium">Documentos & Contratos</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6 focus-visible:outline-none">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Personal Details Card */}
              <Card className="md:col-span-2 border-vj-border  rounded-2xl overflow-hidden">
                <CardHeader className="bg-vj-bg border-b border-vj-border pb-4">
                   <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4 text-vj-green" /> Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 pt-6">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">E-mail Principal</p>
                    <p className="font-medium">{client.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Telefone / WhatsApp</p>
                    <p className="font-medium">{client.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">CPF</p>
                    <p className="font-medium">{client.cpf || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Data de Nascimento</p>
                    <p className="font-medium">{client.birth_date ? new Date(client.birth_date).toLocaleDateString('pt-BR') : '—'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Address Card */}
              <Card className="border-vj-border  rounded-2xl overflow-hidden">
                <CardHeader className="bg-vj-bg border-b border-vj-border pb-4">
                   <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> Localização</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Endereço</p>
                    <p className="text-sm">{client.address || 'Não preenchido'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                     <div>
                       <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Cidade</p>
                       <p className="text-sm">{client.city || '—'}</p>
                     </div>
                     <div>
                       <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Estado</p>
                       <p className="text-sm">{client.state || '—'}</p>
                     </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">CEP e País</p>
                    <p className="text-sm">{[client.zip_code, client.country].filter(Boolean).join(' • ') || '—'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notes Section styled nicely */}
            {client.notes && (
              <Card className="border-warning/30 bg-warning/5  rounded-2xl overflow-hidden">
                <CardHeader className="pb-2">
                   <CardTitle className="text-base text-warning flex items-center gap-2"><FileText className="h-4 w-4" /> Notas Internas do Agente</CardTitle>
                </CardHeader>
                <CardContent>
                   <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{client.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="travelers" className="space-y-6 focus-visible:outline-none">
            <div className="flex justify-between items-center bg-vj-bg p-4 rounded-xl border border-vj-border">
               <div>
                  <h3 className="font-medium">Grupo Familiar / Companheiros</h3>
                  <p className="text-xs text-muted-foreground mt-1">Viajantes que utilizam os pacotes comprados por este cliente.</p>
               </div>
              <Button
                className=" rounded-full px-5"
                onClick={() => setTravelerSheetOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Adicionar Viajante
              </Button>
            </div>

            {loadingTravelers ? (
              <div className="grid md:grid-cols-2 gap-4">{[1, 2].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
            ) : !travelers?.length ? (
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-vj-border rounded-2xl bg-vj-bg">
                <UsersGroupIcon className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-foreground">Sem viajantes extras</p>
                <p className="text-xs text-muted-foreground text-center mt-1 max-w-sm">Este cliente costuma viajar sozinho ou os parceiros não foram cadastrados na ficha principal.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {travelers.map((t) => (
                  <Card key={t.id} className="rounded-2xl border-vj-border hover: transition-shadow group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-accent/50" />
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-3">
                         <div>
                           <h4 className="font-heading font-semibold text-lg text-foreground truncate max-w-[200px]">{t.full_name}</h4>
                           <Badge variant="outline" className="text-[10px] mt-1 uppercase text-muted-foreground tracking-wider bg-transparent">{t.relation || 'Sem vínculo'}</Badge>
                         </div>
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Desvincular viajante?</AlertDialogTitle>
                              <AlertDialogDescription>Esta ação remove {t.full_name} desta ficha permanentemente.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Me arrependi</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteTraveler.mutate(t.id)}>Remover</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                         <div className="bg-vj-bg p-2 rounded-md border border-vj-border">
                             <span className="text-muted-foreground block mb-0.5">CPF</span>
                             <span className="font-medium">{t.cpf || 'Pendente'}</span>
                         </div>
                         <div className="bg-vj-bg p-2 rounded-md border border-vj-border">
                             <span className="text-muted-foreground block mb-0.5">Nascimento</span>
                             <span className="font-medium">{t.birth_date ? new Date(t.birth_date).toLocaleDateString('pt-BR') : 'Pendente'}</span>
                         </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-vj-border">
                         <div className="flex items-center gap-1.5">
                            {t.form_completed_at ? (
                              <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">Ficha Completa</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-warning/10 text-warning-foreground border-warning/30">Pendente</Badge>
                            )}
                         </div>
                         
                         <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-accent hover:text-accent-foreground hover:bg-accent/10" onClick={() => copyFormLink(t.form_token!)}>
                           <Copy className="mr-1.5 h-3.5 w-3.5" /> Enviar Link Seguro
                         </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="focus-visible:outline-none">
             {/* Empty State visual para Timeline (PRD Requirement Dummy) */}
             <div className="flex flex-col items-center justify-center py-20 border border-vj-border rounded-2xl bg-vj-bg">
                <div className="h-16 w-16 mb-4 rounded-full bg-vj-green/10 flex items-center justify-center">
                  <Plane className="h-8 w-8 text-vj-green" />
                </div>
                <h3 className="font-heading font-semibold text-lg">Nenhuma Viagem Registrada</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-6 text-center max-w-sm">
                  Quando este cliente fechar a primeira cotação conosco, você verá aqui uma linha do tempo mágica dos destinos.
                </p>
                <Button onClick={() => setQuotationBuilderOpen(true)}>Criar Cotação IA</Button>
             </div>
          </TabsContent>
          
          <TabsContent value="docs" className="focus-visible:outline-none">
             {(() => {
               const prefs = (client.preferences as Record<string, any>) || {};
               const docs: any[] = prefs.documents || [];
               return docs.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-20 border border-dashed border-vj-border rounded-2xl bg-vj-bg">
                   <div className="h-16 w-16 mb-4 rounded-full bg-vj-surface border border-vj-border flex items-center justify-center">
                     <FileText className="h-8 w-8 text-vj-txt3" />
                   </div>
                   <h3 className="font-semibold text-lg text-vj-txt">Nenhum documento cadastrado</h3>
                   <p className="text-sm text-vj-txt3 mt-1 mb-6 text-center max-w-sm">
                     Adicione passaportes, RG, documentos profissionais e comprovantes na edição do cliente.
                   </p>
                   <Button variant="outline" onClick={() => setClientSheetOpen(true)}>Adicionar Documentos</Button>
                 </div>
               ) : (
                 <div className="grid gap-4 md:grid-cols-2">
                   {docs.map((doc: any, i: number) => (
                     <div key={i} className="p-5 rounded-2xl border border-vj-border bg-white  space-y-3">
                       <div className="flex items-center justify-between">
                         <span className="font-semibold text-vj-txt flex items-center gap-2">
                           <FileText className="w-4 h-4 text-vj-green" /> {doc.type || 'Documento'}
                         </span>
                         {doc.url && (
                           <a href={doc.url} target="_blank" rel="noreferrer"
                             className="text-xs text-vj-green border border-vj-green/20 rounded-full px-3 py-1 hover:bg-vj-green/5 transition-colors">
                             Ver Arquivo
                           </a>
                         )}
                       </div>
                       {doc.number && (
                         <div>
                           <p className="text-xs text-vj-txt3 uppercase tracking-wider font-semibold">Número</p>
                           <p className="font-mono font-semibold text-vj-txt">{doc.number}</p>
                         </div>
                       )}
                       {doc.expiry && (
                         <div>
                           <p className="text-xs text-vj-txt3 uppercase tracking-wider font-semibold">Validade</p>
                           <p className="text-sm text-vj-txt">{new Date(doc.expiry + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               );
             })()}
          </TabsContent>
        </Tabs>
      </div>
      
      <ClientEditSheet 
        id={id} 
        open={clientSheetOpen} 
        onClose={() => setClientSheetOpen(false)} 
        onSuccess={() => { setClientSheetOpen(false); window.location.reload(); }} 
      />
      
      <QuotationBuilderSheet
        open={quotationBuilderOpen}
        onClose={() => setQuotationBuilderOpen(false)}
        clientId={id}
      />

      <SheetPage
        open={travelerSheetOpen}
        onClose={() => setTravelerSheetOpen(false)}
        title="Adicionar Viajante"
        subtitle="Vincule um companheiro de viagem a este cliente"
        icon={Users}
        sections={TRAVELER_SECTIONS}
        defaultSection="dados"
        footer={
          <div className="flex items-center gap-3 w-full justify-end">
            <Button variant="ghost" onClick={() => setTravelerSheetOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleAddTraveler}
              disabled={!newTraveler.full_name || createTraveler.isPending}
              className="rounded-full px-8 bg-vj-green hover:bg-vj-green/90"
            >
              {createTraveler.isPending ? 'Salvando...' : 'Vincular Viajante'}
            </Button>
          </div>
        }
      >
        {(activeSection) => (
          <>
            {activeSection === 'dados' && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="font-semibold">Nome Completo *</Label>
                  <Input
                    value={newTraveler.full_name}
                    onChange={e => setNewTraveler(p => ({ ...p, full_name: e.target.value }))}
                    placeholder="Ex: Maria da Silva"
                    className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="font-semibold">CPF</Label>
                    <Input
                      value={newTraveler.cpf}
                      onChange={e => setNewTraveler(p => ({ ...p, cpf: e.target.value }))}
                      placeholder="000.000.000-00"
                      className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-semibold">Data de Nascimento</Label>
                    <Input
                      type="date"
                      value={newTraveler.birth_date}
                      onChange={e => setNewTraveler(p => ({ ...p, birth_date: e.target.value }))}
                      className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                    />
                  </div>
                </div>
              </div>
            )}
            {activeSection === 'relacao' && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="font-semibold">Relação com o Responsável</Label>
                  <Input
                    value={newTraveler.relation}
                    onChange={e => setNewTraveler(p => ({ ...p, relation: e.target.value }))}
                    placeholder="Ex: Esposa, Filho, Amigo, Sócio..."
                    className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-semibold">E-mail do Viajante</Label>
                  <Input
                    type="email"
                    value={newTraveler.email}
                    onChange={e => setNewTraveler(p => ({ ...p, email: e.target.value }))}
                    placeholder="viajante@email.com"
                    className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-semibold">Telefone</Label>
                  <Input
                    value={newTraveler.phone}
                    onChange={e => setNewTraveler(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+55 (49) 99999-9999"
                    className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </SheetPage>
    </AppLayout>
  );
}

// Helper icon component for empty states
function UsersGroupIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
