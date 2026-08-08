import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase'; // ⚠️ adjust import path to match your project

export interface Expense {
  id: string;
  trip_id: string;
  expense_category_id: string;
  expense_date: string;
  amount: number;
  description: string | null;
  payment_method: string | null;
  note: string | null;
  receipt_photo_url: string | null;
  created_at: string;
  // joined display fields
  category_name_bn?: string;
  category_icon?: string;
}

export interface ExpenseInput {
  expense_category_id: string;
  expense_date: string;
  amount: number;
  description?: string | null;
  payment_method?: string | null;
  note?: string | null;
  receipt_photo_url?: string | null;
}

/**
 * All expenses for a single trip. `totalExpense` is derived with
 * `useMemo` from the actual fetched rows — never a stored/cached number —
 * so it's always in sync with what's really in the database. If there
 * are no expense rows, totalExpense is 0 and `hasExpenses` is false so
 * the UI can show "কোনো খরচের তথ্য নেই" instead of a fabricated ৳0 total.
 */
export function useTripExpenses(tripId: string | null) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    if (!tripId) {
      setExpenses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('expenses')
      .select(`*, expense_categories ( name_bn, icon )`)
      .eq('trip_id', tripId)
      .order('expense_date', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setExpenses([]);
    } else {
      const mapped = (data ?? []).map((row: any) => ({
        ...row,
        category_name_bn: row.expense_categories?.name_bn,
        category_icon: row.expense_categories?.icon,
      }));
      setExpenses(mapped);
    }
    setLoading(false);
  }, [tripId]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const totalExpense = useMemo(
    () => expenses.reduce((sum, e) => sum + Number(e.amount), 0),
    [expenses]
  );

  const byCategory = useMemo(() => {
    const map = new Map<string, { name_bn: string; icon: string; total: number }>();
    for (const e of expenses) {
      const key = e.expense_category_id;
      const existing = map.get(key);
      if (existing) {
        existing.total += Number(e.amount);
      } else {
        map.set(key, {
          name_bn: e.category_name_bn ?? '',
          icon: e.category_icon ?? '',
          total: Number(e.amount),
        });
      }
    }
    return Array.from(map.values());
  }, [expenses]);

  const addExpense = useCallback(
    async (input: ExpenseInput) => {
      if (!tripId) throw new Error('tripId is required to add an expense');
      const { data, error: insertError } = await supabase
        .from('expenses')
        .insert({ ...input, trip_id: tripId })
        .select()
        .single();
      if (insertError) throw insertError;
      await fetchExpenses();
      return data as Expense;
    },
    [tripId, fetchExpenses]
  );

  const updateExpense = useCallback(
    async (id: string, input: Partial<ExpenseInput>) => {
      const { data, error: updateError } = await supabase
        .from('expenses')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      if (updateError) throw updateError;
      await fetchExpenses();
      return data as Expense;
    },
    [fetchExpenses]
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase.from('expenses').delete().eq('id', id);
      if (deleteError) throw deleteError;
      await fetchExpenses();
    },
    [fetchExpenses]
  );

  return {
    expenses,
    loading,
    error,
    totalExpense,
    hasExpenses: expenses.length > 0,
    byCategory,
    refetch: fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
  };
}

/**
 * Overall travel expense across ALL of the user's trips — for the
 * dashboard's "Total Travel Expense" card. Sums real expense rows via
 * a single query rather than looping per-trip calls.
 */
export function useOverallExpenseStats() {
  const [totalExpense, setTotalExpense] = useState(0);
  const [hasExpenses, setHasExpenses] = useState(false);
  const [byMonth, setByMonth] = useState<{ month: string; total: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    // RLS on `expenses` is enforced via the parent trip's user_id, so this
    // naturally scopes to the current user's own expenses only.
    const { data, error: fetchError } = await supabase
      .from('expenses')
      .select('amount, expense_date');

    if (fetchError) {
      setError(fetchError.message);
      setTotalExpense(0);
      setHasExpenses(false);
      setByMonth([]);
      setLoading(false);
      return;
    }

    const rows = data ?? [];
    setHasExpenses(rows.length > 0);
    setTotalExpense(rows.reduce((sum, r) => sum + Number(r.amount), 0));

    const monthMap = new Map<string, number>();
    for (const r of rows) {
      const month = String(r.expense_date).slice(0, 7); // YYYY-MM
      monthMap.set(month, (monthMap.get(month) ?? 0) + Number(r.amount));
    }
    setByMonth(
      Array.from(monthMap.entries())
        .map(([month, total]) => ({ month, total }))
        .sort((a, b) => a.month.localeCompare(b.month))
    );

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { totalExpense, hasExpenses, byMonth, loading, error, refetch: fetchStats };
}
