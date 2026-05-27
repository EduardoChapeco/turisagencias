import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency } from '@/utils/formatters';
import { Target, TrendingUp, Wallet } from 'lucide-react';

export default function MyCommissions() {
  const { user } = useAuthStore();

  const { data: entries, isLoading } = useQuery({
    queryKey: ['my-commissions', user?.id],
    queryFn: async () => {
      const db = supabase as any;
      const { data } = await db
        .from('agent_commission_entries')
        .select('*')
        .eq('agent_id', user?.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Meta fictícia base para a visualização
  const goal = 100000;
  const currentSales = 0; // Seria o sum de gross_sales do usuário no mês
  const progressPercent = Math.min((currentSales / goal) * 100, 100);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minhas Comissões</h1>
          <p className="text-muted-foreground">Acompanhe suas vendas, repasses e metas deste mês.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bento-card md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Target className="h-4 w-4" /> Meta de Vendas Mensal (Mínimo p/ % bônus)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end mb-2">
                <div className="text-2xl font-bold">{formatCurrency(currentSales)}</div>
                <div className="text-sm text-muted-foreground">Alvo: {formatCurrency(goal)}</div>
              </div>
              <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-vj-green rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Você atingiu {progressPercent}% da sua meta. Faltam {formatCurrency(goal - currentSales)} para liberar a taxa extra.</p>
            </CardContent>
          </Card>
          
          <Card className="bento-card border-vj-green/20 bg-vj-green/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-vj-green">
                <Wallet className="h-4 w-4" /> A Receber Estimado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-vj-green">{formatCurrency(0)}</div>
              <p className="text-xs text-vj-green/70 mt-1">Líquido de taxas. Fechamento dia 05.</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bento-card">
          <CardHeader>
            <CardTitle>Extrato de Vendas</CardTitle>
            <CardDescription>Overs da operadora e margens de agência são ocultos de acordo com a política de sigilo.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-vj-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Operadora</TableHead>
                    <TableHead className="text-right">Venda Bruta</TableHead>
                    <TableHead className="text-right text-vj-green font-bold">Sua Comissão</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8">Carregando seu extrato...</TableCell></TableRow>
                  ) : entries?.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma venda registrada ainda.</TableCell></TableRow>
                  ) : (
                    entries?.map((entry: any) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-muted-foreground">{new Date(entry.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{entry.client_name}</TableCell>
                        <TableCell>{entry.operator_name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.gross_sales)}</TableCell>
                        <TableCell className="text-right font-bold text-vj-green">{formatCurrency(entry.final_commission)}</TableCell>
                        <TableCell>{entry.status}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
