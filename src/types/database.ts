// Matches supabase/migrations/0001_core_schema.sql, 0002_seed_divisions_districts.sql,
// 0003_seed_categories.sql, 0004_add_budget_priority_transport.sql,
// and the Phase 2 tables (upazilas, trips, expenses, expense_categories,
// trip_places) confirmed live on project xaummlewqjletagnuxhu as of 2026-08-09.
// ⚠️ No migration file exists yet in this repo for the Phase 2 tables — they
// were created directly against the DB in an earlier session. If you use
// `supabase db diff` / migration-based workflows, pull a migration for them
// before your next deploy so the migration history stays in sync with the DB.
//
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
// trips.status is a plain text column with a CHECK constraint (not a
// Postgres enum type), so it isn't listed under Enums below — but the
// union type is still useful at the TypeScript level.
export type TripStatus = 'wishlist' | 'planned' | 'ongoing' | 'completed' | 'cancelled'

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
      upazilas: {
        Row: {
          id: string
          district_id: string
          name_en: string
          name_bn: string | null
          slug: string
        }
        Insert: {
          id?: string
          district_id: string
          name_en: string
          name_bn?: string | null
          slug: string
        }
        Update: {
          id?: string
          district_id?: string
          name_en?: string
          name_bn?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: 'upazilas_district_id_fkey'
            columns: ['district_id']
            referencedRelation: 'districts'
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
          upazila_id: string | null
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
          upazila_id?: string | null
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
          upazila_id?: string | null
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
          {
            foreignKeyName: 'places_upazila_id_fkey'
            columns: ['upazila_id']
            referencedRelation: 'upazilas'
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
      expense_categories: {
        Row: {
          id: string
          name_bn: string
          name_en: string
          icon: string
          sort_order: number
          is_active: boolean
        }
        Insert: {
          id?: string
          name_bn: string
          name_en: string
          icon?: string
          sort_order?: number
          is_active?: boolean
        }
        Update: {
          id?: string
          name_bn?: string
          name_en?: string
          icon?: string
          sort_order?: number
          is_active?: boolean
        }
        Relationships: []
      }
      trips: {
        Row: {
          id: string
          user_id: string
          title: string
          status: TripStatus
          start_date: string | null
          end_date: string | null
          division_id: string | null
          district_id: string | null
          upazila_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          status?: TripStatus
          start_date?: string | null
          end_date?: string | null
          division_id?: string | null
          district_id?: string | null
          upazila_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          status?: TripStatus
          start_date?: string | null
          end_date?: string | null
          division_id?: string | null
          district_id?: string | null
          upazila_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'trips_division_id_fkey'
            columns: ['division_id']
            referencedRelation: 'divisions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'trips_district_id_fkey'
            columns: ['district_id']
            referencedRelation: 'districts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'trips_upazila_id_fkey'
            columns: ['upazila_id']
            referencedRelation: 'upazilas'
            referencedColumns: ['id']
          },
        ]
      }
      expenses: {
        Row: {
          id: string
          trip_id: string
          expense_category_id: string
          expense_date: string
          amount: number
          description: string | null
          payment_method: string | null
          note: string | null
          receipt_photo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          expense_category_id: string
          expense_date: string
          amount: number
          description?: string | null
          payment_method?: string | null
          note?: string | null
          receipt_photo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          expense_category_id?: string
          expense_date?: string
          amount?: number
          description?: string | null
          payment_method?: string | null
          note?: string | null
          receipt_photo_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'expenses_trip_id_fkey'
            columns: ['trip_id']
            referencedRelation: 'trips'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'expenses_expense_category_id_fkey'
            columns: ['expense_category_id']
            referencedRelation: 'expense_categories'
            referencedColumns: ['id']
          },
        ]
      }
      trip_places: {
        Row: {
          trip_id: string
          place_id: string
        }
        Insert: {
          trip_id: string
          place_id: string
        }
        Update: {
          trip_id?: string
          place_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'trip_places_trip_id_fkey'
            columns: ['trip_id']
            referencedRelation: 'trips'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'trip_places_place_id_fkey'
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