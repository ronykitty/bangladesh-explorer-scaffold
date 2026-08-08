/**
 * Phase 2 type additions — trips, expenses, expense_categories, trip_places
 *
 * Verified directly against the live Supabase schema on project
 * "bangladesh-explorer" (xaummlewqjletagnuxhu) on 2026-08-09.
 * No new tables were created — this only adds types for tables that
 * already exist in the database but were missing from database.ts.
 *
 * HOW TO MERGE:
 * Open your existing `database.ts` (the one with `divisions`, `districts`,
 * `upazilas`, `places`, `visits`, `categories`) and paste these four
 * table blocks inside the same `public: { Tables: { ... } }` object,
 * alongside your existing tables. Then delete this file.
 */

// ── trips ────────────────────────────────────────────────────────────
export interface TripsTable {
  Row: {
    id: string;
    user_id: string;
    title: string;
    status: 'wishlist' | 'planned' | 'ongoing' | 'completed' | 'cancelled';
    start_date: string | null; // date
    end_date: string | null; // date
    division_id: string | null;
    district_id: string | null;
    upazila_id: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    title: string;
    status?: 'wishlist' | 'planned' | 'ongoing' | 'completed' | 'cancelled';
    start_date?: string | null;
    end_date?: string | null;
    division_id?: string | null;
    district_id?: string | null;
    upazila_id?: string | null;
    notes?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<TripsTable['Insert']>;
}

// ── expense_categories ──────────────────────────────────────────────
export interface ExpenseCategoriesTable {
  Row: {
    id: string;
    name_bn: string;
    name_en: string;
    icon: string;
    sort_order: number;
    is_active: boolean;
  };
  Insert: {
    id?: string;
    name_bn: string;
    name_en: string;
    icon?: string;
    sort_order?: number;
    is_active?: boolean;
  };
  Update: Partial<ExpenseCategoriesTable['Insert']>;
}

// ── expenses ─────────────────────────────────────────────────────────
export interface ExpensesTable {
  Row: {
    id: string;
    trip_id: string;
    expense_category_id: string;
    expense_date: string; // date
    amount: number; // numeric, >= 0
    description: string | null;
    payment_method: string | null;
    note: string | null;
    receipt_photo_url: string | null;
    created_at: string;
  };
  Insert: {
    id?: string;
    trip_id: string;
    expense_category_id: string;
    expense_date: string;
    amount: number;
    description?: string | null;
    payment_method?: string | null;
    note?: string | null;
    receipt_photo_url?: string | null;
    created_at?: string;
  };
  Update: Partial<ExpensesTable['Insert']>;
}

// ── trip_places (join table, composite PK: trip_id + place_id) ────────
export interface TripPlacesTable {
  Row: {
    trip_id: string;
    place_id: string;
  };
  Insert: {
    trip_id: string;
    place_id: string;
  };
  Update: Partial<TripPlacesTable['Insert']>;
}

/**
 * Merge shape — paste into your Database['public']['Tables'] union:
 *
 * trips: TripsTable;
 * expenses: ExpensesTable;
 * expense_categories: ExpenseCategoriesTable;
 * trip_places: TripPlacesTable;
 */
