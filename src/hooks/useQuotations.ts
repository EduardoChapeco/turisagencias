import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import type { QuotationFormValues } from '@/types';

function createPublicToken() {
  return crypto.randomUUID().replace(/-/g, '');
}

function raiseRelationError(error: unknown, context: string) {
  if (!error) return;
  const message = error instanceof Error
    ? error.message
    : typeof error === 'object' && error && 'message' in error
      ? String((error as { message: unknown }).message)
      : String(error);
  throw new Error(`${context}: ${message}`);
}

async function waitForRelationWrites(promises: Promise<unknown>[]) {
  const results = await Promise.allSettled(promises);
  const failure = results.find((result): result is PromiseRejectedResult => result.status === 'rejected');
  if (failure) {
    raiseRelationError(failure.reason, 'Falha ao sincronizar dados relacionais da cotacao');
  }
}

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
        public_token: rest.public_token || createPublicToken(),
      };

      // 2. Inserir a Cotação Primária
      const { data: quotation, error } = await supabase
        .from('quotations')
        .insert(payload)
        .select()
        .single();
        
      if (error) throw error;

      // 3. Fila de inserções relacionais (Fan-out)
      const relationsPromises: Promise<unknown>[] = [];

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
             const { data: insertedDays, error: daysError } = await supabase
               .from('itinerary_days')
               .insert(daysPayload)
               .select('id, day_number');
             raiseRelationError(daysError, 'Criacao dos dias do roteiro');
             
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
                  const { error: itemsError } = await supabase.from('itinerary_items').insert(itemsPayload);
                  raiseRelationError(itemsError, 'Criacao dos itens do roteiro');
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
          relationsPromises.push((async () => {
            const { error: transfersError } = await supabase.from('quote_transfers').insert(transfersPayload);
            raiseRelationError(transfersError, 'Criacao dos transfers da cotacao');
          })());
        }

        if (flightsPayload.length > 0) {
          relationsPromises.push(
            (async () => {
               for (const f of flightsPayload) {
                 const segs = f._tempSegments;
                 delete f._tempSegments;
                 const { data: nFlight, error: flightError } = await supabase.from('flights').insert(f).select('id').single();
                 raiseRelationError(flightError, 'Criacao dos voos da cotacao');
                 if (nFlight && segs.length > 0) {
                   const segments = segs.map((s: any) => ({ ...s, flight_id: nFlight.id }));
                   const { error: segmentsError } = await supabase.from('flight_segments').insert(segments);
                   raiseRelationError(segmentsError, 'Criacao dos segmentos de voo da cotacao');
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
        relationsPromises.push((async () => {
          const { error: experiencesError } = await supabase.from('quote_experiences').insert(excPayload);
          raiseRelationError(experiencesError, 'Criacao dos passeios da cotacao');
        })());
      }

      if (relationsPromises.length > 0) {
        await waitForRelationWrites(relationsPromises);
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

      // Traduz propriedades legadas para as colunas canônicas do banco
      if (payload.adults !== undefined) {
        payload.num_adults = payload.adults;
        delete payload.adults;
      }
      if (payload.children !== undefined) {
        payload.num_children = payload.children;
        delete payload.children;
      }
      if (payload.pax_adultos !== undefined) {
        payload.num_adults = payload.pax_adultos;
        delete payload.pax_adultos;
      }
      if (payload.pax_criancas !== undefined) {
        payload.num_children = payload.pax_criancas;
        delete payload.pax_criancas;
      }
      if (payload.markup_percent !== undefined) {
        payload.markup_pct = payload.markup_percent;
        delete payload.markup_percent;
      }

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
      
      const updatePromises: Promise<unknown>[] = [];
      
      if (itinerary && Array.isArray(itinerary)) {
         updatePromises.push((async () => {
             const { data: oldDays, error: oldDaysError } = await supabase.from('itinerary_days').select('id').eq('quote_id', id);
             raiseRelationError(oldDaysError, 'Leitura dos dias antigos do roteiro');
             if (oldDays?.length) {
               const { error: deleteDaysError } = await supabase.from('itinerary_days').delete().in('id', oldDays.map(d => d.id));
               raiseRelationError(deleteDaysError, 'Remocao dos dias antigos do roteiro');
             }
             
             if (itinerary.length > 0) {
                 const daysPayload = itinerary.map((d: any, ix: number) => ({
                   quote_id: id,
                   day_number: d.day || ix + 1,
                   date: d.date || null,
                   city: d.location || '',
                   label: d.title || `Dia ${ix + 1}`,
                 }));
                 const { data: insertedDays, error: daysError } = await supabase.from('itinerary_days').insert(daysPayload).select('id, day_number');
                 raiseRelationError(daysError, 'Recriacao dos dias do roteiro');
                 if (insertedDays?.length) {
                   const itemsPayload: any[] = [];
                   itinerary.forEach((d: any, ix: number) => {
                     if (!d.description) return;
                     const dbDay = insertedDays.find(idDay => idDay.day_number === (d.day || ix + 1));
                     if (dbDay) itemsPayload.push({ itinerary_day_id: dbDay.id, description: d.description, order_position: 1 });
                   });
                   if (itemsPayload.length > 0) {
                     const { error: itemsError } = await supabase.from('itinerary_items').insert(itemsPayload);
                     raiseRelationError(itemsError, 'Recriacao dos itens do roteiro');
                   }
                 }
             }
         })());
      }
      
      if (transports && Array.isArray(transports)) {
         updatePromises.push((async () => {
            const { data: oldTransfers, error: oldTransfersError } = await supabase.from('quote_transfers').select('id').eq('quote_id', id);
            raiseRelationError(oldTransfersError, 'Leitura dos transfers antigos da cotacao');
            if (oldTransfers?.length) {
              const { error: deleteTransfersError } = await supabase.from('quote_transfers').delete().in('id', oldTransfers.map(d => d.id));
              raiseRelationError(deleteTransfersError, 'Remocao dos transfers antigos da cotacao');
            }
            const { data: oldFlights, error: oldFlightsError } = await supabase.from('flights').select('id').eq('quote_id', id);
            raiseRelationError(oldFlightsError, 'Leitura dos voos antigos da cotacao');
            if (oldFlights?.length) {
              const { error: deleteFlightsError } = await supabase.from('flights').delete().in('id', oldFlights.map(f => f.id));
              raiseRelationError(deleteFlightsError, 'Remocao dos voos antigos da cotacao');
            }
            
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
              if (transfersPayload.length > 0) {
                const { error: transfersError } = await supabase.from('quote_transfers').insert(transfersPayload);
                raiseRelationError(transfersError, 'Recriacao dos transfers da cotacao');
              }
              if (flightsPayload.length > 0) {
                for (const f of flightsPayload) {
                 const t = f._ts; delete f._ts;
                 const { data: nf, error: flightError } = await supabase.from('flights').insert(f).select('id').single();
                 raiseRelationError(flightError, 'Recriacao dos voos da cotacao');
                 if (nf) {
                   const { error: segmentError } = await supabase.from('flight_segments').insert([{ flight_id: nf.id, segment_order: 1, departure_airport_code: t.from, departure_airport_city: t.from, arrival_airport_code: t.to, arrival_airport_city: t.to, departure_datetime: t.departure || null, arrival_datetime: t.arrival || null, connection_info: t.notes }]);
                   raiseRelationError(segmentError, 'Recriacao dos segmentos de voo da cotacao');
                 }
                }
              }
            }
         })());
      }
      
      if (excursions && Array.isArray(excursions)) {
         updatePromises.push((async () => {
             const { data: oldExc, error: oldExperiencesError } = await supabase.from('quote_experiences').select('id').eq('quote_id', id);
             raiseRelationError(oldExperiencesError, 'Leitura dos passeios antigos da cotacao');
             if (oldExc?.length) {
               const { error: deleteExperiencesError } = await supabase.from('quote_experiences').delete().in('id', oldExc.map(e => e.id));
               raiseRelationError(deleteExperiencesError, 'Remocao dos passeios antigos da cotacao');
             }
             if (excursions.length > 0) {
                 const excPayload = excursions.map((e: any, ix: number) => ({ quote_id: id, nome: e.title, instrucoes: e.description, order_position: ix + 1 }));
                 const { error: experiencesError } = await supabase.from('quote_experiences').insert(excPayload);
                 raiseRelationError(experiencesError, 'Recriacao dos passeios da cotacao');
             }
         })());
      }

      if (updatePromises.length > 0) await waitForRelationWrites(updatePromises);

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
