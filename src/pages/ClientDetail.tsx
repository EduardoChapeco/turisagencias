import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useClient } from '@/hooks/useClients';
import { useTravelers, useCreateTraveler, useDeleteTraveler } from '@/hooks/useTravelers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Plus, User, Mail, Phone, MapPin, Calendar, Copy, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: client, isLoading } = useClient(id);
  const { data: travelers, isLoading: loadingTravelers } = useTravelers(id);
  const createTraveler = useCreateTraveler();
  const deleteTraveler = useDeleteTraveler();
  const { toast } = useToast();
  const [newTraveler, setNewTraveler] = useState({ full_name: '', cpf: '', birth_date: '', email: '', phone: '', relation: '' });
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddTraveler = async () => {
    if (!newTraveler.full_name) return;
    await createTraveler.mutateAsync({ ...newTraveler, client_id: id });
    setNewTraveler({ full_name: '', cpf: '', birth_date: '', email: '', phone: '', relation: '' });
    setDialogOpen(false);
  };

  const copyFormLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/f/${token}`);
    toast({ title: 'Link copiado!' });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!client) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cliente não encontrado.</p>
          <Button variant="link" onClick={() => navigate('/clients')}>Voltar</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/clients')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold">{client.name}</h1>
            <p className="text-sm text-muted-foreground">Cliente desde {new Date(client.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
          <Button variant="outline" className="ml-auto" onClick={() => navigate(`/clients/${id}/edit`)}>
            Editar
          </Button>
        </div>

        <Tabs defaultValue="info">
          <TabsList>
            <TabsTrigger value="info">Dados</TabsTrigger>
            <TabsTrigger value="travelers">Viajantes ({travelers?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-sm text-muted-foreground">Contato</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {client.email && <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {client.email}</p>}
                  {client.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {client.phone}</p>}
                  {client.cpf && <p className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> CPF: {client.cpf}</p>}
                  {client.birth_date && <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> {new Date(client.birth_date).toLocaleDateString('pt-BR')}</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm text-muted-foreground">Endereço</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-sm">
                  {client.address && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {client.address}</p>}
                  <p>{[client.city, client.state, client.zip_code].filter(Boolean).join(', ')}</p>
                  {client.country && <p>{client.country}</p>}
                </CardContent>
              </Card>
            </div>
            {client.tags && client.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {client.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
              </div>
            )}
            {client.notes && (
              <Card>
                <CardHeader><CardTitle className="text-sm text-muted-foreground">Observações</CardTitle></CardHeader>
                <CardContent><p className="text-sm whitespace-pre-wrap">{client.notes}</p></CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="travelers" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" /> Novo Viajante</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Adicionar Viajante</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nome completo *</Label>
                      <Input value={newTraveler.full_name} onChange={(e) => setNewTraveler(p => ({ ...p, full_name: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>CPF</Label>
                        <Input value={newTraveler.cpf} onChange={(e) => setNewTraveler(p => ({ ...p, cpf: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Nascimento</Label>
                        <Input type="date" value={newTraveler.birth_date} onChange={(e) => setNewTraveler(p => ({ ...p, birth_date: e.target.value }))} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Relação com o cliente</Label>
                      <Input value={newTraveler.relation} onChange={(e) => setNewTraveler(p => ({ ...p, relation: e.target.value }))} placeholder="Cônjuge, filho, amigo..." />
                    </div>
                    <Button onClick={handleAddTraveler} disabled={!newTraveler.full_name || createTraveler.isPending} className="w-full">
                      {createTraveler.isPending ? 'Salvando...' : 'Adicionar'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loadingTravelers ? (
              <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
            ) : !travelers?.length ? (
              <Card>
                <CardContent className="flex flex-col items-center py-8">
                  <User className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum viajante cadastrado para este cliente.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {travelers.map((t) => (
                  <Card key={t.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">{t.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.relation && `${t.relation} • `}
                          {t.cpf && `CPF: ${t.cpf} • `}
                          {t.form_completed_at ? '✅ Formulário preenchido' : '⏳ Aguardando preenchimento'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => copyFormLink(t.form_token!)}>
                          <Copy className="mr-1 h-3 w-3" /> Link
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir viajante?</AlertDialogTitle>
                              <AlertDialogDescription>Esta ação remove {t.full_name} permanentemente.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deleteTraveler.mutate(t.id)}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
