import { useParams } from 'react-router-dom';
import { CheckSquare2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePublicChecklist, useTogglePublicChecklistItem } from '@/hooks/useChecklists';
import { PublicLayout } from '@/components/layout/PublicLayout';

export default function PublicChecklist() {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading } = usePublicChecklist(token);
  const toggleItem = useTogglePublicChecklistItem();
  const title = data?.[0]?.checklist_title ?? 'Checklist da viagem';

  return (
    <PublicLayout orgName="Seu Checklist">
      <div className="mx-auto max-w-2xl py-4">
        <Card className="border-cb-border bg-cb-s0 shadow-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-cb-full bg-cb-accent/10 text-cb-accent mb-4">
              <CheckSquare2 className="h-6 w-6" />
            </div>
            <CardTitle className="font-heading text-2xl text-cb-text">{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {isLoading ? (
              <p className="text-sm text-cb-muted text-center py-8">Carregando checklist aberto...</p>
            ) : !data?.length ? (
              <div className="text-center py-10 bg-cb-s1 rounded-cb-md border border-cb-border">
                <p className="text-cb-text font-medium text-lg">Checklist não encontrado</p>
                <p className="text-sm text-cb-muted mt-1">Este link expirou ou o checklist não possui itens liberados.</p>
              </div>
            ) : (
              data.map((item) => (
                <label key={item.item_id} className={`flex items-start gap-4 rounded-cb-md border p-4 cursor-pointer transition-colors ${item.is_checked ? 'bg-cb-s1 border-cb-border/50' : 'bg-cb-s0 border-cb-border hover:border-cb-accent hover:shadow-sm'}`}>
                  <Checkbox
                    checked={item.is_checked}
                    className="mt-1"
                    onCheckedChange={() =>
                      toggleItem.mutate({
                        token: token!,
                        itemId: item.item_id,
                      })
                    }
                  />
                  <div className={`space-y-1 ${item.is_checked ? 'opacity-60 line-through' : ''}`}>
                    <p className="font-medium text-cb-text">{item.item_title}</p>
                    {item.item_description && (
                      <p className="text-sm text-cb-muted line-clamp-2">{item.item_description}</p>
                    )}
                  </div>
                </label>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
