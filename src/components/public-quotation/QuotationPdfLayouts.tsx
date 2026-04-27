import React from 'react';
import type { PublicQuotationData } from '@/types';
import { MapPin, Calendar, Hotel, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  data: PublicQuotationData;
}

const fmt = (value: number | null, currency = 'BRL') => {
  if (!value) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
};

const fmtDate = (d: string | null) =>
  d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

export function PdfTemplateExecutivo({ data }: Props) {
  return (
    <div className="bg-white text-zinc-900 min-h-screen p-12 max-w-4xl mx-auto font-sans print:p-0 print:max-w-none">
      {/* HEADER */}
      <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-8 mb-8">
        <div>
          {data.org_logo ? (
            <img src={data.org_logo} alt="Logo" className="h-16 object-contain mb-4" />
          ) : (
            <h1 className="text-2xl font-black uppercase tracking-tighter">{data.org_name || 'Agência de Viagens'}</h1>
          )}
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Proposta Comercial</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold">{fmtDate(data.created_at)}</p>
          <p className="text-xs text-zinc-500 mt-1">Ref: {data.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      {/* TITULO E DESTINO */}
      <div className="mb-10">
        <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-2">{data.destination}</h2>
        <p className="text-lg font-medium text-zinc-600">{data.hotel_name || 'Hospedagem Premium'}</p>
      </div>

      {/* DADOS PRINCIPAIS */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Check-in</p>
          <p className="text-sm font-bold">{fmtDate(data.check_in)}</p>
        </div>
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Check-out</p>
          <p className="text-sm font-bold">{fmtDate(data.check_out)}</p>
        </div>
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Passageiros</p>
          <p className="text-sm font-bold">{data.num_adults} Adultos {data.num_children ? `, ${data.num_children} Crianças` : ''}</p>
        </div>
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Duração</p>
          <p className="text-sm font-bold">{data.num_nights} Noites</p>
        </div>
      </div>

      {/* ITINERARIO OU NOTAS */}
      {(data.whatsapp_text || data.notes) && (
        <div className="mb-10">
          <h3 className="text-sm font-black uppercase tracking-widest border-b border-zinc-200 pb-2 mb-4">Resumo da Viagem</h3>
          <p className="text-sm leading-relaxed text-zinc-700 whitespace-pre-wrap">{data.whatsapp_text || data.notes}</p>
        </div>
      )}

      {/* VALOR */}
      <div className="bg-zinc-900 text-white p-8 rounded-xl flex justify-between items-center mb-12">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">Investimento Total</p>
          <p className="text-3xl font-black tracking-tighter text-emerald-400">{fmt(data.total_value)}</p>
        </div>
        <div className="text-right">
          {data.installments && data.installments.length > 0 && (
            <p className="text-sm font-bold text-zinc-300">
              Ou {data.installments[0].installment_count}x de {fmt(data.installments[0].value)}
            </p>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center pt-8 border-t border-zinc-200 text-xs text-zinc-500">
        <p>Proposta válida até {fmtDate(data.valid_until || new Date(Date.now() + 86400000 * 3).toISOString())}. Valores sujeitos a alteração sem aviso prévio.</p>
        <p className="mt-2 font-bold uppercase tracking-widest">Powered by Turis</p>
      </div>
    </div>
  );
}

export function PdfTemplateApresentacao({ data }: Props) {
  const coverUrl = data.cover_image_url || data.hotel_photo_url || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop';
  
  return (
    <div className="bg-white text-zinc-900 min-h-screen font-sans print:bg-white print:m-0">
      {/* CAPA FULL SCREEN NO PDF */}
      <div className="relative h-[800px] w-full flex items-end p-16 print:h-[1050px]">
        <img src={coverUrl} className="absolute inset-0 w-full h-full object-cover" alt="Capa" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="relative z-10 text-white w-full">
          <div className="flex justify-between items-end w-full">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-emerald-400 mb-4">Proposta de Viagem</p>
              <h1 className="text-6xl font-black uppercase tracking-tighter leading-none mb-4">{data.destination}</h1>
              <p className="text-2xl font-bold text-white/80">{data.hotel_name}</p>
            </div>
            {data.org_logo && (
              <img src={data.org_logo} alt="Logo" className="h-20 object-contain bg-white/10 backdrop-blur-md p-4 rounded-xl" />
            )}
          </div>
        </div>
      </div>

      {/* CONTEÚDO PÁGINA 2 */}
      <div className="p-16 max-w-5xl mx-auto print:mt-16">
        <h2 className="text-2xl font-black uppercase tracking-tighter border-b-4 border-emerald-500 pb-4 inline-block mb-12">Sua Experiência</h2>
        
        <div className="grid grid-cols-2 gap-12 mb-16">
          <div className="space-y-8">
            <div className="flex gap-4 items-start">
              <Calendar className="w-8 h-8 text-emerald-500 shrink-0" />
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-1">Período</h3>
                <p className="text-xl font-bold">{fmtDate(data.check_in)} a {fmtDate(data.check_out)}</p>
                <p className="text-sm text-zinc-500 mt-1">{data.num_nights} Noites</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <ShieldCheck className="w-8 h-8 text-emerald-500 shrink-0" />
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-1">Viajantes</h3>
                <p className="text-xl font-bold">{data.num_adults} Adultos {data.num_children ? `e ${data.num_children} Crianças` : ''}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-50 p-8 rounded-2xl border border-zinc-200">
             <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4">Investimento</h3>
             <p className="text-4xl font-black text-emerald-600 tracking-tighter mb-2">{fmt(data.total_value)}</p>
             {data.installments && data.installments.length > 0 && (
              <p className="text-lg font-bold text-zinc-600">
                Ou {data.installments[0].installment_count}x de {fmt(data.installments[0].value)}
              </p>
             )}
          </div>
        </div>

        {(data.whatsapp_text) && (
          <div className="bg-zinc-900 text-white p-10 rounded-3xl">
             <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 mb-6">Detalhes do Roteiro</h3>
             <p className="text-base leading-relaxed text-zinc-300 whitespace-pre-wrap">{data.whatsapp_text}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function PdfTemplateExceTur({ data }: Props) {
  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen p-12 max-w-4xl mx-auto font-sans print:p-0 print:max-w-none print:bg-black">
      <div className="border border-white/10 rounded-3xl p-12 bg-[#111] print:border-none print:p-0">
        <div className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
             <Zap className="w-8 h-8 text-amber-400" />
             <span className="text-xl font-black tracking-widest uppercase">Exce Tur Premium</span>
          </div>
          {data.org_logo && <img src={data.org_logo} alt="Logo" className="h-12 object-contain filter invert" />}
        </div>

        <div className="mb-16">
          <p className="text-xs font-black uppercase tracking-[0.5em] text-amber-500 mb-4">Proposta Exclusiva</p>
          <h1 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4">{data.destination}</h1>
          <p className="text-xl text-zinc-400 font-medium">{data.hotel_name}</p>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-16">
          <div className="border-l-2 border-amber-500 pl-4">
             <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Datas</p>
             <p className="text-sm font-bold">{fmtDate(data.check_in)} - {fmtDate(data.check_out)}</p>
          </div>
          <div className="border-l-2 border-amber-500 pl-4">
             <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Passageiros</p>
             <p className="text-sm font-bold">{data.num_adults} ADL {data.num_children ? `/ ${data.num_children} CHD` : ''}</p>
          </div>
          <div className="border-l-2 border-amber-500 pl-4">
             <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Valor</p>
             <p className="text-sm font-bold text-amber-400">{fmt(data.total_value)}</p>
          </div>
        </div>

        {data.whatsapp_text && (
          <div className="border-t border-white/10 pt-10 mt-10">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500 mb-6">Descritivo</h3>
            <p className="text-sm leading-loose text-zinc-300 whitespace-pre-wrap">{data.whatsapp_text}</p>
          </div>
        )}
        
        <div className="mt-16 text-center border-t border-white/10 pt-8">
           <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Serviço de Concierge & Operações Exce Tur</p>
        </div>
      </div>
    </div>
  );
}
