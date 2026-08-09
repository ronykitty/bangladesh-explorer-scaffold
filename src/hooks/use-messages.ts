// src/hooks/use-messages.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useCurrentUser } from '@/hooks/use-current-user'

export type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  read_at: string | null
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
