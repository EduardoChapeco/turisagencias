import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import type { BusLayout } from '@/components/group-trips/BusSeatMap';

export type GroupTrip = {
  id: string;
  org_id: string;
  title: string;
  subtitle: string | null;
  slug: string | null;
  slug_locked: boolean;
  slug_updated_at: string | null;
  cover_image_url: string | null;
  gallery_urls: string[] | null;
  destination: string | null;
  origin_city: string | null;
  departure_date: string | null;
  return_date: string | null;
  num_days: number | null;
  num_nights: number | null;
  price_per_pax: number;
  currency: string;
  max_pax: number;
  current_pax: number;
  description_md: string | null;
  includes: string[] | null;
  excludes: string[] | null;
  important_notes: string | null;
  transport_type: string | null;
  bus_layout_id: string | null;
  installments_count: number;
  payment_due_offset_days: number;
  contract_template_id: string | null;
  status: 'draft' | 'published' | 'closed' | 'cancelled';
  is_public: boolean;
  view_count: number;
  booking_count: number;
  created_at: string;
  updated_at: string;
};

export function slugifyGroupTrip(s: string): string {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

async function resolveUniqueGroupTripSlug(seed: string, currentId?: string | null): Promise<string> {
  const base = slugifyGroupTrip(seed) || 'pacote';
  let candidate = base;
  let suffix = 2;

  while (suffix < 1000) {
    const { data, error } = await supabase
      .from('group_trips')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle();
    if (error) throw error;
    if (!data || data.id === currentId) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return `${base}-${Date.now().toString(36)}`;
}

export function useGroupTrips() {
  const { organization } = useAuthStore();
  return useQuery<GroupTrip[]>({
    queryKey: ['group_trips', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      const { data, error } = await supabase
        .from('group_trips')
        .select('*')
        .eq('org_id', organization.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as GroupTrip[];
    },
    enabled: !!organization?.id,
  });
}

export function useGroupTrip(id: string | undefined) {
  return useQuery<GroupTrip | null>({
    queryKey: ['group_trip', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('group_trips')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as GroupTrip | null;
    },
    enabled: !!id,
  });
}

export function useCreateGroupTrip() {
  const qc = useQueryClient();
  const { organization } = useAuthStore();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: Partial<GroupTrip>) => {
      if (!organization?.id) throw new Error('Sem organização');
      const title = payload.title || 'Novo Pacote';
      const uniqueSlug = await resolveUniqueGroupTripSlug(payload.slug || title);
      const { data, error } = await supabase
        .from('group_trips')
        .insert({
          ...payload,
          title,
          slug: uniqueSlug,
          slug_locked: payload.slug_locked ?? false,
          slug_updated_at: new Date().toISOString(),
          org_id: organization.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data as GroupTrip;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['group_trips'] });
      toast({ title: 'Pacote criado' });
    },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

export function useUpdateGroupTrip() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<GroupTrip> & { id: string }) => {
      const { data: current, error: currentError } = await supabase
        .from('group_trips')
        .select('id, title, slug, status, is_public, slug_locked')
        .eq('id', id)
        .maybeSingle();
      if (currentError) throw currentError;

      const nextPayload: Record<string, unknown> = { ...payload };
      const hasManualSlug = typeof payload.slug === 'string' && payload.slug.trim().length > 0;
      const isPublished = current?.status === 'published' || current?.is_public === true;

      if (hasManualSlug) {
        nextPayload.slug = await resolveUniqueGroupTripSlug(payload.slug!, id);
        nextPayload.slug_locked = true;
        nextPayload.slug_updated_at = new Date().toISOString();
      } else if (
        typeof payload.title === 'string'
        && payload.title.trim()
        && !current?.slug_locked
        && !isPublished
      ) {
        nextPayload.slug = await resolveUniqueGroupTripSlug(payload.title, id);
        nextPayload.slug_updated_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('group_trips')
        .update(nextPayload as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as GroupTrip;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['group_trips'] });
      qc.invalidateQueries({ queryKey: ['group_trip', vars.id] });
      toast({ title: 'Pacote atualizado' });
    },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

export function useDeleteGroupTrip() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('group_trips').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['group_trips'] });
      toast({ title: 'Pacote removido' });
    },
    onError: (e: Error) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

// ───────────── Days
export type GroupTripDay = {
  id: string;
  group_trip_id: string;
  day_number: number;
  title: string;
  description_md: string | null;
  media: { url: string; type: 'image' | 'video'; caption?: string }[];
  highlights: string[] | null;
  created_at: string;
};

export function useGroupTripDays(tripId: string | undefined) {
  return useQuery<GroupTripDay[]>({
    queryKey: ['group_trip_days', tripId],
    queryFn: async () => {
      if (!tripId) return [];
      const { data, error } = await supabase
        .from('group_trip_days')
        .select('*')
        .eq('group_trip_id', tripId)
        .order('day_number');
      if (error) throw error;
      return (data || []) as GroupTripDay[];
    },
    enabled: !!tripId,
  });
}

