import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import type { QuotationFormValues } from '@/types';

export function useQuotations(filters?: { status?: string; search?: string }) {
  const { organization } = useAuthStore();
  return useQuery({
    queryKey: ['quotations', organization?.id, filters],
    queryFn: async () => {
      if (!organization?.id) return [];
      let query = supabase
        .from('quotations')
        .select('*, clients(name)')
        .eq('org_id', organization.id)
        .order('created_at', { ascending: false });
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.search) query = query.or(`destination.ilike.%${filters.search}%,hotel_name.ilike.%${filters.search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useQuotation(id: string | undefined) {
  return useQuery({
    queryKey: ['quotation', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotations')
        .select('*, clients(name, phone, email)')
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Cotação não encontrada');
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();
  const { organization, user } = useAuthStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: QuotationFormValues & Record<string, any>) => {
      // 1. Interceptar arrays não estruturados
      const { 
        installments, 
        itinerary, 
        transports, 
        excursions, 
        included_items, 
        excluded_items, 
        media_urls,
        ...rest 
      } = data;
      
      const payload = {
        ...rest,
        included_items: included_items || [],
        excluded_items: excluded_items || [],
        media_urls: media_urls || [],
        installments: installments ? JSON.parse(JSON.stringify(installments)) : null,
        org_id: organization!.id,
        agent_id: user!.id,
      };

      // 2. Inserir a Cotação Primária
      const { data: quotation, error } = await supabase
        .from('quotations')
        .insert(payload)
        .select()
        .single();
        
      if (error) throw error;

      // 3. Fila de inserções relacionais (Fan-out)
      const relationsPromises: Promise<any>[] = [];

      // Mapeamento: Itinerário
      if (itinerary && Array.isArray(itinerary) && itinerary.length > 0) {
        const daysPayload = itinerary.map((d: any, ix: number) => ({
          quote_id: quotation.id,
          day_number: d.day || ix + 1,
          date: d.date || null,
          city: d.location || '',
          label: d.title || `Dia ${ix + 1}`,
        }));
        
        // Precisamos inserir e recuperar IDs para os itens do itinerário, mas 
        // para manter rápido, enviamos a description direto pro itinerário_days não funciona, 
        // então iteramos e inserimos os dias, depois os itens.
        relationsPromises.push(
          (async () => {
             const { data: insertedDays } = await supabase
               .from('itinerary_days')
               .insert(daysPayload)
               .select('id, day_number');
             
             if (insertedDays && insertedDays.length > 0) {
               const itemsPayload: any[] = [];
               itinerary.forEach((d: any, ix: number) => {
                 if (!d.description) return;
                 const dbDay = insertedDays.find(id => id.day_number === (d.day || ix + 1));
                 if (dbDay) {
                   itemsPayload.push({
                     itinerary_day_id: dbDay.id,
                     description: d.description,
                     order_position: 1
                   });
                 }
               });
               if (itemsPayload.length > 0) {
                 await supabase.from('itinerary_items').insert(itemsPayload);
               }
             }
          })()
        );
      }

      // Mapeamento: Transportes e Voos
      if (transports && Array.isArray(transports) && transports.length > 0) {
        const flightsPayload: any[] = [];
        const transfersPayload: any[] = [];
        let flightOrder = 1;
        let transOrder = 1;

        transports.forEach((t: any) => {
          if (t.type === 'aereo') {
            flightsPayload.push({
              quote_id: quotation.id,
              airline_name: t.operator || 'Aéreo',
              direction: flightOrder === 1 ? 'outbound' : 'return',
              order_position: flightOrder++,
              _tempSegments: [{
                segment_order: 1,
                departure_airport_code: t.from,
                departure_airport_city: t.from, // Simplificação
                arrival_airport_code: t.to,
                arrival_airport_city: t.to,
                departure_datetime: t.departure || null,
                arrival_datetime: t.arrival || null,
                connection_info: t.notes
              }]
            });
          } else {
            transfersPayload.push({
              quote_id: quotation.id,
              tipo: t.type,
              nome: `Transfer (${t.from} → ${t.to})`,
              fornecedor: t.operator,
              data_inicio: (t.departure && t.departure.length > 10) ? t.departure.slice(0, 10) : null,
              instrucoes: t.notes,
              order_position: transOrder++
            });
          }
        });

        if (transfersPayload.length > 0) {
          relationsPromises.push(supabase.from('quote_transfers').insert(transfersPayload));
        }

        if (flightsPayload.length > 0) {
          relationsPromises.push(
            (async () => {
               for (const f of flightsPayload) {
                 const segs = f._tempSegments;
                 delete f._tempSegments;
                 const { data: nFlight } = await supabase.from('flights').insert(f).select('id').single();
                 if (nFlight && segs.length > 0) {
                   const segments = segs.map((s: any) => ({ ...s, flight_id: nFlight.id }));
                   await supabase.from('flight_segments').insert(segments);
                 }
               }
            })()
          );
        }
      }

      // Mapeamento: Passeios / Excursions
      if (excursions && Array.isArray(excursions) && excursions.length > 0) {
        const excPayload = excursions.map((e: any, ix: number) => ({
          quote_id: quotation.id,
          nome: e.title,
          instrucoes: e.description,
          order_position: ix + 1,
        }));
        relationsPromises.push(supabase.from('quote_experiences').insert(excPayload));
      }

      // Esperar todos os mapeamentos atômicos finalizarem
      if (relationsPromises.length > 0) {
        await Promise.allSettled(relationsPromises).catch(console.error);
      }

      return quotation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast({ title: 'Cotação criada com sucesso!', description: 'Itens mapeados para as tabelas relacionais.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao criar cotação', description: err.message, variant: 'destructive' });
    },
  });
}

export function useUpdateQuotation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<QuotationFormValues> & Record<string, any>) => {
      const { 
        installments, 
        itinerary, 
        transports, 
        excursions, 
        included_items, 
        excluded_items, 
        media_urls,
        ...rest 
      } = data;
      
      const payload: any = { ...rest };
      if (installments !== undefined) payload.installments = installments ? JSON.parse(JSON.stringify(installments)) : null;
      if (included_items !== undefined) payload.included_items = included_items;
      if (excluded_items !== undefined) payload.excluded_items = excluded_items;
      if (media_urls !== undefined) payload.media_urls = media_urls;

      const { data: quotation, error } = await supabase
        .from('quotations')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Nota: numa atualização de dados relacionais na prática, teríamos que excluir os filhos antigos e recriar.
      // Como o Quotation Builder Sheet ainda tenta enviar tudo toda vez que carrega e edita, se 'itinerary' existir,
      // apagamos os velhos e recriamos para manter simplicidade na prototipagem, ou mantemos os antigos para não ser destrutivo.
      // Optamos por limpar e recriar as seções se vieram novos arrays:
      
      const updatePromises: Promise<any>[] = [];
      
      if (itinerary && Array.isArray(itinerary)) {
         updatePromises.push((async () => {
             const { data: oldDays } = await supabase.from('itinerary_days').select('id').eq('quote_id', id);
             if (oldDays?.length) await supabase.from('itinerary_days').delete().in('id', oldDays.map(d => d.id));
             
             if (itinerary.length > 0) {
                 const daysPayload = itinerary.map((d: any, ix: number) => ({
                   quote_id: id,
                   day_number: d.day || ix + 1,
                   date: d.date || null,
                   city: d.location || '',
                   label: d.title || `Dia ${ix + 1}`,
                 }));
                 const { data: insertedDays } = await supabase.from('itinerary_days').insert(daysPayload).select('id, day_number');
                 if (insertedDays?.length) {
                   const itemsPayload: any[] = [];
                   itinerary.forEach((d: any, ix: number) => {
                     if (!d.description) return;
                     const dbDay = insertedDays.find(idDay => idDay.day_number === (d.day || ix + 1));
                     if (dbDay) itemsPayload.push({ itinerary_day_id: dbDay.id, description: d.description, order_position: 1 });
                   });
                   if (itemsPayload.length > 0) await supabase.from('itinerary_items').insert(itemsPayload);
                 }
             }
         })());
      }
      
      if (transports && Array.isArray(transports)) {
         updatePromises.push((async () => {
            const { data: oldTransfers } = await supabase.from('quote_transfers').select('id').eq('quote_id', id);
            if (oldTransfers?.length) await supabase.from('quote_transfers').delete().in('id', oldTransfers.map(d => d.id));
            const { data: oldFlights } = await supabase.from('flights').select('id').eq('quote_id', id);
            if (oldFlights?.length) await supabase.from('flights').delete().in('id', oldFlights.map(f => f.id));
            
            // Refazer binds
            if (transports.length > 0) {
              const flightsPayload: any[] = [];
              const transfersPayload: any[] = [];
              let fOrder = 1, tOrder = 1;
              transports.forEach((t: any) => {
                if (t.type === 'aereo') {
                  flightsPayload.push({ quote_id: id, airline_name: t.operator || 'Aéreo', direction: fOrder === 1 ? 'outbound' : 'return', order_position: fOrder++, _ts: t });
                } else {
                  transfersPayload.push({ quote_id: id, tipo: t.type, nome: `Transfer (${t.from} → ${t.to})`, fornecedor: t.operator, data_inicio: t.departure?.slice(0, 10) || null, instrucoes: t.notes, order_position: tOrder++ });
                }
              });
              if (transfersPayload.length > 0) await supabase.from('quote_transfers').insert(transfersPayload);
              if (flightsPayload.length > 0) {
                for (const f of flightsPayload) {
                 const t = f._ts; delete f._ts;
                 const { data: nf } = await supabase.from('flights').insert(f).select('id').single();
                 if (nf) await supabase.from('flight_segments').insert([{ flight_id: nf.id, segment_order: 1, departure_airport_code: t.from, departure_airport_city: t.from, arrival_airport_code: t.to, arrival_airport_city: t.to, departure_datetime: t.departure || null, arrival_datetime: t.arrival || null, connection_info: t.notes }]);
                }
              }
            }
         })());
      }
      
      if (excursions && Array.isArray(excursions)) {
         updatePromises.push((async () => {
             const { data: oldExc } = await supabase.from('quote_experiences').select('id').eq('quote_id', id);
             if (oldExc?.length) await supabase.from('quote_experiences').delete().in('id', oldExc.map(e => e.id));
             if (excursions.length > 0) {
                 const excPayload = excursions.map((e: any, ix: number) => ({ quote_id: id, nome: e.title, instrucoes: e.description, order_position: ix + 1 }));
                 await supabase.from('quote_experiences').insert(excPayload);
             }
         })());
      }

      if (updatePromises.length > 0) await Promise.allSettled(updatePromises).catch(console.error);

      return quotation;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotation', vars.id] });
      toast({ title: 'Cotação atualizada!', description: 'Seções relacionais sincronizadas.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    },
  });
}

export function useDeleteQuotation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('quotations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast({ title: 'Cotação excluída.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    },
  });
}
