import { useMemo } from 'react'
import { Loader2, MapPinned, Star, CalendarClock, Layers, Wallet, Bus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/page-header'
import { usePlaces, type PlaceWithRelations, type PlacePriority, type TransportMode } from '@/hooks/use-places'
import { useDivisions, useDistricts } from '@/hooks/use-reference-data'
import { useOverallExpenseStats } from '@/hooks/useExpenses'
// Adjust this import path if status-badge.tsx lives elsewhere in your project
import { STATUS_META } from '@/components/places/status-badge'
import type { PlaceStatus } from '@/types/database'

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  tone?: 'default' | 'visited' | 'wishlist'
  icon?: React.ReactNode
}

function StatCard({ label, value, hint, tone = 'default', icon }: StatCardProps) {
  const toneColor =
    tone === 'visited'
      ? 'text-[hsl(var(--visited))] border-t-[hsl(var(--visited))]'
      : tone === 'wishlist'
        ? 'text-[hsl(var(--wishlist))] border-t-[hsl(var(--wishlist))]'
        : 'text-[hsl(var(--ink))] border-t-[hsl(var(--accent))]'

  return (
    <div className={`glass rounded-xl border-t-4 px-4 py-4 text-center shadow-sm ${toneColor}`}>
      {icon && <div className="mb-1 flex justify-center opacity-70">{icon}</div>}
      <span className="font-serif text-2xl">{value}</span>
      <p className="mt-1 text-xs text-[hsl(var(--ink-soft))]">{label}</p>
      {hint && <p className="mt-0.5 text-[10px] text-[hsl(var(--ink-soft))]/70">{hint}</p>}
    </div>
  )
}

const STATUS_BAR_COLOR: Record<PlaceStatus, string> = {
  wishlist: 'bg-[hsl(var(--wishlist))]',
  planned: 'bg-blue-500 dark:bg-blue-400',
  visited: 'bg-[hsl(var(--visited))]',
  revisited: 'bg-violet-500 dark:bg-violet-400',
}

