import { AppLayout } from '@/components/AppLayout';
import { FichaClienteMaster } from '@/components/crm/FichaClienteMaster';

export default function ClientsPage() {
  return (
    <AppLayout hideSidebar>
      {/* Container Full Height para a Ficha */}
      <div className="h-screen pt-16">
        <FichaClienteMaster />
      </div>
    </AppLayout>
  );
}
