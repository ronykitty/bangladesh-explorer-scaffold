export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          icon: string
          id: string
          is_active: boolean
          name_bn: string
          slug: string
          sort_order: number
        }
        Insert: {
          icon?: string
          id?: string
          is_active?: boolean
          name_bn: string
          slug: string
          sort_order?: number
        }
        Update: {
          icon?: string
          id?: string
          is_active?: boolean
          name_bn?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          place_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          place_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          place_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      districts: {
        Row: {
          division_id: string
          id: string
          name_bn: string
          name_en: string
          slug: string
        }
        Insert: {
          division_id: string
          id?: string
          name_bn: string
          name_en: string
          slug: string
        }
        Update: {
          division_id?: string
          id?: string
          name_bn?: string
          name_en?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "districts_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      divisions: {
        Row: {
          id: string
          name_bn: string
          name_en: string
          slug: string
          sort_order: number
        }
        Insert: {
          id?: string
          name_bn: string
          name_en: string
          slug: string
          sort_order?: number
        }
        Update: {
          id?: string
          name_bn?: string
          name_en?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      expense_categories: {
        Row: {
          icon: string
          id: string
          is_active: boolean
          name_bn: string
          name_en: string
          sort_order: number
        }
        Insert: {
          icon?: string
          id?: string
          is_active?: boolean
          name_bn: string
          name_en: string
          sort_order?: number
        }
        Update: {
          icon?: string
          id?: string
          is_active?: boolean
          name_bn?: string
          name_en?: string
          sort_order?: number
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          expense_category_id: string
          expense_date: string
          id: string
          note: string | null
          payment_method: string | null
          receipt_photo_url: string | null
          trip_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          expense_category_id: string
          expense_date: string
          id?: string
          note?: string | null
          payment_method?: string | null
          receipt_photo_url?: string | null
          trip_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          expense_category_id?: string
          expense_date?: string
          id?: string
          note?: string | null
          payment_method?: string | null
          receipt_photo_url?: string | null
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_expense_category_id_fkey"
            columns: ["expense_category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: Database["public"]["Enums"]["friendship_status"]
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_addressee_id_fkey"
            columns: ["addressee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          id: string
          place_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          place_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          place_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read_at: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      places: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          district_id: string
          estimated_cost: number | null
          google_maps_url: string | null
          id: string
          is_public: boolean
          name: string
          personal_rating: number | null
          photo_url: string | null
          priority: Database["public"]["Enums"]["place_priority"] | null
          status: Database["public"]["Enums"]["place_status"]
          target_date: string | null
          transport_mode: Database["public"]["Enums"]["transport_mode"] | null
          union_village: string | null
          upazila_id: string | null
          upazila_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          district_id: string
          estimated_cost?: number | null
          google_maps_url?: string | null
          id?: string
          is_public?: boolean
          name: string
          personal_rating?: number | null
          photo_url?: string | null
          priority?: Database["public"]["Enums"]["place_priority"] | null
          status?: Database["public"]["Enums"]["place_status"]
          target_date?: string | null
          transport_mode?: Database["public"]["Enums"]["transport_mode"] | null
          union_village?: string | null
          upazila_id?: string | null
          upazila_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          district_id?: string
          estimated_cost?: number | null
          google_maps_url?: string | null
          id?: string
          is_public?: boolean
          name?: string
          personal_rating?: number | null
          photo_url?: string | null
          priority?: Database["public"]["Enums"]["place_priority"] | null
          status?: Database["public"]["Enums"]["place_status"]
          target_date?: string | null
          transport_mode?: Database["public"]["Enums"]["transport_mode"] | null
          union_village?: string | null
          upazila_id?: string | null
          upazila_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "places_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "places_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "places_upazila_id_fkey"
            columns: ["upazila_id"]
            isOneToOne: false
            referencedRelation: "upazilas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      trip_places: {
        Row: {
          place_id: string
          trip_id: string
        }
        Insert: {
          place_id: string
          trip_id: string
        }
        Update: {
          place_id?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_places_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_places_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          created_at: string
          district_id: string | null
          division_id: string | null
          end_date: string | null
          id: string
          notes: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["trip_status"]
          title: string
          upazila_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          district_id?: string | null
          division_id?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["trip_status"]
          title: string
          upazila_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          district_id?: string | null
          division_id?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["trip_status"]
          title?: string
          upazila_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_upazila_id_fkey"
            columns: ["upazila_id"]
            isOneToOne: false
            referencedRelation: "upazilas"
            referencedColumns: ["id"]
          },
        ]
      }
      upazilas: {
        Row: {
          district_id: string
          id: string
          name_bn: string | null
          name_en: string
          slug: string
        }
        Insert: {
          district_id: string
          id?: string
          name_bn?: string | null
          name_en: string
          slug: string
        }
        Update: {
          district_id?: string
          id?: string
          name_bn?: string | null
          name_en?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "upazilas_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          created_at: string
          id: string
          note: string | null
          place_id: string
          visit_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          place_id: string
          visit_date: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          place_id?: string
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      friendship_status: "pending" | "accepted" | "declined" | "blocked"
      place_priority: "p1_must_visit" | "p2_high" | "p3_normal" | "p4_optional"
      place_status: "wishlist" | "planned" | "visited" | "revisited"
      transport_mode:
        | "train"
        | "local_train"
        | "bus"
        | "local_bus"
        | "launch_boat"
        | "rickshaw_auto_cng"
        | "mixed"
      trip_status:
        | "wishlist"
        | "planned"
        | "ongoing"
        | "completed"
        | "cancelled"
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
      friendship_status: ["pending", "accepted", "declined", "blocked"],
      place_priority: ["p1_must_visit", "p2_high", "p3_normal", "p4_optional"],
      place_status: ["wishlist", "planned", "visited", "revisited"],
      transport_mode: [
        "train",
        "local_train",
        "bus",
        "local_bus",
        "launch_boat",
        "rickshaw_auto_cng",
        "mixed",
      ],
      trip_status: ["wishlist", "planned", "ongoing", "completed", "cancelled"],
    },
  },
} as const

// --- App-level convenience types ---
export type Profile = Tables<'profiles'>
export type PlaceStatus = Enums<'place_status'>
export type PlacePriority = Enums<'place_priority'>
export type TransportMode = Enums<'transport_mode'>
export type TripStatus = Enums<'trip_status'>
export type Trip = Tables<'trips'>
export type CommentWithProfile = Tables<'comments'> & { profile: Profile }