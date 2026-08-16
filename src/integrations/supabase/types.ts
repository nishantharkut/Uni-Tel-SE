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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      attendance_records: {
        Row: {
          attended_classes: number | null
          created_at: string | null
          id: string
          note: string | null
          percentage: number | null
          semester_id: string
          source_json_import: boolean | null
          subject_name: string
          total_classes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attended_classes?: number | null
          created_at?: string | null
          id?: string
          note?: string | null
          percentage?: number | null
          semester_id: string
          source_json_import?: boolean | null
          subject_name: string
          total_classes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attended_classes?: number | null
          created_at?: string | null
          id?: string
          note?: string | null
          percentage?: number | null
          semester_id?: string
          source_json_import?: boolean | null
          subject_name?: string
          total_classes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
        ]
      }
      marks_records: {
        Row: {
          created_at: string | null
          exam_type: string
          id: string
          obtained_marks: number
          percentage: number | null
          semester_id: string
          source_json_import: boolean | null
          subject_name: string
          total_marks: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          exam_type: string
          id?: string
          obtained_marks: number
          percentage?: number | null
          semester_id: string
          source_json_import?: boolean | null
          subject_name: string
          total_marks: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          exam_type?: string
          id?: string
          obtained_marks?: number
          percentage?: number | null
          semester_id?: string
          source_json_import?: boolean | null
          subject_name?: string
          total_marks?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marks_records_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          college: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          college?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          college?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      semesters: {
        Row: {
          created_at: string | null
          id: string
          number: number
          sgpa: number | null
          source_json_import: boolean | null
          total_credits: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          number: number
          sgpa?: number | null
          source_json_import?: boolean | null
          total_credits?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          number?: number
          sgpa?: number | null
          source_json_import?: boolean | null
          total_credits?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          created_at: string | null
          credits: number
          grade: string | null
          grade_points: number | null
          id: string
          name: string
          semester_id: string
          source_json_import: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits: number
          grade?: string | null
          grade_points?: number | null
          id?: string
          name: string
          semester_id: string
          source_json_import?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits?: number
          grade?: string | null
          grade_points?: number | null
          id?: string
          name?: string
          semester_id?: string
          source_json_import?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_academic_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          average_sgpa: number
          backlogs: number
          cgpa: number
          total_credits: number
          total_semesters: number
          total_subjects: number
          user_id: string
        }[]
      }
      get_user_cgpa: {
        Args: { target_user_id: string }
        Returns: number
      }
      grade_to_points: {
        Args: { grade_letter: string }
        Returns: number
      }
      recalculate_semester_sgpa_for: {
        Args: { sem_id: string; usr_id: string }
        Returns: undefined
      }
      validate_grade_letter: {
        Args: { letter: string }
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

export const Constants = {
  public: {
    Enums: {},
  },
} as const
