import { Database as GenDatabase } from './types';
import { SupabaseClient } from '@supabase/supabase-js';

// Estendendo o Database gerado com tabelas que ainda não foram sincronizadas
export type ExtendedDatabase = GenDatabase & {
  public: {
    Tables: GenDatabase['public']['Tables'] & {
      global_keys: {
        Row: {
          id: string;
          provider: string;
          api_key: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider: string;
          api_key: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<{
          provider: string;
          api_key: string;
          is_active: boolean;
        }>;
      };
      ai_tasks: {
        Row: { id: string; status: string; created_at: string };
        Insert: { status: string };
        Update: { status?: string };
      };
      ai_decision_logs: {
        Row: { id: string; action: string; user: string; details: string; created_at: string };
        Insert: { action: string; user: string; details: string };
        Update: Partial<{ action: string; user: string; details: string }>;
      };
    };
  };
};

export type ExtendedSupabaseClient = SupabaseClient<ExtendedDatabase>;
