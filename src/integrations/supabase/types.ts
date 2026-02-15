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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      asset_unlock_conditions: {
        Row: {
          asset_id: string
          condition_type: Database["public"]["Enums"]["unlock_condition_type"]
          condition_value: Json
          created_at: string
          id: string
        }
        Insert: {
          asset_id: string
          condition_type: Database["public"]["Enums"]["unlock_condition_type"]
          condition_value?: Json
          created_at?: string
          id?: string
        }
        Update: {
          asset_id?: string
          condition_type?: Database["public"]["Enums"]["unlock_condition_type"]
          condition_value?: Json
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_unlock_conditions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_unlock_status: {
        Row: {
          asset_id: string
          created_at: string
          id: string
          unlock_reason: string | null
          unlocked_at: string
        }
        Insert: {
          asset_id: string
          created_at?: string
          id?: string
          unlock_reason?: string | null
          unlocked_at?: string
        }
        Update: {
          asset_id?: string
          created_at?: string
          id?: string
          unlock_reason?: string | null
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_unlock_status_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: true
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          category: Database["public"]["Enums"]["asset_category"]
          content: string | null
          created_at: string
          file_path: string | null
          id: string
          name: string | null
          type: Database["public"]["Enums"]["asset_type"]
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["asset_category"]
          content?: string | null
          created_at?: string
          file_path?: string | null
          id?: string
          name?: string | null
          type: Database["public"]["Enums"]["asset_type"]
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["asset_category"]
          content?: string | null
          created_at?: string
          file_path?: string | null
          id?: string
          name?: string | null
          type?: Database["public"]["Enums"]["asset_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_checkins: {
        Row: {
          created_at: string
          daily_achievement: string | null
          date: string
          discipline_breach: boolean
          failure_note: string | null
          focus_pillar: string | null
          id: string
          is_missed: boolean
          selected_pillars: Json | null
          submitted_at: string | null
          total_score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_achievement?: string | null
          date: string
          discipline_breach?: boolean
          failure_note?: string | null
          focus_pillar?: string | null
          id?: string
          is_missed?: boolean
          selected_pillars?: Json | null
          submitted_at?: string | null
          total_score?: number
          user_id: string
        }
        Update: {
          created_at?: string
          daily_achievement?: string | null
          date?: string
          discipline_breach?: boolean
          failure_note?: string | null
          focus_pillar?: string | null
          id?: string
          is_missed?: boolean
          selected_pillars?: Json | null
          submitted_at?: string | null
          total_score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_rule_evaluations: {
        Row: {
          created_at: string
          daily_checkin_id: string
          id: string
          numeric_value: number | null
          rule_id: string
          score_contribution: number
          value: boolean
        }
        Insert: {
          created_at?: string
          daily_checkin_id: string
          id?: string
          numeric_value?: number | null
          rule_id: string
          score_contribution?: number
          value?: boolean
        }
        Update: {
          created_at?: string
          daily_checkin_id?: string
          id?: string
          numeric_value?: number | null
          rule_id?: string
          score_contribution?: number
          value?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "daily_rule_evaluations_daily_checkin_id_fkey"
            columns: ["daily_checkin_id"]
            isOneToOne: false
            referencedRelation: "daily_checkins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_rule_evaluations_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "daily_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_rules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          sort_order: number
          title: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title: string
          user_id: string
          weight?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title?: string
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_rules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      failed_items: {
        Row: {
          created_at: string
          daily_checkin_id: string
          id: string
          points_lost: number
          question_text: string
          section: string
          severity: string
        }
        Insert: {
          created_at?: string
          daily_checkin_id: string
          id?: string
          points_lost?: number
          question_text: string
          section: string
          severity?: string
        }
        Update: {
          created_at?: string
          daily_checkin_id?: string
          id?: string
          points_lost?: number
          question_text?: string
          section?: string
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "failed_items_daily_checkin_id_fkey"
            columns: ["daily_checkin_id"]
            isOneToOne: false
            referencedRelation: "daily_checkins"
            referencedColumns: ["id"]
          },
        ]
      }
      failure_logs: {
        Row: {
          created_at: string
          date: string
          id: string
          note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          note?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          note?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "failure_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      floor_days: {
        Row: {
          actions: Json
          created_at: string
          day_number: number
          id: string
          intent: string
          rules: string | null
          title: string
          unlock_text: string | null
          week_id: string
        }
        Insert: {
          actions?: Json
          created_at?: string
          day_number: number
          id?: string
          intent: string
          rules?: string | null
          title: string
          unlock_text?: string | null
          week_id: string
        }
        Update: {
          actions?: Json
          created_at?: string
          day_number?: number
          id?: string
          intent?: string
          rules?: string | null
          title?: string
          unlock_text?: string | null
          week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "floor_days_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "floor_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      floor_timers: {
        Row: {
          auto_started: boolean | null
          created_at: string
          day_id: string
          ends_at: string
          id: string
          is_active: boolean
          started_at: string
          stopped_at: string | null
          user_id: string
        }
        Insert: {
          auto_started?: boolean | null
          created_at?: string
          day_id: string
          ends_at: string
          id?: string
          is_active?: boolean
          started_at?: string
          stopped_at?: string | null
          user_id: string
        }
        Update: {
          auto_started?: boolean | null
          created_at?: string
          day_id?: string
          ends_at?: string
          id?: string
          is_active?: boolean
          started_at?: string
          stopped_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "floor_timers_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "floor_days"
            referencedColumns: ["id"]
          },
        ]
      }
      floor_weeks: {
        Row: {
          created_at: string
          focus_split: string | null
          id: string
          objective: string
          success_condition: string | null
          user_id: string
          week_number: number
        }
        Insert: {
          created_at?: string
          focus_split?: string | null
          id?: string
          objective: string
          success_condition?: string | null
          user_id: string
          week_number: number
        }
        Update: {
          created_at?: string
          focus_split?: string | null
          id?: string
          objective?: string
          success_condition?: string | null
          user_id?: string
          week_number?: number
        }
        Relationships: []
      }
      notification_config: {
        Row: {
          created_at: string
          id: string
          key: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          value?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          last_login_at: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          last_login_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          last_login_at?: string | null
        }
        Relationships: []
      }
      punishments: {
        Row: {
          created_at: string
          daily_checkin_id: string
          date: string
          failed_questions: Json
          id: string
          is_resolved: boolean
          proof_commitment: string | null
          proof_feeling: string | null
          proof_submitted_at: string | null
          punishment_index: number
          punishment_text: string
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_checkin_id: string
          date: string
          failed_questions?: Json
          id?: string
          is_resolved?: boolean
          proof_commitment?: string | null
          proof_feeling?: string | null
          proof_submitted_at?: string | null
          punishment_index: number
          punishment_text: string
          score: number
          user_id: string
        }
        Update: {
          created_at?: string
          daily_checkin_id?: string
          date?: string
          failed_questions?: Json
          id?: string
          is_resolved?: boolean
          proof_commitment?: string | null
          proof_feeling?: string | null
          proof_submitted_at?: string | null
          punishment_index?: number
          punishment_text?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "punishments_daily_checkin_id_fkey"
            columns: ["daily_checkin_id"]
            isOneToOne: false
            referencedRelation: "daily_checkins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "punishments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      streaks: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean
          start_date: string
          streak_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          start_date: string
          streak_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          start_date?: string
          streak_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_time: {
        Row: {
          created_at: string
          id: string
          last_tick_at: string
          system_end_date: string
          system_start_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_tick_at?: string
          system_end_date?: string
          system_start_date?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_tick_at?: string
          system_end_date?: string
          system_start_date?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_checkin_score: {
        Args: { _checkin_id: string }
        Returns: number
      }
      check_asset_unlock: { Args: { _asset_id: string }; Returns: boolean }
      get_average_score: {
        Args: { _days?: number; _user_id: string }
        Returns: number
      }
      get_current_streak: { Args: { _user_id: string }; Returns: number }
      owns_asset: { Args: { _asset_id: string }; Returns: boolean }
      owns_checkin: { Args: { _checkin_id: string }; Returns: boolean }
    }
    Enums: {
      asset_category: "past" | "future" | "dream" | "reward" | "legacy"
      asset_type: "image" | "audio" | "message" | "video"
      unlock_condition_type: "score" | "streak" | "date" | "manual"
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
      asset_category: ["past", "future", "dream", "reward", "legacy"],
      asset_type: ["image", "audio", "message", "video"],
      unlock_condition_type: ["score", "streak", "date", "manual"],
    },
  },
} as const
