// Matches supabase/migrations/0001_core_schema.sql, 0002_seed_divisions_districts.sql,
// 0003_seed_categories.sql, 0004_add_budget_priority_transport.sql.
// Once the Supabase CLI is linked to the project, this can be regenerated automatically with:
//   npx supabase gen types typescript --project-id xaummlewqjletagnuxhu > src/types/database.ts

export type PlaceStatus = 'wishlist' | 'planned' | 'visited' | 'revisited'
export type PlacePriority = 'p1_must_visit' | 'p2_high' | 'p3_normal' | 'p4_optional'
export type TransportMode =
  | 'train'
  | 'local_train'
  | 'bus'
  | 'local_bus'
  | 'launch_boat'
  | 'rickshaw_auto_cng'
  | 'mixed'

export interface Database {
  public: {
    Tables: {
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
      districts: {
        Row: {
          id: string
          division_id: string
          name_bn: string
          name_en: string
          slug: string
        }
        Insert: {
          id?: string
          division_id: string
          name_bn: string
          name_en: string
          slug: string
        }
        Update: {
          id?: string
          division_id?: string
          name_bn?: string
          name_en?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: 'districts_division_id_fkey'
            columns: ['division_id']
            referencedRelation: 'divisions'
            referencedColumns: ['id']
          },
        ]
      }
      categories: {
        Row: {
          id: string
          name_bn: string
          slug: string
          icon: string
          sort_order: number
        }
        Insert: {
          id?: string
          name_bn: string
          slug: string
          icon?: string
          sort_order?: number
        }
        Update: {
          id?: string
          name_bn?: string
          slug?: string
          icon?: string
          sort_order?: number
        }
        Relationships: []
      }
      places: {
        Row: {
          id: string
          user_id: string
          category_id: string
          district_id: string
          upazila_name: string | null
          union_village: string | null
          name: string
          description: string | null
          status: PlaceStatus
          photo_url: string | null
          google_maps_url: string | null
          personal_rating: number | null
          target_date: string | null
          estimated_cost: number | null
          priority: PlacePriority | null
          transport_mode: TransportMode | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          district_id: string
          upazila_name?: string | null
          union_village?: string | null
          name: string
          description?: string | null
          status?: PlaceStatus
          photo_url?: string | null
          google_maps_url?: string | null
          personal_rating?: number | null
          target_date?: string | null
          estimated_cost?: number | null
          priority?: PlacePriority | null
          transport_mode?: TransportMode | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          district_id?: string
          upazila_name?: string | null
          union_village?: string | null
          name?: string
          description?: string | null
          status?: PlaceStatus
          photo_url?: string | null
          google_maps_url?: string | null
          personal_rating?: number | null
          target_date?: string | null
          estimated_cost?: number | null
          priority?: PlacePriority | null
          transport_mode?: TransportMode | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'places_category_id_fkey'
            columns: ['category_id']
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'places_district_id_fkey'
            columns: ['district_id']
            referencedRelation: 'districts'
            referencedColumns: ['id']
          },
        ]
      }
      visits: {
        Row: {
          id: string
          place_id: string
          visit_date: string
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          place_id: string
          visit_date: string
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          place_id?: string
          visit_date?: string
          note?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'visits_place_id_fkey'
            columns: ['place_id']
            referencedRelation: 'places'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      place_status: PlaceStatus
    }
  }
}