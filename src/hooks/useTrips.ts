import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // ⚠️ adjust import path to match your project

export type TripStatus = 'wishlist' | 'planned' | 'ongoing' | 'completed' | 'cancelled';

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  status: TripStatus;
  start_date: string | null;
  end_date: string | null;
  division_id: string | null;
  district_id: string | null;
  upazila_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // joined display fields (optional, present when using the *_with_names variant)
  division_name_bn?: string;
  district_name_bn?: string;
  upazila_name_bn?: string;
}

export interface TripInput {
  title: string;
  status?: TripStatus;
  start_date?: string | null;
  end_date?: string | null;
  division_id?: string | null;
  district_id?: string | null;
  upazila_id?: string | null;
  notes?: string | null;
}

interface TripFilters {
  status?: TripStatus;
  division_id?: string;
  district_id?: string;
  upazila_id?: string;
}

export function useTrips(filters?: TripFilters) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('trips')
      .select(
        `*,
        divisions ( name_bn ),
        districts ( name_bn ),
        upazilas ( name_bn )`
      )
      .order('start_date', { ascending: false, nullsFirst: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.division_id) query = query.eq('division_id', filters.division_id);
    if (filters?.district_id) query = query.eq('district_id', filters.district_id);
    if (filters?.upazila_id) query = query.eq('upazila_id', filters.upazila_id);

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
      setTrips([]);
    } else {
      const mapped = (data ?? []).map((row: any) => ({
        ...row,
        division_name_bn: row.divisions?.name_bn,
        district_name_bn: row.districts?.name_bn,
        upazila_name_bn: row.upazilas?.name_bn,
      }));
      setTrips(mapped);
    }
    setLoading(false);
  }, [filters?.status, filters?.division_id, filters?.district_id, filters?.upazila_id]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const createTrip = useCallback(async (input: TripInput) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User is not authenticated');

    const { data, error: insertError } = await supabase
      .from('trips')
      .insert({ ...input, user_id: user.id })
      .select()
      .single();

    if (insertError) throw insertError;
    await fetchTrips();
    return data as Trip;
  }, [fetchTrips]);

  const updateTrip = useCallback(async (id: string, input: Partial<TripInput>) => {
    const { data, error: updateError } = await supabase
      .from('trips')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;
    await fetchTrips();
    return data as Trip;
  }, [fetchTrips]);

  const deleteTrip = useCallback(async (id: string) => {
    // Confirmed on the live schema: expenses_trip_id_fkey and
    // trip_places_trip_id_fkey are both ON DELETE CASCADE, so deleting a
    // trip automatically removes its expenses and trip_places rows.
    const { error: deleteError } = await supabase.from('trips').delete().eq('id', id);
    if (deleteError) throw deleteError;
    await fetchTrips();
  }, [fetchTrips]);

  return { trips, loading, error, refetch: fetchTrips, createTrip, updateTrip, deleteTrip };
}
