import { useState, useMemo } from 'react';
import { useClients } from '@/hooks/useClients';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronsUpDown, Search, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  onChange: (clientId: string) => void;
  placeholder?: string;
  className?: string;
}

export function ClientSearchSelect({ value, onChange, placeholder = 'Buscar cliente...', className }: Props) {
  const { data: clients } = useClients();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!clients) return [];
    if (!search.trim()) return clients.slice(0, 20);
    const q = search.toLowerCase();
    return clients.filter(c => c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)).slice(0, 20);
  }, [clients, search]);

  const selectedClient = clients?.find(c => c.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between font-normal h-10', !value && 'text-muted-foreground', className)}
        >
          {selectedClient ? (
            <span className="flex items-center gap-2 truncate">
              <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              {selectedClient.name}
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="pl-8 h-8 text-sm"
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {value && (
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); setSearch(''); }}
              className="w-full px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent/50 flex items-center gap-2 border-b border-border"
            >
              <X className="h-3.5 w-3.5" /> Remover seleção
            </button>
          )}
          {filtered.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground text-center">Nenhum cliente encontrado</p>
          ) : (
            filtered.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => { onChange(c.id); setOpen(false); setSearch(''); }}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm hover:bg-accent/50 flex items-center gap-2',
                  c.id === value && 'bg-accent/30 font-medium'
                )}
              >
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {c.name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate">{c.name}</p>
                  {c.email && <p className="text-xs text-muted-foreground truncate">{c.email}</p>}
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
