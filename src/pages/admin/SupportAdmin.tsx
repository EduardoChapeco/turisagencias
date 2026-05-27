import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { RoleGuard } from '@/components/RoleGuard';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { HelpCircle, Ticket, FileText, Settings, Search, Edit } from 'lucide-react';

export default function SupportAdmin() {
 const { organization } = useAuthStore();
 const [tab, setTab] = useState('tickets');
 const db = supabase;

 // Tickets
 const { data: tickets = [], isLoading: loadingTickets } = useQuery({
 queryKey: ['admin-tickets', organization?.id],
 queryFn: async () => {
 const { data, error } = await db.from('support_tickets')
 .select('*')
 .eq('org_id', organization?.id)
 .order('created_at', { ascending: false });
 if (error) throw error;
 return data || [];
 },
 enabled: !!organization?.id,
 });

 // Artigos
 const { data: articles = [], isLoading: loadingArticles } = useQuery({
 queryKey: ['admin-articles', organization?.id],
 queryFn: async () => {
 const { data, error } = await db.from('support_articles')
 .select('*')
 .eq('org_id', organization?.id)
 .order('views', { ascending: false });
 if (error) throw error;
 return data || [];
 },
 enabled: !!organization?.id,
 });

 return (
 <RoleGuard allow={['org_admin', 'super_admin', 'support', 'agent']}>
 <AppLayout>
 <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <PageHeader
 title="Central de Suporte & Ajuda"
 description="Gerencie chamados de clientes e artigos da base de conhecimento."
 icon={HelpCircle}
 />
 </div>

 <Tabs value={tab} onValueChange={setTab} className="w-full">
 <TabsList className="mb-4">
 <TabsTrigger value="tickets" className="flex gap-2"><Ticket className="w-4 h-4"/> Tickets de Clientes</TabsTrigger>
 <TabsTrigger value="articles" className="flex gap-2"><FileText className="w-4 h-4"/> Artigos / FAQ</TabsTrigger>
 <TabsTrigger value="settings" className="flex gap-2"><Settings className="w-4 h-4"/> Configurações IA</TabsTrigger>
 </TabsList>

 <TabsContent value="tickets" className="space-y-4">
 <Card className=" border-vj-border">
 <CardHeader className="border-b border-vj-border bg-zinc-50/50">
 <CardTitle className="text-sm font-bold">Tickets Recentes</CardTitle>
 </CardHeader>
 <div className="overflow-x-auto">
 <Table>
 <TableHeader className="bg-zinc-50">
 <TableRow>
 <TableHead>Número</TableHead>
 <TableHead>Cliente</TableHead>
 <TableHead>Assunto</TableHead>
 <TableHead>Status</TableHead>
 <TableHead>Prioridade</TableHead>
 <TableHead>Data</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {tickets.map((ticket: any) => (
 <TableRow key={ticket.id} className="hover:bg-zinc-50/50 cursor-pointer">
 <TableCell className="font-mono font-bold text-vj-txt">{ticket.ticket_number}</TableCell>
 <TableCell>
 <p className="font-medium">{ticket.requester_name}</p>
 <p className="text-xs text-zinc-500">{ticket.requester_email}</p>
 </TableCell>
 <TableCell className="font-medium text-zinc-800">{ticket.subject}</TableCell>
 <TableCell>
 {ticket.status === 'open' && <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Aberto</Badge>}
 {ticket.status === 'in_progress' && <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Em Andamento</Badge>}
 {ticket.status === 'resolved' && <Badge variant="outline" className="text-vj-green border-green-200 bg-green-50">Resolvido</Badge>}
 {ticket.status === 'closed' && <Badge variant="outline" className="text-zinc-500 border-zinc-200 bg-zinc-50">Fechado</Badge>}
 </TableCell>
 <TableCell>
 <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{ticket.priority}</span>
 </TableCell>
 <TableCell className="text-zinc-500 text-sm">
 {format(new Date(ticket.created_at), 'dd/MM HH:mm')}
 </TableCell>
 </TableRow>
 ))}
 {tickets.length === 0 && (
 <TableRow>
 <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
 {loadingTickets ? 'Carregando tickets...' : 'Nenhum ticket encontrado.'}
 </TableCell>
 </TableRow>
 )}
 </TableBody>
 </Table>
 </div>
 </Card>
 </TabsContent>

 <TabsContent value="articles" className="space-y-4">
 <div className="flex justify-end mb-2">
 <Button className="bg-vj-green hover:bg-vj-green/90 text-white rounded-xl h-10 font-bold">Novo Artigo</Button>
 </div>
 <Card className=" border-vj-border">
 <CardHeader className="border-b border-vj-border bg-zinc-50/50">
 <CardTitle className="text-sm font-bold">Artigos da Central de Ajuda</CardTitle>
 </CardHeader>
 <div className="overflow-x-auto">
 <Table>
 <TableHeader className="bg-zinc-50">
 <TableRow>
 <TableHead>Título</TableHead>
 <TableHead>Categoria</TableHead>
 <TableHead>Views</TableHead>
 <TableHead>Feedback</TableHead>
 <TableHead>Status</TableHead>
 <TableHead></TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {articles.map((article: any) => (
 <TableRow key={article.id} className="hover:bg-zinc-50/50">
 <TableCell className="font-medium text-zinc-900">{article.title}</TableCell>
 <TableCell><Badge variant="secondary" className="font-normal">{article.category}</Badge></TableCell>
 <TableCell className="text-zinc-500">{article.views}</TableCell>
 <TableCell>
 <div className="flex gap-2 text-xs">
 <span className="text-vj-green font-bold">+{article.helpful_votes}</span>
 <span className="text-red-500">-{article.not_helpful_votes}</span>
 </div>
 </TableCell>
 <TableCell>
 {article.status === 'published' ? (
 <Badge variant="outline" className="text-vj-green border-green-200 bg-green-50">Público</Badge>
 ) : (
 <Badge variant="outline" className="text-zinc-500 border-zinc-200 bg-zinc-50">Rascunho</Badge>
 )}
 </TableCell>
 <TableCell className="text-right">
 <Button size="icon" variant="ghost" className="text-zinc-500"><Edit className="w-4 h-4" /></Button>
 </TableCell>
 </TableRow>
 ))}
 {articles.length === 0 && (
 <TableRow>
 <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
 {loadingArticles ? 'Carregando artigos...' : 'Nenhum artigo encontrado.'}
 </TableCell>
 </TableRow>
 )}
 </TableBody>
 </Table>
 </div>
 </Card>
 </TabsContent>

 <TabsContent value="settings">
 <Card className="p-12 text-center border-dashed text-zinc-500">
 <Settings className="w-12 h-12 mx-auto mb-4 opacity-20" />
 <p>Configurações de políticas da IA Pública e controle do RAG. (Em breve)</p>
 </Card>
 </TabsContent>

 </Tabs>
 </div>
 </AppLayout>
 </RoleGuard>
 );
}
