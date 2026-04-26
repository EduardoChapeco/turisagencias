import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Wallet, TrendingUp, TrendingDown, RefreshCw, Plus, DollarSign, Calendar } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useSuppliers, useTransactions, useCreateTransaction, Transaction } from '@/hooks/useFinance';
import { useGroupTrips } from '@/hooks/useGroupTrips';
import { PageSkeleton } from '@/components/ui/EmptyState';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SheetPage } from '@/components/ui/SheetPage';
import { ClientSearchSelect } from '@/components/ui/ClientSearchSelect';

const SHEET_SECTIONS = [
  { id: 'dados', label: 'Dados do Lançamento', icon: DollarSign },
  { id: 'vinculos', label: 'Vínculos', icon: Wallet },
  { id: 'vencimento', label: 'Datas e Pagamento', icon: Calendar },
];

export default function Transactions() {
  const { profile } = useAuthStore();
  const [filterType, setFilterType] = useState<'receivable' | 'payable' | undefined>();
  const { data: transactions, isLoading } = useTransactions(profile?.org_id, { type: filterType });
  const { data: suppliers } = useSuppliers(profile?.org_id);
  const { data: groupTrips } = useGroupTrips();
  const createTransaction = useCreateTransaction();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'receivable' as Transaction['type'],
    status: 'pending' as Transaction['status'],
    amount: '' as string | number,
    due_date: '',
    description: '',
    payment_method: '',
    client_id: '',
    supplier_id: '',
    group_trip_id: '',
    category: '',
    reference_number: '',
  });

  const update = (field: string, value: any) =>
    setFormData(p => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    const amount = Number(formData.amount);
    if (!amount || !formData.due_date) return;
    await createTransaction.mutateAsync({
      org_id: profile!.org_id!,
      trip_id: null,
      ...formData,
      group_trip_id: formData.group_trip_id || null,
      client_id: formData.client_id || null,
      supplier_id: formData.supplier_id || null,
      category: formData.category || null,
      reference_number: formData.reference_number || null,
      amount,
      paid_at: null,
    } as Record<string, any>);
    setIsSheetOpen(false);
    setFormData({
      type: 'receivable',
      status: 'pending',
      amount: '',
      due_date: '',
      description: '',
      payment_method: '',
      client_id: '',
      supplier_id: '',
      group_trip_id: '',
      category: '',
      reference_number: '',
    });
  };

  if (isLoading) return <AppLayout><PageSkeleton /></AppLayout>;

  const totalReceivables = transactions?.filter(t => t.type === 'receivable' && t.status !== 'canceled').reduce((acc, t) => acc + t.amount, 0) || 0;
  const totalPayables = transactions?.filter(t => t.type === 'payable' && t.status !== 'canceled').reduce((acc, t) => acc + t.amount, 0) || 0;

  return (
    <>
      <AppLayout fullHeight>
        <div className="flex flex-col h-full gap-4">
          <PageHeader
            title="Financeiro"
            description="Controle de recebimentos de clientes e pagamentos a fornecedores."
            icon={Wallet}
            actions={
              <Button onClick={() => setIsSheetOpen(true)} className="rounded-full gap-2 px-6">
                <Plus size={16}/> Novo Lançamento
              </Button>
            }
          />

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border ">
               <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-green-100 dark:bg-green-900/40 text-green-600 rounded-xl">
                   <TrendingUp size={18} />
                 </div>
                 <p className="font-semibold text-sm text-muted-foreground">A Receber / Recebidos</p>
               </div>
               <p className="text-2xl font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReceivables)}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border ">
               <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-red-100 dark:bg-red-900/40 text-red-600 rounded-xl">
                   <TrendingDown size={18} />
                 </div>
                 <p className="font-semibold text-sm text-muted-foreground">A Pagar / Pagos</p>
               </div>
               <p className="text-2xl font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPayables)}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 border ">
               <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-xl">
                   <RefreshCw size={18} />
                 </div>
                 <p className="font-semibold text-sm text-muted-foreground">Lucro Operacional (Previsão)</p>
               </div>
               <p className="text-2xl font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReceivables - totalPayables)}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border flex-1 flex flex-col min-h-0">
             <div className="flex gap-2 mb-6">
                <Button variant={filterType === undefined ? 'default' : 'outline'} className="rounded-full" onClick={() => setFilterType(undefined)}>Todos</Button>
                <Button variant={filterType === 'receivable' ? 'default' : 'outline'} className="rounded-full text-green-600 border-green-200" onClick={() => setFilterType('receivable')}>Entradas (Recebíveis)</Button>
                <Button variant={filterType === 'payable' ? 'default' : 'outline'} className="rounded-full text-red-600 border-red-200" onClick={() => setFilterType('payable')}>Saídas (Pagáveis)</Button>
             </div>
             
             <div className="flex-1 overflow-auto rounded-xl border">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted sticky top-0 z-10 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Origem/Destino</th>
                    <th className="px-4 py-3 font-medium">Viagem Ref.</th>
                    <th className="px-4 py-3 font-medium">Vencimento</th>
                    <th className="px-4 py-3 font-medium text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {(!transactions || transactions.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        Nenhuma transação encontrada.
                      </td>
                    </tr>
                  ) : (
                    transactions.map(t => (
                      <tr key={t.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          {t.type === 'receivable' ? (
                             <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs gap-1 flex items-center w-fit"><TrendingUp size={12}/> Entrada</span>
                          ) : (
                             <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs gap-1 flex items-center w-fit"><TrendingDown size={12}/> Saída</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                           {{
                             pending: <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">Pendente</Badge>,
                             paid: <Badge className="bg-green-500 text-white">Pago</Badge>,
                             overdue: <Badge variant="destructive">Vencido</Badge>,
                             canceled: <Badge variant="outline" className="text-zinc-400">Cancelado</Badge>,
                           }[t.status] ?? <Badge variant="secondary">{t.status}</Badge>}
                        </td>
                        <td className="px-4 py-3">
                           {t.type === 'receivable' ? t.clients?.name || '-' : t.suppliers?.name || t.description || '-'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">
                           {t.group_trips?.title || '-'}
                        </td>
                        <td className="px-4 py-3">
                           {new Date(t.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-right font-bold">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </AppLayout>

      <SheetPage
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="Novo Lançamento Financeiro"
        subtitle="Registre uma entrada ou saída no controle financeiro"
        icon={Wallet}
        sections={SHEET_SECTIONS}
        defaultSection="dados"
        footer={
          <div className="flex items-center gap-3 w-full justify-end">
            <Button variant="ghost" onClick={() => setIsSheetOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.amount || !formData.due_date || createTransaction.isPending}
              className="rounded-full px-8 bg-vj-green hover:bg-vj-green/90"
            >
              {createTransaction.isPending ? 'Registrando...' : 'Registrar Lançamento'}
            </Button>
          </div>
        }
      >
        {(activeSection) => (
          <>
            {activeSection === 'dados' && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="font-semibold">Tipo de Lançamento *</Label>
                  <Select value={formData.type} onValueChange={(v: any) => update('type', v)}>
                    <SelectTrigger className="h-12 rounded-xl bg-zinc-50 border-zinc-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receivable">📈 Entrada (A Receber)</SelectItem>
                      <SelectItem value="payable">📉 Saída (A Pagar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold">Valor (R$) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ex: 1500.00"
                    value={formData.amount === '' ? '' : formData.amount}
                    onChange={e => update('amount', e.target.value)}
                    className="h-12 rounded-xl bg-zinc-50 border-zinc-200 text-lg font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold">Descrição / Observação</Label>
                  <Input
                    value={formData.description}
                    onChange={e => update('description', e.target.value)}
                    placeholder="Ex: Pagamento parcela 1/3 viagem Europa..."
                    className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                  />
                </div>
              </div>
            )}

            {activeSection === 'vinculos' && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="font-semibold">Cliente vinculado</Label>
                  <ClientSearchSelect
                    value={formData.client_id}
                    onChange={(value) => update('client_id', value)}
                    placeholder="Buscar cliente..."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold">Fornecedor</Label>
                  <Select
                    value={formData.supplier_id || '_none'}
                    onValueChange={(value) => update('supplier_id', value === '_none' ? '' : value)}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-zinc-50 border-zinc-200">
                      <SelectValue placeholder="Selecionar fornecedor..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Nenhum fornecedor</SelectItem>
                      {suppliers?.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold">Viagem / pacote</Label>
                  <Select
                    value={formData.group_trip_id || '_none'}
                    onValueChange={(value) => update('group_trip_id', value === '_none' ? '' : value)}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-zinc-50 border-zinc-200">
                      <SelectValue placeholder="Selecionar viagem..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Nenhuma viagem</SelectItem>
                      {groupTrips?.map((trip) => (
                        <SelectItem key={trip.id} value={trip.id}>
                          {trip.title || trip.destination || `Pacote ${trip.id.slice(0, 8)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="font-semibold">Categoria</Label>
                    <Input
                      value={formData.category}
                      onChange={e => update('category', e.target.value)}
                      placeholder="Ex: hospedagem, passagem..."
                      className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-semibold">Referencia / nota</Label>
                    <Input
                      value={formData.reference_number}
                      onChange={e => update('reference_number', e.target.value)}
                      placeholder="NF, localizador, contrato..."
                      className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'vencimento' && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="font-semibold">Data de Vencimento *</Label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={e => update('due_date', e.target.value)}
                    className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold">Status</Label>
                  <Select value={formData.status} onValueChange={(v: any) => update('status', v)}>
                    <SelectTrigger className="h-12 rounded-xl bg-zinc-50 border-zinc-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="paid">Pago / Recebido</SelectItem>
                      <SelectItem value="overdue">Em Atraso</SelectItem>
                      <SelectItem value="canceled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold">Forma de Pagamento</Label>
                  <Select value={formData.payment_method || ''} onValueChange={(v) => update('payment_method', v)}>
                    <SelectTrigger className="h-12 rounded-xl bg-zinc-50 border-zinc-200">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                      <SelectItem value="cartao">Cartão de Crédito</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </>
        )}
      </SheetPage>
    </>
  );
}
