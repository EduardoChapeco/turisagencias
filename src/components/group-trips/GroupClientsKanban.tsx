import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGroupClients, useUpdateGroupClient, getInadimplenciaColor, gerarLinkCobrancaWhatsapp, gerarLinkCobrancaComPortalWhatsapp } from '@/hooks/useGroupClients';
import { useGroupInstallmentsByTrip } from '@/hooks/useGroupInstallments';
import { useGroupTripBookings } from '@/hooks/useGroupTripFinance';
import { useGroupTrips } from '@/hooks/useGroupTrips';
import { SheetPage } from '@/components/ui/SheetPage';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, FileText, BadgeDollarSign, PlaneTakeoff, Bell, Trash2, Search, ArrowRight } from 'lucide-react';

interface GroupClientsKanbanProps {
  groupTripId: string;
}

const COLUMNS = [
  { id: 'pendente', label: 'Interessado / Pendente', icon: Users, color: 'bg-zinc-100' },
  { id: 'atrasado', label: 'Inadimplente (Atraso)', icon: Bell, color: 'bg-red-50' },
  { id: 'em_dia', label: 'Em Dia (Parcelando)', icon: BadgeDollarSign, color: 'bg-amber-50' },
  { id: 'quitado', label: 'Quitado / Confirmado', icon: PlaneTakeoff, color: 'bg-vj-green/10' },
];

