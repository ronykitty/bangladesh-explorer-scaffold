// src/routes/messages.tsx
import { PageHeader } from '@/components/layout/page-header'
import { Messages } from '@/components/messages/Messages'

export default function MessagesPage() {
  return (
    <div>
      <PageHeader title="মেসেজ" />
      <div className="mt-4">
        <Messages />
      </div>
    </div>
  )
}
