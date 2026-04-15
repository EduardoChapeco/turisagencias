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
    type: 'operator' as Supplier['type'],
    contact_info: '',
    bank_details: '',
    default_commission_rate: 0,
  });

  const handleOpenNew = () => {
    setEditingSupplier(null);
    setFormData({ name: '', type: 'operator', contact_info: '', bank_details: '', default_commission_rate: 0 });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name,
      type: sup.type,
      contact_info: sup.contact_info || '',
      bank_details: sup.bank_details || '',
      default_commission_rate: sup.default_commission_rate,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) return;
    if (editingSupplier) {
      await updateSupplier.mutateAsync({ id: editingSupplier.id, ...formData });
    } else {
      await createSupplier.mutateAsync({ org_id: profile!.org_id!, ...formData });
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

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border shadow-sm flex-1 flex flex-col min-h-0">
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
                      <td className="px-4 py-3 capitalize">{sup.type === 'insurance' ? 'Seguro' : sup.type}</td>
                      <td className="px-4 py-3">{sup.default_commission_rate}%</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{sup.contact_info || '-'}</td>
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
              <Select value={formData.type} onValueChange={(v: any) => setFormData({...formData, type: v})}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="operator">Operadora Turística</SelectItem>
                  <SelectItem value="hotel">Hotel / Acomodação</SelectItem>
                  <SelectItem value="airline">Cia Aérea</SelectItem>
                  <SelectItem value="insurance">Seguro Viagem</SelectItem>
                  <SelectItem value="other">Outros Locais</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Comissão Oculta (Padrão %)</Label>
              <Input type="number" min="0" max="100" value={formData.default_commission_rate} onChange={e => setFormData({...formData, default_commission_rate: Number(e.target.value)})} className="rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label>Infos de Contato</Label>
              <Input value={formData.contact_info} placeholder="Email, telefone de reservas..." onChange={e => setFormData({...formData, contact_info: e.target.value})} className="rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label>Dados Bancários (Confidencial)</Label>
              <Input value={formData.bank_details} placeholder="PIX ou Chave Bancária" onChange={e => setFormData({...formData, bank_details: e.target.value})} className="rounded-xl" />
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
