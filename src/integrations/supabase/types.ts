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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_tool: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          import_batch_id: string | null
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          import_batch_id?: string | null
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          import_batch_id?: string | null
          name?: string
        }
        Relationships: []
      }
      company: {
        Row: {
          created_at: string
          id: string
          import_batch_id: string | null
          industry: string | null
          name: string
          region_id: string | null
          size: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          import_batch_id?: string | null
          industry?: string | null
          name: string
          region_id?: string | null
          size?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          import_batch_id?: string | null
          industry?: string | null
          name?: string
          region_id?: string | null
          size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "region"
            referencedColumns: ["id"]
          },
        ]
      }
      developers: {
        Row: {
          age: number | null
          country: string | null
          created_at: string
          education_level: string | null
          email: string | null
          id: string
          import_batch_id: string | null
          name: string | null
          region_id: string | null
          years_coding: number | null
        }
        Insert: {
          age?: number | null
          country?: string | null
          created_at?: string
          education_level?: string | null
          email?: string | null
          id?: string
          import_batch_id?: string | null
          name?: string | null
          region_id?: string | null
          years_coding?: number | null
        }
        Update: {
          age?: number | null
          country?: string | null
          created_at?: string
          education_level?: string | null
          email?: string | null
          id?: string
          import_batch_id?: string | null
          name?: string | null
          region_id?: string | null
          years_coding?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "developers_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "region"
            referencedColumns: ["id"]
          },
        ]
      }
      developers_tech: {
        Row: {
          created_at: string
          developer_id: string
          id: string
          import_batch_id: string | null
          proficiency: number | null
          technology_id: string
          years_used: number | null
        }
        Insert: {
          created_at?: string
          developer_id: string
          id?: string
          import_batch_id?: string | null
          proficiency?: number | null
          technology_id: string
          years_used?: number | null
        }
        Update: {
          created_at?: string
          developer_id?: string
          id?: string
          import_batch_id?: string | null
          proficiency?: number | null
          technology_id?: string
          years_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "developers_tech_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developer_technology_view"
            referencedColumns: ["developer_id"]
          },
          {
            foreignKeyName: "developers_tech_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "developers_tech_technology_id_fkey"
            columns: ["technology_id"]
            isOneToOne: false
            referencedRelation: "technology"
            referencedColumns: ["id"]
          },
        ]
      }
      newspaper_messages: {
        Row: {
          created_at: string
          display_name: string
          id: string
          message: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          id?: string
          message: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          message?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      raw_survey_data: {
        Row: {
          file_name: string | null
          id: string
          imported_at: string
          processed: boolean | null
          processed_at: string | null
          raw_json: Json
          record_count: number | null
        }
        Insert: {
          file_name?: string | null
          id?: string
          imported_at?: string
          processed?: boolean | null
          processed_at?: string | null
          raw_json: Json
          record_count?: number | null
        }
        Update: {
          file_name?: string | null
          id?: string
          imported_at?: string
          processed?: boolean | null
          processed_at?: string | null
          raw_json?: Json
          record_count?: number | null
        }
        Relationships: []
      }
      region: {
        Row: {
          continent: string | null
          created_at: string
          id: string
          import_batch_id: string | null
          name: string
        }
        Insert: {
          continent?: string | null
          created_at?: string
          id?: string
          import_batch_id?: string | null
          name: string
        }
        Update: {
          continent?: string | null
          created_at?: string
          id?: string
          import_batch_id?: string | null
          name?: string
        }
        Relationships: []
      }
      saved_technologies: {
        Row: {
          id: string
          saved_at: string
          technology_name: string
          user_id: string
        }
        Insert: {
          id?: string
          saved_at?: string
          technology_name: string
          user_id: string
        }
        Update: {
          id?: string
          saved_at?: string
          technology_name?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_trends: {
        Row: {
          id: string
          saved_at: string
          trend_category: string | null
          trend_name: string
          user_id: string
        }
        Insert: {
          id?: string
          saved_at?: string
          trend_category?: string | null
          trend_name: string
          user_id: string
        }
        Update: {
          id?: string
          saved_at?: string
          trend_category?: string | null
          trend_name?: string
          user_id?: string
        }
        Relationships: []
      }
      tech_category: {
        Row: {
          created_at: string
          description: string | null
          id: string
          import_batch_id: string | null
          name: string
          popularity_score: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          import_batch_id?: string | null
          name: string
          popularity_score?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          import_batch_id?: string | null
          name?: string
          popularity_score?: number | null
        }
        Relationships: []
      }
      technology: {
        Row: {
          category_id: string | null
          created_at: string
          id: string
          import_batch_id: string | null
          name: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: string
          import_batch_id?: string | null
          name: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: string
          import_batch_id?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "technology_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "tech_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technology_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "tech_category_insights"
            referencedColumns: ["category_id"]
          },
        ]
      }
      user_roadmap: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          priority: number | null
          status: string
          technology_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          priority?: number | null
          status?: string
          technology_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          priority?: number | null
          status?: string
          technology_name?: string
          user_id?: string
        }
        Relationships: []
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
      uses_ai: {
        Row: {
          adoption_score: number | null
          ai_tool_id: string
          created_at: string
          developer_id: string
          id: string
          import_batch_id: string | null
          sentiment: string | null
          use_case: string | null
        }
        Insert: {
          adoption_score?: number | null
          ai_tool_id: string
          created_at?: string
          developer_id: string
          id?: string
          import_batch_id?: string | null
          sentiment?: string | null
          use_case?: string | null
        }
        Update: {
          adoption_score?: number | null
          ai_tool_id?: string
          created_at?: string
          developer_id?: string
          id?: string
          import_batch_id?: string | null
          sentiment?: string | null
          use_case?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uses_ai_ai_tool_id_fkey"
            columns: ["ai_tool_id"]
            isOneToOne: false
            referencedRelation: "ai_tool"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uses_ai_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developer_technology_view"
            referencedColumns: ["developer_id"]
          },
          {
            foreignKeyName: "uses_ai_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
        ]
      }
      work_profile: {
        Row: {
          company_id: string | null
          created_at: string
          developer_id: string
          employment_type: string | null
          id: string
          import_batch_id: string | null
          job_role: string | null
          remote_work: string | null
          salary: number | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          developer_id: string
          employment_type?: string | null
          id?: string
          import_batch_id?: string | null
          job_role?: string | null
          remote_work?: string | null
          salary?: number | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          developer_id?: string
          employment_type?: string | null
          id?: string
          import_batch_id?: string | null
          job_role?: string | null
          remote_work?: string | null
          salary?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "work_profile_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_profile_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: true
            referencedRelation: "developer_technology_view"
            referencedColumns: ["developer_id"]
          },
          {
            foreignKeyName: "work_profile_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: true
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      ai_tool_usage_view: {
        Row: {
          adoption_score: number | null
          country: string | null
          developer_name: string | null
          job_role: string | null
          region_name: string | null
          sentiment: string | null
          tool_category: string | null
          tool_name: string | null
          use_case: string | null
        }
        Relationships: []
      }
      developer_technology_view: {
        Row: {
          category_name: string | null
          country: string | null
          developer_id: string | null
          developer_name: string | null
          job_role: string | null
          proficiency: number | null
          region_name: string | null
          salary: number | null
          technology_name: string | null
          years_used: number | null
        }
        Relationships: []
      }
      tech_category_insights: {
        Row: {
          avg_proficiency: number | null
          avg_years_used: number | null
          category_id: string | null
          category_name: string | null
          developer_count: number | null
          popularity_score: number | null
          technology_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      execute_readonly_query: { Args: { query_text: string }; Returns: Json }
      get_developers_top_technology: {
        Args: never
        Returns: {
          developer_id: string
          developer_name: string
          top_technology: string
          usage_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
