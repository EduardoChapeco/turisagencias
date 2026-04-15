import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Wallet, Search, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useTransactions } from '@/hooks/useFinance';
import { PageSkeleton } from '@/components/ui/EmptyState';

export default function Transactions() {
  const { profile } = useAuthStore();
  const [filterType, setFilterType] = useState<'receivable' | 'payable' | undefined>();
  const { data: transactions, isLoading } = useTransactions(profile?.org_id, { type: filterType });

  if (isLoading) return <AppLayout><PageSkeleton /></AppLayout>;

  const totalReceivables = transactions?.filter(t => t.type === 'receivable' && t.status !== 'canceled').reduce((acc, t) => acc + t.amount, 0) || 0;
  const totalPayables = transactions?.filter(t => t.type === 'payable' && t.status !== 'canceled').reduce((acc, t) => acc + t.amount, 0) || 0;

  return (
    <AppLayout fullHeight>
      <div className="flex flex-col h-full gap-4">
        <PageHeader 
          title="Financeiro" 
          description="Controle de recebimentos de clientes e pagamentos a fornecedores."
          icon={Wallet}
        />

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border shadow-sm">
             <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-green-100 dark:bg-green-900/40 text-green-600 rounded-xl">
                 <TrendingUp size={18} />
               </div>
               <p className="font-semibold text-sm text-muted-foreground">A Receber / Recebidos</p>
             </div>
             <p className="text-2xl font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReceivables)}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border shadow-sm">
             <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-red-100 dark:bg-red-900/40 text-red-600 rounded-xl">
                 <TrendingDown size={18} />
               </div>
               <p className="font-semibold text-sm text-muted-foreground">A Pagar / Pagos</p>
             </div>
             <p className="text-2xl font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPayables)}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border shadow-sm">
             <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-xl">
                 <RefreshCw size={18} />
               </div>
               <p className="font-semibold text-sm text-muted-foreground">Lucro Operacional (Previsão)</p>
             </div>
             <p className="text-2xl font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReceivables - totalPayables)}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border shadow-sm flex-1 flex flex-col min-h-0">
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
                         {t.type === 'receivable' ? t.clients?.name || '-' : t.suppliers?.name || t.notes || '-'}
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
  );
}
