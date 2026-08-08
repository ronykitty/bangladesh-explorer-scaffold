export function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--bg))]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[hsl(var(--line))] border-t-[hsl(var(--accent))]" />
        <span className="text-sm text-[hsl(var(--ink-soft))]">লোড হচ্ছে...</span>
      </div>
    </div>
  )
}
