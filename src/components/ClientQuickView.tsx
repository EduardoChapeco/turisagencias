import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SheetPage } from '@/components/ui/SheetPage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useClient } from '@/hooks/useClients';
import {
  User, Mail, Phone, MapPin, Globe, Shield, FileText, Copy,
  Plane, Edit, Star, Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClientQuickViewProps {
  clientId: string | null;
  open: boolean;
  onClose: () => void;
  onEdit: (id: string) => void;
}

export function ClientQuickView({ clientId, open, onClose, onEdit }: ClientQuickViewProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: client, isLoading } = useClient(open && clientId ? clientId : undefined);

  const copyPortalLink = () => {
    if (!clientId) return;
    const link = `${window.location.origin}/portal-trip/${clientId}`;
    navigator.clipboard.writeText(link);
    toast({ title: '🔗 Link do portal copiado!', description: link });
  };

  const prefs = (client?.preferences as Record<string, any>) || {};
  const documents: any[] = prefs.documents || [];
  const isVip = client?.tags?.map((t: string) => t.toLowerCase()).includes('vip');

  return (
    <SheetPage
      open={open}
      onClose={onClose}
      title={client?.name || 'Cliente'}
      subtitle="Ficha Rápida — Visualização CRM"
      icon={User}
      sections={[
        { id: 'perfil', label: 'Perfil' },
        { id: 'docs', label: 'Documentos' },
        { id: 'preferencias', label: 'Preferências' },
        { id: 'portal', label: 'Portal' },
      ]}
      footer={
        <div className="flex w-full gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          <Button variant="outline" onClick={() => { onClose(); navigate(`/clients/${clientId}`); }}>
            Ver Ficha Completa
          </Button>
          <Button className="bg-vj-green text-white hover:bg-vj-green/90" onClick={() => { onClose(); onEdit(clientId!); }}>
            <Edit className="mr-2 h-4 w-4" /> Editar Cliente
          </Button>
        </div>
      }
    >
      {(activeSection) => {
        if (isLoading) return <div className="py-10 text-center text-sm text-vj-txt3 animate-pulse">Carregando...</div>;
        if (!client) return <div className="py-10 text-center text-sm text-vj-txt3">Cliente não encontrado.</div>;

        return (
          <>
            {activeSection === 'perfil' && (
              <div className="space-y-6">
                <div className="flex gap-4 items-center">
                  <div className="h-20 w-20 rounded-full bg-vj-green/10 border-2 border-vj-green/20 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {client.photo_url ? (
                      <img src={client.photo_url} alt={client.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-vj-green">{client.name[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold text-vj-txt">{client.name}</h2>
                      {isVip && <Badge className="bg-purple-500 text-white text-xs">VIP</Badge>}
                      {client.portal_access_enabled && (
                        <Badge className="bg-vj-green/10 text-vj-green border border-vj-green/20 text-xs flex items-center gap-1">
                          <Shield className="w-3 h-3" /> Portal
                        </Badge>
                      )}
                    </div>
                    {client.origin && <p className="text-xs text-vj-txt3 mt-1">Canal: {client.origin}</p>}
                    {client.created_at && (
                      <p className="text-xs text-vj-txt3 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        Cliente desde {new Date(client.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {[
                    { icon: Mail, label: 'E-mail', value: client.email },
                    { icon: Phone, label: 'WhatsApp', value: client.phone },
                    { icon: User, label: 'CPF', value: client.cpf },
                    { icon: Calendar, label: 'Nascimento', value: client.birth_date ? new Date(client.birth_date).toLocaleDateString('pt-BR') : null },
                    { icon: MapPin, label: 'Cidade / Estado', value: [client.city, client.state].filter(Boolean).join(' — ') || null },
                  ].map(({ icon: Icon, label, value }) => value ? (
                    <div key={label} className="flex items-center gap-3 p-3 rounded-vj-lg bg-vj-surface border border-vj-border">
                      <Icon className="h-4 w-4 text-vj-green flex-shrink-0" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-vj-txt3 font-semibold">{label}</p>
                        <p className="text-sm font-medium text-vj-txt">{value}</p>
                      </div>
                    </div>
                  ) : null)}
                </div>

                {client.tags && client.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {client.tags.map((tag: string) => (
                      <Badge key={tag} className="bg-vj-green/10 text-vj-green border border-vj-green/20">#{tag}</Badge>
                    ))}
                  </div>
                )}

                {client.notes && (
                  <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-vj-lg">
                    <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> Nota Interna</p>
                    <p className="text-sm text-amber-900 leading-relaxed">{client.notes}</p>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'docs' && (
              <div className="space-y-4">
                {documents.length === 0 ? (
                  <div className="text-center py-12 text-vj-txt3 text-sm border border-dashed border-vj-border rounded-vj-lg">
                    Nenhum documento cadastrado na ficha deste cliente.
                  </div>
                ) : documents.map((doc: any, i: number) => (
                  <div key={i} className="p-4 rounded-vj-lg border border-vj-border bg-vj-surface space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-vj-txt flex items-center gap-2">
                        <FileText className="w-4 h-4 text-vj-green" /> {doc.type || 'Documento'}
                      </span>
                      {doc.url && (
                        <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs text-vj-green underline hover:text-vj-green/70">Ver arquivo</a>
                      )}
                    </div>
                    {doc.number && <p className="text-xs text-vj-txt2">Nº: <span className="font-mono font-semibold">{doc.number}</span></p>}
                    {doc.expiry && <p className="text-xs text-vj-txt2">Validade: {new Date(doc.expiry).toLocaleDateString('pt-BR')}</p>}
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'preferencias' && (
              <div className="space-y-4">
                {[
                  { icon: Plane, label: 'Destinos Preferidos', value: prefs.destinations },
                  { icon: Globe, label: 'Companhias Aéreas', value: prefs.airlines },
                  { icon: Star, label: 'Assento', value: prefs.seat },
                  { icon: FileText, label: 'Restrição Alimentar', value: prefs.meal },
                  { icon: FileText, label: 'Programa de Milhas', value: prefs.loyalty },
                ].map(({ icon: Icon, label, value }) => value ? (
                  <div key={label} className="flex items-start gap-3 p-3 rounded-vj-lg bg-vj-surface border border-vj-border">
                    <Icon className="h-4 w-4 text-vj-green mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-vj-txt3 font-semibold">{label}</p>
                      <p className="text-sm font-medium text-vj-txt">{value}</p>
                    </div>
                  </div>
                ) : null)}
                {!prefs.destinations && !prefs.airlines && !prefs.seat && !prefs.meal && !prefs.loyalty && (
                  <div className="text-center py-12 text-vj-txt3 text-sm border border-dashed border-vj-border rounded-vj-lg">
                    Nenhuma preferência de viagem cadastrada.
                  </div>
                )}
              </div>
            )}

            {activeSection === 'portal' && (
              <div className="space-y-6">
                <div className="p-5 rounded-vj-lg border border-vj-border bg-vj-surface space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-vj-txt flex items-center gap-2">
                      <Shield className="h-4 w-4 text-vj-green" /> Status do Portal
                    </h3>
                    <Badge className={client.portal_access_enabled 
                      ? "bg-vj-green/10 text-vj-green border border-vj-green/20" 
                      : "bg-vj-surface text-vj-txt3 border border-vj-border"}>
                      {client.portal_access_enabled ? '✓ Ativo' : '✗ Inativo'}
                    </Badge>
                  </div>
                  <p className="text-xs text-vj-txt3">O Portal do Cliente permite que o viajante acesse seus roteiros, checklists e documentos de viagem através de um link personalizado.</p>
                </div>

                {client.portal_access_enabled && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-vj-txt2 uppercase tracking-wider">Link do Portal</p>
                    <div className="flex gap-2 items-center p-3 bg-vj-bg border border-vj-border rounded-vj-lg">
                      <code className="text-xs text-vj-txt3 flex-1 truncate">{window.location.origin}/portal-trip/{clientId}</code>
                      <Button size="sm" variant="outline" onClick={copyPortalLink} className="flex-shrink-0 border-vj-border gap-1.5">
                        <Copy className="h-3.5 w-3.5" /> Copiar
                      </Button>
                    </div>
                    <p className="text-xs text-vj-txt3">Envie este link por WhatsApp para o cliente acessar o portal com suas viagens.</p>
                  </div>
                )}

                {!client.portal_access_enabled && (
                  <div className="text-center py-8 space-y-2">
                    <p className="text-sm text-vj-txt3">Ative o acesso ao portal na edição da ficha do cliente para liberar o link mágico.</p>
                    <Button variant="outline" onClick={() => { onClose(); onEdit(clientId!); }}>
                      <Edit className="mr-2 h-4 w-4" /> Editar e Ativar Portal
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        );
      }}
    </SheetPage>
  );
}
