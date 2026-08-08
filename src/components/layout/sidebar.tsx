import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  MapPin,
  Landmark,
  Waves,
  Ship,
  TrainFront,
  Route as RouteIcon,
  UtensilsCrossed,
  Candy,
  Building2,
  Trees,
  Sailboat,
  Images,
  Heart,
  CalendarDays,
  NotebookText,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
  { to: '/places', label: 'সব প্লেস', icon: MapPin },
  { to: '/category/heritage', label: 'হেরিটেজ', icon: Landmark },
  { to: '/category/rivers', label: 'নদী ও ঘাট', icon: Waves },
  { to: '/category/ferry', label: 'ফেরিঘাট', icon: Ship },
  { to: '/category/railway', label: 'রেলওয়ে', icon: TrainFront },
  { to: '/category/roads', label: 'স্ক্যানিক রোড', icon: RouteIcon },
  { to: '/category/foods', label: 'খাবার হোটেল', icon: UtensilsCrossed },
  { to: '/category/sweets', label: 'মিষ্টির দোকান', icon: Candy },
  { to: '/category/hotels', label: 'থাকার হোটেল', icon: Building2 },
  { to: '/category/nature', label: 'প্রকৃতি', icon: Trees },
  { to: '/category/boat', label: 'নৌ ভ্রমণ', icon: Sailboat },
  { to: '/gallery', label: 'ছবি গ্যালারি', icon: Images },
  { to: '/wishlist', label: 'উইশলিস্ট', icon: Heart },
  { to: '/planner', label: 'ভ্রমণ পরিকল্পনা', icon: CalendarDays },
  { to: '/journal', label: 'ভ্রমণ জার্নাল', icon: NotebookText },
  { to: '/settings', label: 'সেটিংস', icon: Settings },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, signOut } = useAuth()

  return (
    <nav className="flex h-full flex-col gap-1 overflow-y-auto px-3 py-5">
      <div className="mb-4 px-2">
        <span className="font-serif text-lg text-[hsl(var(--accent))]">🇧🇩 এক্সপ্লোরার</span>
      </div>
      <div className="flex-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-[hsl(var(--accent))] font-semibold text-[hsl(var(--bg))]'
                  : 'text-[hsl(var(--ink-soft))] hover:bg-[hsl(var(--line)/0.5)]'
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {user && (
        <div className="mt-3 border-t border-[hsl(var(--line))] pt-3">
          <p className="truncate px-3 text-xs text-[hsl(var(--ink-soft))]">{user.email}</p>
          <button
            onClick={() => signOut()}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[hsl(var(--danger))] transition-colors hover:bg-[hsl(var(--danger)/0.1)]"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>লগআউট করো</span>
          </button>
        </div>
      )}
    </nav>
  )
}
