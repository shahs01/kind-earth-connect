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
      audit_logs: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string | null
          details: Json | null
          id: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string
          subscribe: boolean | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject: string
          subscribe?: boolean | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
          subscribe?: boolean | null
        }
        Relationships: []
      }
      covered_locations: {
        Row: {
          city_name: string
          coordinates: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          post_count: number | null
          region: string
          updated_at: string
          user_count: number | null
        }
        Insert: {
          city_name: string
          coordinates?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          post_count?: number | null
          region: string
          updated_at?: string
          user_count?: number | null
        }
        Update: {
          city_name?: string
          coordinates?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          post_count?: number | null
          region?: string
          updated_at?: string
          user_count?: number | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      help_interactions: {
        Row: {
          conversation_id: string | null
          created_at: string
          helped_by_id: string
          helper_id: string
          id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          helped_by_id: string
          helper_id: string
          id?: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          helped_by_id?: string
          helper_id?: string
          id?: string
        }
        Relationships: []
      }
      impact_metrics: {
        Row: {
          description: string | null
          display_name: string
          id: string
          metric_key: string
          metric_value: number
          updated_at: string
        }
        Insert: {
          description?: string | null
          display_name: string
          id?: string
          metric_key: string
          metric_value?: number
          updated_at?: string
        }
        Update: {
          description?: string | null
          display_name?: string
          id?: string
          metric_key?: string
          metric_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      impact_photos: {
        Row: {
          alt_text: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          order_position: number | null
          photo_url: string
          title: string
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          order_position?: number | null
          photo_url: string
          title: string
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          order_position?: number | null
          photo_url?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      nonprofits: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string
          email: string | null
          id: string
          location: string
          logo: string | null
          name: string
          phone_number: string | null
          status: string | null
          updated_at: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description: string
          email?: string | null
          id?: string
          location: string
          logo?: string | null
          name: string
          phone_number?: string | null
          status?: string | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          email?: string | null
          id?: string
          location?: string
          logo?: string | null
          name?: string
          phone_number?: string | null
          status?: string | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean | null
          related_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean | null
          related_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean | null
          related_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          availability: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          location: string | null
          photos: string[] | null
          status: string | null
          timeframe: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          availability?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          photos?: string[] | null
          status?: string | null
          timeframe?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          availability?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          photos?: string[] | null
          status?: string | null
          timeframe?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string | null
          avatar: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          help_offered: number | null
          help_received: number | null
          id: string
          location: string | null
          name: string | null
          trust_badges: string[] | null
          trust_score: number | null
          username: string | null
          verified_status: boolean | null
          volunteer_hours: number | null
        }
        Insert: {
          account_status?: string | null
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          help_offered?: number | null
          help_received?: number | null
          id: string
          location?: string | null
          name?: string | null
          trust_badges?: string[] | null
          trust_score?: number | null
          username?: string | null
          verified_status?: boolean | null
          volunteer_hours?: number | null
        }
        Update: {
          account_status?: string | null
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          help_offered?: number | null
          help_received?: number | null
          id?: string
          location?: string | null
          name?: string | null
          trust_badges?: string[] | null
          trust_score?: number | null
          username?: string | null
          verified_status?: boolean | null
          volunteer_hours?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string | null
          from_user_avatar: string | null
          from_user_id: string
          from_user_name: string
          id: string
          rating: number
          text: string | null
          to_user_id: string
        }
        Insert: {
          created_at?: string | null
          from_user_avatar?: string | null
          from_user_id: string
          from_user_name: string
          id?: string
          rating: number
          text?: string | null
          to_user_id: string
        }
        Update: {
          created_at?: string | null
          from_user_avatar?: string | null
          from_user_id?: string
          from_user_name?: string
          id?: string
          rating?: number
          text?: string | null
          to_user_id?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content: string | null
          id: string
          section_key: string
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: string | null
          id?: string
          section_key: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: string | null
          id?: string
          section_key?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          linkedin_url: string | null
          name: string
          order_position: number | null
          photo_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          linkedin_url?: string | null
          name: string
          order_position?: number | null
          photo_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          linkedin_url?: string | null
          name?: string
          order_position?: number | null
          photo_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_conversation_states: {
        Row: {
          created_at: string
          id: string
          is_archived: boolean
          is_deleted: boolean
          last_message_read_at: string | null
          other_user_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_archived?: boolean
          is_deleted?: boolean
          last_message_read_at?: string | null
          other_user_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_archived?: boolean
          is_deleted?: boolean
          last_message_read_at?: string | null
          other_user_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          device_info: Json | null
          expires_at: string
          id: string
          refresh_token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          expires_at: string
          id?: string
          refresh_token: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          expires_at?: string
          id?: string
          refresh_token?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_conversations: {
        Args: Record<PropertyKey, never>
        Returns: {
          other_user_id: string
          last_message_at: string
        }[]
      }
      get_platform_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          action_text: string
          target_type_param: string
          target_id_param?: string
          details_param?: Json
        }
        Returns: undefined
      }
      update_impact_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      user_role: "user" | "admin"
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
    Enums: {
      user_role: ["user", "admin"],
    },
  },
} as const
