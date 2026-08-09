// src/hooks/use-friendships.ts
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useCurrentUser } from '@/hooks/use-current-user'

type FriendshipStatus = 'pending' | 'accepted' | 'declined' | 'blocked'

type FriendshipRow = {
  id: string
  requester_id: string
  addressee_id: string
  status: FriendshipStatus
  created_at: string
  updated_at: string
}

/**
 * বর্তমান ইউজারের সব friendship রো লোড করে, এবং accepted/incoming-pending/
 * outgoing-pending — এই ৩ ভাগে ভাগ করে দেয়। রিয়েলটাইম সাবস্ক্রিপশনও আছে,
 * যাতে অন্য পক্ষ accept/decline করলে সাথে সাথে UI আপডেট হয়।
 */
export function useFriendships() {
  const { userId } = useCurrentUser()
  const [rows, setRows] = useState<FriendshipRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!userId) {
      setRows([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('friendships')
      .select('*')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)

    if (error) {
      console.error('friendships fetch failed:', error.message)
    } else {
      setRows(data ?? [])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('friendships-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'friendships' },
        () => load()
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, load])

  const accepted = useMemo(() => rows.filter((r) => r.status === 'accepted'), [rows])
  const incomingPending = useMemo(
    () => rows.filter((r) => r.status === 'pending' && r.addressee_id === userId),
    [rows, userId]
  )
  const outgoingPending = useMemo(
    () => rows.filter((r) => r.status === 'pending' && r.requester_id === userId),
    [rows, userId]
  )

  // একটা নির্দিষ্ট ইউজারের সাথে সম্পর্কের অবস্থা জানার জন্য (find-friends পেজে দরকার)
  const statusWith = useCallback(
    (otherUserId: string) => rows.find((r) => r.requester_id === otherUserId || r.addressee_id === otherUserId),
    [rows]
  )

  const sendRequest = useCallback(
    async (addresseeId: string) => {
      if (!userId) return
      const { error } = await supabase
        .from('friendships')
        .insert({ requester_id: userId, addressee_id: addresseeId, status: 'pending' })
      if (error) {
        console.error('send friend request failed:', error.message)
        return
      }
      await load()
    },
    [userId, load]
  )

  const respondToRequest = useCallback(
    async (friendshipId: string, status: 'accepted' | 'declined') => {
      const { error } = await supabase.from('friendships').update({ status }).eq('id', friendshipId)
      if (error) {
        console.error('respond to request failed:', error.message)
        return
      }
      await load()
    },
    [load]
  )

  const removeFriendship = useCallback(
    async (friendshipId: string) => {
      const { error } = await supabase.from('friendships').delete().eq('id', friendshipId)
      if (error) {
        console.error('remove friendship failed:', error.message)
        return
      }
      await load()
    },
    [load]
  )

  return {
    accepted,
    incomingPending,
    outgoingPending,
    statusWith,
    sendRequest,
    respondToRequest,
    removeFriendship,
    loading,
  }
}

/**
 * ইউজারনেম/নাম দিয়ে অন্য ইউজার সার্চ করার হুক (find-friends পেজে দরকার)।
 * নিজেকে রেজাল্টে বাদ দেয়।
 */
export function useUserSearch() {
  const { userId } = useCurrentUser()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<
    { id: string; username: string | null; full_name: string | null; avatar_url: string | null }[]
  >([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      return
    }

    let active = true
    setLoading(true)

    const timeout = setTimeout(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .or(`username.ilike.%${trimmed}%,full_name.ilike.%${trimmed}%`)
        .neq('id', userId ?? '')
        .limit(20)

      if (!active) return
      if (error) {
        console.error('user search failed:', error.message)
        setResults([])
      } else {
        setResults(data ?? [])
      }
      setLoading(false)
    }, 300) // debounce

    return () => {
      active = false
      clearTimeout(timeout)
    }
  }, [query, userId])

  return { query, setQuery, results, loading }
}
