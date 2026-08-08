import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // ⚠️ adjust import path to match your project

export interface ExpenseCategory {
  id: string;
  name_bn: string;
  name_en: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

export function useExpenseCategories(includeInactive = false) {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('expense_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
      setCategories([]);
    } else {
      setCategories(data ?? []);
    }
    setLoading(false);
  }, [includeInactive]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
}
