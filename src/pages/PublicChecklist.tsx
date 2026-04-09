import { useParams } from 'react-router-dom';
import { CheckSquare2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePublicChecklist, useTogglePublicChecklistItem } from '@/hooks/useChecklists';

export default function PublicChecklist() {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading } = usePublicChecklist(token);
  const toggleItem = useTogglePublicChecklistItem();
  const title = data?.[0]?.checklist_title ?? 'Checklist da viagem';

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
              <CheckSquare2 className="h-6 w-6" />
            </div>
            <CardTitle className="font-heading text-2xl">{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando checklist...</p>
            ) : !data?.length ? (
              <p className="text-sm text-muted-foreground">Checklist não encontrado ou sem itens visíveis.</p>
            ) : (
              data.map((item) => (
                <label key={item.item_id} className="flex items-start gap-3 rounded-lg border bg-background p-4">
                  <Checkbox
                    checked={item.is_checked}
                    onCheckedChange={() =>
                      toggleItem.mutate({
                        token: token!,
                        itemId: item.item_id,
                      })
                    }
                  />
                  <div className="space-y-1">
                    <p className="font-medium">{item.item_title}</p>
                    {item.item_description && (
                      <p className="text-sm text-muted-foreground">{item.item_description}</p>
                    )}
                  </div>
                </label>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
