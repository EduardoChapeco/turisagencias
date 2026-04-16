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
          id: string
          language: string | null
          latitude: number | null
          longitude: number | null
          name: string
          region: string | null
          slug: string | null
          timezone: string | null
          useful_numbers: Json | null
          voltage: string | null
        }
        Insert: {
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
          id?: string
          language?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          region?: string | null
          slug?: string | null
          timezone?: string | null
          useful_numbers?: Json | null
          voltage?: string | null
        }
        Update: {
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
          id?: string
          language?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          region?: string | null
          slug?: string | null
          timezone?: string | null
          useful_numbers?: Json | null
          voltage?: string | null
        }
        Relationships: []
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
          moeda: string
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
          direction: string | null
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
          direction?: string | null
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
          direction?: string | null
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
      quotations: {
        Row: {
          adults: number | null
          agent_id: string | null
          ai_extracted: boolean | null
          ai_raw_response: Json | null
          check_in: string | null
          check_out: string | null
          children: number | null
          client_id: string | null
          confirmed_at: string | null
          cover_image_url: string | null
          created_at: string
          currency: string
          departure_date: string | null
          destination: string | null
          expires_at: string | null
          hotel_name: string | null
          hotel_photo_url: string | null
          hotel_stars: number | null
          id: string
          installments: Json | null
          meal_plan: string | null
          notes: string | null
          num_adults: number
          num_children: number
          num_nights: number | null
          org_id: string
          pax_adultos: number | null
          pax_criancas: number | null
          pax_infantil: number | null
          pax_seniores: number | null
          public_token: string | null
          return_date: string | null
          room_type: string | null
          status: string
          total_value: number | null
          updated_at: string
          valid_until: string | null
          whatsapp_text: string | null
          source_file_url: string | null
          id_operadora: string | null
          operadora_nome: string | null
          tarifa_base: number | null
          taxas: number | null
          impostos: number | null
          cancelamento_data_limite: string | null
          cancelamento_valor_multa: number | null
          cancelamento_texto_raw: string | null
        }
        Insert: {
          adults?: number | null
          agent_id?: string | null
          ai_extracted?: boolean | null
          ai_raw_response?: Json | null
          check_in?: string | null
          check_out?: string | null
          children?: number | null
          client_id?: string | null
          confirmed_at?: string | null
          cover_image_url?: string | null
          created_at?: string
          currency?: string
          departure_date?: string | null
          destination?: string | null
          expires_at?: string | null
          hotel_name?: string | null
          hotel_photo_url?: string | null
          hotel_stars?: number | null
          id?: string
          installments?: Json | null
          meal_plan?: string | null
          notes?: string | null
          num_adults?: number
          num_children?: number
          num_nights?: number | null
          org_id: string
          pax_adultos?: number | null
          pax_criancas?: number | null
          pax_infantil?: number | null
          pax_seniores?: number | null
          public_token?: string | null
          return_date?: string | null
          room_type?: string | null
          status?: string
          total_value?: number | null
          updated_at?: string
          valid_until?: string | null
          whatsapp_text?: string | null
          source_file_url?: string | null
          id_operadora?: string | null
          operadora_nome?: string | null
          tarifa_base?: number | null
          taxas?: number | null
          impostos?: number | null
          cancelamento_data_limite?: string | null
          cancelamento_valor_multa?: number | null
          cancelamento_texto_raw?: string | null
        }
        Update: {
          adults?: number | null
          agent_id?: string | null
          ai_extracted?: boolean | null
          ai_raw_response?: Json | null
          check_in?: string | null
          check_out?: string | null
          children?: number | null
          client_id?: string | null
          confirmed_at?: string | null
          cover_image_url?: string | null
          created_at?: string
          currency?: string
          departure_date?: string | null
          destination?: string | null
          expires_at?: string | null
          hotel_name?: string | null
          hotel_photo_url?: string | null
          hotel_stars?: number | null
          id?: string
          installments?: Json | null
          meal_plan?: string | null
          notes?: string | null
          num_adults?: number
          num_children?: number
          num_nights?: number | null
          org_id?: string
          pax_adultos?: number | null
          pax_criancas?: number | null
          pax_infantil?: number | null
          pax_seniores?: number | null
          public_token?: string | null
          return_date?: string | null
          room_type?: string | null
          status?: string
          total_value?: number | null
          updated_at?: string
          valid_until?: string | null
          whatsapp_text?: string | null
          source_file_url?: string | null
          id_operadora?: string | null
          operadora_nome?: string | null
          tarifa_base?: number | null
          taxas?: number | null
          impostos?: number | null
          cancelamento_data_limite?: string | null
          cancelamento_valor_multa?: number | null
          cancelamento_texto_raw?: string | null
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
            referencedColumns: [ "id" ]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_org_id: {
        Args: Record<string, never>
        Returns: string
      }
      has_role: {
        Args: {
          _uid: string
          _role: string
        }
        Returns: boolean
      }
    }
    Enums: {
      flight_direction: "outbound" | "return"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
