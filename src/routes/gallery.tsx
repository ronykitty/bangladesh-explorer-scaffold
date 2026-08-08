import { Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { EmptyState } from '@/components/layout/empty-state'
import { usePlaces } from '@/hooks/use-places'

export default function GalleryPage() {
  const { data: places, isLoading } = usePlaces()
  const withPhotos = (places ?? []).filter((p) => p.photo_url)

  return (
    <div>
      <PageHeader title="📸 ছবি গ্যালারি" subtitle="ছবি-সহ এন্ট্রিগুলো গ্রিড আকারে" />
      {isLoading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-[hsl(var(--ink-soft))]">
          <Loader2 className="h-4 w-4 animate-spin" /> লোড হচ্ছে...
        </div>
      ) : withPhotos.length === 0 ? (
        <EmptyState icon="📸" title="এখনো কোনো ছবি নেই" description="এন্ট্রিতে ছবির লিংক যোগ করলে এখানে দেখা যাবে।" />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {withPhotos.map((p) => (
            <div key={p.id} className="glass overflow-hidden rounded-xl shadow-sm">
              <img
                src={p.photo_url!}
                alt={p.name}
                className="h-32 w-full object-cover"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                }}
              />
              <div className="px-3 py-2">
                <div className="truncate text-sm font-semibold text-[hsl(var(--ink))]">{p.name}</div>
                <div className="truncate text-xs text-[hsl(var(--ink-soft))]">{p.district.name_bn}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
