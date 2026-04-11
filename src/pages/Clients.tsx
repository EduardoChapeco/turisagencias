import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useClients, useDeleteClient } from '@/hooks/useClients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState, PageSkeleton } from '@/components/ui/EmptyState';
import { ClientEditSheet } from '@/components/ClientEditSheet';
import { Plus, Search, User, Mail, Phone, Trash2, Shield } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { data: clients, isLoading } = useClients(search || undefined);
  const deleteClient = useDeleteClient();

  const openNew = () => { setEditId(null); setSheetOpen(true); };
  const openEdit = (id: string) => { setEditId(id); setSheetOpen(true); };

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Clientes"
          description="Gerencie sua base de clientes no CRM"
          icon={User}
          badge={
            <StatusBadge variant="neutral" size="sm">
              {clients?.length ?? 0} clientes
            </StatusBadge>
          }
          actions={
            <Button onClick={openNew}>
              <Plus className="mr-2 h-4 w-4" /> Novo Cliente
            </Button>
          }
        />

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cb-muted" />
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-cb-border bg-cb-s1"
          />
        </div>

        {isLoading ? (
          <PageSkeleton />
        ) : !clients?.length ? (
          <EmptyState
            icon={User}
            title="Nenhum cliente encontrado"
            description="Comece cadastrando seu primeiro cliente no CRM."
            action={<Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Cadastrar Cliente</Button>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <div
                key={client.id}
                className="group relative rounded-2xl border border-cb-border bg-cb-s0 hover:border-cb-accent/30 hover:shadow-lg transition-all cursor-pointer p-4 flex flex-col gap-3"
                onClick={() => navigate(`/clients/${client.id}`)}
              >
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 shrink-0 rounded-full bg-cb-accent/10 border border-cb-accent/20 overflow-hidden flex items-center justify-center">
                    {(client as any).photo_url ? (
                      <img src={(client as any).photo_url} alt={client.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-cb-accent font-bold text-lg">{client.name[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-cb-text truncate">{client.name}</p>
                    {client.email && (
                      <p className="text-xs text-cb-muted flex items-center gap-1 truncate">
                        <Mail className="h-3 w-3 shrink-0" /> {client.email}
                      </p>
                    )}
                    {client.phone && (
                      <p className="text-xs text-cb-muted flex items-center gap-1">
                        <Phone className="h-3 w-3 shrink-0" /> {client.phone}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(client.id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-red-500">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Todos os dados serão removidos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-cb-danger text-white hover:bg-cb-danger/90"
                            onClick={() => deleteClient.mutate(client.id)}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {/* Tags */}
                {client.tags && client.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {client.tags.slice(0, 4).map((tag) => (
                      <Badge key={tag} className="text-xs bg-cb-accent/10 text-cb-accent border-cb-accent/20 border">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Portal badge */}
                {client.portal_access_enabled && (
                  <div className="flex items-center gap-1 text-xs text-cb-success">
                    <Shield className="h-3 w-3" /> Portal ativo
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ClientEditSheet
        id={editId}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSuccess={(id) => { setSheetOpen(false); navigate(`/clients/${id}`); }}
      />
    </AppLayout>
  );
}
