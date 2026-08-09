// src/components/profile/FindFriends.tsx
import { useState } from 'react'
import { useFriends, type FriendProfile } from '@/hooks/use-friends'

function Avatar({ profile }: { profile: FriendProfile }) {
  if (profile.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={profile.username ?? ''}
        className="h-10 w-10 rounded-full object-cover border border-[hsl(var(--line))]"
      />
    )
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--accent))]/15 font-serif text-[hsl(var(--accent-dark))]">
      {(profile.full_name ?? profile.username ?? '?').charAt(0).toUpperCase()}
    </div>
  )
}

/** Strava/Duolingo স্টাইলের ফাইন্ড ফ্রেন্ডস — খোঁজা, রিকোয়েস্ট, বন্ধুর তালিকা */
export function FindFriends() {
  const {
    friends,
    incomingRequests,
    outgoingRequests,
    loading,
    error,
    searchUsers,
    sendRequest,
    acceptRequest,
    declineRequest,
  } = useFriends()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FriendProfile[]>([])
  const [searching, setSearching] = useState(false)
  const [sentTo, setSentTo] = useState<Set<string>>(new Set())

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearching(true)
    setResults(await searchUsers(query))
    setSearching(false)
  }

  async function handleAdd(userId: string) {
    const { error: sendError } = await sendRequest(userId)
    if (!sendError) setSentTo((prev) => new Set(prev).add(userId))
  }

  if (loading) return <p className="text-sm text-[hsl(var(--ink-soft))]">লোড হচ্ছে...</p>

  return (
    <div className="flex flex-col gap-6">
      {error && <p className="text-sm text-[hsl(var(--danger))]">{error}</p>}

      <section className="glass rounded-xl p-4">
        <h3 className="mb-2 font-serif text-sm text-[hsl(var(--accent-dark))]">🔎 ফ্রেন্ড খুঁজুন</h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ইউজারনেম বা নাম লিখুন"
            className="flex-1 rounded-lg border border-[hsl(var(--line))] bg-transparent px-3 py-2 text-sm text-[hsl(var(--ink))] outline-none focus:border-[hsl(var(--accent))]"
          />
          <button
            type="submit"
            disabled={searching}
            className="rounded-lg bg-[hsl(var(--accent))] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            খুঁজুন
          </button>
        </form>

        {results.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {results.map((user) => {
              const alreadyFriend = friends.some((f) => f.id === user.id)
              const alreadySent =
                sentTo.has(user.id) || outgoingRequests.some((r) => r.other_user.id === user.id)
              return (
                <li
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border border-[hsl(var(--line))] px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <Avatar profile={user} />
                    <div>
                      <p className="text-sm font-medium text-[hsl(var(--ink))]">
                        {user.full_name ?? user.username}
                      </p>
                      <p className="text-xs text-[hsl(var(--ink-soft))]">@{user.username}</p>
                    </div>
                  </div>
                  {alreadyFriend ? (
                    <span className="text-xs text-[hsl(var(--ink-soft))]">বন্ধু ✓</span>
                  ) : alreadySent ? (
                    <span className="text-xs text-[hsl(var(--ink-soft))]">পাঠানো হয়েছে</span>
                  ) : (
                    <button
                      onClick={() => handleAdd(user.id)}
                      className="text-xs font-medium text-[hsl(var(--accent-dark))]"
                    >
                      + অ্যাড ফ্রেন্ড
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {incomingRequests.length > 0 && (
        <section className="glass rounded-xl p-4">
          <h3 className="mb-2 font-serif text-sm text-[hsl(var(--accent-dark))]">
            📩 ফ্রেন্ড রিকোয়েস্ট ({incomingRequests.length})
          </h3>
          <ul className="flex flex-col gap-2">
            {incomingRequests.map((req) => (
              <li
                key={req.id}
                className="flex items-center justify-between rounded-lg border border-[hsl(var(--line))] px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <Avatar profile={req.other_user} />
                  <p className="text-sm font-medium text-[hsl(var(--ink))]">
                    {req.other_user.full_name ?? req.other_user.username}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => acceptRequest(req.id)}
                    className="text-xs font-medium text-[hsl(var(--visited))]"
                  >
                    গ্রহণ করুন
                  </button>
                  <button
                    onClick={() => declineRequest(req.id)}
                    className="text-xs text-[hsl(var(--ink-soft))]"
                  >
                    বাতিল
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="glass rounded-xl p-4">
        <h3 className="mb-2 font-serif text-sm text-[hsl(var(--accent-dark))]">
          👥 আপনার বন্ধুরা ({friends.length})
        </h3>
        {friends.length === 0 ? (
          <p className="text-sm text-[hsl(var(--ink-soft))]">এখনো কোনো বন্ধু যোগ হয়নি।</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {friends.map((friend) => (
              <li
                key={friend.id}
                className="flex items-center gap-3 rounded-lg border border-[hsl(var(--line))] px-3 py-2"
              >
                <Avatar profile={friend} />
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--ink))]">
                    {friend.full_name ?? friend.username}
                  </p>
                  <p className="text-xs text-[hsl(var(--ink-soft))]">@{friend.username}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
