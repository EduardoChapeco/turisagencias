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
/* ... rest of the massive type file ... */
