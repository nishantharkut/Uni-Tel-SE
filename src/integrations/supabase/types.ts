export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
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
          percentage?: number | null
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
          percentage?: number | null
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
          percentage?: number | null
          semester_id: string
          source_json_import?: boolean
          subject_name: string
          total_marks?: number
          updated_at?: string
          user_id: string
          weightage?: number
          weighted_percentage?: number | null
        }
        Update: {
          created_at?: string
          exam_date?: string | null
          exam_time?: string | null
          exam_type?: string
          id?: string
          obtained_marks?: number
          percentage?: number | null
          semester_id?: string
          source_json_import?: boolean
          subject_name?: string
          total_marks?: number
          updated_at?: string
          user_id?: string
          weightage?: number
          weighted_percentage?: number | null
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
          grade_points?: number | null
          id?: string
          is_audit?: boolean
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
          grade_points?: number | null
          id?: string
          is_audit?: boolean
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
          cgpa_target: number
          created_at: string
          exam_reminder_days: number
          grade_scale: string
          notifications: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          attendance_warning_threshold?: number
          cgpa_target?: number
          created_at?: string
          exam_reminder_days?: number
          grade_scale?: string
          notifications?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          attendance_warning_threshold?: number
          cgpa_target?: number
          created_at?: string
          exam_reminder_days?: number
          grade_scale?: string
          notifications?: Json
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
        Relationships: []
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
          error_count: number | null
          info_count: number | null
          latest_notification_at: string | null
          success_count: number | null
          total_notifications: number | null
          unread_count: number | null
          user_id: string | null
          warning_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      assessment_weightage_limit: {
        Args: { exam_type: string | null }
        Returns: number
      }
      clean_expired_notifications: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_orphaned_academic_data: {
        Args: Record<PropertyKey, never>
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
        Args: { p_semester_id: string; p_subject_name: string; p_user_id: string }
        Returns: number | null
      }
      get_unread_notifications_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_user_academic_summary: {
        Args: Record<PropertyKey, never>
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
      get_user_cgpa: {
        Args: { target_user_id: string }
        Returns: number | null
      }
      grade_to_points: {
        Args: { grade_letter: string | null }
        Returns: number | null
      }
      is_gpa_grade: {
        Args: { letter: string | null }
        Returns: boolean
      }
      mark_all_notifications_read: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      normalize_grade: {
        Args: { grade_letter: string | null }
        Returns: string | null
      }
      recalculate_semester_sgpa_for: {
        Args: { sem_id: string; usr_id: string }
        Returns: undefined
      }
      validate_academic_data_consistency: {
        Args: Record<PropertyKey, never>
        Returns: {
          issue_description: string
          issue_type: string
          record_id: string
          table_name: string
        }[]
      }
      validate_assessment_weightage: {
        Args: { exam_type: string | null; weightage: number | null }
        Returns: boolean
      }
      validate_grade_letter: {
        Args: { letter: string | null }
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
