// src/pages/friends.tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useFriendships } from '@/hooks/use-friendships'
import { useCurrentUser } from '@/hooks/use-current-user'

type ProfileLite = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
}

export default function FriendsPage() {
  const { userId } = useCurrentUser()
  const { accepted, incomingPending, outgoingPending, respondToRequest, removeFriendship, loading } =
    useFriendships()

  // friendship রো-গুলোতে requester/addressee উভয়ের id থাকে, তাই সব id-এর প্রোফাইল একসাথে লোড করছি
  const profiles = useProfilesFor(
    [...accepted, ...incomingPending, ...outgoingPending].flatMap((r) => [
      r.requester_id,
      r.addressee_id,
    ])
  )

  if (loading) return <p className="mt-10 text-center text-sm text-muted-foreground">লোড হচ্ছে...</p>

  return (
    <div className="mx-auto mt-10 max-w-lg space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">ফ্রেন্ডস</h1>
        <Link to="/find-friends" className="text-sm underline">
          খুঁজুন / নতুন যোগ করুন
        </Link>
      </div>

      {incomingPending.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground">রিকোয়েস্ট এসেছে</h2>
          <div className="mt-2 space-y-2">
            {incomingPending.map((r) => {
              const other = profiles[r.requester_id]
              return (
                <div key={r.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <span className="text-sm">{other?.full_name || other?.username || '...'}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => respondToRequest(r.id, 'accepted')}
                      className="rounded-md bg-black px-3 py-1 text-xs text-white"
                    >
                      একসেপ্ট
                    </button>
                    <button
                      onClick={() => respondToRequest(r.id, 'declined')}
                      className="rounded-md border px-3 py-1 text-xs"
                    >
                      বাতিল
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-medium text-muted-foreground">আপনার ফ্রেন্ডস ({accepted.length})</h2>
        <div className="mt-2 space-y-2">
          {accepted.length === 0 && (
            <p className="text-sm text-muted-foreground">এখনো কোনো ফ্রেন্ড নেই।</p>
          )}
          {accepted.map((r) => {
            const otherUserId = r.requester_id === userId ? r.addressee_id : r.requester_id
            const other = profiles[otherUserId]
            return (
              <div key={r.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                <Link to={`/profile/${other?.username}`} className="text-sm hover:underline">
                  {other?.full_name || other?.username || '...'}
                </Link>
                <div className="flex gap-2">
                  <Link
                    to={`/messages/${otherUserId}`}
                    className="rounded-md bg-black px-3 py-1 text-xs text-white"
                  >
                    মেসেজ
                  </Link>
                  <button
                    onClick={() => removeFriendship(r.id)}
                    className="rounded-md border px-3 py-1 text-xs"
                  >
                    আনফ্রেন্ড
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {outgoingPending.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground">পাঠানো রিকোয়েস্ট</h2>
          <div className="mt-2 space-y-2">
            {outgoingPending.map((r) => {
              const other = profiles[r.addressee_id]
              return (
                <div key={r.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <span className="text-sm">{other?.full_name || other?.username || '...'}</span>
                  <span className="text-xs text-muted-foreground">পেন্ডিং</span>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

// friendship রো-গুলো থেকে পাওয়া user id-গুলোর প্রোফাইল একসাথে লোড করে একটা map রিটার্ন করে
function useProfilesFor(userIds: string[]) {
  const [map, setMap] = useState<Record<string, ProfileLite>>({})
  const uniqueIds = [...new Set(userIds)].filter(Boolean).sort().join(',')

  useEffect(() => {
    const ids = uniqueIds ? uniqueIds.split(',') : []
    if (ids.length === 0) return

    supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', ids)
      .then(({ data, error }) => {
        if (error) {
          console.error('profiles batch fetch failed:', error.message)
          return
        }
        const next: Record<string, ProfileLite> = {}
        for (const p of data ?? []) next[p.id] = p
        setMap(next)
      })
  }, [uniqueIds])

  return map
}
