import type { PlaceStatus } from '@/types/database'

const STATUS_META: Record<PlaceStatus, { label: string; icon: string; classes: string }> = {
  wishlist: {
    label: 'যেতে চাই',
    icon: '⭐',
    classes: 'bg-[hsl(var(--wishlist-bg))] text-[hsl(var(--accent-dark))]',
  },
  planned: {
    label: 'পরিকল্পিত',
    icon: '🗓',
    classes: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  },
  visited: {
    label: 'ঘুরে এসেছি',
    icon: '✅',
    classes: 'bg-[hsl(var(--visited-bg))] text-[hsl(var(--visited))]',
  },
  revisited: {
    label: 'আবার গিয়েছি',
    icon: '🔁',
    classes: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  },
}

export function StatusBadge({ status }: { status: PlaceStatus }) {
  const meta = STATUS_META[status]
  return (
    <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${meta.classes}`}>
      {meta.icon} {meta.label}
    </span>
  )
}

export { STATUS_META }
