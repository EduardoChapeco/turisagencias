import React, { useState, useRef } from 'react';
import { Bot, Camera, CheckCircle2, ChevronLeft, ChevronRight, FileText, Plus, Save, Trash2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ==========================================
// TYPES & INITIAL STATE
// ==========================================
type Pagante = {
  nome: string; cpf: string; nascimento: string; telefone: string; 
  email: string; endereco: string; cep: string; profissao: string; 
  rg: string; passaporte: string;
};

type Viajante = {
  nome: string; cpf: string; nascimento: string; rg: string; passaporte: string;
};

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Ccircle cx='12' cy='8' r='4'/%3E%3Cpath d='M12 14c-4.42 0-8 2-8 6v1h16v-1c0-4-3.58-6-8-6z'/%3E%3C/svg%3E";

const OCR_PROMPT = `Você é o Auditor Especialista em OCR da Excelência Tour. Sua função é analisar Contratos de Viagem (Orinter, FRT, etc), Recibos e Vouchers e extrair os dados.
REGRAS DE EXTRAÇÃO CIRÚRGICAS:
1. HIGIENE DE NOMES: O OCR cola palavras. Se ler "VALDECIRONIOMOSKI", corrija.
2. REGRA ANTI-AGÊNCIA: Você NUNCA deve extrair a agência como cliente. IGNORE SUMARIAMENTE os nomes "Evellyn dos Santos", "Evelyn dos Santos", "Excelência Tour" ou a palavra "Faturado".
3. PAGANTES: Mapeie na array "pagantes" apenas os clientes REAIS que compraram o pacote.
4. VIAJANTES/ACOMPANHANTES: Mapeie TODOS os passageiros que vão viajar na array "viajantes".
5. SANITIZAÇÃO TOTAL: NUNCA use as palavras "null", "undefined". Se não encontrou, retorne "".
Retorne ESTRITAMENTE o JSON: { "pagantes": [...], "viajantes": [...] }`;

export function FichaClienteMaster() {
  const { toast } = useToast();
  const { organization, user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viagemState, setViagemState] = useState({ destino: '', data: '', loc: '', fotoB64: DEFAULT_AVATAR });
  const [pagantes, setPagantes] = useState<Pagante[]>([
    { nome: '', cpf: '', nascimento: '', telefone: '', email: '', endereco: '', cep: '', profissao: '', rg: '', passaporte: '' }
  ]);
  const [viajantes, setViajantes] = useState<Viajante[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── FUNÇÕES DE ESTADO ──
  const updatePagante = (index: number, field: keyof Pagante, value: string) => {
    const newP = [...pagantes];
    newP[index][field] = value;
    setPagantes(newP);
  };

  const updateViajante = (index: number, field: keyof Viajante, value: string) => {
    const newV = [...viajantes];
    newV[index][field] = value;
    setViajantes(newV);
  };

  const clearFicha = () => {
    if (confirm("ATENÇÃO: Deseja formatar a ficha e perder todos os dados da tela?")) {
      setPagantes([{ nome: '', cpf: '', nascimento: '', telefone: '', email: '', endereco: '', cep: '', profissao: '', rg: '', passaporte: '' }]);
      setViajantes([]);
      setViagemState({ destino: '', data: '', loc: '', fotoB64: DEFAULT_AVATAR });
      toast({ title: 'Ficha Limpa', description: 'Todos os dados foram apagados.' });
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setViagemState(s => ({ ...s, fotoB64: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  // ── OCR & IA ──
  const handleProcessarOCR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    toast({ title: 'Analisando Documento', description: 'O Agente IA está lendo os dados...' });

    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append('files', f));
      formData.append('prompt', OCR_PROMPT);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado");

      // Roteamento para a Edge Function de IA (Mockado para UI fluida até a edge estar 100%)
      const res = await fetch(`${supabase.supabaseUrl}/functions/v1/ocr-extractor`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData
      });

      if (!res.ok) {
        throw new Error('Falha no motor de IA. Verifique as configurações de OCR no Supabase.');
      }

      const json = await res.json();
      
      if (json.pagantes && json.pagantes.length > 0) setPagantes(json.pagantes);
      if (json.viajantes && json.viajantes.length > 0) setViajantes(json.viajantes);
      
      toast({ title: 'Extração Concluída', description: 'Ficha preenchida automaticamente.' });

    } catch (error: any) {
      toast({ title: 'Erro de OCR', description: error.message, variant: 'destructive' });
      // Fallback Visual
      console.error(error);
    } finally {
      setIsProcessing(false);
      if (e.target) e.target.value = '';
    }
  };

  // ── SALVAR NO SUPABASE ──
  const handleSalvarFicha = async () => {
    const validos = pagantes.filter(p => p.nome.trim());
    if (validos.length === 0) {
      toast({ title: 'Nenhum pagante', description: 'Preencha pelo menos um nome de pagante.', variant: 'destructive' });
      return;
    }
    if (!organization?.id) {
      toast({ title: 'Sem organização', description: 'Faça login novamente.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    let savedCount = 0;

    try {
      // Busca o board de vendas para criar cards
      const { data: board } = await supabase
        .from('kanban_boards')
        .select('id, kanban_columns(id, name, position)')
        .eq('org_id', organization.id)
        .eq('slug', 'sales')
        .single();

      const firstColumn = board?.kanban_columns
        ?.sort((a: any, b: any) => a.position - b.position)?.[0];

      for (const pag of validos) {
        // Verifica se já existe cliente com esse CPF
        const cpfClean = pag.cpf.replace(/\D/g, '');
        let clientId: string | null = null;

        if (cpfClean) {
          const { data: existing } = await supabase
            .from('clients')
            .select('id')
            .eq('org_id', organization.id)
            .eq('cpf', pag.cpf)
            .maybeSingle();
          if (existing) clientId = existing.id;
        }

        if (!clientId) {
          const { data: newClient, error: clientErr } = await supabase
            .from('clients')
            .insert({
              org_id: organization.id,
              name: pag.nome,
              cpf: pag.cpf || null,
              phone: pag.telefone || null,
              email: pag.email || null,
              birth_date: pag.nascimento || null,
              rg: pag.rg || null,
              passport: pag.passaporte || null,
              address: pag.endereco || null,
              zip_code: pag.cep || null,
              profession: pag.profissao || null,
              tags: viagemState.destino ? [viagemState.destino] : [],
            })
            .select('id')
            .single();

          if (clientErr) throw new Error(`Erro ao salvar ${pag.nome}: ${clientErr.message}`);
          clientId = newClient.id;
        }

        // Salva os viajantes adicionais associados a este cliente pagante
        if (clientId && viajantes.length > 0) {
          for (const viaj of viajantes) {
            if (!viaj.nome.trim()) continue;
            const { error: travelerErr } = await supabase
              .from('travelers')
              .insert({
                org_id: organization.id,
                client_id: clientId,
                full_name: viaj.nome,
                cpf: viaj.cpf || null,
                birth_date: viaj.nascimento || null,
                rg: viaj.rg || null,
                passport_number: viaj.passaporte || null,
                relation: 'acompanhante',
                nationality: 'Brasileira'
              });

            if (travelerErr) {
              console.error(`Erro ao salvar acompanhante ${viaj.nome}:`, travelerErr);
            }
          }
        }

        // Cria card no Kanban se tiver board
        if (board?.id && firstColumn?.id) {
          await supabase.from('kanban_cards').insert({
            board_id: board.id,
            column_id: firstColumn.id,
            org_id: organization.id,
            title: pag.nome,
            description: viagemState.destino ? `Viagem: ${viagemState.destino} | ${viagemState.data}` : null,
            client_id: clientId,
            meta: {
              whatsapp: pag.telefone || null,
              email: pag.email || null,
              origin: 'ficha_master_ocr',
            },
          });
        }

        savedCount++;
      }

      toast({
        title: `${savedCount} cliente(s) salvos!`,
        description: board ? 'Fichas salvas e cards criados no Funil de Vendas.' : 'Fichas salvas na base de clientes.',
      });
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // ── PDF A4 via html2canvas + jsPDF ──
  const handleGerarPDF = async () => {
    if (!previewRef.current) return;
    toast({ title: 'Gerando PDF', description: 'Renderizando A4...' });
    try {
      const pages = previewRef.current.querySelectorAll<HTMLElement>('.a4-ficha-page');
      if (pages.length === 0) { window.print(); return; }

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pdfW = pdf.internal.pageSize.getWidth();

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage();
        const canvas = await html2canvas(pages[i], { scale: 2, useCORS: true, backgroundColor: '#fff' });
        const imgH = (canvas.height * pdfW) / canvas.width;
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pdfW, imgH);
      }

      pdf.save(`FichaCliente_${pagantes[0]?.nome || 'Excelencia'}.pdf`);
      toast({ title: 'PDF Gerado!', description: 'Arquivo baixado com sucesso.' });
    } catch (e: any) {
      toast({ title: 'Erro no PDF', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden" ref={containerRef}>
      
      {/* HEADER MASTER (SaaS Flat) */}
      <header className="h-[75px] bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-black text-base text-slate-900 tracking-tight">Ficha de Clientes (Base Master)</h1>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Excelência Tour • Enterprise 11</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="bg-slate-50 text-slate-700 h-10 px-4 rounded-xl font-bold">
            {isSidebarOpen ? <><ChevronLeft className="mr-2 h-4 w-4" /> Ocultar Editor</> : <><ChevronRight className="mr-2 h-4 w-4" /> Mostrar Editor</>}
          </Button>

          <label className="flex items-center justify-center bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 h-10 px-4 rounded-xl cursor-pointer font-bold text-sm transition-colors">
            <input type="file" className="hidden" multiple accept="application/pdf,image/*" onChange={handleProcessarOCR} disabled={isProcessing} />
            {isProcessing ? <span className="animate-pulse">Processando IA...</span> : <><Bot className="mr-2 h-4 w-4" /> LER DOCUMENTOS OCR</>}
          </label>

          <Button
            onClick={handleSalvarFicha}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-5 rounded-xl font-bold shadow-sm"
          >
            {isSaving ? <span className="animate-pulse">Salvando...</span> : <><Save className="mr-2 h-4 w-4" /> SALVAR FICHA</>}
          </Button>

          <Button onClick={handleGerarPDF} className="bg-slate-900 hover:bg-black text-white h-10 px-6 rounded-xl font-bold shadow-sm">
            <FileText className="mr-2 h-4 w-4 text-red-400" /> BAIXAR PDF A4
          </Button>
        </div>
      </header>

      {/* WORKSPACE */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* SIDEBAR CMS (FLAT DESIGN) */}
        <aside className={`transition-all duration-300 bg-white border-r border-slate-200 flex flex-col z-10 ${isSidebarOpen ? 'w-[480px]' : 'w-0 opacity-0 overflow-hidden'}`}>
          
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex gap-3">
            <label className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 p-2 cursor-pointer rounded-xl hover:bg-slate-50 transition-colors">
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              <Camera className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Anexar Foto Titular</span>
            </label>
            <Button variant="outline" onClick={clearFicha} className="w-10 h-10 bg-red-50 text-red-500 border-red-100 hover:bg-red-500 hover:text-white rounded-xl p-0 shrink-0" title="Zerar Ficha">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-6 space-y-8 flex-1 overflow-y-auto no-scrollbar pb-32">
            
            {/* Viagem Compartilhada */}
            <section className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h2 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-4">Operação Logística</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] uppercase text-slate-500 font-bold mb-1 block">Destino / Pacote Contratado</label>
                  <Input className="h-10 text-sm font-bold uppercase rounded-xl border-slate-200 bg-white" value={viagemState.destino} onChange={e => setViagemState(s => ({...s, destino: e.target.value}))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase text-slate-500 font-bold mb-1 block">Datas da Viagem</label>
                    <Input className="h-10 text-xs font-mono rounded-xl border-slate-200 bg-white" value={viagemState.data} onChange={e => setViagemState(s => ({...s, data: e.target.value}))} />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase text-slate-500 font-bold mb-1 block">Localizador</label>
                    <Input className="h-10 text-sm font-black text-indigo-700 uppercase rounded-xl border-slate-200 bg-white" value={viagemState.loc} onChange={e => setViagemState(s => ({...s, loc: e.target.value}))} />
                  </div>
                </div>
              </div>
            </section>

            {/* Pagantes */}
            <section>
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                <h2 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Compradores / Pagantes</h2>
                <Button size="sm" variant="ghost" className="h-6 px-3 text-[9px] bg-slate-900 text-white rounded hover:bg-black" onClick={() => setPagantes([...pagantes, { nome: '', cpf: '', nascimento: '', telefone: '', email: '', endereco: '', cep: '', profissao: '', rg: '', passaporte: '' }])}>
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>
              
              <div className="space-y-4">
                {pagantes.map((pag, i) => (
                  <div key={i} className="p-5 bg-white border border-slate-200 rounded-2xl relative">
                    {i > 0 && <button className="absolute top-4 right-4 text-slate-300 hover:text-red-500" onClick={() => setPagantes(pagantes.filter((_, idx) => idx !== i))}><XCircle className="w-4 h-4" /></button>}
                    <h3 className="text-[10px] font-black text-slate-800 mb-3">PAGANTE #{i+1}</h3>
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-12"><Input className="h-9 text-[11px] uppercase font-bold border-slate-200" placeholder="NOME COMPLETO" value={pag.nome} onChange={e => updatePagante(i, 'nome', e.target.value)} /></div>
                      <div className="col-span-6"><Input className="h-9 text-[10px] font-mono border-slate-200" placeholder="CPF" value={pag.cpf} onChange={e => updatePagante(i, 'cpf', e.target.value)} /></div>
                      <div className="col-span-6"><Input className="h-9 text-[10px] font-mono border-slate-200" placeholder="NASCIMENTO" value={pag.nascimento} onChange={e => updatePagante(i, 'nascimento', e.target.value)} /></div>
                      <div className="col-span-6"><Input className="h-9 text-[10px] font-mono text-emerald-700 border-slate-200" placeholder="WHATSAPP" value={pag.telefone} onChange={e => updatePagante(i, 'telefone', e.target.value)} /></div>
                      <div className="col-span-6"><Input className="h-9 text-[10px] lowercase border-slate-200" placeholder="E-MAIL" value={pag.email} onChange={e => updatePagante(i, 'email', e.target.value)} /></div>
                      <div className="col-span-12"><Input className="h-9 text-[10px] uppercase border-slate-200" placeholder="ENDEREÇO RESIDENCIAL" value={pag.endereco} onChange={e => updatePagante(i, 'endereco', e.target.value)} /></div>
                      <div className="col-span-4"><Input className="h-9 text-[10px] font-mono border-slate-200" placeholder="CEP" value={pag.cep} onChange={e => updatePagante(i, 'cep', e.target.value)} /></div>
                      <div className="col-span-4"><Input className="h-9 text-[10px] font-mono border-slate-200" placeholder="RG" value={pag.rg} onChange={e => updatePagante(i, 'rg', e.target.value)} /></div>
                      <div className="col-span-4"><Input className="h-9 text-[10px] uppercase text-blue-700 border-slate-200" placeholder="PASSAPORTE" value={pag.passaporte} onChange={e => updatePagante(i, 'passaporte', e.target.value)} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Viajantes */}
            <section>
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                <h2 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Viajantes Adicionais</h2>
                <Button size="sm" variant="ghost" className="h-6 px-3 text-[9px] bg-slate-900 text-white rounded hover:bg-black" onClick={() => setViajantes([...viajantes, { nome: '', cpf: '', nascimento: '', rg: '', passaporte: '' }])}>
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>
              
              {viajantes.length === 0 ? (
                 <p className="text-xs text-slate-400 italic">Nenhum passageiro. A IA preencherá automaticamente.</p>
              ) : (
                <div className="space-y-3">
                  {viajantes.map((v, i) => (
                    <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl relative group">
                      <button className="absolute top-3 right-3 text-slate-300 hover:text-red-500" onClick={() => setViajantes(viajantes.filter((_, idx) => idx !== i))}><XCircle className="w-4 h-4" /></button>
                      <div className="space-y-2 pr-6">
                        <Input className="h-8 text-[11px] uppercase font-bold border-slate-200" placeholder="NOME DO PASSAGEIRO" value={v.nome} onChange={e => updateViajante(i, 'nome', e.target.value)} />
                        <div className="grid grid-cols-2 gap-2">
                          <Input className="h-8 text-[10px] font-mono border-slate-200" placeholder="CPF" value={v.cpf} onChange={e => updateViajante(i, 'cpf', e.target.value)} />
                          <Input className="h-8 text-[10px] font-mono border-slate-200" placeholder="NASCIMENTO" value={v.nascimento} onChange={e => updateViajante(i, 'nascimento', e.target.value)} />
                          <Input className="h-8 text-[10px] font-mono border-slate-200" placeholder="RG" value={v.rg} onChange={e => updateViajante(i, 'rg', e.target.value)} />
                          <Input className="h-8 text-[10px] font-mono uppercase text-blue-600 border-slate-200" placeholder="PASSAPORTE" value={v.passaporte} onChange={e => updateViajante(i, 'passaporte', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>
        </aside>

        {/* PREVIEW PANE */}
        <section className="flex-1 bg-slate-200 overflow-y-auto p-10 flex flex-col items-center gap-10">
           <div ref={previewRef} className="flex flex-col items-center gap-10 w-full">
           {pagantes.filter(p => p.nome || p.cpf).map((pag, i) => (
             <div key={`pag-${i}`} className="a4-ficha-page bg-white w-[800px] h-[1131px] p-16 shadow-xl shrink-0 flex flex-col border border-slate-200 relative">
                <div className="border-b-2 border-black pb-4 mb-8 flex justify-between items-end">
                  <div>
                    <h1 className="text-[26px] font-black uppercase text-black leading-none tracking-tighter">Excelência Tour</h1>
                    <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] mt-1">FICHA CADASTRAL B2C • PAGANTE #{i+1}</p>
                  </div>
                  <div className="text-[11px] font-black text-indigo-600 font-mono">EMISSÃO: {new Date().toLocaleDateString()}</div>
                </div>

                <div className="flex gap-8 mb-8">
                  <div className="w-[110px] h-[135px] border-2 border-black rounded shrink-0 bg-slate-50 overflow-hidden">
                    <img src={viagemState.fotoB64} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-black text-white text-[11px] font-black uppercase tracking-[0.15em] px-3 py-1.5 inline-block rounded mb-4">Dados do Contratante (Comprador)</div>
                    <div className="grid grid-cols-12 gap-y-2 gap-x-4">
                       <div className="col-span-12"><p className="text-[8px] uppercase text-slate-500 font-bold mb-0.5">Nome Completo</p><p className="text-[20px] font-black text-black border-b border-slate-200 pb-1">{pag.nome || '...'}</p></div>
                       <div className="col-span-4"><p className="text-[8px] uppercase text-slate-500 font-bold mb-0.5">C.P.F.</p><p className="text-sm font-bold font-mono border-b border-slate-200 pb-1">{pag.cpf || '...'}</p></div>
                       <div className="col-span-4"><p className="text-[8px] uppercase text-slate-500 font-bold mb-0.5">Data Nasc.</p><p className="text-sm font-bold font-mono border-b border-slate-200 pb-1">{pag.nascimento || '...'}</p></div>
                       <div className="col-span-4"><p className="text-[8px] uppercase text-slate-500 font-bold mb-0.5">Profissão</p><p className="text-sm font-bold uppercase border-b border-slate-200 pb-1">{pag.profissao || '...'}</p></div>
                       <div className="col-span-12"><p className="text-[8px] uppercase text-slate-500 font-bold mb-0.5">Endereço Completo</p><p className="text-[12px] font-bold uppercase border-b border-slate-200 pb-1">{pag.endereco || '...'}</p></div>
                       <div className="col-span-6"><p className="text-[8px] uppercase text-slate-500 font-bold mb-0.5">E-mail</p><p className="text-[12px] font-bold border-b border-slate-200 pb-1">{pag.email || '...'}</p></div>
                       <div className="col-span-6"><p className="text-[8px] uppercase text-slate-500 font-bold mb-0.5">WhatsApp</p><p className="text-[14px] font-bold font-mono text-emerald-700 border-b border-slate-200 pb-1">{pag.telefone || '...'}</p></div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto border-t border-black pt-4 text-center text-[9px] font-bold text-slate-500">
                  DOCUMENTO CONFIDENCIAL PROTEGIDO PELA LEI GERAL DE PROTEÇÃO DE DADOS (LGPD).<br/>GERADO VIA PLATAFORMA CENTRAL EXCELÊNCIA TOUR.
                </div>
             </div>
           ))}

           {viajantes.filter(v => v.nome || v.cpf).length > 0 && (
             <div className="a4-ficha-page bg-white w-[800px] h-[1131px] p-16 shadow-xl shrink-0 flex flex-col border border-slate-200 relative">
                <div className="border-b-2 border-black pb-4 mb-8 flex justify-between items-end">
                  <div>
                    <h1 className="text-[26px] font-black uppercase text-black leading-none tracking-tighter">Excelência Tour</h1>
                    <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] mt-1">FICHA DE VIAJANTES • LISTA DE EMBARQUE</p>
                  </div>
                </div>

                <div className="flex-1">
                   <div className="bg-black text-white text-[11px] font-black uppercase tracking-[0.15em] px-3 py-1.5 inline-block rounded mb-6">Passageiros Vinculados</div>
                   {viajantes.filter(v => v.nome || v.cpf).map((v, idx) => (
                      <div key={idx} className="border-2 border-black rounded p-4 mb-4">
                         <div className="text-[8px] uppercase font-black text-indigo-600 mb-1">Passageiro #{idx+1}</div>
                         <div className="text-xl font-black uppercase mb-3 leading-none">{v.nome || '...'}</div>
                         <div className="grid grid-cols-4 gap-4">
                           <div><p className="text-[8px] uppercase text-slate-500 font-bold mb-0.5">CPF</p><p className="text-sm font-bold font-mono">{v.cpf || '...'}</p></div>
                           <div><p className="text-[8px] uppercase text-slate-500 font-bold mb-0.5">Nascimento</p><p className="text-sm font-bold font-mono">{v.nascimento || '...'}</p></div>
                           <div><p className="text-[8px] uppercase text-slate-500 font-bold mb-0.5">RG</p><p className="text-sm font-bold font-mono">{v.rg || '...'}</p></div>
                           <div><p className="text-[8px] uppercase text-slate-500 font-bold mb-0.5 text-blue-600">Passaporte</p><p className="text-sm font-bold font-mono text-blue-800">{v.passaporte || '...'}</p></div>
                         </div>
                      </div>
                   ))}
                </div>

                <div className="mt-auto border-t border-black pt-4 text-center text-[9px] font-bold text-slate-500">
                  DOCUMENTO CONFIDENCIAL. OS DADOS DEVEM CONFERIR COM O VOUCHER ORIGINAL DE EMBARQUE.
                </div>
             </div>
           )}
           </div>
        </section>
      </main>
    </div>
  );
}
