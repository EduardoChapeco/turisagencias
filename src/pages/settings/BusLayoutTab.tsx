import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Armchair, Bath, Bus, DoorOpen, Eraser, Minus, Pencil, Plus, RotateCcw, Save, Trash2, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBusLayouts, useCreateBusLayout, useDeleteBusLayout, useUpdateBusLayout } from '@/hooks/useBusLayouts';
import type { BusLayoutRecord } from '@/hooks/useBusLayouts';
import { BusSeatMap, generateDefaultBusLayout } from '@/components/group-trips/BusSeatMap';
import type { SeatCell } from '@/components/group-trips/BusSeatMap';

export function BusLayoutTab() {
 const { data: layouts, isLoading } = useBusLayouts();
 const create = useCreateBusLayout();
 const update = useUpdateBusLayout();
 const remove = useDeleteBusLayout();

 const [form, setForm] = useState({
 name: '', vehicle_type: 'bus', rows: 13, cols: 5, notes: '',
 });
 const [preview, setPreview] = useState<string | null>(null);
 const [editing, setEditing] = useState<string | null>(null);
 const [editor, setEditor] = useState<BusLayoutRecord | null>(null);
 const [tool, setTool] = useState<SeatCell['type']>('seat');

 const handleCreate = async () => {
 if (!form.name.trim()) return;
 await create.mutateAsync(form);
 setForm({ name: '', vehicle_type: 'bus', rows: 13, cols: 5, notes: '' });
 };

 const vehicleEmoji: Record<string, string> = {
 bus: '🚌', van: '🚐', plane: '✈️', boat: '⛵',
 };

 const openEditor = (layout: BusLayoutRecord) => {
 setPreview(layout.id);
 setEditing(layout.id);
 setEditor({
 ...layout,
 seat_map: layout.seat_map.map((row) => row.map((cell) => ({ ...cell }))),
 });
 };

 const cancelEditor = () => {
 setEditing(null);
 setEditor(null);
 };

 const resetEditorLayout = () => {
 if (!editor) return;
 const next = generateDefaultBusLayout(Math.max(2, editor.rows - 1), editor.cols);
 setEditor({ ...editor, rows: next.rows, cols: next.cols, seat_map: next.seat_map });
 };

 const updateEditorCell = (rowIndex: number, colIndex: number) => {
 if (!editor) return;
 const labelByTool: Record<SeatCell['type'], string> = {
 seat: editor.seat_map[rowIndex]?.[colIndex]?.label || `${rowIndex + 1}${String.fromCharCode(65 + colIndex)}`,
 aisle: '',
 door: 'Porta',
 wc: 'WC',
 empty: '',
 };
 const nextMap = editor.seat_map.map((row, r) =>
 row.map((cell, c) => (
 r === rowIndex && c === colIndex
 ? { label: labelByTool[tool], type: tool }
 : cell
 )),
 );
 setEditor({ ...editor, seat_map: nextMap });
 };

 const saveEditor = async () => {
 if (!editor) return;
 await update.mutateAsync({
 id: editor.id,
 name: editor.name,
 vehicle_type: editor.vehicle_type,
 rows: editor.rows,
 cols: editor.cols,
 seat_map: editor.seat_map,
 notes: editor.notes,
 });
 cancelEditor();
 };

 return (
 <div className="grid md:grid-cols-2 gap-8">
 {/* Create form */}
 <Card className="premium-card">
 <CardHeader>
 <CardTitle className="text-lg flex items-center gap-2">
 <Bus className="h-4 w-4 text-vj-green" /> Novo Layout de Ônibus
 </CardTitle>
 <CardDescription>
 Defina a configuração de assentos gerada automaticamente.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div>
 <Label>Nome do layout *</Label>
 <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
 placeholder="Ex: Comil Campione 45 lugares" className="rounded-xl mt-1" />
 </div>
 <div>
 <Label>Tipo de veículo</Label>
 <Select value={form.vehicle_type} onValueChange={v => setForm(p => ({ ...p, vehicle_type: v }))}>
 <SelectTrigger className="h-10 rounded-xl border-zinc-200 mt-1">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="bus">🚌 Ônibus</SelectItem>
 <SelectItem value="van">🚐 Van</SelectItem>
 <SelectItem value="plane">✈️ Avião</SelectItem>
 <SelectItem value="boat">⛵ Barco</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div>
 <Label>Fileiras</Label>
 <Input type="number" min={3} max={20} value={form.rows}
 onChange={e => setForm(p => ({ ...p, rows: Number(e.target.value) }))}
 className="rounded-xl mt-1" />
 </div>
 <div>
 <Label>Colunas (sem corredor)</Label>
 <Input type="number" min={2} max={6} value={form.cols}
 onChange={e => setForm(p => ({ ...p, cols: Number(e.target.value) }))}
 className="rounded-xl mt-1" />
 </div>
 </div>
 <div>
 <Label>Notas internas</Label>
 <Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
 placeholder="Ex: Ônibus da Cooperativa Sul" className="rounded-xl mt-1" />
 </div>
 <p className="text-xs text-zinc-400">
 Layout com corredor central gerado automaticamente.
 Aprox. {(form.rows - 1) * (form.cols - 1)} assentos + WC.
 </p>
 <Button className="w-full" onClick={handleCreate} disabled={!form.name.trim() || create.isPending}>
 {create.isPending ? 'Criando...' : <><Plus size={14} className="mr-1" /> Criar Layout</>}
 </Button>
 </CardContent>
 </Card>

 {/* List */}
 <div className="space-y-3">
 <h3 className="font-semibold text-sm text-zinc-500 uppercase tracking-wider">Layouts cadastrados</h3>
 {isLoading ? (
 <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
 ) : !layouts?.length ? (
 <Card className="premium-card">
 <CardContent className="flex flex-col items-center py-12 text-center">
 <Bus size={36} className="text-zinc-200 mb-2" />
 <p className="text-sm text-zinc-400">Nenhum layout criado ainda</p>
 </CardContent>
 </Card>
 ) : (
 layouts.map(layout => (
 <Card key={layout.id} className="premium-card">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm flex items-center justify-between">
 <span className="flex items-center gap-2">
 <span>{vehicleEmoji[layout.vehicle_type] ?? '🚌'}</span>
 {layout.name}
 </span>
 <div className="flex gap-1">
 <Button variant="outline" size="sm" className="h-7 text-xs rounded-lg gap-1"
 onClick={() => openEditor(layout)}>
 <Pencil size={12} /> Editar
 </Button>
 <Button variant="outline" size="sm" className="h-7 text-xs rounded-lg"
 onClick={() => setPreview(preview === layout.id ? null : layout.id)}>
 {preview === layout.id ? 'Ocultar' : 'Preview'}
 </Button>
 <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50"
 onClick={() => { if (confirm('Remover layout?')) remove.mutate(layout.id); }}>
 <Trash2 size={13} />
 </Button>
 </div>
 </CardTitle>
 </CardHeader>
 <CardContent className="pt-0">
 <p className="text-xs text-zinc-400">
 {layout.rows} fileiras × {layout.cols} colunas · {layout.vehicle_type}
 </p>
 {layout.notes && <p className="text-xs text-zinc-500 mt-0.5">{layout.notes}</p>}
 {editing === layout.id && editor ? (
 <div className="mt-4 rounded-xl border border-vj-border bg-zinc-50/60 p-3">
 <div className="grid gap-3 sm:grid-cols-2">
 <div>
 <Label>Nome</Label>
 <Input
 value={editor.name}
 onChange={(e) => setEditor({ ...editor, name: e.target.value })}
 className="mt-1 h-9 rounded-xl bg-white"
 />
 </div>
 <div>
 <Label>Notas</Label>
 <Input
 value={editor.notes ?? ''}
 onChange={(e) => setEditor({ ...editor, notes: e.target.value })}
 className="mt-1 h-9 rounded-xl bg-white"
 />
 </div>
 </div>

 <div className="mt-4 flex flex-wrap gap-2">
 {[
 { type: 'seat' as const, label: 'Assento', icon: Armchair },
 { type: 'aisle' as const, label: 'Corredor', icon: Minus },
 { type: 'door' as const, label: 'Porta', icon: DoorOpen },
 { type: 'wc' as const, label: 'WC', icon: Bath },
 { type: 'empty' as const, label: 'Vazio', icon: Eraser },
 ].map((item) => (
 <Button
 key={item.type}
 type="button"
 variant={tool === item.type ? 'default' : 'outline'}
 size="sm"
 className="h-8 gap-1 rounded-lg text-xs"
 onClick={() => setTool(item.type)}
 >
 <item.icon size={13} /> {item.label}
 </Button>
 ))}
 </div>

 <EditableSeatGrid layout={editor} onCellClick={updateEditorCell} />

 <div className="mt-4 flex flex-wrap justify-end gap-2">
 <Button variant="outline" size="sm" className="gap-1" onClick={resetEditorLayout}>
 <RotateCcw size={13} /> Regerar
 </Button>
 <Button variant="outline" size="sm" className="gap-1" onClick={cancelEditor}>
 <X size={13} /> Cancelar
 </Button>
 <Button size="sm" className="gap-1" onClick={saveEditor} disabled={update.isPending || !editor.name.trim()}>
 <Save size={13} /> {update.isPending ? 'Salvando...' : 'Salvar'}
 </Button>
 </div>
 </div>
 ) : preview === layout.id && layout.seat_map && (
 <div className="mt-4 overflow-x-auto">
 <BusSeatMap
 layout={{ rows: layout.rows, cols: layout.cols, seat_map: layout.seat_map }}
 occupied={[]}
 selected={[]}
 maxSelect={0}
 onSelect={() => {}}
 readOnly
 />
 </div>
 )}
 </CardContent>
 </Card>
 ))
 )}
 </div>
 </div>
 );
}

