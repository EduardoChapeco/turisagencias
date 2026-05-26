import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGroupTrip } from '@/hooks/useGroupTrips';
import { PricingCalculator } from '@/components/group-trips/PricingCalculator';
import { GroupBloqueiosTab } from '@/components/group-trips/GroupBloqueiosTab';
import { GroupClientsKanban } from '@/components/group-trips/GroupClientsKanban';
import { GroupFinancialBoard } from '@/components/group-trips/GroupFinancialBoard';
import { GroupContractGenerator } from '@/components/group-trips/GroupContractGenerator';
import { VoucherPipeline } from '@/components/group-trips/VoucherPipeline';
import { ArrowLeft, Users, Calculator, Plane, FileText, BadgeDollarSign, Ticket, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GroupDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: trip, isLoading } = useGroupTrip(id);
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-vj-blue" />
          <p className="text-sm text-vj-txt2">Carregando detalhes do grupo...</p>
        </div>
      </AppLayout>
    );
  }

  if (!trip) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <h2 className="text-lg font-bold text-vj-txt">Grupo não encontrado</h2>
          <p className="text-sm text-vj-txt2 mb-4">Esta viagem em grupo não existe ou foi removida.</p>
          <Button onClick={() => navigate('/group-trips')}>Voltar para Viagens em Grupo</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/group-trips')}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-black font-heading text-vj-txt">{trip.title}</h1>
          <p className="text-sm text-vj-txt2">{trip.destination} • Partida: {trip.departure_date ? new Date(trip.departure_date).toLocaleDateString('pt-BR') : 'A definir'}</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-white border border-zinc-200 p-1 h-auto mb-6 flex-wrap justify-start">
          <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-zinc-100"><Users size={16} /> Visão Geral</TabsTrigger>
          <TabsTrigger value="bloqueios" className="gap-2 data-[state=active]:bg-vj-blue/10 data-[state=active]:text-vj-blue"><Plane size={16} /> Bloqueio Aéreo</TabsTrigger>
          <TabsTrigger value="pricing" className="gap-2 data-[state=active]:bg-vj-green/10 data-[state=active]:text-vj-green"><Calculator size={16} /> Precificação (Custos)</TabsTrigger>
          <TabsTrigger value="crm" className="gap-2 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700"><Users size={16} /> Clientes (CRM)</TabsTrigger>
          <TabsTrigger value="finance" className="gap-2 data-[state=active]:bg-vj-green/10 data-[state=active]:text-vj-green"><BadgeDollarSign size={16} /> Parcelas</TabsTrigger>
          <TabsTrigger value="contracts" className="gap-2 data-[state=active]:bg-zinc-100"><FileText size={16} /> Contratos Turis</TabsTrigger>
          <TabsTrigger value="vouchers" className="gap-2 data-[state=active]:bg-vj-blue/10 data-[state=active]:text-vj-blue"><Ticket size={16} /> Vouchers & Embarque</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="p-12 text-center border-2 border-dashed border-zinc-200 rounded-xl">
            <h2 className="text-xl font-bold mb-2">Dashboard do Grupo</h2>
            <p className="text-zinc-500 mb-4">Módulo em construção. Acesse as outras abas para continuar a configuração.</p>
          </div>
        </TabsContent>

        <TabsContent value="bloqueios">
          <GroupBloqueiosTab groupTripId={trip.id} />
        </TabsContent>

        <TabsContent value="pricing">
          <PricingCalculator groupTripId={trip.id} />
        </TabsContent>

        <TabsContent value="crm">
          <GroupClientsKanban groupTripId={trip.id} />
        </TabsContent>

        <TabsContent value="finance">
          <GroupFinancialBoard groupTripId={trip.id} />
        </TabsContent>

        <TabsContent value="contracts">
          <GroupContractGenerator groupTripId={trip.id} />
        </TabsContent>

        <TabsContent value="vouchers">
          <VoucherPipeline groupTripId={trip.id} />
        </TabsContent>

      </Tabs>
    </AppLayout>
  );
}
