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
      ai_keys_pool: {
        Row: {
          api_key: string
          created_at: string
          id: string
          is_active: boolean
          monthly_limit_usd: number | null
          org_id: string
          provider: string
          updated_at: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          is_active?: boolean
          monthly_limit_usd?: number | null
          org_id: string
          provider: string
          updated_at?: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          is_active?: boolean
          monthly_limit_usd?: number | null
          org_id?: string
          provider?: string
          updated_at?: string
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
      checklist_items: {
        Row: {
          checked_at: string | null
          checklist_id: string
          created_at: string
          description: string | null
          id: string
          is_checked: boolean
          position: number
          title: string
        }
        Insert: {
          checked_at?: string | null
          checklist_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_checked?: boolean
          position?: number
          title: string
        }
        Update: {
          checked_at?: string | null
          checklist_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_checked?: boolean
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
          id: string
          is_visible_to_client: boolean | null
          org_id: string
          share_token: string | null
          title: string
          trip_id: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_visible_to_client?: boolean | null
          org_id: string
          share_token?: string | null
          title: string
          trip_id?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_visible_to_client?: boolean | null
          org_id?: string
          share_token?: string | null
          title?: string
          trip_id?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklists_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
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
      clients: {
        Row: {
          address: string | null
          assigned_agent_id: string | null
          birth_date: string | null
          city: string | null
          country: string | null
          cpf: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          org_id: string
          origin: string | null
          phone: string | null
          photo_url: string | null
          portal_access_enabled: boolean
          portal_user_id: string | null
          preferences: Json | null
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
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          org_id: string
          origin?: string | null
          phone?: string | null
          photo_url?: string | null
          portal_access_enabled?: boolean
          portal_user_id?: string | null
          preferences?: Json | null
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
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          org_id?: string
          origin?: string | null
          phone?: string | null
          photo_url?: string | null
          portal_access_enabled?: boolean
          portal_user_id?: string | null
          preferences?: Json | null
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
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      destination_guides: {
        Row: {
          city: string
          climate_info: string | null
          country: string
          cover_image_url: string | null
          created_at: string
          currency_info: string | null
          emergency_numbers: Json | null
          id: string
          intro: string | null
          is_published: boolean
          language_tips: string | null
          org_id: string
          tips: Json | null
          transportation: string | null
          updated_at: string
          useful_contacts: Json | null
        }
        Insert: {
          city: string
          climate_info?: string | null
          country: string
          cover_image_url?: string | null
          created_at?: string
          currency_info?: string | null
          emergency_numbers?: Json | null
          id?: string
          intro?: string | null
          is_published?: boolean
          language_tips?: string | null
          org_id: string
          tips?: Json | null
          transportation?: string | null
          updated_at?: string
          useful_contacts?: Json | null
        }
        Update: {
          city?: string
          climate_info?: string | null
          country?: string
          cover_image_url?: string | null
          created_at?: string
          currency_info?: string | null
          emergency_numbers?: Json | null
          id?: string
          intro?: string | null
          is_published?: boolean
          language_tips?: string | null
          org_id?: string
          tips?: Json | null
          transportation?: string | null
          updated_at?: string
          useful_contacts?: Json | null
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
      hotels_bank: {
        Row: {
          address: string | null
          category: number | null
          city: string | null
          country: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          org_id: string
          phone: string | null
          photo_url: string | null
          regime_options: string[] | null
          stars: number | null
          state: string | null
          tags: string[] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          category?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          org_id: string
          phone?: string | null
          photo_url?: string | null
          regime_options?: string[] | null
          stars?: number | null
          state?: string | null
          tags?: string[] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          org_id?: string
          phone?: string | null
          photo_url?: string | null
          regime_options?: string[] | null
          stars?: number | null
          state?: string | null
          tags?: string[] | null
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
      kanban_boards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          org_id: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          org_id: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
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
          id: string
          metadata: Json | null
          position: number
          quotation_id: string | null
          title: string
          trip_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          board_id: string
          client_id?: string | null
          column_id: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          position?: number
          quotation_id?: string | null
          title: string
          trip_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          board_id?: string
          client_id?: string | null
          column_id?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          position?: number
          quotation_id?: string | null
          title?: string
          trip_id?: string | null
          updated_at?: string
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
            foreignKeyName: "kanban_cards_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
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
      kanban_columns: {
        Row: {
          board_id: string
          color: string | null
          created_at: string
          id: string
          name: string
          position: number
        }
        Insert: {
          board_id: string
          color?: string | null
          created_at?: string
          id?: string
          name: string
          position?: number
        }
        Update: {
          board_id?: string
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "kanban_columns_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "kanban_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string | null
          org_id: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          org_id: string
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          org_id?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
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
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          phone: string | null
          plan: string | null
          primary_color: string | null
          settings: Json | null
          slug: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: Json | null
          ai_keys_config?: Json | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          phone?: string | null
          plan?: string | null
          primary_color?: string | null
          settings?: Json | null
          slug: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: Json | null
          ai_keys_config?: Json | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          phone?: string | null
          plan?: string | null
          primary_color?: string | null
          settings?: Json | null
          slug?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
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
          notification_prefs: Json | null
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
          notification_prefs?: Json | null
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
          notification_prefs?: Json | null
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
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          agent_id: string | null
          ai_extracted: boolean | null
          ai_raw_response: Json | null
          check_in: string | null
          check_out: string | null
          client_id: string | null
          created_at: string
          currency: string | null
          destination: string | null
          hotel_name: string | null
          hotel_photo_url: string | null
          hotel_stars: number | null
          id: string
          installments: Json | null
          meal_plan: string | null
          num_nights: number | null
          org_id: string
          room_type: string | null
          share_token: string | null
          source_file_url: string | null
          status: string
          total_value: number | null
          updated_at: string
          viewed_at: string | null
          whatsapp_text: string | null
        }
        Insert: {
          agent_id?: string | null
          ai_extracted?: boolean | null
          ai_raw_response?: Json | null
          check_in?: string | null
          check_out?: string | null
          client_id?: string | null
          created_at?: string
          currency?: string | null
          destination?: string | null
          hotel_name?: string | null
          hotel_photo_url?: string | null
          hotel_stars?: number | null
          id?: string
          installments?: Json | null
          meal_plan?: string | null
          num_nights?: number | null
          org_id: string
          room_type?: string | null
          share_token?: string | null
          source_file_url?: string | null
          status?: string
          total_value?: number | null
          updated_at?: string
          viewed_at?: string | null
          whatsapp_text?: string | null
        }
        Update: {
          agent_id?: string | null
          ai_extracted?: boolean | null
          ai_raw_response?: Json | null
          check_in?: string | null
          check_out?: string | null
          client_id?: string | null
          created_at?: string
          currency?: string | null
          destination?: string | null
          hotel_name?: string | null
          hotel_photo_url?: string | null
          hotel_stars?: number | null
          id?: string
          installments?: Json | null
          meal_plan?: string | null
          num_nights?: number | null
          org_id?: string
          room_type?: string | null
          share_token?: string | null
          source_file_url?: string | null
          status?: string
          total_value?: number | null
          updated_at?: string
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
      ticket_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          is_internal: boolean
          sender_id: string | null
          sender_type: string | null
          ticket_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_internal?: boolean
          sender_id?: string | null
          sender_type?: string | null
          ticket_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          sender_id?: string | null
          sender_type?: string | null
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
          assigned_to: string | null
          client_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          org_id: string
          priority: string
          status: string
          subject: string
          title: string | null
          trip_id: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          org_id: string
          priority?: string
          status?: string
          subject: string
          title?: string | null
          trip_id?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          org_id?: string
          priority?: string
          status?: string
          subject?: string
          title?: string | null
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
            referencedRelation: "clients"
            referencedColumns: ["id"]
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
      travelers: {
        Row: {
          birth_date: string | null
          client_id: string | null
          cpf: string | null
          created_at: string
          email: string | null
          form_completed_at: string | null
          form_token: string | null
          full_name: string
          gender: string | null
          id: string
          nationality: string | null
          org_id: string
          phone: string | null
          relation: string | null
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          client_id?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          form_completed_at?: string | null
          form_token?: string | null
          full_name: string
          gender?: string | null
          id?: string
          nationality?: string | null
          org_id: string
          phone?: string | null
          relation?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          client_id?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          form_completed_at?: string | null
          form_token?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          nationality?: string | null
          org_id?: string
          phone?: string | null
          relation?: string | null
          updated_at?: string
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
      trip_documents: {
        Row: {
          created_at: string
          doc_type: string | null
          file_url: string | null
          id: string
          is_visible_to_client: boolean
          title: string
          trip_id: string
        }
        Insert: {
          created_at?: string
          doc_type?: string | null
          file_url?: string | null
          id?: string
          is_visible_to_client?: boolean
          title: string
          trip_id: string
        }
        Update: {
          created_at?: string
          doc_type?: string | null
          file_url?: string | null
          id?: string
          is_visible_to_client?: boolean
          title?: string
          trip_id?: string
        }
        Relationships: [
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
          airline_name: string | null
          arrival_datetime: string | null
          booking_code: string | null
          created_at: string
          departure_datetime: string | null
          destination_city: string | null
          flight_number: string | null
          id: string
          notes: string | null
          origin_city: string | null
          sequence: number
          trip_id: string
        }
        Insert: {
          airline_name?: string | null
          arrival_datetime?: string | null
          booking_code?: string | null
          created_at?: string
          departure_datetime?: string | null
          destination_city?: string | null
          flight_number?: string | null
          id?: string
          notes?: string | null
          origin_city?: string | null
          sequence?: number
          trip_id: string
        }
        Update: {
          airline_name?: string | null
          arrival_datetime?: string | null
          booking_code?: string | null
          created_at?: string
          departure_datetime?: string | null
          destination_city?: string | null
          flight_number?: string | null
          id?: string
          notes?: string | null
          origin_city?: string | null
          sequence?: number
          trip_id?: string
        }
        Relationships: [
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
          id: string
          seat_number: string | null
          ticket_number: string | null
          traveler_id: string
          trip_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          seat_number?: string | null
          ticket_number?: string | null
          traveler_id: string
          trip_id: string
        }
        Update: {
          created_at?: string
          id?: string
          seat_number?: string | null
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
      traveler_info_pages: {
        Row: {
          id: string
          org_id: string
          title: string
          slug: string
          description: string | null
          cover_image_url: string | null
          content_blocks: Json
          is_published: boolean | null
          author_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          title: string
          slug: string
          description?: string | null
          cover_image_url?: string | null
          content_blocks?: Json
          is_published?: boolean | null
          author_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          title?: string
          slug?: string
          description?: string | null
          cover_image_url?: string | null
          content_blocks?: Json
          is_published?: boolean | null
          author_id?: string | null
          created_at?: string
          updated_at?: string
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
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      trips: {
        Row: {
          assigned_agent_id: string | null
          created_at: string
          created_by: string | null
          departure_date: string | null
          destination: string | null
          destination_city: string | null
          destination_country: string | null
          hotel_name: string | null
          hotel_regime: string | null
          id: string
          notes: string | null
          notes_internal: string | null
          org_id: string
          primary_client_id: string | null
          return_date: string | null
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          assigned_agent_id?: string | null
          created_at?: string
          created_by?: string | null
          departure_date?: string | null
          destination?: string | null
          destination_city?: string | null
          destination_country?: string | null
          hotel_name?: string | null
          hotel_regime?: string | null
          id?: string
          notes?: string | null
          notes_internal?: string | null
          org_id: string
          primary_client_id?: string | null
          return_date?: string | null
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          assigned_agent_id?: string | null
          created_at?: string
          created_by?: string | null
          departure_date?: string | null
          destination?: string | null
          destination_city?: string | null
          destination_country?: string | null
          hotel_name?: string | null
          hotel_regime?: string | null
          id?: string
          notes?: string | null
          notes_internal?: string | null
          org_id?: string
          primary_client_id?: string | null
          return_date?: string | null
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_org_admin_role: { Args: { _user_id: string }; Returns: undefined }
      ensure_default_kanban_boards: {
        Args: { _org_id: string }
        Returns: undefined
      }
      get_my_org_id: { Args: never; Returns: string }
      get_public_checklist: {
        Args: { _token: string }
        Returns: {
          checklist_id: string
          checklist_title: string
          is_checked: boolean
          item_description: string
          item_id: string
          item_position: number
          item_title: string
          org_logo: string
          org_name: string
          org_primary_color: string
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
      get_public_quotation: {
        Args: { _token: string }
        Returns: {
          check_in: string
          check_out: string
          currency: string
          destination: string
          hotel_name: string
          hotel_photo_url: string
          hotel_stars: number
          installments: Json
          meal_plan: string
          num_nights: number
          org_logo: string
          org_name: string
          org_primary_color: string
          org_whatsapp: string
          room_type: string
          total_value: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
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
        Args: { _item_id: string; _token: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "org_admin" | "agent" | "support" | "client"
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
    },
  },
} as const
