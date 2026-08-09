// src/hooks/use-friends.ts
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface FriendProfile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
}

export interface FriendshipRow {
  id: string
  requester_id: string
  addressee_id: string
  status: 'pending' | 'accepted' | 'declined' | 'blocked'
  created_at: string
}

export interface FriendRequest extends FriendshipRow {
  other_user: FriendProfile
}

/**
 * বর্তমান লগইন করা ইউজারের ফ্রেন্ড সিস্টেম ম্যানেজ করার হুক:
 * - ইউজারনেম দিয়ে খোঁজা
 * - রিকোয়েস্ট পাঠানো / বাতিল করা
 * - রিকোয়েস্ট অ্যাকসেপ্ট / ডিক্লাইন করা
 * - বন্ধুর লিস্ট + পেন্ডিং রিকোয়েস্ট দেখা
 */
export function useFriends() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [friends, setFriends] = useState<FriendProfile[]>([])
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([])
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setCurrentUserId(null)
      setFriends([])
      setIncomingRequests([])
      setOutgoingRequests([])
      setLoading(false)
      return
    }
    setCurrentUserId(user.id)

    const { data, error: fetchError } = await supabase
      .from('friendships')
      .select(
        `id, requester_id, addressee_id, status, created_at,
         requester:profiles!friendships_requester_id_fkey(id, username, full_name, avatar_url, bio),
         addressee:profiles!friendships_addressee_id_fkey(id, username, full_name, avatar_url, bio)`
      )
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    const rows = (data ?? []) as unknown as Array<
      FriendshipRow & { requester: FriendProfile; addressee: FriendProfile }
    >

    const acceptedFriends: FriendProfile[] = []
    const incoming: FriendRequest[] = []
    const outgoing: FriendRequest[] = []

    for (const row of rows) {
      const isRequester = row.requester_id === user.id
      const other = isRequester ? row.addressee : row.requester

      if (row.status === 'accepted') {
        acceptedFriends.push(other)
      } else if (row.status === 'pending') {
        const entry: FriendRequest = { ...row, other_user: other }
        if (isRequester) outgoing.push(entry)
        else incoming.push(entry)
      }
    }

    setFriends(acceptedFriends)
    setIncomingRequests(incoming)
    setOutgoingRequests(outgoing)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  /** ইউজারনেম বা নাম দিয়ে অন্য ইউজার খোঁজা (নিজেকে বাদ দিয়ে) */
  const searchUsers = useCallback(
    async (query: string): Promise<FriendProfile[]> => {
      if (!query.trim() || !currentUserId) return []
      const { data, error: searchError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio')
        .neq('id', currentUserId)
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(20)

      if (searchError) {
        setError(searchError.message)
        return []
      }
      return (data ?? []) as FriendProfile[]
    },
    [currentUserId]
  )

  /** নতুন ফ্রেন্ড রিকোয়েস্ট পাঠানো */
  const sendRequest = useCallback(
    async (addresseeId: string) => {
      if (!currentUserId) return { error: 'লগইন করা নেই' }
      const { error: insertError } = await supabase.from('friendships').insert({
        requester_id: currentUserId,
        addressee_id: addresseeId,
        status: 'pending',
      })
      if (insertError) return { error: insertError.message }
      await loadAll()
      return { error: null }
    },
    [currentUserId, loadAll]
  )

  /** রিকোয়েস্ট অ্যাকসেপ্ট করা */
  const acceptRequest = useCallback(
    async (friendshipId: string) => {
      const { error: updateError } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId)
      if (updateError) return { error: updateError.message }
      await loadAll()
      return { error: null }
    },
    [loadAll]
  )

  /** রিকোয়েস্ট ডিক্লাইন করা */
  const declineRequest = useCallback(
    async (friendshipId: string) => {
      const { error: updateError } = await supabase
        .from('friendships')
        .update({ status: 'declined' })
        .eq('id', friendshipId)
      if (updateError) return { error: updateError.message }
      await loadAll()
      return { error: null }
    },
    [loadAll]
  )

  /** পাঠানো রিকোয়েস্ট বাতিল করা, বা বিদ্যমান ফ্রেন্ডশিপ মুছে আনফ্রেন্ড করা */
  const removeFriendship = useCallback(
    async (friendshipId: string) => {
      const { error: deleteError } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId)
      if (deleteError) return { error: deleteError.message }
      await loadAll()
      return { error: null }
    },
    [loadAll]
  )

  return {
    currentUserId,
    friends,
    incomingRequests,
    outgoingRequests,
    loading,
    error,
    searchUsers,
    sendRequest,
    acceptRequest,
    declineRequest,
    removeFriendship,
    refresh: loadAll,
  }
}