export function useUpsertGroupTripDay() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: Partial<GroupTripDay> & { group_trip_id: string }) => {
      const { id, ...rest } = payload;
      if (id) {
        const { data, error } = await supabase
          .from('group_trip_days').update(rest).eq('id', id).select().single();
        if (error) throw error;
        return data as GroupTripDay;
      }
      const { data, error } = await supabase
        .from('group_trip_days').insert(rest).select().single();
      if (error) throw error;
      return data as GroupTripDay;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['group_trip_days', vars.group_trip_id] });
    },
    onError: (e: Error) => toast({ title: 'Erro ao salvar dia', description: e.message, variant: 'destructive' }),
  });
}

export function useDeleteGroupTripDay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, tripId: _ }: { id: string; tripId: string }) => {
      const { error } = await supabase.from('group_trip_days').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['group_trip_days', vars.tripId] });
    },
  });
}

// ───────────── Public booking
export function useCreatePublicBooking() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: {
      group_trip_id: string;
      org_id: string;
      lead_name: string;
      lead_email?: string;
      lead_phone?: string;
      lead_cpf?: string;
      pax_count: number;
      total_amount: number;
    }) => {
      const { data, error } = await supabase
        .from('group_bookings')
        .insert({ ...payload, status: 'pending' })
        .select('id, public_token')
        .single();
      if (error) throw error;
      // gera carnê
      const { error: rpcError } = await supabase.rpc('generate_booking_installments', { _booking_id: data.id });
      if (rpcError) throw rpcError;
      return data as { id: string; public_token: string };
    },
    onError: (e: Error) => toast({ title: 'Erro ao reservar', description: e.message, variant: 'destructive' }),
  });
}

export function usePublicBooking(token: string | undefined) {
  return useQuery({
    queryKey: ['public_booking', token],
    queryFn: async () => {
      if (!token) return null;
      // [SENTINEL] — Include org branding (logo, color, whatsapp) via nested join
      // group_trips does NOT have org_logo — it must come from organizations
      const { data: booking, error } = await supabase
        .from('group_bookings')
        .select(`
          *,
          group_trips(
            title, destination, departure_date, return_date,
            currency, cover_image_url, slug,
            organizations(name, logo_url, primary_color, whatsapp)
          )
        `)
        .eq('public_token', token)
        .maybeSingle();
      if (error) throw error;
      if (!booking) return null;

      const { data: installments, error: instError } = await supabase
        .from('booking_installments')
        .select('*')
        .eq('booking_id', booking.id)
        .order('installment_number');
      if (instError) throw instError;

      // Flatten org branding to trip level for convenient access in UI
      const trip = (booking as any).group_trips;
      const org = trip?.organizations ?? null;
      if (trip && org) {
        trip.org_name = org.name;
        trip.org_logo = org.logo_url;
        trip.org_primary_color = org.primary_color;
        trip.org_whatsapp = org.whatsapp;
      }

      return { booking, installments: installments || [] };
    },
    enabled: !!token,
  });
}

// ───────────── Public
export type PublicGroupTrip = {
  id: string;
  org_id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  cover_image_url: string | null;
  gallery_urls: string[] | null;
  destination: string | null;
  origin_city: string | null;
  departure_date: string | null;
  return_date: string | null;
  num_days: number | null;
  num_nights: number | null;
  price_per_pax: number;
  currency: string;
  max_pax: number;
  current_pax: number;
  description_md: string | null;
  includes: string[] | null;
  excludes: string[] | null;
  important_notes: string | null;
  transport_type: string | null;
  bus_layout_id: string | null;
  installments_count: number;
  bus_layout: BusLayout | null;
  occupied_seats: string[] | null;
  org_name: string;
  org_logo: string | null;
  org_whatsapp: string | null;
  org_primary_color: string | null;
};

export function usePublicGroupTrip(slug: string | undefined) {
  return useQuery({
    queryKey: ['public_group_trip', slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase.rpc('get_public_group_trip', { _slug: slug });
      if (error) throw error;
      const row = (data as PublicGroupTrip[])?.[0] || null;
      if (!row) return { trip: null, days: [] as GroupTripDay[] };
      const { data: days } = await supabase
        .from('group_trip_days')
        .select('*')
        .eq('group_trip_id', row.id)
        .order('day_number');
      return { trip: row, days: (days || []) as GroupTripDay[] };
    },
    enabled: !!slug,
  });
}

// ── Transfer Booking ────────────────────────────────────────────────────────
export function useTransferBooking() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({
      bookingId,
      newTripId,
      reason,
    }: {
      bookingId: string;
      newTripId: string;
      reason: string;
    }) => {
      const { error } = await supabase.rpc('transfer_booking_to_trip', {
        p_booking_id: bookingId,
        p_new_trip_id: newTripId,
        p_reason: reason,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['group_trips'] });
      qc.invalidateQueries({ queryKey: ['group_trip_bookings_full'] });
      qc.invalidateQueries({ queryKey: ['group_trip_finance_summary'] });
      toast({ title: 'Reserva transferida com sucesso!' });
    },
    onError: (e: Error) => toast({ title: 'Erro na transferência', description: e.message, variant: 'destructive' }),
  });
}
