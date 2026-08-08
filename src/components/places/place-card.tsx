import { useState } from 'react'
import { StatusBadge } from './status-badge'
import { useAddVisit, useDeleteVisit, useDeletePlace, type PlaceWithRelations } from '@/hooks/use-places'

interface PlaceCardProps {
  place: PlaceWithRelations
  onEdit: (place: PlaceWithRelations) => void
}

export function PlaceCard({ place, onEdit }: PlaceCardProps) {
  const [addingVisit, setAddingVisit] = useState(false)
  const [visitDate, setVisitDate] = useState('')
  const [visitNote, setVisitNote] = useState('')
  const addVisit = useAddVisit()
  const deleteVisit = useDeleteVisit()
  const deletePlace = useDeletePlace()

  const borderColor =
    place.status === 'visited' || place.status === 'revisited'
      ? 'border-l-[hsl(var(--visited))]'
      : 'border-l-[hsl(var(--wishlist))]'

  const handleAddVisit = async () => {
    if (!visitDate) return
    await addVisit.mutateAsync({ placeId: place.id, visitDate, note: visitNote || undefined })
    setAddingVisit(false)
    setVisitDate('')
    setVisitNote('')
  }

  const handleDelete = async () => {
    if (!confirm(`"${place.name}" এন্ট্রিটা মুছে ফেলতে চাও?`)) return
    await deletePlace.mutateAsync(place.id)
  }

  return (
    <div className={`glass rounded-xl border-l-4 px-4 py-4 shadow-sm ${borderColor}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          {place.photo_url && (
            <img
              src={place.photo_url}
              alt={place.name}
              className="h-14 w-14 shrink-0 rounded-lg object-cover"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
          )}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--accent-dark))]">
              {place.category.icon} {place.category.name_bn}
            </div>
            <div className="font-serif text-base text-[hsl(var(--ink))]">{place.name}</div>
            <div className="text-xs text-[hsl(var(--ink-soft))]">
              {place.district.name_bn}
              {place.upazila_name ? ` · ${place.upazila_name}` : ''}
              {place.union_village ? ` · ${place.union_village}` : ''}
            </div>
          </div>
        </div>
        <StatusBadge status={place.status} />
      </div>

      {place.description && <p className="mt-2 text-sm text-[hsl(var(--ink-soft))]">{place.description}</p>}

      <div className="mt-2 flex flex-wrap gap-3 text-xs text-[hsl(var(--ink-soft))]">
        {place.personal_rating != null && <span>⭐ {place.personal_rating}/৫</span>}
        {place.target_date && <span>🗓 পরিকল্পিত: {place.target_date}</span>}
        {place.google_maps_url && (
          <a
            href={place.google_maps_url}
            target="_blank"
            rel="noreferrer"
            className="text-[hsl(var(--accent-dark))] underline"
          >
            📍 Google Maps
          </a>
        )}
      </div>

      {place.visits.length > 0 && (
        <div className="mt-3 border-t border-dashed border-[hsl(var(--line))] pt-2">
          {[...place.visits]
            .sort((a, b) => b.visit_date.localeCompare(a.visit_date))
            .map((v) => (
              <div key={v.id} className="flex items-start justify-between gap-2 py-1 text-xs">
                <span className="font-semibold text-[hsl(var(--visited))]">{v.visit_date}</span>
                <span className="flex-1 text-[hsl(var(--ink-soft))]">{v.note}</span>
                <button
                  onClick={() => deleteVisit.mutate(v.id)}
                  className="text-[hsl(var(--danger))]"
                  aria-label="ভিজিট মুছো"
                >
                  ✕
                </button>
              </div>
            ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => onEdit(place)}
          className="rounded-lg border border-[hsl(var(--line))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--ink))] hover:bg-[hsl(var(--line)/0.4)]"
        >
          ✏️ এডিট
        </button>
        <button
          onClick={() => setAddingVisit((v) => !v)}
          className="rounded-lg border border-[hsl(var(--visited))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--visited))] hover:bg-[hsl(var(--visited-bg))]"
        >
          ➕ ভিজিট যোগ করো
        </button>
        <button
          onClick={handleDelete}
          className="rounded-lg border border-[hsl(var(--danger))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger)/0.1)]"
        >
          মুছে ফেলো
        </button>
      </div>

      {addingVisit && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-[hsl(var(--line)/0.3)] p-2">
          <input
            type="date"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            className="rounded-md border border-[hsl(var(--line))] bg-white px-2 py-1.5 text-xs"
          />
          <input
            type="text"
            value={visitNote}
            onChange={(e) => setVisitNote(e.target.value)}
            placeholder="নোট (ঐচ্ছিক)"
            className="min-w-[140px] flex-1 rounded-md border border-[hsl(var(--line))] bg-white px-2 py-1.5 text-xs"
          />
          <button
            onClick={handleAddVisit}
            disabled={!visitDate || addVisit.isPending}
            className="rounded-md bg-[hsl(var(--visited))] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
          >
            সংরক্ষণ
          </button>
        </div>
      )}
    </div>
  )
}
