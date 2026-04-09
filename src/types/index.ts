import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type AppRole = 'super_admin' | 'org_admin' | 'agent' | 'support' | 'client';

export interface InstallmentOption {
  type: string;
  value: number;
  installment_count: number;
}

export type ClientFormValues = Omit<
  TablesInsert<'clients'>,
  'id' | 'org_id' | 'created_by' | 'created_at' | 'updated_at'
>;

export type TravelerFormValues = Omit<
  TablesInsert<'travelers'>,
  'id' | 'org_id' | 'created_at' | 'updated_at' | 'form_token' | 'form_completed_at'
>;

export type QuotationFormValues = Omit<
  TablesInsert<'quotations'>,
  'id' | 'org_id' | 'agent_id' | 'created_at' | 'updated_at' | 'share_token' | 'viewed_at' | 'installments'
> & {
  installments?: InstallmentOption[] | null;
};

export interface PublicQuotationData {
  destination: string | null;
  hotel_name: string | null;
  hotel_stars: number | null;
  hotel_photo_url: string | null;
  check_in: string | null;
  check_out: string | null;
  num_nights: number | null;
  meal_plan: string | null;
  room_type: string | null;
  total_value: number | null;
  currency: string | null;
  installments: InstallmentOption[] | null;
  org_name: string | null;
  org_logo: string | null;
  org_whatsapp: string | null;
  org_primary_color: string | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string | null;
  whatsapp: string | null;
  plan: string | null;
  settings: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  org_id: string | null;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}
