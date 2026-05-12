import { useState } from 'react';
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
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { FichaClienteMaster } from '@/components/crm/FichaClienteMaster';
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
  const [masterSheetOpen, setMasterSheetOpen] = useState(false);
  const { data: clients, isLoading } = useClients(search || undefined);
  const deleteClient = useDeleteClient();

  const openNew = () => { setMasterSheetOpen(true); };
  const openEdit = (id: string) => { setEditId(id); setSheetOpen(true); };
  const openQuickView = (id: string) => { setQuickViewId(id); setQuickViewOpen(true); };

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Base de Clientes"
          description="Gerencie clientes, histórico de viagens e relacionamento comercial."
          icon={User}
          actions={
            <div className="flex items-center gap-2 w-full">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vj-txt3" />
                <Input
                  placeholder="Buscar cliente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10 rounded-xl border-vj-border bg-white"
                />
              </div>
              <StatusBadge variant="neutral" size="sm" className="shrink-0">
                {clients?.length ?? 0}
              </StatusBadge>
              <Button onClick={openNew} className="premium-button shrink-0">
                <Plus className="mr-2 h-4 w-4" /> Novo Cliente
              </Button>
            </div>
          }
        />

        {isLoading ? (
          <PageSkeleton />
        ) : !clients?.length ? (
          <EmptyState
            icon={User}
            title="Nenhum cliente encontrado"
            description="Comece cadastrando seu primeiro cliente na base."
            action={<Button onClick={openNew} className="premium-button"><Plus className="mr-2 h-4 w-4" /> Cadastrar Cliente</Button>}
          />
        ) : (
          <div className="bento-grid-premium">
            {clients.map((client) => (
              <div
                key={client.id}
                className="premium-card group relative hover:border-vj-green/40 cursor-pointer p-5 flex flex-col gap-4 min-h-[140px]"
                onClick={() => openQuickView(client.id)}
              >
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center">
                    {client.photo_url ? (
                      <img src={client.photo_url} alt={client.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-zinc-400 font-bold text-lg">{client.name[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="font-heading font-extrabold text-base text-vj-txt truncate">{client.name}</p>
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
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7 hover:bg-vj-green/10 hover:text-vj-green rounded-lg"
                      title="Visualizar"
                      onClick={() => openQuickView(client.id)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7 hover:bg-zinc-100 rounded-lg"
                      title="Editar"
                      onClick={() => openEdit(client.id)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
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
                  {client.portal_access_enabled && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-black uppercase tracking-wider text-emerald-600 shrink-0">
                      <Shield className="h-3 w-3" /> VIP
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Sheet open={masterSheetOpen} onOpenChange={setMasterSheetOpen}>
        <SheetContent side="bottom" className="h-[95vh] p-0 sm:max-w-none w-full rounded-t-3xl overflow-hidden bg-slate-100">
          <FichaClienteMaster />
        </SheetContent>
      </Sheet>

      <ClientEditSheet
        id={editId}
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setEditId(null); }}
        onSuccess={(id) => { setSheetOpen(false); setEditId(null); setQuickViewId(id); setQuickViewOpen(true); }}
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
