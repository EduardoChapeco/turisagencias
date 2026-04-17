import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

export type GroupTrip = {
  id: string;
  org_id: string;
  title: string;
  subtitle: string | null;
  slug: string | null;
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

const TABLE = 'group_trips' as any;

function slugify(s: string): string {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function useGroupTrips() {
  const { organization } = useAuthStore();
  return useQuery<GroupTrip[]>({
    queryKey: ['group_trips', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      const { data, error } = await (supabase as any)
        .from(TABLE)
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
      const { data, error } = await (supabase as any)
        .from(TABLE)
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
      const baseSlug = slugify(title) || 'pacote';
      const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;
      const { data, error } = await (supabase as any)
        .from(TABLE)
        .insert({
          ...payload,
          title,
          slug: payload.slug || uniqueSlug,
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
      const { data, error } = await (supabase as any)
        .from(TABLE)
        .update(payload)
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
      const { error } = await (supabase as any).from(TABLE).delete().eq('id', id);
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
      const { data, error } = await (supabase as any)
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
      const { id, ...rest } = payload as any;
      if (id) {
        const { data, error } = await (supabase as any)
          .from('group_trip_days').update(rest).eq('id', id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await (supabase as any)
        .from('group_trip_days').insert(rest).select().single();
      if (error) throw error;
      return data;
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
      const { error } = await (supabase as any).from('group_trip_days').delete().eq('id', id);
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
      const { data, error } = await (supabase as any)
        .from('group_bookings')
        .insert({ ...payload, status: 'pending' })
        .select('id, public_token')
        .single();
      if (error) throw error;
      // gera carnê
      const { error: rpcError } = await (supabase as any).rpc('generate_booking_installments', { _booking_id: data.id });
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
      const { data: booking, error } = await (supabase as any)
        .from('group_bookings')
        .select('*, group_trips(title, destination, departure_date, return_date, currency, cover_image_url, slug)')
        .eq('public_token', token)
        .maybeSingle();
      if (error) throw error;
      if (!booking) return null;
      const { data: installments } = await (supabase as any)
        .from('booking_installments')
        .select('*')
        .eq('booking_id', booking.id)
        .order('installment_number');
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
  installments_count: number;
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
      const { data, error } = await (supabase as any).rpc('get_public_group_trip', { _slug: slug });
      if (error) throw error;
      const row = (data as PublicGroupTrip[])?.[0] || null;
      if (!row) return { trip: null, days: [] as GroupTripDay[] };
      const { data: days } = await (supabase as any)
        .from('group_trip_days')
        .select('*')
        .eq('group_trip_id', row.id)
        .order('day_number');
      return { trip: row, days: (days || []) as GroupTripDay[] };
    },
    enabled: !!slug,
  });
}
