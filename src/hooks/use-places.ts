import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { PlaceStatus, PlacePriority, TransportMode } from '@/types/database'
import type { Category, District, Division } from './use-reference-data'

export type { PlacePriority, TransportMode }

export interface Visit {
  id: string
  place_id: string
  visit_date: string
  note: string | null
  created_at: string
}

export interface PlaceWithRelations {
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
  category: Category
  district: District & { division: Division }
  visits: Visit[]
}

const PLACE_SELECT = `
  *,
  category:categories(*),
  district:districts(*, division:divisions(*)),
  visits(*)
`

export function usePlaces() {
  return useQuery({
    queryKey: ['places'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('places')
        .select(PLACE_SELECT)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as PlaceWithRelations[]
    },
  })
}

export interface PlaceInput {
  category_id: string
  district_id: string
  upazila_name?: string | null
  union_village?: string | null
  name: string
  description?: string | null
  status: PlaceStatus
  photo_url?: string | null
  google_maps_url?: string | null
  personal_rating?: number | null
  target_date?: string | null
  estimated_cost?: number | null
  priority?: PlacePriority | null
  transport_mode?: TransportMode | null
}

export function useCreatePlace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ input, userId }: { input: PlaceInput; userId: string }) => {
      const { data, error } = await supabase
        .from('places')
        .insert({ ...input, user_id: userId })
        .select(PLACE_SELECT)
        .single()
      if (error) throw error
      return data as unknown as PlaceWithRelations
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] })
    },
  })
}

export function useUpdatePlace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: PlaceInput }) => {
      const { data, error } = await supabase
        .from('places')
        .update(input)
        .eq('id', id)
        .select(PLACE_SELECT)
        .single()
      if (error) throw error
      return data as unknown as PlaceWithRelations
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] })
    },
  })
}

export function useDeletePlace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('places').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] })
    },
  })
}

export function useAddVisit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      placeId,
      visitDate,
      note,
    }: {
      placeId: string
      visitDate: string
      note?: string
    }) => {
      const { error: visitError } = await supabase.from('visits').insert({
        place_id: placeId,
        visit_date: visitDate,
        note: note || null,
      })
      if (visitError) throw visitError

      // A recorded visit implies the place has now been visited
      const { error: statusError } = await supabase
        .from('places')
        .update({ status: 'visited' })
        .eq('id', placeId)
      if (statusError) throw statusError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] })
    },
  })
}

export function useDeleteVisit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (visitId: string) => {
      const { error } = await supabase.from('visits').delete().eq('id', visitId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] })
    },
  })
}