import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useHotels } from '@/hooks/useHotels';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Building2, Plus } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { HotelEdit } from './HotelEdit';

export default function Hotels() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [editSheet, setEditSheet] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const { data: hotels, isLoading } = useHotels(search || undefined);

  return (
    <AppLayout>
      <PageHeader
        title="Banco de Hotéis"
        description="Catálogo curado de hotéis da agência."
        icon={Building2}
        badge={
          <StatusBadge variant="neutral" size="sm">
            {hotels?.length ?? 0}
          </StatusBadge>
        }
        actions={
          <Button onClick={() => setEditSheet({ open: true, id: null })}>
            <Plus className="mr-2 h-4 w-4" /> Novo hotel
          </Button>
        }
      />

      <div className="surface-card p-0 rounded-cb-lg border-vj-border">
        <DataTable
          columns={[
            {
              key: 'name',
              header: 'Nome do Hotel',
              render: (row) => (
                <div>
                  <p className="font-semibold">{row.name}</p>
                  <p className="text-xs text-vj-txt3">{row.category ? `${row.category} Estrelas` : 'Sem categoria'}</p>
                </div>
              ),
            },
            {
              key: 'location',
              header: 'Localização',
              render: (row) => (
                <span className="text-sm">
                  {[row.city, row.state, row.country].filter(Boolean).join(', ')}
                </span>
              ),
            },
            {
              key: 'tags',
              header: 'Tags',
              render: (row) => (
                <div className="flex flex-wrap gap-1">
                  {row.tags?.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-vj-bg text-vj-txt border-vj-border border">
                      {tag}
                    </span>
                  ))}
                  {(row.tags?.length ?? 0) > 3 && (
                    <span className="text-[10px] text-vj-txt3">+{row.tags!.length - 3}</span>
                  )}
                </div>
              ),
            },
          ]}
          data={hotels ?? []}
          isLoading={isLoading}
          emptyIcon={Building2}
          emptyTitle="Nenhum hotel cadastrado"
          emptyDescription="Adicione hotéis ao banco para facilitar as cotações."
          emptyAction={
            <Button size="sm" onClick={() => setEditSheet({ open: true, id: null })}>
              <Plus className="mr-2 h-4 w-4" /> Cadastrar hotel
            </Button>
          }
          searchPlaceholder="Buscar por nome ou cidade..."
          searchValue={search}
          onSearch={setSearch}
          onRowClick={(row) => navigate(`/hotels/${row.id}`)}
        />
      </div>

      <HotelEdit
        open={editSheet.open}
        id={editSheet.id}
        onClose={() => setEditSheet({ open: false, id: null })}
        onSuccess={(id) => navigate(`/hotels/${id}`)}
      />
    </AppLayout>
  );
}
