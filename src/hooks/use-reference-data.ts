import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface Division {
  id: string
  name_bn: string
  name_en: string
  slug: string
  sort_order: number
}

export interface District {
  id: string
  division_id: string
  name_bn: string
  name_en: string
  slug: string
}

export interface Category {
  id: string
  name_bn: string
  slug: string
  icon: string
  sort_order: number
}

export function useDivisions() {
  return useQuery({
    queryKey: ['divisions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('divisions').select('*').order('sort_order')
      if (error) throw error
      return data as Division[]
    },
    staleTime: Infinity, // reference data — practically static
  })
}

export function useDistricts() {
  return useQuery({
    queryKey: ['districts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('districts').select('*').order('name_bn')
      if (error) throw error
      return data as District[]
    },
    staleTime: Infinity,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('sort_order')
      if (error) throw error
      return data as Category[]
    },
    staleTime: Infinity,
  })
}
