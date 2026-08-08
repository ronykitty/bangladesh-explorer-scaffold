import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // ⚠️ adjust import path to match your project

export interface TripPlace {
  id: string; // places.id
  name: string;
  status: 'wishlist' | 'planned' | 'visited' | 'revisited';
  category_id: string;
  category_name_bn?: string;
  category_icon?: string;
  district_id: string;
  upazila_id: string | null;
}

/**
 * Places linked to a given trip via trip_places. This is the join that
 * lets a trip automatically roll up into visited-place / visited-district
 * / visited-upazila counts elsewhere in the app (see spec section 14 —
 * PLACE → TRIP → EXPENSE → REPORT).
 */
export function useTripPlaces(tripId: string | null) {
  const [places, setPlaces] = useState<TripPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaces = useCallback(async () => {
    if (!tripId) {
      setPlaces([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('trip_places')
      .select(
        `place_id,
        places (
          id, name, status, category_id, district_id, upazila_id,
          categories ( name_bn, icon )
        )`
      )
      .eq('trip_id', tripId);

    if (fetchError) {
      setError(fetchError.message);
      setPlaces([]);
    } else {
      const mapped = (data ?? [])
        .map((row: any) => row.places)
        .filter(Boolean)
        .map((p: any) => ({
          id: p.id,
          name: p.name,
          status: p.status,
          category_id: p.category_id,
          category_name_bn: p.categories?.name_bn,
          category_icon: p.categories?.icon,
          district_id: p.district_id,
          upazila_id: p.upazila_id,
        }));
      setPlaces(mapped);
    }
    setLoading(false);
  }, [tripId]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const linkPlace = useCallback(
    async (placeId: string) => {
      if (!tripId) throw new Error('tripId is required');
      const { error: insertError } = await supabase
        .from('trip_places')
        .insert({ trip_id: tripId, place_id: placeId });
      if (insertError) throw insertError;
      await fetchPlaces();
    },
    [tripId, fetchPlaces]
  );

  const unlinkPlace = useCallback(
    async (placeId: string) => {
      if (!tripId) throw new Error('tripId is required');
      const { error: deleteError } = await supabase
        .from('trip_places')
        .delete()
        .eq('trip_id', tripId)
        .eq('place_id', placeId);
      if (deleteError) throw deleteError;
      await fetchPlaces();
    },
    [tripId, fetchPlaces]
  );

  return { places, loading, error, refetch: fetchPlaces, linkPlace, unlinkPlace };
}
