// src/hooks/use-user-profile.ts
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'

// প্রোফাইলে দেখানোর জন্য place-এর প্রয়োজনীয় ফিল্ডসহ টাইপ
export interface ProfilePlace {
  id: string
  name: string
  description: string | null
  status: 'wishlist' | 'planned' | 'visited' | 'revisited'
  photo_url: string | null
  personal_rating: number | null
  category: { name_bn: string; icon: string; slug: string }
  district: { name_bn: string }
  visits: { id: string; visit_date: string; note: string | null }[]
}

export function useUserProfile(username: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [places, setPlaces] = useState<ProfilePlace[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  const load = useCallback(async () => {
    if (!username) return
    setLoading(true)
    setError(null)
    setNotFound(false)

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .maybeSingle()

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }
    if (!profileData) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setProfile(profileData as Profile)

    // RLS আপনা-আপনি ফিল্টার করবে: is_public = true অথবা এটা নিজের প্রোফাইল হলে সব
    const { data: placesData, error: placesError } = await supabase
      .from('places')
      .select(
        `id, name, description, status, photo_url, personal_rating,
         category:categories(name_bn, icon, slug),
         district:districts(name_bn),
         visits(id, visit_date, note)`
      )
      .eq('user_id', profileData.id)
      .order('created_at', { ascending: false })

    if (placesError) setError(placesError.message)
    else setPlaces((placesData as unknown as ProfilePlace[]) ?? [])

    setLoading(false)
  }, [username])

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (cancelled) return
      await load()
    }
    run()
    return () => {
      cancelled = true
    }
  }, [load])

  const wishlist = useMemo(() => places.filter((p) => p.status === 'wishlist' || p.status === 'planned'), [places])
  const visited = useMemo(() => places.filter((p) => p.status === 'visited' || p.status === 'revisited'), [places])

  const wishlistByCategory = useMemo(() => groupByCategory(wishlist), [wishlist])
  const visitedByCategory = useMemo(() => groupByCategory(visited), [visited])

  const avgRating = useMemo(() => {
    const rated = visited.filter((p) => p.personal_rating != null)
    if (rated.length === 0) return null
    return rated.reduce((sum, p) => sum + (p.personal_rating ?? 0), 0) / rated.length
  }, [visited])

  return {
    profile,
    loading,
    error,
    notFound,
    wishlistCount: wishlist.length,
    visitedCount: visited.length,
    avgRating,
    wishlistByCategory,
    visitedByCategory,
    refetch: load,
  }
}

function groupByCategory(places: ProfilePlace[]) {
  const map = new Map<string, { name: string; icon: string; places: ProfilePlace[] }>()
  for (const p of places) {
    const key = p.category.slug
    if (!map.has(key)) map.set(key, { name: p.category.name_bn, icon: p.category.icon, places: [] })
    map.get(key)!.places.push(p)
  }
  return [...map.values()]
}
