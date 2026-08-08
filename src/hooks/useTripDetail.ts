import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // ⚠️ adjust import path to match your project
import { useTripExpenses } from './useExpenses';
import { useTripPlaces } from './useTripPlaces';
import type { Trip } from './useTrips';

/**
 * Everything the Trip Details page needs, in one place, so the page
 * never has to duplicate a calculation that another screen also does.
 * Trip info + linked places + expenses (with dynamic total) all come
 * from live queries — nothing is cached/duplicated in component state
 * beyond what these hooks already hold.
 */
export function useTripDetail(tripId: string | null) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrip = useCallback(async () => {
    if (!tripId) {
      setTrip(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('trips')
      .select(
        `*,
        divisions ( name_bn ),
        districts ( name_bn ),
        upazilas ( name_bn )`
      )
      .eq('id', tripId)
      .single();

    if (fetchError) {
      setError(fetchError.message);
      setTrip(null);
    } else {
      setTrip({
        ...data,
        division_name_bn: data.divisions?.name_bn ?? undefined,
        district_name_bn: data.districts?.name_bn ?? undefined,
        upazila_name_bn: data.upazilas?.name_bn ?? undefined,
      });
    }
    setLoading(false);
  }, [tripId]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  const placesResult = useTripPlaces(tripId);
  const expensesResult = useTripExpenses(tripId);

  return {
    trip,
    loading: loading || placesResult.loading || expensesResult.loading,
    error: error ?? placesResult.error ?? expensesResult.error,
    refetch: () => {
      fetchTrip();
      placesResult.refetch();
      expensesResult.refetch();
    },
    places: placesResult.places,
    linkPlace: placesResult.linkPlace,
    unlinkPlace: placesResult.unlinkPlace,
    expenses: expensesResult.expenses,
    totalExpense: expensesResult.totalExpense,
    hasExpenses: expensesResult.hasExpenses,
    expensesByCategory: expensesResult.byCategory,
    addExpense: expensesResult.addExpense,
    updateExpense: expensesResult.updateExpense,
    deleteExpense: expensesResult.deleteExpense,
  };
}