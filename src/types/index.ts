import type { Tables, TablesInsert } from '@/integrations/supabase/types';

/** Typed content block for hotel sections (amenities, policies, etc.) */
export interface HotelSection {
 title: string;
 content: string;
 icon?: string;
}

/** Itinerary day in a public quotation */
export interface QuotationItineraryDay {
 day_number: number;
 title: string;
 description?: string | null;
 items?: { order_position: number; title: string; description?: string | null }[];
}

/** Transport segment in a public quotation */
export interface QuotationTransport {
 type: string;
 from: string;
 to: string;
 departure_time?: string | null;
 arrival_time?: string | null;
}

/** Excursion/experience in a public quotation */
export interface QuotationExcursion {
 name: string;
 description?: string | null;
 photo_url?: string | null;
 order_position?: number;
}

export type AppRole = 'super_admin' | 'org_admin' | 'agent' | 'finance' | 'support' | 'client' | 'public';

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
 'id' | 'org_id' | 'agent_id' | 'created_at' | 'updated_at' | 'viewed_at' | 'installments'
> & {
 installments?: InstallmentOption[] | null;
};

export type TripFormValues = Omit<
 TablesInsert<'trips'>,
 'id' | 'org_id' | 'created_at' | 'updated_at'
>;

export type HotelFormValues = Omit<
 TablesInsert<'hotels_bank'>,
 'id' | 'org_id' | 'created_at' | 'updated_at'
> & {
 gallery_urls?: string[];
 sections?: HotelSection[];
 video_url?: string | null;
};

export interface PublicQuotationData {
 id: string;
 created_at?: string | null;
 destination: string | null;
 hotel_name: string | null;
 hotel_stars: number | null;
 hotel_photo_url: string | null;
 check_in: string | null;
 check_out: string | null;
 num_nights: number | null;
 num_adults?: number | null;
 num_children?: number | null;
 meal_plan: string | null;
 room_type: string | null;
 total_value: number | null;
 currency: string | null;
 installments: InstallmentOption[] | null;
 org_name: string | null;
 org_logo: string | null;
 org_whatsapp: string | null;
 org_primary_color: string | null;
 whatsapp_text?: string | null;
 cover_image_url?: string | null;
 cover_title?: string | null;
 pricing_mode?: string | null;
 valid_until?: string | null;
 notes?: string | null;
 itinerary?: QuotationItineraryDay[];
 transports?: QuotationTransport[];
 excursions?: QuotationExcursion[];
 included_items?: string[];
 excluded_items?: string[];
}

export interface Organization {
 address: Record<string, unknown> | null;
 ai_keys_config: Record<string, unknown> | null;
 id: string;
 email: string | null;
 is_active: boolean;
 name: string;
 phone: string | null;
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
 email: string | null;
 whatsapp: string | null;
 bio: string | null;
 is_active: boolean;
 last_seen_at: string | null;
 notification_prefs: Record<string, unknown>;
 phone: string | null;
 created_at: string;
 updated_at: string;
}

export interface UserRole {
 id: string;
 user_id: string;
 role: AppRole;
}

export interface AppNotification {
 id: string;
 title: string;
 type: string;
 message: string | null;
 entity_type: string | null;
 entity_id: string | null;
 metadata: Record<string, unknown> | null;
 read_at: string | null;
 created_at: string;
}
