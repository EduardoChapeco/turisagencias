import { FileText, Plane, TicketCheck, Users } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';

export default function Dashboard() {
  const { organization, profile } = useAuthStore();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">
            Olá, {profile?.first_name || 'Agente'}!
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo ao painel da {organization?.name || 'sua agência'}.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Viagens Ativas" value="0" subtitle="Em andamento" icon={<Plane className="h-4 w-4 text-muted-foreground" />} />
          <StatCard title="Clientes" value="0" subtitle="Cadastrados" icon={<Users className="h-4 w-4 text-muted-foreground" />} />
          <StatCard title="Cotações" value="0" subtitle="Pendentes" icon={<FileText className="h-4 w-4 text-muted-foreground" />} />
          <StatCard title="Tickets" value="0" subtitle="Abertos" icon={<TicketCheck className="h-4 w-4 text-muted-foreground" />} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Nenhuma atividade registrada ainda. Comece cadastrando seus primeiros clientes e viagens.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function StatCard({ title, value, subtitle, icon }: { title: string; value: string; subtitle: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="font-heading text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
