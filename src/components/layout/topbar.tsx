import { Menu, Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/components/theme/theme-provider'
import { cn } from '@/lib/utils'

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, setTheme } = useTheme()

  const options: { value: 'light' | 'dark' | 'system'; icon: typeof Sun }[] = [
    { value: 'light', icon: Sun },
    { value: 'dark', icon: Moon },
    { value: 'system', icon: Monitor },
  ]

  return (
    <header className="glass sticky top-0 z-30 flex h-16 items-center justify-between gap-3 px-4 md:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 hover:bg-[hsl(var(--line)/0.5)] md:hidden"
        aria-label="মেনু খোলো"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="font-serif text-base text-[hsl(var(--ink))] md:hidden">এক্সপ্লোরার</div>

      <div className="ml-auto flex items-center gap-1 rounded-full border border-[hsl(var(--line))] p-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={cn(
              'rounded-full p-1.5 transition-colors',
              theme === opt.value
                ? 'bg-[hsl(var(--accent))] text-[hsl(var(--bg))]'
                : 'text-[hsl(var(--ink-soft))] hover:bg-[hsl(var(--line)/0.5)]'
            )}
            aria-label={opt.value}
          >
            <opt.icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    </header>
  )
}