function CoverageBar({ percent, colorClass }: { percent: number; colorClass: string }) {
  const clamped = Math.min(100, Math.max(0, percent))
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--line)/0.5)]">
      <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${clamped}%` }} />
    </div>
  )
}

const MONTH_NAMES = [
  '', 'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
]

const STATUS_ORDER: PlaceStatus[] = ['wishlist', 'planned', 'visited', 'revisited']

const PRIORITY_META: Record<PlacePriority, { label: string; color: string }> = {
  p1_must_visit: { label: 'P1 - Must Visit', color: 'bg-red-500 dark:bg-red-400' },
  p2_high: { label: 'P2 - High', color: 'bg-orange-500 dark:bg-orange-400' },
  p3_normal: { label: 'P3 - Normal', color: 'bg-yellow-500 dark:bg-yellow-400' },
  p4_optional: { label: 'P4 - Optional', color: 'bg-gray-400 dark:bg-gray-500' },
}
const PRIORITY_ORDER: PlacePriority[] = ['p1_must_visit', 'p2_high', 'p3_normal', 'p4_optional']

const TRANSPORT_META: Record<TransportMode, string> = {
  train: 'ট্রেন',
  local_train: 'লোকাল ট্রেন',
  bus: 'বাস',
  local_bus: 'লোকাল বাস',
  launch_boat: 'লঞ্চ / নৌকা',
  rickshaw_auto_cng: 'রিকশা / অটো / সিএনজি',
  mixed: 'মিশ্র / একাধিক',
}
const TRANSPORT_ORDER: TransportMode[] = [
  'train', 'local_train', 'bus', 'local_bus', 'launch_boat', 'rickshaw_auto_cng', 'mixed',
]

const currency = (n: number) => `৳${n.toLocaleString('en-BD', { maximumFractionDigits: 0 })}`

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { data: places, isLoading } = usePlaces()
  const { data: divisions } = useDivisions()
  const { data: districts } = useDistricts()
  const {
    totalExpense: actualTotalExpense,
    hasExpenses,
    byMonth: expenseByMonth,
    loading: expenseLoading,
  } = useOverallExpenseStats()

  const stats = useMemo(() => {
    if (!places) return null

    const total = places.length
    const visitedCount = places.filter((p) => p.status === 'visited' || p.status === 'revisited').length
    const wishlistCount = places.filter((p) => p.status === 'wishlist').length
    const plannedCount = places.filter((p) => p.status === 'planned').length
    const revisitedCount = places.filter((p) => p.status === 'revisited').length
    const isVisited = (p: PlaceWithRelations) => p.status === 'visited' || p.status === 'revisited'

    // --- Status progress -----------------------------------------------
    const statusProgress = STATUS_ORDER.map((status) => {
      const count = places.filter((p) => p.status === status).length
      return {
        status,
        count,
        percent: total > 0 ? (count / total) * 100 : 0,
      }
    })

    // --- Geography coverage ---------------------------------------------
    const districtsVisited = new Set(
      places.filter(isVisited).map((p) => p.district_id)
    ).size

    const divisionsVisited = new Set(
      places.filter(isVisited).map((p) => p.district.division.id)
    ).size

    const upazilasVisited = new Set(
      places.filter((p) => isVisited(p) && p.upazila_name).map((p) => `${p.district_id}__${p.upazila_name}`)
    ).size

    // --- Division coverage table -----------------------------------------
    const divisionMap = new Map<
      string,
      { name: string; total: number; visited: number; wishlist: number }
    >()
    for (const p of places) {
      const key = p.district.division.id
      const existing = divisionMap.get(key) ?? {
        name: p.district.division.name_bn,
        total: 0,
        visited: 0,
        wishlist: 0,
      }
      existing.total += 1
      if (isVisited(p)) existing.visited += 1
      if (p.status === 'wishlist') existing.wishlist += 1
      divisionMap.set(key, existing)
    }
    const divisionCoverage = [...divisionMap.values()].sort((a, b) => b.total - a.total)

    // --- District-wise coverage table -------------------------------------
    const districtMap = new Map<
      string,
      { name: string; total: number; visited: number; wishlist: number }
    >()
    for (const p of places) {
      const key = p.district_id
      const existing = districtMap.get(key) ?? {
        name: p.district.name_bn,
        total: 0,
        visited: 0,
        wishlist: 0,
      }
      existing.total += 1
      if (isVisited(p)) existing.visited += 1
      if (p.status === 'wishlist') existing.wishlist += 1
      districtMap.set(key, existing)
    }
    const districtCoverage = [...districtMap.values()].sort((a, b) => b.total - a.total)

    // --- Upazila-wise coverage table ---------------------------------------
    const upazilaMap = new Map<
      string,
      { district: string; upazila: string; total: number; visited: number; wishlist: number }
    >()
    for (const p of places) {
      if (!p.upazila_name) continue
      const key = `${p.district_id}__${p.upazila_name}`
      const existing = upazilaMap.get(key) ?? {
        district: p.district.name_bn,
        upazila: p.upazila_name,
        total: 0,
        visited: 0,
        wishlist: 0,
      }
      existing.total += 1
      if (isVisited(p)) existing.visited += 1
      if (p.status === 'wishlist') existing.wishlist += 1
      upazilaMap.set(key, existing)
    }
    const upazilaCoverage = [...upazilaMap.values()].sort((a, b) => b.total - a.total)

    // --- Category breakdown -------------------------------------------------
    const categoryMap = new Map<
      string,
      { label: string; icon: string; total: number; visited: number }
    >()
    for (const p of places) {
      const key = p.category.slug
      const existing = categoryMap.get(key) ?? {
        label: p.category.name_bn,
        icon: p.category.icon,
        total: 0,
        visited: 0,
      }
      existing.total += 1
      if (isVisited(p)) existing.visited += 1
      categoryMap.set(key, existing)
    }
    const categoryCounts = [...categoryMap.entries()].sort((a, b) => b[1].total - a[1].total)

    // --- Priority breakdown --------------------------------------------------
    const priorityCounts = PRIORITY_ORDER.map((priority) => ({
      priority,
      count: places.filter((p) => p.priority === priority).length,
    }))

    // --- Rating ----------------------------------------------------------
    const ratings = places
      .map((p) => p.personal_rating)
      .filter((r): r is number => r != null)
    const avgRating = ratings.length > 0 ? ratings.reduce((s, r) => s + r, 0) / ratings.length : null

    // --- Budget & cost tracker ------------------------------------------
    const spotsWithCost = places.filter((p) => p.estimated_cost != null)
    const totalBudgetAll = spotsWithCost.reduce((s, p) => s + (p.estimated_cost ?? 0), 0)
    const visitedSpotsWithCost = spotsWithCost.filter(isVisited)
    const totalSpentVisited = visitedSpotsWithCost.reduce((s, p) => s + (p.estimated_cost ?? 0), 0)
    const remainingEstimate = totalBudgetAll - totalSpentVisited
    const avgCostAll = spotsWithCost.length > 0 ? totalBudgetAll / spotsWithCost.length : 0
    const avgCostVisited =
      visitedSpotsWithCost.length > 0 ? totalSpentVisited / visitedSpotsWithCost.length : 0

    // --- Transport mode analysis ------------------------------------------
    const transportAnalysis = TRANSPORT_ORDER.map((mode) => {
      const modeSpots = places.filter((p) => p.transport_mode === mode)
      const visitedModeSpots = modeSpots.filter(isVisited)
      const totalCostVisited = visitedModeSpots.reduce((s, p) => s + (p.estimated_cost ?? 0), 0)
      return {
        mode,
        total: modeSpots.length,
        visited: visitedModeSpots.length,
        totalCostVisited,
      }
    }).filter((t) => t.total > 0)

    // --- Upcoming trips (target_date in the future, not yet visited) ------
    const today = new Date().toISOString().slice(0, 10)
    const upcoming = places
      .filter((p) => p.target_date && p.target_date >= today && !isVisited(p))
      .sort((a, b) => (a.target_date! < b.target_date! ? -1 : 1))
      .slice(0, 6)

    // --- Visits grouped by year / month (journal-style report) ------------
    const visitsByYearMonth = new Map<
      string,
      Map<string, { name: string; district: string; date: string }[]>
    >()
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
      visitedCount,
      wishlistCount,
      plannedCount,
      revisitedCount,
      statusProgress,
      districtsVisited,
      divisionsVisited,
      upazilasVisited,
      divisionCoverage,
      districtCoverage,
      upazilaCoverage,
      categoryCounts,
      priorityCounts,
      avgRating,
      totalBudgetAll,
      totalSpentVisited,
      remainingEstimate,
      avgCostAll,
      avgCostVisited,
      transportAnalysis,
      upcoming,
      visitsByYearMonth,
    }
  }, [places])

  const totalDivisions = divisions?.length ?? 8
  const totalDistricts = districts?.length ?? 64

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
      ) : stats.total === 0 ? (
        <div className="glass flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
          <span className="mb-3 text-4xl">📍</span>
          <h3 className="font-serif text-lg text-[hsl(var(--ink))]">এখনো কোনো এন্ট্রি নেই</h3>
          <p className="mt-2 max-w-sm text-sm text-[hsl(var(--ink-soft))]">
            "সব প্লেস" পেজ থেকে প্রথম জায়গাটা যোগ করলেই এখানে পরিসংখ্যান দেখা শুরু হবে।
          </p>
        </div>
      ) : (
        <>
          {/* ---------------- Lifetime overview ---------------- */}
          <section>
            <h2 className="mb-3 font-serif text-base text-[hsl(var(--accent-dark))]">🏆 লাইফটাইম ওভারভিউ</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Link to="/places">
                <StatCard label="মোট এন্ট্রি" value={stats.total} />
              </Link>
              <Link to="/places">
                <StatCard label="ঘুরে এসেছি" value={stats.visitedCount} tone="visited" />
              </Link>
              <Link to="/wishlist">
                <StatCard label="যেতে চাই" value={stats.wishlistCount} tone="wishlist" />
              </Link>
              <StatCard label="পরিকল্পিত" value={stats.plannedCount} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                icon={<MapPinned className="h-4 w-4" />}
                label="জেলা কভার হয়েছে"
                value={`${stats.districtsVisited}/${totalDistricts}`}
              />
              <StatCard
                icon={<Layers className="h-4 w-4" />}
                label="বিভাগ কভার হয়েছে"
                value={`${stats.divisionsVisited}/${totalDivisions}`}
              />
              <StatCard
                icon={<MapPinned className="h-4 w-4" />}
                label="উপজেলা কভার হয়েছে"
                value={stats.upazilasVisited}
              />
              <StatCard
                icon={<Star className="h-4 w-4" />}
                label="গড় রেটিং"
                value={stats.avgRating != null ? `${stats.avgRating.toFixed(1)} / ৫` : '—'}
              />
            </div>
          </section>

          {/* ---------------- Status progress ---------------- */}
          <section className="glass mt-6 rounded-xl p-4">
            <h2 className="font-serif text-base text-[hsl(var(--accent-dark))]">📊 স্ট্যাটাস অনুযায়ী অগ্রগতি</h2>
            <div className="mt-3 flex flex-col gap-3">
              {stats.statusProgress.map(({ status, count, percent }) => {
                const meta = STATUS_META[status]
                return (
                  <div key={status}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-semibold text-[hsl(var(--ink))]">
                        {meta.icon} {meta.label}
                      </span>
                      <span className="text-[hsl(var(--ink-soft))]">
                        {count} টি · {percent.toFixed(0)}%
                      </span>
                    </div>
                    <CoverageBar percent={percent} colorClass={STATUS_BAR_COLOR[status]} />
                  </div>
                )
              })}
            </div>
          </section>

          {/* ---------------- Division coverage ---------------- */}
          <section className="glass mt-6 rounded-xl p-4">
            <h2 className="font-serif text-base text-[hsl(var(--accent-dark))]">🏞️ বিভাগ অনুযায়ী কভারেজ</h2>
            <div className="mt-3 flex flex-col gap-3">
              {stats.divisionCoverage.map((d) => {
                const percent = d.total > 0 ? (d.visited / d.total) * 100 : 0
                return (
                  <div key={d.name}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-semibold text-[hsl(var(--ink))]">{d.name}</span>
                      <span className="text-[hsl(var(--ink-soft))]">
                        {d.visited}/{d.total} ঘুরে দেখা · {d.wishlist} উইশলিস্টে · {percent.toFixed(0)}%
                      </span>
                    </div>
                    <CoverageBar percent={percent} colorClass="bg-[hsl(var(--accent))]" />
                  </div>
                )
              })}
            </div>
          </section>

          {/* ---------------- District-wise coverage ---------------- */}
          <section className="glass mt-6 rounded-xl p-4">
            <h2 className="font-serif text-base text-[hsl(var(--accent-dark))]">🗺️ জেলাভিত্তিক কভারেজ</h2>
            <p className="mt-1 text-xs text-[hsl(var(--ink-soft))]">
              প্রতিটি জেলা যেখানে অন্তত ১টি স্পট যোগ করা হয়েছে
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-xs">
                <thead>
                  <tr className="border-b border-[hsl(var(--line))] text-[hsl(var(--ink-soft))]">
                    <th className="py-1.5 pr-2">#</th>
                    <th className="py-1.5 pr-2">জেলা</th>
                    <th className="py-1.5 pr-2 text-right">মোট স্পট</th>
                    <th className="py-1.5 pr-2 text-right">ঘুরে দেখা</th>
                    <th className="py-1.5 pr-2 text-right">উইশলিস্ট</th>
                    <th className="py-1.5 pr-2 text-right">% ঘুরে দেখা</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.districtCoverage.map((d, i) => {
                    const percent = d.total > 0 ? (d.visited / d.total) * 100 : 0
                    return (
                      <tr key={d.name} className="border-b border-[hsl(var(--line)/0.5)]">
                        <td className="py-1.5 pr-2 text-[hsl(var(--ink-soft))]">{i + 1}</td>
                        <td className="py-1.5 pr-2 font-semibold text-[hsl(var(--ink))]">{d.name}</td>
                        <td className="py-1.5 pr-2 text-right">{d.total}</td>
                        <td className="py-1.5 pr-2 text-right text-[hsl(var(--visited))]">{d.visited}</td>
                        <td className="py-1.5 pr-2 text-right text-[hsl(var(--wishlist))]">{d.wishlist}</td>
                        <td className="py-1.5 pr-2 text-right">{percent.toFixed(0)}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* ---------------- Upazila-wise coverage ---------------- */}
          {stats.upazilaCoverage.length > 0 && (
            <section className="glass mt-6 rounded-xl p-4">
              <h2 className="font-serif text-base text-[hsl(var(--accent-dark))]">📍 উপজেলাভিত্তিক কভারেজ</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-[hsl(var(--line))] text-[hsl(var(--ink-soft))]">
                      <th className="py-1.5 pr-2">জেলা</th>
                      <th className="py-1.5 pr-2">উপজেলা / থানা</th>
                      <th className="py-1.5 pr-2 text-right">মোট স্পট</th>
                      <th className="py-1.5 pr-2 text-right">ঘুরে দেখা</th>
                      <th className="py-1.5 pr-2 text-right">উইশলিস্ট</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.upazilaCoverage.slice(0, 15).map((u) => (
                      <tr key={`${u.district}-${u.upazila}`} className="border-b border-[hsl(var(--line)/0.5)]">
                        <td className="py-1.5 pr-2 text-[hsl(var(--ink-soft))]">{u.district}</td>
                        <td className="py-1.5 pr-2 font-semibold text-[hsl(var(--ink))]">{u.upazila}</td>
                        <td className="py-1.5 pr-2 text-right">{u.total}</td>
                        <td className="py-1.5 pr-2 text-right text-[hsl(var(--visited))]">{u.visited}</td>
                        <td className="py-1.5 pr-2 text-right text-[hsl(var(--wishlist))]">{u.wishlist}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ---------------- Category & Priority ---------------- */}
          <section className="glass mt-6 rounded-xl p-4">
            <h2 className="font-serif text-base text-[hsl(var(--accent-dark))]">🏷️ ক্যাটাগরি ও অগ্রাধিকার</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {stats.categoryCounts.map(([slug, c]) => (
                <span
                  key={slug}
                  className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-[hsl(var(--ink-soft))]"
                >
                  {c.icon} {c.label}
                  <span className="rounded-full bg-[hsl(var(--line))] px-1.5 font-bold text-[hsl(var(--ink))]">
                    {c.total}
                  </span>
                  {c.visited > 0 && (
                    <span className="rounded-full bg-[hsl(var(--visited-bg))] px-1.5 font-bold text-[hsl(var(--visited))]">
                      ✅ {c.visited}
                    </span>
                  )}
                </span>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-[hsl(var(--line)/0.5)] pt-4">
              {stats.priorityCounts.map(({ priority, count }) => {
                const meta = PRIORITY_META[priority]
                const percent = stats.total > 0 ? (count / stats.total) * 100 : 0
                return (
                  <div key={priority}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-semibold text-[hsl(var(--ink))]">{meta.label}</span>
                      <span className="text-[hsl(var(--ink-soft))]">{count} টি</span>
                    </div>
                    <CoverageBar percent={percent} colorClass={meta.color} />
                  </div>
                )
              })}
            </div>
          </section>

          {/* ---------------- Actual Trip Expenses (real `expenses` table — single source of truth) ---------------- */}
          <section className="glass mt-6 rounded-xl p-4">
            <h2 className="flex items-center gap-2 font-serif text-base text-[hsl(var(--accent-dark))]">
              <Wallet className="h-4 w-4" /> প্রকৃত ভ্রমণ খরচ
            </h2>

            {expenseLoading ? (
              <p className="mt-2 flex items-center gap-2 text-sm text-[hsl(var(--ink-soft))]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> লোড হচ্ছে...
              </p>
            ) : !hasExpenses ? (
              <p className="mt-2 text-sm text-[hsl(var(--ink-soft))]">কোনো খরচের তথ্য নেই</p>
            ) : (
              <>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <StatCard
                    label="মোট প্রকৃত খরচ (সব ট্রিপ)"
                    value={currency(actualTotalExpense)}
                    tone="visited"
                  />
                </div>

                {expenseByMonth.length > 0 && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[280px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-[hsl(var(--line))] text-[hsl(var(--ink-soft))]">
                          <th className="py-1.5 pr-2">মাস</th>
                          <th className="py-1.5 pr-2 text-right">খরচ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...expenseByMonth].reverse().map((m) => (
                          <tr key={m.month} className="border-b border-[hsl(var(--line)/0.5)]">
                            <td className="py-1.5 pr-2">{m.month}</td>
                            <td className="py-1.5 pr-2 text-right font-semibold text-[hsl(var(--ink))]">
                              {currency(m.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            <p className="mt-3 text-[10px] text-[hsl(var(--ink-soft))]/70">
              এই সংখ্যাগুলো ট্রিপে সরাসরি যোগ করা প্রকৃত <code>expenses</code> রেকর্ড থেকে হিসাব করা — কোনো অনুমান নয়।
            </p>
          </section>

          {/* ---------------- Planning Estimate (place-level `estimated_cost` — separate from actual expense) ---------------- */}
          <section className="glass mt-6 rounded-xl p-4">
            <h2 className="font-serif text-base text-[hsl(var(--accent-dark))]">🧮 প্ল্যানিং অনুমান (স্পটভিত্তিক)</h2>
            <p className="mt-1 text-xs text-[hsl(var(--ink-soft))]">
              নিচের সংখ্যাগুলো প্রতিটি স্পটে যোগ করা আনুমানিক খরচ থেকে — এটা প্রকৃত খরচ নয়, শুধু পরিকল্পনার জন্য একটা ধারণা।
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="মোট আনুমানিক বাজেট" value={currency(stats.totalBudgetAll)} />
              <StatCard label="আনুমানিক — ভ্রমণকৃত স্পট" value={currency(stats.totalSpentVisited)} />
              <StatCard label="বাকি আনুমানিক" value={currency(stats.remainingEstimate)} tone="wishlist" />
              <StatCard label="গড় আনুমানিক / স্পট" value={currency(stats.avgCostVisited)} />
            </div>
            <p className="mt-2 text-[10px] text-[hsl(var(--ink-soft))]/70">
              গড় আনুমানিক / স্পট (সব): {currency(stats.avgCostAll)} · শুধু যেসব স্পটে estimated_cost যোগ করা আছে সেগুলো হিসাবে ধরা হয়েছে।
            </p>
          </section>

          {/* ---------------- Transport Mode Analysis ---------------- */}
          {stats.transportAnalysis.length > 0 && (
            <section className="glass mt-6 rounded-xl p-4">
              <h2 className="flex items-center gap-2 font-serif text-base text-[hsl(var(--accent-dark))]">
                <Bus className="h-4 w-4" /> যাতায়াত মাধ্যম বিশ্লেষণ
              </h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-[hsl(var(--line))] text-[hsl(var(--ink-soft))]">
                      <th className="py-1.5 pr-2">মাধ্যম</th>
                      <th className="py-1.5 pr-2 text-right">মোট স্পট</th>
                      <th className="py-1.5 pr-2 text-right">ঘুরে দেখা</th>
                      <th className="py-1.5 pr-2 text-right">মোট খরচ (ভ্রমণকৃত)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.transportAnalysis.map((t) => (
                      <tr key={t.mode} className="border-b border-[hsl(var(--line)/0.5)]">
                        <td className="py-1.5 pr-2 font-semibold text-[hsl(var(--ink))]">
                          {TRANSPORT_META[t.mode]}
                        </td>
                        <td className="py-1.5 pr-2 text-right">{t.total}</td>
                        <td className="py-1.5 pr-2 text-right text-[hsl(var(--visited))]">{t.visited}</td>
                        <td className="py-1.5 pr-2 text-right">{currency(t.totalCostVisited)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ---------------- Upcoming trips ---------------- */}
          {stats.upcoming.length > 0 && (
            <section className="glass mt-6 rounded-xl p-4">
              <h2 className="flex items-center gap-2 font-serif text-base text-[hsl(var(--accent-dark))]">
                <CalendarClock className="h-4 w-4" /> আসন্ন ভ্রমণ
              </h2>
              <div className="mt-3 flex flex-col gap-2">
                {stats.upcoming.map((p: PlaceWithRelations) => (
                  <div key={p.id} className="flex items-center justify-between text-xs">
                    <span>
                      📍 {p.name} — {p.district.name_bn}
                    </span>
                    <span className="font-semibold text-[hsl(var(--accent-dark))]">{p.target_date}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ---------------- Yearly / monthly visit report ---------------- */}
          <section className="glass mt-6 rounded-xl p-4">
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
                                  <span>
                                    📍 {v.name} — {v.district}
                                  </span>
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
          </section>
        </>
      )}
    </div>
  )
}
