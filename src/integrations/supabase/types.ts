export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      component_syncs: {
        Row: {
          component_id: string | null
          created_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          status: string
          sync_type: string
          wordpress_site_id: string | null
        }
        Insert: {
          component_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          sync_type: string
          wordpress_site_id?: string | null
        }
        Update: {
          component_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          sync_type?: string
          wordpress_site_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "component_syncs_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "component_syncs_wordpress_site_id_fkey"
            columns: ["wordpress_site_id"]
            isOneToOne: false
            referencedRelation: "wordpress_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      components: {
        Row: {
          alignment: string | null
          category: string
          code: string
          columns: string | null
          created_at: string
          created_by: string | null
          description: string | null
          elements: string[] | null
          id: string
          json_code: string | null
          preview_image: string | null
          tags: string[] | null
          title: string
          type: string | null
          updated_at: string
          visibility: string
          wordpress_category_id: number | null
          wordpress_category_name: string | null
        }
        Insert: {
          alignment?: string | null
          category: string
          code: string
          columns?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          elements?: string[] | null
          id?: string
          json_code?: string | null
          preview_image?: string | null
          tags?: string[] | null
          title: string
          type?: string | null
          updated_at?: string
          visibility?: string
          wordpress_category_id?: number | null
          wordpress_category_name?: string | null
        }
        Update: {
          alignment?: string | null
          category?: string
          code?: string
          columns?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          elements?: string[] | null
          id?: string
          json_code?: string | null
          preview_image?: string | null
          tags?: string[] | null
          title?: string
          type?: string | null
          updated_at?: string
          visibility?: string
          wordpress_category_id?: number | null
          wordpress_category_name?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tools: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          image_url: string | null
          name: string
          url: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          image_url?: string | null
          name: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          image_url?: string | null
          name?: string
          url?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          device_info: string | null
          id: string
          ip_address: string | null
          is_active: boolean
          last_seen_at: string
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_seen_at?: string
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_seen_at?: string
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      wordpress_categories: {
        Row: {
          category_id: number
          created_at: string
          description: string | null
          id: string
          last_sync_at: string | null
          name: string
          post_count: number | null
          slug: string
          updated_at: string
          wordpress_site_id: string | null
        }
        Insert: {
          category_id: number
          created_at?: string
          description?: string | null
          id?: string
          last_sync_at?: string | null
          name: string
          post_count?: number | null
          slug: string
          updated_at?: string
          wordpress_site_id?: string | null
        }
        Update: {
          category_id?: number
          created_at?: string
          description?: string | null
          id?: string
          last_sync_at?: string | null
          name?: string
          post_count?: number | null
          slug?: string
          updated_at?: string
          wordpress_site_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wordpress_categories_wordpress_site_id_fkey"
            columns: ["wordpress_site_id"]
            isOneToOne: false
            referencedRelation: "wordpress_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      wordpress_sites: {
        Row: {
          api_key: string
          created_at: string
          elementor_active: boolean | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          site_name: string | null
          site_url: string
          updated_at: string
          user_id: string
          wordpress_version: string | null
        }
        Insert: {
          api_key: string
          created_at?: string
          elementor_active?: boolean | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          site_name?: string | null
          site_url: string
          updated_at?: string
          user_id: string
          wordpress_version?: string | null
        }
        Update: {
          api_key?: string
          created_at?: string
          elementor_active?: boolean | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          site_name?: string | null
          site_url?: string
          updated_at?: string
          user_id?: string
          wordpress_version?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_active_session: {
        Args: { uid: string; sid: string }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      refactor_categories_to_portuguese: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
