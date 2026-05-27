import React, { useState } from 'react';
import { BlockDef } from '../core/types';
import { SquareStack, Server, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

// ─── Real Form Renderer ────────────────────────────────────────────────────────
const FormRenderer = ({ node }: { node: any }) => {
 const {
 formTitle,
 formSubtitle,
 actionType,
 endpoint,
 supabaseTable,
 successMessage,
 fields = [],
 } = node.props;
 const { paddingTop, paddingBottom, backgroundColor, textColor } = node.styles;

 const [formData, setFormData] = useState<Record<string, string>>({});
 const [loading, setLoading] = useState(false);
 const [submitted, setSubmitted] = useState(false);
 const [error, setError] = useState<string | null>(null);

 const handleChange = (name: string, value: string) => {
 setFormData(prev => ({ ...prev, [name]: value }));
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError(null);

 try {
 if (actionType === 'supabase' && supabaseTable) {
 // Real Supabase INSERT
 const { error: insertError } = await supabase
 .from(supabaseTable as any)
 .insert({ ...formData, submitted_at: new Date().toISOString() });

 if (insertError) throw insertError;

 } else if (actionType === 'webhook' && endpoint) {
 // Real Webhook POST
 const resp = await fetch(endpoint, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ ...formData, submitted_at: new Date().toISOString() }),
 });
 if (!resp.ok) throw new Error(`Webhook respondeu com status ${resp.status}`);

 } else {
 throw new Error('Configure o tipo de ação e o destino do formulário nas opções do bloco.');
 }

 setSubmitted(true);
 setFormData({});
 } catch (e: any) {
 setError(e.message || 'Erro ao enviar formulário.');
 } finally {
 setLoading(false);
 }
 };

 return (
 <section className={`${paddingTop} ${paddingBottom} ${backgroundColor} ${textColor} px-6`}>
 <div className="max-w-xl mx-auto border border-zinc-200 rounded-2xl p-8 relative bg-white">
 {/* Action Badge */}
 <span className="absolute -top-3 right-6 bg-zinc-900 text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
 <Server size={10} />
 {actionType === 'supabase' ? `→ ${supabaseTable}` : 'Webhook POST'}
 </span>

 {submitted ? (
 <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
 <CheckCircle className="w-12 h-12 text-green-500" />
 <p className="text-lg font-bold text-zinc-900">{successMessage || 'Enviado com sucesso!'}</p>
 <button
 onClick={() => setSubmitted(false)}
 className="text-sm text-zinc-400 hover:text-zinc-700 underline"
 >
 Enviar novamente
 </button>
 </div>
 ) : (
 <form onSubmit={handleSubmit} className="space-y-5">
 {formTitle && (
 <div className="mb-6">
 <h3 className="text-xl font-black text-zinc-900">{formTitle}</h3>
 {formSubtitle && <p className="text-sm text-zinc-500 mt-1">{formSubtitle}</p>}
 </div>
 )}

 {fields.length === 0 ? (
 <div className="p-6 border-2 border-dashed border-zinc-200 rounded-xl text-center text-zinc-400">
 <SquareStack className="w-8 h-8 mx-auto mb-2 opacity-40" />
 <p className="text-sm font-bold">Sem campos configurados</p>
 <p className="text-xs mt-1">Adicione campos na aba de edição deste bloco.</p>
 </div>
 ) : (
 fields.map((field: any, i: number) => (
 <div key={i} className="space-y-1.5">
 <label className="text-sm font-semibold text-zinc-700">
 {field.label} {field.required && <span className="text-red-500">*</span>}
 </label>
 {field.type === 'textarea' ? (
 <textarea
 name={field.name}
 placeholder={field.placeholder}
 required={field.required}
 rows={4}
 value={formData[field.name] || ''}
 onChange={e => handleChange(field.name, e.target.value)}
 className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
 />
 ) : (
 <Input
 type={field.type || 'text'}
 name={field.name}
 placeholder={field.placeholder}
 required={field.required}
 value={formData[field.name] || ''}
 onChange={e => handleChange(field.name, e.target.value)}
 className="h-11 border-zinc-200 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent"
 />
 )}
 </div>
 ))
 )}

 {error && (
 <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
 <AlertCircle size={16} />
 <span>{error}</span>
 </div>
 )}

 {fields.length > 0 && (
 <button
 type="submit"
 disabled={loading}
 className="w-full h-12 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
 >
 {loading && <Loader2 className="w-4 h-4 animate-spin" />}
 {loading ? 'Enviando...' : (node.props.buttonText || 'Enviar')}
 </button>
 )}
 </form>
 )}
 </div>
 </section>
 );
};

