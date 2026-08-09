// src/routes/find-friends.tsx
import { useUserSearch, useFriendships } from '@/hooks/use-friendships'
import { useCurrentUser } from '@/hooks/use-current-user'

export default function FindFriendsPage() {
  const { query, setQuery, results, loading } = useUserSearch()
  const { statusWith, sendRequest } = useFriendships()
  const { userId } = useCurrentUser()

  return (
    <div className="mx-auto mt-10 max-w-lg">
      <h1 className="text-xl font-semibold">ফ্রেন্ডস খুঁজুন</h1>
      <p className="mt-1 text-sm text-muted-foreground">ইউজারনেম বা নাম দিয়ে সার্চ করুন</p>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="username বা নাম লিখুন..."
        autoFocus
        className="mt-4 w-full rounded-md border px-3 py-2 text-sm"
      />

      <div className="mt-4 space-y-2">
        {loading && <p className="text-sm text-muted-foreground">খোঁজা হচ্ছে...</p>}

        {!loading && query.trim().length >= 2 && results.length === 0 && (
          <p className="text-sm text-muted-foreground">কেউ পাওয়া যায়নি।</p>
        )}

        {results.map((profile) => {
          const relation = statusWith(profile.id)
          return (
            <div key={profile.id} className="flex items-center justify-between rounded-md border px-3 py-2">
              <div className="flex items-center gap-3">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-8 w-8 rounded-full" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-muted" />
                )}
                <div>
                  <p className="text-sm font-medium">{profile.full_name || profile.username}</p>
                  {profile.username && <p className="text-xs text-muted-foreground">@{profile.username}</p>}
                </div>
              </div>

              <FriendActionButton
                relationStatus={relation?.status}
                isRequester={relation?.requester_id === userId}
                onAdd={() => sendRequest(profile.id)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FriendActionButton({
  relationStatus,
  isRequester,
  onAdd,
}: {
  relationStatus?: 'pending' | 'accepted' | 'declined' | 'blocked'
  isRequester: boolean
  onAdd: () => void
}) {
  if (relationStatus === 'accepted') return <span className="text-xs text-green-600">ফ্রেন্ড</span>
  if (relationStatus === 'pending') {
    return (
      <span className="text-xs text-muted-foreground">
        {isRequester ? 'রিকোয়েস্ট পাঠানো হয়েছে' : 'রিকোয়েস্ট পেন্ডিং'}
      </span>
    )
  }
  if (relationStatus === 'blocked') return null

  return (
    <button onClick={onAdd} className="rounded-md bg-black px-3 py-1 text-xs text-white">
      Add Friend
    </button>
  )
}
