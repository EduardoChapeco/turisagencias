import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency } from '@/utils/formatters';
import { CheckCircle2, DollarSign, Download, Filter, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function CommissionsPanel() {
  const { organization } = useAuthStore();
  const { toast } = useToast();
  const [period, setPeriod] = useState<string>('current');

  const { data: entries, isLoading } = useQuery({
    queryKey: ['admin-commissions', organization?.id, period],
    queryFn: async () => {
      // In a real scenario, this matches the reality_sync schema
      // For now we fetch using `any` to bypass local strict types that don't have the table yet
      const db = supabase as any;
      const { data, error } = await db
        .from('agent_commission_entries')
        .select(`
          *,
          profiles:agent_id(full_name)
        `)
        .eq('org_id', organization?.id)
        .order('created_at', { ascending: false });

      if (error && error.code !== '42P01') { // Ignore relation doesn't exist while migration is pending
        toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      }
      return data || [];
    },
    enabled: !!organization?.id,
  });

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Comissões da Agência</h1>
            <p className="text-muted-foreground">Gestão de repasses, overs e metas dos agentes.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-vj-border">
              <Download className="mr-2 h-4 w-4" /> Exportar Planilha
            </Button>
            <Button className="bg-vj-green text-white hover:bg-vj-green/90">
              <CheckCircle2 className="mr-2 h-4 w-4" /> Fechar Período
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bento-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Venda Bruta Mensal</CardTitle>
              <DollarSign className="h-4 w-4 text-vj-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(0)}</div>
              <p className="text-xs text-muted-foreground">Processado no período</p>
            </CardContent>
          </Card>
          
          <Card className="bento-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Over Líquido Retido</CardTitle>
              <DollarSign className="h-4 w-4 text-vj-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(0)}</div>
              <p className="text-xs text-muted-foreground">Lucro exclusivo da agência</p>
            </CardContent>
          </Card>

          <Card className="bento-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">A Pagar (Agentes)</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(0)}</div>
              <p className="text-xs text-muted-foreground">Repasses pendentes de conferência</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bento-card">
          <CardHeader>
            <CardTitle>Extrato de Operações</CardTitle>
            <CardDescription>Auditoria canônica de todos os cálculos de comissão de agentes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Input placeholder="Buscar por cliente ou localizador..." className="max-w-sm border-vj-border" />
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[180px] border-vj-border">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Maio 2026</SelectItem>
                  <SelectItem value="last">Abril 2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="rounded-md border border-vj-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agente</TableHead>
                    <TableHead>Operadora / Loc</TableHead>
                    <TableHead className="text-right">Bruto (S/ Taxas)</TableHead>
                    <TableHead className="text-right">Over</TableHead>
                    <TableHead className="text-right">Comissão Base</TableHead>
                    <TableHead className="text-right">Comissão Over</TableHead>
                    <TableHead className="text-right font-bold">Total a Pagar</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8">Carregando dados financeiros...</TableCell></TableRow>
                  ) : entries?.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma entrada processada neste período. (Aguardando migração SQL)</TableCell></TableRow>
                  ) : (
                    entries?.map((entry: any) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.profiles?.full_name}</TableCell>
                        <TableCell>{entry.operator_name} <br/><span className="text-xs text-muted-foreground">{entry.booking_locator}</span></TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.commissionable_base)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.net_over)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{formatCurrency(entry.base_commission_amount)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{formatCurrency(entry.over_commission_amount)}</TableCell>
                        <TableCell className="text-right font-bold text-vj-green">{formatCurrency(entry.final_commission)}</TableCell>
                        <TableCell><Badge variant="outline" className="border-orange-200 text-orange-600 bg-orange-50">{entry.status}</Badge></TableCell>
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
