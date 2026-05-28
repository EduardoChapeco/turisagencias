/**
 * src/pages/Vouchers.tsx
 *
 * Módulo de Vouchers / Boarding Pass com OCR multi-arquivo e geração de PDF.
 * Design OMEGA v6.5 — Bento Grid + SheetPage CMS contínuo.
 */
import { useState } from 'react';
import {
  Plus, Search, Trash2, Edit, Loader2, FileCheck,
  Plane, Building2, Calendar, MapPin, Ticket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/PageHeader';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  useVouchers,
  useDeleteVoucher,
  type VoucherRecord,
} from '@/hooks/useVouchers';
import VoucherBuilderSheet from '@/components/crm/VoucherBuilderSheet';

export default function Vouchers() {
  const { data: vouchers = [], isLoading } = useVouchers();
  const deleteVoucher = useDeleteVoucher();

  const [searchTerm, setSearchTerm] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Partial<VoucherRecord> | null>(null);

  const filtered = vouchers.filter(v =>
    (v.destino ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.localizador ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fmtDate = (d?: string | null) =>
    d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : null;

  return (
    <div className="h-full flex flex-col overflow-hidden w-full">
      <PageHeader title="Vouchers & Boarding" description="Cards de embarque e resumos de viagem para o passageiro" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full pb-12">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-3 bg-white border border-vj-border rounded-xl px-4 py-2 flex-1 max-w-sm">
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
            className="bg-vj-green text-white hover:bg-vj-green/90 rounded-xl font-bold text-xs gap-2"
          >
            <Plus size={16} /> Novo Voucher
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
            <Button
              size="sm"
              variant="outline"
              className="gap-2 border-vj-border"
              onClick={() => setIsSheetOpen(true)}
            >
              <Plus size={14} /> Criar primeiro voucher
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(v => {
              // Parse hotel/voos from JSON stored fields
              let hotelNome = '';
              let primeiroVoo = '';
              try {
                const h = typeof v.hotel === 'string' ? JSON.parse(v.hotel) : v.hotel;
                hotelNome = Array.isArray(h) && h[0]?.nome ? h[0].nome : (h?.nome || '');
              } catch (_) {}
              try {
                const voos = typeof v.voos === 'string' ? JSON.parse(v.voos) : v.voos;
                primeiroVoo = Array.isArray(voos) && voos[0]?.trecho ? voos[0].trecho : '';
              } catch (_) {}

              return (
                <div
                  key={v.id}
                  className="bg-white border border-vj-border rounded-2xl overflow-hidden flex flex-col hover:border-vj-green/40 hover:shadow-sm transition-all duration-200 group cursor-pointer"
                  onClick={() => { setEditingVoucher(v); setIsSheetOpen(true); }}
                >
                  {/* Header colorido */}
                  <div className="bg-vj-bg-dark text-white p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Voucher Oficial</p>
                        <h3 className="font-black text-sm leading-tight line-clamp-1 group-hover:text-vj-green transition-colors">
                          {v.destino || 'Destino a definir'}
                        </h3>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-vj-green/20 flex items-center justify-center shrink-0">
                        <Ticket className="w-4 h-4 text-vj-green" />
                      </div>
                    </div>
                    {v.localizador && (
                      <p className="text-[10px] font-mono font-bold text-zinc-500 mt-2 bg-white/5 px-2 py-0.5 rounded w-fit">
                        {v.localizador}
                      </p>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    {primeiroVoo && (
                      <div className="flex items-center gap-2 text-xs text-vj-txt2">
                        <Plane className="w-3.5 h-3.5 text-vj-green shrink-0" />
                        <span className="line-clamp-1">{primeiroVoo}</span>
                      </div>
                    )}
                    {hotelNome && (
                      <div className="flex items-center gap-2 text-xs text-vj-txt2">
                        <Building2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="line-clamp-1">{hotelNome}</span>
                      </div>
                    )}
                    {(v.data_checkin || v.data_checkout) && (
                      <div className="flex items-center gap-2 text-xs text-vj-txt3">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>{fmtDate(v.data_checkin)} → {fmtDate(v.data_checkout)}</span>
                      </div>
                    )}

                    {/* Footer actions */}
                    <div
                      className="flex justify-end gap-1 pt-3 border-t border-vj-border mt-auto"
                      onClick={e => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-vj-txt3 hover:text-vj-green hover:bg-vj-green/10"
                        onClick={() => { setEditingVoucher(v); setIsSheetOpen(true); }}
                      >
                        <Edit size={13} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-vj-txt3 hover:text-red-600 hover:bg-red-50"
                        onClick={() => { if (confirm('Excluir este voucher?')) void deleteVoucher.mutateAsync(v.id); }}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sheet Builder */}
      <Sheet open={isSheetOpen} onOpenChange={v => { setIsSheetOpen(v); if (!v) setEditingVoucher(null); }}>
        <SheetContent side="bottom" className="h-[95vh] p-0 sm:max-w-none w-full rounded-t-3xl overflow-hidden bg-white">
          <VoucherBuilderSheet
            open={isSheetOpen}
            onClose={() => { setIsSheetOpen(false); setEditingVoucher(null); }}
            initialData={editingVoucher}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
