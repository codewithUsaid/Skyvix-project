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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line: string
          area: string | null
          city: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean
          label: string | null
          phone: string
          postal_code: string | null
          province: string | null
          user_id: string
        }
        Insert: {
          address_line: string
          area?: string | null
          city: string
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean
          label?: string | null
          phone: string
          postal_code?: string | null
          province?: string | null
          user_id: string
        }
        Update: {
          address_line?: string
          area?: string | null
          city?: string
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean
          label?: string | null
          phone?: string
          postal_code?: string | null
          province?: string | null
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          image_url: string | null
          name: string
          parent_slug: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          name: string
          parent_slug?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          name?: string
          parent_slug?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      coupons: {
        Row: {
          category_slug: string | null
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_discount: number | null
          min_order: number
          usage_limit: number | null
          used_count: number
        }
        Insert: {
          category_slug?: string | null
          code: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_order?: number
          usage_limit?: number | null
          used_count?: number
        }
        Update: {
          category_slug?: string | null
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_order?: number
          usage_limit?: number | null
          used_count?: number
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          order_id: string
          product_id: string | null
          qty: number
          sku: string | null
          title: string
          unit_price: number
          variant_label: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          order_id: string
          product_id?: string | null
          qty: number
          sku?: string | null
          title: string
          unit_price: number
          variant_label?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          order_id?: string
          product_id?: string | null
          qty?: number
          sku?: string | null
          title?: string
          unit_price?: number
          variant_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_line: string
          area: string | null
          city: string
          coupon_code: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          delivery_fee: number
          delivery_method: string
          discount: number
          id: string
          notes: string | null
          order_number: string
          payment_method: string
          postal_code: string | null
          province: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          tracking_number: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address_line: string
          area?: string | null
          city: string
          coupon_code?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          delivery_fee?: number
          delivery_method?: string
          discount?: number
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string
          postal_code?: string | null
          province?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address_line?: string
          area?: string | null
          city?: string
          coupon_code?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_fee?: number
          delivery_method?: string
          discount?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string
          postal_code?: string | null
          province?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          badges: Json
          brand: string
          category_slug: string
          compatibility: string | null
          condition: Database["public"]["Enums"]["product_condition"]
          cost_price: number | null
          created_at: string
          description: string | null
          features: Json
          flash_sale_ends_at: string | null
          id: string
          images: Json
          is_active: boolean
          is_featured: boolean
          low_stock_level: number
          price: number
          rating: number
          review_count: number
          sale_price: number | null
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          sku: string | null
          slug: string
          sold_count: number
          specs: Json
          stock: number
          tags: Json
          title: string
          updated_at: string
          variants: Json
          warranty: string | null
          whats_included: Json
        }
        Insert: {
          badges?: Json
          brand?: string
          category_slug: string
          compatibility?: string | null
          condition?: Database["public"]["Enums"]["product_condition"]
          cost_price?: number | null
          created_at?: string
          description?: string | null
          features?: Json
          flash_sale_ends_at?: string | null
          id?: string
          images?: Json
          is_active?: boolean
          is_featured?: boolean
          low_stock_level?: number
          price: number
          rating?: number
          review_count?: number
          sale_price?: number | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          sku?: string | null
          slug: string
          sold_count?: number
          specs?: Json
          stock?: number
          tags?: Json
          title: string
          updated_at?: string
          variants?: Json
          warranty?: string | null
          whats_included?: Json
        }
        Update: {
          badges?: Json
          brand?: string
          category_slug?: string
          compatibility?: string | null
          condition?: Database["public"]["Enums"]["product_condition"]
          cost_price?: number | null
          created_at?: string
          description?: string | null
          features?: Json
          flash_sale_ends_at?: string | null
          id?: string
          images?: Json
          is_active?: boolean
          is_featured?: boolean
          low_stock_level?: number
          price?: number
          rating?: number
          review_count?: number
          sale_price?: number | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          sku?: string | null
          slug?: string
          sold_count?: number
          specs?: Json
          stock?: number
          tags?: Json
          title?: string
          updated_at?: string
          variants?: Json
          warranty?: string | null
          whats_included?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_name: string | null
          body: string | null
          created_at: string
          helpful_count: number
          id: string
          is_approved: boolean
          photos: Json
          product_id: string
          rating: number
          title: string | null
          user_id: string
          verified_purchase: boolean
        }
        Insert: {
          author_name?: string | null
          body?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          is_approved?: boolean
          photos?: Json
          product_id: string
          rating: number
          title?: string | null
          user_id: string
          verified_purchase?: boolean
        }
        Update: {
          author_name?: string | null
          body?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          is_approved?: boolean
          photos?: Json
          product_id?: string
          rating?: number
          title?: string | null
          user_id?: string
          verified_purchase?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          address: string
          currency: string
          delivery_fee: number
          email: string
          free_delivery_threshold: number
          id: number
          phone: string
          return_policy: string
          social_links: Json
          store_name: string
          tagline: string
          trust_badges: Json
          updated_at: string
          warranty_text: string
          whatsapp: string
          whatsapp_greeting: string
        }
        Insert: {
          address?: string
          currency?: string
          delivery_fee?: number
          email?: string
          free_delivery_threshold?: number
          id?: number
          phone?: string
          return_policy?: string
          social_links?: Json
          store_name?: string
          tagline?: string
          trust_badges?: Json
          updated_at?: string
          warranty_text?: string
          whatsapp?: string
          whatsapp_greeting?: string
        }
        Update: {
          address?: string
          currency?: string
          delivery_fee?: number
          email?: string
          free_delivery_threshold?: number
          id?: number
          phone?: string
          return_policy?: string
          social_links?: Json
          store_name?: string
          tagline?: string
          trust_badges?: Json
          updated_at?: string
          warranty_text?: string
          whatsapp?: string
          whatsapp_greeting?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist_items: {
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
            foreignKeyName: "wishlist_items_product_id_fkey"
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
      app_role: "admin" | "customer"
      order_status:
        | "placed"
        | "confirmed"
        | "processing"
        | "packed"
        | "shipped"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
      product_condition: "new" | "used" | "refurbished"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "customer"],
      order_status: [
        "placed",
        "confirmed",
        "processing",
        "packed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      product_condition: ["new", "used", "refurbished"],
    },
  },
} as const
