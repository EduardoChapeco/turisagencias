import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Plus, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useKnowledgeBase, useUpsertKnowledge, useDeleteKnowledge } from '@/hooks/useKnowledgeBase';

export function KnowledgeTab() {
 const { data: kb, isLoading } = useKnowledgeBase();
 const upsert = useUpsertKnowledge();
 const remove = useDeleteKnowledge();
 const [content, setContent] = useState('');

 const handleSave = async () => {
 if (!content.trim()) return;
 await upsert.mutateAsync({ content: content.trim() });
 setContent('');
 };

 return (
 <div className="grid md:grid-cols-2 gap-6">
 <Card className="premium-card">
 <CardHeader>
 <CardTitle className="text-lg flex items-center gap-2">
 <Brain className="h-4 w-4 text-vj-green" /> Treinar Especialista IA
 </CardTitle>
 <CardDescription>Ensine a IA sobre seus pacotes exclusivos, regras de cancelamento ou tom de voz da agência.</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <Textarea 
 placeholder="Ex: Nossa agência foca em luxo acessível. Priorizamos sempre a rede Belmond..." 
 value={content} 
 onChange={e => setContent(e.target.value)} 
 rows={10}
 className="rounded-2xl border-zinc-200 resize-none"
 />
 <Button className="w-full premium-button h-12" disabled={!content.trim() || upsert.isPending} onClick={handleSave}>
 <Plus className="w-4 h-4 mr-2" /> {upsert.isPending ? 'Indexando Conhecimento...' : 'Treinar Turis AI'}
 </Button>
 </CardContent>
 </Card>

 <Card className="premium-card">
 <CardHeader>
 <CardTitle className="text-lg">Inteligência Adquirida</CardTitle>
 <CardDescription>Base de conhecimento vetorial ativa.</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-none">
 {isLoading ? <Skeleton className="h-24 w-full" /> : 
 !kb?.length ? <div className="text-center py-20 text-muted-foreground text-sm italic">Nenhum treinamento realizado ainda.</div> :
 kb.map((doc: any) => (
 <div key={doc.id} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 relative group animate-in fade-in zoom-in duration-300">
 <p className="text-xs text-vj-txt leading-relaxed line-clamp-4">"{doc.content}"</p>
 <div className="flex items-center justify-between mt-4">
 <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">v_{doc.id.substring(0,6)}</span>
 <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => remove.mutate(doc.id)}>
 <Trash2 size={13} />
 </Button>
 </div>
 </div>
 ))
 }
 </div>
 </CardContent>
 </Card>
 </div>
 );
}
