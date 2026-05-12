import { AppLayout } from '@/components/AppLayout';
import { OrcamentoStudioMaster } from '@/components/quotations/OrcamentoStudioMaster';

export default function QuotationsPage() {
  return (
    <AppLayout hideSidebar>
      {/* Container Full Height para o Studio */}
      <div className="h-screen pt-16">
        <OrcamentoStudioMaster />
      </div>
    </AppLayout>
  );
}
