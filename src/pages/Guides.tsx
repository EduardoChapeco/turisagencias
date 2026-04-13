import { useNavigate } from 'react-router-dom';
import { Plus, Search, Map, Globe2, BookOpen } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { useGuides } from '@/hooks/useGuides';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { GuideEdit } from './GuideEdit';

export default function Guides() {
  const navigate = useNavigate();
  const { data: guides, isLoading } = useGuides();
  const [searchTerm, setSearchTerm] = useState('');
  const [editSheet, setEditSheet] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const filteredGuides = guides?.filter(
    (g) =>
      g.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader 
          title="Guias Mágicos"
          description="Base de conhecimento de destinos. Alimenta sua IA e enriquece os Portais de Clientes."
          icon={Globe2}
          actions={
            <Button onClick={() => setEditSheet({ open: true, id: null })}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Livro de Destino
            </Button>
          }
        />

        <Card className="surface-card border-vj-border overflow-hidden">
          <div className="p-4 border-b border-vj-border bg-white flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por cidade ou país..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background shadow-sm rounded-xl"
              />
            </div>
            <div className="text-sm font-medium text-muted-foreground">
               {guides?.length || 0} destinos indexados
            </div>
          </div>

          <CardContent className="p-6">
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                   <Skeleton key={i} className="h-64 rounded-2xl" />
                ))}
              </div>
            ) : filteredGuides?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-muted p-4 rounded-full mb-4">
                   <Map className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <h3 className="font-heading text-lg font-semibold">Nenhum Guia Encontrado</h3>
                <p className="text-muted-foreground mt-1 max-w-md">
                  Crie guias detalhados sobre cidades e países. Dicas, contatos de emergência e regras de vistos cadastradas aqui serão lidas pelo V-Agent nas conversas.
                </p>
                <Button variant="outline" className="mt-6" onClick={() => setEditSheet({ open: true, id: null })}>
                   Começar Mapeamento
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredGuides?.map((guide) => (
                  <Card 
                     key={guide.id} 
                     className="group overflow-hidden rounded-2xl border-vj-border hover:shadow-lg hover:border-vj-green/20 transition-all cursor-pointer flex flex-col"
                     onClick={() => navigate(`/guides/${guide.id}`)}
                  >
                     <div className="h-40 bg-muted relative overflow-hidden">
                        {guide.cover_image_url ? (
                           <img src={guide.cover_image_url} alt={guide.city} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-muted-foreground">
                              <Map className="h-8 w-8 mb-2 opacity-50" />
                              <span className="text-xs font-medium uppercase tracking-wider">Sem Imagem</span>
                           </div>
                        )}
                        <div className="absolute top-3 right-3 flex gap-2">
                           <Badge variant={guide.is_published ? "default" : "secondary"} className="shadow-md">
                              {guide.is_published ? 'Publicado' : 'Rascunho'}
                           </Badge>
                        </div>
                     </div>
                     <CardHeader className="pt-4 pb-2">
                        <CardDescription className="uppercase tracking-wider font-semibold text-accent text-xs">
                           {guide.country}
                        </CardDescription>
                        <CardTitle className="text-xl line-clamp-1">{guide.city}</CardTitle>
                     </CardHeader>
                     <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                           {guide.intro || 'Nenhuma introdução escrita ainda. Envie o contexto para a inteligência artificial ler.'}
                        </p>
                     </CardContent>
                     <CardFooter className="pt-0 pb-4 border-t border-vj-border mt-4 flex items-center justify-between text-muted-foreground text-xs font-medium">
                        <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5"/> {(guide.tips as any[])?.length || 0} Dicas</span>
                        <span>Atualizado há pouco</span>
                     </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <GuideEdit 
        open={editSheet.open} 
        id={editSheet.id} 
        onClose={() => setEditSheet({ open: false, id: null })} 
        onSuccess={() => {}} 
      />
    </AppLayout>
  );
}
