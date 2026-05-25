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
      public_sites: {
        Row: {
          id: string
          org_id: string
          slug: string
          domain: string | null
          status: string
          is_primary: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          slug: string
          domain?: string | null
          status?: string
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          slug?: string
          domain?: string | null
          status?: string
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_sites_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      builder_projects: {
        Row: {
          id: string
          org_id: string
          site_id: string | null
          project_type: string
          title: string
          current_version_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          site_id?: string | null
          project_type: string
          title: string
          current_version_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          site_id?: string | null
          project_type?: string
          title?: string
          current_version_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "builder_projects_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "builder_projects_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "public_sites"
            referencedColumns: ["id"]
          }
        ]
      }
      builder_versions: {
        Row: {
          id: string
          project_id: string
          version_number: number
          frame_schema: any
          content_schema: any
          design_tokens: any
          render_snapshot: any | null
          status: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          version_number: number
          frame_schema: any
          content_schema: any
          design_tokens: any
          render_snapshot?: any | null
          status?: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          version_number?: number
          frame_schema?: any
          content_schema?: any
          design_tokens?: any
          render_snapshot?: any | null
          status?: string
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "builder_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "builder_projects"
            referencedColumns: ["id"]
          }
        ]
      }
      airline_checkin_registry: {
        Row: {
          id: string
          airline_iata: string
          airline_name: string
          landing_url: string
          deep_link_template: string | null
          required_fields: any
          supports_prefill: boolean
          notes: string | null
          source_url: string | null
          verified_at: string | null
          status: string
        }
        Insert: {
          id?: string
          airline_iata: string
          airline_name: string
          landing_url: string
          deep_link_template?: string | null
          required_fields?: any
          supports_prefill?: boolean
          notes?: string | null
          source_url?: string | null
          verified_at?: string | null
          status?: string
        }
        Update: {
          id?: string
          airline_iata?: string
          airline_name?: string
          landing_url?: string
          deep_link_template?: string | null
          required_fields?: any
          supports_prefill?: boolean
          notes?: string | null
          source_url?: string | null
          verified_at?: string | null
          status?: string
        }
        Relationships: []
      }

      activities: {
        Row: {
          cover_emoji: string | null
          currency: string | null
          description: string | null
          destination_id: string | null
          duration_label: string | null
          id: string
          includes_transfer: boolean | null
          kicker: string | null
          min_age: number | null
          place_id: string | null
          price_per_person: number | null
          title: string | null
        }
        Insert: {
          cover_emoji?: string | null
          currency?: string | null
          description?: string | null
          destination_id?: string | null
          duration_label?: string | null
          id?: string
          includes_transfer?: boolean | null
          kicker?: string | null
          min_age?: number | null
          place_id?: string | null
          price_per_person?: number | null
          title?: string | null
        }
        Update: {
          cover_emoji?: string | null
          currency?: string | null
          description?: string | null
          destination_id?: string | null
          duration_label?: string | null
          id?: string
          includes_transfer?: boolean | null
          kicker?: string | null
          min_age?: number | null
          place_id?: string | null
          price_per_person?: number | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_pills: {
        Row: {
          activity_id: string | null
          icon: string | null
          id: string
          label: string | null
        }
        Insert: {
          activity_id?: string | null
          icon?: string | null
          id?: string
          label?: string | null
        }
        Update: {
          activity_id?: string | null
          icon?: string | null
          id?: string
          label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_pills_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_pins: {
        Row: {
          created_at: string
          hashed_pin: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hashed_pin: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hashed_pin?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_agents: {
        Row: {
          active_tasks: Json
          agent_type: string
          created_at: string
          description: string | null
          error_count: number
          id: string
          last_action_at: string | null
          last_error: string | null
          memory_store: Json
          name: string
          org_id: string
          python_endpoint: string | null
          rules_config: Json
          status: string
          success_rate: number | null
          total_tasks_run: number
          updated_at: string
          version: string
        }
        Insert: {
          active_tasks?: Json
          agent_type: string
          created_at?: string
          description?: string | null
          error_count?: number
          id?: string
          last_action_at?: string | null
          last_error?: string | null
          memory_store?: Json
          name: string
          org_id: string
          python_endpoint?: string | null
          rules_config?: Json
          status?: string
          success_rate?: number | null
          total_tasks_run?: number
          updated_at?: string
          version?: string
        }
        Update: {
          active_tasks?: Json
          agent_type?: string
          created_at?: string
          description?: string | null
          error_count?: number
          id?: string
          last_action_at?: string | null
          last_error?: string | null
          memory_store?: Json
          name?: string
          org_id?: string
          python_endpoint?: string | null
          rules_config?: Json
          status?: string
          success_rate?: number | null
          total_tasks_run?: number
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "ai_agents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "ai_agents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "ai_agents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_decision_logs: {
        Row: {
          action_type: string | null
          agent_name: string
          confidence_score: number | null
          created_at: string
          decision_type: string | null
          id: string
          input_summary: string | null
          metadata: Json | null
          org_id: string | null
          output_summary: string | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action_type?: string | null
          agent_name: string
          confidence_score?: number | null
          created_at?: string
          decision_type?: string | null
          id?: string
          input_summary?: string | null
          metadata?: Json | null
          org_id?: string | null
          output_summary?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action_type?: string | null
          agent_name?: string
          confidence_score?: number | null
          created_at?: string
          decision_type?: string | null
          id?: string
          input_summary?: string | null
          metadata?: Json | null
          org_id?: string | null
          output_summary?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_decision_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "ai_decision_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "ai_decision_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "ai_decision_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_keys_pool: {
        Row: {
          api_key_encrypted: string
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
          api_key_encrypted: string
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
          api_key_encrypted?: string
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
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "ai_keys_pool_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "ai_keys_pool_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
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
          category: string
          content: string
          created_at: string
          created_by: string | null
          embedding: string | null
          id: string
          is_active: boolean | null
          org_id: string
          source: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          created_by?: string | null
          embedding?: string | null
          id?: string
          is_active?: boolean | null
          org_id: string
          source?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          embedding?: string | null
          id?: string
          is_active?: boolean | null
          org_id?: string
          source?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_knowledge_base_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_knowledge_base_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "ai_knowledge_base_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "ai_knowledge_base_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "ai_knowledge_base_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_radar_news: {
        Row: {
          ai_classification_tags: string[] | null
          ai_relevance_score: number | null
          ai_validation_reason: string | null
          content_summary: string | null
          created_at: string
          full_extracted_content: string | null
          id: string
          is_alert: boolean | null
          published_at: string | null
          source: string | null
          title: string
          url: string | null
        }
        Insert: {
          ai_classification_tags?: string[] | null
          ai_relevance_score?: number | null
          ai_validation_reason?: string | null
          content_summary?: string | null
          created_at?: string
          full_extracted_content?: string | null
          id?: string
          is_alert?: boolean | null
          published_at?: string | null
          source?: string | null
          title: string
          url?: string | null
        }
        Update: {
          ai_classification_tags?: string[] | null
          ai_relevance_score?: number | null
          ai_validation_reason?: string | null
          content_summary?: string | null
          created_at?: string
          full_extracted_content?: string | null
          id?: string
          is_alert?: boolean | null
          published_at?: string | null
          source?: string | null
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      ai_tasks: {
        Row: {
          ai_agent_id: string
          approval_prompt: string | null
          approved_at: string | null
          approved_by: string | null
          completed_at: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          error_message: string | null
          execution_log: Json
          id: string
          max_retries: number
          org_id: string
          queued_at: string
          rejected_at: string | null
          rejection_reason: string | null
          requires_approval: boolean
          result: Json | null
          retry_count: number
          started_at: string | null
          status: string
          task_payload: Json
          task_type: string
          triggered_by: string | null
          triggered_source: string | null
          updated_at: string
        }
        Insert: {
          ai_agent_id: string
          approval_prompt?: string | null
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          execution_log?: Json
          id?: string
          max_retries?: number
          org_id: string
          queued_at?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          requires_approval?: boolean
          result?: Json | null
          retry_count?: number
          started_at?: string | null
          status?: string
          task_payload?: Json
          task_type: string
          triggered_by?: string | null
          triggered_source?: string | null
          updated_at?: string
        }
        Update: {
          ai_agent_id?: string
          approval_prompt?: string | null
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          execution_log?: Json
          id?: string
          max_retries?: number
          org_id?: string
          queued_at?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          requires_approval?: boolean
          result?: Json | null
          retry_count?: number
          started_at?: string | null
          status?: string
          task_payload?: Json
          task_type?: string
          triggered_by?: string | null
          triggered_source?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tasks_ai_agent_id_fkey"
            columns: ["ai_agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_tasks_ai_agent_id_fkey"
            columns: ["ai_agent_id"]
            isOneToOne: false
            referencedRelation: "ai_dashboard_summary"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "ai_tasks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "ai_tasks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "ai_tasks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "ai_tasks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      airports: {
        Row: {
          city: string
          country: string
          created_at: string
          iata_code: string
          lat: number | null
          lon: number | null
          name: string
          timezone: string | null
        }
        Insert: {
          city: string
          country: string
          created_at?: string
          iata_code: string
          lat?: number | null
          lon?: number | null
          name: string
          timezone?: string | null
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          iata_code?: string
          lat?: number | null
          lon?: number | null
          name?: string
          timezone?: string | null
        }
        Relationships: []
      }
      automation_executions: {
        Row: {
          event_type: string
          executed_at: string
          id: string
          metadata: Json | null
          org_id: string | null
          target_id: string
        }
        Insert: {
          event_type: string
          executed_at?: string
          id?: string
          metadata?: Json | null
          org_id?: string | null
          target_id: string
        }
        Update: {
          event_type?: string
          executed_at?: string
          id?: string
          metadata?: Json | null
          org_id?: string | null
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_executions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "automation_executions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "automation_executions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "automation_executions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_credentials: {
        Row: {
          api_key: string | null
          client_secret: string | null
          created_at: string | null
          environment: string | null
          id: string
          is_active: boolean | null
          org_id: string
          password_hash: string
          portal_name: string
          token_url: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          api_key?: string | null
          client_secret?: string | null
          created_at?: string | null
          environment?: string | null
          id?: string
          is_active?: boolean | null
          org_id: string
          password_hash: string
          portal_name: string
          token_url?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          api_key?: string | null
          client_secret?: string | null
          created_at?: string | null
          environment?: string | null
          id?: string
          is_active?: boolean | null
          org_id?: string
          password_hash?: string
          portal_name?: string
          token_url?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "b2b_credentials_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "b2b_credentials_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "b2b_credentials_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "b2b_credentials_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_cancellations: {
        Row: {
          booking_id: string
          completed_at: string | null
          created_at: string
          credit_amount: number
          finance_resolution: string | null
          fine_amount: number
          fine_pct: number
          group_trip_id: string
          id: string
          notes_internal: string | null
          org_id: string
          reason_code: string
          reason_notes: string | null
          refund_amount: number
          requested_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          total_paid: number
          updated_at: string
        }
        Insert: {
          booking_id: string
          completed_at?: string | null
          created_at?: string
          credit_amount?: number
          finance_resolution?: string | null
          fine_amount?: number
          fine_pct?: number
          group_trip_id: string
          id?: string
          notes_internal?: string | null
          org_id: string
          reason_code?: string
          reason_notes?: string | null
          refund_amount?: number
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          total_paid?: number
          updated_at?: string
        }
        Update: {
          booking_id?: string
          completed_at?: string | null
          created_at?: string
          credit_amount?: number
          finance_resolution?: string | null
          fine_amount?: number
          fine_pct?: number
          group_trip_id?: string
          id?: string
          notes_internal?: string | null
          org_id?: string
          reason_code?: string
          reason_notes?: string | null
          refund_amount?: number
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
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
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "booking_cancellations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "booking_cancellations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "booking_cancellations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_cancellations_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_credits: {
        Row: {
          amount: number
          booking_id: string | null
          cancellation_id: string | null
          client_email: string | null
          client_name: string | null
          created_at: string
          currency: string
          expires_at: string | null
          id: string
          notes: string | null
          org_id: string
          source: string
          updated_at: string
          used_amount: number
        }
        Insert: {
          amount?: number
          booking_id?: string | null
          cancellation_id?: string | null
          client_email?: string | null
          client_name?: string | null
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          org_id: string
          source?: string
          updated_at?: string
          used_amount?: number
        }
        Update: {
          amount?: number
          booking_id?: string | null
          cancellation_id?: string | null
          client_email?: string | null
          client_name?: string | null
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          org_id?: string
          source?: string
          updated_at?: string
          used_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_credits_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "group_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_credits_cancellation_id_fkey"
            columns: ["cancellation_id"]
            isOneToOne: false
            referencedRelation: "booking_cancellations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_credits_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "booking_credits_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "booking_credits_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "booking_credits_org_id_fkey"
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
          due_date: string
          group_trip_id: string | null
          id: string
          installment_number: number
          notes_finance: string | null
          org_id: string | null
          paid_at: string | null
          payment_method: string | null
          reference: string | null
          status: string
          whatsapp_attempts: number | null
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          due_date: string
          group_trip_id?: string | null
          id?: string
          installment_number: number
          notes_finance?: string | null
          org_id?: string | null
          paid_at?: string | null
          payment_method?: string | null
          reference?: string | null
          status?: string
          whatsapp_attempts?: number | null
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          due_date?: string
          group_trip_id?: string | null
          id?: string
          installment_number?: number
          notes_finance?: string | null
          org_id?: string | null
          paid_at?: string | null
          payment_method?: string | null
          reference?: string | null
          status?: string
          whatsapp_attempts?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_installments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "group_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_installments_group_trip_id_fkey"
            columns: ["group_trip_id"]
            isOneToOne: false
            referencedRelation: "group_trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_installments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "booking_installments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "booking_installments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "booking_installments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_messages: {
        Row: {
          body: string
          booking_id: string
          created_at: string
          id: string
          org_id: string
          read_at: string | null
          sender_id: string | null
          sender_type: string
        }
        Insert: {
          body: string
          booking_id: string
          created_at?: string
          id?: string
          org_id: string
          read_at?: string | null
          sender_id?: string | null
          sender_type?: string
        }
        Update: {
          body?: string
          booking_id?: string
          created_at?: string
          id?: string
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
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "booking_messages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "booking_messages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "booking_messages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          file_size_bytes: number | null
          file_url: string
          id: string
          installment_id: string
          mime_type: string | null
          notes: string | null
          org_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_declared?: number | null
          booking_id: string
          created_at?: string
          file_name?: string | null
          file_size_bytes?: number | null
          file_url: string
          id?: string
          installment_id: string
          mime_type?: string | null
          notes?: string | null
          org_id: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_declared?: number | null
          booking_id?: string
          created_at?: string
          file_name?: string | null
          file_size_bytes?: number | null
          file_url?: string
          id?: string
          installment_id?: string
          mime_type?: string | null
          notes?: string | null
          org_id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
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
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "booking_payment_proofs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "booking_payment_proofs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "booking_payment_proofs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_payment_proofs_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          agent_id: string | null
          boarding_date: string | null
          cancel_reason: string | null
          cancellation_fee: number | null
          cancelled_at: string | null
          client_id: string | null
          contract_pdf_url: string | null
          contract_signed_at: string | null
          created_at: string
          id: string
          installment_config: Json
          org_id: string
          paid_value: number
          passengers: Json | null
          pending_value: number | null
          quotation_id: string | null
          return_date: string | null
          services: Json | null
          status: string
          total_value: number
          trip_id: string | null
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          boarding_date?: string | null
          cancel_reason?: string | null
          cancellation_fee?: number | null
          cancelled_at?: string | null
          client_id?: string | null
          contract_pdf_url?: string | null
          contract_signed_at?: string | null
          created_at?: string
          id?: string
          installment_config?: Json
          org_id: string
          paid_value?: number
          passengers?: Json | null
          pending_value?: number | null
          quotation_id?: string | null
          return_date?: string | null
          services?: Json | null
          status?: string
          total_value?: number
          trip_id?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          boarding_date?: string | null
          cancel_reason?: string | null
          cancellation_fee?: number | null
          cancelled_at?: string | null
          client_id?: string | null
          contract_pdf_url?: string | null
          contract_signed_at?: string | null
          created_at?: string
          id?: string
          installment_config?: Json
          org_id?: string
          paid_value?: number
          passengers?: Json | null
          pending_value?: number | null
          quotation_id?: string | null
          return_date?: string | null
          services?: Json | null
          status?: string
          total_value?: number
          trip_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_timeline"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "bookings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "bookings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "bookings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "client_timeline"
            referencedColumns: ["quotation_id"]
          },
          {
            foreignKeyName: "bookings_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      bus_layouts: {
        Row: {
          cols: number
          created_at: string
          id: string
          name: string
          notes: string | null
          org_id: string
          rows: number
          seat_map: Json
          updated_at: string
          vehicle_type: string
        }
        Insert: {
          cols?: number
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          org_id: string
          rows?: number
          seat_map?: Json
          updated_at?: string
          vehicle_type?: string
        }
        Update: {
          cols?: number
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          org_id?: string
          rows?: number
          seat_map?: Json
          updated_at?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      bus_seat_assignments: {
        Row: {
          booking_id: string | null
          created_at: string
          group_trip_id: string
          id: string
          is_blocked: boolean
          seat_label: string
          traveler_name: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          group_trip_id: string
          id?: string
          is_blocked?: boolean
          seat_label: string
          traveler_name?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          group_trip_id?: string
          id?: string
          is_blocked?: boolean
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
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "chat_sessions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "chat_sessions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "chat_sessions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          checklist_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          is_completed: boolean
          position: number
          title: string
        }
        Insert: {
          checklist_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean
          position?: number
          title: string
        }
        Update: {
          checklist_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists: {
        Row: {
          client_id: string | null
          created_at: string
          created_by: string | null
          group_trip_id: string | null
          id: string
          is_visible_to_client: boolean
          org_id: string
          share_token: string
          title: string
          token_expires_at: string | null
          trip_id: string | null
          type: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          group_trip_id?: string | null
          id?: string
          is_visible_to_client?: boolean
          org_id: string
          share_token?: string
          title: string
          token_expires_at?: string | null
          trip_id?: string | null
          type?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          group_trip_id?: string | null
          id?: string
          is_visible_to_client?: boolean
          org_id?: string
          share_token?: string
          title?: string
          token_expires_at?: string | null
          trip_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklists_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_timeline"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "checklists_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_group_trip_id_fkey"
            columns: ["group_trip_id"]
            isOneToOne: false
            referencedRelation: "group_trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "checklists_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "checklists_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "checklists_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklists_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      client_identities: {
        Row: {
          client_id: string
          created_at: string
          external_id: string | null
          id: string
          identity_type: string
          is_primary: boolean
          label: string | null
          metadata: Json
          normalized_value: string | null
          org_id: string
          provider: string
          raw_value: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          external_id?: string | null
          id?: string
          identity_type?: string
          is_primary?: boolean
          label?: string | null
          metadata?: Json
          normalized_value?: string | null
          org_id: string
          provider: string
          raw_value?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          external_id?: string | null
          id?: string
          identity_type?: string
          is_primary?: boolean
          label?: string | null
          metadata?: Json
          normalized_value?: string | null
          org_id?: string
          provider?: string
          raw_value?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_identities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_timeline"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_identities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_identities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "client_identities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "client_identities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "client_identities_org_id_fkey"
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
          created_at: string
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
          amount?: number
          created_at?: string
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
          created_at?: string
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
            foreignKeyName: "client_travel_credits_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "client_travel_credits_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "client_travel_credits_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
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
          address: string | null
          assigned_agent_id: string | null
          birth_date: string | null
          city: string | null
          country: string | null
          cover_url: string | null
          cpf: string | null
          created_at: string
          created_by: string | null
          documents: Json | null
          email: string | null
          id: string
          is_member: boolean
          loyalty_points: number
          member_tier: string | null
          name: string
          notes: string | null
          org_id: string
          origin: string | null
          passport_expiry: string | null
          passport_number: string | null
          passport_url: string | null
          phone: string | null
          photo_url: string | null
          portal_access_enabled: boolean
          portal_user_id: string | null
          preferences: Json
          state: string | null
          tags: string[] | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          assigned_agent_id?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          cover_url?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          documents?: Json | null
          email?: string | null
          id?: string
          is_member?: boolean
          loyalty_points?: number
          member_tier?: string | null
          name: string
          notes?: string | null
          org_id: string
          origin?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          passport_url?: string | null
          phone?: string | null
          photo_url?: string | null
          portal_access_enabled?: boolean
          portal_user_id?: string | null
          preferences?: Json
          state?: string | null
          tags?: string[] | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          assigned_agent_id?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          cover_url?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          documents?: Json | null
          email?: string | null
          id?: string
          is_member?: boolean
          loyalty_points?: number
          member_tier?: string | null
          name?: string
          notes?: string | null
          org_id?: string
          origin?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          passport_url?: string | null
          phone?: string | null
          photo_url?: string | null
          portal_access_enabled?: boolean
          portal_user_id?: string | null
          preferences?: Json
          state?: string | null
          tags?: string[] | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "clients_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "clients_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "clients_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_rules: {
        Row: {
          created_at: string
          event_type: string
          id: string
          is_active: boolean
          org_id: string
          template_body: string
          template_subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          is_active?: boolean
          org_id: string
          template_body?: string
          template_subject?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          is_active?: boolean
          org_id?: string
          template_body?: string
          template_subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_rules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "communication_rules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "communication_rules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "communication_rules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
            isOneToOne: false
            referencedRelation: "group_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_templates: {
        Row: {
          content_html: string
          created_at: string
          id: string
          name: string
          org_id: string
          updated_at: string
        }
        Insert: {
          content_html?: string
          created_at?: string
          id?: string
          name: string
          org_id: string
          updated_at?: string
        }
        Update: {
          content_html?: string
          created_at?: string
          id?: string
          name?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "contract_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "contract_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "contract_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      corporate_policies: {
        Row: {
          advance_purchase_days: number | null
          allowed_cabins: string[] | null
          created_at: string | null
          id: string
          max_budget_international_hotel: number | null
          max_budget_national_hotel: number | null
          org_id: string
          requires_approval_if_out_of_policy: boolean | null
          updated_at: string | null
        }
        Insert: {
          advance_purchase_days?: number | null
          allowed_cabins?: string[] | null
          created_at?: string | null
          id?: string
          max_budget_international_hotel?: number | null
          max_budget_national_hotel?: number | null
          org_id: string
          requires_approval_if_out_of_policy?: boolean | null
          updated_at?: string | null
        }
        Update: {
          advance_purchase_days?: number | null
          allowed_cabins?: string[] | null
          created_at?: string | null
          id?: string
          max_budget_international_hotel?: number | null
          max_budget_national_hotel?: number | null
          org_id?: string
          requires_approval_if_out_of_policy?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "corporate_policies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "corporate_policies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "corporate_policies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "corporate_policies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      destination_guides: {
        Row: {
          author_id: string | null
          city: string
          climate_info: string | null
          country: string
          cover_image_url: string | null
          created_at: string
          currency_info: string | null
          emergency_numbers: Json | null
          gallery_urls: string[] | null
          id: string
          intro: string | null
          is_published: boolean | null
          itinerary: Json | null
          language_tips: string | null
          org_id: string
          points_of_interest: Json | null
          public_views: number | null
          quick_facts: Json | null
          sections: Json | null
          slug: string | null
          slug_locked: boolean
          slug_updated_at: string | null
          tips: Json | null
          transportation: string | null
          updated_at: string
          useful_contacts: Json | null
          video_url: string | null
        }
        Insert: {
          author_id?: string | null
          city: string
          climate_info?: string | null
          country: string
          cover_image_url?: string | null
          created_at?: string
          currency_info?: string | null
          emergency_numbers?: Json | null
          gallery_urls?: string[] | null
          id?: string
          intro?: string | null
          is_published?: boolean | null
          itinerary?: Json | null
          language_tips?: string | null
          org_id: string
          points_of_interest?: Json | null
          public_views?: number | null
          quick_facts?: Json | null
          sections?: Json | null
          slug?: string | null
          slug_locked?: boolean
          slug_updated_at?: string | null
          tips?: Json | null
          transportation?: string | null
          updated_at?: string
          useful_contacts?: Json | null
          video_url?: string | null
        }
        Update: {
          author_id?: string | null
          city?: string
          climate_info?: string | null
          country?: string
          cover_image_url?: string | null
          created_at?: string
          currency_info?: string | null
          emergency_numbers?: Json | null
          gallery_urls?: string[] | null
          id?: string
          intro?: string | null
          is_published?: boolean | null
          itinerary?: Json | null
          language_tips?: string | null
          org_id?: string
          points_of_interest?: Json | null
          public_views?: number | null
          quick_facts?: Json | null
          sections?: Json | null
          slug?: string | null
          slug_locked?: boolean
          slug_updated_at?: string | null
          tips?: Json | null
          transportation?: string | null
          updated_at?: string
          useful_contacts?: Json | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "destination_guides_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "destination_guides_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "destination_guides_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "destination_guides_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
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
          avoid_season: string | null
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
          gateway_rules: Json | null
          iata_gateway: string | null
          id: string
          is_active: boolean
          language: string | null
          latitude: number | null
          longitude: number | null
          name: string
          region: string | null
          slug: string | null
          timezone: string | null
          transfer_time_hours: number | null
          useful_numbers: Json | null
          voltage: string | null
        }
        Insert: {
          avoid_season?: string | null
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
          gateway_rules?: Json | null
          iata_gateway?: string | null
          id?: string
          is_active?: boolean
          language?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          region?: string | null
          slug?: string | null
          timezone?: string | null
          transfer_time_hours?: number | null
          useful_numbers?: Json | null
          voltage?: string | null
        }
        Update: {
          avoid_season?: string | null
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
          gateway_rules?: Json | null
          iata_gateway?: string | null
          id?: string
          is_active?: boolean
          language?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          region?: string | null
          slug?: string | null
          timezone?: string | null
          transfer_time_hours?: number | null
          useful_numbers?: Json | null
          voltage?: string | null
        }
        Relationships: []
      }
      email_inbound: {
        Row: {
          ai_classification: string | null
          ai_summary: string | null
          body: string | null
          created_at: string
          from_email: string | null
          from_name: string | null
          id: string
          metadata: Json
          org_id: string
          received_at: string
          status: string
          subject: string | null
        }
        Insert: {
          ai_classification?: string | null
          ai_summary?: string | null
          body?: string | null
          created_at?: string
          from_email?: string | null
          from_name?: string | null
          id?: string
          metadata?: Json
          org_id: string
          received_at?: string
          status?: string
          subject?: string | null
        }
        Update: {
          ai_classification?: string | null
          ai_summary?: string | null
          body?: string | null
          created_at?: string
          from_email?: string | null
          from_name?: string | null
          id?: string
          metadata?: Json
          org_id?: string
          received_at?: string
          status?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_inbound_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "email_inbound_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "email_inbound_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
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
          ai_draft_response: string | null
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
          group_trip_id: string | null
          id: string
          org_id: string
          received_at: string
          subject: string | null
          thread_id: string | null
          ticket_id: string | null
          to_emails: string[] | null
          trip_id: string | null
        }
        Insert: {
          ai_draft_response?: string | null
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
          group_trip_id?: string | null
          id?: string
          org_id: string
          received_at?: string
          subject?: string | null
          thread_id?: string | null
          ticket_id?: string | null
          to_emails?: string[] | null
          trip_id?: string | null
        }
        Update: {
          ai_draft_response?: string | null
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
          group_trip_id?: string | null
          id?: string
          org_id?: string
          received_at?: string
          subject?: string | null
          thread_id?: string | null
          ticket_id?: string | null
          to_emails?: string[] | null
          trip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_messages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_timeline"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "email_messages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_messages_group_trip_id_fkey"
            columns: ["group_trip_id"]
            isOneToOne: false
            referencedRelation: "group_trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_messages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "email_messages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "email_messages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
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
      email_tracking_logs: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          last_ip: string | null
          last_user_agent: string | null
          open_count: number | null
          opened_at: string | null
          org_id: string | null
          recipient_email: string | null
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          last_ip?: string | null
          last_user_agent?: string | null
          open_count?: number | null
          opened_at?: string | null
          org_id?: string | null
          recipient_email?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          last_ip?: string | null
          last_user_agent?: string | null
          open_count?: number | null
          opened_at?: string | null
          org_id?: string | null
          recipient_email?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_tracking_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "email_tracking_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "email_tracking_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "email_tracking_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "experiences_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "experiences_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "experiences_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      external_entities: {
        Row: {
          client_id: string | null
          created_at: string
          entity_type: string
          external_id: string | null
          external_key: string
          group_trip_id: string | null
          id: string
          last_seen_at: string
          metadata: Json
          occurred_at: string | null
          org_id: string
          payload: Json
          provider: string
          status: string
          title: string | null
          trip_id: string | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          entity_type?: string
          external_id?: string | null
          external_key: string
          group_trip_id?: string | null
          id?: string
          last_seen_at?: string
          metadata?: Json
          occurred_at?: string | null
          org_id: string
          payload?: Json
          provider: string
          status?: string
          title?: string | null
          trip_id?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          entity_type?: string
          external_id?: string | null
          external_key?: string
          group_trip_id?: string | null
          id?: string
          last_seen_at?: string
          metadata?: Json
          occurred_at?: string | null
          org_id?: string
          payload?: Json
          provider?: string
          status?: string
          title?: string | null
          trip_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_entities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_timeline"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "external_entities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_entities_group_trip_id_fkey"
            columns: ["group_trip_id"]
            isOneToOne: false
            referencedRelation: "group_trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_entities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "external_entities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "external_entities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "external_entities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_entities_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_suppliers: {
        Row: {
          category: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          notes: string | null
          org_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          org_id: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_suppliers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "financial_suppliers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "financial_suppliers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
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
          attachment_url: string | null
          category: string | null
          client_id: string | null
          created_at: string
          currency: string
          description: string | null
          due_date: string | null
          group_trip_id: string | null
          id: string
          is_reconciled: boolean | null
          notes_internal: string | null
          org_id: string
          paid_at: string | null
          payment_method: string | null
          reference_number: string | null
          status: string
          supplier_id: string | null
          trip_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          amount?: number
          attachment_url?: string | null
          category?: string | null
          client_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          due_date?: string | null
          group_trip_id?: string | null
          id?: string
          is_reconciled?: boolean | null
          notes_internal?: string | null
          org_id: string
          paid_at?: string | null
          payment_method?: string | null
          reference_number?: string | null
          status?: string
          supplier_id?: string | null
          trip_id?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          attachment_url?: string | null
          category?: string | null
          client_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          due_date?: string | null
          group_trip_id?: string | null
          id?: string
          is_reconciled?: boolean | null
          notes_internal?: string | null
          org_id?: string
          paid_at?: string | null
          payment_method?: string | null
          reference_number?: string | null
          status?: string
          supplier_id?: string | null
          trip_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_timeline"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "financial_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_group_trip_id_fkey"
            columns: ["group_trip_id"]
            isOneToOne: false
            referencedRelation: "group_trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "financial_transactions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "financial_transactions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
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
            referencedRelation: "client_timeline"
            referencedColumns: ["quotation_id"]
          },
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
          client_id: string | null
          created_at: string
          group_trip_id: string
          id: string
          internal_notes: string | null
          lead_cpf: string | null
          lead_email: string | null
          lead_name: string
          lead_phone: string | null
          org_id: string
          pax_count: number
          public_token: string
          seat_numbers: string[] | null
          status: string
          token_expires_at: string | null
          total_amount: number
          updated_at: string
          voucher_code: string | null
          voucher_url: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          group_trip_id: string
          id?: string
          internal_notes?: string | null
          lead_cpf?: string | null
          lead_email?: string | null
          lead_name: string
          lead_phone?: string | null
          org_id: string
          pax_count?: number
          public_token?: string
          seat_numbers?: string[] | null
          status?: string
          token_expires_at?: string | null
          total_amount?: number
          updated_at?: string
          voucher_code?: string | null
          voucher_url?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          group_trip_id?: string
          id?: string
          internal_notes?: string | null
          lead_cpf?: string | null
          lead_email?: string | null
          lead_name?: string
          lead_phone?: string | null
          org_id?: string
          pax_count?: number
          public_token?: string
          seat_numbers?: string[] | null
          status?: string
          token_expires_at?: string | null
          total_amount?: number
          updated_at?: string
          voucher_code?: string | null
          voucher_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_timeline"
            referencedColumns: ["client_id"]
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
          notes: string | null
          org_id: string
          paid_at: string | null
          planned_date: string | null
          reference_booking_id: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description: string
          group_trip_id: string
          id?: string
          notes?: string | null
          org_id: string
          paid_at?: string | null
          planned_date?: string | null
          reference_booking_id?: string | null
          status?: string
          type?: string
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
          notes?: string | null
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
            foreignKeyName: "group_trip_ledger_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "group_trip_ledger_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "group_trip_ledger_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
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
          bus_layout_id: string | null
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
          markup_pct: number | null
          max_pax: number
          num_days: number | null
          num_nights: number | null
          org_id: string
          org_logo: string | null
          org_name: string | null
          origin_city: string | null
          payment_due_offset_days: number
          price_per_pax: number
          return_date: string | null
          seat_map_visible_to_client: boolean | null
          slug: string | null
          slug_locked: boolean
          slug_updated_at: string | null
          status: string
          subtitle: string | null
          tax_pct: number | null
          title: string
          transport_type: string | null
          updated_at: string
          view_count: number
        }
        Insert: {
          booking_count?: number
          bus_layout_id?: string | null
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
          markup_pct?: number | null
          max_pax?: number
          num_days?: number | null
          num_nights?: number | null
          org_id: string
          org_logo?: string | null
          org_name?: string | null
          origin_city?: string | null
          payment_due_offset_days?: number
          price_per_pax?: number
          return_date?: string | null
          seat_map_visible_to_client?: boolean | null
          slug?: string | null
          slug_locked?: boolean
          slug_updated_at?: string | null
          status?: string
          subtitle?: string | null
          tax_pct?: number | null
          title?: string
          transport_type?: string | null
          updated_at?: string
          view_count?: number
        }
        Update: {
          booking_count?: number
          bus_layout_id?: string | null
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
          markup_pct?: number | null
          max_pax?: number
          num_days?: number | null
          num_nights?: number | null
          org_id?: string
          org_logo?: string | null
          org_name?: string | null
          origin_city?: string | null
          payment_due_offset_days?: number
          price_per_pax?: number
          return_date?: string | null
          seat_map_visible_to_client?: boolean | null
          slug?: string | null
          slug_locked?: boolean
          slug_updated_at?: string | null
          status?: string
          subtitle?: string | null
          tax_pct?: number | null
          title?: string
          transport_type?: string | null
          updated_at?: string
          view_count?: number
        }
        Relationships: [
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
      guide_pages: {
        Row: {
          created_at: string | null
          destination_id: string | null
          id: string
          is_public: boolean | null
          org_id: string | null
          public_token: string | null
          read_time_minutes: number | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          destination_id?: string | null
          id?: string
          is_public?: boolean | null
          org_id?: string | null
          public_token?: string | null
          read_time_minutes?: number | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          destination_id?: string | null
          id?: string
          is_public?: boolean | null
          org_id?: string | null
          public_token?: string | null
          read_time_minutes?: number | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guide_pages_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guide_pages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "guide_pages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "guide_pages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "guide_pages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_reviews: {
        Row: {
          author_name: string
          comment: string | null
          created_at: string | null
          hotel_id: string
          id: string
          org_id: string
          photo_url: string | null
          rating: number
          travel_date: string | null
        }
        Insert: {
          author_name: string
          comment?: string | null
          created_at?: string | null
          hotel_id: string
          id?: string
          org_id: string
          photo_url?: string | null
          rating: number
          travel_date?: string | null
        }
        Update: {
          author_name?: string
          comment?: string | null
          created_at?: string | null
          hotel_id?: string
          id?: string
          org_id?: string
          photo_url?: string | null
          rating?: number
          travel_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotel_reviews_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels_bank"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotel_reviews_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "hotel_reviews_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "hotel_reviews_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "hotel_reviews_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      hotels_bank: {
        Row: {
          amenities: string[] | null
          category: number | null
          city: string
          country: string
          cover_image_url: string | null
          cover_photo_url: string | null
          created_at: string
          description: string | null
          email: string | null
          gallery_urls: string[] | null
          highlights: string[]
          id: string
          internal_rating: number | null
          is_active: boolean
          latitude: number | null
          longitude: number | null
          name: string
          org_id: string
          phone: string | null
          photos: string[]
          regime_options: string[]
          sections: Json | null
          state: string | null
          tags: string[]
          updated_at: string
          video_url: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          amenities?: string[] | null
          category?: number | null
          city: string
          country?: string
          cover_image_url?: string | null
          cover_photo_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          gallery_urls?: string[] | null
          highlights?: string[]
          id?: string
          internal_rating?: number | null
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          org_id: string
          phone?: string | null
          photos?: string[]
          regime_options?: string[]
          sections?: Json | null
          state?: string | null
          tags?: string[]
          updated_at?: string
          video_url?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          amenities?: string[] | null
          category?: number | null
          city?: string
          country?: string
          cover_image_url?: string | null
          cover_photo_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          gallery_urls?: string[] | null
          highlights?: string[]
          id?: string
          internal_rating?: number | null
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          org_id?: string
          phone?: string | null
          photos?: string[]
          regime_options?: string[]
          sections?: Json | null
          state?: string | null
          tags?: string[]
          updated_at?: string
          video_url?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotels_bank_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "hotels_bank_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "hotels_bank_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
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
          created_at: string
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
          is_group_itinerary: boolean
          is_public: boolean
          lead_count: number | null
          max_pax: number | null
          num_days: number | null
          org_id: string
          origin: string | null
          pdf_requires_lead: boolean | null
          pdf_url: string | null
          public_token: string
          quotation_id: string | null
          return_date: string | null
          share_count: number | null
          status: string
          subtitle: string | null
          title: string
          token_expires_at: string | null
          updated_at: string
          view_count: number | null
        }
        Insert: {
          ai_generated?: boolean | null
          ai_prompt_used?: string | null
          cover_emoji?: string | null
          cover_image_url?: string | null
          created_at?: string
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
          is_group_itinerary?: boolean
          is_public?: boolean
          lead_count?: number | null
          max_pax?: number | null
          num_days?: number | null
          org_id: string
          origin?: string | null
          pdf_requires_lead?: boolean | null
          pdf_url?: string | null
          public_token?: string
          quotation_id?: string | null
          return_date?: string | null
          share_count?: number | null
          status?: string
          subtitle?: string | null
          title?: string
          token_expires_at?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          ai_generated?: boolean | null
          ai_prompt_used?: string | null
          cover_emoji?: string | null
          cover_image_url?: string | null
          created_at?: string
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
          is_group_itinerary?: boolean
          is_public?: boolean
          lead_count?: number | null
          max_pax?: number | null
          num_days?: number | null
          org_id?: string
          origin?: string | null
          pdf_requires_lead?: boolean | null
          pdf_url?: string | null
          public_token?: string
          quotation_id?: string | null
          return_date?: string | null
          share_count?: number | null
          status?: string
          subtitle?: string | null
          title?: string
          token_expires_at?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "itineraries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "itineraries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "itineraries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
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
            referencedRelation: "client_timeline"
            referencedColumns: ["quotation_id"]
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
            referencedRelation: "client_timeline"
            referencedColumns: ["quotation_id"]
          },
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
      itinerary_leads: {
        Row: {
          action: string
          created_at: string
          email: string | null
          id: string
          itinerary_id: string
          metadata: Json
          name: string
          org_id: string
          utm_source: string | null
          whatsapp: string
        }
        Insert: {
          action?: string
          created_at?: string
          email?: string | null
          id?: string
          itinerary_id: string
          metadata?: Json
          name: string
          org_id: string
          utm_source?: string | null
          whatsapp: string
        }
        Update: {
          action?: string
          created_at?: string
          email?: string | null
          id?: string
          itinerary_id?: string
          metadata?: Json
          name?: string
          org_id?: string
          utm_source?: string | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_leads_itinerary_id_fkey"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "itineraries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_leads_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "itinerary_leads_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "itinerary_leads_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "itinerary_leads_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          created_at: string
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
          created_at?: string
          day_number?: number
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
          position?: number
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
          created_at?: string
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
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "kanban_boards_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "kanban_boards_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "kanban_boards_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      kanban_card_tags: {
        Row: {
          card_id: string
          tag_id: string
        }
        Insert: {
          card_id: string
          tag_id: string
        }
        Update: {
          card_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kanban_card_tags_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "kanban_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_card_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "kanban_tags"
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
          group_trip_id: string | null
          id: string
          linked_card_ids: string[] | null
          meta: Json
          metadata: Json | null
          org_id: string
          position: number
          priority: string
          quotation_id: string | null
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
          group_trip_id?: string | null
          id?: string
          linked_card_ids?: string[] | null
          meta?: Json
          metadata?: Json | null
          org_id: string
          position?: number
          priority?: string
          quotation_id?: string | null
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
          group_trip_id?: string | null
          id?: string
          linked_card_ids?: string[] | null
          meta?: Json
          metadata?: Json | null
          org_id?: string
          position?: number
          priority?: string
          quotation_id?: string | null
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
            referencedRelation: "client_timeline"
            referencedColumns: ["client_id"]
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
            foreignKeyName: "kanban_cards_group_trip_id_fkey"
            columns: ["group_trip_id"]
            isOneToOne: false
            referencedRelation: "group_trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_cards_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "kanban_cards_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "kanban_cards_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
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
            referencedRelation: "client_timeline"
            referencedColumns: ["quotation_id"]
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
          token_expires_at: string | null
        }
        Insert: {
          card_id: string
          created_at?: string
          id?: string
          org_id: string
          title?: string
          token_expires_at?: string | null
        }
        Update: {
          card_id?: string
          created_at?: string
          id?: string
          org_id?: string
          title?: string
          token_expires_at?: string | null
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
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "kanban_checklists_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "kanban_checklists_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
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
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "kanban_columns_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "kanban_columns_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
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
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "kanban_notes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "kanban_notes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
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
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "kanban_tags_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "kanban_tags_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "kanban_tags_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      map_distances: {
        Row: {
          destination_id: string | null
          distance_label: string | null
          from_label: string | null
          icon: string | null
          id: string
          order_position: number | null
          to_label: string | null
        }
        Insert: {
          destination_id?: string | null
          distance_label?: string | null
          from_label?: string | null
          icon?: string | null
          id?: string
          order_position?: number | null
          to_label?: string | null
        }
        Update: {
          destination_id?: string | null
          distance_label?: string | null
          from_label?: string | null
          icon?: string | null
          id?: string
          order_position?: number | null
          to_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "map_distances_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      map_points: {
        Row: {
          color: string | null
          destination_id: string | null
          id: string
          label: string | null
          latitude: number | null
          longitude: number | null
          type: Database["public"]["Enums"]["place_type"] | null
        }
        Insert: {
          color?: string | null
          destination_id?: string | null
          id?: string
          label?: string | null
          latitude?: number | null
          longitude?: number | null
          type?: Database["public"]["Enums"]["place_type"] | null
        }
        Update: {
          color?: string | null
          destination_id?: string | null
          id?: string
          label?: string | null
          latitude?: number | null
          longitude?: number | null
          type?: Database["public"]["Enums"]["place_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "map_points_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          bucket: string
          created_at: string
          field_name: string | null
          height: number | null
          id: string
          migration_error: string | null
          migration_status: string
          mime_type: string | null
          org_id: string
          owner_id: string | null
          owner_type: string | null
          path: string | null
          public_url: string
          size_bytes: number | null
          source_url: string | null
          updated_at: string
          visibility: string
          width: number | null
        }
        Insert: {
          bucket?: string
          created_at?: string
          field_name?: string | null
          height?: number | null
          id?: string
          migration_error?: string | null
          migration_status?: string
          mime_type?: string | null
          org_id: string
          owner_id?: string | null
          owner_type?: string | null
          path?: string | null
          public_url: string
          size_bytes?: number | null
          source_url?: string | null
          updated_at?: string
          visibility?: string
          width?: number | null
        }
        Update: {
          bucket?: string
          created_at?: string
          field_name?: string | null
          height?: number | null
          id?: string
          migration_error?: string | null
          migration_status?: string
          mime_type?: string | null
          org_id?: string
          owner_id?: string | null
          owner_type?: string | null
          path?: string | null
          public_url?: string
          size_bytes?: number | null
          source_url?: string | null
          updated_at?: string
          visibility?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "media_assets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "media_assets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "media_assets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      media_items: {
        Row: {
          cover_color: string | null
          cover_emoji: string | null
          description: string | null
          destination_id: string | null
          duration_label: string | null
          id: string
          is_featured: boolean | null
          order_position: number | null
          span_type: Database["public"]["Enums"]["gallery_span"] | null
          thumbnail_url: string | null
          title: string | null
          type: Database["public"]["Enums"]["media_type"] | null
          url: string | null
        }
        Insert: {
          cover_color?: string | null
          cover_emoji?: string | null
          description?: string | null
          destination_id?: string | null
          duration_label?: string | null
          id?: string
          is_featured?: boolean | null
          order_position?: number | null
          span_type?: Database["public"]["Enums"]["gallery_span"] | null
          thumbnail_url?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["media_type"] | null
          url?: string | null
        }
        Update: {
          cover_color?: string | null
          cover_emoji?: string | null
          description?: string | null
          destination_id?: string | null
          duration_label?: string | null
          id?: string
          is_featured?: boolean | null
          order_position?: number | null
          span_type?: Database["public"]["Enums"]["gallery_span"] | null
          thumbnail_url?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["media_type"] | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_items_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_contexts: {
        Row: {
          client_name: string | null
          client_phone: string | null
          client_phone_key: string
          created_at: string
          data: Json
          detected_intents: Json
          id: string
          keyword_history: Json
          last_intent: Json | null
          last_seen: string | null
          notes: Json
          org_id: string
          pending_quotation: Json | null
          recent_trips: Json
          updated_at: string
        }
        Insert: {
          client_name?: string | null
          client_phone?: string | null
          client_phone_key: string
          created_at?: string
          data?: Json
          detected_intents?: Json
          id: string
          keyword_history?: Json
          last_intent?: Json | null
          last_seen?: string | null
          notes?: Json
          org_id: string
          pending_quotation?: Json | null
          recent_trips?: Json
          updated_at?: string
        }
        Update: {
          client_name?: string | null
          client_phone?: string | null
          client_phone_key?: string
          created_at?: string
          data?: Json
          detected_intents?: Json
          id?: string
          keyword_history?: Json
          last_intent?: Json | null
          last_seen?: string | null
          notes?: Json
          org_id?: string
          pending_quotation?: Json | null
          recent_trips?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_contexts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "memory_contexts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "memory_contexts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "memory_contexts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "notifications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "notifications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "notifications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      operator_snapshots: {
        Row: {
          captured_at: string
          client_id: string | null
          created_at: string
          external_entity_id: string | null
          fingerprint: string
          group_trip_id: string | null
          id: string
          ingested_by_profile_id: string | null
          ingested_by_user_id: string | null
          locator: string | null
          org_id: string
          page_title: string | null
          page_url: string | null
          payload: Json
          provider: string
          snapshot_type: string
          trip_id: string | null
          updated_at: string
          wa_session_id: string | null
        }
        Insert: {
          captured_at?: string
          client_id?: string | null
          created_at?: string
          external_entity_id?: string | null
          fingerprint: string
          group_trip_id?: string | null
          id?: string
          ingested_by_profile_id?: string | null
          ingested_by_user_id?: string | null
          locator?: string | null
          org_id: string
          page_title?: string | null
          page_url?: string | null
          payload?: Json
          provider: string
          snapshot_type?: string
          trip_id?: string | null
          updated_at?: string
          wa_session_id?: string | null
        }
        Update: {
          captured_at?: string
          client_id?: string | null
          created_at?: string
          external_entity_id?: string | null
          fingerprint?: string
          group_trip_id?: string | null
          id?: string
          ingested_by_profile_id?: string | null
          ingested_by_user_id?: string | null
          locator?: string | null
          org_id?: string
          page_title?: string | null
          page_url?: string | null
          payload?: Json
          provider?: string
          snapshot_type?: string
          trip_id?: string | null
          updated_at?: string
          wa_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operator_snapshots_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_timeline"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "operator_snapshots_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operator_snapshots_external_entity_id_fkey"
            columns: ["external_entity_id"]
            isOneToOne: false
            referencedRelation: "external_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operator_snapshots_group_trip_id_fkey"
            columns: ["group_trip_id"]
            isOneToOne: false
            referencedRelation: "group_trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operator_snapshots_ingested_by_profile_id_fkey"
            columns: ["ingested_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operator_snapshots_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "operator_snapshots_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "operator_snapshots_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "operator_snapshots_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operator_snapshots_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operator_snapshots_wa_session_id_fkey"
            columns: ["wa_session_id"]
            isOneToOne: false
            referencedRelation: "wa_session_metrics"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: Json | null
          ai_credits: number
          ai_credits_reset_at: string | null
          ai_keys_config: Json | null
          anac_registration: string | null
          brand_kit: Json | null
          created_at: string
          email: string | null
          font_style: string | null
          google_business_id: string | null
          google_business_url: string | null
          handle: string | null
          iata_code: string | null
          id: string
          instagram_url: string | null
          is_active: boolean
          logo_url: string | null
          name: string
          parent_org_id: string | null
          phone: string | null
          pix_key: string | null
          plan: string | null
          plan_expires_at: string | null
          primary_color: string | null
          secondary_color: string | null
          settings: Json | null
          slug: string
          updated_at: string
          website_url: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: Json | null
          ai_credits?: number
          ai_credits_reset_at?: string | null
          ai_keys_config?: Json | null
          anac_registration?: string | null
          brand_kit?: Json | null
          created_at?: string
          email?: string | null
          font_style?: string | null
          google_business_id?: string | null
          google_business_url?: string | null
          handle?: string | null
          iata_code?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean
          logo_url?: string | null
          name: string
          parent_org_id?: string | null
          phone?: string | null
          pix_key?: string | null
          plan?: string | null
          plan_expires_at?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          settings?: Json | null
          slug: string
          updated_at?: string
          website_url?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: Json | null
          ai_credits?: number
          ai_credits_reset_at?: string | null
          ai_keys_config?: Json | null
          anac_registration?: string | null
          brand_kit?: Json | null
          created_at?: string
          email?: string | null
          font_style?: string | null
          google_business_id?: string | null
          google_business_url?: string | null
          handle?: string | null
          iata_code?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean
          logo_url?: string | null
          name?: string
          parent_org_id?: string | null
          phone?: string | null
          pix_key?: string | null
          plan?: string | null
          plan_expires_at?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          settings?: Json | null
          slug?: string
          updated_at?: string
          website_url?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["parent_org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["parent_org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["parent_org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["parent_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          client_id: string | null
          created_at: string
          description: string | null
          due_date: string
          gateway_id: string | null
          gateway_name: string | null
          gateway_response: Json | null
          id: string
          installment_number: number
          interest_amount: number
          interest_rate: number
          method: string | null
          notes: string | null
          org_id: string
          paid_at: string | null
          payment_link_url: string | null
          proof_url: string | null
          proof_verified_at: string | null
          proof_verified_by: string | null
          status: string
          total_amount: number | null
          total_installments: number
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          client_id?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          gateway_id?: string | null
          gateway_name?: string | null
          gateway_response?: Json | null
          id?: string
          installment_number?: number
          interest_amount?: number
          interest_rate?: number
          method?: string | null
          notes?: string | null
          org_id: string
          paid_at?: string | null
          payment_link_url?: string | null
          proof_url?: string | null
          proof_verified_at?: string | null
          proof_verified_by?: string | null
          status?: string
          total_amount?: number | null
          total_installments?: number
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          client_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          gateway_id?: string | null
          gateway_name?: string | null
          gateway_response?: Json | null
          id?: string
          installment_number?: number
          interest_amount?: number
          interest_rate?: number
          method?: string | null
          notes?: string | null
          org_id?: string
          paid_at?: string | null
          payment_link_url?: string | null
          proof_url?: string | null
          proof_verified_at?: string | null
          proof_verified_by?: string | null
          status?: string
          total_amount?: number | null
          total_installments?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_timeline"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "payments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "payments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "payments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          badge_label: string | null
          badge_type: Database["public"]["Enums"]["badge_type"] | null
          category_label: string | null
          cover_emoji: string | null
          cover_gradient: string | null
          description: string | null
          destination_id: string | null
          id: string
          is_featured: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          price_label: string | null
          rating: number | null
          type: Database["public"]["Enums"]["place_type"] | null
        }
        Insert: {
          badge_label?: string | null
          badge_type?: Database["public"]["Enums"]["badge_type"] | null
          category_label?: string | null
          cover_emoji?: string | null
          cover_gradient?: string | null
          description?: string | null
          destination_id?: string | null
          id?: string
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          price_label?: string | null
          rating?: number | null
          type?: Database["public"]["Enums"]["place_type"] | null
        }
        Update: {
          badge_label?: string | null
          badge_type?: Database["public"]["Enums"]["badge_type"] | null
          category_label?: string | null
          cover_emoji?: string | null
          cover_gradient?: string | null
          description?: string | null
          destination_id?: string | null
          id?: string
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          price_label?: string | null
          rating?: number | null
          type?: Database["public"]["Enums"]["place_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "places_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "policy_cache_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "policy_cache_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
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
          created_at: string
          error_message: string | null
          id: string
          metadata: Json
          org_id: string
          original_url: string
          provider: string | null
          result_url: string | null
          status: string
          style: string
          trip_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json
          org_id: string
          original_url: string
          provider?: string | null
          result_url?: string | null
          status?: string
          style: string
          trip_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json
          org_id?: string
          original_url?: string
          provider?: string | null
          result_url?: string | null
          status?: string
          style?: string
          trip_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_ai_photos_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "portal_ai_photos_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "portal_ai_photos_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "portal_ai_photos_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_ai_photos_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "group_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      proactive_alerts: {
        Row: {
          client_id: string | null
          created_at: string
          data: Json
          done: boolean
          group_trip_id: string | null
          id: string
          message: string | null
          org_id: string
          priority: string
          title: string | null
          trip: Json
          type: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          data?: Json
          done?: boolean
          group_trip_id?: string | null
          id: string
          message?: string | null
          org_id: string
          priority?: string
          title?: string | null
          trip?: Json
          type?: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          data?: Json
          done?: boolean
          group_trip_id?: string | null
          id?: string
          message?: string | null
          org_id?: string
          priority?: string
          title?: string | null
          trip?: Json
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proactive_alerts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_timeline"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "proactive_alerts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proactive_alerts_group_trip_id_fkey"
            columns: ["group_trip_id"]
            isOneToOne: false
            referencedRelation: "group_trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proactive_alerts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "proactive_alerts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "proactive_alerts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "proactive_alerts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          last_seen_at: string | null
          notification_prefs: Json
          org_id: string | null
          phone: string | null
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          last_seen_at?: string | null
          notification_prefs?: Json
          org_id?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          last_seen_at?: string | null
          notification_prefs?: Json
          org_id?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
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
          created_at: string
          id: string
          is_selected: boolean | null
          metadata: Json | null
          org_id: string
          price_delta: number | null
          quotation_id: string
          rationale: string | null
          scenario_label: string
          score: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_selected?: boolean | null
          metadata?: Json | null
          org_id: string
          price_delta?: number | null
          quotation_id: string
          rationale?: string | null
          scenario_label?: string
          score?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_selected?: boolean | null
          metadata?: Json | null
          org_id?: string
          price_delta?: number | null
          quotation_id?: string
          rationale?: string | null
          scenario_label?: string
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotation_scenarios_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "quotation_scenarios_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "quotation_scenarios_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "quotation_scenarios_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_scenarios_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "client_timeline"
            referencedColumns: ["quotation_id"]
          },
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
          accommodations: Json | null
          adults: number | null
          agent_id: string | null
          agent_photo_url: string | null
          ai_extracted: boolean | null
          ai_raw_response: Json | null
          cancelamento_data_limite: string | null
          cancelamento_texto_raw: string | null
          cancelamento_valor_multa: number | null
          check_in: string | null
          check_out: string | null
          children: number | null
          client_id: string | null
          co2_emission_kg: number | null
          code: string | null
          confirmed_at: string | null
          cost_center_id: string | null
          cover_image_url: string | null
          cover_subtitle: string | null
          cover_title: string | null
          created_at: string
          currency: string | null
          departure_date: string | null
          destination: string | null
          excluded_items: string[] | null
          excursions: Json | null
          expires_at: string | null
          fees_value: number | null
          group_trip_id: string | null
          hotel_id: string | null
          hotel_name: string | null
          hotel_photo_url: string | null
          hotel_stars: number | null
          id: string
          id_operadora: string | null
          impostos: number | null
          included_items: string[] | null
          installments: Json | null
          itinerary: Json | null
          last_viewed_at: string | null
          layout_mode: string
          margin_percent: number | null
          markup_pct: number | null
          markup_percent: number | null
          meal_plan: string | null
          media_urls: string[] | null
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
          pdf_template: string | null
          pdf_url: string | null
          pricing_mode: string | null
          public_token: string
          return_date: string | null
          room_type: string | null
          sent_at: string | null
          source_file_url: string | null
          status: string
          subtotal_value: number | null
          tarifa_base: number | null
          tax_pct: number | null
          tax_value: number | null
          taxas: number | null
          title: string | null
          token_expires_at: string | null
          total_cost: number | null
          total_pax: number | null
          total_sale: number | null
          total_value: number | null
          transports: Json | null
          trip_id: string | null
          updated_at: string
          valid_until: string | null
          video_url: string | null
          view_count: number | null
          viewed_at: string | null
          whatsapp_text: string | null
        }
        Insert: {
          accommodations?: Json | null
          adults?: number | null
          agent_id?: string | null
          agent_photo_url?: string | null
          ai_extracted?: boolean | null
          ai_raw_response?: Json | null
          cancelamento_data_limite?: string | null
          cancelamento_texto_raw?: string | null
          cancelamento_valor_multa?: number | null
          check_in?: string | null
          check_out?: string | null
          children?: number | null
          client_id?: string | null
          co2_emission_kg?: number | null
          code?: string | null
          confirmed_at?: string | null
          cost_center_id?: string | null
          cover_image_url?: string | null
          cover_subtitle?: string | null
          cover_title?: string | null
          created_at?: string
          currency?: string | null
          departure_date?: string | null
          destination?: string | null
          excluded_items?: string[] | null
          excursions?: Json | null
          expires_at?: string | null
          fees_value?: number | null
          group_trip_id?: string | null
          hotel_id?: string | null
          hotel_name?: string | null
          hotel_photo_url?: string | null
          hotel_stars?: number | null
          id?: string
          id_operadora?: string | null
          impostos?: number | null
          included_items?: string[] | null
          installments?: Json | null
          itinerary?: Json | null
          last_viewed_at?: string | null
          layout_mode?: string
          margin_percent?: number | null
          markup_pct?: number | null
          markup_percent?: number | null
          meal_plan?: string | null
          media_urls?: string[] | null
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
          pdf_template?: string | null
          pdf_url?: string | null
          pricing_mode?: string | null
          public_token?: string
          return_date?: string | null
          room_type?: string | null
          sent_at?: string | null
          source_file_url?: string | null
          status?: string
          subtotal_value?: number | null
          tarifa_base?: number | null
          tax_pct?: number | null
          tax_value?: number | null
          taxas?: number | null
          title?: string | null
          token_expires_at?: string | null
          total_cost?: number | null
          total_pax?: number | null
          total_sale?: number | null
          total_value?: number | null
          transports?: Json | null
          trip_id?: string | null
          updated_at?: string
          valid_until?: string | null
          video_url?: string | null
          view_count?: number | null
          viewed_at?: string | null
          whatsapp_text?: string | null
        }
        Update: {
          accommodations?: Json | null
          adults?: number | null
          agent_id?: string | null
          agent_photo_url?: string | null
          ai_extracted?: boolean | null
          ai_raw_response?: Json | null
          cancelamento_data_limite?: string | null
          cancelamento_texto_raw?: string | null
          cancelamento_valor_multa?: number | null
          check_in?: string | null
          check_out?: string | null
          children?: number | null
          client_id?: string | null
          co2_emission_kg?: number | null
          code?: string | null
          confirmed_at?: string | null
          cost_center_id?: string | null
          cover_image_url?: string | null
          cover_subtitle?: string | null
          cover_title?: string | null
          created_at?: string
          currency?: string | null
          departure_date?: string | null
          destination?: string | null
          excluded_items?: string[] | null
          excursions?: Json | null
          expires_at?: string | null
          fees_value?: number | null
          group_trip_id?: string | null
          hotel_id?: string | null
          hotel_name?: string | null
          hotel_photo_url?: string | null
          hotel_stars?: number | null
          id?: string
          id_operadora?: string | null
          impostos?: number | null
          included_items?: string[] | null
          installments?: Json | null
          itinerary?: Json | null
          last_viewed_at?: string | null
          layout_mode?: string
          margin_percent?: number | null
          markup_pct?: number | null
          markup_percent?: number | null
          meal_plan?: string | null
          media_urls?: string[] | null
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
          pdf_template?: string | null
          pdf_url?: string | null
          pricing_mode?: string | null
          public_token?: string
          return_date?: string | null
          room_type?: string | null
          sent_at?: string | null
          source_file_url?: string | null
          status?: string
          subtotal_value?: number | null
          tarifa_base?: number | null
          tax_pct?: number | null
          tax_value?: number | null
          taxas?: number | null
          title?: string | null
          token_expires_at?: string | null
          total_cost?: number | null
          total_pax?: number | null
          total_sale?: number | null
          total_value?: number | null
          transports?: Json | null
          trip_id?: string | null
          updated_at?: string
          valid_until?: string | null
          video_url?: string | null
          view_count?: number | null
          viewed_at?: string | null
          whatsapp_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_timeline"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "quotations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_group_trip_id_fkey"
            columns: ["group_trip_id"]
            isOneToOne: false
            referencedRelation: "group_trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels_bank"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "quotations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "quotations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "quotations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
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
            referencedRelation: "client_timeline"
            referencedColumns: ["quotation_id"]
          },
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
            referencedRelation: "client_timeline"
            referencedColumns: ["quotation_id"]
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
            referencedRelation: "client_timeline"
            referencedColumns: ["quotation_id"]
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
            referencedRelation: "client_timeline"
            referencedColumns: ["quotation_id"]
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
            referencedRelation: "client_timeline"
            referencedColumns: ["quotation_id"]
          },
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
            referencedRelation: "client_timeline"
            referencedColumns: ["quotation_id"]
          },
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
            referencedRelation: "client_timeline"
            referencedColumns: ["quotation_id"]
          },
          {
            foreignKeyName: "quote_transfers_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      route_stops: {
        Row: {
          description: string | null
          guide_page_id: string | null
          id: string
          name: string | null
          stop_order: number | null
          time_label: string | null
        }
        Insert: {
          description?: string | null
          guide_page_id?: string | null
          id?: string
          name?: string | null
          stop_order?: number | null
          time_label?: string | null
        }
        Update: {
          description?: string | null
          guide_page_id?: string | null
          id?: string
          name?: string | null
          stop_order?: number | null
          time_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_stops_guide_page_id_fkey"
            columns: ["guide_page_id"]
            isOneToOne: false
            referencedRelation: "guide_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      feeds_master: {
        Row: {
          category: string
          country: string
          created_at: string
          feed_url: string
          fetch_frequency_minutes: number
          id: string
          is_active: boolean
          language: string
          last_error: string | null
          last_fetched_at: string | null
          last_success_at: string | null
          name: string
          source_type: string
          trust_score: number
          updated_at: string
          url: string | null
        }
        Insert: {
          category?: string
          country?: string
          created_at?: string
          feed_url: string
          fetch_frequency_minutes?: number
          id?: string
          is_active?: boolean
          language?: string
          last_error?: string | null
          last_fetched_at?: string | null
          last_success_at?: string | null
          name: string
          source_type?: string
          trust_score?: number
          updated_at?: string
          url?: string | null
        }
        Update: {
          category?: string
          country?: string
          created_at?: string
          feed_url?: string
          fetch_frequency_minutes?: number
          id?: string
          is_active?: boolean
          language?: string
          last_error?: string | null
          last_fetched_at?: string | null
          last_success_at?: string | null
          name?: string
          source_type?: string
          trust_score?: number
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      feeds_user: {
        Row: {
          category: string
          created_at: string
          feed_url: string
          id: string
          is_active: boolean
          last_error: string | null
          last_fetched_at: string | null
          last_success_at: string | null
          name: string
          org_id: string
          updated_at: string
          url: string | null
          user_id: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          feed_url: string
          id?: string
          is_active?: boolean
          last_error?: string | null
          last_fetched_at?: string | null
          last_success_at?: string | null
          name: string
          org_id: string
          updated_at?: string
          url?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          feed_url?: string
          id?: string
          is_active?: boolean
          last_error?: string | null
          last_fetched_at?: string | null
          last_success_at?: string | null
          name?: string
          org_id?: string
          updated_at?: string
          url?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feeds_user_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      news_articles: {
        Row: {
          ai_bullets: Json
          ai_category: string | null
          ai_relevance_score: number | null
          ai_sentiment: string | null
          ai_short_summary: string | null
          ai_summary: string | null
          ai_tags: Json
          ai_travel_agency_insight: string | null
          ai_recommended_action: string | null
          author: string | null
          canonical_url: string | null
          created_at: string
          fetched_at: string
          image_url: string | null
          id: string
          is_featured: boolean
          org_id: string | null
          original_url: string
          published_at: string
          raw_content: string | null
          raw_excerpt: string | null
          safe_to_publish: boolean
          slug: string
          source_feed_id: string | null
          source_name: string
          source_scope: string
          status: string
          reading_time_minutes: number | null
          hash_dedup: string | null
          updated_at: string
        }
        Insert: {
          ai_bullets?: Json
          ai_category?: string | null
          ai_relevance_score?: number | null
          ai_sentiment?: string | null
          ai_short_summary?: string | null
          ai_summary?: string | null
          ai_tags?: Json
          ai_travel_agency_insight?: string | null
          ai_recommended_action?: string | null
          author?: string | null
          canonical_url?: string | null
          created_at?: string
          fetched_at?: string
          image_url?: string | null
          id?: string
          is_featured?: boolean
          org_id?: string | null
          original_url: string
          published_at?: string
          raw_content?: string | null
          raw_excerpt?: string | null
          safe_to_publish?: boolean
          slug: string
          source_feed_id?: string | null
          source_name?: string
          source_scope?: string
          status?: string
          reading_time_minutes?: number | null
          hash_dedup?: string | null
          updated_at?: string
        }
        Update: {
          ai_bullets?: Json
          ai_category?: string | null
          ai_relevance_score?: number | null
          ai_sentiment?: string | null
          ai_short_summary?: string | null
          ai_summary?: string | null
          ai_tags?: Json
          ai_travel_agency_insight?: string | null
          ai_recommended_action?: string | null
          author?: string | null
          canonical_url?: string | null
          created_at?: string
          fetched_at?: string
          image_url?: string | null
          id?: string
          is_featured?: boolean
          org_id?: string | null
          original_url?: string
          published_at?: string
          raw_content?: string | null
          raw_excerpt?: string | null
          safe_to_publish?: boolean
          slug?: string
          source_feed_id?: string | null
          source_name?: string
          source_scope?: string
          status?: string
          reading_time_minutes?: number | null
          hash_dedup?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_articles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      news_sync_runs: {
        Row: {
          created_at: string
          created_by: string | null
          error_log: Json
          finished_at: string | null
          id: string
          org_id: string | null
          started_at: string
          status: string
          total_duplicates: number
          total_failed: number
          total_feeds: number
          total_fetched: number
          total_new: number
          triggered_by: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          error_log?: Json
          finished_at?: string | null
          id?: string
          org_id?: string | null
          started_at?: string
          status?: string
          total_duplicates?: number
          total_failed?: number
          total_feeds?: number
          total_fetched?: number
          total_new?: number
          triggered_by?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          error_log?: Json
          finished_at?: string | null
          id?: string
          org_id?: string | null
          started_at?: string
          status?: string
          total_duplicates?: number
          total_failed?: number
          total_feeds?: number
          total_fetched?: number
          total_new?: number
          triggered_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_sync_runs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      quote_templates: {
        Row: {
          category: string | null
          created_at: string
          default_sections: Json
          description: string | null
          design_schema: Json
          id: string
          is_active: boolean
          is_master: boolean
          name: string
          org_id: string | null
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          default_sections?: Json
          description?: string | null
          design_schema?: Json
          id?: string
          is_active?: boolean
          is_master?: boolean
          name: string
          org_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          default_sections?: Json
          description?: string | null
          design_schema?: Json
          id?: string
          is_active?: boolean
          is_master?: boolean
          name?: string
          org_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      quote_design_elements: {
        Row: {
          category: string | null
          compatibility: string
          created_at: string
          html_template: string | null
          id: string
          is_active: boolean
          is_master: boolean
          name: string
          org_id: string | null
          schema: Json
          style_schema: Json
          thumbnail_url: string | null
          type: string
          updated_at: string
          version: string
        }
        Insert: {
          category?: string | null
          compatibility?: string
          created_at?: string
          html_template?: string | null
          id?: string
          is_active?: boolean
          is_master?: boolean
          name: string
          org_id?: string | null
          schema?: Json
          style_schema?: Json
          thumbnail_url?: string | null
          type: string
          updated_at?: string
          version?: string
        }
        Update: {
          category?: string | null
          compatibility?: string
          created_at?: string
          html_template?: string | null
          id?: string
          is_active?: boolean
          is_master?: boolean
          name?: string
          org_id?: string | null
          schema?: Json
          style_schema?: Json
          thumbnail_url?: string | null
          type?: string
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_design_elements_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      proposals: {
        Row: {
          ai_extracted_data: Json
          client_id: string | null
          content_schema: Json
          created_at: string
          destination: string | null
          id: string
          itinerary_schema: Json
          media_schema: Json
          org_id: string
          pdf_url: string | null
          pricing_schema: Json
          public_slug: string | null
          public_token: string
          source_pdf_ocr_text: string | null
          source_pdf_url: string | null
          status: string
          template_id: string | null
          title: string
          updated_at: string
          webview_url: string | null
        }
        Insert: {
          ai_extracted_data?: Json
          client_id?: string | null
          content_schema?: Json
          created_at?: string
          destination?: string | null
          id?: string
          itinerary_schema?: Json
          media_schema?: Json
          org_id: string
          pdf_url?: string | null
          pricing_schema?: Json
          public_slug?: string | null
          public_token?: string
          source_pdf_ocr_text?: string | null
          source_pdf_url?: string | null
          status?: string
          template_id?: string | null
          title: string
          updated_at?: string
          webview_url?: string | null
        }
        Update: {
          ai_extracted_data?: Json
          client_id?: string | null
          content_schema?: Json
          created_at?: string
          destination?: string | null
          id?: string
          itinerary_schema?: Json
          media_schema?: Json
          org_id?: string
          pdf_url?: string | null
          pricing_schema?: Json
          public_slug?: string | null
          public_token?: string
          source_pdf_ocr_text?: string | null
          source_pdf_url?: string | null
          status?: string
          template_id?: string | null
          title?: string
          updated_at?: string
          webview_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "quote_templates"
            referencedColumns: ["id"]
          }
        ]
      }
      proposal_versions: {
        Row: {
          created_at: string
          created_by: string | null
          html_snapshot: string | null
          id: string
          pdf_url: string | null
          proposal_id: string
          snapshot: Json
          version_number: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          html_snapshot?: string | null
          id?: string
          pdf_url?: string | null
          proposal_id: string
          snapshot: Json
          version_number: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          html_snapshot?: string | null
          id?: string
          pdf_url?: string | null
          proposal_id?: string
          snapshot?: Json
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposal_versions_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          }
        ]
      }
      proposal_assets: {
        Row: {
          bucket_path: string | null
          created_at: string
          file_url: string
          file_type: string | null
          id: string
          metadata: Json
          proposal_id: string
        }
        Insert: {
          bucket_path?: string | null
          created_at?: string
          file_url: string
          file_type?: string | null
          id?: string
          metadata?: Json
          proposal_id: string
        }
        Update: {
          bucket_path?: string | null
          created_at?: string
          file_url?: string
          file_type?: string | null
          id?: string
          metadata?: Json
          proposal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_assets_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          }
        ]
      }
      rss_feeds: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string | null
          url: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          url: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string | null
          url?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          features: Json | null
          id: string
          is_popular: boolean | null
          missing_features: Json | null
          name: string
          price_monthly: number
          stripe_product_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_popular?: boolean | null
          missing_features?: Json | null
          name: string
          price_monthly?: number
          stripe_product_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_popular?: boolean | null
          missing_features?: Json | null
          name?: string
          price_monthly?: number
          stripe_product_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          commission_rate: number
          created_at: string
          email: string
          full_name: string
          id: string
          org_id: string
          role: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          commission_rate?: number
          created_at?: string
          email: string
          full_name?: string
          id?: string
          org_id: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          commission_rate?: number
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          org_id?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "team_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "team_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "team_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size_bytes: number | null
          file_type: string | null
          file_url: string
          id: string
          message_id: string | null
          ticket_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size_bytes?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          message_id?: string | null
          ticket_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size_bytes?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          message_id?: string | null
          ticket_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "ticket_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_events: {
        Row: {
          actor_id: string | null
          actor_type: string
          created_at: string
          event_type: string
          id: string
          payload: Json
          ticket_id: string
        }
        Insert: {
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          ticket_id: string
        }
        Update: {
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_events_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          attachments: string[]
          content: string
          created_at: string
          email_message_id: string | null
          id: string
          is_internal: boolean
          message_type: string
          sender_email: string | null
          sender_id: string | null
          sender_name: string | null
          sender_type: string
          ticket_id: string
        }
        Insert: {
          attachments?: string[]
          content: string
          created_at?: string
          email_message_id?: string | null
          id?: string
          is_internal?: boolean
          message_type?: string
          sender_email?: string | null
          sender_id?: string | null
          sender_name?: string | null
          sender_type?: string
          ticket_id: string
        }
        Update: {
          attachments?: string[]
          content?: string
          created_at?: string
          email_message_id?: string | null
          id?: string
          is_internal?: boolean
          message_type?: string
          sender_email?: string | null
          sender_id?: string | null
          sender_name?: string | null
          sender_type?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_agent_id: string | null
          assigned_to: string | null
          channel: string
          client_id: string | null
          closed_at: string | null
          created_at: string
          created_by: string | null
          created_by_id: string | null
          created_by_type: string
          description: string
          email_thread_id: string | null
          group_trip_id: string | null
          id: string
          last_interaction_at: string | null
          org_id: string
          priority: string
          priority_score: number | null
          resolution_notes: string | null
          resolved_at: string | null
          satisfaction_score: number | null
          sla_deadline: string | null
          sla_hours: number
          status: string
          subject_line: string | null
          ticket_code: string | null
          title: string
          trip_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          assigned_agent_id?: string | null
          assigned_to?: string | null
          channel?: string
          client_id?: string | null
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          created_by_id?: string | null
          created_by_type?: string
          description: string
          email_thread_id?: string | null
          group_trip_id?: string | null
          id?: string
          last_interaction_at?: string | null
          org_id: string
          priority?: string
          priority_score?: number | null
          resolution_notes?: string | null
          resolved_at?: string | null
          satisfaction_score?: number | null
          sla_deadline?: string | null
          sla_hours?: number
          status?: string
          subject_line?: string | null
          ticket_code?: string | null
          title: string
          trip_id?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          assigned_agent_id?: string | null
          assigned_to?: string | null
          channel?: string
          client_id?: string | null
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          created_by_id?: string | null
          created_by_type?: string
          description?: string
          email_thread_id?: string | null
          group_trip_id?: string | null
          id?: string
          last_interaction_at?: string | null
          org_id?: string
          priority?: string
          priority_score?: number | null
          resolution_notes?: string | null
          resolved_at?: string | null
          satisfaction_score?: number | null
          sla_deadline?: string | null
          sla_hours?: number
          status?: string
          subject_line?: string | null
          ticket_code?: string | null
          title?: string
          trip_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_timeline"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "tickets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_group_trip_id_fkey"
            columns: ["group_trip_id"]
            isOneToOne: false
            referencedRelation: "group_trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "tickets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "tickets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
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
      tips: {
        Row: {
          category: string | null
          content: string | null
          destination_id: string | null
          icon: string | null
          id: string
          order_position: number | null
          title: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          destination_id?: string | null
          icon?: string | null
          id?: string
          order_position?: number | null
          title?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          destination_id?: string | null
          icon?: string | null
          id?: string
          order_position?: number | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tips_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_group_members: {
        Row: {
          group_id: string
          id: string
          traveler_id: string
        }
        Insert: {
          group_id: string
          id?: string
          traveler_id: string
        }
        Update: {
          group_id?: string
          id?: string
          traveler_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "travel_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travel_group_members_traveler_id_fkey"
            columns: ["traveler_id"]
            isOneToOne: false
            referencedRelation: "travelers"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_groups: {
        Row: {
          client_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          org_id: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          org_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_groups_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_timeline"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "travel_groups_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travel_groups_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "travel_groups_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "travel_groups_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "travel_groups_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      traveler_documents: {
        Row: {
          created_at: string
          doc_number: string | null
          doc_type: string
          expiry_date: string | null
          file_url: string | null
          id: string
          issue_date: string | null
          org_id: string
          status: string | null
          traveler_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          doc_number?: string | null
          doc_type: string
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          issue_date?: string | null
          org_id: string
          status?: string | null
          traveler_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          doc_number?: string | null
          doc_type?: string
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          issue_date?: string | null
          org_id?: string
          status?: string | null
          traveler_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "traveler_documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "traveler_documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "traveler_documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "traveler_documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traveler_documents_traveler_id_fkey"
            columns: ["traveler_id"]
            isOneToOne: false
            referencedRelation: "travelers"
            referencedColumns: ["id"]
          },
        ]
      }
      traveler_info_pages: {
        Row: {
          author_id: string | null
          content_blocks: Json
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_published: boolean | null
          org_id: string
          slug: string
          slug_locked: boolean
          slug_updated_at: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content_blocks?: Json
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          org_id: string
          slug: string
          slug_locked?: boolean
          slug_updated_at?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content_blocks?: Json
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          org_id?: string
          slug?: string
          slug_locked?: boolean
          slug_updated_at?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "traveler_info_pages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traveler_info_pages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "traveler_info_pages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "traveler_info_pages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "traveler_info_pages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          relation: string | null
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
          relation?: string | null
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
          relation?: string | null
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
            referencedRelation: "client_timeline"
            referencedColumns: ["client_id"]
          },
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
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "travelers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "travelers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
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
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "trip_documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "trip_documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
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
          change_notes: string | null
          checkin_done: boolean
          checkin_done_at: string | null
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
          change_notes?: string | null
          checkin_done?: boolean
          checkin_done_at?: string | null
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
          change_notes?: string | null
          checkin_done?: boolean
          checkin_done_at?: string | null
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
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "trip_flights_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "trip_flights_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
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
          attachments: string[] | null
          contract_url: string | null
          created_at: string
          currency: string
          departure_date: string | null
          destination_city: string | null
          destination_country: string | null
          exchange_rate: number | null
          flight_number: string | null
          group_id: string | null
          hotel_name: string | null
          hotel_regime: string | null
          id: string
          includes_transfer: boolean
          insurance_company: string | null
          insurance_policy: string | null
          itinerary: Json | null
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
          pax_count: number | null
          payment_status: string
          primary_client_id: string | null
          quotation_id: string | null
          return_date: string | null
          room_type: string | null
          status: string
          title: string
          total_price: number | null
          total_value: number | null
          updated_at: string
          voucher_url: string | null
          whatsapp_text_sent: string | null
        }
        Insert: {
          airline?: string | null
          assigned_agent_id?: string | null
          attachments?: string[] | null
          contract_url?: string | null
          created_at?: string
          currency?: string
          departure_date?: string | null
          destination_city?: string | null
          destination_country?: string | null
          exchange_rate?: number | null
          flight_number?: string | null
          group_id?: string | null
          hotel_name?: string | null
          hotel_regime?: string | null
          id?: string
          includes_transfer?: boolean
          insurance_company?: string | null
          insurance_policy?: string | null
          itinerary?: Json | null
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
          pax_count?: number | null
          payment_status?: string
          primary_client_id?: string | null
          quotation_id?: string | null
          return_date?: string | null
          room_type?: string | null
          status?: string
          title: string
          total_price?: number | null
          total_value?: number | null
          updated_at?: string
          voucher_url?: string | null
          whatsapp_text_sent?: string | null
        }
        Update: {
          airline?: string | null
          assigned_agent_id?: string | null
          attachments?: string[] | null
          contract_url?: string | null
          created_at?: string
          currency?: string
          departure_date?: string | null
          destination_city?: string | null
          destination_country?: string | null
          exchange_rate?: number | null
          flight_number?: string | null
          group_id?: string | null
          hotel_name?: string | null
          hotel_regime?: string | null
          id?: string
          includes_transfer?: boolean
          insurance_company?: string | null
          insurance_policy?: string | null
          itinerary?: Json | null
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
          pax_count?: number | null
          payment_status?: string
          primary_client_id?: string | null
          quotation_id?: string | null
          return_date?: string | null
          room_type?: string | null
          status?: string
          title?: string
          total_price?: number | null
          total_value?: number | null
          updated_at?: string
          voucher_url?: string | null
          whatsapp_text_sent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trips_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "travel_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_itinerary_id_fkey"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "itineraries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "trips_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "trips_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
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
            referencedRelation: "client_timeline"
            referencedColumns: ["client_id"]
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
            referencedRelation: "client_timeline"
            referencedColumns: ["quotation_id"]
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
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wa_conversation_logs: {
        Row: {
          client_id: string | null
          contact_phone: string | null
          contact_phone_key: string | null
          created_at: string
          direction: string
          id: string
          message_hash: string
          message_text: string
          message_time: string | null
          message_time_label: string | null
          metadata: Json
          org_id: string
          session_key: string
          wa_session_id: string | null
        }
        Insert: {
          client_id?: string | null
          contact_phone?: string | null
          contact_phone_key?: string | null
          created_at?: string
          direction?: string
          id?: string
          message_hash: string
          message_text: string
          message_time?: string | null
          message_time_label?: string | null
          metadata?: Json
          org_id: string
          session_key: string
          wa_session_id?: string | null
        }
        Update: {
          client_id?: string | null
          contact_phone?: string | null
          contact_phone_key?: string | null
          created_at?: string
          direction?: string
          id?: string
          message_hash?: string
          message_text?: string
          message_time?: string | null
          message_time_label?: string | null
          metadata?: Json
          org_id?: string
          session_key?: string
          wa_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wa_conversation_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_timeline"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "wa_conversation_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wa_conversation_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "wa_conversation_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "wa_conversation_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "wa_conversation_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wa_conversation_logs_wa_session_id_fkey"
            columns: ["wa_session_id"]
            isOneToOne: false
            referencedRelation: "wa_session_metrics"
            referencedColumns: ["id"]
          },
        ]
      }
      wa_session_metrics: {
        Row: {
          chat_id: string | null
          client_id: string | null
          contact_name: string | null
          contact_phone: string | null
          contact_phone_key: string | null
          created_at: string
          extension_id: string
          id: string
          last_incoming_at: string | null
          last_message_at: string | null
          last_outgoing_at: string | null
          last_seen_at: string
          message_count: number
          metadata: Json
          org_id: string
          page_title: string | null
          profile_id: string | null
          session_key: string
          tab_url: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          chat_id?: string | null
          client_id?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_phone_key?: string | null
          created_at?: string
          extension_id: string
          id?: string
          last_incoming_at?: string | null
          last_message_at?: string | null
          last_outgoing_at?: string | null
          last_seen_at?: string
          message_count?: number
          metadata?: Json
          org_id: string
          page_title?: string | null
          profile_id?: string | null
          session_key: string
          tab_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          chat_id?: string | null
          client_id?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_phone_key?: string | null
          created_at?: string
          extension_id?: string
          id?: string
          last_incoming_at?: string | null
          last_message_at?: string | null
          last_outgoing_at?: string | null
          last_seen_at?: string
          message_count?: number
          metadata?: Json
          org_id?: string
          page_title?: string | null
          profile_id?: string | null
          session_key?: string
          tab_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wa_session_metrics_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_timeline"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "wa_session_metrics_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wa_session_metrics_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "wa_session_metrics_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "wa_session_metrics_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "wa_session_metrics_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wa_session_metrics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_data: {
        Row: {
          condition: string | null
          condition_emoji: string | null
          date: string | null
          destination_id: string | null
          fetched_at: string | null
          id: string
          source: string | null
          temp_max: number | null
          temp_min: number | null
        }
        Insert: {
          condition?: string | null
          condition_emoji?: string | null
          date?: string | null
          destination_id?: string | null
          fetched_at?: string | null
          id?: string
          source?: string | null
          temp_max?: number | null
          temp_min?: number | null
        }
        Update: {
          condition?: string | null
          condition_emoji?: string | null
          date?: string | null
          destination_id?: string | null
          fetched_at?: string | null
          id?: string
          source?: string | null
          temp_max?: number | null
          temp_min?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weather_data_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      agencies: {
        Row: {
          agency_id: string | null
          created_at: string | null
          google_business_id: string | null
          handle: string | null
          logo_url: string | null
          name: string | null
          org_id: string | null
          parent_org_id: string | null
          plan: string | null
          primary_color: string | null
          settings: Json | null
          slug: string | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          agency_id?: string | null
          created_at?: string | null
          google_business_id?: string | null
          handle?: string | null
          logo_url?: string | null
          name?: string | null
          org_id?: string | null
          parent_org_id?: string | null
          plan?: string | null
          primary_color?: string | null
          settings?: Json | null
          slug?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          agency_id?: string | null
          created_at?: string | null
          google_business_id?: string | null
          handle?: string | null
          logo_url?: string | null
          name?: string | null
          org_id?: string | null
          parent_org_id?: string | null
          plan?: string | null
          primary_color?: string | null
          settings?: Json | null
          slug?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["parent_org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["parent_org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["parent_org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["parent_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_dashboard_summary: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          agent_status: string | null
          agent_type: string | null
          error_count: number | null
          last_action_at: string | null
          org_id: string | null
          success_rate: number | null
          tasks_awaiting: number | null
          tasks_completed: number | null
          tasks_failed: number | null
          tasks_queued: number | null
          tasks_running: number | null
          total_tasks_run: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_agents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "ai_agents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "ai_agents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "ai_agents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_timeline: {
        Row: {
          client_id: string | null
          departure_date: string | null
          destination: string | null
          email: string | null
          name: string | null
          org_id: string | null
          phone: string | null
          quotation_created_at: string | null
          quotation_id: string | null
          quotation_status: string | null
          return_date: string | null
          total_value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "clients_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "clients_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "clients_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_analytics_summary: {
        Row: {
          confirmed_30d: number | null
          conversion_rate_pct: number | null
          open_tickets_30d: number | null
          org_id: string | null
          org_name: string | null
          parent_org_id: string | null
          plan: string | null
          quotations_30d: number | null
          revenue_30d: number | null
          sla_breaches_30d: number | null
          total_clients: number | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["parent_org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["parent_org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["parent_org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "organizations_parent_org_id_fkey"
            columns: ["parent_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations_monthly_trend: {
        Row: {
          confirmed: number | null
          month: string | null
          org_id: string | null
          revenue: number | null
          total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "quotations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "quotations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org_analytics_summary"
            referencedColumns: ["org_id"]
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
    }
    Functions: {
      approve_ai_task: {
        Args: { p_approved?: boolean; p_reason?: string; p_task_id: string }
        Returns: Json
      }
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
      calculate_installments: {
        Args: {
          p_boarding_date?: string
          p_deposit_pct?: number
          p_installments?: number
          p_interest_rate?: number
          p_start_date?: string
          p_total_value: number
        }
        Returns: Json
      }
      confirm_public_quotation: {
        Args: {
          p_notes?: string
          p_token: string
          p_traveler_email?: string
          p_traveler_name: string
        }
        Returns: boolean
      }
      create_notification: {
        Args: {
          _entity_id?: string
          _entity_type?: string
          _message?: string
          _metadata?: Json
          _org_id: string
          _title: string
          _type: string
          _user_id: string
        }
        Returns: string
      }
      enqueue_ai_task: {
        Args: {
          p_agent_type: string
          p_approval_prompt?: string
          p_entity_id?: string
          p_entity_type?: string
          p_requires_approval?: boolean
          p_task_payload?: Json
          p_task_type: string
        }
        Returns: Json
      }
      ensure_default_kanban_boards: {
        Args: { _org_id: string }
        Returns: undefined
      }
      expire_old_quotations: { Args: never; Returns: undefined }
      finalize_group_booking_signature: {
        Args: {
          _booking_id: string
          _booking_token: string
          _contract_html: string
          _facial_photo_url: string
          _geolocation: Json
          _hash_sha256: string
          _selected_seats: string[]
          _signed_at: string
          _signer_cpf: string
          _signer_email: string
          _signer_ip: string
          _signer_name: string
          _user_agent: string
        }
        Returns: Json
      }
      fn_get_kanban_ai_insights: {
        Args: { p_org_id: string }
        Returns: {
          alert_message: string
          alert_type: string
          card_id: string
          card_title: string
          client_name: string
          column_name: string
          days_stale: number
          estimated_value: number
        }[]
      }
      generate_booking_installments: {
        Args: { _booking_id: string }
        Returns: undefined
      }
      get_group_trip_financial_summary: {
        Args: { _trip_id: string }
        Returns: Json
      }
      get_my_org_id: { Args: never; Returns: string }
      get_public_checklist: {
        Args: { _token: string }
        Returns: {
          checklist_id: string
          is_completed: boolean
          item_description: string
          item_id: string
          item_title: string
          position: number
          title: string
        }[]
      }
      get_public_group_trip: {
        Args: { _slug: string }
        Returns: {
          bus_layout: Json
          bus_layout_id: string
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
          occupied_seats: string[]
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
      get_public_organization_by_slug: {
        Args: { _slug: string }
        Returns: {
          id: string
          logo_url: string
          name: string
          primary_color: string
          whatsapp: string
        }[]
      }
      get_public_portal_org: {
        Args: { p_ident: string }
        Returns: {
          handle: string
          id: string
          logo_url: string
          name: string
          primary_color: string
          slug: string
          whatsapp: string
        }[]
      }
      get_public_quotation: { Args: { _token: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_email_open: {
        Args: { _ip: string; _log_id: string; _ua: string }
        Returns: undefined
      }
      increment_email_open_simple: {
        Args: { _log_id: string }
        Returns: undefined
      }
      increment_itinerary_view: {
        Args: { p_token: string }
        Returns: undefined
      }
      log_automation_execution: {
        Args: {
          _event_type: string
          _metadata?: Json
          _org_id: string
          _target_id: string
        }
        Returns: boolean
      }
      monitor_airline_crisis: { Args: never; Returns: undefined }
      recalculate_group_trip_counts: {
        Args: { _trip_id: string }
        Returns: undefined
      }
      send_magic_guide_reminders: { Args: never; Returns: undefined }
      get_traveler_by_token: {
        Args: {
          _token: string
        }
        Returns: {
          birth_date: string | null
          cpf: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          form_completed_at: string | null
          full_name: string
          gender: string | null
          id: string
          nationality: string | null
          passport_expiry: string | null
          passport_number: string | null
          phone: string | null
          special_needs: string | null
          seat_preference: string | null
          meal_preference: string | null
          loyalty_programs: string | null
        }[]
      }
      submit_traveler_form: {
        Args: {
          _birth_date?: string
          _cpf?: string
          _email?: string
          _full_name: string
          _gender?: string
          _nationality?: string
          _phone?: string
          _token: string
        }
        Returns: string
      }
      toggle_public_checklist_item: {
        Args: { _is_completed: boolean; _item_id: string; _token: string }
        Returns: string
      }
      track_quotation_view: {
        Args: { p_quotation_id: string }
        Returns: undefined
      }
      transfer_booking_to_trip: {
        Args: { p_booking_id: string; p_new_trip_id: string; p_reason: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "super_admin" | "org_admin" | "agent" | "support" | "client"
      badge_type: "default" | "green"
      flight_direction: "outbound" | "return"
      gallery_span: "normal" | "tall" | "wide"
      media_type: "photo" | "video"
      place_type: "beach" | "attraction" | "restaurant" | "activity" | "hotel"
      quote_status:
        | "draft"
        | "sent"
        | "viewed"
        | "confirmed"
        | "expired"
        | "cancelled"
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
      app_role: ["super_admin", "org_admin", "agent", "support", "client"],
      badge_type: ["default", "green"],
      flight_direction: ["outbound", "return"],
      gallery_span: ["normal", "tall", "wide"],
      media_type: ["photo", "video"],
      place_type: ["beach", "attraction", "restaurant", "activity", "hotel"],
      quote_status: [
        "draft",
        "sent",
        "viewed",
        "confirmed",
        "expired",
        "cancelled",
      ],
    },
  },
} as const
