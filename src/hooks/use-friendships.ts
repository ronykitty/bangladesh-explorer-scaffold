// src/hooks/use-friendships.ts
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useCurrentUser } from '@/hooks/use-current-user'

type ProfileLite = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
}

type FriendshipRow = {
  id: string
  requester_id: string
  addressee_id: string
  status: 'pending' | 'accepted' | 'declined' | 'blocked'
  created_at: string
}

// ---------- ইউজার সার্চ (username / full_name দিয়ে) ----------
export function useUserSearch() {
  const { userId } = useCurrentUser()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ProfileLite[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const term = query.trim()
    if (term.length < 2) {
      setResults([])
      return
    }

    let active = true
    setLoading(true)

    const timeout = setTimeout(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .or(`username.ilike.%${term}%,full_name.ilike.%${term}%`)
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

// ---------- ফ্রেন্ডশিপ ম্যানেজমেন্ট ----------
export function useFriendships() {
  const { userId } = useCurrentUser()
  const [rows, setRows] = useState<FriendshipRow[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('friendships')
      .select('id, requester_id, addressee_id, status, created_at')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)

    if (error) {
      console.error('friendships fetch failed:', error.message)
    } else {
      setRows(data ?? [])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    reload()
  }, [reload])

  // অন্য ইউজারের সাথে বর্তমান সম্পর্কের অবস্থা (নিজে থেকে None হলে undefined)
  function statusWith(otherUserId: string) {
    return rows.find(
      (r) => r.requester_id === otherUserId || r.addressee_id === otherUserId
    )
  }

  async function sendRequest(addresseeId: string) {
    if (!userId) return
    const { error } = await supabase
      .from('friendships')
      .insert({ requester_id: userId, addressee_id: addresseeId, status: 'pending' })
    if (error) {
      console.error('send friend request failed:', error.message)
      throw error
    }
    await reload()
  }

  async function respondToRequest(friendshipId: string, status: 'accepted' | 'declined') {
    const { error } = await supabase
      .from('friendships')
      .update({ status })
      .eq('id', friendshipId)
    if (error) {
      console.error('respond to friend request failed:', error.message)
      throw error
    }
    await reload()
  }

  async function removeFriendship(friendshipId: string) {
    const { error } = await supabase.from('friendships').delete().eq('id', friendshipId)
    if (error) {
      console.error('remove friendship failed:', error.message)
      throw error
    }
    await reload()
  }

  const accepted = rows.filter((r) => r.status === 'accepted')
  const incomingPending = rows.filter((r) => r.status === 'pending' && r.addressee_id === userId)
  const outgoingPending = rows.filter((r) => r.status === 'pending' && r.requester_id === userId)

  return {
    loading,
    accepted,
    incomingPending,
    outgoingPending,
    statusWith,
    sendRequest,
    respondToRequest,
    removeFriendship,
    reload,
  }
}
