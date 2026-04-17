import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, TrendingDown, RefreshCw, Plus } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useTransactions, useCreateTransaction, Transaction } from '@/hooks/useFinance';
import { PageSkeleton } from '@/components/ui/EmptyState';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Transactions() {
  const { profile } = useAuthStore();
  const [filterType, setFilterType] = useState<'receivable' | 'payable' | undefined>();
  const { data: transactions, isLoading } = useTransactions(profile?.org_id, { type: filterType });
  const createTransaction = useCreateTransaction();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'receivable' as Transaction['type'],
    status: 'pending' as Transaction['status'],
    amount: 0,
    due_date: '',
    description: '',
    payment_method: '',
  });

  const handleSubmit = async () => {
    if (!formData.amount || !formData.due_date) return;
    await createTransaction.mutateAsync({
      org_id: profile!.org_id!,
      trip_id: null,
      client_id: null,
      supplier_id: null,
      ...formData,
      paid_at: null,
    } as any);
    setIsDialogOpen(false);
    setFormData({ type: 'receivable', status: 'pending', amount: 0, due_date: '', description: '', payment_method: '' });
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
            <Button onClick={() => setIsDialogOpen(true)} className="rounded-full gap-2 px-6">
              <Plus size={16}/> Novo Lançamento
            </Button>
          }
        />

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border ">
             <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-green-100 dark:bg-green-900/40 text-green-600 rounded-xl">
                 <TrendingUp size={18} />
               </div>
               <p className="font-semibold text-sm text-muted-foreground">A Receber / Recebidos</p>
             </div>
             <p className="text-2xl font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReceivables)}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border ">
             <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-red-100 dark:bg-red-900/40 text-red-600 rounded-xl">
                 <TrendingDown size={18} />
               </div>
               <p className="font-semibold text-sm text-muted-foreground">A Pagar / Pagos</p>
             </div>
             <p className="text-2xl font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPayables)}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border ">
             <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-xl">
                 <RefreshCw size={18} />
               </div>
               <p className="font-semibold text-sm text-muted-foreground">Lucro Operacional (Previsão)</p>
             </div>
             <p className="text-2xl font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReceivables - totalPayables)}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border  flex-1 flex flex-col min-h-0">
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
                         <Badge variant={t.status === 'paid' ? 'default' : t.status === 'overdue' ? 'destructive' : 'secondary'} className={t.status === 'paid' ? 'bg-green-500' : ''}>
                           {t.status}
                         </Badge>
                      </td>
                      <td className="px-4 py-3">
                         {t.type === 'receivable' ? t.clients?.name || '-' : t.suppliers?.name || t.description || '-'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">
                         {t.trips?.title || '-'}
                      </td>
                      <td className="px-4 py-3">
                         {new Date(t.due_date).toLocaleDateString('pt-BR')}
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

    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>Novo Lançamento Financeiro</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Tipo</Label>
            <Select value={formData.type} onValueChange={(v: any) => setFormData({...formData, type: v})}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="receivable">Entrada (A Receber)</SelectItem>
                <SelectItem value="payable">Saída (A Pagar)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Valor (R$)</Label>
            <Input type="number" min="0" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="rounded-xl" />
          </div>
          <div className="grid gap-2">
            <Label>Vencimento</Label>
            <Input type="date" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} className="rounded-xl" />
          </div>
          <div className="grid gap-2">
            <Label>Forma de Pagamento</Label>
            <Select value={formData.payment_method || ''} onValueChange={(v) => setFormData({...formData, payment_method: v})}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="cartao">Cartão de Crédito</SelectItem>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Observação (opcional)</Label>
            <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="rounded-xl" placeholder="Ex: Pagamento parcela 1/3 viagem..." />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={!formData.amount || !formData.due_date} onClick={handleSubmit} className="rounded-xl w-full">
            Registrar Lançamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
  );
}
