// src/routes/friends.tsx
import { PageHeader } from '@/components/layout/page-header'
import { FindFriends } from '@/components/profile/FindFriends'

export default function FriendsPage() {
  return (
    <div>
      <PageHeader title="ফ্রেন্ডস" />
      <div className="mt-4">
        <FindFriends />
      </div>
    </div>
  )
}