function EditableSeatGrid({
 layout,
 onCellClick,
}: {
 layout: BusLayoutRecord;
 onCellClick: (rowIndex: number, colIndex: number) => void;
}) {
 const cellClass: Record<SeatCell['type'], string> = {
 seat: 'border-vj-green/30 bg-white text-vj-txt hover:bg-vj-green/10',
 aisle: 'border-transparent bg-transparent text-zinc-300',
 door: 'border-zinc-300 bg-zinc-100 text-zinc-500',
 wc: 'border-blue-200 bg-blue-50 text-blue-500',
 empty: 'border-zinc-100 bg-white/40 text-zinc-300',
 };

 return (
 <div className="mt-4 overflow-x-auto pb-2">
 <div
 className="mx-auto grid w-fit gap-1.5"
 style={{ gridTemplateColumns: `repeat(${layout.cols}, 2.25rem)` }}
 >
 {layout.seat_map.flatMap((row, rowIndex) =>
 row.map((cell, colIndex) => (
 <button
 key={`${rowIndex}-${colIndex}`}
 type="button"
 className={`h-9 w-9 rounded-lg border text-[10px] font-bold transition-colors ${cellClass[cell.type]}`}
 title={`${rowIndex + 1}:${colIndex + 1} - ${cell.type}`}
 onClick={() => onCellClick(rowIndex, colIndex)}
 >
 {cell.type === 'seat' ? cell.label : cell.type.toUpperCase()}
 </button>
 )),
 )}
 </div>
 </div>
 );
}
