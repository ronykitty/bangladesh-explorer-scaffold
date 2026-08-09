// src/pages/messages.tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useFriendships } from '@/hooks/use-friendships'

type ProfileLite = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
}

type ConversationSummary = {
  friend: ProfileLite
  lastMessage: string | null
  lastMessageAt: string | null
  unreadCount: number
}

export default function MessagesInboxPage() {
  const { userId } = useCurrentUser()
  const { accepted, loading: friendsLoading } = useFriendships()
  const [summaries, setSummaries] = useState<ConversationSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId || friendsLoading) return

    const friendIds = accepted.map((r) => (r.requester_id === userId ? r.addressee_id : r.requester_id))

    if (friendIds.length === 0) {
      setSummaries([])
      setLoading(false)
      return
    }

    async function load() {
      setLoading(true)

      const [{ data: profiles }, { data: messages }] = await Promise.all([
        supabase.from('profiles').select('id, username, full_name, avatar_url').in('id', friendIds),
        supabase
          .from('messages')
          .select('sender_id, receiver_id, content, created_at, read_at')
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
          .order('created_at', { ascending: false }),
      ])

      const list: ConversationSummary[] = (profiles ?? []).map((p) => {
        const withThisFriend = (messages ?? []).filter(
          (m) =>
            (m.sender_id === p.id && m.receiver_id === userId) ||
            (m.sender_id === userId && m.receiver_id === p.id)
        )
        const last = withThisFriend[0] // already sorted desc
        const unreadCount = withThisFriend.filter(
          (m) => m.sender_id === p.id && m.receiver_id === userId && !m.read_at
        ).length

        return {
          friend: p,
          lastMessage: last?.content ?? null,
          lastMessageAt: last?.created_at ?? null,
          unreadCount,
        }
      })

      // সাম্প্রতিক মেসেজ আগে দেখাও; একেবারে যাদের সাথে এখনো মেসেজ শুরু হয়নি তারা শেষে
      list.sort((a, b) => {
        if (!a.lastMessageAt) return 1
        if (!b.lastMessageAt) return -1
        return b.lastMessageAt.localeCompare(a.lastMessageAt)
      })

      setSummaries(list)
      setLoading(false)
    }

    load()
  }, [userId, friendsLoading, accepted])

  if (loading) return <p className="mt-10 text-center text-sm text-muted-foreground">লোড হচ্ছে...</p>

  return (
    <div className="mx-auto mt-10 max-w-lg">
      <h1 className="text-xl font-semibold">মেসেজ</h1>

      {summaries.length === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          এখনো কোনো ফ্রেন্ড নেই। আগে{' '}
          <Link to="/find-friends" className="underline">
            ফ্রেন্ড খুঁজুন
          </Link>
          , তারপর মেসেজ করা যাবে।
        </p>
      )}

      <div className="mt-4 space-y-1">
        {summaries.map((s) => (
          <Link
            key={s.friend.id}
            to={`/messages/${s.friend.id}`}
            className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              {s.friend.avatar_url ? (
                <img src={s.friend.avatar_url} alt="" className="h-9 w-9 rounded-full" />
              ) : (
                <div className="h-9 w-9 rounded-full bg-muted" />
              )}
              <div>
                <p className="text-sm font-medium">{s.friend.full_name || s.friend.username}</p>
                <p className="max-w-[220px] truncate text-xs text-muted-foreground">
                  {s.lastMessage ?? 'এখনো কোনো মেসেজ নেই'}
                </p>
              </div>
            </div>
            {s.unreadCount > 0 && (
              <span className="rounded-full bg-black px-2 py-0.5 text-xs text-white">
                {s.unreadCount}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
