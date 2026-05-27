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
 
 // Builder Canonical Schema Tables
 builder_form_submissions: {
 Row: {
 id: string;
 org_id: string;
 project_id: string | null;
 form_type: string;
 payload: any;
 submitter_email: string | null;
 submitter_name: string | null;
 submitter_phone: string | null;
 ip_address: string | null;
 user_agent: string | null;
 lead_id: string | null;
 created_at: string;
 };
 Insert: Omit<ExtendedDatabase['public']['Tables']['builder_form_submissions']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
 Update: Partial<ExtendedDatabase['public']['Tables']['builder_form_submissions']['Insert']>;
 };
 builder_analytics_events: {
 Row: {
 id: string;
 org_id: string;
 project_id: string | null;
 event_type: string;
 event_data: any;
 session_id: string | null;
 ip_address: string | null;
 referrer: string | null;
 created_at: string;
 };
 Insert: Omit<ExtendedDatabase['public']['Tables']['builder_analytics_events']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
 Update: Partial<ExtendedDatabase['public']['Tables']['builder_analytics_events']['Insert']>;
 };
 
 // Commission Core Tables
 agent_commission_rules: {
 Row: {
 id: string;
 org_id: string;
 name: string;
 description: string | null;
 rule_type: string;
 tiers: any;
 base_percentage: number | null;
 base_fixed_amount: number | null;
 over_percentage: number | null;
 over_operator_tax: number | null;
 valid_from: string | null;
 valid_until: string | null;
 is_active: boolean;
 created_at: string;
 updated_at: string;
 created_by: string | null;
 };
 Insert: Omit<ExtendedDatabase['public']['Tables']['agent_commission_rules']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
 Update: Partial<ExtendedDatabase['public']['Tables']['agent_commission_rules']['Insert']>;
 };
 agent_commission_periods: {
 Row: {
 id: string;
 org_id: string;
 agent_id: string;
 period_start: string;
 period_end: string;
 status: string;
 total_sales: number;
 total_commission: number;
 total_over: number;
 total_incentives: number;
 total_adjustments: number;
 total_final: number;
 calculated_at: string | null;
 approved_at: string | null;
 approved_by: string | null;
 paid_at: string | null;
 notes: string | null;
 created_at: string;
 updated_at: string;
 };
 Insert: Omit<ExtendedDatabase['public']['Tables']['agent_commission_periods']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
 Update: Partial<ExtendedDatabase['public']['Tables']['agent_commission_periods']['Insert']>;
 };
 agent_commission_entries: {
 Row: {
 id: string;
 org_id: string;
 period_id: string | null;
 agent_id: string;
 rule_id: string | null;
 sale_type: string;
 sale_id: string | null;
 sale_reference: string | null;
 sale_gross_amount: number;
 sale_net_amount: number;
 over_gross: number;
 over_operator_tax: number;
 over_net: number;
 commission_base: number;
 commission_over: number;
 commission_incentives: number;
 commission_adjustments: number;
 commission_total: number;
 meta_percentage: number | null;
 status: string;
 calculated_at: string;
 confirmed_at: string | null;
 cancelled_at: string | null;
 cancellation_reason: string | null;
 notes: string | null;
 created_at: string;
 updated_at: string;
 };
 Insert: Omit<ExtendedDatabase['public']['Tables']['agent_commission_entries']['Row'], 'id' | 'created_at' | 'updated_at' | 'calculated_at'> & { id?: string; created_at?: string; updated_at?: string; calculated_at?: string };
 Update: Partial<ExtendedDatabase['public']['Tables']['agent_commission_entries']['Insert']>;
 };
 agent_commission_adjustments: {
 Row: {
 id: string;
 org_id: string;
 period_id: string;
 agent_id: string;
 adjustment_type: string;
 amount: number;
 reason: string;
 created_by: string;
 created_at: string;
 };
 Insert: Omit<ExtendedDatabase['public']['Tables']['agent_commission_adjustments']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string };
 Update: Partial<ExtendedDatabase['public']['Tables']['agent_commission_adjustments']['Insert']>;
 };
 
 // Automation Jobs
 automation_jobs: {
 Row: {
 id: string;
 org_id: string;
 rule_id: string | null;
 trigger_type: string;
 event_payload: any;
 status: string;
 scheduled_for: string;
 started_at: string | null;
 completed_at: string | null;
 error_message: string | null;
 error_stack: string | null;
 retry_count: number;
 max_retries: number;
 created_at: string;
 updated_at: string;
 };
 Insert: Omit<ExtendedDatabase['public']['Tables']['automation_jobs']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
 Update: Partial<ExtendedDatabase['public']['Tables']['automation_jobs']['Insert']>;
 };
 };
 };
};

export type ExtendedSupabaseClient = SupabaseClient<ExtendedDatabase>;
