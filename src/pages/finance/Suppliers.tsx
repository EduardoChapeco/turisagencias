import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Building2, Search, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier, Supplier } from '@/hooks/useFinance';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PageSkeleton } from '@/components/ui/EmptyState';

export default function Suppliers() {
  const { profile } = useAuthStore();
  const { data: suppliers, isLoading } = useSuppliers(profile?.org_id);
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();

  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '' as string,
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
  });

  const handleOpenNew = () => {
    setEditingSupplier(null);
    setFormData({ name: '', category: '', contact_name: '', contact_email: '', contact_phone: '', notes: '' });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name,
      category: sup.category || '',
      contact_name: sup.contact_name || '',
      contact_email: sup.contact_email || '',
      contact_phone: sup.contact_phone || '',
      notes: sup.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) return;
    if (editingSupplier) {
      await updateSupplier.mutateAsync({ id: editingSupplier.id, ...formData } as Record<string, any>);
    } else {
      await createSupplier.mutateAsync({ org_id: profile!.org_id!, ...formData } as Record<string, any>);
    }
    setIsDialogOpen(false);
  };

  const filtered = suppliers?.filter(s => s.name.toLowerCase().includes(search.toLowerCase())) || [];

  if (isLoading) return <AppLayout><PageSkeleton /></AppLayout>;

  return (
    <AppLayout fullHeight>
      <div className="flex flex-col h-full gap-4">
        <PageHeader 
          title="Fornecedores" 
          description="Gestão de operadoras, hotéis e parceiros comerciais."
          icon={Building2}
          actions={
            <Button onClick={handleOpenNew} className="rounded-full gap-2 px-6">
              <Plus size={16}/> Novo Fornecedor
            </Button>
          }
        />

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border  flex-1 flex flex-col min-h-0">
          <div className="relative mb-6 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Buscar por nome..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>

          <div className="flex-1 overflow-auto rounded-xl border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted sticky top-0 z-10 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome do Fornecedor</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Comissão Padrão</th>
                  <th className="px-4 py-3 font-medium">Contato</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Nenhum fornecedor encontrado.
                    </td>
                  </tr>
                ) : (
                  filtered.map(sup => (
                    <tr key={sup.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium">{sup.name}</td>
                      <td className="px-4 py-3 capitalize">{sup.category || '-'}</td>
                      <td className="px-4 py-3">-</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{sup.contact_email || sup.contact_phone || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreVertical size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem onClick={() => handleOpenEdit(sup)} className="gap-2 cursor-pointer">
                              <Edit2 size={14}/> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => { if(confirm('Tem certeza?')) deleteSupplier.mutateAsync(sup.id); }} 
                              className="gap-2 cursor-pointer text-red-600 focus:text-red-700"
                            >
                              <Trash2 size={14}/> Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle>{editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nome Completo</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label>Categoria</Label>
              <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Ex: Operadora, Hotel, Seguro..." className="rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label>Nome do Contato</Label>
              <Input value={formData.contact_name} onChange={e => setFormData({...formData, contact_name: e.target.value})} className="rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label>Email do Contato</Label>
              <Input value={formData.contact_email} onChange={e => setFormData({...formData, contact_email: e.target.value})} className="rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label>Telefone do Contato</Label>
              <Input value={formData.contact_phone} onChange={e => setFormData({...formData, contact_phone: e.target.value})} className="rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label>Notas</Label>
              <Input value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Observações sobre o fornecedor..." className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button disabled={!formData.name} onClick={handleSubmit} className="rounded-xl w-full">Salvar Fornecedor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
