import React, { useState, useEffect } from 'react';
import { BlockDef } from '../core/types';
import { Database, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

// Real CMS Grid Renderer Component (fetches from Supabase)
const CmsGridRenderer = ({ node }: { node: any }) => {
 const { title, tableName, limit, imageColumn, titleColumn, summaryColumn, linkColumn } = node.props;
 const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;

 const [items, setItems] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 if (!tableName) return;
 const fetchData = async () => {
 setLoading(true);
 setError(null);
 try {
 const { data, error: fetchErr } = await supabase
 .from(tableName as any)
 .select('*')
 .limit(limit || 6)
 .order('created_at', { ascending: false });

 if (fetchErr) throw fetchErr;
 setItems(data || []);
 } catch (e: any) {
 setError(`Erro ao carregar dados da tabela "${tableName}": ${e.message}`);
 } finally {
 setLoading(false);
 }
 };
 fetchData();
 }, [tableName, limit]);

 const imgCol = imageColumn || 'image_url';
 const titleCol = titleColumn || 'title';
 const summaryCol = summaryColumn || 'content_summary';
 const linkCol = linkColumn || 'url';

 return (
 <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6`}>
 <div className="max-w-6xl mx-auto">
 <div className="flex items-center gap-3 mb-12">
 <h2 className="text-3xl md:text-5xl font-black flex-1">{title}</h2>
 <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-1 rounded-full">
 <Database size={10} /> {tableName}
 </span>
 </div>

 {loading && (
 <div className="flex items-center justify-center py-20 text-zinc-400">
 <Loader2 className="w-8 h-8 animate-spin mr-3" />
 <span className="text-sm">Carregando dados de {tableName}...</span>
 </div>
 )}

 {error && (
 <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
 <AlertCircle size={16} />
 <p className="text-sm">{error}</p>
 </div>
 )}

 {!loading && !error && items.length === 0 && (
 <div className="py-16 text-center text-zinc-400">
 <Database className="w-10 h-10 mx-auto mb-3 opacity-40" />
 <p className="text-sm font-bold">Nenhum dado encontrado em "{tableName}"</p>
 </div>
 )}

 {!loading && !error && items.length > 0 && (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {items.map((item, i) => (
 <article key={item.id || i} className="bg-white rounded-2xl overflow-hidden border border-zinc-100 hover:border-zinc-300 transition-all hover: group">
 {item[imgCol] && (
 <div className="w-full h-48 overflow-hidden">
 <img
 src={item[imgCol]}
 alt={item[titleCol] || ''}
 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
 />
 </div>
 )}
 {!item[imgCol] && (
 <div className="w-full h-48 bg-gradient-to-br from-zinc-100 to-zinc-50 flex items-center justify-center">
 <Database className="w-8 h-8 text-zinc-300" />
 </div>
 )}
 <div className="p-6">
 {item.source && (
 <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{item.source}</span>
 )}
 <h3 className="font-bold text-base text-zinc-900 mt-1 mb-2 line-clamp-2">
 {item[titleCol] || 'Sem título'}
 </h3>
 {item[summaryCol] && (
 <p className="text-sm text-zinc-500 line-clamp-3 leading-relaxed">
 {item[summaryCol]}
 </p>
 )}
 {item[linkCol] && (
 <a
 href={item[linkCol]}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center gap-1 mt-4 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
 >
 Ler mais <ExternalLink size={11} />
 </a>
 )}
 </div>
 </article>
 ))}
 </div>
 )}
 </div>
 </section>
 );
};

export const CmsGridBlock: BlockDef = {
 type: 'cms_grid',
 label: 'Grid CMS (Dinâmico)',
 category: 'cms',
 icon: Database,

 defaultProps: {
 title: 'Últimas Notícias',
 tableName: 'ai_radar_news',
 limit: 6,
 imageColumn: 'image_url',
 titleColumn: 'title',
 summaryColumn: 'content_summary',
 linkColumn: 'url',
 },

 defaultStyles: {
 paddingTop: 'py-20',
 paddingBottom: 'pb-20',
 backgroundColor: 'bg-zinc-50',
 textColor: 'text-zinc-900',
 },

 renderComponent: ({ node }) => <CmsGridRenderer node={node} />,

 settingsComponent: ({ node, onChange }) => {
 return (
 <div className="space-y-4">
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Título do Bloco</Label>
 <Input
 value={node.props.title || ''}
 onChange={e => onChange({ props: { ...node.props, title: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>

 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-blue-400 font-bold flex items-center gap-1">
 <Database size={12} /> Tabela Supabase
 </Label>
 <select
 value={node.props.tableName || 'ai_radar_news'}
 onChange={e => onChange({ props: { ...node.props, tableName: e.target.value } })}
 className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg p-2 h-9"
 >
 <option value="ai_radar_news">ai_radar_news (Notícias do Radar)</option>
 <option value="destinations">destinations (Destinos)</option>
 <option value="activities">activities (Atividades)</option>
 <option value="places">places (Lugares)</option>
 </select>
 </div>

 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Limite de Itens</Label>
 <Input
 type="number"
 value={node.props.limit || 6}
 onChange={e => onChange({ props: { ...node.props, limit: parseInt(e.target.value) } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 min={1}
 max={24}
 />
 </div>

 <div className="pt-2 border-t border-zinc-800 space-y-3">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Mapeamento de Colunas</Label>
 {[
 { key: 'titleColumn', label: 'Coluna do Título', placeholder: 'title' },
 { key: 'summaryColumn', label: 'Coluna do Resumo', placeholder: 'content_summary' },
 { key: 'imageColumn', label: 'Coluna da Imagem (URL)', placeholder: 'image_url' },
 { key: 'linkColumn', label: 'Coluna do Link', placeholder: 'url' },
 ].map(({ key, label, placeholder }) => (
 <div key={key} className="space-y-1">
 <Label className="text-[10px] text-zinc-600 font-medium">{label}</Label>
 <Input
 value={node.props[key] || ''}
 onChange={e => onChange({ props: { ...node.props, [key]: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-8"
 placeholder={placeholder}
 />
 </div>
 ))}
 </div>
 </div>
 );
 }
};
