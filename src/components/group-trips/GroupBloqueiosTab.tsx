import { useState } from 'react';
import { useSeatBlocks, useCreateSeatBlock, useUpdateSeatBlock, useDeleteSeatBlock } from '@/hooks/useSeatBlocks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SheetPage } from '@/components/ui/SheetPage';
import { Plane, Upload, FileText, Settings, Calendar, Save, Trash2, ShieldAlert } from 'lucide-react';
import { processOcr, SEAT_BLOCK_PROMPT } from '@/lib/ocr';
import { toast } from 'sonner';

interface GroupBloqueiosTabProps {
 groupTripId: string;
}

export function GroupBloqueiosTab({ groupTripId }: GroupBloqueiosTabProps) {
 const { data: seatBlocks, isLoading } = useSeatBlocks(groupTripId);
 const createBlock = useCreateSeatBlock();
 const updateBlock = useUpdateSeatBlock();
 const deleteBlock = useDeleteSeatBlock();

 const [editingId, setEditingId] = useState<string | null>(null);
 const [form, setForm] = useState<any>({});
 const [isExtracting, setIsExtracting] = useState(false);

 const openNew = () => {
 setForm({
 companhia: 'GOL',
 total_assentos: 20,
 assentos_vendidos: 0,
 status: 'rascunho',
 group_trip_id: groupTripId,
 });
 setEditingId('new');
 };

 const openEdit = (id: string) => {
 const block = seatBlocks?.find((b) => b.id === id);
 if (!block) return;
 setForm({ ...block });
 setEditingId(id);
 };

 const handleSave = async () => {
 if (editingId === 'new') {
 await createBlock.mutateAsync(form);
 } else if (editingId) {
 await updateBlock.mutateAsync({ id: editingId, ...form });
 }
 setEditingId(null);
 };

 const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 setIsExtracting(true);
 toast.info('Lendo proposta de bloqueio com IA...');

 try {
 const result = await processOcr<any>({
 files: [file],
 prompt: SEAT_BLOCK_PROMPT,
 });

 if (!result.success || !result.data) {
 throw new Error(result.error || 'Falha ao extrair dados da proposta');
 }

 toast.success('Dados extraídos com sucesso!');
 setForm((prev: any) => ({
 ...prev,
 companhia: result.data.companhia || 'OUTROS',
 codigo_voo: result.data.codigo_voo,
 origem: result.data.origem,
 destino: result.data.destino,
 data_ida: result.data.data_ida,
 data_volta: result.data.data_volta,
 total_assentos: result.data.total_assentos || 20,
 custo_passagem_unit: result.data.custo_passagem_unit,
 prazo_nominacao: result.data.prazo_nominacao,
 prazo_pagamento: result.data.prazo_pagamento,
 localizador_bloco: result.data.localizador_bloco,
 condicoes_bloco: result.data.condicoes_bloco,
 ocr_raw_text: result.rawText,
 }));
 } catch (err: any) {
 toast.error(err.message);
 } finally {
 setIsExtracting(false);
 }
 };

 if (isLoading) return <div>Carregando bloqueios...</div>;

 return (
 <div className="space-y-6">
 <div className="flex justify-between items-center bg-vj-bg p-4 rounded-xl border border-vj-border">
 <div>
 <h2 className="font-heading font-black text-lg text-vj-txt">Bloqueios Aéreos</h2>
 <p className="text-sm text-vj-txt3">Gerencie contratos de assentos com GOL, LATAM e AZUL para este grupo.</p>
 </div>
 <Button onClick={openNew} className="gap-2">
 <Plane size={16} /> Novo Bloqueio
 </Button>
 </div>

 {!seatBlocks?.length ? (
 <div className="text-center py-12 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
 <Plane size={40} className="mx-auto text-zinc-300 mb-3" />
 <p className="text-zinc-500 font-medium">Nenhum bloqueio cadastrado.</p>
 <Button variant="outline" className="mt-4" onClick={openNew}>Adicionar Bloqueio</Button>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {seatBlocks.map((block) => (
 <Card key={block.id} className="p-5 flex flex-col hover:border-vj-green/40 transition-colors">
 <div className="flex justify-between items-start mb-4 border-b border-zinc-100 pb-3">
 <div>
 <span className="text-[10px] font-black uppercase tracking-widest text-vj-blue bg-vj-blue/10 px-2 py-1 rounded-md">
 {block.companhia}
 </span>
 <h3 className="font-bold text-lg mt-1">{block.origem || '---'} ✈️ {block.destino || '---'}</h3>
 <p className="text-xs text-zinc-500">{block.localizador_bloco || 'Sem localizador'}</p>
 </div>
 <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
 block.status === 'confirmado' ? 'bg-vj-green/10 text-vj-green' : 
 block.status === 'cancelado' ? 'bg-red-50 text-red-600' : 'bg-zinc-100 text-zinc-600'
 }`}>
 {block.status.toUpperCase()}
 </div>
 </div>

 <div className="flex-1 space-y-3 text-sm text-zinc-600">
 <div className="flex justify-between">
 <span>Assentos:</span>
 <span className="font-semibold">{block.assentos_vendidos} / {block.total_assentos}</span>
 </div>
 <div className="flex justify-between">
 <span>Prazo Nominação:</span>
 <span className={new Date(block.prazo_nominacao || '') < new Date() ? 'text-red-500 font-bold' : ''}>
 {block.prazo_nominacao ? new Date(block.prazo_nominacao).toLocaleDateString('pt-BR') : '---'}
 </span>
 </div>
 <div className="flex justify-between">
 <span>Custo Unitário:</span>
 <span className="font-semibold text-vj-txt">
 {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(block.custo_passagem_unit || 0)}
 </span>
 </div>
 </div>

 <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-end gap-2">
 <Button variant="outline" size="sm" onClick={() => openEdit(block.id)}>Editar</Button>
 </div>
 </Card>
 ))}
 </div>
 )}

 <SheetPage
 open={!!editingId}
 onClose={() => setEditingId(null)}
 title={editingId === 'new' ? 'Novo Bloqueio' : 'Editar Bloqueio'}
 subtitle="Contrato de assentos com a companhia aérea"
 sections={[
 { id: 'ocr', label: 'IA OCR', icon: FileText },
 { id: 'basic', label: 'Dados do Voo', icon: Plane },
 { id: 'commercial', label: 'Comercial', icon: Settings },
 ]}
 footer={
 <>
 {editingId !== 'new' && (
 <Button variant="ghost" className="text-red-500 mr-auto" onClick={() => {
 if (confirm('Excluir bloqueio?')) {
 deleteBlock.mutate(editingId!);
 setEditingId(null);
 }
 }}>
 Excluir
 </Button>
 )}
 <Button variant="outline" onClick={() => setEditingId(null)}>Cancelar</Button>
 <Button onClick={handleSave} disabled={createBlock.isPending || updateBlock.isPending}>Salvar Bloqueio</Button>
 </>
 }
 >
 {(section) => (
 <div className="space-y-4 max-w-xl">
 {section === 'ocr' && (
 <Card className="p-6 border-dashed border-2 bg-zinc-50 flex flex-col items-center justify-center text-center space-y-3">
 <Upload size={32} className="text-vj-blue" />
 <div>
 <p className="font-semibold text-sm">Extrair dados da proposta com IA</p>
 <p className="text-xs text-zinc-500 mb-4">Faça upload do PDF ou Print da proposta da GOL/LATAM/AZUL.</p>
 </div>
 <Input type="file" accept=".pdf,image/*" onChange={handleOcrUpload} disabled={isExtracting} className="max-w-xs" />
 {isExtracting && <p className="text-xs text-vj-blue font-bold animate-pulse">Lendo documento...</p>}
 </Card>
 )}

 {section === 'basic' && (
 <>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <Label>Companhia Aérea</Label>
 <Select value={form.companhia} onValueChange={v => setForm({...form, companhia: v})}>
 <SelectTrigger><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="GOL">GOL Linhas Aéreas</SelectItem>
 <SelectItem value="LATAM">LATAM Airlines</SelectItem>
 <SelectItem value="AZUL">Azul Linhas Aéreas</SelectItem>
 <SelectItem value="OUTROS">Outra</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div>
 <Label>Localizador do Bloco (PNR)</Label>
 <Input value={form.localizador_bloco || ''} onChange={e => setForm({...form, localizador_bloco: e.target.value.toUpperCase()})} />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <Label>Origem (IATA)</Label>
 <Input value={form.origem || ''} onChange={e => setForm({...form, origem: e.target.value.toUpperCase()})} maxLength={3} placeholder="GRU" />
 </div>
 <div>
 <Label>Destino (IATA)</Label>
 <Input value={form.destino || ''} onChange={e => setForm({...form, destino: e.target.value.toUpperCase()})} maxLength={3} placeholder="REC" />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <Label>Data de Ida</Label>
 <Input type="date" value={form.data_ida || ''} onChange={e => setForm({...form, data_ida: e.target.value})} />
 </div>
 <div>
 <Label>Data de Volta</Label>
 <Input type="date" value={form.data_volta || ''} onChange={e => setForm({...form, data_volta: e.target.value})} />
 </div>
 </div>
 </>
 )}

 {section === 'commercial' && (
 <>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <Label>Total de Assentos (Bloco)</Label>
 <Input type="number" value={form.total_assentos || 0} onChange={e => setForm({...form, total_assentos: Number(e.target.value)})} />
 </div>
 <div>
 <Label>Assentos Vendidos/Nominados</Label>
 <Input type="number" value={form.assentos_vendidos || 0} onChange={e => setForm({...form, assentos_vendidos: Number(e.target.value)})} />
 </div>
 </div>

 <div>
 <Label>Custo Unitário por Assento (Sua Tarifa)</Label>
 <Input type="number" value={form.custo_passagem_unit || 0} onChange={e => setForm({...form, custo_passagem_unit: Number(e.target.value)})} />
 <p className="text-xs text-zinc-500 mt-1">Este valor será enviado para a Calculadora de Precificação.</p>
 </div>

 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
 <div>
 <Label className="text-red-500 font-bold">Prazo de Pagamento (Sinal/Total)</Label>
 <Input type="date" value={form.prazo_pagamento || ''} onChange={e => setForm({...form, prazo_pagamento: e.target.value})} />
 </div>
 <div>
 <Label className="text-amber-500 font-bold">Prazo de Nominação (Nomes)</Label>
 <Input type="date" value={form.prazo_nominacao || ''} onChange={e => setForm({...form, prazo_nominacao: e.target.value})} />
 </div>
 </div>

 <div>
 <Label>Status do Bloqueio</Label>
 <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
 <SelectTrigger><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="rascunho">Rascunho</SelectItem>
 <SelectItem value="confirmado">Confirmado (Sinal Pago)</SelectItem>
 <SelectItem value="em_vendas">Em Vendas</SelectItem>
 <SelectItem value="nominado">Nomes Enviados (Emitido)</SelectItem>
 <SelectItem value="encerrado">Concluído</SelectItem>
 <SelectItem value="cancelado">Cancelado</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </>
 )}
 </div>
 )}
 </SheetPage>
 </div>
 );
}
