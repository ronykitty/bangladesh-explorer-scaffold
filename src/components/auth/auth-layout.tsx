import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--bg))] px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-[#FFD35C] via-[hsl(var(--accent))] to-[#E89600] px-6 py-8 text-center shadow-lg">
          <Link to="/" className="font-serif text-2xl text-white drop-shadow">
            🇧🇩 বাংলাদেশ এক্সপ্লোরার
          </Link>
        </div>
        <div className="glass rounded-2xl px-6 py-7 shadow-sm">
          <h1 className="font-serif text-xl text-[hsl(var(--ink))]">{title}</h1>
          <p className="mt-1 text-sm text-[hsl(var(--ink-soft))]">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
