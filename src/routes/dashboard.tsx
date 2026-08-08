import { useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/page-header'
import { usePlaces } from '@/hooks/use-places'

interface StatCardProps {
  label: string
  value: string | number
  tone?: 'default' | 'visited' | 'wishlist'
}

function StatCard({ label, value, tone = 'default' }: StatCardProps) {
  const toneColor =
    tone === 'visited'
      ? 'text-[hsl(var(--visited))] border-t-[hsl(var(--visited))]'
      : tone === 'wishlist'
        ? 'text-[hsl(var(--wishlist))] border-t-[hsl(var(--wishlist))]'
        : 'text-[hsl(var(--ink))] border-t-[hsl(var(--accent))]'

  return (
    <div className={`glass rounded-xl border-t-4 px-4 py-4 text-center shadow-sm ${toneColor}`}>
      <span className="font-serif text-2xl">{value}</span>
      <p className="mt-1 text-xs text-[hsl(var(--ink-soft))]">{label}</p>
    </div>
  )
}

const MONTH_NAMES = [
  '', 'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
]

export default function DashboardPage() {
  const { data: places, isLoading } = usePlaces()

  const stats = useMemo(() => {
    if (!places) return null
    const total = places.length
    const visited = places.filter((p) => p.status === 'visited' || p.status === 'revisited').length
    const wishlist = places.filter((p) => p.status === 'wishlist').length
    const districtsCovered = new Set(
      places.filter((p) => p.status === 'visited' || p.status === 'revisited').map((p) => p.district_id)
    ).size

    const categoryCounts = new Map<string, { label: string; icon: string; count: number }>()
    for (const p of places) {
      const key = p.category.slug
      const existing = categoryCounts.get(key)
      if (existing) existing.count += 1
      else categoryCounts.set(key, { label: p.category.name_bn, icon: p.category.icon, count: 1 })
    }

    const visitsByYearMonth = new Map<string, Map<string, { name: string; district: string; date: string }[]>>()
    for (const p of places) {
      for (const v of p.visits) {
        const [year, month] = v.visit_date.split('-')
        if (!visitsByYearMonth.has(year)) visitsByYearMonth.set(year, new Map())
        const monthMap = visitsByYearMonth.get(year)!
        if (!monthMap.has(month)) monthMap.set(month, [])
        monthMap.get(month)!.push({ name: p.name, district: p.district.name_bn, date: v.visit_date })
      }
    }

    return {
      total,
      visited,
      wishlist,
      districtsCovered,
      categoryCounts: [...categoryCounts.entries()].sort((a, b) => b[1].count - a[1].count),
      visitsByYearMonth,
    }
  }, [places])

  return (
    <div>
      <PageHeader
        title="📊 ড্যাশবোর্ড"
        subtitle="দেশের প্রতিটি জেলা-উপজেলার নদী, ঘাট, হেরিটেজ, খাবার — আজীবনের ভ্রমণ ডেটাবেস"
      />

      {isLoading || !stats ? (
        <div className="flex items-center gap-2 py-16 text-sm text-[hsl(var(--ink-soft))]">
          <Loader2 className="h-4 w-4 animate-spin" /> লোড হচ্ছে...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Link to="/places">
              <StatCard label="মোট এন্ট্রি" value={stats.total} />
            </Link>
            <Link to="/places">
              <StatCard label="ঘুরে এসেছি" value={stats.visited} tone="visited" />
            </Link>
            <Link to="/wishlist">
              <StatCard label="যেতে চাই" value={stats.wishlist} tone="wishlist" />
            </Link>
            <StatCard label="জেলা কভার হয়েছে" value={`${stats.districtsCovered}/৬৪`} />
          </div>

          {stats.categoryCounts.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {stats.categoryCounts.map(([slug, c]) => (
                <span
                  key={slug}
                  className="glass rounded-full px-3 py-1.5 text-xs text-[hsl(var(--ink-soft))]"
                >
                  {c.icon} {c.label}{' '}
                  <span className="ml-1 rounded-full bg-[hsl(var(--line))] px-1.5 font-bold text-[hsl(var(--ink))]">
                    {c.count}
                  </span>
                </span>
              ))}
            </div>
          )}

          <div className="glass mt-6 rounded-xl p-4">
            <h2 className="font-serif text-base text-[hsl(var(--accent-dark))]">🗓 বছর ও মাস অনুযায়ী রিপোর্ট</h2>
            {stats.visitsByYearMonth.size === 0 ? (
              <p className="mt-2 text-sm text-[hsl(var(--ink-soft))]">এখনো কোনো ভিজিট তারিখসহ যোগ হয়নি।</p>
            ) : (
              <div className="mt-3 flex flex-col gap-3">
                {[...stats.visitsByYearMonth.entries()]
                  .sort((a, b) => Number(b[0]) - Number(a[0]))
                  .map(([year, months]) => (
                    <details key={year} className="rounded-lg border border-[hsl(var(--line))]">
                      <summary className="cursor-pointer rounded-lg bg-[hsl(var(--line)/0.3)] px-3 py-2 font-serif text-sm text-[hsl(var(--accent-dark))]">
                        {year} ({[...months.values()].reduce((sum, arr) => sum + arr.length, 0)} টি ভিজিট)
                      </summary>
                      <div className="px-3 py-2">
                        {[...months.entries()]
                          .sort((a, b) => Number(b[0]) - Number(a[0]))
                          .map(([month, visits]) => (
                            <div key={month} className="mb-2">
                              <h4 className="text-xs font-semibold text-[hsl(var(--ink-soft))]">
                                {MONTH_NAMES[parseInt(month, 10)]} ({visits.length} টি)
                              </h4>
                              {visits.map((v, i) => (
                                <div key={i} className="flex justify-between py-0.5 text-xs">
                                  <span>📍 {v.name} — {v.district}</span>
                                  <span className="text-[hsl(var(--ink-soft))]">{v.date}</span>
                                </div>
                              ))}
                            </div>
                          ))}
                      </div>
                    </details>
                  ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