export function GroupClientsKanban({ groupTripId }: GroupClientsKanbanProps) {
  const { data: clients, isLoading } = useGroupClients(groupTripId);
  const { data: installments } = useGroupInstallmentsByTrip(groupTripId);
  const { data: bookings } = useGroupTripBookings(groupTripId);
  const { data: trips } = useGroupTrips();
  const updateClient = useUpdateGroupClient();

  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  if (isLoading) return <div className="p-12 text-center text-zinc-500">Carregando painel de clientes...</div>;

  const trip = trips?.find(t => t.id === groupTripId);
  const destino = trip?.destination || 'sua viagem';

  const findBookingForClient = (groupClient: any) => {
    if (!bookings || !groupClient) return null;
    return bookings.find((b: any) => {
      // 1. Match por client_id
      if (groupClient.client_id && b.client_id && groupClient.client_id === b.client_id) return true;
      
      // 2. Match por CPF normalizado
      if (groupClient.cpf && b.lead_cpf) {
        const c1 = groupClient.cpf.replace(/\D/g, '');
        const c2 = b.lead_cpf.replace(/\D/g, '');
        if (c1 && c1 === c2) return true;
      }
      
      // 3. Match por e-mail
      if (groupClient.email && b.lead_email) {
        if (groupClient.email.trim().toLowerCase() === b.lead_email.trim().toLowerCase()) return true;
      }
      
      // 4. Match por telefone normalizado
      if (groupClient.telefone && b.lead_phone) {
        const t1 = groupClient.telefone.replace(/\D/g, '');
        const t2 = b.lead_phone.replace(/\D/g, '');
        if (t1 && t1 === t2) return true;
      }
      
      // 5. Match por nome completo
      if (groupClient.nome_completo && b.lead_name) {
        const n1 = groupClient.nome_completo.trim().toLowerCase();
        const n2 = b.lead_name.trim().toLowerCase();
        if (n1 && n1 === n2) return true;
      }
      
      return false;
    }) || null;
  };

  const filteredClients = clients?.filter(c => 
    c.nome_completo.toLowerCase().includes(search.toLowerCase()) || 
    c.cpf?.includes(search)
  ) || [];

  return (
    <div className="space-y-6">
      
      {/* ── HEADER DE CONTROLE ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-zinc-200">
        <div>
          <h2 className="font-heading font-black text-lg text-vj-txt">CRM do Grupo (Inadimplência)</h2>
          <p className="text-sm text-vj-txt3">Gerencie contratos, pagamentos em carnê e saúde financeira.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input 
              placeholder="Buscar cliente ou CPF..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="pl-9"
            />
          </div>
          <Button onClick={() => setEditingId('new')} className="shrink-0">
            <Users size={16} className="mr-2" /> Novo Cliente
          </Button>
        </div>
      </div>

      {/* ── KANBAN BOARD ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(col => {
          const colClients = filteredClients.filter(c => c.status_pagamento === col.id);
          
          return (
            <div key={col.id} className="flex flex-col gap-3 min-w-[300px]">
              
              {/* Column Header */}
              <div className={`p-4 rounded-[2rem] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between ${col.color}`}>
                <div className="flex items-center gap-2">
                  <col.icon size={18} className="text-zinc-600" />
                  <span className="font-bold text-sm text-zinc-800">{col.label}</span>
                </div>
                <Badge variant="secondary" className="bg-white/80 shadow-sm border-white/50">{colClients.length}</Badge>
              </div>

              {/* Cards */}
              <div className="flex-1 space-y-3">
                {colClients.length === 0 ? (
                  <div className="p-8 text-center text-xs font-medium text-zinc-400 border-2 border-dashed border-zinc-200 rounded-xl">
                    Nenhum cliente
                  </div>
                ) : (
                  colClients.map(client => {
                    const colorState = getInadimplenciaColor(client.status_pagamento, client.dias_atraso);
                    
                    return (
                      <Card 
                        key={client.id} 
                        className="p-5 border-white/60 bg-white/60 backdrop-blur-md shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[1.5rem] hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                        onClick={() => setEditingId(client.id)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-vj-txt line-clamp-1 flex-1 pr-2 group-hover:text-vj-blue transition-colors">{client.nome_completo}</h4>
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            colorState === 'red' ? 'bg-red-500 animate-pulse' : 
                            colorState === 'yellow' ? 'bg-amber-400' : 
                            colorState === 'green' ? 'bg-vj-green' : 'bg-zinc-300'
                          }`} />
                        </div>
                        
                        <div className="space-y-1.5 mb-4">
                          <div className="flex justify-between items-center text-xs text-zinc-500">
                            <span>Vendido:</span>
                            <span className="font-medium text-zinc-700">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.valor_total || 0)}</span>
                          </div>
                          
                          {client.status_pagamento === 'atrasado' && (
                            <div className="flex justify-between items-center text-xs text-red-600 bg-red-50 px-2 py-1 rounded-md">
                              <span className="font-semibold">Atraso:</span>
                              <span className="font-bold">{client.dias_atraso} dias</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-zinc-100">
                          {client.status_pagamento === 'atrasado' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full text-xs h-10 rounded-xl border-vj-green/30 text-vj-green hover:bg-vj-green hover:text-white hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                const clientInsts = installments?.filter(i => i.group_client_id === client.id) || [];
                                const lateInst = clientInsts.find(i => i.status === 'atrasado') || clientInsts.find(i => i.status === 'pendente') || null;
                                const valorParcela = lateInst ? lateInst.valor : (client.valor_total || 0) / (client.max_parcelas || 1);
                                const numParcela = lateInst ? lateInst.numero_parcela : 1;
                                const bookingObj = findBookingForClient(client);
                                const token = bookingObj?.public_token || null;

                                const link = gerarLinkCobrancaComPortalWhatsapp(
                                  client,
                                  destino,
                                  valorParcela,
                                  numParcela,
                                  token
                                );
                                window.open(link, '_blank');
                              }}
                            >
                              Cobrar WhatsApp
                            </Button>
                          )}
                          {client.status_pagamento !== 'atrasado' && (
                            <Button size="sm" variant="ghost" className="w-full text-xs h-10 rounded-xl text-zinc-500 hover:bg-zinc-100 hover:scale-[1.02] active:scale-95 transition-all duration-300">
                              Ver Detalhes <ArrowRight size={14} className="ml-1" />
                            </Button>
                          )}
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sheet de Edição virá aqui (pode ser expandido depois, mas já funcional p/ o Kanban visual) */}
    </div>
  );
}
