/**
 * src/pages/Vouchers.tsx
 *
 * Módulo de Vouchers / Boarding Pass com OCR multi-arquivo e geração de PDF.
 * Adaptado do aiturisagente para o design OMEGA (Bento/Shadowless + Supabase).
 */
import { useState, useRef } from 'react';
import {
  Plus, Search, Trash2, Edit, Loader2, FileCheck, Download, Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/PageHeader';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import {
  useVouchers,
  useCreateVoucher,
  useUpdateVoucher,
  useDeleteVoucher,
  type VoucherRecord,
} from '@/hooks/useVouchers';
} from '@/hooks/useVouchers';
import VoucherMasterPipeline from '@/components/crm/VoucherMasterPipeline';

export default function Vouchers() {
  const { data: vouchers = [], isLoading } = useVouchers();
  const createVoucher = useCreateVoucher();
  const updateVoucher = useUpdateVoucher();
  const deleteVoucher = useDeleteVoucher();

  const [searchTerm, setSearchTerm]     = useState('');
  const [isSheetOpen, setIsSheetOpen]   = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Partial<VoucherRecord> | null>(null);
  const a4Ref = useRef<HTMLDivElement>(null);

  const isEditing = !!formData.id;

  // Removed old OCR and Save logic as VoucherMasterPipeline will handle it

  // ── Filter ────────────────────────────────────────────────────────────────

  const filtered = vouchers.filter(v =>
    (v.destino     ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.localizador ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col overflow-hidden w-full">
      <PageHeader title="Vouchers & Boarding" description="Cards de embarque e resumos de viagem para o passageiro" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full pb-12">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-3 bg-white border border-vj-border rounded-xl px-4 py-2 flex-1 max-w-sm shadow-sm">
            <Search className="text-vj-txt3 shrink-0" size={16} />
            <Input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por destino ou localizador..."
              className="border-none bg-transparent focus-visible:ring-0 px-0 text-sm"
            />
          </div>
          <Button
            onClick={() => { setEditingVoucher(null); setIsSheetOpen(true); }}
            className="bg-vj-green text-white hover:bg-vj-green/90 rounded-xl font-bold text-xs"
          >
            <Plus size={16} className="mr-2" /> Novo Voucher
          </Button>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="animate-spin text-vj-txt3" size={24} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-vj-border rounded-2xl text-vj-txt3 gap-3">
            <FileCheck size={40} className="opacity-30" />
            <p className="font-medium text-sm">Nenhum voucher gerado ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(v => (
              <div key={v.id} className="bg-white border border-vj-border rounded-2xl p-4 flex flex-col gap-2 shadow-sm hover:border-vj-green/40 transition-colors">
                <h3 className="font-bold text-vj-txt line-clamp-1">{v.destino || 'Destino a definir'}</h3>
                <p className="text-xs font-mono font-bold text-vj-txt3 bg-vj-bg px-2 py-0.5 rounded w-fit">
                  LOC: {v.localizador || 'N/A'}
                </p>
                <div className="text-xs text-vj-txt3 mt-1 space-y-0.5">
                  {v.data_checkin && <p>Check-in: {v.data_checkin}</p>}
                  {v.hotel && <p>Hotel: {v.hotel}</p>}
                </div>
                <div className="flex justify-end gap-1 pt-2 border-t border-vj-border mt-auto">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-vj-txt3 hover:text-vj-txt"
                    onClick={() => { setEditingVoucher(v); setIsSheetOpen(true); }}>
                    <Edit size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-vj-txt3 hover:text-red-600"
                    onClick={() => { if (confirm('Excluir?')) void deleteVoucher.mutateAsync(v.id); }}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={v => { setIsSheetOpen(v); if (!v) setEditingVoucher(null); }}>
        <SheetContent side="bottom" className="h-[95vh] p-0 sm:max-w-none w-full rounded-t-3xl overflow-hidden bg-slate-100">
          <VoucherMasterPipeline onClose={() => setIsSheetOpen(false)} initialData={editingVoucher} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
