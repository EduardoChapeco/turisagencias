import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X, Pencil, Trash2, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useKanbanBoardColumns, useCreateKanbanColumnInBoard, useUpdateKanbanColumn, useDeleteKanbanColumn } from '@/hooks/useSettings';
import { cn } from '@/lib/utils';

function ColumnRow({ col, onDelete }: { col: any; onDelete: (id: string) => void }) {
 const updateColumn = useUpdateKanbanColumn();
 const [editing, setEditing] = useState(false);
 const [name, setName] = useState(col.name);
 const [color, setColor] = useState(col.color ?? '#22c55e');

 const handleSave = async () => {
 await updateColumn.mutateAsync({ id: col.id, name, color });
 setEditing(false);
 };

 return (
 <div className="flex items-center gap-3 p-3 rounded-2xl border border-zinc-100 bg-white group hover: transition-shadow">
 <div className="h-4 w-4 rounded-full border-2 border-white shrink-0" style={{ backgroundColor: color }} />
 {editing ? (
 <div className="flex items-center gap-2 flex-1">
 <Input value={name} onChange={e => setName(e.target.value)} className="h-8 rounded-lg text-xs" autoFocus />
 <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-8 w-8 rounded-lg cursor-pointer border-0 p-0" />
 <Button size="icon" variant="ghost" className="h-8 w-8 text-vj-green" onClick={handleSave}><Check size={14} /></Button>
 <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400" onClick={() => setEditing(false)}><X size={14} /></Button>
 </div>
 ) : (
 <>
 <span className="text-sm font-bold text-vj-txt flex-1">{col.name}</span>
 <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
 <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(true)}><Pencil size={13} /></Button>
 <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-red-500" onClick={() => onDelete(col.id)}><Trash2 size={13} /></Button>
 </div>
 </>
 )}
 </div>
 );
}

export function KanbanTab() {
 const [boardSlug, setBoardSlug] = useState<'sales' | 'departures' | 'tasks'>('sales');
 const { data, isLoading } = useKanbanBoardColumns(boardSlug);
 const createColumn = useCreateKanbanColumnInBoard();
 const deleteColumn = useDeleteKanbanColumn();

 const [newName, setNewName] = useState('');
 const [adding, setAdding] = useState(false);

 const handleAdd = async () => {
 if (!newName.trim() || !data?.board) return;
 const maxPos = Math.max(0, ...(data.columns ?? []).map((c: any) => c.position)) + 1;
 await createColumn.mutateAsync({ board_id: data.board.id, name: newName.trim(), color: '#22c55e', position: maxPos });
 setNewName('');
 setAdding(false);
 };

 return (
 <div className="grid md:grid-cols-3 gap-8">
 <div className="space-y-3">
 {(['sales', 'departures', 'tasks'] as const).map(b => (
 <button key={b} onClick={() => setBoardSlug(b)} className={cn(
 "w-full p-5 rounded-[32px] text-left border transition-all duration-300",
 boardSlug === b ? "bg-vj-txt text-white " : "bg-white border-zinc-100 hover:bg-zinc-50"
 )}>
 <p className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-1">Board</p>
 <p className="text-base font-bold">{b === 'sales' ? 'Vendas (CRM)' : b === 'departures' ? 'Embarques' : 'Tarefas do Dia'}</p>
 </button>
 ))}
 </div>

 <div className="md:col-span-2 space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Colunas do Board</h3>
 <Button variant="ghost" size="sm" className="rounded-xl text-vj-green hover:bg-vj-green/5" onClick={() => setAdding(true)}>
 <Plus size={14} className="mr-2" /> Adicionar Estágio
 </Button>
 </div>

 <div className="space-y-2">
 {isLoading ? <Skeleton className="h-40 w-full" /> : data?.columns?.map((c: any) => (
 <ColumnRow key={c.id} col={c} onDelete={id => deleteColumn.mutate(id)} />
 ))}
 {adding && (
 <div className="flex items-center gap-2 p-3 rounded-2xl border border-dashed border-vj-green bg-vj-green/[0.02] animate-in slide-in-from-top-2">
 <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome da fase..." className="h-9 rounded-xl text-xs" autoFocus />
 <Button variant="ghost" size="icon" className="h-9 w-9 text-vj-green" onClick={handleAdd}><Check size={16} /></Button>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