// ─── Block Definition ──────────────────────────────────────────────────────────
export const FormContainerBlock: BlockDef = {
 type: 'form_container',
 label: 'Formulário de Contato',
 category: 'interactive',
 icon: SquareStack,
 acceptsChildren: false,

 defaultProps: {
 formTitle: 'Entre em Contato',
 formSubtitle: 'Preencha o formulário e retornaremos em breve.',
 actionType: 'supabase',
 endpoint: '',
 supabaseTable: 'leads',
 successMessage: 'Mensagem enviada! Em breve entraremos em contato.',
 buttonText: 'Enviar Mensagem',
 fields: [
 { label: 'Nome Completo', name: 'name', type: 'text', placeholder: 'Seu nome...', required: true },
 { label: 'E-mail', name: 'email', type: 'email', placeholder: 'seu@email.com', required: true },
 { label: 'Telefone / WhatsApp', name: 'phone', type: 'tel', placeholder: '(11) 99999-0000', required: false },
 { label: 'Mensagem', name: 'message', type: 'textarea', placeholder: 'Descreva o que procura...', required: false },
 ],
 },

 defaultStyles: {
 paddingTop: 'py-16',
 paddingBottom: 'pb-16',
 backgroundColor: 'bg-zinc-50',
 textColor: 'text-zinc-900',
 },

 renderComponent: ({ node }) => <FormRenderer node={node} />,

 settingsComponent: ({ node, onChange }) => {
 const fields: any[] = node.props.fields || [];

 const updateField = (index: number, key: string, value: string | boolean) => {
 const updated = [...fields];
 updated[index] = { ...updated[index], [key]: value };
 onChange({ props: { ...node.props, fields: updated } });
 };

 const addField = () => {
 const updated = [...fields, { label: 'Novo Campo', name: `campo_${fields.length}`, type: 'text', placeholder: '', required: false }];
 onChange({ props: { ...node.props, fields: updated } });
 };

 const removeField = (index: number) => {
 const updated = fields.filter((_, i) => i !== index);
 onChange({ props: { ...node.props, fields: updated } });
 };

 return (
 <div className="space-y-5">
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Título do Formulário</Label>
 <Input
 value={node.props.formTitle || ''}
 onChange={e => onChange({ props: { ...node.props, formTitle: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>

 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Tipo de Ação</Label>
 <Select
 value={node.props.actionType || 'supabase'}
 onValueChange={v => onChange({ props: { ...node.props, actionType: v } })}
 >
 <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-white h-9">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="supabase">Inserir no Supabase (INSERT)</SelectItem>
 <SelectItem value="webhook">Disparar Webhook (POST)</SelectItem>
 </SelectContent>
 </Select>
 </div>

 {node.props.actionType === 'supabase' && (
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Tabela Destino</Label>
 <Input
 value={node.props.supabaseTable || ''}
 onChange={e => onChange({ props: { ...node.props, supabaseTable: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 placeholder="ex: leads"
 />
 </div>
 )}

 {node.props.actionType === 'webhook' && (
 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">URL do Webhook</Label>
 <Input
 value={node.props.endpoint || ''}
 onChange={e => onChange({ props: { ...node.props, endpoint: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 placeholder="https://hook.make.com/..."
 />
 </div>
 )}

 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Texto do Botão</Label>
 <Input
 value={node.props.buttonText || ''}
 onChange={e => onChange({ props: { ...node.props, buttonText: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>

 <div className="space-y-2">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Mensagem de Sucesso</Label>
 <Input
 value={node.props.successMessage || ''}
 onChange={e => onChange({ props: { ...node.props, successMessage: e.target.value } })}
 className="bg-zinc-900 border-zinc-800 text-white text-sm h-9"
 />
 </div>

 {/* Fields Manager */}
 <div className="pt-3 border-t border-zinc-800 space-y-3">
 <div className="flex items-center justify-between">
 <Label className="text-[10px] uppercase text-zinc-500 font-bold">Campos ({fields.length})</Label>
 <button
 onClick={addField}
 className="text-[10px] font-bold text-vj-green hover:text-green-400 transition-colors"
 >
 + Adicionar
 </button>
 </div>

 {fields.map((field, i) => (
 <div key={i} className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-zinc-300">{field.label || `Campo ${i + 1}`}</span>
 <button onClick={() => removeField(i)} className="text-[10px] text-red-500 hover:text-red-400">Remover</button>
 </div>
 <div className="grid grid-cols-2 gap-2">
 <Input
 value={field.label}
 onChange={e => updateField(i, 'label', e.target.value)}
 placeholder="Rótulo"
 className="bg-zinc-800 border-zinc-700 text-white text-xs h-8"
 />
 <Input
 value={field.name}
 onChange={e => updateField(i, 'name', e.target.value)}
 placeholder="nome_coluna"
 className="bg-zinc-800 border-zinc-700 text-white text-xs h-8"
 />
 </div>
 <select
 value={field.type}
 onChange={e => updateField(i, 'type', e.target.value)}
 className="w-full bg-zinc-800 border border-zinc-700 text-white text-xs rounded p-1.5 h-8"
 >
 <option value="text">Texto</option>
 <option value="email">E-mail</option>
 <option value="tel">Telefone</option>
 <option value="number">Número</option>
 <option value="date">Data</option>
 <option value="textarea">Área de texto</option>
 </select>
 </div>
 ))}
 </div>
 </div>
 );
 }
};
