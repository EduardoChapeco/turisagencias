import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileSignature, Plus, Search, Edit2, Trash2, FileText } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useContractTemplates, useCreateContractTemplate, useUpdateContractTemplate, useDeleteContractTemplate, ContractTemplate } from '@/hooks/useContracts';
import { PageSkeleton } from '@/components/ui/EmptyState';
import { SheetPage } from '@/components/ui/SheetPage';

const SHEET_SECTIONS = [
 { id: 'dados', label: 'Identificação', icon: FileSignature },
 { id: 'conteudo', label: 'Corpo do Contrato', icon: FileText },
];

export default function ContractTemplates() {
 const { profile } = useAuthStore();
 const { data: templates, isLoading } = useContractTemplates(profile?.org_id);
 const createTemplate = useCreateContractTemplate();
 const updateTemplate = useUpdateContractTemplate();
 const deleteTemplate = useDeleteContractTemplate();

 const [search, setSearch] = useState('');
 const [isSheetOpen, setIsSheetOpen] = useState(false);
 const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null);

 const [formData, setFormData] = useState({
 name: '',
 content_html: '',
 });

 const handleOpenNew = () => {
 setEditingTemplate(null);
 setFormData({
 name: '',
 content_html:
 'Este é um contrato firmado entre {{AGENCY_NAME}} e {{CLIENT_NAME}} para a prestação de serviços turísticos no dia {{TRIP_DATES}}...',
 });
 setIsSheetOpen(true);
 };

 const handleOpenEdit = (tpl: ContractTemplate) => {
 setEditingTemplate(tpl);
 setFormData({ name: tpl.name, content_html: tpl.content_html });
 setIsSheetOpen(true);
 };

 const handleSubmit = async () => {
 if (!formData.name || !formData.content_html) return;
 if (editingTemplate) {
 await updateTemplate.mutateAsync({ id: editingTemplate.id, ...formData });
 } else {
 await createTemplate.mutateAsync({ org_id: profile!.org_id!, ...formData });
 }
 setIsSheetOpen(false);
 };

 const isPending = createTemplate.isPending || updateTemplate.isPending;
 const filtered = templates?.filter(t => t.name.toLowerCase().includes(search.toLowerCase())) || [];

 if (isLoading) return <AppLayout><PageSkeleton /></AppLayout>;

 return (
 <>
 <AppLayout fullHeight>
 <div className="flex flex-col h-full gap-4">
 <PageHeader
 title="Gestão de Contratos Jurídicos"
 description="Modelos dinâmicos de contrato assinados digitalmente pelos passageiros."
 icon={FileSignature}
 actions={
 <Button onClick={handleOpenNew} className="rounded-full gap-2 px-6">
 <Plus size={16} /> Novo Modelo
 </Button>
 }
 />

 <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border flex-1 flex flex-col min-h-0">
 <div className="relative mb-6 max-w-sm">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
 <Input
 placeholder="Buscar modelos..."
 value={search}
 onChange={e => setSearch(e.target.value)}
 className="pl-10 rounded-xl"
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto pb-6 flex-1">
 {filtered.length === 0 ? (
 <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
 <FileSignature size={40} className="opacity-30" />
 <p className="text-sm">Nenhum contrato encontrado. Crie o primeiro modelo acima.</p>
 </div>
 ) : (
 filtered.map(tpl => (
 <div
 key={tpl.id}
 className="border rounded-2xl p-5 hover:border-vj-green/50 transition-colors flex flex-col justify-between h-[200px]"
 >
 <div>
 <h3 className="font-bold text-lg mb-2 text-vj-txt flex items-center gap-2">
 <FileSignature size={18} className="text-vj-green" /> {tpl.name}
 </h3>
 <p className="text-xs text-muted-foreground line-clamp-4">{tpl.content_html}</p>
 </div>
 <div className="flex gap-2 mt-4">
 <Button
 variant="outline"
 size="sm"
 className="flex-1 rounded-xl gap-2"
 onClick={() => handleOpenEdit(tpl)}
 >
 <Edit2 size={14} /> Editar
 </Button>
 <Button
 variant="ghost"
 size="icon"
 className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
 onClick={() => {
 if (confirm('Excluir este contrato permanentemente?'))
 deleteTemplate.mutateAsync(tpl.id);
 }}
 >
 <Trash2 size={14} />
 </Button>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 </AppLayout>

 <SheetPage
 open={isSheetOpen}
 onClose={() => setIsSheetOpen(false)}
 title={editingTemplate ? 'Editar Modelo de Contrato' : 'Novo Modelo de Contrato'}
 subtitle="Configure o texto jurídico e as variáveis dinâmicas"
 icon={FileSignature}
 sections={SHEET_SECTIONS}
 defaultSection="dados"
 footer={
 <div className="flex items-center gap-3 w-full justify-end">
 <Button variant="ghost" onClick={() => setIsSheetOpen(false)}>Cancelar</Button>
 <Button
 onClick={handleSubmit}
 disabled={!formData.name || !formData.content_html || isPending}
 className="rounded-full px-8 bg-vj-green hover:bg-vj-green/90"
 >
 {isPending ? 'Salvando...' : editingTemplate ? 'Salvar Alterações' : 'Criar Modelo'}
 </Button>
 </div>
 }
 >
 {(activeSection) => (
 <>
 {activeSection === 'dados' && (
 <div className="space-y-5">
 <div className="space-y-1.5">
 <Label className="font-semibold">Nome do Documento *</Label>
 <p className="text-xs text-zinc-500">Ex: Contrato MSC Cruzeiros, Contrato Viagem Europa...</p>
 <Input
 value={formData.name}
 onChange={e => setFormData({ ...formData, name: e.target.value })}
 placeholder="Ex: Contrato Padrão de Viagem Internacional"
 className="h-12 rounded-xl bg-zinc-50 border-zinc-200 font-semibold text-base"
 autoFocus
 />
 </div>

 <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
 <p className="text-xs font-bold text-blue-700 mb-2">📋 Variáveis Dinâmicas (Shortcodes)</p>
 <div className="flex flex-wrap gap-2">
 {['{{CLIENT_NAME}}', '{{TRIP_DATES}}', '{{AGENCY_NAME}}', '{{PASSPORT_OP}}'].map(v => (
 <span key={v} className="font-mono text-xs bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded-lg">
 {v}
 </span>
 ))}
 </div>
 <p className="text-xs text-blue-600 mt-2">Use essas macros no corpo do contrato para autopreenchimento.</p>
 </div>
 </div>
 )}

 {activeSection === 'conteudo' && (
 <div className="space-y-3">
 <div className="space-y-1.5">
 <Label className="font-semibold">Corpo Jurídico do Contrato *</Label>
 <p className="text-xs text-zinc-500">Texto completo do contrato. Pode usar HTML ou texto simples.</p>
 <Textarea
 value={formData.content_html}
 onChange={e => setFormData({ ...formData, content_html: e.target.value })}
 className="rounded-xl min-h-[420px] font-mono text-xs leading-relaxed resize-none bg-zinc-50 border-zinc-200"
 placeholder="Este é um contrato firmado entre {{AGENCY_NAME}} e {{CLIENT_NAME}}..."
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
