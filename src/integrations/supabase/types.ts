export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_behavioral_profiles: {
        Row: {
          avg_response_time_hours: number | null
          behavioral_summary: string | null
          client_id: string
          communication_style: string | null
          conversations_analyzed: number | null
          created_at: string | null
          decision_style: string | null
          family_profile: Json | null
          id: string
          last_analyzed_at: string | null
          org_id: string
          personality_tags: string[] | null
          preferred_destinations: Json | null
          price_sensitivity: string | null
          satisfaction_score: number | null
          special_preferences: string | null
          travel_motivations: Json | null
          updated_at: string | null
        }
        Insert: {
          avg_response_time_hours?: number | null
          behavioral_summary?: string | null
          client_id: string
          communication_style?: string | null
          conversations_analyzed?: number | null
          created_at?: string | null
          decision_style?: string | null
          family_profile?: Json | null
          id?: string
          last_analyzed_at?: string | null
          org_id: string
          personality_tags?: string[] | null
          preferred_destinations?: Json | null
          price_sensitivity?: string | null
          satisfaction_score?: number | null
          special_preferences?: string | null
          travel_motivations?: Json | null
          updated_at?: string | null
        }
        Update: {
          avg_response_time_hours?: number | null
          behavioral_summary?: string | null
          client_id?: string
          communication_style?: string | null
          conversations_analyzed?: number | null
          created_at?: string | null
          decision_style?: string | null
          family_profile?: Json | null
          id?: string
          last_analyzed_at?: string | null
          org_id?: string
          personality_tags?: string[] | null
          preferred_destinations?: Json | null
          price_sensitivity?: string | null
          satisfaction_score?: number | null
          special_preferences?: string | null
          travel_motivations?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_behavioral_profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_decision_logs: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          ai_reasoning: string | null
          confidence_score: number | null
          created_at: string
          decision_type: string | null
          id: string
          input_summary: string | null
          layover_difference_minutes: number | null
          metadata: Json | null
          notes: string | null
          org_id: string
          outcome: string | null
          output_summary: string | null
          package_chosen_by_agent: string | null
          package_chosen_by_client: string | null
          package_recommended: string | null
          packages_offered: Json | null
          price_difference: number | null
          quotation_id: string | null
        }
        Insert: {
          agent_id?: string | null
          agent_name?: string | null
          ai_reasoning?: string | null
          confidence_score?: number | null
          created_at?: string
          decision_type?: string | null
          id?: string
          input_summary?: string | null
          layover_difference_minutes?: number | null
          metadata?: Json | null
          notes?: string | null
          org_id: string
          outcome?: string | null
          output_summary?: string | null
          package_chosen_by_agent?: string | null
          package_chosen_by_client?: string | null
          package_recommended?: string | null
          packages_offered?: Json | null
          price_difference?: number | null
          quotation_id?: string | null
        }
        Update: {
          agent_id?: string | null
          agent_name?: string | null
          ai_reasoning?: string | null
          confidence_score?: number | null
          created_at?: string
          decision_type?: string | null
          id?: string
          input_summary?: string | null
          layover_difference_minutes?: number | null
          metadata?: Json | null
          notes?: string | null
          org_id?: string
          outcome?: string | null
          output_summary?: string | null
          package_chosen_by_agent?: string | null
          package_chosen_by_client?: string | null
          package_recommended?: string | null
          packages_offered?: Json | null
          price_difference?: number | null
          quotation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_decision_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_decision_logs_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_keys_pool: {
        Row: {
          api_key: string
          created_at: string
          daily_limit: number | null
          error_count: number | null
          id: string
          is_active: boolean | null
          label: string | null
          last_used_at: string | null
          monthly_limit: number | null
          org_id: string
          priority: number | null
          provider: string
          reset_daily_at: string | null
          used_this_month: number | null
          used_today: number | null
        }
        Insert: {
          api_key: string
          created_at?: string
          daily_limit?: number | null
          error_count?: number | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          last_used_at?: string | null
          monthly_limit?: number | null
          org_id: string
          priority?: number | null
          provider: string
          reset_daily_at?: string | null
          used_this_month?: number | null
          used_today?: number | null
        }
        Update: {
          api_key?: string
          created_at?: string
          daily_limit?: number | null
          error_count?: number | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          last_used_at?: string | null
          monthly_limit?: number | null
          org_id?: string
          priority?: number | null
          provider?: string
          reset_daily_at?: string | null
          used_this_month?: number | null
          used_today?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_keys_pool_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_knowledge_base: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          org_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          org_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_knowledge_base_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_credentials: {
        Row: {
          created_at: string | null
          created_by: string | null
          encrypted_password: string
          id: string
          is_active: boolean | null
          last_used_at: string | null
          notes: string | null
          org_id: string
          portal_name: string
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          encrypted_password: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          notes?: string | null
          org_id: string
          portal_name?: string
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          encrypted_password?: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          notes?: string | null
          org_id?: string
          portal_name?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "b2b_credentials_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bio_link_blocks: {
        Row: {
          bio_link_id: string
          block_type: string
          config: Json
          created_at: string
          draft_only: boolean
          id: string
          is_visible: boolean
          layout_slot: string | null
          position: number
          size: string
          updated_at: string
          visibility_rules: Json
          workspace_id: string
        }
        Insert: {
          bio_link_id: string
          block_type: string
          config?: Json
          created_at?: string
          draft_only?: boolean
          id?: string
          is_visible?: boolean
          layout_slot?: string | null
          position?: number
          size?: string
          updated_at?: string
          visibility_rules?: Json
          workspace_id: string
        }
        Update: {
          bio_link_id?: string
          block_type?: string
          config?: Json
          created_at?: string
          draft_only?: boolean
          id?: string
          is_visible?: boolean
          layout_slot?: string | null
          position?: number
          size?: string
          updated_at?: string
          visibility_rules?: Json
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bio_link_blocks_bio_link_id_fkey"
            columns: ["bio_link_id"]
            isOneToOne: false
            referencedRelation: "bio_links"
            referencedColumns: ["id"]
          },
        ]
      }
      bio_link_versions: {
        Row: {
          bio_link_id: string
          created_at: string
          created_by: string | null
          id: string
          snapshot: Json
          status: string
          summary: string | null
          version_number: number
          workspace_id: string
        }
        Insert: {
          bio_link_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          snapshot?: Json
          status?: string
          summary?: string | null
          version_number: number
          workspace_id: string
        }
        Update: {
          bio_link_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          snapshot?: Json
          status?: string
          summary?: string | null
          version_number?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bio_link_versions_bio_link_id_fkey"
            columns: ["bio_link_id"]
            isOneToOne: false
            referencedRelation: "bio_links"
            referencedColumns: ["id"]
          },
        ]
      }
      bio_links: {
        Row: {
          avatar_url: string | null
          background_config: Json
          bio_text: string | null
          blocks: Json
          created_at: string
          cta_enabled: boolean
          cta_text: string | null
          cta_url: string | null
          display_name: string | null
          ga4_measurement_id: string | null
          gtm_id: string | null
          header_config: Json
          id: string
          is_published: boolean
          latest_simlab_run_id: string | null
          latest_version_number: number
          layout_template_key: string
          links: Json
          meta_pixel_id: string | null
          profile: Json
          published_at: string | null
          published_html: string | null
          published_version_id: string | null
          scheduled_publish_at: string | null
          seo_config: Json
          seo_description: string | null
          seo_image_url: string | null
          seo_title: string | null
          simlab_status: string | null
          simlab_validated_at: string | null
          slug: string
          social_links: Json
          status: string
          theme_config: Json
          theme_id: string | null
          theme_key: string
          theme_tokens: Json
          tiktok_pixel_id: string | null
          total_clicks: number
          total_views: number
          updated_at: string
          username: string | null
          workspace_id: string
        }
        Insert: {
          avatar_url?: string | null
          background_config?: Json
          bio_text?: string | null
          blocks?: Json
          created_at?: string
          cta_enabled?: boolean
          cta_text?: string | null
          cta_url?: string | null
          display_name?: string | null
          ga4_measurement_id?: string | null
          gtm_id?: string | null
          header_config?: Json
          id?: string
          is_published?: boolean
          latest_simlab_run_id?: string | null
          latest_version_number?: number
          layout_template_key?: string
          links?: Json
          meta_pixel_id?: string | null
          profile?: Json
          published_at?: string | null
          published_html?: string | null
          published_version_id?: string | null
          scheduled_publish_at?: string | null
          seo_config?: Json
          seo_description?: string | null
          seo_image_url?: string | null
          seo_title?: string | null
          simlab_status?: string | null
          simlab_validated_at?: string | null
          slug: string
          social_links?: Json
          status?: string
          theme_config?: Json
          theme_id?: string | null
          theme_key?: string
          theme_tokens?: Json
          tiktok_pixel_id?: string | null
          total_clicks?: number
          total_views?: number
          updated_at?: string
          username?: string | null
          workspace_id: string
        }
        Update: {
          avatar_url?: string | null
          background_config?: Json
          bio_text?: string | null
          blocks?: Json
          created_at?: string
          cta_enabled?: boolean
          cta_text?: string | null
          cta_url?: string | null
          display_name?: string | null
          ga4_measurement_id?: string | null
          gtm_id?: string | null
          header_config?: Json
          id?: string
          is_published?: boolean
          latest_simlab_run_id?: string | null
          latest_version_number?: number
          layout_template_key?: string
          links?: Json
          meta_pixel_id?: string | null
          profile?: Json
          published_at?: string | null
          published_html?: string | null
          published_version_id?: string | null
          scheduled_publish_at?: string | null
          seo_config?: Json
          seo_description?: string | null
          seo_image_url?: string | null
          seo_title?: string | null
          simlab_status?: string | null
          simlab_validated_at?: string | null
          slug?: string
          social_links?: Json
          status?: string
          theme_config?: Json
          theme_id?: string | null
          theme_key?: string
          theme_tokens?: Json
          tiktok_pixel_id?: string | null
          total_clicks?: number
          total_views?: number
          updated_at?: string
          username?: string | null
          workspace_id?: string
        }
        Relationships: []
      }
      booking_cancellations: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          booking_id: string
          cancellation_date: string
          created_at: string
          credit_amount: number
          finance_resolution: string | null
          fine_amount: number
          fine_pct: number
          group_trip_id: string
          id: string
          notes_finance: string | null
          org_id: string
          reason_code: string
          reason_notes: string | null
          refund_amount: number
          refund_method: string | null
          refund_processed_at: string | null
          requested_by: string
          status: string
          total_paid: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          booking_id: string
          cancellation_date?: string
          created_at?: string
          credit_amount?: number
          finance_resolution?: string | null
          fine_amount?: number
          fine_pct?: number
          group_trip_id: string
          id?: string
          notes_finance?: string | null
          org_id: string
          reason_code?: string
          reason_notes?: string | null
          refund_amount?: number
          refund_method?: string | null
          refund_processed_at?: string | null
          requested_by?: string
          status?: string
          total_paid?: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          booking_id?: string
          cancellation_date?: string
          created_at?: string
          credit_amount?: number
          finance_resolution?: string | null
          fine_amount?: number
          fine_pct?: number
          group_trip_id?: string
          id?: string
          notes_finance?: string | null
          org_id?: string
          reason_code?: string
          reason_notes?: string | null
          refund_amount?: number
          refund_method?: string | null
          refund_processed_at?: string | null
          requested_by?: string
          status?: string
          total_paid?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_cancellations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "group_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_cancellations_group_trip_id_fkey"
            columns: ["group_trip_id"]
            isOneToOne: false
            referencedRelation: "group_trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_cancellations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_installments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          dispensed_reason: string | null
          due_date: string
          fine_amount: number | null
          id: string
          installment_number: number
          notes_finance: string | null
          notified_at: string | null
          paid_at: string | null
          payment_method: string | null
          reference: string | null
          status: string
          whatsapp_attempts: number
          whatsapp_sent_at: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          dispensed_reason?: string | null
          due_date: string
          fine_amount?: number | null
          id?: string
          installment_number: number
          notes_finance?: string | null
          notified_at?: string | null
          paid_at?: string | null
          payment_method?: string | null
          reference?: string | null
          status?: string
          whatsapp_attempts?: number
          whatsapp_sent_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          dispensed_reason?: string | null
          due_date?: string
          fine_amount?: number | null
          id?: string
          installment_number?: number
          notes_finance?: string | null
          notified_at?: string | null
          paid_at?: string | null
          payment_method?: string | null
          reference?: string | null
          status?: string
          whatsapp_attempts?: number
          whatsapp_sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_installments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "group_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_messages: {
        Row: {
          attachment_url: string | null
          body: string
          booking_id: string
          created_at: string
          id: string
          is_internal: boolean
          org_id: string
          read_at: string | null
          sender_id: string | null
          sender_type: string
        }
        Insert: {
          attachment_url?: string | null
          body: string
          booking_id: string
          created_at?: string
          id?: string
          is_internal?: boolean
          org_id: string
          read_at?: string | null
          sender_id?: string | null
          sender_type: string
        }
        Update: {
          attachment_url?: string | null
          body?: string
          booking_id?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          org_id?: string
          read_at?: string | null
          sender_id?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "group_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_messages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_payment_proofs: {
        Row: {
          amount_declared: number | null
          booking_id: string
          created_at: string
          file_name: string | null
          file_url: string
          id: string
          installment_id: string | null
          notes_client: string | null
          org_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          amount_declared?: number | null
          booking_id: string
          created_at?: string
          file_name?: string | null
          file_url: string
          id?: string
          installment_id?: string | null
          notes_client?: string | null
          org_id: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          amount_declared?: number | null
          booking_id?: string
          created_at?: string
          file_name?: string | null
          file_url?: string
          id?: string
          installment_id?: string | null
          notes_client?: string | null
          org_id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_payment_proofs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "group_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_payment_proofs_installment_id_fkey"
            columns: ["installment_id"]
            isOneToOne: false
            referencedRelation: "booking_installments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_payment_proofs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_transfers: {
        Row: {
          amount_difference: number | null
          client_name: string
          created_at: string
          credit_applied: number | null
          from_booking_id: string
          from_trip_id: string
          id: string
          lead_email: string | null
          new_installments: Json | null
          notes: string | null
          org_id: string
          processed_by: string | null
          reason: string
          status: string
          to_booking_id: string | null
          to_trip_id: string
          updated_at: string
        }
        Insert: {
          amount_difference?: number | null
          client_name: string
          created_at?: string
          credit_applied?: number | null
          from_booking_id: string
          from_trip_id: string
          id?: string
          lead_email?: string | null
          new_installments?: Json | null
          notes?: string | null
          org_id: string
          processed_by?: string | null
          reason?: string
          status?: string
          to_booking_id?: string | null
          to_trip_id: string
          updated_at?: string
        }
        Update: {
          amount_difference?: number | null
          client_name?: string
          created_at?: string
          credit_applied?: number | null
          from_booking_id?: string
          from_trip_id?: string
          id?: string
          lead_email?: string | null
          new_installments?: Json | null
          notes?: string | null
          org_id?: string
          processed_by?: string | null
          reason?: string
          status?: string
          to_booking_id?: string | null
          to_trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_transfers_from_booking_id_fkey"
            columns: ["from_booking_id"]
            isOneToOne: false
            referencedRelation: "group_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_transfers_from_trip_id_fkey"
            columns: ["from_trip_id"]
            isOneToOne: false
            referencedRelation: "group_trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_transfers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_transfers_to_booking_id_fkey"
            columns: ["to_booking_id"]
            isOneToOne: false
            referencedRelation: "group_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_transfers_to_trip_id_fkey"
            columns: ["to_trip_id"]
            isOneToOne: false
            referencedRelation: "group_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_characters: {
        Row: {
          age_range: string | null
          archetype: string | null
          character_kind: string | null
          created_at: string
          ethnicity_notes: string | null
          gender: string | null
          id: string
          is_active: boolean
          latest_simlab_run_id: string | null
          name: string
          physical_traits: Json
          sample_images: Json
          seed_prompt: string | null
          simlab_status: string | null
          simlab_validated_at: string | null
          style_notes: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          age_range?: string | null
          archetype?: string | null
          character_kind?: string | null
          created_at?: string
          ethnicity_notes?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean
          latest_simlab_run_id?: string | null
          name: string
          physical_traits?: Json
          sample_images?: Json
          seed_prompt?: string | null
          simlab_status?: string | null
          simlab_validated_at?: string | null
          style_notes?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          age_range?: string | null
          archetype?: string | null
          character_kind?: string | null
          created_at?: string
          ethnicity_notes?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean
          latest_simlab_run_id?: string | null
          name?: string
          physical_traits?: Json
          sample_images?: Json
          seed_prompt?: string | null
          simlab_status?: string | null
          simlab_validated_at?: string | null
          style_notes?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      brand_kits: {
        Row: {
          archetype: string | null
          brand_name: string | null
          colors: Json
          created_at: string
          fonts: Json
          id: string
          logos: Json
          mission: string | null
          positioning: string | null
          sector: string | null
          tone_of_voice: string | null
          updated_at: string
          values: Json
          vision: string | null
          voice: Json
          workspace_id: string
        }
        Insert: {
          archetype?: string | null
          brand_name?: string | null
          colors?: Json
          created_at?: string
          fonts?: Json
          id?: string
          logos?: Json
          mission?: string | null
          positioning?: string | null
          sector?: string | null
          tone_of_voice?: string | null
          updated_at?: string
          values?: Json
          vision?: string | null
          voice?: Json
          workspace_id: string
        }
        Update: {
          archetype?: string | null
          brand_name?: string | null
          colors?: Json
          created_at?: string
          fonts?: Json
          id?: string
          logos?: Json
          mission?: string | null
          positioning?: string | null
          sector?: string | null
          tone_of_voice?: string | null
          updated_at?: string
          values?: Json
          vision?: string | null
          voice?: Json
          workspace_id?: string
        }
        Relationships: []
      }
      brand_templates: {
        Row: {
          analyzed_at: string | null
          brand_dna: Json
          category: string | null
          copy_dna: Json
          created_at: string
          error_message: string | null
          html_template: string | null
          id: string
          is_public: boolean
          layout_dna: Json
          screenshot_url: string | null
          source_name: string | null
          source_platform: string | null
          source_url: string
          status: string | null
          style_tags: string[]
          thumbnail_url: string | null
          updated_at: string
          use_count: number
          view_count: number
          workspace_id: string
        }
        Insert: {
          analyzed_at?: string | null
          brand_dna?: Json
          category?: string | null
          copy_dna?: Json
          created_at?: string
          error_message?: string | null
          html_template?: string | null
          id?: string
          is_public?: boolean
          layout_dna?: Json
          screenshot_url?: string | null
          source_name?: string | null
          source_platform?: string | null
          source_url: string
          status?: string | null
          style_tags?: string[]
          thumbnail_url?: string | null
          updated_at?: string
          use_count?: number
          view_count?: number
          workspace_id: string
        }
        Update: {
          analyzed_at?: string | null
          brand_dna?: Json
          category?: string | null
          copy_dna?: Json
          created_at?: string
          error_message?: string | null
          html_template?: string | null
          id?: string
          is_public?: boolean
          layout_dna?: Json
          screenshot_url?: string | null
          source_name?: string | null
          source_platform?: string | null
          source_url?: string
          status?: string | null
          style_tags?: string[]
          thumbnail_url?: string | null
          updated_at?: string
          use_count?: number
          view_count?: number
          workspace_id?: string
        }
        Relationships: []
      }
      bus_layouts: {
        Row: {
          aisle_cols: number[] | null
          bathroom_position: string | null
          cols: number
          created_at: string
          driver_row: number | null
          floor_number: number
          has_bathroom: boolean
          id: string
          name: string
          notes: string | null
          org_id: string
          rows: number
          seat_map: Json
          total_seats: number | null
          updated_at: string
          vehicle_type: string
        }
        Insert: {
          aisle_cols?: number[] | null
          bathroom_position?: string | null
          cols?: number
          created_at?: string
          driver_row?: number | null
          floor_number?: number
          has_bathroom?: boolean
          id?: string
          name: string
          notes?: string | null
          org_id: string
          rows?: number
          seat_map?: Json
          total_seats?: number | null
          updated_at?: string
          vehicle_type?: string
        }
        Update: {
          aisle_cols?: number[] | null
          bathroom_position?: string | null
          cols?: number
          created_at?: string
          driver_row?: number | null
          floor_number?: number
          has_bathroom?: boolean
          id?: string
          name?: string
          notes?: string | null
          org_id?: string
          rows?: number
          seat_map?: Json
          total_seats?: number | null
          updated_at?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      bus_seat_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          block_reason: string | null
          booking_id: string | null
          created_at: string
          floor_number: number
          group_trip_id: string
          id: string
          is_blocked: boolean
          notes: string | null
          seat_label: string
          traveler_name: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          block_reason?: string | null
          booking_id?: string | null
          created_at?: string
          floor_number?: number
          group_trip_id: string
          id?: string
          is_blocked?: boolean
          notes?: string | null
          seat_label: string
          traveler_name?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          block_reason?: string | null
          booking_id?: string | null
          created_at?: string
          floor_number?: number
          group_trip_id?: string
          id?: string
          is_blocked?: boolean
          notes?: string | null
          seat_label?: string
          traveler_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bus_seat_assignments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "group_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bus_seat_assignments_group_trip_id_fkey"
            columns: ["group_trip_id"]
            isOneToOne: false
            referencedRelation: "group_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      ccp_prompt_templates: {
        Row: {
          agent_name: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          max_tokens: number | null
          model_preference: string | null
          module: string
          slug: string
          system_prompt: string | null
          temperature: number | null
          updated_at: string
          user_prompt_template: string | null
          version: number
          workspace_id: string | null
        }
        Insert: {
          agent_name: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          max_tokens?: number | null
          model_preference?: string | null
          module?: string
          slug: string
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string
          user_prompt_template?: string | null
          version?: number
          workspace_id?: string | null
        }
        Update: {
          agent_name?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          max_tokens?: number | null
          model_preference?: string | null
          module?: string
          slug?: string
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string
          user_prompt_template?: string | null
          version?: number
          workspace_id?: string | null
        }
        Relationships: []
      }
      chat_sessions: {
        Row: {
          context: string | null
          created_at: string
          id: string
          is_archived: boolean
          messages: Json
          org_id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          id?: string
          is_archived?: boolean
          messages?: Json
          org_id: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          context?: string | null
          created_at?: string
          id?: string
          is_archived?: boolean
          messages?: Json
          org_id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_travel_credits: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          currency: string
          expires_at: string | null
          id: string
          lead_email: string | null
          lead_name: string | null
          notes: string | null
          org_id: string
          originating_cancellation_id: string | null
          status: string
          updated_at: string
          used_amount: number
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          lead_email?: string | null
          lead_name?: string | null
          notes?: string | null
          org_id: string
          originating_cancellation_id?: string | null
          status?: string
          updated_at?: string
          used_amount?: number
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          lead_email?: string | null
          lead_name?: string | null
          notes?: string | null
          org_id?: string
          originating_cancellation_id?: string | null
          status?: string
          updated_at?: string
          used_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_travel_credits_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_travel_credits_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_travel_credits_originating_cancellation_id_fkey"
            columns: ["originating_cancellation_id"]
            isOneToOne: false
            referencedRelation: "booking_cancellations"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: Json | null
          assigned_agent_id: string | null
          birth_date: string | null
          cover_url: string | null
          cpf: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean
          joined_at: string | null
          ltv: number | null
          name: string
          nationality: string | null
          next_trip: string | null
          notes: string | null
          open_tickets: number | null
          org_id: string
          origin: string | null
          passport_expiry: string | null
          passport_number: string | null
          phone: string | null
          photo_url: string | null
          portal_access_enabled: boolean
          portal_user_id: string | null
          preferences: Json
          tags: string[] | null
          trips_count: number | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: Json | null
          assigned_agent_id?: string | null
          birth_date?: string | null
          cover_url?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          joined_at?: string | null
          ltv?: number | null
          name: string
          nationality?: string | null
          next_trip?: string | null
          notes?: string | null
          open_tickets?: number | null
          org_id: string
          origin?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          phone?: string | null
          photo_url?: string | null
          portal_access_enabled?: boolean
          portal_user_id?: string | null
          preferences?: Json
          tags?: string[] | null
          trips_count?: number | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: Json | null
          assigned_agent_id?: string | null
          birth_date?: string | null
          cover_url?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          joined_at?: string | null
          ltv?: number | null
          name?: string
          nationality?: string | null
          next_trip?: string | null
          notes?: string | null
          open_tickets?: number | null
          org_id?: string
          origin?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          phone?: string | null
          photo_url?: string | null
          portal_access_enabled?: boolean
          portal_user_id?: string | null
          preferences?: Json
          tags?: string[] | null
          trips_count?: number | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_logs: {
        Row: {
          client_id: string | null
          error_message: string | null
          id: string
          rule_id: string | null
          sent_at: string | null
          status: string
          trip_id: string | null
        }
        Insert: {
          client_id?: string | null
          error_message?: string | null
          id?: string
          rule_id?: string | null
          sent_at?: string | null
          status: string
          trip_id?: string | null
        }
        Update: {
          client_id?: string | null
          error_message?: string | null
          id?: string
          rule_id?: string | null
          sent_at?: string | null
          status?: string
          trip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "communication_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_logs_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_rules: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          is_active: boolean | null
          last_run_at: string | null
          org_id: string
          template_body: string
          template_subject: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          org_id: string
          template_body: string
          template_subject: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          org_id?: string
          template_body?: string
          template_subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_rules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      content_templates: {
        Row: {
          created_at: string
          description: string | null
          guardrails: Json
          id: string
          is_active: boolean
          name: string
          scope: string
          structure: Json
          thumbnail_url: string | null
          type: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          guardrails?: Json
          id?: string
          is_active?: boolean
          name: string
          scope?: string
          structure?: Json
          thumbnail_url?: string | null
          type: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          guardrails?: Json
          id?: string
          is_active?: boolean
          name?: string
          scope?: string
          structure?: Json
          thumbnail_url?: string | null
          type?: string
          workspace_id?: string | null
        }
        Relationships: []
      }
      contract_signatures: {
        Row: {
          booking_id: string
          contract_html: string
          created_at: string
          facial_photo_url: string | null
          geolocation: Json | null
          hash_sha256: string
          id: string
          org_id: string
          signed_at: string
          signer_cpf: string | null
          signer_email: string | null
          signer_ip: string | null
          signer_name: string
          user_agent: string | null
        }
        Insert: {
          booking_id: string
          contract_html: string
          created_at?: string
          facial_photo_url?: string | null
          geolocation?: Json | null
          hash_sha256: string
          id?: string
          org_id: string
          signed_at?: string
          signer_cpf?: string | null
          signer_email?: string | null
          signer_ip?: string | null
          signer_name: string
          user_agent?: string | null
        }
        Update: {
          booking_id?: string
          contract_html?: string
          created_at?: string
          facial_photo_url?: string | null
          geolocation?: Json | null
          hash_sha256?: string
          id?: string
          org_id?: string
          signed_at?: string
          signer_cpf?: string | null
          signer_email?: string | null
          signer_ip?: string | null
          signer_name?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_signatures_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "group_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_templates: {
        Row: {
          content_html: string
          created_at: string | null
          id: string
          name: string
          org_id: string
          updated_at: string | null
        }
        Insert: {
          content_html: string
          created_at?: string | null
          id?: string
          name: string
          org_id: string
          updated_at?: string | null
        }
        Update: {
          content_html?: string
          created_at?: string | null
          id?: string
          name?: string
          org_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      destination_guides: {
        Row: {
          activities: Json | null
          attractions: Json | null
          avg_temperature: number | null
          best_season: string | null
          city: string
          climate_info: string | null
          country: string
          cover_image_url: string | null
          created_at: string
          currency_info: string | null
          description: string | null
          emergency_numbers: Json | null
          facts: Json | null
          gallery: Json | null
          health_safety: string | null
          how_to_get_there: string | null
          how_to_get_there_duration: string | null
          id: string
          intro: string | null
          is_published: boolean | null
          itinerary: Json | null
          language_tips: string | null
          map_info: Json | null
          org_id: string
          read_time_minutes: number | null
          restaurants: Json | null
          slug: string | null
          timezone: string | null
          tips: Json | null
          transportation: string | null
          travel_tips: string | null
          updated_at: string
          useful_contacts: Json | null
          useful_numbers: Json | null
          visa_info: string | null
        }
        Insert: {
          activities?: Json | null
          attractions?: Json | null
          avg_temperature?: number | null
          best_season?: string | null
          city: string
          climate_info?: string | null
          country: string
          cover_image_url?: string | null
          created_at?: string
          currency_info?: string | null
          description?: string | null
          emergency_numbers?: Json | null
          facts?: Json | null
          gallery?: Json | null
          health_safety?: string | null
          how_to_get_there?: string | null
          how_to_get_there_duration?: string | null
          id?: string
          intro?: string | null
          is_published?: boolean | null
          itinerary?: Json | null
          language_tips?: string | null
          map_info?: Json | null
          org_id: string
          read_time_minutes?: number | null
          restaurants?: Json | null
          slug?: string | null
          timezone?: string | null
          tips?: Json | null
          transportation?: string | null
          travel_tips?: string | null
          updated_at?: string
          useful_contacts?: Json | null
          useful_numbers?: Json | null
          visa_info?: string | null
        }
        Update: {
          activities?: Json | null
          attractions?: Json | null
          avg_temperature?: number | null
          best_season?: string | null
          city?: string
          climate_info?: string | null
          country?: string
          cover_image_url?: string | null
          created_at?: string
          currency_info?: string | null
          description?: string | null
          emergency_numbers?: Json | null
          facts?: Json | null
          gallery?: Json | null
          health_safety?: string | null
          how_to_get_there?: string | null
          how_to_get_there_duration?: string | null
          id?: string
          intro?: string | null
          is_published?: boolean | null
          itinerary?: Json | null
          language_tips?: string | null
          map_info?: Json | null
          org_id?: string
          read_time_minutes?: number | null
          restaurants?: Json | null
          slug?: string | null
          timezone?: string | null
          tips?: Json | null
          transportation?: string | null
          travel_tips?: string | null
          updated_at?: string
          useful_contacts?: Json | null
          useful_numbers?: Json | null
          visa_info?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "destination_guides_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      destination_tags: {
        Row: {
          destination_id: string | null
          id: string
          tag: string | null
        }
        Insert: {
          destination_id?: string | null
          id?: string
          tag?: string | null
        }
        Update: {
          destination_id?: string | null
          id?: string
          tag?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "destination_tags_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      destinations: {
        Row: {
          airport_iata: string | null
          avoid_season: string[] | null
          best_season: string | null
          capital: string | null
          country: string | null
          cover_emoji: string | null
          cover_gradient: string | null
          created_at: string | null
          currency: string | null
          currency_code: string | null
          description: string | null
          emergency_numbers: Json | null
          exchange_rate_brl: number | null
          gateway_airport_iata: string | null
          gateway_city: string | null
          gateway_rules: Json | null
          id: string
          language: string | null
          latitude: number | null
          longitude: number | null
          name: string
          region: string | null
          slug: string | null
          special_notes: string | null
          timezone: string | null
          transfer_options: string[] | null
          transfer_time_hours: number | null
          useful_numbers: Json | null
          voltage: string | null
        }
        Insert: {
          airport_iata?: string | null
          avoid_season?: string[] | null
          best_season?: string | null
          capital?: string | null
          country?: string | null
          cover_emoji?: string | null
          cover_gradient?: string | null
          created_at?: string | null
          currency?: string | null
          currency_code?: string | null
          description?: string | null
          emergency_numbers?: Json | null
          exchange_rate_brl?: number | null
          gateway_airport_iata?: string | null
          gateway_city?: string | null
          gateway_rules?: Json | null
          id?: string
          language?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          region?: string | null
          slug?: string | null
          special_notes?: string | null
          timezone?: string | null
          transfer_options?: string[] | null
          transfer_time_hours?: number | null
          useful_numbers?: Json | null
          voltage?: string | null
        }
        Update: {
          airport_iata?: string | null
          avoid_season?: string[] | null
          best_season?: string | null
          capital?: string | null
          country?: string | null
          cover_emoji?: string | null
          cover_gradient?: string | null
          created_at?: string | null
          currency?: string | null
          currency_code?: string | null
          description?: string | null
          emergency_numbers?: Json | null
          exchange_rate_brl?: number | null
          gateway_airport_iata?: string | null
          gateway_city?: string | null
          gateway_rules?: Json | null
          id?: string
          language?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          region?: string | null
          slug?: string | null
          special_notes?: string | null
          timezone?: string | null
          transfer_options?: string[] | null
          transfer_time_hours?: number | null
          useful_numbers?: Json | null
          voltage?: string | null
        }
        Relationships: []
      }
      email_inbound: {
        Row: {
          ai_confidence: number | null
          ai_extracted_code: string | null
          ai_intent: string | null
          ai_linked_client_id: string | null
          ai_linked_kanban_card_id: string | null
          ai_linked_ticket_id: string | null
          ai_summary: string | null
          body_html: string | null
          body_text: string | null
          created_at: string | null
          id: string
          message_id: string | null
          org_id: string | null
          processed: boolean | null
          received_at: string | null
          sender_email: string
          sender_name: string | null
          subject: string | null
        }
        Insert: {
          ai_confidence?: number | null
          ai_extracted_code?: string | null
          ai_intent?: string | null
          ai_linked_client_id?: string | null
          ai_linked_kanban_card_id?: string | null
          ai_linked_ticket_id?: string | null
          ai_summary?: string | null
          body_html?: string | null
          body_text?: string | null
          created_at?: string | null
          id?: string
          message_id?: string | null
          org_id?: string | null
          processed?: boolean | null
          received_at?: string | null
          sender_email: string
          sender_name?: string | null
          subject?: string | null
        }
        Update: {
          ai_confidence?: number | null
          ai_extracted_code?: string | null
          ai_intent?: string | null
          ai_linked_client_id?: string | null
          ai_linked_kanban_card_id?: string | null
          ai_linked_ticket_id?: string | null
          ai_summary?: string | null
          body_html?: string | null
          body_text?: string | null
          created_at?: string | null
          id?: string
          message_id?: string | null
          org_id?: string | null
          processed?: boolean | null
          received_at?: string | null
          sender_email?: string
          sender_name?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_inbound_ai_linked_client_id_fkey"
            columns: ["ai_linked_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_inbound_ai_linked_kanban_card_id_fkey"
            columns: ["ai_linked_kanban_card_id"]
            isOneToOne: false
            referencedRelation: "kanban_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_inbound_ai_linked_ticket_id_fkey"
            columns: ["ai_linked_ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_inbound_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_messages: {
        Row: {
          ai_priority: string | null
          ai_summary: string | null
          ai_type: string | null
          attachments: Json | null
          body_html: string | null
          body_text: string | null
          client_id: string | null
          created_at: string
          direction: string | null
          extracted_locator: string | null
          extracted_ticket_code: string | null
          from_email: string | null
          from_name: string | null
          gmail_id: string | null
          id: string
          org_id: string
          received_at: string
          subject: string | null
          thread_id: string | null
          ticket_code: string | null
          ticket_id: string | null
          to_emails: string[] | null
          trip_id: string | null
        }
        Insert: {
          ai_priority?: string | null
          ai_summary?: string | null
          ai_type?: string | null
          attachments?: Json | null
          body_html?: string | null
          body_text?: string | null
          client_id?: string | null
          created_at?: string
          direction?: string | null
          extracted_locator?: string | null
          extracted_ticket_code?: string | null
          from_email?: string | null
          from_name?: string | null
          gmail_id?: string | null
          id?: string
          org_id: string
          received_at?: string
          subject?: string | null
          thread_id?: string | null
          ticket_code?: string | null
          ticket_id?: string | null
          to_emails?: string[] | null
          trip_id?: string | null
        }
        Update: {
          ai_priority?: string | null
          ai_summary?: string | null
          ai_type?: string | null
          attachments?: Json | null
          body_html?: string | null
          body_text?: string | null
          client_id?: string | null
          created_at?: string
          direction?: string | null
          extracted_locator?: string | null
          extracted_ticket_code?: string | null
          from_email?: string | null
          from_name?: string | null
          gmail_id?: string | null
          id?: string
          org_id?: string
          received_at?: string
          subject?: string | null
          thread_id?: string | null
          ticket_code?: string | null
          ticket_id?: string | null
          to_emails?: string[] | null
          trip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_messages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_messages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_messages_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          capacidade_max: number | null
          cidade_base: string | null
          cover_photo_url: string | null
          created_at: string
          descricao: string | null
          duracao_horas: number | null
          estado: string | null
          fornecedor: string | null
          fotos: string[]
          id: string
          idioma_guia: string[] | null
          inclui_alimentacao: boolean | null
          inclui_transporte: boolean | null
          instrucoes_operacionais: string | null
          is_active: boolean
          moeda: string
          nome: string
          org_id: string
          pais: string
          preco_adulto: number | null
          preco_crianca: number | null
          preco_infantil: number | null
          tags: string[]
          tipo: string
          updated_at: string
        }
        Insert: {
          capacidade_max?: number | null
          cidade_base?: string | null
          cover_photo_url?: string | null
          created_at?: string
          descricao?: string | null
          duracao_horas?: number | null
          estado?: string | null
          fornecedor?: string | null
          fotos?: string[]
          id?: string
          idioma_guia?: string[] | null
          inclui_alimentacao?: boolean | null
          inclui_transporte?: boolean | null
          instrucoes_operacionais?: string | null
          is_active?: boolean
          moeda?: string
          nome: string
          org_id: string
          pais?: string
          preco_adulto?: number | null
          preco_crianca?: number | null
          preco_infantil?: number | null
          tags?: string[]
          tipo?: string
          updated_at?: string
        }
        Update: {
          capacidade_max?: number | null
          cidade_base?: string | null
          cover_photo_url?: string | null
          created_at?: string
          descricao?: string | null
          duracao_horas?: number | null
          estado?: string | null
          fornecedor?: string | null
          fotos?: string[]
          id?: string
          idioma_guia?: string[] | null
          inclui_alimentacao?: boolean | null
          inclui_transporte?: boolean | null
          instrucoes_operacionais?: string | null
          is_active?: boolean
          moeda?: string
          nome?: string
          org_id?: string
          pais?: string
          preco_adulto?: number | null
          preco_crianca?: number | null
          preco_infantil?: number | null
          tags?: string[]
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiences_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string
          feature: string
          id: string
          is_enabled: boolean
          scope: string
          scope_value: string | null
        }
        Insert: {
          created_at?: string
          feature: string
          id?: string
          is_enabled?: boolean
          scope: string
          scope_value?: string | null
        }
        Update: {
          created_at?: string
          feature?: string
          id?: string
          is_enabled?: boolean
          scope?: string
          scope_value?: string | null
        }
        Relationships: []
      }
      financial_commissions: {
        Row: {
          agent_user_id: string | null
          commission_amount: number
          created_at: string | null
          id: string
          status: string
          transaction_id: string | null
        }
        Insert: {
          agent_user_id?: string | null
          commission_amount: number
          created_at?: string | null
          id?: string
          status?: string
          transaction_id?: string | null
        }
        Update: {
          agent_user_id?: string | null
          commission_amount?: number
          created_at?: string | null
          id?: string
          status?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_commissions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "financial_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_suppliers: {
        Row: {
          bank_details: string | null
          contact_info: string | null
          created_at: string | null
          default_commission_rate: number | null
          id: string
          name: string
          org_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          bank_details?: string | null
          contact_info?: string | null
          created_at?: string | null
          default_commission_rate?: number | null
          id?: string
          name: string
          org_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          bank_details?: string | null
          contact_info?: string | null
          created_at?: string | null
          default_commission_rate?: number | null
          id?: string
          name?: string
          org_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_suppliers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string | null
          due_date: string
          id: string
          notes: string | null
          org_id: string
          paid_date: string | null
          payment_method: string | null
          status: string
          supplier_id: string | null
          trip_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string | null
          due_date: string
          id?: string
          notes?: string | null
          org_id: string
          paid_date?: string | null
          payment_method?: string | null
          status: string
          supplier_id?: string | null
          trip_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string | null
          due_date?: string
          id?: string
          notes?: string | null
          org_id?: string
          paid_date?: string | null
          payment_method?: string | null
          status?: string
          supplier_id?: string | null
          trip_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "financial_suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      flight_amenities: {
        Row: {
          flight_id: string | null
          icon: string | null
          id: string
          label: string | null
        }
        Insert: {
          flight_id?: string | null
          icon?: string | null
          id?: string
          label?: string | null
        }
        Update: {
          flight_id?: string | null
          icon?: string | null
          id?: string
          label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flight_amenities_flight_id_fkey"
            columns: ["flight_id"]
            isOneToOne: false
            referencedRelation: "flights"
            referencedColumns: ["id"]
          },
        ]
      }
      flight_change_events: {
        Row: {
          change_type: string | null
          created_at: string
          id: string
          minutes_diff: number | null
          new_flight_json: Json | null
          notified_client_at: string | null
          org_id: string
          original_flight_json: Json | null
          resolution: string | null
          resolved_at: string | null
          solutions_json: Json | null
          trip_id: string | null
          updated_at: string
        }
        Insert: {
          change_type?: string | null
          created_at?: string
          id?: string
          minutes_diff?: number | null
          new_flight_json?: Json | null
          notified_client_at?: string | null
          org_id: string
          original_flight_json?: Json | null
          resolution?: string | null
          resolved_at?: string | null
          solutions_json?: Json | null
          trip_id?: string | null
          updated_at?: string
        }
        Update: {
          change_type?: string | null
          created_at?: string
          id?: string
          minutes_diff?: number | null
          new_flight_json?: Json | null
          notified_client_at?: string | null
          org_id?: string
          original_flight_json?: Json | null
          resolution?: string | null
          resolved_at?: string | null
          solutions_json?: Json | null
          trip_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flight_change_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_change_events_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      flight_segments: {
        Row: {
          arrival_airport_city: string | null
          arrival_airport_code: string | null
          arrival_datetime: string | null
          connection_info: string | null
          connection_wait_minutes: number | null
          departure_airport_city: string | null
          departure_airport_code: string | null
          departure_datetime: string | null
          duration_minutes: number | null
          flight_id: string | null
          id: string
          is_direct: boolean | null
          segment_order: number | null
          stops: number | null
        }
        Insert: {
          arrival_airport_city?: string | null
          arrival_airport_code?: string | null
          arrival_datetime?: string | null
          connection_info?: string | null
          connection_wait_minutes?: number | null
          departure_airport_city?: string | null
          departure_airport_code?: string | null
          departure_datetime?: string | null
          duration_minutes?: number | null
          flight_id?: string | null
          id?: string
          is_direct?: boolean | null
          segment_order?: number | null
          stops?: number | null
        }
        Update: {
          arrival_airport_city?: string | null
          arrival_airport_code?: string | null
          arrival_datetime?: string | null
          connection_info?: string | null
          connection_wait_minutes?: number | null
          departure_airport_city?: string | null
          departure_airport_code?: string | null
          departure_datetime?: string | null
          duration_minutes?: number | null
          flight_id?: string | null
          id?: string
          is_direct?: boolean | null
          segment_order?: number | null
          stops?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "flight_segments_flight_id_fkey"
            columns: ["flight_id"]
            isOneToOne: false
            referencedRelation: "flights"
            referencedColumns: ["id"]
          },
        ]
      }
      flights: {
        Row: {
          airline_code: string | null
          airline_name: string | null
          cabin_class: string | null
          direction: Database["public"]["Enums"]["flight_direction"] | null
          id: string
          is_recommended: boolean | null
          operated_by: string | null
          order_position: number | null
          price_label: string | null
          quote_id: string | null
          total_price: number | null
        }
        Insert: {
          airline_code?: string | null
          airline_name?: string | null
          cabin_class?: string | null
          direction?: Database["public"]["Enums"]["flight_direction"] | null
          id?: string
          is_recommended?: boolean | null
          operated_by?: string | null
          order_position?: number | null
          price_label?: string | null
          quote_id?: string | null
          total_price?: number | null
        }
        Update: {
          airline_code?: string | null
          airline_name?: string | null
          cabin_class?: string | null
          direction?: Database["public"]["Enums"]["flight_direction"] | null
          id?: string
          is_recommended?: boolean | null
          operated_by?: string | null
          order_position?: number | null
          price_label?: string | null
          quote_id?: string | null
          total_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "flights_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      group_bookings: {
        Row: {
          cancellation_id: string | null
          cancelled_at: string | null
          client_id: string | null
          created_at: string
          credit_balance: number | null
          group_trip_id: string
          id: string
          internal_notes: string | null
          lead_cpf: string | null
          lead_email: string | null
          lead_name: string
          lead_phone: string | null
          org_id: string
          pax_count: number
          payment_status: string
          portal_access_count: number
          portal_last_accessed_at: string | null
          public_token: string
          seat_numbers: string[] | null
          status: string
          total_amount: number
          transferred_to: string | null
          updated_at: string
          voucher_code: string | null
          voucher_url: string | null
        }
        Insert: {
          cancellation_id?: string | null
          cancelled_at?: string | null
          client_id?: string | null
          created_at?: string
          credit_balance?: number | null
          group_trip_id: string
          id?: string
          internal_notes?: string | null
          lead_cpf?: string | null
          lead_email?: string | null
          lead_name: string
          lead_phone?: string | null
          org_id: string
          pax_count?: number
          payment_status?: string
          portal_access_count?: number
          portal_last_accessed_at?: string | null
          public_token?: string
          seat_numbers?: string[] | null
          status?: string
          total_amount?: number
          transferred_to?: string | null
          updated_at?: string
          voucher_code?: string | null
          voucher_url?: string | null
        }
        Update: {
          cancellation_id?: string | null
          cancelled_at?: string | null
          client_id?: string | null
          created_at?: string
          credit_balance?: number | null
          group_trip_id?: string
          id?: string
          internal_notes?: string | null
          lead_cpf?: string | null
          lead_email?: string | null
          lead_name?: string
          lead_phone?: string | null
          org_id?: string
          pax_count?: number
          payment_status?: string
          portal_access_count?: number
          portal_last_accessed_at?: string | null
          public_token?: string
          seat_numbers?: string[] | null
          status?: string
          total_amount?: number
          transferred_to?: string | null
          updated_at?: string
          voucher_code?: string | null
          voucher_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_bookings_cancellation_id_fkey"
            columns: ["cancellation_id"]
            isOneToOne: false
            referencedRelation: "booking_cancellations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_bookings_group_trip_id_fkey"
            columns: ["group_trip_id"]
            isOneToOne: false
            referencedRelation: "group_trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_bookings_transferred_to_fkey"
            columns: ["transferred_to"]
            isOneToOne: false
            referencedRelation: "group_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      group_trip_days: {
        Row: {
          created_at: string
          day_number: number
          description_md: string | null
          group_trip_id: string
          highlights: string[] | null
          id: string
          media: Json
          title: string
        }
        Insert: {
          created_at?: string
          day_number?: number
          description_md?: string | null
          group_trip_id: string
          highlights?: string[] | null
          id?: string
          media?: Json
          title?: string
        }
        Update: {
          created_at?: string
          day_number?: number
          description_md?: string | null
          group_trip_id?: string
          highlights?: string[] | null
          id?: string
          media?: Json
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_trip_days_group_trip_id_fkey"
            columns: ["group_trip_id"]
            isOneToOne: false
            referencedRelation: "group_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      group_trip_ledger: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          currency: string
          description: string
          group_trip_id: string
          id: string
          org_id: string
          paid_at: string | null
          planned_date: string | null
          reference_booking_id: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          category?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description: string
          group_trip_id: string
          id?: string
          org_id: string
          paid_at?: string | null
          planned_date?: string | null
          reference_booking_id?: string | null
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string
          group_trip_id?: string
          id?: string
          org_id?: string
          paid_at?: string | null
          planned_date?: string | null
          reference_booking_id?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_trip_ledger_group_trip_id_fkey"
            columns: ["group_trip_id"]
            isOneToOne: false
            referencedRelation: "group_trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_trip_ledger_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_trip_ledger_reference_booking_id_fkey"
            columns: ["reference_booking_id"]
            isOneToOne: false
            referencedRelation: "group_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      group_trips: {
        Row: {
          booking_count: number
          bus_layout_2nd_floor_id: string | null
          bus_layout_id: string | null
          cancellation_min_pax: number | null
          cancellation_policy: Json | null
          contract_template_id: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          currency: string
          current_pax: number
          departure_date: string | null
          description_md: string | null
          destination: string | null
          excludes: string[] | null
          gallery_urls: string[] | null
          id: string
          important_notes: string | null
          includes: string[] | null
          installments_count: number
          is_public: boolean
          max_pax: number
          min_pax_deadline_days: number | null
          num_days: number | null
          num_nights: number | null
          org_id: string
          origin_city: string | null
          payment_due_offset_days: number
          price_per_pax: number
          return_date: string | null
          seat_assignment_mode: string
          seat_map_visible_to_client: boolean
          slug: string | null
          status: string
          subtitle: string | null
          title: string
          transport_type: string | null
          updated_at: string
          view_count: number
        }
        Insert: {
          booking_count?: number
          bus_layout_2nd_floor_id?: string | null
          bus_layout_id?: string | null
          cancellation_min_pax?: number | null
          cancellation_policy?: Json | null
          contract_template_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          current_pax?: number
          departure_date?: string | null
          description_md?: string | null
          destination?: string | null
          excludes?: string[] | null
          gallery_urls?: string[] | null
          id?: string
          important_notes?: string | null
          includes?: string[] | null
          installments_count?: number
          is_public?: boolean
          max_pax?: number
          min_pax_deadline_days?: number | null
          num_days?: number | null
          num_nights?: number | null
          org_id: string
          origin_city?: string | null
          payment_due_offset_days?: number
          price_per_pax?: number
          return_date?: string | null
          seat_assignment_mode?: string
          seat_map_visible_to_client?: boolean
          slug?: string | null
          status?: string
          subtitle?: string | null
          title?: string
          transport_type?: string | null
          updated_at?: string
          view_count?: number
        }
        Update: {
          booking_count?: number
          bus_layout_2nd_floor_id?: string | null
          bus_layout_id?: string | null
          cancellation_min_pax?: number | null
          cancellation_policy?: Json | null
          contract_template_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          current_pax?: number
          departure_date?: string | null
          description_md?: string | null
          destination?: string | null
          excludes?: string[] | null
          gallery_urls?: string[] | null
          id?: string
          important_notes?: string | null
          includes?: string[] | null
          installments_count?: number
          is_public?: boolean
          max_pax?: number
          min_pax_deadline_days?: number | null
          num_days?: number | null
          num_nights?: number | null
          org_id?: string
          origin_city?: string | null
          payment_due_offset_days?: number
          price_per_pax?: number
          return_date?: string | null
          seat_assignment_mode?: string
          seat_map_visible_to_client?: boolean
          slug?: string | null
          status?: string
          subtitle?: string | null
          title?: string
          transport_type?: string | null
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "group_trips_bus_layout_2nd_floor_id_fkey"
            columns: ["bus_layout_2nd_floor_id"]
            isOneToOne: false
            referencedRelation: "bus_layouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_trips_bus_layout_id_fkey"
            columns: ["bus_layout_id"]
            isOneToOne: false
            referencedRelation: "bus_layouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_trips_contract_template_id_fkey"
            columns: ["contract_template_id"]
            isOneToOne: false
            referencedRelation: "contract_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      hotels_bank: {
        Row: {
          category: number | null
          city: string
          country: string
          cover_photo_url: string | null
          created_at: string
          description: string | null
          highlights: string[]
          id: string
          internal_rating: number | null
          is_active: boolean
          latitude: number | null
          longitude: number | null
          name: string
          org_id: string
          photos: string[]
          regime_options: string[]
          state: string | null
          tags: string[]
          updated_at: string
          website: string | null
        }
        Insert: {
          category?: number | null
          city: string
          country?: string
          cover_photo_url?: string | null
          created_at?: string
          description?: string | null
          highlights?: string[]
          id?: string
          internal_rating?: number | null
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          org_id: string
          photos?: string[]
          regime_options?: string[]
          state?: string | null
          tags?: string[]
          updated_at?: string
          website?: string | null
        }
        Update: {
          category?: number | null
          city?: string
          country?: string
          cover_photo_url?: string | null
          created_at?: string
          description?: string | null
          highlights?: string[]
          id?: string
          internal_rating?: number | null
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          org_id?: string
          photos?: string[]
          regime_options?: string[]
          state?: string | null
          tags?: string[]
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotels_bank_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      itineraries: {
        Row: {
          ai_generated: boolean | null
          ai_prompt_used: string | null
          cover_emoji: string | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          current_pax: number | null
          departure_date: string | null
          destination: string | null
          destination_lat: number | null
          destination_lng: number | null
          excludes_text: string[] | null
          group_name: string | null
          id: string
          important_notes: string | null
          includes_text: string[] | null
          is_group_itinerary: boolean | null
          is_public: boolean | null
          lead_count: number | null
          max_pax: number | null
          num_days: number | null
          org_id: string
          origin: string | null
          pdf_requires_lead: boolean | null
          pdf_url: string | null
          public_token: string | null
          quotation_id: string | null
          return_date: string | null
          share_count: number | null
          status: string | null
          subtitle: string | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          ai_generated?: boolean | null
          ai_prompt_used?: string | null
          cover_emoji?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          current_pax?: number | null
          departure_date?: string | null
          destination?: string | null
          destination_lat?: number | null
          destination_lng?: number | null
          excludes_text?: string[] | null
          group_name?: string | null
          id?: string
          important_notes?: string | null
          includes_text?: string[] | null
          is_group_itinerary?: boolean | null
          is_public?: boolean | null
          lead_count?: number | null
          max_pax?: number | null
          num_days?: number | null
          org_id: string
          origin?: string | null
          pdf_requires_lead?: boolean | null
          pdf_url?: string | null
          public_token?: string | null
          quotation_id?: string | null
          return_date?: string | null
          share_count?: number | null
          status?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          ai_generated?: boolean | null
          ai_prompt_used?: string | null
          cover_emoji?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          current_pax?: number | null
          departure_date?: string | null
          destination?: string | null
          destination_lat?: number | null
          destination_lng?: number | null
          excludes_text?: string[] | null
          group_name?: string | null
          id?: string
          important_notes?: string | null
          includes_text?: string[] | null
          is_group_itinerary?: boolean | null
          is_public?: boolean | null
          lead_count?: number | null
          max_pax?: number | null
          num_days?: number | null
          org_id?: string
          origin?: string | null
          pdf_requires_lead?: boolean | null
          pdf_url?: string | null
          public_token?: string | null
          quotation_id?: string | null
          return_date?: string | null
          share_count?: number | null
          status?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "itineraries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itineraries_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      itinerary_days: {
        Row: {
          city: string | null
          country: string | null
          date: string | null
          day_number: number | null
          id: string
          label: string | null
          quote_id: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          date?: string | null
          day_number?: number | null
          id?: string
          label?: string | null
          quote_id?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          date?: string | null
          day_number?: number | null
          id?: string
          label?: string | null
          quote_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_days_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      itinerary_geo_cache: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          lat: number
          lng: number
          query: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          lat: number
          lng: number
          query: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          lat?: number
          lng?: number
          query?: string
        }
        Relationships: []
      }
      itinerary_items: {
        Row: {
          description: string | null
          id: string
          itinerary_day_id: string | null
          order_position: number | null
        }
        Insert: {
          description?: string | null
          id?: string
          itinerary_day_id?: string | null
          order_position?: number | null
        }
        Update: {
          description?: string | null
          id?: string
          itinerary_day_id?: string | null
          order_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_items_itinerary_day_id_fkey"
            columns: ["itinerary_day_id"]
            isOneToOne: false
            referencedRelation: "itinerary_days"
            referencedColumns: ["id"]
          },
        ]
      }
      itinerary_leads: {
        Row: {
          action: string | null
          created_at: string | null
          email: string
          id: string
          itinerary_id: string
          name: string | null
          org_id: string
          utm_source: string | null
          whatsapp: string
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          email: string
          id?: string
          itinerary_id: string
          name?: string | null
          org_id: string
          utm_source?: string | null
          whatsapp: string
        }
        Update: {
          action?: string | null
          created_at?: string | null
          email?: string
          id?: string
          itinerary_id?: string
          name?: string | null
          org_id?: string
          utm_source?: string | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_itinerary_leads_org"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_leads_itinerary_id_fkey"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "itineraries"
            referencedColumns: ["id"]
          },
        ]
      }
      itinerary_stops: {
        Row: {
          address: string | null
          category: string | null
          city: string | null
          country: string | null
          created_at: string | null
          day_number: number
          description: string | null
          destination_id: string | null
          duration_minutes: number | null
          emoji: string | null
          experience_id: string | null
          hotel_id: string | null
          id: string
          is_optional: boolean | null
          itinerary_id: string
          lat: number | null
          lng: number | null
          name: string
          photo_url: string | null
          position: number
          rating: number | null
          stop_type: string | null
          time_start: string | null
          tips: string[] | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          day_number: number
          description?: string | null
          destination_id?: string | null
          duration_minutes?: number | null
          emoji?: string | null
          experience_id?: string | null
          hotel_id?: string | null
          id?: string
          is_optional?: boolean | null
          itinerary_id: string
          lat?: number | null
          lng?: number | null
          name: string
          photo_url?: string | null
          position: number
          rating?: number | null
          stop_type?: string | null
          time_start?: string | null
          tips?: string[] | null
        }
        Update: {
          address?: string | null
          category?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          day_number?: number
          description?: string | null
          destination_id?: string | null
          duration_minutes?: number | null
          emoji?: string | null
          experience_id?: string | null
          hotel_id?: string | null
          id?: string
          is_optional?: boolean | null
          itinerary_id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          photo_url?: string | null
          position?: number
          rating?: number | null
          stop_type?: string | null
          time_start?: string | null
          tips?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_stops_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_stops_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_stops_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels_bank"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_stops_itinerary_id_fkey"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "itineraries"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_boards: {
        Row: {
          board_type: string
          created_at: string
          id: string
          name: string
          org_id: string
          slug: string
          updated_at: string
        }
        Insert: {
          board_type?: string
          created_at?: string
          id?: string
          name: string
          org_id: string
          slug: string
          updated_at?: string
        }
        Update: {
          board_type?: string
          created_at?: string
          id?: string
          name?: string
          org_id?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_boards_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_cards: {
        Row: {
          assigned_to: string | null
          board_id: string
          client_id: string | null
          column_id: string
          created_at: string
          description: string | null
          due_date: string | null
          email: string | null
          estimated_value: number | null
          id: string
          linked_card_ids: string[] | null
          meta: Json
          metadata: Json | null
          org_id: string
          position: number
          priority: string
          quotation_id: string | null
          status: string
          tags: string[] | null
          task_type: string | null
          ticket_id: string | null
          title: string
          trip_id: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          assigned_to?: string | null
          board_id: string
          client_id?: string | null
          column_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          email?: string | null
          estimated_value?: number | null
          id?: string
          linked_card_ids?: string[] | null
          meta?: Json
          metadata?: Json | null
          org_id: string
          position?: number
          priority?: string
          quotation_id?: string | null
          status?: string
          tags?: string[] | null
          task_type?: string | null
          ticket_id?: string | null
          title: string
          trip_id?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          assigned_to?: string | null
          board_id?: string
          client_id?: string | null
          column_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          email?: string | null
          estimated_value?: number | null
          id?: string
          linked_card_ids?: string[] | null
          meta?: Json
          metadata?: Json | null
          org_id?: string
          position?: number
          priority?: string
          quotation_id?: string | null
          status?: string
          tags?: string[] | null
          task_type?: string | null
          ticket_id?: string | null
          title?: string
          trip_id?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kanban_cards_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_cards_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "kanban_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_cards_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_cards_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "kanban_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_cards_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_cards_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_cards_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_cards_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_checklist_items: {
        Row: {
          checked_at: string | null
          checklist_id: string
          created_at: string
          id: string
          is_checked: boolean
          position: number
          title: string
        }
        Insert: {
          checked_at?: string | null
          checklist_id: string
          created_at?: string
          id?: string
          is_checked?: boolean
          position?: number
          title: string
        }
        Update: {
          checked_at?: string | null
          checklist_id?: string
          created_at?: string
          id?: string
          is_checked?: boolean
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "kanban_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_checklists: {
        Row: {
          card_id: string
          created_at: string
          id: string
          org_id: string
          title: string
        }
        Insert: {
          card_id: string
          created_at?: string
          id?: string
          org_id: string
          title?: string
        }
        Update: {
          card_id?: string
          created_at?: string
          id?: string
          org_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_checklists_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "kanban_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_checklists_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_columns: {
        Row: {
          board_id: string
          color: string | null
          created_at: string
          id: string
          name: string
          org_id: string
          position: number
          updated_at: string
          wip_limit: number | null
        }
        Insert: {
          board_id: string
          color?: string | null
          created_at?: string
          id?: string
          name: string
          org_id: string
          position?: number
          updated_at?: string
          wip_limit?: number | null
        }
        Update: {
          board_id?: string
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          org_id?: string
          position?: number
          updated_at?: string
          wip_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kanban_columns_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "kanban_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_columns_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_notes: {
        Row: {
          author_id: string | null
          body: string
          card_id: string
          created_at: string
          id: string
          org_id: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body: string
          card_id: string
          created_at?: string
          id?: string
          org_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          card_id?: string
          created_at?: string
          id?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_notes_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "kanban_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_notes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_tags: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          org_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          org_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_tags_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          block_id: string | null
          created_at: string
          email: string
          id: string
          metadata: Json
          name: string | null
          notes: string | null
          phone: string | null
          publication_id: string | null
          status: string
          tags: string[]
          updated_at: string
          utm: Json
          workspace_id: string
        }
        Insert: {
          block_id?: string | null
          created_at?: string
          email: string
          id?: string
          metadata?: Json
          name?: string | null
          notes?: string | null
          phone?: string | null
          publication_id?: string | null
          status?: string
          tags?: string[]
          updated_at?: string
          utm?: Json
          workspace_id: string
        }
        Update: {
          block_id?: string | null
          created_at?: string
          email?: string
          id?: string
          metadata?: Json
          name?: string | null
          notes?: string | null
          phone?: string | null
          publication_id?: string | null
          status?: string
          tags?: string[]
          updated_at?: string
          utm?: Json
          workspace_id?: string
        }
        Relationships: []
      }
      news_items: {
        Row: {
          blog_article_id: string | null
          categories: string[]
          content_extracted: boolean
          content_markdown: string | null
          content_piece_ids: string[]
          created_at: string
          description: string | null
          fetched_at: string
          id: string
          latest_simlab_run_id: string | null
          published_at: string | null
          relevance_reason: string | null
          relevance_score: number
          rss_source_id: string | null
          simlab_status: string | null
          simlab_validated_at: string | null
          source_url: string
          status: string | null
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          blog_article_id?: string | null
          categories?: string[]
          content_extracted?: boolean
          content_markdown?: string | null
          content_piece_ids?: string[]
          created_at?: string
          description?: string | null
          fetched_at?: string
          id?: string
          latest_simlab_run_id?: string | null
          published_at?: string | null
          relevance_reason?: string | null
          relevance_score?: number
          rss_source_id?: string | null
          simlab_status?: string | null
          simlab_validated_at?: string | null
          source_url: string
          status?: string | null
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          blog_article_id?: string | null
          categories?: string[]
          content_extracted?: boolean
          content_markdown?: string | null
          content_piece_ids?: string[]
          created_at?: string
          description?: string | null
          fetched_at?: string
          id?: string
          latest_simlab_run_id?: string | null
          published_at?: string | null
          relevance_reason?: string | null
          relevance_score?: number
          rss_source_id?: string | null
          simlab_status?: string | null
          simlab_validated_at?: string | null
          source_url?: string
          status?: string | null
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_items_rss_source_id_fkey"
            columns: ["rss_source_id"]
            isOneToOne: false
            referencedRelation: "rss_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string | null
          metadata: Json
          org_id: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string | null
          metadata?: Json
          org_id?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string | null
          metadata?: Json
          org_id?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: Json | null
          ai_keys_config: Json | null
          charge_template_text: string | null
          created_at: string
          email: string | null
          evolution_api_key: string | null
          evolution_api_url: string | null
          evolution_instance: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          phone: string | null
          pix_key: string | null
          pix_key_type: string
          primary_color: string | null
          slug: string | null
          updated_at: string
          website: string | null
          whatsapp: string | null
          whatsapp_cooldown_days: number
          whatsapp_enabled: boolean
        }
        Insert: {
          address?: Json | null
          ai_keys_config?: Json | null
          charge_template_text?: string | null
          created_at?: string
          email?: string | null
          evolution_api_key?: string | null
          evolution_api_url?: string | null
          evolution_instance?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          phone?: string | null
          pix_key?: string | null
          pix_key_type?: string
          primary_color?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
          whatsapp_cooldown_days?: number
          whatsapp_enabled?: boolean
        }
        Update: {
          address?: Json | null
          ai_keys_config?: Json | null
          charge_template_text?: string | null
          created_at?: string
          email?: string | null
          evolution_api_key?: string | null
          evolution_api_url?: string | null
          evolution_instance?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          phone?: string | null
          pix_key?: string | null
          pix_key_type?: string
          primary_color?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
          whatsapp_cooldown_days?: number
          whatsapp_enabled?: boolean
        }
        Relationships: []
      }
      policy_cache: {
        Row: {
          ativa: boolean
          atualizado_em: string
          conteudo: Json
          criado_em: string
          criado_por: string | null
          hash_conteudo: string | null
          id: string
          notas_internas: string | null
          operadora: string
          operadora_display: string | null
          org_id: string
          tipo: string
          versao: number
        }
        Insert: {
          ativa?: boolean
          atualizado_em?: string
          conteudo?: Json
          criado_em?: string
          criado_por?: string | null
          hash_conteudo?: string | null
          id?: string
          notas_internas?: string | null
          operadora: string
          operadora_display?: string | null
          org_id: string
          tipo?: string
          versao?: number
        }
        Update: {
          ativa?: boolean
          atualizado_em?: string
          conteudo?: Json
          criado_em?: string
          criado_por?: string | null
          hash_conteudo?: string | null
          id?: string
          notas_internas?: string | null
          operadora?: string
          operadora_display?: string | null
          org_id?: string
          tipo?: string
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "policy_cache_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_ai_photos: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          org_id: string
          original_url: string
          prompt_used: string | null
          provider: string | null
          result_url: string | null
          status: string | null
          style: string
          trip_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          org_id: string
          original_url: string
          prompt_used?: string | null
          provider?: string | null
          result_url?: string | null
          status?: string | null
          style: string
          trip_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          org_id?: string
          original_url?: string
          prompt_used?: string | null
          provider?: string | null
          result_url?: string | null
          status?: string | null
          style?: string
          trip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_ai_photos_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_ai_photos_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          first_name: string
          full_name: string | null
          id: string
          is_active: boolean
          is_admin: boolean | null
          last_name: string
          last_seen_at: string | null
          notification_prefs: Json
          org_id: string | null
          role: string
          updated_at: string | null
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          first_name?: string
          full_name?: string | null
          id: string
          is_active?: boolean
          is_admin?: boolean | null
          last_name?: string
          last_seen_at?: string | null
          notification_prefs?: Json
          org_id?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          is_admin?: boolean | null
          last_name?: string
          last_seen_at?: string | null
          notification_prefs?: Json
          org_id?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_scenarios: {
        Row: {
          agent_rationale: string | null
          ai_reasoning: string | null
          created_at: string
          description: string | null
          estimated_extra_cost_brl: number | null
          estimated_savings_brl: number | null
          flight_score: number | null
          flights_json: Json | null
          hotel_score: number | null
          hotels_json: Json | null
          id: string
          is_selected: boolean
          logistics_score: number | null
          metadata: Json | null
          org_id: string
          price_score: number | null
          quotation_id: string
          recommendation: string | null
          recommended: boolean
          scenario_label: string | null
          scenario_type: string
          score: number | null
          score_breakdown: Json | null
          suggested_changes: Json | null
          title: string | null
          total_price: number | null
        }
        Insert: {
          agent_rationale?: string | null
          ai_reasoning?: string | null
          created_at?: string
          description?: string | null
          estimated_extra_cost_brl?: number | null
          estimated_savings_brl?: number | null
          flight_score?: number | null
          flights_json?: Json | null
          hotel_score?: number | null
          hotels_json?: Json | null
          id?: string
          is_selected?: boolean
          logistics_score?: number | null
          metadata?: Json | null
          org_id: string
          price_score?: number | null
          quotation_id: string
          recommendation?: string | null
          recommended?: boolean
          scenario_label?: string | null
          scenario_type?: string
          score?: number | null
          score_breakdown?: Json | null
          suggested_changes?: Json | null
          title?: string | null
          total_price?: number | null
        }
        Update: {
          agent_rationale?: string | null
          ai_reasoning?: string | null
          created_at?: string
          description?: string | null
          estimated_extra_cost_brl?: number | null
          estimated_savings_brl?: number | null
          flight_score?: number | null
          flights_json?: Json | null
          hotel_score?: number | null
          hotels_json?: Json | null
          id?: string
          is_selected?: boolean
          logistics_score?: number | null
          metadata?: Json | null
          org_id?: string
          price_score?: number | null
          quotation_id?: string
          recommendation?: string | null
          recommended?: boolean
          scenario_label?: string | null
          scenario_type?: string
          score?: number | null
          score_breakdown?: Json | null
          suggested_changes?: Json | null
          title?: string | null
          total_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotation_scenarios_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          adults: number | null
          agent_id: string | null
          ai_extracted: boolean | null
          ai_raw_response: Json | null
          cancelamento_data_limite: string | null
          cancelamento_texto_raw: string | null
          cancelamento_valor_multa: number | null
          check_in: string | null
          check_out: string | null
          children: number | null
          client_id: string | null
          confirmed_at: string | null
          cover_image_url: string | null
          cover_subtitle: string | null
          cover_title: string | null
          created_at: string
          currency: string
          departure_date: string | null
          destination: string | null
          expires_at: string | null
          hotel_name: string | null
          hotel_photo_url: string | null
          hotel_stars: number | null
          id: string
          id_operadora: string | null
          impostos: number | null
          installments: Json | null
          meal_plan: string | null
          notes: string | null
          notes_internal: string | null
          num_adults: number
          num_children: number
          num_nights: number | null
          operadora_nome: string | null
          org_id: string
          pax_adultos: number | null
          pax_criancas: number | null
          pax_infantil: number | null
          pax_seniores: number | null
          pricing_mode: string | null
          public_token: string | null
          return_date: string | null
          room_type: string | null
          sent_at: string | null
          source_file_url: string | null
          status: string
          tarifa_base: number | null
          taxas: number | null
          title: string | null
          total_value: number | null
          updated_at: string
          valid_until: string | null
          viewed_at: string | null
          whatsapp_text: string | null
        }
        Insert: {
          adults?: number | null
          agent_id?: string | null
          ai_extracted?: boolean | null
          ai_raw_response?: Json | null
          cancelamento_data_limite?: string | null
          cancelamento_texto_raw?: string | null
          cancelamento_valor_multa?: number | null
          check_in?: string | null
          check_out?: string | null
          children?: number | null
          client_id?: string | null
          confirmed_at?: string | null
          cover_image_url?: string | null
          cover_subtitle?: string | null
          cover_title?: string | null
          created_at?: string
          currency?: string
          departure_date?: string | null
          destination?: string | null
          expires_at?: string | null
          hotel_name?: string | null
          hotel_photo_url?: string | null
          hotel_stars?: number | null
          id?: string
          id_operadora?: string | null
          impostos?: number | null
          installments?: Json | null
          meal_plan?: string | null
          notes?: string | null
          notes_internal?: string | null
          num_adults?: number
          num_children?: number
          num_nights?: number | null
          operadora_nome?: string | null
          org_id: string
          pax_adultos?: number | null
          pax_criancas?: number | null
          pax_infantil?: number | null
          pax_seniores?: number | null
          pricing_mode?: string | null
          public_token?: string | null
          return_date?: string | null
          room_type?: string | null
          sent_at?: string | null
          source_file_url?: string | null
          status?: string
          tarifa_base?: number | null
          taxas?: number | null
          title?: string | null
          total_value?: number | null
          updated_at?: string
          valid_until?: string | null
          viewed_at?: string | null
          whatsapp_text?: string | null
        }
        Update: {
          adults?: number | null
          agent_id?: string | null
          ai_extracted?: boolean | null
          ai_raw_response?: Json | null
          cancelamento_data_limite?: string | null
          cancelamento_texto_raw?: string | null
          cancelamento_valor_multa?: number | null
          check_in?: string | null
          check_out?: string | null
          children?: number | null
          client_id?: string | null
          confirmed_at?: string | null
          cover_image_url?: string | null
          cover_subtitle?: string | null
          cover_title?: string | null
          created_at?: string
          currency?: string
          departure_date?: string | null
          destination?: string | null
          expires_at?: string | null
          hotel_name?: string | null
          hotel_photo_url?: string | null
          hotel_stars?: number | null
          id?: string
          id_operadora?: string | null
          impostos?: number | null
          installments?: Json | null
          meal_plan?: string | null
          notes?: string | null
          notes_internal?: string | null
          num_adults?: number
          num_children?: number
          num_nights?: number | null
          operadora_nome?: string | null
          org_id?: string
          pax_adultos?: number | null
          pax_criancas?: number | null
          pax_infantil?: number | null
          pax_seniores?: number | null
          pricing_mode?: string | null
          public_token?: string | null
          return_date?: string | null
          room_type?: string | null
          sent_at?: string | null
          source_file_url?: string | null
          status?: string
          tarifa_base?: number | null
          taxas?: number | null
          title?: string | null
          total_value?: number | null
          updated_at?: string
          valid_until?: string | null
          viewed_at?: string | null
          whatsapp_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_chips: {
        Row: {
          icon: string | null
          id: string
          label: string | null
          order_position: number | null
          quote_id: string | null
        }
        Insert: {
          icon?: string | null
          id?: string
          label?: string | null
          order_position?: number | null
          quote_id?: string | null
        }
        Update: {
          icon?: string | null
          id?: string
          label?: string | null
          order_position?: number | null
          quote_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_chips_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_destinations: {
        Row: {
          destination_id: string | null
          end_date: string | null
          id: string
          nights: number | null
          order_position: number | null
          quote_id: string | null
          start_date: string | null
        }
        Insert: {
          destination_id?: string | null
          end_date?: string | null
          id?: string
          nights?: number | null
          order_position?: number | null
          quote_id?: string | null
          start_date?: string | null
        }
        Update: {
          destination_id?: string | null
          end_date?: string | null
          id?: string
          nights?: number | null
          order_position?: number | null
          quote_id?: string | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_destinations_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_destinations_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_experiences: {
        Row: {
          adultos: number | null
          created_at: string | null
          criancas: number | null
          data_fim: string | null
          data_inicio: string | null
          experience_id: string | null
          fornecedor: string | null
          id: string
          infantil: number | null
          instrucoes: string | null
          nome: string
          order_position: number | null
          quote_id: string
          tipo: string
          valor_total: number | null
        }
        Insert: {
          adultos?: number | null
          created_at?: string | null
          criancas?: number | null
          data_fim?: string | null
          data_inicio?: string | null
          experience_id?: string | null
          fornecedor?: string | null
          id?: string
          infantil?: number | null
          instrucoes?: string | null
          nome: string
          order_position?: number | null
          quote_id: string
          tipo?: string
          valor_total?: number | null
        }
        Update: {
          adultos?: number | null
          created_at?: string | null
          criancas?: number | null
          data_fim?: string | null
          data_inicio?: string | null
          experience_id?: string | null
          fornecedor?: string | null
          id?: string
          infantil?: number | null
          instrucoes?: string | null
          nome?: string
          order_position?: number | null
          quote_id?: string
          tipo?: string
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_experiences_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_experiences_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_hotels: {
        Row: {
          check_in: string | null
          check_out: string | null
          destination_id: string | null
          hotel_id: string | null
          id: string
          is_included: boolean | null
          nights: number | null
          quote_id: string | null
          room_type: string | null
          total_price: number | null
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          destination_id?: string | null
          hotel_id?: string | null
          id?: string
          is_included?: boolean | null
          nights?: number | null
          quote_id?: string | null
          room_type?: string | null
          total_price?: number | null
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          destination_id?: string | null
          hotel_id?: string | null
          id?: string
          is_included?: boolean | null
          nights?: number | null
          quote_id?: string | null
          room_type?: string | null
          total_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_hotels_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_hotels_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels_bank"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_hotels_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_includes: {
        Row: {
          description: string | null
          icon: string | null
          id: string
          order_position: number | null
          quote_id: string | null
          title: string | null
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id?: string
          order_position?: number | null
          quote_id?: string | null
          title?: string | null
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: string
          order_position?: number | null
          quote_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_includes_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_price_items: {
        Row: {
          amount: number | null
          icon: string | null
          id: string
          label: string | null
          order_position: number | null
          quote_id: string | null
        }
        Insert: {
          amount?: number | null
          icon?: string | null
          id?: string
          label?: string | null
          order_position?: number | null
          quote_id?: string | null
        }
        Update: {
          amount?: number | null
          icon?: string | null
          id?: string
          label?: string | null
          order_position?: number | null
          quote_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_price_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_transfers: {
        Row: {
          adultos: number | null
          created_at: string | null
          criancas: number | null
          data_fim: string | null
          data_inicio: string | null
          fornecedor: string | null
          id: string
          instrucoes: string | null
          limite_bagagem_kg: number | null
          nome: string | null
          order_position: number | null
          ponto_encontro: string | null
          quote_id: string
          tipo: string
          valor_total: number | null
        }
        Insert: {
          adultos?: number | null
          created_at?: string | null
          criancas?: number | null
          data_fim?: string | null
          data_inicio?: string | null
          fornecedor?: string | null
          id?: string
          instrucoes?: string | null
          limite_bagagem_kg?: number | null
          nome?: string | null
          order_position?: number | null
          ponto_encontro?: string | null
          quote_id: string
          tipo?: string
          valor_total?: number | null
        }
        Update: {
          adultos?: number | null
          created_at?: string | null
          criancas?: number | null
          data_fim?: string | null
          data_inicio?: string | null
          fornecedor?: string | null
          id?: string
          instrucoes?: string | null
          limite_bagagem_kg?: number | null
          nome?: string | null
          order_position?: number | null
          ponto_encontro?: string | null
          quote_id?: string
          tipo?: string
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_transfers_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      rss_feeds: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          last_fetched_at: string | null
          name: string | null
          updated_at: string
          url: string
          workspace_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_fetched_at?: string | null
          name?: string | null
          updated_at?: string
          url: string
          workspace_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_fetched_at?: string | null
          name?: string | null
          updated_at?: string
          url?: string
          workspace_id?: string
        }
        Relationships: []
      }
      rss_items: {
        Row: {
          author: string | null
          categories: string[] | null
          content_extracted: boolean | null
          derivations: Json
          description: string | null
          fetched_at: string
          id: string
          image_url: string | null
          item_url: string
          latest_simlab_run_id: string | null
          published_at: string | null
          relevance_reason: string | null
          relevance_score: number
          source_id: string
          status: string | null
          title: string | null
          workspace_id: string
        }
        Insert: {
          author?: string | null
          categories?: string[] | null
          content_extracted?: boolean | null
          derivations?: Json
          description?: string | null
          fetched_at?: string
          id?: string
          image_url?: string | null
          item_url: string
          latest_simlab_run_id?: string | null
          published_at?: string | null
          relevance_reason?: string | null
          relevance_score?: number
          source_id: string
          status?: string | null
          title?: string | null
          workspace_id: string
        }
        Update: {
          author?: string | null
          categories?: string[] | null
          content_extracted?: boolean | null
          derivations?: Json
          description?: string | null
          fetched_at?: string
          id?: string
          image_url?: string | null
          item_url?: string
          latest_simlab_run_id?: string | null
          published_at?: string | null
          relevance_reason?: string | null
          relevance_score?: number
          source_id?: string
          status?: string | null
          title?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rss_items_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "rss_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      rss_sources: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          feed_url: string
          id: string
          is_active: boolean | null
          is_system: boolean
          last_error: string | null
          last_fetched_at: string | null
          locale: string
          name: string
          publication_id: string | null
          status: string
          updated_at: string
          url: string | null
          workspace_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          feed_url: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean
          last_error?: string | null
          last_fetched_at?: string | null
          locale?: string
          name: string
          publication_id?: string | null
          status?: string
          updated_at?: string
          url?: string | null
          workspace_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          feed_url?: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean
          last_error?: string | null
          last_fetched_at?: string | null
          locale?: string
          name?: string
          publication_id?: string | null
          status?: string
          updated_at?: string
          url?: string | null
          workspace_id?: string
        }
        Relationships: []
      }
      scheduled_jobs: {
        Row: {
          created_at: string
          cron_expr: string
          id: string
          is_enabled: boolean
          job_function: string
          job_name: string
          last_run_at: string | null
          last_status: string | null
          org_id: string | null
          payload: Json | null
        }
        Insert: {
          created_at?: string
          cron_expr: string
          id?: string
          is_enabled?: boolean
          job_function: string
          job_name: string
          last_run_at?: string | null
          last_status?: string | null
          org_id?: string | null
          payload?: Json | null
        }
        Update: {
          created_at?: string
          cron_expr?: string
          id?: string
          is_enabled?: boolean
          job_function?: string
          job_name?: string
          last_run_at?: string | null
          last_status?: string | null
          org_id?: string | null
          payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_jobs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assignee_id: string | null
          channel: string
          created_at: string
          id: string
          priority: string
          rating: number | null
          resolved_at: string | null
          sla_deadline: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          assignee_id?: string | null
          channel?: string
          created_at?: string
          id?: string
          priority?: string
          rating?: number | null
          resolved_at?: string | null
          sla_deadline?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          assignee_id?: string | null
          channel?: string
          created_at?: string
          id?: string
          priority?: string
          rating?: number | null
          resolved_at?: string | null
          sla_deadline?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          code: string
          created_at: string
          detail: Json
          id: string
          level: string
          message: string
          module: string
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          detail?: Json
          id?: string
          level: string
          message: string
          module: string
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          detail?: Json
          id?: string
          level?: string
          message?: string
          module?: string
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          commission_rate: number | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          org_id: string
          role: string
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          org_id: string
          role?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          commission_rate?: number | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          org_id?: string
          role?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          attachments: Json
          created_at: string
          id: string
          is_internal: boolean
          message: string
          sender_id: string
          ticket_id: string
        }
        Insert: {
          attachments?: Json
          created_at?: string
          id?: string
          is_internal?: boolean
          message: string
          sender_id: string
          ticket_id: string
        }
        Update: {
          attachments?: Json
          created_at?: string
          id?: string
          is_internal?: boolean
          message?: string
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          client_id: string | null
          created_at: string
          description: string | null
          id: string
          org_id: string
          priority: string
          resolved_at: string | null
          status: string
          ticket_code: string | null
          title: string
          trip_id: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          org_id: string
          priority?: string
          resolved_at?: string | null
          status?: string
          ticket_code?: string | null
          title: string
          trip_id?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          org_id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          ticket_code?: string | null
          title?: string
          trip_id?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      traveler_checklists: {
        Row: {
          client_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          items: Json
          org_id: string
          public_token: string | null
          title: string | null
          trip_id: string | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          items?: Json
          org_id: string
          public_token?: string | null
          title?: string | null
          trip_id?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          items?: Json
          org_id?: string
          public_token?: string | null
          title?: string | null
          trip_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "traveler_checklists_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traveler_checklists_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traveler_checklists_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      traveler_info_pages: {
        Row: {
          content: Json | null
          created_at: string
          id: string
          is_published: boolean | null
          org_id: string
          public_token: string | null
          slug: string | null
          title: string | null
          trip_id: string | null
          updated_at: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          org_id: string
          public_token?: string | null
          slug?: string | null
          title?: string | null
          trip_id?: string | null
          updated_at?: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          org_id?: string
          public_token?: string | null
          slug?: string | null
          title?: string | null
          trip_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "traveler_info_pages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traveler_info_pages_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      travelers: {
        Row: {
          birth_date: string | null
          client_id: string | null
          cpf: string | null
          created_at: string
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          form_completed_at: string | null
          form_token: string | null
          frequent_flyer: Json
          full_name: string
          gender: string | null
          id: string
          nationality: string | null
          org_id: string
          passport_country: string | null
          passport_expiry: string | null
          passport_number: string | null
          phone: string | null
          photo_url: string | null
          preferences: Json | null
          rg: string | null
          special_needs: string | null
          updated_at: string
          vaccines: Json
        }
        Insert: {
          birth_date?: string | null
          client_id?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          form_completed_at?: string | null
          form_token?: string | null
          frequent_flyer?: Json
          full_name: string
          gender?: string | null
          id?: string
          nationality?: string | null
          org_id: string
          passport_country?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          phone?: string | null
          photo_url?: string | null
          preferences?: Json | null
          rg?: string | null
          special_needs?: string | null
          updated_at?: string
          vaccines?: Json
        }
        Update: {
          birth_date?: string | null
          client_id?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          form_completed_at?: string | null
          form_token?: string | null
          frequent_flyer?: Json
          full_name?: string
          gender?: string | null
          id?: string
          nationality?: string | null
          org_id?: string
          passport_country?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          phone?: string | null
          photo_url?: string | null
          preferences?: Json | null
          rg?: string | null
          special_needs?: string | null
          updated_at?: string
          vaccines?: Json
        }
        Relationships: [
          {
            foreignKeyName: "travelers_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travelers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_contracts: {
        Row: {
          client_id: string
          content_html: string | null
          created_at: string | null
          id: string
          signature_url: string | null
          signed_at: string | null
          status: string
          template_id: string | null
          trip_id: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          content_html?: string | null
          created_at?: string | null
          id?: string
          signature_url?: string | null
          signed_at?: string | null
          status?: string
          template_id?: string | null
          trip_id: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          content_html?: string | null
          created_at?: string | null
          id?: string
          signature_url?: string | null
          signed_at?: string | null
          status?: string
          template_id?: string | null
          trip_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_contracts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "contract_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_contracts_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_documents: {
        Row: {
          created_at: string
          doc_type: string
          file_url: string
          id: string
          is_visible_to_client: boolean
          notes: string | null
          org_id: string
          storage_path: string | null
          title: string
          trip_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          doc_type: string
          file_url: string
          id?: string
          is_visible_to_client?: boolean
          notes?: string | null
          org_id: string
          storage_path?: string | null
          title: string
          trip_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          doc_type?: string
          file_url?: string
          id?: string
          is_visible_to_client?: boolean
          notes?: string | null
          org_id?: string
          storage_path?: string | null
          title?: string
          trip_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_documents_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_flights: {
        Row: {
          airline_code: string | null
          airline_name: string | null
          arrival_datetime: string | null
          baggage_included: boolean
          boarding_pass_url: string | null
          cabin_class: string
          checkin_done: boolean
          checkin_link: string | null
          created_at: string
          departure_datetime: string | null
          destination_airport: string | null
          destination_city: string | null
          direction: string
          duration_minutes: number | null
          flight_number: string | null
          id: string
          locator: string | null
          org_id: string
          origin_airport: string | null
          origin_city: string | null
          sequence: number
          status: string
          trip_id: string
          updated_at: string
        }
        Insert: {
          airline_code?: string | null
          airline_name?: string | null
          arrival_datetime?: string | null
          baggage_included?: boolean
          boarding_pass_url?: string | null
          cabin_class?: string
          checkin_done?: boolean
          checkin_link?: string | null
          created_at?: string
          departure_datetime?: string | null
          destination_airport?: string | null
          destination_city?: string | null
          direction?: string
          duration_minutes?: number | null
          flight_number?: string | null
          id?: string
          locator?: string | null
          org_id: string
          origin_airport?: string | null
          origin_city?: string | null
          sequence?: number
          status?: string
          trip_id: string
          updated_at?: string
        }
        Update: {
          airline_code?: string | null
          airline_name?: string | null
          arrival_datetime?: string | null
          baggage_included?: boolean
          boarding_pass_url?: string | null
          cabin_class?: string
          checkin_done?: boolean
          checkin_link?: string | null
          created_at?: string
          departure_datetime?: string | null
          destination_airport?: string | null
          destination_city?: string | null
          direction?: string
          duration_minutes?: number | null
          flight_number?: string | null
          id?: string
          locator?: string | null
          org_id?: string
          origin_airport?: string | null
          origin_city?: string | null
          sequence?: number
          status?: string
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_flights_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_flights_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_travelers: {
        Row: {
          created_at: string
          form_completed_at: string | null
          form_token: string
          id: string
          is_lead: boolean
          room_type: string | null
          seat_number: string | null
          special_requests: string | null
          ticket_number: string | null
          traveler_id: string
          trip_id: string
        }
        Insert: {
          created_at?: string
          form_completed_at?: string | null
          form_token?: string
          id?: string
          is_lead?: boolean
          room_type?: string | null
          seat_number?: string | null
          special_requests?: string | null
          ticket_number?: string | null
          traveler_id: string
          trip_id: string
        }
        Update: {
          created_at?: string
          form_completed_at?: string | null
          form_token?: string
          id?: string
          is_lead?: boolean
          room_type?: string | null
          seat_number?: string | null
          special_requests?: string | null
          ticket_number?: string | null
          traveler_id?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_travelers_traveler_id_fkey"
            columns: ["traveler_id"]
            isOneToOne: false
            referencedRelation: "travelers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_travelers_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          airline: string | null
          assigned_agent_id: string | null
          check_in: string | null
          check_out: string | null
          contract_url: string | null
          created_at: string
          currency: string
          departure_date: string | null
          destination: string | null
          destination_city: string | null
          destination_country: string | null
          flight_number: string | null
          hotel_name: string | null
          hotel_regime: string | null
          id: string
          includes_transfer: boolean
          insurance_company: string | null
          insurance_policy: string | null
          itinerary_id: string | null
          locator_code: string | null
          meal_plan: string | null
          meta: Json
          notes_client: string | null
          notes_internal: string | null
          num_nights: number | null
          operator_id: string | null
          operator_name: string | null
          org_id: string
          origin_city: string | null
          passengers_count: number | null
          pax_count: number | null
          payment_status: string
          primary_client_id: string | null
          quotation_id: string | null
          return_date: string | null
          room_type: string | null
          status: string
          supplier: string | null
          title: string
          total_price: number | null
          total_value: number | null
          updated_at: string
          value: number | null
          voucher_url: string | null
        }
        Insert: {
          airline?: string | null
          assigned_agent_id?: string | null
          check_in?: string | null
          check_out?: string | null
          contract_url?: string | null
          created_at?: string
          currency?: string
          departure_date?: string | null
          destination?: string | null
          destination_city?: string | null
          destination_country?: string | null
          flight_number?: string | null
          hotel_name?: string | null
          hotel_regime?: string | null
          id?: string
          includes_transfer?: boolean
          insurance_company?: string | null
          insurance_policy?: string | null
          itinerary_id?: string | null
          locator_code?: string | null
          meal_plan?: string | null
          meta?: Json
          notes_client?: string | null
          notes_internal?: string | null
          num_nights?: number | null
          operator_id?: string | null
          operator_name?: string | null
          org_id: string
          origin_city?: string | null
          passengers_count?: number | null
          pax_count?: number | null
          payment_status?: string
          primary_client_id?: string | null
          quotation_id?: string | null
          return_date?: string | null
          room_type?: string | null
          status?: string
          supplier?: string | null
          title: string
          total_price?: number | null
          total_value?: number | null
          updated_at?: string
          value?: number | null
          voucher_url?: string | null
        }
        Update: {
          airline?: string | null
          assigned_agent_id?: string | null
          check_in?: string | null
          check_out?: string | null
          contract_url?: string | null
          created_at?: string
          currency?: string
          departure_date?: string | null
          destination?: string | null
          destination_city?: string | null
          destination_country?: string | null
          flight_number?: string | null
          hotel_name?: string | null
          hotel_regime?: string | null
          id?: string
          includes_transfer?: boolean
          insurance_company?: string | null
          insurance_policy?: string | null
          itinerary_id?: string | null
          locator_code?: string | null
          meal_plan?: string | null
          meta?: Json
          notes_client?: string | null
          notes_internal?: string | null
          num_nights?: number | null
          operator_id?: string | null
          operator_name?: string | null
          org_id?: string
          origin_city?: string | null
          passengers_count?: number | null
          pax_count?: number | null
          payment_status?: string
          primary_client_id?: string | null
          quotation_id?: string | null
          return_date?: string | null
          room_type?: string | null
          status?: string
          supplier?: string | null
          title?: string
          total_price?: number | null
          total_value?: number | null
          updated_at?: string
          value?: number | null
          voucher_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_trips_itinerary"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "itineraries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_primary_client_id_fkey"
            columns: ["primary_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      wa_conversation_logs: {
        Row: {
          agent_id: string | null
          ai_action_items: Json | null
          ai_sentiment: string | null
          ai_summary: string | null
          ai_topics: string[] | null
          client_id: string | null
          created_at: string | null
          duration_minutes: number | null
          ended_at: string | null
          id: string
          media_urls: string[] | null
          messages_json: Json | null
          org_id: string
          started_at: string | null
          wa_contact_name: string | null
          wa_phone: string
        }
        Insert: {
          agent_id?: string | null
          ai_action_items?: Json | null
          ai_sentiment?: string | null
          ai_summary?: string | null
          ai_topics?: string[] | null
          client_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          media_urls?: string[] | null
          messages_json?: Json | null
          org_id: string
          started_at?: string | null
          wa_contact_name?: string | null
          wa_phone: string
        }
        Update: {
          agent_id?: string | null
          ai_action_items?: Json | null
          ai_sentiment?: string | null
          ai_summary?: string | null
          ai_topics?: string[] | null
          client_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          media_urls?: string[] | null
          messages_json?: Json | null
          org_id?: string
          started_at?: string | null
          wa_contact_name?: string | null
          wa_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "wa_conversation_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wa_conversation_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      wa_session_metrics: {
        Row: {
          agent_id: string | null
          avg_first_response_min: number | null
          avg_resolution_min: number | null
          conversations_handled: number | null
          date: string
          id: string
          media_items_received: number | null
          messages_received: number | null
          messages_sent: number | null
          org_id: string
          tasks_created: number | null
        }
        Insert: {
          agent_id?: string | null
          avg_first_response_min?: number | null
          avg_resolution_min?: number | null
          conversations_handled?: number | null
          date?: string
          id?: string
          media_items_received?: number | null
          messages_received?: number | null
          messages_sent?: number | null
          org_id: string
          tasks_created?: number | null
        }
        Update: {
          agent_id?: string | null
          avg_first_response_min?: number | null
          avg_resolution_min?: number | null
          conversations_handled?: number | null
          date?: string
          id?: string
          media_items_received?: number | null
          messages_received?: number | null
          messages_sent?: number | null
          org_id?: string
          tasks_created?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wa_session_metrics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      client_timeline: {
        Row: {
          client_id: string | null
          created_at: string | null
          direction: string | null
          event_at: string | null
          id: string | null
          source_type: string | null
          summary: string | null
          ticket_id: string | null
          title: string | null
          trip_id: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          bank_details: string | null
          category: string | null
          cnpj: string | null
          contact_details: string | null
          created_at: string | null
          default_commission_rate: number | null
          email: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          notes: string | null
          org_id: string | null
          phone: string | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          bank_details?: string | null
          category?: string | null
          cnpj?: never
          contact_details?: string | null
          created_at?: string | null
          default_commission_rate?: number | null
          email?: never
          id?: string | null
          is_active?: never
          name?: string | null
          notes?: never
          org_id?: string | null
          phone?: never
          updated_at?: string | null
          whatsapp?: never
        }
        Update: {
          bank_details?: string | null
          category?: string | null
          cnpj?: never
          contact_details?: string | null
          created_at?: string | null
          default_commission_rate?: number | null
          email?: never
          id?: string | null
          is_active?: never
          name?: string | null
          notes?: never
          org_id?: string | null
          phone?: never
          updated_at?: string | null
          whatsapp?: never
        }
        Relationships: [
          {
            foreignKeyName: "financial_suppliers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      assign_org_admin_role: { Args: { _user_id: string }; Returns: undefined }
      calculate_cancellation_fine: {
        Args: { _booking_id: string; _cancellation_date?: string }
        Returns: {
          fine_amount: number
          fine_pct: number
          policy_desc: string
          refund_amount: number
          total_paid: number
        }[]
      }
      check_is_admin: { Args: never; Returns: boolean }
      confirm_public_quotation: {
        Args: {
          p_notes?: string
          p_token: string
          p_traveler_email?: string
          p_traveler_name: string
        }
        Returns: boolean
      }
      ensure_default_kanban_boards: {
        Args: { _org_id: string }
        Returns: undefined
      }
      generate_booking_installments: {
        Args: { _booking_id: string }
        Returns: undefined
      }
      get_auth_user_workspace_ids: { Args: never; Returns: string[] }
      get_dashboard_stats: { Args: { p_org_id: string }; Returns: Json }
      get_group_trip_financial_summary: {
        Args: { _trip_id: string }
        Returns: Json
      }
      get_my_org_id: { Args: never; Returns: string }
      get_public_group_trip: {
        Args: { _slug: string }
        Returns: {
          cover_image_url: string
          currency: string
          current_pax: number
          departure_date: string
          description_md: string
          destination: string
          excludes: string[]
          gallery_urls: string[]
          id: string
          important_notes: string
          includes: string[]
          installments_count: number
          max_pax: number
          num_days: number
          num_nights: number
          org_id: string
          org_logo: string
          org_name: string
          org_primary_color: string
          org_whatsapp: string
          origin_city: string
          price_per_pax: number
          return_date: string
          slug: string
          subtitle: string
          title: string
          transport_type: string
        }[]
      }
      get_public_itinerary_by_token:
        | {
            Args: { p_token: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.get_public_itinerary_by_token(p_token => text), public.get_public_itinerary_by_token(p_token => uuid). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { p_token: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.get_public_itinerary_by_token(p_token => text), public.get_public_itinerary_by_token(p_token => uuid). Try renaming the parameters or the function itself in the database so function overloading can be resolved"[]
          }
      get_public_organization_by_slug: {
        Args: { _slug: string }
        Returns: {
          id: string
          logo_url: string
          name: string
          primary_color: string
          slug: string
          website: string
          whatsapp: string
        }[]
      }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      increment_itinerary_view: {
        Args: { p_token: string }
        Returns: undefined
      }
      is_workspace_admin: { Args: { wid: string }; Returns: boolean }
      is_workspace_member: { Args: { wid: string }; Returns: boolean }
      log_error: {
        Args: {
          p_error_code?: string
          p_function_name?: string
          p_message?: string
          p_module?: string
          p_payload?: Json
          p_user_id?: string
          p_workspace_id?: string
        }
        Returns: string
      }
      match_documents: {
        Args: {
          filter_org_id: string
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      provision_default_kanban_boards: {
        Args: { p_org_id: string }
        Returns: undefined
      }
      secure_store_api_key: {
        Args: {
          p_app_secret?: string
          p_key_value: string
          p_label: string
          p_service: string
          p_workspace_id: string
        }
        Returns: Json
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      submit_traveler_form: {
        Args: {
          _birth_date: string
          _cpf: string
          _email: string
          _emergency_contact_name: string
          _emergency_contact_phone: string
          _full_name: string
          _gender: string
          _loyalty_programs: string
          _meal_preference: string
          _nationality: string
          _passport_expiry: string
          _passport_number: string
          _phone: string
          _rg: string
          _seat_preference: string
          _special_needs: string
          _token: string
        }
        Returns: boolean
      }
      transfer_booking_to_trip: {
        Args: { p_booking_id: string; p_new_trip_id: string; p_reason: string }
        Returns: undefined
      }
    }
    Enums: {
      badge_type: "default" | "green"
      flight_direction: "outbound" | "return"
      gallery_span: "normal" | "tall" | "wide"
      media_type: "photo" | "video"
      place_type: "beach" | "attraction" | "restaurant" | "activity" | "hotel"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      badge_type: ["default", "green"],
      flight_direction: ["outbound", "return"],
      gallery_span: ["normal", "tall", "wide"],
      media_type: ["photo", "video"],
      place_type: ["beach", "attraction", "restaurant", "activity", "hotel"],
    },
  },
} as const
