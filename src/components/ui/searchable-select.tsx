import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'

export interface SearchableSelectOption {
  value: string
  label: string
  sublabel?: string
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  disabledMessage?: string
  clearable?: boolean
}

/**
 * A searchable single-select dropdown. Used for division/district/upazila
 * pickers so the user never has to manually type a location name — they
 * pick from the authoritative list, and can type to filter it down.
 */
export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'বেছে নাও',
  searchPlaceholder = 'খুঁজুন...',
  disabled = false,
  disabledMessage,
  clearable = true,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlighted, setHighlighted] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = useMemo(() => options.find((o) => o.value === value) ?? null, [options, value])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.sublabel?.toLowerCase().includes(q)
    )
  }, [options, query])

  useEffect(() => {
    if (!open) return
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  useEffect(() => {
    if (open) {
      setHighlighted(0)
      // let the dropdown render before focusing
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const handleSelect = (val: string) => {
    onChange(val)
    setOpen(false)
    setQuery('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const opt = filtered[highlighted]
      if (opt) handleSelect(opt.value)
    } else if (e.key === 'Escape') {
      setOpen(false)
      setQuery('')
    }
  }

  const baseButtonClasses =
    'flex w-full items-center justify-between gap-2 rounded-xl border-2 border-[hsl(var(--line))] bg-white/80 px-3.5 py-2.5 text-left text-base outline-none transition-colors focus:border-[hsl(var(--accent))] focus:ring-4 focus:ring-[hsl(var(--accent)/0.15)] disabled:cursor-not-allowed disabled:opacity-60'

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={baseButtonClasses}
        title={disabled ? disabledMessage : undefined}
      >
        <span className={selected ? 'text-[hsl(var(--ink))]' : 'text-[hsl(var(--ink-soft))]'}>
          {selected ? selected.label : disabled && disabledMessage ? disabledMessage : placeholder}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {clearable && selected && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation()
                onChange('')
              }}
              className="rounded-full p-0.5 text-[hsl(var(--ink-soft))] hover:bg-[hsl(var(--line)/0.6)]"
              aria-label="মুছে দাও"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown className="h-4 w-4 text-[hsl(var(--ink-soft))]" />
        </span>
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border-2 border-[hsl(var(--line))] bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-[hsl(var(--line))] px-3 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-[hsl(var(--ink-soft))]" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-base outline-none placeholder:text-[hsl(var(--ink-soft))]"
            />
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <p className="px-3 py-2.5 text-sm text-[hsl(var(--ink-soft))]">কোনো ফলাফল নেই</p>
            )}
            {filtered.map((opt, i) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                onMouseEnter={() => setHighlighted(i)}
                className={`flex w-full flex-col px-3 py-2 text-left text-base transition-colors ${
                  i === highlighted ? 'bg-[hsl(var(--wishlist-bg))]' : ''
                } ${opt.value === value ? 'font-semibold text-[hsl(var(--accent-dark))]' : 'text-[hsl(var(--ink))]'}`}
              >
                {opt.label}
                {opt.sublabel && (
                  <span className="text-xs text-[hsl(var(--ink-soft))]">{opt.sublabel}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
