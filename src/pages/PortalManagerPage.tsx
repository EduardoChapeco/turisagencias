import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { usePageInfo } from '@/contexts/PageInfoContext';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, Copy, Check, ExternalLink, Smartphone, 
  Upload, Trash2, Calendar, MapPin, Users, CreditCard,
  MessageSquare, Bus, Sparkles, AlertCircle, Info, Loader2,
  XCircle, CheckCircle2
} from 'lucide-react';
import { logger } from '@/utils/logger';

interface PortalSettings {
  portal_title: string;
  portal_subtitle: string;
  portal_upload_enabled: boolean;
  portal_cancel_enabled: boolean;
  portal_seats_enabled: boolean;
  portal_ai_photos_enabled: boolean;
}

export default function PortalManagerPage() {
  const { setPageInfo } = usePageInfo();
  const { organization, setOrganization } = useAuthStore();
  const { toast } = useToast();

  // Settings states
  const [portalTitle, setPortalTitle] = useState('');
  const [portalSubtitle, setPortalSubtitle] = useState('');
  const [uploadEnabled, setUploadEnabled] = useState(true);
  const [cancelEnabled, setCancelEnabled] = useState(true);
  const [seatsEnabled, setSeatsEnabled] = useState(true);
  const [aiPhotosEnabled, setAiPhotosEnabled] = useState(true);

  // UI state
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedBooking, setCopiedBooking] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<string>('');
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Set Page Info
  useEffect(() => {
    setPageInfo({
      title: 'Portal do Viajante',
      description: 'Configure os recursos e personalize a página que seus passageiros visualizam ao acessar o link da viagem.',
      icon: Shield
    });
  }, [setPageInfo]);

  // Load existing settings
  useEffect(() => {
    if (organization?.settings) {
      const settings = organization.settings as Record<string, any>;
      setPortalTitle(settings.portal_title || '');
      setPortalSubtitle(settings.portal_subtitle || '');
      setUploadEnabled(settings.portal_upload_enabled !== false);
      setCancelEnabled(settings.portal_cancel_enabled !== false);
      setSeatsEnabled(settings.portal_seats_enabled !== false);
      setAiPhotosEnabled(settings.portal_ai_photos_enabled !== false);
    }
  }, [organization]);

  // Load active bookings for test links
  useEffect(() => {
    const fetchBookings = async () => {
      if (!organization?.id) return;
      try {
        setLoadingBookings(true);
        const { data, error } = await supabase
          .from('group_bookings')
          .select('id, lead_name, public_token, total_amount, group_trips(title, destination)')
          .eq('org_id', organization.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        if (data) {
          setBookings(data);
          if (data.length > 0) {
            setSelectedBooking(data[0].public_token);
          }
        }
      } catch (err: any) {
        logger.error('Error fetching bookings in PortalManager:', err);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, [organization?.id]);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/portal/${organization?.slug}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({
      title: 'Link copiado!',
      description: 'O link do portal foi copiado para a sua área de transferência.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyBookingLink = () => {
    if (!selectedBooking) return;
    const link = `${window.location.origin}/minha-viagem/${selectedBooking}`;
    navigator.clipboard.writeText(link);
    setCopiedBooking(true);
    toast({
      title: 'Link da viagem copiado!',
      description: 'O link direto desta reserva de teste foi copiado para a sua área de transferência.',
    });
    setTimeout(() => setCopiedBooking(false), 2000);
  };

  const handleSaveSettings = async () => {
    if (!organization?.id) return;
    setSaving(true);
    try {
      const currentSettings = (organization.settings as Record<string, any>) || {};
      const newSettings = {
        ...currentSettings,
        portal_title: portalTitle,
        portal_subtitle: portalSubtitle,
        portal_upload_enabled: uploadEnabled,
        portal_cancel_enabled: cancelEnabled,
        portal_seats_enabled: seatsEnabled,
        portal_ai_photos_enabled: aiPhotosEnabled
      };

      const { error } = await supabase
        .from('organizations')
        .update({ settings: newSettings })
        .eq('id', organization.id);

      if (error) throw error;

      // Update local store
      setOrganization({
        ...organization,
        settings: newSettings
      });

      toast({
        title: 'Configurações salvas!',
        description: 'As políticas e recursos do portal foram atualizados com sucesso.',
      });
    } catch (err: any) {
      logger.error('Error saving portal settings:', err);
      toast({
        title: 'Erro ao salvar',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const portalUrl = `${window.location.origin}/portal/${organization?.slug}`;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
        
        {/* Banner informativo de links */}
        <Card className="bento-card border border-vj-border/60 bg-zinc-50/50">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-vj-txt">Endereço Público do seu Portal</h3>
              <p className="text-xs text-vj-txt3">Seus clientes podem fazer login e ver todas as viagens contratadas por aqui.</p>
              <div className="flex items-center gap-2 mt-2 bg-white border border-vj-border/60 rounded-xl px-3 py-2 text-xs font-mono select-all">
                <span className="text-vj-txt2 truncate max-w-[320px] md:max-w-md">{portalUrl}</span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={handleCopyLink} className="h-10 rounded-xl gap-2 font-bold text-xs">
                {copied ? <Check className="w-4 h-4 text-vj-green" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                {copied ? 'Copiado!' : 'Copiar Link'}
              </Button>
              <a href={portalUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="h-10 rounded-xl bg-vj-green hover:bg-emerald-600 text-white font-bold text-xs gap-2">
                  Visitar Portal <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Layout Principal: 2 Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Coluna 1: Configurações */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="bento-card border border-vj-border/60 bg-white">
              <CardHeader>
                <CardTitle className="text-base font-bold text-vj-txt flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-vj-green" /> Customização de Textos
                </CardTitle>
                <CardDescription>Defina as mensagens iniciais mostradas no topo do portal do passageiro.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="welcome-title" className="text-xs font-bold text-vj-txt">Título de Boas-vindas</Label>
                  <Input 
                    id="welcome-title"
                    value={portalTitle}
                    onChange={(e) => setPortalTitle(e.target.value)}
                    placeholder="Ex: Sua Próxima Grande Aventura"
                    className="h-11 rounded-xl bg-zinc-50 border-zinc-200 focus-visible:bg-white"
                  />
                  <p className="text-[10px] text-zinc-400">Deixe em branco para utilizar automaticamente o nome da viagem contratada pelo cliente.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="welcome-subtitle" className="text-xs font-bold text-vj-txt">Subtítulo explicativo</Label>
                  <Input 
                    id="welcome-subtitle"
                    value={portalSubtitle}
                    onChange={(e) => setPortalSubtitle(e.target.value)}
                    placeholder="Ex: Acompanhe seus vouchers, faturas e assentos."
                    className="h-11 rounded-xl bg-zinc-50 border-zinc-200 focus-visible:bg-white"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bento-card border border-vj-border/60 bg-white">
              <CardHeader>
                <CardTitle className="text-base font-bold text-vj-txt flex items-center gap-2">
                  <Shield className="w-5 h-5 text-vj-green" /> Funcionalidades do Passageiro
                </CardTitle>
                <CardDescription>Configure quais ações o cliente final pode realizar sozinho no portal.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold text-vj-txt">Envio de Comprovantes</Label>
                    <p className="text-[11px] text-zinc-400">Permite que o viajante anexe arquivos de transferência bancária ou PIX para faturas pendentes.</p>
                  </div>
                  <Switch checked={uploadEnabled} onCheckedChange={setUploadEnabled} />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold text-vj-txt">Solicitação de Cancelamento</Label>
                    <p className="text-[11px] text-zinc-400">Permite que o cliente calcule a multa de desistência contratual e solicite baixa via portal.</p>
                  </div>
                  <Switch checked={cancelEnabled} onCheckedChange={setCancelEnabled} />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold text-vj-txt">Visualização de Assentos / Frotas</Label>
                    <p className="text-[11px] text-zinc-400">Mostra o assento reservado pelo passageiro em ônibus ou voos cadastrados na viagem.</p>
                  </div>
                  <Switch checked={seatsEnabled} onCheckedChange={setSeatsEnabled} />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold text-vj-txt">Fotos Incríveis com IA</Label>
                    <p className="text-[11px] text-zinc-400">Habilita a geração autônoma de retratos do viajante em cenários do destino usando IA.</p>
                  </div>
                  <Switch checked={aiPhotosEnabled} onCheckedChange={setAiPhotosEnabled} />
                </div>

              </CardContent>
            </Card>

            {/* Testar com Reserva Real */}
            <Card className="bento-card border border-vj-border/60 bg-white">
              <CardHeader>
                <CardTitle className="text-base font-bold text-vj-txt flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-vj-green" /> Testar com Reserva Ativa
                </CardTitle>
                <CardDescription>Selecione um passageiro ativo para abrir o Portal do Viajante real em outra aba.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingBookings ? (
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Loader2 className="w-4 h-4 animate-spin text-vj-green" /> Carregando reservas...
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <select 
                        value={selectedBooking} 
                        onChange={(e) => setSelectedBooking(e.target.value)}
                        className="w-full h-11 rounded-xl bg-zinc-50 border border-zinc-200 text-xs px-3 focus:outline-none focus:border-vj-green"
                      >
                        {bookings.map(b => (
                          <option key={b.id} value={b.public_token}>
                            {b.lead_name} — {b.group_trips?.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={handleCopyBookingLink}
                        className="h-11 rounded-xl gap-2 text-xs font-bold bg-white hover:bg-zinc-50 border-zinc-200 text-vj-txt"
                      >
                        {copiedBooking ? <Check className="w-4 h-4 text-vj-green" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                        Copiar Link
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => window.open(`/minha-viagem/${selectedBooking}`, '_blank')}
                        className="h-11 rounded-xl gap-2 text-xs font-bold shrink-0 bg-white hover:bg-zinc-50 border-zinc-200 text-vj-txt"
                      >
                        Visualizar Portal do Cliente <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-zinc-50 border border-dashed border-zinc-200 rounded-xl text-center text-xs text-zinc-400 italic">
                    Nenhuma reserva localizada para testes. Crie uma cotação/reserva de grupo primeiro.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Salvar Botão */}
            <div className="flex justify-end gap-3">
              <Button 
                onClick={handleSaveSettings}
                disabled={saving}
                className="h-12 px-8 rounded-xl bg-vj-green hover:bg-emerald-600 text-white font-bold text-sm gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Salvar Configurações do Portal
              </Button>
            </div>
          </div>

          {/* Coluna 2: Simulador Interativo */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" /> Visualização em Tempo Real (Viajante)
            </span>
            
            {/* Phone Container */}
            <div className="relative w-[340px] h-[670px] bg-zinc-950 rounded-[48px] p-3 border-4 border-zinc-800 flex flex-col overflow-hidden">
              
              {/* Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-black rounded-2xl z-40" />

              {/* Screen Content */}
              <div className="w-full h-full bg-zinc-50 rounded-[38px] overflow-hidden flex flex-col select-none relative font-sans text-left text-zinc-800">
                
                {/* Header capa fictício */}
                <div className="relative h-44 bg-zinc-900 overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.3),transparent)]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1">
                    <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Sua Próxima Viagem</span>
                    <h4 className="font-black text-sm text-white leading-tight">
                      {portalTitle || 'Expedição Jalapão Selvagem'}
                    </h4>
                    <p className="text-[10px] text-white/70">
                      {portalSubtitle || 'Jalapão, TO · 12 a 16 de Outubro'}
                    </p>
                  </div>
                </div>

                {/* Inner Body */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar text-xs">
                  
                  {/* Card Viajante */}
                  <div className="bg-white border border-zinc-100 rounded-2xl p-3.5 space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-black text-zinc-900">Aline Silva</p>
                        <p className="text-[9px] text-zinc-400">aline@email.com</p>
                      </div>
                      <span className="font-mono text-[9px] font-bold bg-zinc-100 px-2 py-0.5 rounded text-zinc-600">#TK78A</span>
                    </div>
                    <div className="flex items-center gap-3 pt-2 border-t border-zinc-50 text-[9px] text-zinc-500">
                      <span className="flex items-center gap-1"><Users size={10} /> 1 Viajante</span>
                      {seatsEnabled && (
                        <span className="flex items-center gap-0.5 text-blue-600 font-medium"><Bus size={10} /> Assento: 12B</span>
                      )}
                    </div>
                  </div>

                  {/* Faturas e Comprovante */}
                  <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden">
                    <div className="p-3 border-b border-zinc-50 flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5"><CreditCard size={11} className="text-zinc-400" /> Faturamento</span>
                      <span className="font-black text-emerald-600">R$ 1.200,00</span>
                    </div>
                    <div className="p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-medium text-zinc-700">Parcela 2 de 3</span>
                        <span className="font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">Aguardando</span>
                      </div>
                      
                      {uploadEnabled ? (
                        <div className="p-3 bg-zinc-50 border border-dashed border-zinc-200 rounded-xl flex items-center justify-center gap-1.5 text-[9px] font-semibold text-zinc-500 hover:bg-zinc-100 cursor-pointer">
                          <Upload size={10} /> Anexar Comprovante PIX
                        </div>
                      ) : (
                        <div className="p-3 bg-zinc-50/50 border border-zinc-100 rounded-xl text-center text-[9px] text-zinc-400 italic">
                          Anexo de comprovante desabilitado
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fotos IA Banner */}
                  {aiPhotosEnabled && (
                    <div className="p-3.5 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-bold text-zinc-900 text-[10px] flex items-center gap-1">
                          <Sparkles size={11} className="text-violet-500 fill-violet-500" /> Suas Fotos com IA
                        </p>
                        <p className="text-[8px] text-zinc-400">Gere retratos incríveis seus no destino!</p>
                      </div>
                      <Button size="sm" className="h-6 text-[8px] font-black bg-zinc-950 text-white rounded-lg hover:bg-zinc-800">
                        Gerar Fotos
                      </Button>
                    </div>
                  )}

                  {/* Cancelamento Solicitação */}
                  {cancelEnabled && (
                    <div className="p-3 bg-white border border-zinc-100 rounded-2xl flex items-center justify-between text-zinc-400 hover:text-red-500 cursor-pointer">
                      <span className="font-medium text-[10px] flex items-center gap-1.5">
                        <XCircle size={11} /> Solicitar cancelamento da viagem
                      </span>
                    </div>
                  )}

                </div>

                {/* Footer do simulador */}
                <div className="h-10 border-t border-zinc-200/50 bg-white flex items-center justify-center text-[9px] text-zinc-400 font-medium select-none">
                  {organization?.name || 'Turis Agências'}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </AppLayout>
  );
}
