import { useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { EmptyState } from '@/components/layout/empty-state'
import { usePlaces } from '@/hooks/use-places'

const MONTH_NAMES = [
  '', 'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
]
const NO_DATE_KEY = '__no_date__'

export default function PlannerPage() {
  const { data: places, isLoading } = usePlaces()

  const grouped = useMemo(() => {
    const upcoming = (places ?? []).filter((p) => p.status === 'wishlist' || p.status === 'planned')
    const map = new Map<string, typeof upcoming>()
    for (const p of upcoming) {
      const key = p.target_date ? p.target_date.slice(0, 7) : NO_DATE_KEY
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(p)
    }
    return [...map.entries()].sort((a, b) => {
      if (a[0] === NO_DATE_KEY) return 1
      if (b[0] === NO_DATE_KEY) return -1
      return a[0].localeCompare(b[0])
    })
  }, [places])

  return (
    <div>
      <PageHeader title="🗓 ভ্রমণ পরিকল্পনা" subtitle="মাস অনুযায়ী পরিকল্পিত ভ্রমণ" />
      {isLoading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-[hsl(var(--ink-soft))]">
          <Loader2 className="h-4 w-4 animate-spin" /> লোড হচ্ছে...
        </div>
      ) : grouped.length === 0 ? (
        <EmptyState icon="🗓" title="এখনো কোনো পরিকল্পনা নেই" description="উইশলিস্ট এন্ট্রিতে পরিকল্পিত মাস দিলে এখানে সাজানো থাকবে।" />
      ) : (
        <div className="flex flex-col gap-5">
          {grouped.map(([key, items]) => {
            const label =
              key === NO_DATE_KEY
                ? 'কোনো তারিখ ঠিক হয়নি'
                : `${MONTH_NAMES[parseInt(key.split('-')[1], 10)]} ${key.split('-')[0]}`
            return (
              <div key={key}>
                <h3 className="mb-2 font-serif text-base text-[hsl(var(--accent-dark))]">
                  🗓 {label} ({items.length} টি)
                </h3>
                <div className="flex flex-col gap-2">
                  {items.map((p) => (
                    <div
                      key={p.id}
                      className="glass flex items-center justify-between rounded-xl border-l-4 border-l-[hsl(var(--wishlist))] px-4 py-3"
                    >
                      <div>
                        <div className="text-sm font-semibold text-[hsl(var(--ink))]">{p.name}</div>
                        <div className="text-xs text-[hsl(var(--ink-soft))]">
                          {p.category.icon} {p.category.name_bn} · {p.district.name_bn}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
