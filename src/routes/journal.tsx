import { useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { EmptyState } from '@/components/layout/empty-state'
import { usePlaces } from '@/hooks/use-places'

export default function JournalPage() {
  const { data: places, isLoading } = usePlaces()

  const entries = useMemo(() => {
    if (!places) return []
    return places
      .flatMap((p) => p.visits.map((v) => ({ ...v, place: p })))
      .sort((a, b) => b.visit_date.localeCompare(a.visit_date))
  }, [places])

  return (
    <div>
      <PageHeader title="📝 ভ্রমণ জার্নাল" subtitle="সব ভিজিটের তারিখ-নোট, সময়ানুক্রমে" />
      {isLoading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-[hsl(var(--ink-soft))]">
          <Loader2 className="h-4 w-4 animate-spin" /> লোড হচ্ছে...
        </div>
      ) : entries.length === 0 ? (
        <EmptyState icon="📝" title="জার্নাল খালি" description="কোনো এন্ট্রিতে ভিজিট যোগ করলে এখানে দেখা যাবে।" />
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((v) => (
            <div key={v.id} className="glass rounded-xl px-4 py-3 shadow-sm">
              <div className="text-xs font-semibold text-[hsl(var(--visited))]">{v.visit_date}</div>
              <div className="font-serif text-base text-[hsl(var(--ink))]">
                {v.place.name} — {v.place.district.name_bn}
              </div>
              {v.note && <p className="mt-1 text-sm text-[hsl(var(--ink-soft))]">{v.note}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
