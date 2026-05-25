import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGroupInstallmentsByTrip, useUpdateGroupInstallment } from '@/hooks/useGroupInstallments';
import { useGroupClients, gerarLinkCobrancaComPortalWhatsapp } from '@/hooks/useGroupClients';
import { useGroupTripBookings } from '@/hooks/useGroupTripFinance';
import { useGroupTrips } from '@/hooks/useGroupTrips';
import { BadgeDollarSign, Calendar, CheckCircle2, AlertCircle, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface GroupFinancialBoardProps {
  groupTripId: string;
}

export function GroupFinancialBoard({ groupTripId }: GroupFinancialBoardProps) {
  const { data: installments, isLoading: isLoadingInstallments } = useGroupInstallmentsByTrip(groupTripId);
  const { data: clients, isLoading: isLoadingClients } = useGroupClients(groupTripId);
  const { data: bookings } = useGroupTripBookings(groupTripId);
  const { data: trips } = useGroupTrips();
  const updateInstallment = useUpdateGroupInstallment();

  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [search, setSearch] = useState('');

  if (isLoadingInstallments || isLoadingClients) {
    return <div className="p-12 text-center text-zinc-500">Carregando financeiro...</div>;
  }

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

  const clientsMap = new Map(clients?.map(c => [c.id, c.nome_completo]));

  // Filtros
  const filtered = installments?.filter(inst => {
    const nome = clientsMap.get(inst.group_client_id) || '';
    const matchName = nome.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'todos' || inst.status === filterStatus;
    return matchName && matchStatus;
  }) || [];

  // KPIs
  const kpis = {
    totalPendente: installments?.filter(i => i.status === 'pendente').reduce((acc, curr) => acc + curr.valor, 0) || 0,
    totalPago: installments?.filter(i => i.status === 'pago').reduce((acc, curr) => acc + curr.valor, 0) || 0,
    totalAtrasado: installments?.filter(i => i.status === 'atrasado').reduce((acc, curr) => acc + curr.valor, 0) || 0,
  };

  const handleMarcarPago = (id: string) => {
    updateInstallment.mutate({
      id,
      status: 'pago',
      data_pagamento: new Date().toISOString().split('T')[0],
      metodo_pagamento: 'pix',
    });
  };

  const fmtCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 rounded-[2rem] border-white/60 bg-white/60 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2 text-zinc-500 font-semibold uppercase tracking-wider text-xs"><Clock size={16}/> A Receber (No Prazo)</div>
          <div className="text-3xl font-black text-vj-txt">{fmtCurrency(kpis.totalPendente)}</div>
        </Card>
        <Card className="p-6 rounded-[2rem] border-vj-green/20 bg-vj-green/5 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2 text-vj-green font-semibold uppercase tracking-wider text-xs"><CheckCircle2 size={16}/> Receita Realizada</div>
          <div className="text-3xl font-black text-vj-green">{fmtCurrency(kpis.totalPago)}</div>
        </Card>
        <Card className="p-6 rounded-[2rem] border-red-100 bg-red-50/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2 text-red-600 font-semibold uppercase tracking-wider text-xs"><AlertCircle size={16}/> Em Atraso</div>
          <div className="text-3xl font-black text-red-600">{fmtCurrency(kpis.totalAtrasado)}</div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white/60 backdrop-blur-md p-4 rounded-[1.5rem] border border-white/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] items-center justify-between">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Input 
            placeholder="Buscar por cliente..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="pendente">Pendentes</SelectItem>
              <SelectItem value="atrasado">Atrasados</SelectItem>
              <SelectItem value="pago">Pagos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="overflow-hidden border-white/60 bg-white/60 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Parcela</th>
                <th className="px-6 py-4">Vencimento</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">Nenhuma parcela encontrada.</td>
                </tr>
              ) : (
                filtered.map((inst) => (
                  <tr key={inst.id} className="hover:bg-zinc-50/50">
                    <td className="px-6 py-4 font-medium">{clientsMap.get(inst.group_client_id) || 'Desconhecido'}</td>
                    <td className="px-6 py-4 text-zinc-500">
                      {inst.numero_parcela === 0 ? 'Entrada' : `${inst.numero_parcela}ª Parcela`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-zinc-400" />
                        {new Date(inst.data_vencimento).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">{fmtCurrency(inst.valor)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        inst.status === 'pago' ? 'bg-vj-green/10 text-vj-green' :
                        inst.status === 'atrasado' ? 'bg-red-100 text-red-600' :
                        'bg-zinc-100 text-zinc-600'
                      }`}>
                        {inst.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {inst.status !== 'pago' && (
                          <>
                            {(() => {
                              const clientObj = clients?.find(c => c.id === inst.group_client_id);
                              const bookingObj = findBookingForClient(clientObj);
                              const token = bookingObj?.public_token || null;
                              
                              return (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-9 rounded-xl text-xs font-bold border-emerald-500/30 text-emerald-600 hover:bg-emerald-600 hover:text-white hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-sm"
                                  onClick={() => {
                                    if (clientObj) {
                                      const link = gerarLinkCobrancaComPortalWhatsapp(
                                        clientObj,
                                        destino,
                                        inst.valor,
                                        inst.numero_parcela,
                                        token
                                      );
                                      window.open(link, '_blank');
                                    } else {
                                      toast.error('Erro ao processar cliente.');
                                    }
                                  }}
                                >
                                  Cobrar WhatsApp
                                </Button>
                              );
                            })()}
                            
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-9 rounded-xl text-xs font-bold border-vj-green/30 text-vj-green hover:bg-vj-green hover:text-white hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-sm"
                              onClick={() => handleMarcarPago(inst.id)}
                            >
                              Marcar Pago
                            </Button>
                          </>
                        )}
                        {inst.status === 'pago' && (
                          <span className="text-xs text-zinc-400 font-medium">Pago em {inst.data_pagamento ? new Date(inst.data_pagamento).toLocaleDateString('pt-BR') : ''}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
