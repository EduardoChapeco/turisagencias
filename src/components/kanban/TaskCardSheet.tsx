import { useState, useEffect } from 'react';
import { SheetPage } from '@/components/ui/SheetPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ClientSearchSelect } from '@/components/ui/ClientSearchSelect';
import { useGroupTrips } from '@/hooks/useGroupTrips';
import { useUpdateKanbanCard, useDeleteKanbanCard } from '@/hooks/useKanbanBoards';
import { Save, Trash2, Calendar, LayoutList, CheckSquare } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TaskCardData } from './TaskBoardCard';

interface Props {
  card: TaskCardData | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export function TaskCardSheet({ card, isOpen, onClose, onDeleted }: Props) {
  const updateCard = useUpdateKanbanCard();
  const deleteCard = useDeleteKanbanCard();
  const { data: groupTrips } = useGroupTrips();

  const metadata = (card as any)?.metadata || (card as any)?.meta || {};
  const [form, setForm] = useState({
    title: card?.title || '',
    description: card?.description || '',
    task_type: card?.task_type || metadata.task_type || '',
    priority: card?.priority || metadata.priority || 'Normal',
    due_date: card?.due_date || metadata.due_date || '',
    client_id: card?.client_id || '',
    group_trip_id: card?.group_trip_id || '',
  });

  // Keep form in sync when a different card opens
  useEffect(() => {
    if (card) {
      const meta = (card as any)?.metadata || (card as any)?.meta || {};
      setForm({
        title: card.title || '',
        description: card.description || '',
        task_type: card.task_type || meta.task_type || '',
        priority: card.priority || meta.priority || 'Normal',
        due_date: card.due_date || meta.due_date || '',
        client_id: card.client_id || '',
        group_trip_id: card.group_trip_id || '',
      });
    }
  }, [card]);

  if (!card) return null;

  const handleSave = async () => {
    await updateCard.mutateAsync({
      id: card.id,
      title: form.title,
      description: form.description,
      client_id: form.client_id || null,
      group_trip_id: form.group_trip_id || null,
      metadata: { task_type: form.task_type || null, priority: form.priority, due_date: form.due_date || null },
    } as Record<string, any>);
    onClose();
  };

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      await deleteCard.mutateAsync(card.id);
      onDeleted?.();
      onClose();
    }
  };

  return (
    <SheetPage open={isOpen} onClose={onClose} title="Detalhes da Tarefa">
      <div className="space-y-6 p-1">
        <div className="space-y-4">
          <div>
            <Label className="text-xs font-semibold text-vj-txt3 mb-1.5 block">Título da Tarefa</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="bg-white border-vj-border h-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-vj-txt3 mb-1.5 block flex items-center gap-1">
                <LayoutList size={14} /> Tipo de Tarefa
              </Label>
              <Select value={form.task_type || '_empty'} onValueChange={(value) => setForm({ ...form, task_type: value === '_empty' ? '' : value })}>
                <SelectTrigger className="w-full bg-white h-10 border-vj-border rounded-md text-sm">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_empty">Geral</SelectItem>
                  <SelectItem value="cotar">Cotar</SelectItem>
                  <SelectItem value="ligar">Ligar</SelectItem>
                  <SelectItem value="reuniao">Reunião</SelectItem>
                  <SelectItem value="cancelamento">Cancelamento</SelectItem>
                  <SelectItem value="reembolso">Reembolso</SelectItem>
                  <SelectItem value="documentacao">Documentação</SelectItem>
                  <SelectItem value="checkin">Check-in</SelectItem>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-vj-txt3 mb-1.5 block flex items-center gap-1">
                <Calendar size={14} /> Prazo / Data Inicial
              </Label>
              <Input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="bg-white border-vj-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-vj-txt3 mb-1.5 block">Cliente Vinculado</Label>
              <ClientSearchSelect
                value={form.client_id}
                onChange={(id) => setForm({ ...form, client_id: id })}
                placeholder="Selecione um cliente..."
                className="bg-white"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-vj-txt3 mb-1.5 block">Viagem</Label>
              <Select value={form.group_trip_id} onValueChange={(value) => setForm({ ...form, group_trip_id: value === '_empty' ? '' : value })}>
                <SelectTrigger className="w-full bg-white h-10 border-vj-border rounded-md text-sm">
                  <SelectValue placeholder="Selecione a viagem..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_empty">Selecione a viagem...</SelectItem>
                  {groupTrips?.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
             <Label className="text-xs font-semibold text-vj-txt3 mb-1.5 block">Prioridade</Label>
             <Select value={form.priority} onValueChange={(value) => setForm({ ...form, priority: value })}>
               <SelectTrigger className="w-full bg-white h-10 border-vj-border rounded-md text-sm">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="Low">Baixa</SelectItem>
                 <SelectItem value="Normal">Normal</SelectItem>
                 <SelectItem value="High">Alta</SelectItem>
               </SelectContent>
             </Select>
          </div>

          <div>
            <Label className="text-xs font-semibold text-vj-txt3 mb-1.5 block">Descrição</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="resize-none min-h-[120px] bg-white border-vj-border"
              placeholder="Adicione notas ou escopo desta tarefa..."
            />
          </div>
        </div>

        <div className="pt-4 border-t border-vj-border flex justify-between">
          <Button variant="ghost" onClick={handleDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <Trash2 className="w-4 h-4 mr-2" /> Excluir
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-vj-green hover:bg-vj-green-dark">
              <Save className="w-4 h-4 mr-2" /> Salvar Tarefa
            </Button>
          </div>
        </div>
      </div>
    </SheetPage>
  );
}
