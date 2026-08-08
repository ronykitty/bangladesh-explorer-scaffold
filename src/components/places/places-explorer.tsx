import { useMemo, useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { usePlaces, type PlaceWithRelations } from '@/hooks/use-places'
import { useDivisions, useCategories } from '@/hooks/use-reference-data'
import { PlaceCard } from './place-card'
import { PlaceForm } from './place-form'
import { EmptyState } from '@/components/layout/empty-state'
import type { PlaceStatus } from '@/types/database'

interface PlacesExplorerProps {
  forcedCategorySlugs?: string[]
  forcedStatus?: PlaceStatus
  addButtonLabel?: string
}

export function PlacesExplorer({ forcedCategorySlugs, forcedStatus, addButtonLabel }: PlacesExplorerProps) {
  const { data: places, isLoading, isError, error } = usePlaces()
  const { data: divisions } = useDivisions()
  const { data: categories } = useCategories()

  const [search, setSearch] = useState('')
  const [divisionFilter, setDivisionFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingPlace, setEditingPlace] = useState<PlaceWithRelations | null>(null)

  const presetCategoryId =
    forcedCategorySlugs && forcedCategorySlugs.length === 1
      ? categories?.find((c) => c.slug === forcedCategorySlugs[0])?.id
      : undefined

  const filtered = useMemo(() => {
    if (!places) return []
    return places.filter((p) => {
      if (forcedCategorySlugs && !forcedCategorySlugs.includes(p.category.slug)) return false
      if (forcedStatus && p.status !== forcedStatus) return false
      if (divisionFilter && p.district.division_id !== divisionFilter) return false
      if (categoryFilter && p.category_id !== categoryFilter) return false
      if (statusFilter && p.status !== statusFilter) return false
      if (search) {
        const hay = `${p.name} ${p.district.name_bn} ${p.upazila_name ?? ''} ${p.union_village ?? ''} ${p.description ?? ''}`.toLowerCase()
        if (!hay.includes(search.toLowerCase())) return false
      }
      return true
    })
  }, [places, forcedCategorySlugs, forcedStatus, divisionFilter, categoryFilter, statusFilter, search])

  const grouped = useMemo(() => {
    const map = new Map<string, PlaceWithRelations[]>()
    for (const p of filtered) {
      const key = p.district.name_bn
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(p)
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], 'bn'))
  }, [filtered])

  const openAdd = () => {
    setEditingPlace(null)
    setFormOpen(true)
  }
  const openEdit = (place: PlaceWithRelations) => {
    setEditingPlace(place)
    setFormOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-[hsl(var(--ink-soft))]">
        <Loader2 className="h-4 w-4 animate-spin" /> লোড হচ্ছে...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl bg-[hsl(var(--danger)/0.1)] px-4 py-4 text-sm text-[hsl(var(--danger))]">
        ডেটা আনতে সমস্যা হয়েছে: {error instanceof Error ? error.message : 'অজানা সমস্যা'}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--accent))] px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
        >
          <Plus className="h-4 w-4" /> {addButtonLabel ?? 'নতুন এন্ট্রি'}
        </button>
      </div>

      <div className="glass mb-5 flex flex-wrap gap-2 rounded-xl p-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="খোঁজো (নাম, জেলা, নোট...)"
          className="min-w-[160px] flex-1 rounded-lg border border-[hsl(var(--line))] bg-white/70 px-3 py-2 text-sm"
        />
        <select
          value={divisionFilter}
          onChange={(e) => setDivisionFilter(e.target.value)}
          className="rounded-lg border border-[hsl(var(--line))] bg-white/70 px-3 py-2 text-sm"
        >
          <option value="">সব বিভাগ</option>
          {divisions?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name_bn}
            </option>
          ))}
        </select>
        {!forcedCategorySlugs && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-[hsl(var(--line))] bg-white/70 px-3 py-2 text-sm"
          >
            <option value="">সব ক্যাটাগরি</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name_bn}
              </option>
            ))}
          </select>
        )}
        {!forcedStatus && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[hsl(var(--line))] bg-white/70 px-3 py-2 text-sm"
          >
            <option value="">সব অবস্থা</option>
            <option value="wishlist">যেতে চাই</option>
            <option value="planned">পরিকল্পিত</option>
            <option value="visited">ঘুরে এসেছি</option>
            <option value="revisited">আবার গিয়েছি</option>
          </select>
        )}
      </div>

      {grouped.length === 0 ? (
        <EmptyState title="কোনো এন্ট্রি নেই" description="উপরে 'নতুন এন্ট্রি' চেপে প্রথম জায়গাটা যোগ করো।" />
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map(([district, districtPlaces]) => (
            <div key={district}>
              <div className="mb-2 flex items-center justify-between border-b-2 border-[hsl(var(--line))] pb-1.5">
                <h3 className="font-serif text-base text-[hsl(var(--accent-dark))]">📍 {district}</h3>
                <span className="text-xs text-[hsl(var(--ink-soft))]">{districtPlaces.length} টি</span>
              </div>
              <div className="flex flex-col gap-3">
                {districtPlaces.map((p) => (
                  <PlaceCard key={p.id} place={p} onEdit={openEdit} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <PlaceForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editingPlace={editingPlace}
        presetCategoryId={presetCategoryId}
        presetStatus={forcedStatus}
      />
    </div>
  )
}
