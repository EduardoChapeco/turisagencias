import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileSignature, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useContractTemplates, useCreateContractTemplate, useUpdateContractTemplate, useDeleteContractTemplate, ContractTemplate } from '@/hooks/useContracts';
import { PageSkeleton } from '@/components/ui/EmptyState';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function ContractTemplates() {
  const { profile } = useAuthStore();
  const { data: templates, isLoading } = useContractTemplates(profile?.org_id);
  const createTemplate = useCreateContractTemplate();
  const updateTemplate = useUpdateContractTemplate();
  const deleteTemplate = useDeleteContractTemplate();

  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    content_html: '',
  });

  const handleOpenNew = () => {
    setEditingTemplate(null);
    setFormData({ name: '', content_html: 'Este é um contrato firmado entre {{AGENCY_NAME}} e {{CLIENT_NAME}} para a prestação de serviços turísticos no dia {{TRIP_DATES}}...' });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (tpl: ContractTemplate) => {
    setEditingTemplate(tpl);
    setFormData({ name: tpl.name, content_html: tpl.content_html });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.content_html) return;
    if (editingTemplate) {
      await updateTemplate.mutateAsync({ id: editingTemplate.id, ...formData });
    } else {
      await createTemplate.mutateAsync({ org_id: profile!.org_id!, ...formData });
    }
    setIsDialogOpen(false);
  };

  const filtered = templates?.filter(t => t.name.toLowerCase().includes(search.toLowerCase())) || [];

  if (isLoading) return <AppLayout><PageSkeleton /></AppLayout>;

  return (
    <AppLayout fullHeight>
      <div className="flex flex-col h-full gap-4">
        <PageHeader 
          title="Gestão de Contratos Jurídicos" 
          description="Modelos dinâmicos de contrato que serão assinados digitalmente pelos passageiros."
          icon={FileSignature}
          action={
            <Button onClick={handleOpenNew} className="rounded-full gap-2 px-6">
              <Plus size={16}/> Novo Modelo
            </Button>
          }
        />

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border shadow-sm flex-1 flex flex-col min-h-0">
          <div className="relative mb-6 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Buscar modelos..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto pb-6">
             {filtered.length === 0 ? (
                <div colSpan={3} className="text-center text-muted-foreground mt-10">Nenhum contrato encontrado.</div>
             ) : (
                filtered.map(tpl => (
                   <div key={tpl.id} className="border rounded-2xl p-5 hover:border-vj-green/50 transition-colors flex flex-col justify-between h-[200px] shadow-sm">
                      <div>
                        <h3 className="font-bold text-lg mb-2 text-vj-txt flex items-center gap-2">
                           <FileSignature size={18} className="text-vj-green"/> {tpl.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-4">
                           {tpl.content_html}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-4">
                         <Button variant="outline" size="sm" className="flex-1 rounded-xl gap-2" onClick={() => handleOpenEdit(tpl)}>
                            <Edit2 size={14}/> Editar
                         </Button>
                         <Button variant="ghost" size="icon" className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => { if(confirm('Excluir este contrato permanentemente?')) deleteTemplate.mutateAsync(tpl.id); }}>
                            <Trash2 size={14}/>
                         </Button>
                      </div>
                   </div>
                ))
             )}
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Editar Modelo' : 'Novo Modelo de Contrato'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Nome do Documento (Ex: Cruzeiros MSC)</label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="rounded-xl font-bold text-lg" />
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800">
               <p className="text-xs text-blue-800 dark:text-blue-300">
                 <strong>Atalhos Dinâmicos Mágicos (Shortcodes):</strong> Utilize estas macros em caixa alta dentro do texto para autopreencher os dados reais do viajante.<br/>
                 `{`{{CLIENT_NAME}}`}` • `{`{{TRIP_DATES}}`}` • `{`{{AGENCY_NAME}}`}` • `{`{{PASSPORT_OP}}`}`
               </p>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold">Termos Jurídicos do Contrato (Corpo HTML/Texto)</label>
              <Textarea 
                value={formData.content_html} 
                onChange={e => setFormData({...formData, content_html: e.target.value})} 
                className="rounded-xl min-h-[300px] font-mono text-xs leading-relaxed" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button disabled={!formData.name || !formData.content_html} onClick={handleSubmit} className="rounded-xl w-full text-base">Salvar Alterações de Contrato</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
