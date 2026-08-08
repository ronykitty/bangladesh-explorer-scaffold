import { PageHeader } from '@/components/layout/page-header'
import { PlacesExplorer } from '@/components/places/places-explorer'

export default function PlacesPage() {
  return (
    <div>
      <PageHeader title="📍 সব প্লেস" subtitle="তোমার যোগ করা সব জায়গা এক জায়গায়" />
      <PlacesExplorer />
    </div>
  )
}
