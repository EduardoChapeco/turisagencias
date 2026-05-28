import * as React from "react"
import { Check, ChevronsUpDown, Plane } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useQuery } from "@tanstack/react-query"
import { PYTHON_ENGINE_URL } from "@/config/api"

export interface LocationData {
  iata: string;
  icao: string;
  name: string;
  city: string;
  state: string;
  country: string;
}

export function LocationCombobox({
  value,
  onChange,
  placeholder = "Selecione uma localização...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const { data: results, isLoading } = useQuery({
    queryKey: ['locations', search],
    queryFn: async () => {
      if (search.length < 2) return [];
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase
        .from('global_iatas')
        .select('*')
        .or(`iata_code.ilike.%${search}%,city.ilike.%${search}%,airport_name.ilike.%${search}%,country.ilike.%${search}%`)
        .limit(20);
        
      if (error) {
        console.error('Error fetching locations:', error);
        return [];
      }
      
      return data.map((d: any) => ({
        iata: d.iata_code,
        icao: d.icao_code,
        name: d.airport_name,
        city: d.city,
        state: '',
        country: d.country,
      })) as LocationData[];
    },
    enabled: search.length >= 2,
    staleTime: 60000,
  })

  // Helper to format string for the input
  const formatLocation = (loc: LocationData) => {
    return `${loc.city}${loc.country ? `, ${loc.country}` : ''} - ${loc.name} (${loc.iata})`;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal text-left truncate overflow-hidden bg-white"
        >
          <span className="truncate">{value || <span className="text-muted-foreground">{placeholder}</span>}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Buscar aeroporto ou cidade (ex: GRU, Paris)..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Buscando IATA na base global..." : search.length < 2 ? "Digite pelo menos 2 caracteres." : "Nenhum local encontrado."}
            </CommandEmpty>
            <CommandGroup>
              {results?.map((loc) => {
                const label = formatLocation(loc);
                return (
                  <CommandItem
                    key={loc.iata || loc.icao || loc.name}
                    value={label}
                    onSelect={() => {
                      onChange(label);
                      setOpen(false);
                    }}
                    className="flex flex-col items-start gap-1 py-2 cursor-pointer"
                  >
                    <div className="flex items-center w-full">
                      <Plane className="mr-2 h-4 w-4 shrink-0 text-vj-txt3" />
                      <span className="font-bold text-vj-txt">{loc.city} {loc.country && `(${loc.country})`}</span>
                      {(loc.iata || loc.icao) && (
                        <span className="ml-auto text-[10px] text-vj-green font-mono font-extrabold bg-vj-green/10 px-1.5 py-0.5 rounded">
                          {loc.iata || loc.icao}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-vj-txt2 pl-6 line-clamp-1">
                      {loc.name}
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
