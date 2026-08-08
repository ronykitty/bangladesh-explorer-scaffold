import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/page-header'
import { PlacesExplorer } from '@/components/places/places-explorer'

const CATEGORY_GROUPS: Record<string, { label: string; slugs: string[] }> = {
  heritage: { label: 'হেরিটেজ ও স্থাপনা', slugs: ['heritage', 'temples-mosques', 'museums-parks'] },
  rivers: { label: 'নদী ও ঘাট', slugs: ['rivers-ghats'] },
  ferry: { label: 'ফেরিঘাট', slugs: ['ferry-ghats'] },
  railway: { label: 'রেলওয়ে স্টেশন', slugs: ['railway'] },
  roads: { label: 'স্ক্যানিক রোড', slugs: ['scenic-roads'] },
  foods: { label: 'খাবার হোটেল', slugs: ['food-hotels'] },
  sweets: { label: 'মিষ্টির দোকান', slugs: ['sweet-shops'] },
  hotels: { label: 'থাকার হোটেল', slugs: ['lodging'] },
  nature: {
    label: 'প্রকৃতি',
    slugs: ['hills-forests', 'haor-beel', 'waterfalls', 'tea-gardens', 'beaches', 'islands'],
  },
  boat: { label: 'নৌ ভ্রমণ', slugs: ['boat-launch'] },
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const group = (slug && CATEGORY_GROUPS[slug]) || { label: 'ক্যাটাগরি', slugs: [] }

  return (
    <div>
      <PageHeader title={`📂 ${group.label}`} subtitle={`শুধু "${group.label}" ক্যাটাগরির এন্ট্রি এখানে দেখা যাবে`} />
      <PlacesExplorer forcedCategorySlugs={group.slugs} addButtonLabel={`${group.label} যোগ করো`} />
    </div>
  )
}
