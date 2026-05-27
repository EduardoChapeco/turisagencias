import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const CarouselTestimonialsBlock = {
 type: 'carousel_testimonials',
 category: 'media',
 label: 'Testimonial Carousel',
 icon: MessageSquare,
 defaultProps: {
 dataSource: 'manual', // 'manual' or 'database'
 manualTestimonials: [
 { name: 'João Silva', text: 'Viagem incrível para Paris!', rating: 5 },
 { name: 'Maria Souza', text: 'O roteiro foi perfeito.', rating: 5 }
 ],
 showStars: true
 },
 defaultStyles: {
 padding: '24px',
 backgroundColor: '#f9fafb'
 },
 renderComponent: ({ node }) => {
 const { dataSource = 'manual', manualTestimonials = [], showStars = true } = node.props || {};
 
 // Fetch from database if configured
 const { data: dbTestimonials = [], isLoading } = useQuery({
 queryKey: ['public-testimonials', node.id],
 queryFn: async () => {
 if (dataSource !== 'database') return [];
 const { data, error } = await supabase
 .from('agency_testimonials')
 .select('*')
 .eq('status', 'approved')
 .order('created_at', { ascending: false })
 .limit(10);
 
 if (error) throw error;
 return data || [];
 },
 enabled: dataSource === 'database'
 });

 const activeTestimonials = dataSource === 'database' ? dbTestimonials : manualTestimonials;

 return (
 <div style={node.styles} className="w-full">
 {isLoading && dataSource === 'database' ? (
 <div className="flex justify-center p-8 text-gray-500">Carregando depoimentos...</div>
 ) : activeTestimonials.length === 0 ? (
 <div className="p-4 border border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center min-h-[150px]">
 <div className="text-center text-gray-500">
 <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-50" />
 <p>Nenhum depoimento disponível</p>
 </div>
 </div>
 ) : (
 <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 hide-scrollbar">
 {activeTestimonials.map((test: any, idx: number) => (
 <div 
 key={idx} 
 className="snap-center shrink-0 w-[300px] md:w-[400px] bg-white p-6 rounded-2xl border border-gray-100 flex flex-col justify-between"
 >
 <div>
 {showStars && (
 <div className="flex gap-1 mb-4 text-yellow-400">
 {Array.from({ length: test.rating || 5 }).map((_, i) => (
 <Star key={i} className="h-4 w-4 fill-current" />
 ))}
 </div>
 )}
 <p className="text-gray-700 italic mb-6">"{test.text || test.content}"</p>
 </div>
 <div className="flex items-center gap-3 mt-4">
 {test.client_avatar_url ? (
 <img src={test.client_avatar_url} alt={test.client_name || test.name} className="h-10 w-10 rounded-full object-cover" />
 ) : (
 <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
 {(test.client_name || test.name)?.charAt(0)}
 </div>
 )}
 <div>
 <h4 className="font-medium text-sm text-gray-900">{test.client_name || test.name}</h4>
 {test.trip_destination && <p className="text-xs text-gray-500">{test.trip_destination}</p>}
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 );
 },
 settingsComponent: ({ node, onChange }) => {
 const { dataSource = 'manual', manualTestimonials = [], showStars = true } = node.props || {};

 const addTestimonial = () => {
 onChange({ props: { ...node.props, manualTestimonials: [...manualTestimonials, { name: '', text: '', rating: 5 }] } });
 };

 const updateTestimonial = (index: number, field: string, value: any) => {
 const newTests = [...manualTestimonials];
 newTests[index] = { ...newTests[index], [field]: value };
 onChange({ props: { ...node.props, manualTestimonials: newTests } });
 };

 const removeTestimonial = (index: number) => {
 onChange({ props: { ...node.props, manualTestimonials: manualTestimonials.filter((_: any, i: number) => i !== index) } });
 };

 return (
 <div className="p-4 space-y-6">
 <div className="space-y-2">
 <Label>Fonte de Dados</Label>
 <select 
 className="w-full p-2 border rounded-md text-sm"
 value={dataSource}
 onChange={(e) => onChange({ props: { ...node.props, dataSource: e.target.value } })}
 >
 <option value="manual">Manual (Inserir abaixo)</option>
 <option value="database">Automático (Puxar do Banco)</option>
 </select>
 </div>

 <div className="flex items-center gap-2">
 <input 
 type="checkbox" 
 id="showStars"
 checked={showStars}
 onChange={(e) => onChange({ props: { ...node.props, showStars: e.target.checked } })}
 />
 <Label htmlFor="showStars">Mostrar estrelas de avaliação</Label>
 </div>

 {dataSource === 'manual' && (
 <div className="space-y-4 border-t pt-4">
 <Label className="flex items-center justify-between">
 Depoimentos Manuais
 <Button variant="ghost" size="sm" onClick={addTestimonial}><Plus className="h-4 w-4" /></Button>
 </Label>
 
 <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
 {manualTestimonials.map((test: any, idx: number) => (
 <div key={idx} className="flex flex-col gap-2 p-3 border rounded relative bg-gray-50">
 <Button 
 variant="ghost" 
 size="sm" 
 className="absolute top-1 right-1 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
 onClick={() => removeTestimonial(idx)}
 >
 <Trash2 className="h-3 w-3" />
 </Button>
 <div className="space-y-1 pr-6">
 <Label className="text-xs">Nome do Cliente</Label>
 <Input 
 className="h-8 text-sm"
 value={test.name} 
 onChange={e => updateTestimonial(idx, 'name', e.target.value)} 
 />
 </div>
 <div className="space-y-1">
 <Label className="text-xs">Texto do Depoimento</Label>
 <textarea 
 className="w-full min-h-[60px] p-2 border rounded-md text-sm resize-none"
 value={test.text}
 onChange={e => updateTestimonial(idx, 'text', e.target.value)}
 />
 </div>
 <div className="space-y-1">
 <Label className="text-xs">Avaliação (1-5)</Label>
 <Input 
 type="number"
 min={1}
 max={5}
 className="h-8 text-sm w-20"
 value={test.rating} 
 onChange={e => updateTestimonial(idx, 'rating', parseInt(e.target.value))} 
 />
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 );
 }
};
