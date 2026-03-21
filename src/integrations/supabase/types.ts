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
      auth_logs: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          user_email: string
        }
        Insert: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          user_email?: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          user_email?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          content_al: string
          content_en: string
          created_at: string
          excerpt_al: string
          excerpt_en: string
          id: string
          image: string
          published: boolean
          slug: string
          sort_order: number
          title_al: string
          title_en: string
          updated_at: string
        }
        Insert: {
          author?: string
          content_al?: string
          content_en?: string
          created_at?: string
          excerpt_al?: string
          excerpt_en?: string
          id?: string
          image?: string
          published?: boolean
          slug: string
          sort_order?: number
          title_al?: string
          title_en?: string
          updated_at?: string
        }
        Update: {
          author?: string
          content_al?: string
          content_en?: string
          created_at?: string
          excerpt_al?: string
          excerpt_en?: string
          id?: string
          image?: string
          published?: boolean
          slug?: string
          sort_order?: number
          title_al?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      collections: {
        Row: {
          created_at: string
          description_al: string
          description_en: string
          id: string
          image_url: string | null
          parent_id: string | null
          slug: string
          sort_order: number
          title_al: string
          title_en: string
          updated_at: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          description_al?: string
          description_en?: string
          id?: string
          image_url?: string | null
          parent_id?: string | null
          slug: string
          sort_order?: number
          title_al?: string
          title_en?: string
          updated_at?: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          description_al?: string
          description_en?: string
          id?: string
          image_url?: string | null
          parent_id?: string | null
          slug?: string
          sort_order?: number
          title_al?: string
          title_en?: string
          updated_at?: string
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "collections_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      design_settings: {
        Row: {
          created_at: string
          id: string
          label: string
          setting_group: string
          setting_key: string
          setting_type: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string
          setting_group?: string
          setting_key: string
          setting_type?: string
          setting_value?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          setting_group?: string
          setting_key?: string
          setting_type?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      managed_logos: {
        Row: {
          category: string
          created_at: string
          id: string
          logo_url: string | null
          name: string
          sort_order: number
          updated_at: string
          visible: boolean
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          sort_order?: number
          updated_at?: string
          visible?: boolean
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          sort_order?: number
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      nav_menus: {
        Row: {
          created_at: string
          href: string
          id: string
          label: string
          location: string
          sort_order: number
          updated_at: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          href?: string
          id?: string
          label: string
          location: string
          sort_order?: number
          updated_at?: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          href?: string
          id?: string
          label?: string
          location?: string
          sort_order?: number
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      page_slugs: {
        Row: {
          created_at: string
          id: string
          page_key: string
          slug_al: string
          slug_en: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          page_key: string
          slug_al: string
          slug_en: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          page_key?: string
          slug_al?: string
          slug_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_colors: {
        Row: {
          color_hex: string
          color_name: string
          color_name_al: string
          color_name_en: string
          created_at: string
          id: string
          product_id: string
          sort_order: number
        }
        Insert: {
          color_hex?: string
          color_name?: string
          color_name_al?: string
          color_name_en?: string
          created_at?: string
          id?: string
          product_id: string
          sort_order?: number
        }
        Update: {
          color_hex?: string
          color_name?: string
          color_name_al?: string
          color_name_en?: string
          created_at?: string
          id?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_colors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          product_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string
          product_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_sizes: {
        Row: {
          created_at: string
          id: string
          product_id: string
          size_label: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          size_label?: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          size_label?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_sizes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          box_quantity: number | null
          code: string | null
          collection_id: string
          color: string | null
          color_hex: string | null
          composition_al: string | null
          composition_en: string | null
          created_at: string
          customizable: boolean
          description_al: string
          description_en: string
          dimensions_al: string | null
          dimensions_en: string | null
          id: string
          image_url: string | null
          in_stock: boolean
          pieces_per_box: number | null
          product_info_al: string | null
          product_info_en: string | null
          return_policy_al: string | null
          return_policy_en: string | null
          sort_order: number
          tech_specs_al: string | null
          tech_specs_en: string | null
          title_al: string
          title_en: string
          updated_at: string
          visible: boolean
          weight_gsm: number | null
        }
        Insert: {
          box_quantity?: number | null
          code?: string | null
          collection_id: string
          color?: string | null
          color_hex?: string | null
          composition_al?: string | null
          composition_en?: string | null
          created_at?: string
          customizable?: boolean
          description_al?: string
          description_en?: string
          dimensions_al?: string | null
          dimensions_en?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          pieces_per_box?: number | null
          product_info_al?: string | null
          product_info_en?: string | null
          return_policy_al?: string | null
          return_policy_en?: string | null
          sort_order?: number
          tech_specs_al?: string | null
          tech_specs_en?: string | null
          title_al?: string
          title_en?: string
          updated_at?: string
          visible?: boolean
          weight_gsm?: number | null
        }
        Update: {
          box_quantity?: number | null
          code?: string | null
          collection_id?: string
          color?: string | null
          color_hex?: string | null
          composition_al?: string | null
          composition_en?: string | null
          created_at?: string
          customizable?: boolean
          description_al?: string
          description_en?: string
          dimensions_al?: string | null
          dimensions_en?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          pieces_per_box?: number | null
          product_info_al?: string | null
          product_info_en?: string | null
          return_policy_al?: string | null
          return_policy_en?: string | null
          sort_order?: number
          tech_specs_al?: string | null
          tech_specs_en?: string | null
          title_al?: string
          title_en?: string
          updated_at?: string
          visible?: boolean
          weight_gsm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_name: string
          city: string
          country: string
          created_at: string
          full_name: string
          id: string
          phone: string
          updated_at: string
        }
        Insert: {
          business_name?: string
          city?: string
          country?: string
          created_at?: string
          full_name?: string
          id: string
          phone?: string
          updated_at?: string
        }
        Update: {
          business_name?: string
          city?: string
          country?: string
          created_at?: string
          full_name?: string
          id?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      registration_fields: {
        Row: {
          created_at: string
          field_key: string
          field_type: string
          icon: string
          id: string
          label: string
          placeholder: string
          required: boolean
          sort_order: number
          updated_at: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          field_key: string
          field_type?: string
          icon?: string
          id?: string
          label: string
          placeholder?: string
          required?: boolean
          sort_order?: number
          updated_at?: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          field_key?: string
          field_type?: string
          icon?: string
          id?: string
          label?: string
          placeholder?: string
          required?: boolean
          sort_order?: number
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      registrations: {
        Row: {
          created_at: string
          data: Json
          id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
        }
        Relationships: []
      }
      seo_metadata: {
        Row: {
          created_at: string
          id: string
          lang: string
          meta_description: string | null
          meta_title: string | null
          og_image: string | null
          page: string
          seo_keywords: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lang?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          page: string
          seo_keywords?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lang?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          page?: string
          seo_keywords?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content_type: string
          created_at: string
          field_key: string
          id: string
          lang: string
          metadata: Json | null
          page: string
          section_key: string
          sort_order: number
          updated_at: string
          value: string | null
        }
        Insert: {
          content_type?: string
          created_at?: string
          field_key: string
          id?: string
          lang?: string
          metadata?: Json | null
          page: string
          section_key: string
          sort_order?: number
          updated_at?: string
          value?: string | null
        }
        Update: {
          content_type?: string
          created_at?: string
          field_key?: string
          id?: string
          lang?: string
          metadata?: Json | null
          page?: string
          section_key?: string
          sort_order?: number
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      site_sections: {
        Row: {
          created_at: string
          id: string
          page: string
          section_key: string
          sort_order: number
          updated_at: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          page: string
          section_key: string
          sort_order?: number
          updated_at?: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          page?: string
          section_key?: string
          sort_order?: number
          updated_at?: string
          visible?: boolean
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
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
