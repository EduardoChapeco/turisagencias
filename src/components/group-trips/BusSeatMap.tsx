import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
export type SeatCell = {
  label: string;  // ex: "1A", "1B", "Corredor"
  type: 'seat' | 'aisle' | 'door' | 'wc' | 'empty';
};

export type BusLayout = {
  rows: number;
  cols: number;
  seat_map: SeatCell[][];  // seat_map[row][col]
};

interface Props {
  layout: BusLayout;
  /** Set of seat labels currently occupied */
  occupied: string[];
  /** Set of seat labels reserved by this booking (already selected) */
  selected: string[];
  /** Max seats this person can select */
  maxSelect: number;
  onSelect: (seats: string[]) => void;
  /** If true, renders read-only (no interaction) */
  readOnly?: boolean;
}

// Color palette
const cellClass = (
  cell: SeatCell,
  isOccupied: boolean,
  isSelected: boolean,
  readOnly: boolean,
): string => {
  if (cell.type === 'aisle' || cell.type === 'empty') return 'bg-transparent border-transparent cursor-default';
  if (cell.type === 'door') return 'bg-zinc-200 border-zinc-300 text-zinc-400 text-[8px] font-bold cursor-default';
  if (cell.type === 'wc') return 'bg-indigo-50 border-indigo-200 text-indigo-400 text-[8px] cursor-default';
  if (isOccupied) return 'bg-zinc-300 border-zinc-400 text-zinc-500 cursor-not-allowed';
  if (isSelected) return 'bg-vj-green border-vj-green text-white shadow-lg shadow-vj-green/30 scale-105';
  if (readOnly) return 'bg-green-50 border-green-200 text-green-600 cursor-default';
  return 'bg-white border-zinc-200 text-zinc-600 hover:border-vj-green hover:bg-vj-green/10 hover:text-vj-green cursor-pointer active:scale-95';
};

/**
 * BusSeatMap — renders an interactive or read-only seat map.
 *
 * Usage:
 * ```tsx
 * <BusSeatMap
 *   layout={trip.bus_layout}
 *   occupied={assignedSeats}
 *   selected={mySeats}
 *   maxSelect={booking.pax_count}
 *   onSelect={setMySeats}
 * />
 * ```
 */
export function BusSeatMap({ layout, occupied, selected, maxSelect, onSelect, readOnly = false }: Props) {
  const toggle = useCallback((label: string) => {
    if (readOnly) return;
    if (occupied.includes(label)) return;
    if (selected.includes(label)) {
      onSelect(selected.filter(s => s !== label));
    } else if (selected.length < maxSelect) {
      onSelect([...selected, label]);
    }
  }, [readOnly, occupied, selected, maxSelect, onSelect]);

  const { rows, cols, seat_map } = layout;

  return (
    <div className="w-full select-none">
      {/* Bus front indicator */}
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-zinc-100 rounded-full border border-zinc-200">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">🚌 Frente do ônibus</span>
        </div>
      </div>

      {/* Seat grid */}
      <div
        className="mx-auto w-fit"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap: '6px',
        }}
      >
        {Array.from({ length: rows }).map((_, rowIdx) =>
          Array.from({ length: cols }).map((_, colIdx) => {
            const cell: SeatCell = seat_map[rowIdx]?.[colIdx] ?? { label: '', type: 'empty' };
            const isOccupied = occupied.includes(cell.label);
            const isSelected = selected.includes(cell.label);

            if (cell.type === 'aisle' || cell.type === 'empty') {
              return (
                <div key={`${rowIdx}-${colIdx}`} className="w-9 h-9" />
              );
            }

            return (
              <button
                key={`${rowIdx}-${colIdx}`}
                type="button"
                disabled={isOccupied || readOnly}
                onClick={() => toggle(cell.label)}
                title={
                  cell.type === 'door' ? 'Porta'
                  : cell.type === 'wc' ? 'WC'
                  : isOccupied ? `Assento ${cell.label} — Ocupado`
                  : isSelected ? `Assento ${cell.label} — Selecionado`
                  : `Assento ${cell.label} — Disponível`
                }
                className={cn(
                  'w-9 h-9 rounded-lg border-2 text-[11px] font-bold transition-all duration-150 flex items-center justify-center',
                  cellClass(cell, isOccupied, isSelected, readOnly),
                )}
              >
                {cell.type === 'door' ? '🚪' : cell.type === 'wc' ? '🚿' : cell.label}
              </button>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-5 flex-wrap">
        <LegendItem color="bg-white border-zinc-200 text-zinc-500" label="Disponível" />
        <LegendItem color="bg-vj-green border-vj-green text-white" label="Selecionado" />
        <LegendItem color="bg-zinc-300 border-zinc-400 text-zinc-500" label="Ocupado" />
      </div>

      {/* Selection summary */}
      {!readOnly && (
        <div className="mt-4 p-3 rounded-xl bg-vj-bg border border-vj-border text-center">
          <p className="text-sm font-semibold text-vj-txt">
            {selected.length === 0
              ? `Selecione até ${maxSelect} assento${maxSelect > 1 ? 's' : ''}`
              : `${selected.length} de ${maxSelect} assento${maxSelect > 1 ? 's' : ''} selecionado${selected.length > 1 ? 's' : ''}: `}
            {selected.length > 0 && (
              <span className="text-vj-green font-black">{selected.join(', ')}</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-vj-txt3">
      <span className={cn('w-5 h-5 rounded border-2 text-[9px] font-bold flex items-center justify-center', color)}>A</span>
      {label}
    </span>
  );
}

// ─── Bus Layout Builder (Admin) ───────────────────────────────────────────────
/**
 * Generates a standard Comil Campione bus layout (45 passengers + WC + 2 doors).
 * Used as default when creating a new bus_layout.
 */
export function generateDefaultBusLayout(rows = 12, cols = 4): BusLayout {
  const seat_map: SeatCell[][] = [];
  const letters = ['A', 'B', '', 'C', 'D']; // '' = aisle at position 2

  const colCount = 5; // A, B, aisle, C, D

  for (let r = 0; r < rows; r++) {
    const row: SeatCell[] = [];
    for (let c = 0; c < colCount; c++) {
      if (c === 2) {
        row.push({ label: '', type: 'aisle' });
        continue;
      }
      const letter = letters[c];
      if (r === rows - 1 && c === 3) {
        row.push({ label: 'WC', type: 'wc' });
      } else if (r === rows - 1 && c === 4) {
        row.push({ label: '', type: 'empty' });
      } else {
        const num = r + 1;
        row.push({ label: `${num}${letter}`, type: 'seat' });
      }
    }
    seat_map.push(row);
  }

  // First row: driver area
  const frontRow: SeatCell[] = [
    { label: '🚪', type: 'door' },
    { label: '', type: 'empty' },
    { label: '', type: 'aisle' },
    { label: '', type: 'empty' },
    { label: '', type: 'empty' },
  ];
  seat_map.unshift(frontRow);

  return { rows: rows + 1, cols: colCount, seat_map };
}
