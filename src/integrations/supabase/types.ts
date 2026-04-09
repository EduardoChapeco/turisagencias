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
