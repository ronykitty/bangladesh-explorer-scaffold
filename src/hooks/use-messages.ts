// src/hooks/use-messages.ts
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useFriends, type FriendProfile } from '@/hooks/use-friends'

export type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  read_at: string | null
}

export type Conversation = {
  friend: FriendProfile
  lastMessage: Message | null
  unreadCount: number
}

/**
 * বন্ধু তালিকা (accepted friendships) + প্রতিটার সাথে সবশেষ মেসেজ ও unread count —
 * ইনবক্স/কনভারসেশন লিস্ট দেখানোর জন্য। শুধু accepted friend-দেরই দেখাবে,
 * কারণ RLS অনুযায়ী শুধু তাদের সাথেই মেসেজ চালাচালি সম্ভব।
 */
export function useConversations() {
  const { userId } = useCurrentUser()
  const { friends, loading: friendsLoading } = useFriends()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!userId || friendsLoading) return
    if (friends.length === 0) {
      setConversations([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('load conversations failed:', error.message)
      setLoading(false)
      return
    }

    const msgs = data ?? []
    const list: Conversation[] = friends
      .map((friend) => {
        const withThem = msgs.filter(
          (m) => m.sender_id === friend.id || m.receiver_id === friend.id
        )
        const unreadCount = withThem.filter((m) => m.receiver_id === userId && !m.read_at).length
        return { friend, lastMessage: withThem[0] ?? null, unreadCount }
      })
      .sort((a, b) => {
        const ta = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0
        const tb = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0
        return tb - ta
      })

    setConversations(list)
    setLoading(false)
  }, [userId, friends, friendsLoading])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`conversations-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => load()
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, load])

  return { conversations, loading }
}

/**
 * নিজের আর `friendId` — এই দুইজনের মধ্যকার কথোপকথন।
 * শুধু accepted friend-দের সাথেই মেসেজ পাঠানো যাবে — এটা DB-এর RLS policy দিয়েই enforce করা,
 * তাই এখানে আলাদা করে ফ্রেন্ডশিপ চেক না করলেও নিরাপদ (insert এমনিতেই ব্লক হয়ে যাবে)।
 */
export function useConversation(friendId: string | undefined) {
  const { userId } = useCurrentUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!userId || !friendId) return
    let active = true

    async function loadHistory() {
      setLoading(true)
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${userId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${userId})`
        )
        .order('created_at', { ascending: true })

      if (!active) return
      if (error) {
        console.error('load messages failed:', error.message)
      } else {
        setMessages(data ?? [])
      }
      setLoading(false)
    }

    loadHistory()

    // এই দুইজনের মধ্যে নতুন যেকোনো মেসেজ এলে লাইভ যোগ হবে
    const channel = supabase
      .channel(`messages:${[userId, friendId].sort().join('-')}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const m = payload.new as Message
          const belongsToThisConversation =
            (m.sender_id === userId && m.receiver_id === friendId) ||
            (m.sender_id === friendId && m.receiver_id === userId)
          if (belongsToThisConversation) {
            setMessages((prev) => [...prev, m])
          }
        }
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [userId, friendId])

  async function sendMessage(content: string) {
    const trimmed = content.trim()
    if (!trimmed || !userId || !friendId) return

    setSending(true)
    const { error } = await supabase
      .from('messages')
      .insert({ sender_id: userId, receiver_id: friendId, content: trimmed })
    setSending(false)

    if (error) {
      // সাধারণত এখানে এরর আসবে যদি friendId আসলে accepted friend না হয় (RLS ব্লক করবে)
      console.error('send message failed:', error.message)
      throw error
    }
    // নিজের পাঠানো মেসেজটা realtime এ নিজের কাছেও ফিরে আসবে (INSERT event), তাই এখানে আলাদা করে state আপডেট করছি না
  }

  async function markRead() {
    if (!userId || !friendId) return
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('sender_id', friendId)
      .eq('receiver_id', userId)
      .is('read_at', null)
  }

  return { messages, loading, sending, sendMessage, markRead }
}
