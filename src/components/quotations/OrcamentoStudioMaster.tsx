import React, { useState } from 'react';
import { 
  Camera, ChevronLeft, ChevronRight, FileText, Image as ImageIcon, Map, MapPin, 
  Plus, Sparkles, Trash2, X, Plane, Bed, Calendar, CheckSquare, Coins
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function OrcamentoStudioMaster() {
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('geral');
  
  // State
  const [geral, setGeral] = useState({ agencia: 'Excelência Tour', codigo: '', agente: '', whats: '', cor: '#00B4D8' });
  const [passageiros, setPassageiros] = useState({ nome: '', email: '', telefone: '', adt: 2, snr: 0, chd: 0, inf: 0 });
  const [voos, setVoos] = useState<{cia: string, trecho: string, data: string}[]>([]);
  const [hoteis, setHoteis] = useState<{nome: string, regime: string, checkin: string, checkout: string}[]>([]);

  const handleGerarPDF = () => {
    toast({ title: 'Gerando PDF', description: 'Renderizando layout selecionado...' });
    setTimeout(() => window.print(), 500);
  };

  const processarOCR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    toast({ title: 'Analisando PDF/Imagem', description: 'A IA está extraindo voos e hotéis...' });
    
    // Simulate OCR delay
    setTimeout(() => {
      setVoos([{ cia: 'GOL', trecho: 'GRU ✈ CWB', data: '10/10/2026 14:00' }]);
      setHoteis([{ nome: 'Bourbon Hotel', regime: 'Café da Manhã', checkin: '10/10', checkout: '15/10' }]);
      setIsProcessing(false);
      toast({ title: 'Dados Extraídos', description: 'O orçamento foi preenchido com sucesso.' });
    }, 2000);
  };

  const tabs = [
    { id: 'geral', icon: <ImageIcon className="w-4 h-4" />, label: 'Capa' },
    { id: 'pax', icon: <CheckSquare className="w-4 h-4" />, label: 'Viajantes' },
    { id: 'voos', icon: <Plane className="w-4 h-4" />, label: 'Voos' },
    { id: 'hoteis', icon: <Bed className="w-4 h-4" />, label: 'Hotéis' },
    { id: 'fin', icon: <Coins className="w-4 h-4" />, label: 'Valores' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden font-sans">
      
      {/* HEADER MASTER */}
      <header className="h-[75px] bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-black text-base text-slate-900 tracking-tight">Studio Master de Orçamentos</h1>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Excelência Tour • Apresentação Premium</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select className="border border-slate-200 rounded-xl px-4 h-10 text-xs font-bold bg-slate-50 text-slate-700 outline-none">
            <option>Editorial Flat Premium</option>
            <option>Proposta Executiva Clássica</option>
            <option>Apresentação Guiada</option>
          </select>

          <Button variant="outline" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="h-10 px-4 rounded-xl font-bold bg-white text-slate-700 border-slate-200">
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>

          <Button onClick={handleGerarPDF} className="bg-slate-900 hover:bg-black text-white h-10 px-6 rounded-xl font-bold">
            <FileText className="mr-2 h-4 w-4 text-red-400" /> Exportar PDF
          </Button>
        </div>
      </header>

      {/* WORKSPACE */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR CMS (FLAT DESIGN) */}
        <aside className={`transition-all duration-300 bg-white border-r border-slate-200 flex flex-col z-10 ${isSidebarOpen ? 'w-[450px]' : 'w-0 opacity-0 overflow-hidden'}`}>
          
          {/* OCR Box */}
          <div className="p-5 border-b border-slate-200 bg-slate-50">
            <label className="cursor-pointer border border-dashed border-slate-300 bg-white hover:border-indigo-400 transition-colors p-6 flex flex-col items-center justify-center text-center rounded-xl">
              <Sparkles className="w-6 h-6 text-indigo-500 mb-2" />
              <span className="text-sm font-bold text-slate-800">IA: Extrair de PDF/Print</span>
              <span className="text-[10px] text-slate-500 mt-1">Gere o esqueleto do orçamento automaticamente.</span>
              <input type="file" className="hidden" accept="image/*,application/pdf" onChange={processarOCR} />
            </label>
          </div>

          {/* TAB MENU */}
          <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
            {tabs.map(t => (
              <button 
                key={t.id} 
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${activeTab === t.id ? 'border-indigo-500 text-indigo-700 bg-indigo-50/30' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* TABS CONTENT */}
            {activeTab === 'geral' && (
              <div className="space-y-4">
                <div><label className="text-[9px] font-bold text-slate-500 uppercase">Agência</label><Input value={geral.agencia} onChange={e => setGeral({...geral, agencia: e.target.value})} className="h-9 text-sm font-bold bg-slate-50 border-slate-200" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-[9px] font-bold text-slate-500 uppercase">Código (Ref)</label><Input value={geral.codigo} onChange={e => setGeral({...geral, codigo: e.target.value})} className="h-9 text-sm font-mono text-indigo-700 bg-slate-50 border-slate-200" /></div>
                  <div><label className="text-[9px] font-bold text-slate-500 uppercase">Cor Primária</label><input type="color" value={geral.cor} onChange={e => setGeral({...geral, cor: e.target.value})} className="h-9 w-full rounded border border-slate-200 p-0.5 cursor-pointer" /></div>
                </div>
                <div><label className="text-[9px] font-bold text-slate-500 uppercase">Agente Responsável</label><Input value={geral.agente} onChange={e => setGeral({...geral, agente: e.target.value})} className="h-9 text-sm bg-slate-50 border-slate-200" placeholder="Nome do Agente" /></div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center"><ImageIcon className="w-5 h-5 text-slate-400" /></div>
                  <div className="flex-1">
                     <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Capa Principal</p>
                     <Button size="sm" variant="outline" className="w-full text-xs h-8">Trocar Imagem</Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pax' && (
              <div className="space-y-4">
                 <div><label className="text-[9px] font-bold text-slate-500 uppercase">Nome do Cliente / Família</label><Input value={passageiros.nome} onChange={e => setPassageiros({...passageiros, nome: e.target.value})} className="h-9 text-sm font-bold bg-slate-50 border-slate-200" /></div>
                 <div className="grid grid-cols-4 gap-2">
                    <div><label className="text-[9px] font-bold text-slate-500 uppercase">ADT</label><Input type="number" value={passageiros.adt} onChange={e => setPassageiros({...passageiros, adt: Number(e.target.value)})} className="h-9 text-center bg-slate-50 border-slate-200" /></div>
                    <div><label className="text-[9px] font-bold text-slate-500 uppercase">SNR</label><Input type="number" value={passageiros.snr} onChange={e => setPassageiros({...passageiros, snr: Number(e.target.value)})} className="h-9 text-center bg-slate-50 border-slate-200" /></div>
                    <div><label className="text-[9px] font-bold text-slate-500 uppercase">CHD</label><Input type="number" value={passageiros.chd} onChange={e => setPassageiros({...passageiros, chd: Number(e.target.value)})} className="h-9 text-center bg-slate-50 border-slate-200" /></div>
                    <div><label className="text-[9px] font-bold text-slate-500 uppercase">INF</label><Input type="number" value={passageiros.inf} onChange={e => setPassageiros({...passageiros, inf: Number(e.target.value)})} className="h-9 text-center bg-slate-50 border-slate-200" /></div>
                 </div>
              </div>
            )}

            {activeTab === 'voos' && (
              <div className="space-y-4">
                 <div className="flex justify-between items-center"><span className="text-[10px] font-bold uppercase text-slate-500">Malha Aérea</span> <Button size="sm" variant="ghost" onClick={() => setVoos([...voos, {cia: '', trecho: '', data: ''}])}><Plus className="w-3 h-3 mr-1"/> Add Voo</Button></div>
                 {voos.map((v, i) => (
                   <div key={i} className="p-3 border border-slate-200 rounded-xl space-y-2 bg-slate-50 relative">
                     <button className="absolute top-2 right-2 text-slate-400 hover:text-red-500" onClick={() => setVoos(voos.filter((_, idx) => idx !== i))}><X className="w-3 h-3" /></button>
                     <Input className="h-8 text-xs font-bold uppercase" placeholder="Cia Aérea (Ex: LATAM)" value={v.cia} onChange={e => {const n=[...voos]; n[i].cia=e.target.value; setVoos(n);}} />
                     <Input className="h-8 text-xs font-mono" placeholder="Trecho (GRU -> CWB)" value={v.trecho} onChange={e => {const n=[...voos]; n[i].trecho=e.target.value; setVoos(n);}} />
                     <Input className="h-8 text-xs" placeholder="Data/Hora" value={v.data} onChange={e => {const n=[...voos]; n[i].data=e.target.value; setVoos(n);}} />
                   </div>
                 ))}
              </div>
            )}
            
            {activeTab === 'hoteis' && (
              <div className="space-y-4">
                 <div className="flex justify-between items-center"><span className="text-[10px] font-bold uppercase text-slate-500">Hospedagem</span> <Button size="sm" variant="ghost" onClick={() => setHoteis([...hoteis, {nome: '', regime: '', checkin: '', checkout: ''}])}><Plus className="w-3 h-3 mr-1"/> Add Hotel</Button></div>
                 {hoteis.map((h, i) => (
                   <div key={i} className="p-3 border border-slate-200 rounded-xl space-y-2 bg-slate-50 relative">
                     <button className="absolute top-2 right-2 text-slate-400 hover:text-red-500" onClick={() => setHoteis(hoteis.filter((_, idx) => idx !== i))}><X className="w-3 h-3" /></button>
                     <Input className="h-8 text-xs font-bold uppercase" placeholder="Nome do Hotel" value={h.nome} onChange={e => {const n=[...hoteis]; n[i].nome=e.target.value; setHoteis(n);}} />
                     <Input className="h-8 text-xs" placeholder="Regime (Ex: All Inclusive)" value={h.regime} onChange={e => {const n=[...hoteis]; n[i].regime=e.target.value; setHoteis(n);}} />
                     <div className="flex gap-2">
                        <Input className="h-8 text-xs" placeholder="Check-in" value={h.checkin} onChange={e => {const n=[...hoteis]; n[i].checkin=e.target.value; setHoteis(n);}} />
                        <Input className="h-8 text-xs" placeholder="Check-out" value={h.checkout} onChange={e => {const n=[...hoteis]; n[i].checkout=e.target.value; setHoteis(n);}} />
                     </div>
                   </div>
                 ))}
              </div>
            )}

            {activeTab === 'fin' && (
               <div className="space-y-4">
                 <div><label className="text-[9px] font-bold text-slate-500 uppercase">Valor Total (R$)</label><Input type="number" className="h-10 text-lg font-black bg-slate-50 border-slate-200 text-indigo-700" placeholder="0.00" /></div>
                 <div><label className="text-[9px] font-bold text-slate-500 uppercase">Max Parcelas Cartão</label><Input type="number" className="h-9 bg-slate-50 border-slate-200" placeholder="10" /></div>
                 <div><label className="text-[9px] font-bold text-slate-500 uppercase">Desconto PIX (%)</label><Input type="number" className="h-9 bg-slate-50 border-slate-200" placeholder="5" /></div>
               </div>
            )}

          </div>
        </aside>

        {/* PREVIEW PANE A4 */}
        <section className="flex-1 bg-slate-200 overflow-y-auto p-10 flex flex-col items-center gap-10 print:p-0 print:bg-white">
             {/* A4 Page Layout (Editorial Flat) */}
             <div className="w-[800px] min-h-[1131px] bg-white shadow-xl flex flex-col relative print:shadow-none print:m-0" style={{borderTop: `8px solid ${geral.cor}`}}>
                <div className="p-16 flex-1 flex flex-col">
                   <div className="flex justify-between items-start mb-16">
                     <div>
                       <h1 className="text-4xl font-black uppercase tracking-tighter" style={{color: geral.cor}}>{geral.agencia}</h1>
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mt-2">PROPOSTA OFICIAL • {geral.codigo || '001'}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-xs font-bold text-slate-800 uppercase">{geral.agente}</p>
                        <p className="text-[10px] font-mono text-slate-500 mt-1">{passageiros.nome || 'A/C Cliente'}</p>
                     </div>
                   </div>

                   {/* Banner Imagem (Placeholder) */}
                   <div className="w-full h-[300px] bg-slate-100 mb-12 rounded flex items-center justify-center text-slate-300">
                      <ImageIcon className="w-16 h-16" />
                   </div>

                   <div className="grid grid-cols-2 gap-10">
                      {voos.length > 0 && (
                        <div>
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-800 mb-4 border-b pb-2">Logística Aérea</h3>
                          {voos.map((v, i) => (
                            <div key={i} className="mb-3">
                               <p className="text-sm font-black uppercase text-indigo-700">{v.cia}</p>
                               <p className="text-xs font-mono font-bold text-slate-700">{v.trecho}</p>
                               <p className="text-[10px] text-slate-500">{v.data}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {hoteis.length > 0 && (
                        <div>
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-800 mb-4 border-b pb-2">Alojamento Premium</h3>
                          {hoteis.map((h, i) => (
                            <div key={i} className="mb-3">
                               <p className="text-sm font-black uppercase text-slate-900">{h.nome}</p>
                               <p className="text-[10px] font-bold text-slate-500 uppercase">{h.regime}</p>
                               <p className="text-[10px] text-slate-500">{h.checkin} — {h.checkout}</p>
                            </div>
                          ))}
                        </div>
                      )}
                   </div>

                   <div className="mt-auto pt-10 border-t border-slate-200">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-800 mb-4">Investimento</h3>
                      <div className="bg-slate-50 p-6 rounded border border-slate-100 flex justify-between items-center">
                         <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Valor do Pacote</p>
                            <p className="text-3xl font-black text-slate-900 tracking-tighter mt-1">R$ 0,00</p>
                         </div>
                         <div className="text-right">
                            <p className="text-xs font-bold text-slate-800">Em até 10x sem juros</p>
                            <p className="text-[10px] font-bold text-green-600 mt-1">5% OFF via PIX</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
        </section>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .print:m-0, .print:m-0 * { visibility: visible; }
          .print:m-0 { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border: none; page-break-after: always; }
        }
      `}} />
    </div>
  );
}
