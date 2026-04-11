import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useGuide, useDeleteGuide } from '@/hooks/useGuides';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState, PageSkeleton } from '@/components/ui/EmptyState';
import { BentoGrid, BentoCell } from '@/components/ui/BentoGrid';
import { GuideEdit } from '@/pages/GuideEdit';
import { Globe2, Map, Pencil, Trash2, BookOpen, Sun, CreditCard, Car, Languages } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function GuideDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: guide, isLoading } = useGuide(id);
  const deleteGuide = useDeleteGuide();

  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) {
    return (
      <AppLayout>
        <PageSkeleton />
      </AppLayout>
    );
  }

  if (!guide) {
    return (
      <AppLayout>
        <EmptyState
          icon={Globe2}
          title="Guia não encontrado"
          description="O quia que você tentou acessar não existe ou foi excluído."
          action={<Button variant="outline" onClick={() => navigate('/guides')}>Voltar aos Guias</Button>}
        />
      </AppLayout>
    );
  }

  const handleDelete = async () => {
    if (!id) return;
    await deleteGuide.mutateAsync(id);
    navigate('/guides');
  };

  return (
    <AppLayout>
      <PageHeader
        title={guide.city}
        description={guide.country}
        icon={Map}
        badge={
          <StatusBadge variant={guide.is_published ? 'success' : 'neutral'} size="sm">
            {guide.is_published ? 'Publicado no Portal' : 'Rascunho Interno'}
          </StatusBadge>
        }
        backTo="/guides"
        backToLabel="Guias"
        actions={
          <>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" className="border-cb-danger/20 text-cb-danger hover:bg-cb-danger/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Guia?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Isso removerá este destino da base de conhecimento da IA e dos Portais.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-cb-danger text-cb-s0 hover:bg-cb-danger/90">
                    Remover
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" /> Editar Guia
            </Button>
          </>
        }
      />

      <div className="max-w-6xl">
        <BentoGrid cols={3} gap="lg">
          {/* Capa e Introdução */}
          <BentoCell colSpan={2} rowSpan={2} padding="none" className="flex flex-col">
            {guide.cover_image_url && (
              <div className="h-48 md:h-64 w-full shrink-0">
                <img src={guide.cover_image_url} alt={guide.city} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4 text-cb-muted" /> Sobre o Destino
              </h3>
              {guide.intro ? (
                <p className="text-sm text-cb-muted leading-relaxed whitespace-pre-wrap">
                  {guide.intro}
                </p>
              ) : (
                <p className="text-sm text-cb-muted italic">Nenhuma introdução informada.</p>
              )}
            </div>
          </BentoCell>

          {/* Widgets laterais */}
          <BentoCell colSpan={1} rowSpan={1} padding="lg">
            <h3 className="font-semibold mb-3 text-cb-text flex items-center gap-2 text-sm">
              <Sun className="h-4 w-4 text-cb-accent" /> Clima
            </h3>
            {guide.climate_info ? (
              <p className="text-xs text-cb-muted leading-relaxed whitespace-pre-wrap">
                {guide.climate_info}
              </p>
            ) : (
              <p className="text-xs text-cb-muted italic">Sem informações</p>
            )}
          </BentoCell>

          <BentoCell colSpan={1} rowSpan={1} padding="lg">
            <h3 className="font-semibold mb-3 text-cb-text flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-cb-warning" /> Moeda
            </h3>
            {guide.currency_info ? (
              <p className="text-xs text-cb-muted leading-relaxed whitespace-pre-wrap">
                {guide.currency_info}
              </p>
            ) : (
              <p className="text-xs text-cb-muted italic">Sem informações</p>
            )}
          </BentoCell>

          <BentoCell colSpan={3} rowSpan={1} padding="lg">
            <div className="grid grid-cols-2 gap-8">
               <div>
                  <h3 className="font-semibold mb-3 text-cb-text flex items-center gap-2 text-sm">
                    <Car className="h-4 w-4 text-cb-muted" /> Transporte
                  </h3>
                  {guide.transportation ? (
                    <p className="text-sm text-cb-muted leading-relaxed whitespace-pre-wrap">
                      {guide.transportation}
                    </p>
                  ) : (
                    <p className="text-sm text-cb-muted italic">Sem informações de transporte</p>
                  )}
               </div>
               <div>
                  <h3 className="font-semibold mb-3 text-cb-text flex items-center gap-2 text-sm">
                    <Languages className="h-4 w-4 text-cb-muted" /> Idioma
                  </h3>
                  {guide.language_tips ? (
                    <p className="text-sm text-cb-muted leading-relaxed whitespace-pre-wrap">
                      {guide.language_tips}
                    </p>
                  ) : (
                    <p className="text-sm text-cb-muted italic">Sem informações de idioma</p>
                  )}
               </div>
            </div>
          </BentoCell>

        </BentoGrid>
      </div>

      <GuideEdit
        open={editOpen}
        id={id!}
        onClose={() => setEditOpen(false)}
      />
    </AppLayout>
  );
}
