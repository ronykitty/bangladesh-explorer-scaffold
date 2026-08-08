interface PageHeaderProps {
  title: string
  subtitle?: string
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="font-serif text-2xl text-[hsl(var(--ink))] md:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-[hsl(var(--ink-soft))]">{subtitle}</p>}
    </div>
  )
}
