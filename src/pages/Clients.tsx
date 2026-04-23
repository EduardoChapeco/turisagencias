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
import { ClientQuickView } from '@/components/ClientQuickView';
import { Plus, Search, User, Mail, Phone, Trash2, Shield, Eye, Edit } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const navigate = useNavigate();
  const { data: clients, isLoading } = useClients(search || undefined);
  const deleteClient = useDeleteClient();

  const openNew = () => { setEditId(null); setSheetOpen(true); };
  const openEdit = (id: string) => { setEditId(id); setSheetOpen(true); };
  const openQuickView = (id: string) => { setQuickViewId(id); setQuickViewOpen(true); };

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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vj-txt3" />
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-vj-border bg-vj-bg"
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
          <div className="bento-grid-premium">
            {clients.map((client) => (
              <div
                key={client.id}
                className="premium-card group relative hover:border-vj-green/30 cursor-pointer p-5 flex flex-col gap-4 min-h-[140px]"
                onClick={() => openQuickView(client.id)}
              >
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 shrink-0 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center ">
                    {client.photo_url ? (
                      <img src={client.photo_url} alt={client.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-zinc-400 font-bold text-xl">{client.name[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="font-heading font-extrabold text-lg text-vj-txt truncate">{client.name}</p>
                    {client.email && (
                      <p className="text-xs text-vj-txt3 flex items-center gap-1.5 truncate mt-1">
                        <Mail className="h-3 w-3 shrink-0" /> {client.email}
                      </p>
                    )}
                    {client.phone && (
                      <p className="text-xs text-vj-txt3 flex items-center gap-1.5 mt-0.5">
                        <Phone className="h-3 w-3 shrink-0" /> {client.phone}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons — aparecem no hover */}
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 backdrop-blur-sm rounded-xl p-1" onClick={(e) => e.stopPropagation()}>
                    {/* Quick View */}
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7 hover:bg-white hover:text-vj-green hover: rounded-lg"
                      title="Visualização rápida"
                      onClick={() => openQuickView(client.id)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    {/* Edit */}
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7 hover:bg-white hover: rounded-lg"
                      title="Editar cliente"
                      onClick={() => openEdit(client.id)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    {/* Delete */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-50 hover:text-red-500 rounded-lg">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Todos os dados e documentos serão removidos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 text-white hover:bg-red-600"
                            onClick={() => deleteClient.mutate(client.id)}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="flex-1" />

                <div className="flex items-center justify-between pt-3 border-t border-zinc-100/80">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {client.tags && client.tags.length > 0 ? (
                      <>
                        {client.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} className="text-[10px] font-bold px-2 py-0 bg-vj-green/10 text-vj-green border-transparent hover:bg-vj-green/20 uppercase tracking-wider">
                            {tag}
                          </Badge>
                        ))}
                        {client.tags.length > 3 && (
                          <Badge className="text-[10px] font-bold px-2 py-0 bg-zinc-100 text-zinc-500 border-transparent">
                            +{client.tags.length - 3}
                          </Badge>
                        )}
                      </>
                    ) : (
                      <span className="text-[10px] text-zinc-300 font-medium italic">Sem tags</span>
                    )}
                  </div>

                  {/* Portal badge */}
                  {client.portal_access_enabled && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-black uppercase tracking-wider text-emerald-600  shrink-0">
                      <Shield className="h-3 w-3" /> Vip
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ClientEditSheet
        id={editId}
        open={sheetOpen}
        onClose={() => setEditId(null)}
        onSuccess={(id) => { setEditId(null); setQuickViewId(id); setQuickViewOpen(true); }}
      />

      <ClientQuickView
        clientId={quickViewId}
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        onEdit={(id) => { setQuickViewOpen(false); openEdit(id); }}
      />
    </AppLayout>
  );
}
