import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useProposal, useUpdateProposal, useProposalVersions } from '@/hooks/useProposals';
import { 
 ArrowLeft, Save, Eye, FileText, Send, Share2, 
 Plus, Trash2, ArrowUp, ArrowDown, ChevronRight,
 User, CheckCircle, Clock, Loader2, Sparkles, Image as ImageIcon,
 ZoomIn, ZoomOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { supabase } from '@/integrations/supabase/client';

export default function ProposalEditor() {
 const { id } = useParams<{ id: string }>();
 const navigate = useNavigate();
 const { toast } = useToast();
 
 const { data: proposal, isLoading } = useProposal(id || '');
 const { data: versions, refetch: refetchVersions } = useProposalVersions(id || '');
 const updateProposalMut = useUpdateProposal();

 // Estados locais para edição reativa
 const [title, setTitle] = useState('');
 const [destination, setDestination] = useState('');
 const [clientId, setClientId] = useState<string | null>(null);
 const [status, setStatus] = useState<any>('draft');
 const [blocks, setBlocks] = useState<any[]>([]);
 
 // Controle de edição
 const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
 const [isDirty, setIsDirty] = useState(false);
 const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved'>('idle');
 const [zoom, setZoom] = useState(1.0);
 const [clients, setClients] = useState<any[]>([]);

 // Carregar dados na montagem
 useEffect(() => {
 if (proposal) {
 setTitle(proposal.title);
 setDestination(proposal.destination || '');
 setClientId(proposal.client_id);
 setStatus(proposal.status);
 setBlocks(proposal.content_schema || []);
 
 if (proposal.content_schema && proposal.content_schema.length > 0 && !selectedBlockId) {
 setSelectedBlockId(proposal.content_schema[0].id);
 }
 }
 }, [proposal]);

 // Carregar clientes da agência para vincular
 useEffect(() => {
 const fetchClients = async () => {
 const { data } = await supabase
 .from('clients')
 .select('id, name, email')
 .order('name', { ascending: true });
 if (data) setClients(data);
 };
 fetchClients();
 }, []);

 // Proteger contra recarregamento acidental se houver dados pendentes
 useUnsavedChangesGuard(isDirty);

 // Autosave Debounce (3 segundos)
 const timerRef = useRef<any>(null);
 useEffect(() => {
 if (!proposal || !isDirty) return;

 if (timerRef.current) clearTimeout(timerRef.current);
 
 setSavingState('saving');
 timerRef.current = setTimeout(async () => {
 try {
 await updateProposalMut.mutateAsync({
 id: proposal.id,
 updates: {
 title,
 destination,
 client_id: clientId,
 status,
 content_schema: blocks
 },
 createVersion: false // Não polui a tabela com micro-versões de autosave
 });
 setIsDirty(false);
 setSavingState('saved');
 setTimeout(() => setSavingState('idle'), 1500);
 } catch (err) {
 console.error(err);
 setSavingState('idle');
 }
 }, 3000);

 return () => { if (timerRef.current) clearTimeout(timerRef.current); };
 }, [title, destination, clientId, status, blocks, isDirty, proposal]);

 // Forçar salvamento manual + Criar versão persistente com Snapshot
 const handleManualSave = async () => {
 if (!proposal) return;
 setSavingState('saving');
 try {
 await updateProposalMut.mutateAsync({
 id: proposal.id,
 updates: {
 title,
 destination,
 client_id: clientId,
 status,
 content_schema: blocks
 },
 createVersion: true // Cria snapshot real no banco de dados
 });
 setIsDirty(false);
 setSavingState('saved');
 refetchVersions();
 toast({ title: '✅ Versão salva e snapshot criado!', description: 'Você pode reverter para esta versão no CMS a qualquer momento.' });
 setTimeout(() => setSavingState('idle'), 2000);
 } catch (err: any) {
 toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
 setSavingState('idle');
 }
 };

 // Reordenação de blocos no editor
 const moveBlock = (index: number, direction: 'up' | 'down') => {
 const nextIndex = direction === 'up' ? index - 1 : index + 1;
 if (nextIndex < 0 || nextIndex >= blocks.length) return;

 const copy = [...blocks];
 const temp = copy[index];
 copy[index] = copy[nextIndex];
 copy[nextIndex] = temp;

 setBlocks(copy);
 setIsDirty(true);
 };

 const removeBlock = (id: string) => {
 if (confirm('Deseja mesmo remover esta seção da proposta?')) {
 const filtered = blocks.filter(b => b.id !== id);
 setBlocks(filtered);
 if (selectedBlockId === id) {
 setSelectedBlockId(filtered[0]?.id || null);
 }
 setIsDirty(true);
 }
 };

 const addBlock = (type: string) => {
 const newBlock = {
 id: `${type}-${Date.now()}`,
 type,
 name: `Nova Seção ${type.toUpperCase()}`,
 settings: type === 'hero' ? { title: 'Nova Capa', subtitle: '', image_url: '' } :
 type === 'hotel' ? { hotels: [] } :
 type === 'flight' ? { flights: [] } :
 type === 'itinerary' ? { days: [] } :
 type === 'pricing' ? { price: 0, currency: 'BRL', installments: '' } :
 { items: [] }
 };

 setBlocks([...blocks, newBlock]);
 setSelectedBlockId(newBlock.id);
 setIsDirty(true);
 };

 // Alterações de propriedades dos blocos (Direita)
 const updateBlockSettings = (blockId: string, key: string, val: any) => {
 const copy = blocks.map(b => {
 if (b.id === blockId) {
 return { ...b, settings: { ...b.settings, [key]: val } };
 }
 return b;
 });
 setBlocks(copy);
 setIsDirty(true);
 };

 if (isLoading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-zinc-950">
 <Loader2 className="w-8 h-8 text-vj-green animate-spin" />
 </div>
 );
 }

 if (!proposal) {
 return (
 <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white">
 <h2 className="text-xl font-bold">Proposta não encontrada</h2>
 <Button onClick={() => navigate('/proposals')} className="mt-4">Voltar</Button>
 </div>
 );
 }

 const selectedBlock = blocks.find(b => b.id === selectedBlockId);

 return (
 <AppLayout>
 <div className="flex flex-col h-[calc(100vh-120px)] border border-zinc-100 rounded-2xl bg-white overflow-hidden max-w-[1700px] mx-auto">
 
 {/* TOP BAR */}
 <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 shrink-0 gap-4 flex-wrap">
 <div className="flex items-center gap-3">
 <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent" onClick={() => navigate('/proposals')}>
 <ArrowLeft className="w-5 h-5 text-zinc-600 hover:text-zinc-950" />
 </Button>
 <div className="min-w-0">
 <input 
 value={title} 
 onChange={e => { setTitle(e.target.value); setIsDirty(true); }}
 className="font-bold text-lg text-zinc-950 bg-transparent border-none focus:outline-none focus:ring-0 w-full p-0 h-6"
 />
 <span className="text-[10px] text-zinc-400 font-medium">Status: {status}</span>
 </div>
 </div>

 <div className="flex items-center gap-3 flex-wrap">
 {/* Status Saving Indicator */}
 {savingState === 'saving' && (
 <span className="text-xs text-zinc-400 flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvando...</span>
 )}
 {savingState === 'saved' && (
 <span className="text-xs text-vj-green flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Salvo</span>
 )}

 {/* Zoom Controls */}
 <div className="flex items-center gap-1 bg-zinc-100 border border-zinc-200 p-1 rounded-xl no-print">
 <Button 
 variant="ghost" 
 size="icon" 
 className="h-7 w-7 rounded-lg text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200" 
 onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
 title="Diminuir Zoom"
 >
 <ZoomOut className="w-3.5 h-3.5" />
 </Button>
 <span className="text-[10px] font-bold px-1.5 min-w-[36px] text-center text-zinc-600">
 {Math.round(zoom * 100)}%
 </span>
 <Button 
 variant="ghost" 
 size="icon" 
 className="h-7 w-7 rounded-lg text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200" 
 onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}
 title="Aumentar Zoom"
 >
 <ZoomIn className="w-3.5 h-3.5" />
 </Button>
 </div>

 <Select value={status} onValueChange={(val) => { setStatus(val); setIsDirty(true); }}>
 <SelectTrigger className="w-36 h-9 text-xs">
 <SelectValue placeholder="Status" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="draft">Rascunho</SelectItem>
 <SelectItem value="sent">Enviada</SelectItem>
 <SelectItem value="viewed">Visualizada</SelectItem>
 <SelectItem value="accepted">Aceita</SelectItem>
 <SelectItem value="rejected">Recusada</SelectItem>
 <SelectItem value="archived">Arquivada</SelectItem>
 </SelectContent>
 </Select>

 {proposal.status !== 'draft' && (
 <Button 
 variant="outline" 
 size="sm" 
 className="h-9 gap-1.5 text-xs font-semibold"
 onClick={() => navigate(`/p/${proposal.public_token}`)}
 >
 <Eye className="w-4 h-4" /> WebView
 </Button>
 )}

 <Button 
 size="sm" 
 className="bg-vj-green text-white hover:bg-vj-green/90 font-bold gap-1.5 h-9"
 onClick={handleManualSave}
 >
 <Save className="w-4 h-4" /> Salvar Versão
 </Button>
 </div>
 </div>

 {/* WORKSPACE: LEFT (SECTIONS), CENTER (CANVAS), RIGHT (PROPERTIES) */}
 <div className="flex-1 flex overflow-hidden">
 
 {/* COLUNA ESQUERDA: LISTA DE SEÇÕES */}
 <div className="w-64 border-r border-zinc-100 flex flex-col justify-between shrink-0 bg-zinc-50/30 overflow-y-auto">
 <div className="p-4 space-y-4">
 <div className="flex justify-between items-center">
 <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Seções Visuais</span>
 <span className="text-[10px] text-zinc-400 font-bold">{blocks.length} blocos</span>
 </div>

 <div className="space-y-1.5">
 {blocks.map((b, index) => {
 const isSelected = b.id === selectedBlockId;
 return (
 <div 
 key={b.id}
 onClick={() => setSelectedBlockId(b.id)}
 className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer group transition-all ${
 isSelected 
 ? 'border-vj-green bg-vj-green/5 text-vj-green' 
 : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
 }`}
 >
 <div className="min-w-0">
 <p className="text-xs font-bold truncate leading-none mb-1">{b.name}</p>
 <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{b.type}</span>
 </div>
 
 {/* Controles de reordenação */}
 <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
 <button 
 onClick={(e) => { e.stopPropagation(); moveBlock(index, 'up'); }}
 disabled={index === 0}
 className="p-0.5 text-zinc-400 hover:text-zinc-950 disabled:opacity-30"
 >
 <ArrowUp className="w-3.5 h-3.5" />
 </button>
 <button 
 onClick={(e) => { e.stopPropagation(); moveBlock(index, 'down'); }}
 disabled={index === blocks.length - 1}
 className="p-0.5 text-zinc-400 hover:text-zinc-950 disabled:opacity-30"
 >
 <ArrowDown className="w-3.5 h-3.5" />
 </button>
 <button 
 onClick={(e) => { e.stopPropagation(); removeBlock(b.id); }}
 className="p-0.5 text-zinc-400 hover:text-rose-600"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* Inserir Novas Seções */}
 <div className="p-4 border-t border-zinc-100 bg-white space-y-2">
 <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-1">Adicionar Bloco</span>
 <div className="grid grid-cols-2 gap-1.5">
 {['hero', 'itinerary', 'hotel', 'flight', 'pricing', 'inclusions'].map((t) => (
 <Button 
 key={t}
 variant="outline" 
 size="sm" 
 className="h-8 text-[10px] font-bold capitalize border-zinc-200"
 onClick={() => addBlock(t)}
 >
 + {t}
 </Button>
 ))}
 </div>
 </div>
 </div>

 {/* CANVAS CENTRAL: VISUALIZAÇÃO DA PROPOSTA */}
 <div className="flex-1 bg-zinc-100 p-8 flex justify-center items-start overflow-auto">
 <div 
 style={{ zoom }}
 className="w-[794px] shrink-0 bg-white rounded-3xl overflow-hidden border border-zinc-200 min-h-[1123px] flex flex-col justify-between"
 >
 
 <div className="space-y-8">
 {/* Seções Renderizadas no Canvas */}
 {blocks.map((b) => {
 const isSelected = b.id === selectedBlockId;
 return (
 <div 
 key={b.id}
 onClick={() => setSelectedBlockId(b.id)}
 className={`relative group border-2 ${
 isSelected 
 ? 'border-vj-green' 
 : 'border-transparent hover:border-zinc-200'
 }`}
 >
 {/* Render do Bloco de acordo com o Tipo */}
 {b.type === 'hero' && (
 <div className="relative h-64 bg-zinc-950 flex items-end p-8 text-white">
 {b.settings.image_url && (
 <img 
 src={b.settings.image_url} 
 crossOrigin="anonymous"
 className="absolute inset-0 w-full h-full object-cover opacity-60"
 alt="Destino" 
 />
 )}
 <div className="relative z-10 space-y-2">
 <h2 className="text-3xl font-black">{b.settings.title || 'Sua Próxima Viagem'}</h2>
 <p className="text-sm font-semibold text-zinc-300">{b.settings.subtitle || 'Condições e Roteiro Completo'}</p>
 </div>
 </div>
 )}

 {b.type === 'itinerary' && (
 <div className="p-8 space-y-4">
 <h3 className="font-bold text-lg text-zinc-900 border-b border-zinc-100 pb-2">{b.name}</h3>
 <div className="space-y-4">
 {b.settings.days?.map((d: any, idx: number) => (
 <div key={idx} className="flex gap-4 items-start">
 <span className="h-6 w-6 rounded-full bg-vj-green/10 text-vj-green font-bold text-xs flex items-center justify-center shrink-0">
 {d.day}
 </span>
 <div>
 <p className="text-sm font-bold text-zinc-900">{d.title}</p>
 <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{d.description}</p>
 </div>
 </div>
 ))}
 {(!b.settings.days || b.settings.days.length === 0) && (
 <p className="text-xs text-zinc-400 italic">Roteiro diário não detalhado ainda.</p>
 )}
 </div>
 </div>
 )}

 {b.type === 'hotel' && (
 <div className="p-8 space-y-4">
 <h3 className="font-bold text-lg text-zinc-900 border-b border-zinc-100 pb-2">{b.name}</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {b.settings.hotels?.map((h: any, idx: number) => (
 <div key={idx} className="p-4 rounded-2xl border border-zinc-100 bg-zinc-50 space-y-2">
 <p className="text-sm font-bold text-zinc-900">{h.name}</p>
 <div className="text-amber-500 text-xs font-semibold">{'★'.repeat(h.stars || 4)}</div>
 <p className="text-xs text-zinc-600 leading-normal">{h.description}</p>
 </div>
 ))}
 {(!b.settings.hotels || b.settings.hotels.length === 0) && (
 <p className="text-xs text-zinc-400 italic">Nenhum hotel cadastrado.</p>
 )}
 </div>
 </div>
 )}

 {b.type === 'pricing' && (
 <div className="p-8 bg-zinc-950 text-white space-y-4">
 <h3 className="font-bold text-lg border-b border-zinc-800 pb-2 text-vj-green">{b.name}</h3>
 <div className="flex justify-between items-baseline gap-2">
 <span className="text-xs font-semibold text-zinc-400">Total do Pacote:</span>
 <span className="text-2xl font-black text-vj-green">
 {b.settings.currency || 'BRL'} {b.settings.price ? new Intl.NumberFormat('pt-BR').format(b.settings.price) : '0,00'}
 </span>
 </div>
 <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
 <p className="text-[9px] font-black uppercase text-zinc-400">Condições de Parcelamento:</p>
 <p className="text-xs text-zinc-300 leading-snug">{b.settings.installments || 'Consulte parcelamento.'}</p>
 </div>
 </div>
 )}

 {/* Bloco padrão Inclusões */}
 {['inclusions', 'exclusions'].includes(b.type) && (
 <div className="p-8 space-y-4">
 <h3 className="font-bold text-lg text-zinc-900 border-b border-zinc-100 pb-2">{b.name}</h3>
 <ul className="space-y-2">
 {b.settings.items?.map((item: string, idx: number) => (
 <li key={idx} className="flex gap-2 items-center text-xs text-zinc-700 font-medium">
 <span className={`h-2 w-2 rounded-full shrink-0 ${b.type === 'inclusions' ? 'bg-vj-green' : 'bg-rose-500'}`} />
 <span>{item}</span>
 </li>
 ))}
 {(!b.settings.items || b.settings.items.length === 0) && (
 <p className="text-xs text-zinc-400 italic">Lista de serviços vazia.</p>
 )}
 </ul>
 </div>
 )}
 </div>
 );
 })}
 </div>

 {/* WebView Footer / Contact details */}
 <div className="p-8 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
 <span>Proposta preparada para consultoria comercial</span>
 <span className="font-bold text-zinc-800">Turis Agências B2B</span>
 </div>
 </div>
 </div>

 {/* COLUNA DIREITA: PROPRIEDADES DA SEÇÃO SELECIONADA */}
 <div className="w-80 border-l border-zinc-100 flex flex-col justify-between shrink-0 bg-white overflow-y-auto">
 <div className="p-4 space-y-6">
 
 {/* Vínculo de Cliente & Configurações da Proposta */}
 <div className="space-y-3 pb-4 border-b border-zinc-100">
 <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1">
 <User className="w-3.5 h-3.5" /> Cliente Vinculado
 </span>
 <Select 
 value={clientId || 'null'} 
 onValueChange={(val) => { setClientId(val === 'null' ? null : val); setIsDirty(true); }}
 >
 <SelectTrigger className="w-full h-10 text-xs">
 <SelectValue placeholder="Sem cliente vinculado" />
 </SelectTrigger>
 <SelectContent className="bg-white">
 <SelectItem value="null">Nenhum cliente</SelectItem>
 {clients.map(c => (
 <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
 ))}
 </SelectContent>
 </Select>

 <div className="space-y-1.5 pt-2">
 <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Destino de Viagem</span>
 <Input 
 value={destination} 
 onChange={e => { setDestination(e.target.value); setIsDirty(true); }}
 placeholder="Ex: Buenos Aires, Gramado"
 className="h-9 text-xs"
 />
 </div>
 </div>

 {/* Seção Selecionada */}
 {selectedBlock ? (
 <div className="space-y-4">
 <div className="flex justify-between items-center">
 <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest text-vj-green border-vj-green/20 bg-vj-green/5">
 Editar {selectedBlock.type}
 </Badge>
 <span className="text-[10px] text-zinc-400 font-mono">ID: {selectedBlock.id.substring(0, 6)}</span>
 </div>

 <div className="space-y-3">
 <div className="space-y-1">
 <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Nome da Seção</span>
 <Input 
 value={selectedBlock.name} 
 onChange={(e) => {
 const copy = blocks.map(b => b.id === selectedBlock.id ? { ...b, name: e.target.value } : b);
 setBlocks(copy);
 setIsDirty(true);
 }}
 className="h-9 text-xs font-semibold"
 />
 </div>

 {/* Propriedades do HERO */}
 {selectedBlock.type === 'hero' && (
 <div className="space-y-3 pt-2">
 <div className="space-y-1">
 <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Título da Capa</span>
 <Input 
 value={selectedBlock.settings.title || ''}
 onChange={(e) => updateBlockSettings(selectedBlock.id, 'title', e.target.value)}
 className="h-9 text-xs"
 />
 </div>
 <div className="space-y-1">
 <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Subtítulo</span>
 <Input 
 value={selectedBlock.settings.subtitle || ''}
 onChange={(e) => updateBlockSettings(selectedBlock.id, 'subtitle', e.target.value)}
 className="h-9 text-xs"
 />
 </div>
 <div className="space-y-1">
 <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Imagem de Fundo URL</span>
 <Input 
 value={selectedBlock.settings.image_url || ''}
 onChange={(e) => updateBlockSettings(selectedBlock.id, 'image_url', e.target.value)}
 placeholder="https://images.unsplash.com/..."
 className="h-9 text-xs font-mono"
 />
 </div>
 </div>
 )}

 {/* Propriedades do PREÇO */}
 {selectedBlock.type === 'pricing' && (
 <div className="space-y-3 pt-2">
 <div className="space-y-1">
 <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Preço do Pacote</span>
 <Input 
 type="number"
 value={String(selectedBlock.settings.price || '')}
 onChange={(e) => updateBlockSettings(selectedBlock.id, 'price', Number(e.target.value))}
 className="h-9 text-xs font-bold text-vj-green"
 />
 </div>
 <div className="space-y-1">
 <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Moeda</span>
 <Input 
 value={selectedBlock.settings.currency || 'BRL'}
 onChange={(e) => updateBlockSettings(selectedBlock.id, 'currency', e.target.value)}
 className="h-9 text-xs"
 />
 </div>
 <div className="space-y-1">
 <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Parcelas e Condições</span>
 <Textarea 
 value={selectedBlock.settings.installments || ''}
 onChange={(e) => updateBlockSettings(selectedBlock.id, 'installments', e.target.value)}
 rows={3}
 className="text-xs"
 />
 </div>
 </div>
 )}

 {/* Propriedades de ROTEIRO (itinerary) */}
 {selectedBlock.type === 'itinerary' && (
 <div className="space-y-3 pt-2">
 <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Dias do Roteiro</span>
 <div className="max-h-56 overflow-y-auto space-y-3 p-2 rounded-xl bg-zinc-50 border border-zinc-100">
 {selectedBlock.settings.days?.map((day: any, idx: number) => (
 <div key={idx} className="p-2.5 rounded-lg border border-zinc-200 bg-white space-y-2 relative">
 <span className="text-[9px] font-black text-vj-green uppercase">Dia {day.day}</span>
 <Input 
 value={day.title || ''}
 placeholder="Cidade/Atividade"
 onChange={(e) => {
 const list = [...(selectedBlock.settings.days || [])];
 list[idx].title = e.target.value;
 updateBlockSettings(selectedBlock.id, 'days', list);
 }}
 className="h-7 text-xs font-bold"
 />
 <Textarea 
 value={day.description || ''}
 placeholder="Descrição do roteiro..."
 onChange={(e) => {
 const list = [...(selectedBlock.settings.days || [])];
 list[idx].description = e.target.value;
 updateBlockSettings(selectedBlock.id, 'days', list);
 }}
 rows={2}
 className="text-xs p-1.5"
 />
 </div>
 ))}
 <Button 
 size="sm" 
 variant="outline" 
 className="w-full text-[10px] font-bold border-zinc-200"
 onClick={() => {
 const list = [...(selectedBlock.settings.days || [])];
 list.push({ day: list.length + 1, title: '', description: '' });
 updateBlockSettings(selectedBlock.id, 'days', list);
 }}
 >
 + Adicionar Dia
 </Button>
 </div>
 </div>
 )}

 {/* Propriedades de INCLUSÕES / EXCLUSÕES */}
 {['inclusions', 'exclusions'].includes(selectedBlock.type) && (
 <div className="space-y-3 pt-2">
 <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Linhas de Itens (um por linha)</span>
 <Textarea 
 value={selectedBlock.settings.items?.join('\n') || ''}
 onChange={(e) => updateBlockSettings(selectedBlock.id, 'items', e.target.value.split('\n'))}
 rows={8}
 className="text-xs leading-normal font-sans"
 />
 </div>
 )}
 </div>
 </div>
 ) : (
 <div className="text-center py-12 text-zinc-400 text-xs">
 <Sparkles className="w-8 h-8 opacity-25 mx-auto mb-2" />
 Selecione um bloco no canvas ou na barra lateral para começar a configurar.
 </div>
 )}
 </div>

 {/* Versões Salvas em Snapshot (Rastreabilidade) */}
 <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 space-y-2">
 <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">Snapshot de Versão</span>
 <div className="max-h-24 overflow-y-auto space-y-1.5 font-mono text-[10px] text-zinc-500">
 {versions?.map((v: any, idx: number) => (
 <div key={v.id} className="flex justify-between items-center p-1.5 bg-white rounded-lg border border-zinc-100">
 <span className="font-semibold text-zinc-700">v{v.version_number}</span>
 <span>{new Date(v.created_at).toLocaleDateString('pt-BR')}</span>
 </div>
 ))}
 {(!versions || versions.length === 0) && (
 <span className="text-[9px] text-zinc-400 italic">Sem snapshots cadastrados. Crie um salvando.</span>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
 </AppLayout>
 );
}
