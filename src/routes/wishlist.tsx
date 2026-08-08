import { PageHeader } from '@/components/layout/page-header'
import { PlacesExplorer } from '@/components/places/places-explorer'

export default function WishlistPage() {
  return (
    <div>
      <PageHeader title="❤️ উইশলিস্ট" subtitle="যেসব জায়গায় এখনো যাওয়া হয়নি" />
      <PlacesExplorer forcedStatus="wishlist" addButtonLabel="উইশলিস্টে যোগ করো" />
    </div>
  )
}
