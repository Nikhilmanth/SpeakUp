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
      badges: {
        Row: {
          code: string
          description: string
          icon: string
          id: string
          title: string
        }
        Insert: {
          code: string
          description: string
          icon?: string
          id?: string
          title: string
        }
        Update: {
          code?: string
          description?: string
          icon?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string
          description: string
          id: string
          level: Database["public"]["Enums"]["course_level"]
          position: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          level: Database["public"]["Enums"]["course_level"]
          position?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          level?: Database["public"]["Enums"]["course_level"]
          position?: number
          title?: string
        }
        Relationships: []
      }
      daily_activity: {
        Row: {
          activity_date: string
          id: string
          minutes: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          activity_date: string
          id?: string
          minutes?: number
          user_id: string
          xp_earned?: number
        }
        Update: {
          activity_date?: string
          id?: string
          minutes?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string
          correct_count: number
          id: string
          lesson_id: string
          time_spent_seconds: number
          total_count: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          correct_count?: number
          id?: string
          lesson_id: string
          time_spent_seconds?: number
          total_count?: number
          user_id: string
        }
        Update: {
          completed_at?: string
          correct_count?: number
          id?: string
          lesson_id?: string
          time_spent_seconds?: number
          total_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          body_md: string
          est_minutes: number
          id: string
          module_id: string
          position: number
          title: string
          xp_reward: number
        }
        Insert: {
          body_md?: string
          est_minutes?: number
          id?: string
          module_id: string
          position?: number
          title: string
          xp_reward?: number
        }
        Update: {
          body_md?: string
          est_minutes?: number
          id?: string
          module_id?: string
          position?: number
          title?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          description: string
          id: string
          position: number
          title: string
        }
        Insert: {
          course_id: string
          description?: string
          id?: string
          position?: number
          title: string
        }
        Update: {
          course_id?: string
          description?: string
          id?: string
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          current_streak: number
          daily_goal_minutes: number
          display_name: string
          id: string
          last_active_date: string | null
          level: Database["public"]["Enums"]["course_level"]
          longest_streak: number
          onboarded: boolean
          updated_at: string
          xp: number
        }
        Insert: {
          created_at?: string
          current_streak?: number
          daily_goal_minutes?: number
          display_name?: string
          id: string
          last_active_date?: string | null
          level?: Database["public"]["Enums"]["course_level"]
          longest_streak?: number
          onboarded?: boolean
          updated_at?: string
          xp?: number
        }
        Update: {
          created_at?: string
          current_streak?: number
          daily_goal_minutes?: number
          display_name?: string
          id?: string
          last_active_date?: string | null
          level?: Database["public"]["Enums"]["course_level"]
          longest_streak?: number
          onboarded?: boolean
          updated_at?: string
          xp?: number
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_index: number
          explanation: string
          id: string
          lesson_id: string | null
          options: Json
          position: number
          prompt: string
          quiz_id: string | null
          topic_tag: string
        }
        Insert: {
          correct_index: number
          explanation?: string
          id?: string
          lesson_id?: string | null
          options: Json
          position?: number
          prompt: string
          quiz_id?: string | null
          topic_tag?: string
        }
        Update: {
          correct_index?: number
          explanation?: string
          id?: string
          lesson_id?: string | null
          options?: Json
          position?: number
          prompt?: string
          quiz_id?: string | null
          topic_tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          answers: Json
          finished_at: string | null
          id: string
          passed: boolean
          quiz_id: string
          score: number
          started_at: string
          total: number
          user_id: string
        }
        Insert: {
          answers?: Json
          finished_at?: string | null
          id?: string
          passed?: boolean
          quiz_id: string
          score?: number
          started_at?: string
          total?: number
          user_id: string
        }
        Update: {
          answers?: Json
          finished_at?: string | null
          id?: string
          passed?: boolean
          quiz_id?: string
          score?: number
          started_at?: string
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          id: string
          module_id: string
          pass_score: number
          question_count: number
          time_limit_seconds: number
          title: string
        }
        Insert: {
          id?: string
          module_id: string
          pass_score?: number
          question_count?: number
          time_limit_seconds?: number
          title: string
        }
        Update: {
          id?: string
          module_id?: string
          pass_score?: number
          question_count?: number
          time_limit_seconds?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          awarded_at: string
          badge_id: string
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_id: string
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "student"
      course_level: "beginner" | "intermediate" | "advanced"
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
      app_role: ["admin", "student"],
      course_level: ["beginner", "intermediate", "advanced"],
    },
  },
} as const
