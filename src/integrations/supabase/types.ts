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
          photo_url: string | null
          phone: string | null
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
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          org_id: string
          origin?: string | null
          photo_url?: string | null
          phone?: string | null
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
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          org_id?: string
          origin?: string | null
          photo_url?: string | null
          phone?: string | null
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
            referencedRelation: "organizations"
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
          board_id: string
          client_id: string | null
          column_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          meta: Json
          org_id: string
          position: number
          priority: string
          quotation_id: string | null
          title: string
          trip_id: string | null
          updated_at: string
        }
        Insert: {
          board_id: string
          client_id?: string | null
          column_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          meta?: Json
          org_id: string
          position?: number
          priority?: string
          quotation_id?: string | null
          title: string
          trip_id?: string | null
          updated_at?: string
        }
        Update: {
          board_id?: string
          client_id?: string | null
          column_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          meta?: Json
          org_id?: string
          position?: number
          priority?: string
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
          departure_date: string | null
          destination: string | null
          expires_at: string | null
          hotel_name: string | null
          hotel_photo_url: string | null
          hotel_stars: number | null
          id: string
          installments: Json | null
          meal_plan: string | null
          notes_internal: string | null
          num_adults: number
          num_children: number
          num_nights: number | null
          org_id: string
          return_date: string | null
          room_type: string | null
          sent_at: string | null
          share_token: string | null
          source_file_url: string | null
          status: string
          title: string | null
          trip_id: string | null
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
          departure_date?: string | null
          destination?: string | null
          expires_at?: string | null
          hotel_name?: string | null
          hotel_photo_url?: string | null
          hotel_stars?: number | null
          id?: string
          installments?: Json | null
          meal_plan?: string | null
          notes_internal?: string | null
          num_adults?: number
          num_children?: number
          num_nights?: number | null
          org_id: string
          return_date?: string | null
          room_type?: string | null
          sent_at?: string | null
          share_token?: string | null
          source_file_url?: string | null
          status?: string
          title?: string | null
          trip_id?: string | null
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
          departure_date?: string | null
          destination?: string | null
          expires_at?: string | null
          hotel_name?: string | null
          hotel_photo_url?: string | null
          hotel_stars?: number | null
          id?: string
          installments?: Json | null
          meal_plan?: string | null
          notes_internal?: string | null
          num_adults?: number
          num_children?: number
          num_nights?: number | null
          org_id?: string
          return_date?: string | null
          room_type?: string | null
          sent_at?: string | null
          share_token?: string | null
          source_file_url?: string | null
          status?: string
          title?: string | null
          trip_id?: string | null
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
          {
            foreignKeyName: "quotations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
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
          id: string
          is_visible_to_client: boolean
          org_id: string
          share_token: string
          title: string
          trip_id: string | null
          type: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_visible_to_client?: boolean
          org_id: string
          share_token?: string
          title: string
          trip_id?: string | null
          type?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_visible_to_client?: boolean
          org_id?: string
          share_token?: string
          title?: string
          trip_id?: string | null
          type?: string
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
          assigned_agent_id: string | null
          contract_url: string | null
          created_at: string
          currency: string
          departure_date: string | null
          destination_city: string | null
          destination_country: string | null
          exchange_rate: number | null
          group_id: string | null
          hotel_name: string | null
          hotel_regime: string | null
          id: string
          includes_transfer: boolean
          meta: Json
          notes_client: string | null
          notes_internal: string | null
          num_nights: number | null
          operator_id: string | null
          operator_name: string | null
          org_id: string
          origin_city: string | null
          payment_status: string
          primary_client_id: string | null
          return_date: string | null
          status: string
          title: string
          total_price: number | null
          updated_at: string
          voucher_url: string | null
          whatsapp_text_sent: string | null
        }
        Insert: {
          assigned_agent_id?: string | null
          contract_url?: string | null
          created_at?: string
          currency?: string
          departure_date?: string | null
          destination_city?: string | null
          destination_country?: string | null
          exchange_rate?: number | null
          group_id?: string | null
          hotel_name?: string | null
          hotel_regime?: string | null
          id?: string
          includes_transfer?: boolean
          meta?: Json
          notes_client?: string | null
          notes_internal?: string | null
          num_nights?: number | null
          operator_id?: string | null
          operator_name?: string | null
          org_id: string
          origin_city?: string | null
          payment_status?: string
          primary_client_id?: string | null
          return_date?: string | null
          status?: string
          title: string
          total_price?: number | null
          updated_at?: string
          voucher_url?: string | null
          whatsapp_text_sent?: string | null
        }
        Update: {
          assigned_agent_id?: string | null
          contract_url?: string | null
          created_at?: string
          currency?: string
          departure_date?: string | null
          destination_city?: string | null
          destination_country?: string | null
          exchange_rate?: number | null
          group_id?: string | null
          hotel_name?: string | null
          hotel_regime?: string | null
          id?: string
          includes_transfer?: boolean
          meta?: Json
          notes_client?: string | null
          notes_internal?: string | null
          num_nights?: number | null
          operator_id?: string | null
          operator_name?: string | null
          org_id?: string
          origin_city?: string | null
          payment_status?: string
          primary_client_id?: string | null
          return_date?: string | null
          status?: string
          title?: string
          total_price?: number | null
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
      ticket_messages: {
        Row: {
          attachments: string[]
          content: string
          created_at: string
          id: string
          is_internal: boolean
          sender_id: string | null
          sender_type: string
          ticket_id: string
        }
        Insert: {
          attachments?: string[]
          content: string
          created_at?: string
          id?: string
          is_internal?: boolean
          sender_id?: string | null
          sender_type?: string
          ticket_id: string
        }
        Update: {
          attachments?: string[]
          content?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          sender_id?: string | null
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
          client_id: string | null
          created_at: string
          created_by_id: string | null
          created_by_type: string
          description: string
          id: string
          org_id: string
          priority: string
          resolved_at: string | null
          status: string
          title: string
          trip_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          assigned_agent_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by_id?: string | null
          created_by_type?: string
          description: string
          id?: string
          org_id: string
          priority?: string
          resolved_at?: string | null
          status?: string
          title: string
          trip_id?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          assigned_agent_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by_id?: string | null
          created_by_type?: string
          description?: string
          id?: string
          org_id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
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
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          email: string | null
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
          rg: string | null
          relation: string | null
          special_needs: string | null
          updated_at: string
          vaccines: Json
        }
        Insert: {
          birth_date?: string | null
          client_id?: string | null
          cpf?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          email?: string | null
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
          rg?: string | null
          relation?: string | null
          special_needs?: string | null
          updated_at?: string
          vaccines?: Json
        }
        Update: {
          birth_date?: string | null
          client_id?: string | null
          cpf?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          email?: string | null
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
          rg?: string | null
          relation?: string | null
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
      ensure_default_kanban_boards: { Args: { _org_id: string }; Returns: undefined }
      get_public_organization_by_slug: {
        Args: { _slug: string }
        Returns: {
          id: string
          logo_url: string
          name: string
          primary_color: string
          slug: string
        }[]
      }
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
      get_my_org_id: { Args: never; Returns: string }
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
        Args: { _is_completed: boolean; _item_id: string; _token: string }
        Returns: string
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
