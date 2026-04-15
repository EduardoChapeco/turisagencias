import { useState } from 'react';
import { SheetPage } from '@/components/ui/SheetPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ClientSearchSelect } from '@/components/ui/ClientSearchSelect';
import { useTrips } from '@/hooks/useTrips';
import { useUpdateKanbanCard, useDeleteKanbanCard } from '@/hooks/useKanbanBoards';
import { Save, Trash2, Calendar, LayoutList, CheckSquare } from 'lucide-react';
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
  const { data: trips } = useTrips();

  const [form, setForm] = useState({
    title: card?.title || '',
    description: card?.description || '',
    task_type: card?.task_type || '',
    priority: card?.priority || 'Normal',
    due_date: card?.due_date || '',
    client_id: card?.client_id || '',
    trip_id: card?.trip_id || '',
  });

  // Keep form in sync when card opens
  if (card && form.title === '' && card.title !== '') {
    setForm({
      title: card.title || '',
      description: card.description || '',
      task_type: card.task_type || '',
      priority: card.priority || 'Normal',
      due_date: card.due_date ? new Date(card.due_date).toISOString().split('T')[0] : '',
      client_id: card.client_id || '',
      trip_id: card.trip_id || '',
    });
  }

  if (!card) return null;

  const handleSave = async () => {
    await updateCard.mutateAsync({
      id: card.id,
      title: form.title,
      description: form.description,
      client_id: form.client_id || null,
      trip_id: form.trip_id || null,
      metadata: { task_type: form.task_type, priority: form.priority, due_date: form.due_date || null },
    } as any);
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
              <select
                className="w-full rounded-md border border-vj-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-vj-green/20"
                value={form.task_type}
                onChange={(e) => setForm({ ...form, task_type: e.target.value })}
              >
                <option value="">Geral</option>
                <option value="cotar">Cotar</option>
                <option value="ligar">Ligar</option>
                <option value="reuniao">Reunião</option>
                <option value="cancelamento">Cancelamento</option>
                <option value="reembolso">Reembolso</option>
                <option value="documentacao">Documentação</option>
                <option value="checkin">Check-in</option>
                <option value="follow_up">Follow Up</option>
              </select>
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
              <Label className="text-xs font-semibold text-vj-txt3 mb-1.5 block">Viagem Vinculada</Label>
              <select
                className="w-full rounded-md border border-vj-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-vj-green/20"
                value={form.trip_id}
                onChange={(e) => setForm({ ...form, trip_id: e.target.value })}
              >
                <option value="">Selecione a viagem...</option>
                {trips?.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
             <Label className="text-xs font-semibold text-vj-txt3 mb-1.5 block">Prioridade</Label>
             <select
                className="w-full rounded-md border border-vj-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-vj-green/20"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="Low">Baixa</option>
                <option value="Normal">Normal</option>
                <option value="High">Alta</option>
              </select>
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
