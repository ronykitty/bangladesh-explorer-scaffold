interface EmptyStateProps {
  icon?: string
  title: string
  description: string
}

export function EmptyState({ icon = '📍', title, description }: EmptyStateProps) {
  return (
    <div className="glass flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
      <span className="mb-3 text-4xl">{icon}</span>
      <h3 className="font-serif text-lg text-[hsl(var(--ink))]">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-[hsl(var(--ink-soft))]">{description}</p>
    </div>
  )
}
