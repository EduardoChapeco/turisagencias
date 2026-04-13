import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Plus, Search, Book, Globe2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { useTravelerInfoPages, useDeleteTravelerInfoPage } from '@/hooks/useTravelerInfo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TravelerInfoEdit } from './TravelerInfoEdit';

export default function TravelerInfo() {
  const navigate = useNavigate();
  const { data: pages, isLoading } = useTravelerInfoPages();
  const deletePage = useDeleteTravelerInfoPage();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editSheet, setEditSheet] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const filteredPages = pages?.filter((p) => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleDelete = async () => {
    if (deleteDialog.id) {
      await deletePage.mutateAsync(deleteDialog.id);
      setDeleteDialog({ open: false, id: null });
    }
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/p/info/${slug}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader 
          title="Info Páginas"
          description="Crie páginas ricas com dicas, documentações de visto e informações pré-embarque para compartilhar."
          icon={Book}
          actions={
            <Button onClick={() => setEditSheet({ open: true, id: null })}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Página
            </Button>
          }
        />

        <Card className="surface-card border-vj-border overflow-hidden">
          <div className="p-4 border-b border-vj-border bg-white flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-vj-txt3" />
              <Input
                placeholder="Buscar informação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-vj-bg border-vj-border shadow-sm rounded-xl"
              />
            </div>
            <div className="text-sm font-medium text-vj-txt3">
               {pages?.length || 0} páginas publicadas
            </div>
          </div>

          <CardContent className="p-6">
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                   <Skeleton key={i} className="h-64 rounded-cb-lg" />
                ))}
              </div>
            ) : filteredPages?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-vj-bg p-4 rounded-full mb-4">
                   <Book className="h-10 w-10 text-vj-txt3/50" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-vj-txt">Nenhuma página encontrada</h3>
                <p className="text-vj-txt3 mt-1 max-w-md">
                  Escreva sua primeira página de informação para enriquecer os Portais do Viajante e a inteligência do Agente.
                </p>
                <Button variant="outline" className="mt-6" onClick={() => setEditSheet({ open: true, id: null })}>
                   Começar a Escrever
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPages?.map((page) => (
                  <Card 
                     key={page.id} 
                     className="group overflow-hidden rounded-cb-lg border-vj-border/60 hover:shadow-lg hover:border-vj-green/50 transition-all flex flex-col bg-white"
                  >
                     <div className="h-32 bg-vj-bg relative overflow-hidden">
                        {page.cover_image_url ? (
                           <img src={page.cover_image_url} alt={page.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center text-vj-txt3/40">
                              <Book className="h-8 w-8 mb-2" />
                           </div>
                        )}
                        <div className="absolute top-3 left-3 flex gap-2">
                           <StatusBadge variant={page.is_published ? "success" : "neutral"} className="shadow-md">
                              {page.is_published ? 'Público' : 'Rascunho'}
                           </StatusBadge>
                        </div>
                     </div>
                     <CardHeader className="pt-4 pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <CardTitle className="text-lg line-clamp-2 leading-tight group-hover:text-vj-green transition-colors">
                              {page.title}
                            </CardTitle>
                            <CardDescription className="text-xs mt-1 max-w-[200px] truncate text-vj-txt3 font-mono" title={page.slug}>
                               /p/info/{page.slug}
                            </CardDescription>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => setEditSheet({ open: true, id: page.id })}>
                                <Pencil className="mr-2 h-4 w-4" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => copyLink(page.slug)}>
                                <Globe2 className="mr-2 h-4 w-4" /> Copiar Link
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setDeleteDialog({ open: true, id: page.id })} className="text-vj-red focus:text-vj-red">
                                <Trash2 className="mr-2 h-4 w-4" /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                     </CardHeader>
                     <CardContent className="flex-1">
                        <p className="text-sm text-vj-txt3 line-clamp-2">
                           {page.description || 'Nenhuma descrição fornecida. Adicione um resumo para facilitar a leitura.'}
                        </p>
                     </CardContent>
                     <CardFooter className="pt-0 pb-4 border-t border-vj-border/30 mt-4 flex items-center justify-between text-vj-txt3 text-[11px] font-medium uppercase tracking-wider">
                        <span>{(page.content_blocks as any[])?.length || 0} blocos</span>
                        <span>{new Date(page.updated_at).toLocaleDateString('pt-BR')}</span>
                     </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <TravelerInfoEdit 
        open={editSheet.open} 
        id={editSheet.id} 
        onClose={() => setEditSheet({ open: false, id: null })}
      />

      <AlertDialog open={deleteDialog.open} onOpenChange={(c) => setDeleteDialog({ open: c, id: c ? deleteDialog.id : null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir página permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação é irreversível. O conteúdo será apagado de todos os Portais de Clientes.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Me arrependi</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-vj-red text-cb-s0 hover:bg-vj-red/90">Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
