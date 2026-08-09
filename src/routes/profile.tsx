// src/routes/profile.tsx
import { useParams } from 'react-router-dom'
import { Loader2, MapPin, Star } from 'lucide-react'
import { useUserProfile, type ProfilePlace } from '@/hooks/use-user-profile'
import { useCurrentUser } from '@/hooks/use-current-user'
import { AvatarUploader } from '@/components/profile/AvatarUploader'
import { SocialActions } from '@/components/places/SocialActions'
import { PageHeader } from '@/components/layout/page-header'

function MiniPlaceCard({ place, currentUserId }: { place: ProfilePlace; currentUserId: string | undefined }) {
  return (
    <div className="glass rounded-xl border-l-4 border-l-[hsl(var(--accent))] px-4 py-3 shadow-sm">
      <div className="flex gap-3">
        {place.photo_url && (
          <img src={place.photo_url} alt={place.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
        )}
        <div className="flex-1">
          <div className="font-serif text-sm text-[hsl(var(--ink))]">{place.name}</div>
          <div className="text-xs text-[hsl(var(--ink-soft))]">
            <MapPin className="inline h-3 w-3" /> {place.district.name_bn}
          </div>
          {place.personal_rating != null && (
            <div className="text-xs text-[hsl(var(--accent-dark))]">
              <Star className="inline h-3 w-3" /> {place.personal_rating}/৫
            </div>
          )}
        </div>
      </div>
      {place.description && <p className="mt-1 text-xs text-[hsl(var(--ink-soft))]">{place.description}</p>}
      {place.visits.length > 0 && (
        <div className="mt-2 border-t border-dashed border-[hsl(var(--line))] pt-1.5">
          {place.visits.map((v) => (
            <div key={v.id} className="text-xs text-[hsl(var(--ink-soft))]">
              🗓 {v.visit_date} {v.note ? `— ${v.note}` : ''}
            </div>
          ))}
        </div>
      )}
      <SocialActions placeId={place.id} currentUserId={currentUserId} />
    </div>
  )
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { userId } = useCurrentUser()
  const {
    profile,
    loading,
    error,
    notFound,
    wishlistCount,
    visitedCount,
    avgRating,
    wishlistByCategory,
    visitedByCategory,
  } = useUserProfile(username)

  const isOwnProfile = !!profile && profile.id === userId

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-[hsl(var(--ink-soft))]">
        <Loader2 className="h-4 w-4 animate-spin" /> লোড হচ্ছে...
      </div>
    )
  }

  if (notFound) {
    return <div className="py-16 text-center text-sm text-[hsl(var(--ink-soft))]">এই ইউজারনেমে কোনো প্রোফাইল পাওয়া যায়নি।</div>
  }

  if (error || !profile) {
    return <div className="py-16 text-center text-sm text-[hsl(var(--danger))]">প্রোফাইল লোড করতে সমস্যা হয়েছে।</div>
  }

  return (
    <div>
      <PageHeader title={profile.full_name ?? profile.username ?? 'প্রোফাইল'} />

      {/* ---------------- Profile header ---------------- */}
      <section className="glass mt-4 rounded-xl p-4">
        {isOwnProfile ? (
          <AvatarUploader userId={profile.id} />
        ) : (
          <div className="flex flex-col items-center gap-3 p-4">
            <img
              src={profile.avatar_url ?? '/default-avatar.png'}
              alt={profile.username ?? ''}
              className="h-24 w-24 rounded-full object-cover border-2 border-border"
            />
            {profile.bio && <p className="max-w-sm text-center text-sm text-[hsl(var(--ink-soft))]">{profile.bio}</p>}
          </div>
        )}

        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="font-serif text-xl text-[hsl(var(--wishlist))]">{wishlistCount}</div>
            <div className="text-xs text-[hsl(var(--ink-soft))]">উইশলিস্ট</div>
          </div>
          <div>
            <div className="font-serif text-xl text-[hsl(var(--visited))]">{visitedCount}</div>
            <div className="text-xs text-[hsl(var(--ink-soft))]">ঘুরে দেখা</div>
          </div>
          <div>
            <div className="font-serif text-xl text-[hsl(var(--accent-dark))]">{avgRating ? avgRating.toFixed(1) : '—'}</div>
            <div className="text-xs text-[hsl(var(--ink-soft))]">গড় রেটিং</div>
          </div>
        </div>
      </section>

      {/* ---------------- Visited, grouped by category ---------------- */}
      {visitedByCategory.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 font-serif text-base text-[hsl(var(--accent-dark))]">🧭 ঘুরে দেখা জায়গা</h2>
          <div className="flex flex-col gap-4">
            {visitedByCategory.map((group) => (
              <div key={group.name}>
                <h3 className="mb-2 text-sm font-semibold text-[hsl(var(--ink))]">
                  {group.icon} {group.name} <span className="text-[hsl(var(--ink-soft))]">({group.places.length})</span>
                </h3>
                <div className="flex flex-col gap-2">
                  {group.places.map((p) => (
                    <MiniPlaceCard key={p.id} place={p} currentUserId={userId} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- Wishlist, grouped by category ---------------- */}
      {wishlistByCategory.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 font-serif text-base text-[hsl(var(--accent-dark))]">📌 উইশলিস্ট</h2>
          <div className="flex flex-col gap-4">
            {wishlistByCategory.map((group) => (
              <div key={group.name}>
                <h3 className="mb-2 text-sm font-semibold text-[hsl(var(--ink))]">
                  {group.icon} {group.name} <span className="text-[hsl(var(--ink-soft))]">({group.places.length})</span>
                </h3>
                <div className="flex flex-col gap-2">
                  {group.places.map((p) => (
                    <MiniPlaceCard key={p.id} place={p} currentUserId={userId} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {wishlistCount === 0 && visitedCount === 0 && (
        <p className="mt-8 text-center text-sm text-[hsl(var(--ink-soft))]">এখনো কোনো পাবলিক এন্ট্রি নেই।</p>
      )}
    </div>
  )
}
