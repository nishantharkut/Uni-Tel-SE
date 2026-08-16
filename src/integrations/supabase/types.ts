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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      attendance_records: {
        Row: {
          attended_classes: number
          created_at: string
          id: string
          note: string | null
          percentage: number | null
          semester_id: string
          source_json_import: boolean
          subject_name: string
          total_classes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          attended_classes?: number
          created_at?: string
          id?: string
          note?: string | null
          percentage?: never
          semester_id: string
          source_json_import?: boolean
          subject_name: string
          total_classes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          attended_classes?: number
          created_at?: string
          id?: string
          note?: string | null
          percentage?: never
          semester_id?: string
          source_json_import?: boolean
          subject_name?: string
          total_classes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_semester_owner_fkey"
            columns: ["semester_id", "user_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      marks_records: {
        Row: {
          created_at: string
          exam_date: string | null
          exam_time: string | null
          exam_type: string
          id: string
          obtained_marks: number
          percentage: number | null
          semester_id: string
          source_json_import: boolean
          subject_name: string
          total_marks: number
          updated_at: string
          user_id: string
          weightage: number
          weighted_percentage: number | null
        }
        Insert: {
          created_at?: string
          exam_date?: string | null
          exam_time?: string | null
          exam_type: string
          id?: string
          obtained_marks?: number
          percentage?: never
          semester_id: string
          source_json_import?: boolean
          subject_name: string
          total_marks?: number
          updated_at?: string
          user_id: string
          weightage?: number
          weighted_percentage?: never
        }
        Update: {
          created_at?: string
          exam_date?: string | null
          exam_time?: string | null
          exam_type?: string
          id?: string
          obtained_marks?: number
          percentage?: never
          semester_id?: string
          source_json_import?: boolean
          subject_name?: string
          total_marks?: number
          updated_at?: string
          user_id?: string
          weightage?: number
          weighted_percentage?: never
        }
        Relationships: [
          {
            foreignKeyName: "marks_records_semester_owner_fkey"
            columns: ["semester_id", "user_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_text: string | null
          action_url: string | null
          created_at: string
          expires_at: string | null
          id: string
          message: string
          metadata: Json
          read: boolean
          source: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_text?: string | null
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          message: string
          metadata?: Json
          read?: boolean
          source?: string
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_text?: string | null
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          message?: string
          metadata?: Json
          read?: boolean
          source?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          college: string | null
          created_at: string
          email: string | null
          full_name: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          college?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          college?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      semesters: {
        Row: {
          created_at: string
          id: string
          number: number
          sgpa: number | null
          source_json_import: boolean
          total_credits: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          number: number
          sgpa?: number | null
          source_json_import?: boolean
          total_credits?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          number?: number
          sgpa?: number | null
          source_json_import?: boolean
          total_credits?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          created_at: string
          credits: number
          grade: string | null
          grade_points: number | null
          id: string
          is_audit: boolean
          is_backlog: boolean
          name: string
          semester_id: string
          source_json_import: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits: number
          grade?: string | null
          grade_points?: never
          id?: string
          is_audit?: boolean
          is_backlog?: never
          name: string
          semester_id: string
          source_json_import?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits?: number
          grade?: string | null
          grade_points?: never
          id?: string
          is_audit?: boolean
          is_backlog?: never
          name?: string
          semester_id?: string
          source_json_import?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_semester_owner_fkey"
            columns: ["semester_id", "user_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          attendance_warning_threshold: number
          attendance_warnings_enabled: boolean
          cgpa_target: number
          created_at: string
          data_health_alerts_enabled: boolean
          exam_reminder_days: number
          exam_reminders_enabled: boolean
          grade_scale: string
          grade_updates_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          attendance_warning_threshold?: number
          attendance_warnings_enabled?: boolean
          cgpa_target?: number
          created_at?: string
          data_health_alerts_enabled?: boolean
          exam_reminder_days?: number
          exam_reminders_enabled?: boolean
          grade_scale?: string
          grade_updates_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          attendance_warning_threshold?: number
          attendance_warnings_enabled?: boolean
          cgpa_target?: number
          created_at?: string
          data_health_alerts_enabled?: boolean
          exam_reminder_days?: number
          exam_reminders_enabled?: boolean
          grade_scale?: string
          grade_updates_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      subject_weighted_performance: {
        Row: {
          best_performance: number | null
          semester_id: string | null
          semester_number: number | null
          simple_average: number | null
          subject_name: string | null
          total_exams: number | null
          total_weight: number | null
          user_id: string | null
          weighted_average: number | null
          worst_performance: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marks_records_semester_owner_fkey"
            columns: ["semester_id", "user_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      user_custom_exam_types: {
        Row: {
          avg_performance: number | null
          avg_weightage: number | null
          exam_type: string | null
          max_weightage: number | null
          min_weightage: number | null
          usage_count: number | null
          user_id: string | null
        }
        Relationships: []
      }
      user_notification_summary: {
        Row: {
          latest_notification_at: string | null
          total_notifications: number | null
          unread_notifications: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      assessment_weightage_limit: {
        Args: { exam_type: string }
        Returns: number | null
      }
      cleanup_orphaned_academic_data: {
        Args: never
        Returns: {
          cleaned_table: string
          records_deleted: number
        }[]
      }
      get_semester_weighted_average: {
        Args: { p_semester_id: string; p_user_id: string }
        Returns: number | null
      }
      get_subject_weighted_average: {
        Args: {
          p_semester_id: string
          p_subject_name: string
          p_user_id: string
        }
        Returns: number
      }
      get_unread_notification_count: { Args: never; Returns: number }
      get_user_academic_summary: {
        Args: never
        Returns: {
          average_sgpa: number | null
          backlogs: number
          cgpa: number | null
          total_credits: number
          total_semesters: number
          total_subjects: number
          user_id: string
        }[]
      }
      get_user_cgpa: { Args: { target_user_id: string }; Returns: number | null }
      grade_to_points: { Args: { grade_letter: string }; Returns: number | null }
      is_gpa_grade: { Args: { letter: string }; Returns: boolean }
      mark_all_notifications_read: { Args: never; Returns: number }
      normalize_grade: { Args: { grade_letter: string }; Returns: string | null }
      recalculate_semester_sgpa_for: {
        Args: { sem_id: string; usr_id: string }
        Returns: undefined
      }
      validate_academic_data_consistency: {
        Args: never
        Returns: {
          issue_description: string
          issue_type: string
          record_id: string
          table_name: string
        }[]
      }
      validate_assessment_weightage: {
        Args: { exam_type: string; weightage: number }
        Returns: boolean
      }
      validate_grade_letter: { Args: { letter: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
