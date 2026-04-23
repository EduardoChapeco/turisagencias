import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SheetPage } from '@/components/ui/SheetPage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Building2, Search, MoreVertical, Edit2, Trash2, Phone, Mail, FileText } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier, Supplier } from '@/hooks/useFinance';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PageSkeleton } from '@/components/ui/EmptyState';

const SHEET_SECTIONS = [
  { id: 'dados', label: 'Dados do Fornecedor', icon: Building2 },
  { id: 'contato', label: 'Contato', icon: Phone },
  { id: 'notas', label: 'Notas', icon: FileText },
];

const CATEGORY_OPTIONS = [
  'Operadora', 'Hotel', 'Companhia Aérea', 'Seguro de Viagem',
  'Transfer / Transporte', 'Cruzeiro', 'Guia Local', 'Restaurante', 'Outro',
];

export default function Suppliers() {
  const { profile } = useAuthStore();
  const { data: suppliers, isLoading } = useSuppliers(profile?.org_id);
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();

  const [search, setSearch] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '' as string,
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
  });

  const update = (field: string, value: string) =>
    setFormData(p => ({ ...p, [field]: value }));

  const handleOpenNew = () => {
    setEditingSupplier(null);
    setFormData({ name: '', category: '', contact_name: '', contact_email: '', contact_phone: '', notes: '' });
    setIsSheetOpen(true);
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
    setIsSheetOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) return;
    if (editingSupplier) {
      await updateSupplier.mutateAsync({ id: editingSupplier.id, ...formData } as Record<string, any>);
    } else {
      await createSupplier.mutateAsync({ org_id: profile!.org_id!, ...formData } as Record<string, any>);
    }
    setIsSheetOpen(false);
  };

  const isPending = createSupplier.isPending || updateSupplier.isPending;

  const filtered = suppliers?.filter(s => s.name.toLowerCase().includes(search.toLowerCase())) || [];

  if (isLoading) return <AppLayout><PageSkeleton /></AppLayout>;

  return (
    <>
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
      </AppLayout>

      <SheetPage
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title={editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
        subtitle="Cadastro de operadora, hotel ou parceiro comercial"
        icon={Building2}
        sections={SHEET_SECTIONS}
        defaultSection="dados"
        footer={
          <div className="flex items-center gap-3 w-full justify-end">
            <Button variant="ghost" onClick={() => setIsSheetOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || isPending}
              className="rounded-full px-8 bg-vj-green hover:bg-vj-green/90"
            >
              {isPending ? 'Salvando...' : editingSupplier ? 'Salvar Alterações' : 'Criar Fornecedor'}
            </Button>
          </div>
        }
      >
        {(activeSection) => (
          <>
            {activeSection === 'dados' && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="font-semibold">Nome do Fornecedor *</Label>
                  <Input
                    value={formData.name}
                    onChange={e => update('name', e.target.value)}
                    placeholder="Ex: Operadora Azul Viagens"
                    className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold">Categoria</Label>
                  <Select value={formData.category || '_none'} onValueChange={v => update('category', v === '_none' ? '' : v)}>
                    <SelectTrigger className="h-12 rounded-xl bg-zinc-50 border-zinc-200">
                      <SelectValue placeholder="Selecione uma categoria..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none" className="italic text-zinc-400">Sem categoria</SelectItem>
                      {CATEGORY_OPTIONS.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {activeSection === 'contato' && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="font-semibold">Nome do Contato</Label>
                  <Input
                    value={formData.contact_name}
                    onChange={e => update('contact_name', e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold flex items-center gap-2"><Mail size={14} /> E-mail do Contato</Label>
                  <Input
                    type="email"
                    value={formData.contact_email}
                    onChange={e => update('contact_email', e.target.value)}
                    placeholder="contato@fornecedor.com.br"
                    className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold flex items-center gap-2"><Phone size={14} /> Telefone / WhatsApp</Label>
                  <Input
                    value={formData.contact_phone}
                    onChange={e => update('contact_phone', e.target.value)}
                    placeholder="+55 (49) 99999-9999"
                    className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                  />
                </div>
              </div>
            )}

            {activeSection === 'notas' && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="font-semibold">Notas Internas</Label>
                  <p className="text-xs text-zinc-500">Observações confidenciais sobre o fornecedor, comissões, acordos, etc.</p>
                  <Textarea
                    value={formData.notes}
                    onChange={e => update('notes', e.target.value)}
                    rows={8}
                    placeholder="Ex: Comissão negociada de 12%, contato preferencial via WhatsApp..."
                    className="rounded-xl resize-none bg-zinc-50 border-zinc-200"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </SheetPage>
    </>
  );
}
