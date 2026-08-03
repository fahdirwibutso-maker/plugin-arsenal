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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
          user_id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          min_wholesale_qty: number | null
          pricing_type: string
          product_id: string
          product_image: string
          product_name: string
          product_price: number
          quantity: number
          size: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          min_wholesale_qty?: number | null
          pricing_type?: string
          product_id: string
          product_image: string
          product_name: string
          product_price: number
          quantity?: number
          size?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          min_wholesale_qty?: number | null
          pricing_type?: string
          product_id?: string
          product_image?: string
          product_name?: string
          product_price?: number
          quantity?: number
          size?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string
          expense_date: string
          id: string
          updated_at: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      hotel_staff: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string
          hire_date: string | null
          id: string
          is_active: boolean | null
          last_name: string
          phone: string | null
          role: Database["public"]["Enums"]["staff_role"]
          salary: number | null
          shift: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name: string
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          last_name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["staff_role"]
          salary?: number | null
          shift?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["staff_role"]
          salary?: number | null
          shift?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      hotel_staff_shifts: {
        Row: {
          available_rooms: number | null
          bar_sales: Json | null
          closed_at: string | null
          closing_balance: number
          completed_orders: number | null
          created_at: string | null
          expenses_notes: string | null
          expenses_total: number
          id: string
          kitchen_sales: Json | null
          occupied_rooms: number | null
          opened_at: string
          opening_balance: number
          pending_check_ins: number | null
          pending_orders: number | null
          product_usage: string | null
          revenue_billed: number | null
          revenue_pending: number | null
          shift_check_ins: number | null
          shift_check_outs: number | null
          shift_duration: string | null
          shift_notes: string | null
          staff_id: string | null
          total_bank: number
          total_card: number
          total_cash: number
          total_sales: number
          total_upi: number
          transfer_notes: string | null
          transfer_to_staff_id: string | null
          transferred_orders_count: number
          unpaid_details: string | null
          unpaid_total: number
          updated_at: string | null
        }
        Insert: {
          available_rooms?: number | null
          bar_sales?: Json | null
          closed_at?: string | null
          closing_balance?: number
          completed_orders?: number | null
          created_at?: string | null
          expenses_notes?: string | null
          expenses_total?: number
          id?: string
          kitchen_sales?: Json | null
          occupied_rooms?: number | null
          opened_at?: string
          opening_balance?: number
          pending_check_ins?: number | null
          pending_orders?: number | null
          product_usage?: string | null
          revenue_billed?: number | null
          revenue_pending?: number | null
          shift_check_ins?: number | null
          shift_check_outs?: number | null
          shift_duration?: string | null
          shift_notes?: string | null
          staff_id?: string | null
          total_bank?: number
          total_card?: number
          total_cash?: number
          total_sales?: number
          total_upi?: number
          transfer_notes?: string | null
          transfer_to_staff_id?: string | null
          transferred_orders_count?: number
          unpaid_details?: string | null
          unpaid_total?: number
          updated_at?: string | null
        }
        Update: {
          available_rooms?: number | null
          bar_sales?: Json | null
          closed_at?: string | null
          closing_balance?: number
          completed_orders?: number | null
          created_at?: string | null
          expenses_notes?: string | null
          expenses_total?: number
          id?: string
          kitchen_sales?: Json | null
          occupied_rooms?: number | null
          opened_at?: string
          opening_balance?: number
          pending_check_ins?: number | null
          pending_orders?: number | null
          product_usage?: string | null
          revenue_billed?: number | null
          revenue_pending?: number | null
          shift_check_ins?: number | null
          shift_check_outs?: number | null
          shift_duration?: string | null
          shift_notes?: string | null
          staff_id?: string | null
          total_bank?: number
          total_card?: number
          total_cash?: number
          total_sales?: number
          total_upi?: number
          transfer_notes?: string | null
          transfer_to_staff_id?: string | null
          transferred_orders_count?: number
          unpaid_details?: string | null
          unpaid_total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotel_staff_shifts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "hotel_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotel_staff_shifts_transfer_to_staff_id_fkey"
            columns: ["transfer_to_staff_id"]
            isOneToOne: false
            referencedRelation: "hotel_staff"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          pricing_type: string
          product_id: string | null
          product_image: string
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          pricing_type?: string
          product_id?: string | null
          product_image?: string
          product_name: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          pricing_type?: string
          product_id?: string | null
          product_image?: string
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
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
          created_at: string
          id: string
          notes: string | null
          order_type: string
          phone_number: string | null
          shipping_address: string | null
          status: string
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          order_type?: string
          phone_number?: string | null
          shipping_address?: string | null
          status?: string
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          order_type?: string
          phone_number?: string | null
          shipping_address?: string | null
          status?: string
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string
          order_id: string
          status: string
          transaction_ref: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method?: string
          order_id: string
          status?: string
          transaction_ref?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string
          order_id?: string
          status?: string
          transaction_ref?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image: string
          is_active: boolean
          is_hot: boolean | null
          min_wholesale_qty: number | null
          name: string
          price: number
          stock: number
          unit: string
          updated_at: string
          wholesale_price: number | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image?: string
          is_active?: boolean
          is_hot?: boolean | null
          min_wholesale_qty?: number | null
          name: string
          price: number
          stock?: number
          unit?: string
          updated_at?: string
          wholesale_price?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image?: string
          is_active?: boolean
          is_hot?: boolean | null
          min_wholesale_qty?: number | null
          name?: string
          price?: number
          stock?: number
          unit?: string
          updated_at?: string
          wholesale_price?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          is_wholesale: boolean
          phone_number: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_wholesale?: boolean
          phone_number: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          is_wholesale?: boolean
          phone_number?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      units: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      visitors: {
        Row: {
          id: string
          ip_address: string | null
          page: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
          visited_at: string
        }
        Insert: {
          id?: string
          ip_address?: string | null
          page: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          visited_at?: string
        }
        Update: {
          id?: string
          ip_address?: string | null
          page?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          visited_at?: string
        }
        Relationships: []
      }
      wholesale_applications: {
        Row: {
          admin_notes: string | null
          business_name: string
          business_type: string
          created_at: string
          id: string
          reason: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          business_name: string
          business_type?: string
          created_at?: string
          id?: string
          reason?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          business_name?: string
          business_type?: string
          created_at?: string
          id?: string
          reason?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wishlist: {
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
            foreignKeyName: "wishlist_product_id_fkey"
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
      get_admin_dashboard_stats: {
        Args: never
        Returns: {
          order_count: number
          product_count: number
          total_revenue: number
          user_count: number
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
      staff_role:
        | "manager"
        | "receptionist"
        | "housekeeping"
        | "security"
        | "maintenance"
        | "waiter"
        | "chef"
        | "barman"
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
      staff_role: [
        "manager",
        "receptionist",
        "housekeeping",
        "security",
        "maintenance",
        "waiter",
        "chef",
        "barman",
      ],
    },
  },
} as const
