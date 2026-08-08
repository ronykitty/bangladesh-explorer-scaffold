import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { supabase } from '@/lib/supabase'

type ConnStatus = 'checking' | 'ok' | 'error'

export default function SettingsPage() {
  const [status, setStatus] = useState<ConnStatus>('checking')
  const [message, setMessage] = useState('সংযোগ পরীক্ষা করা হচ্ছে...')

  useEffect(() => {
    let cancelled = false

    async function checkConnection() {
      try {
        const { error } = await supabase.auth.getSession()
        if (cancelled) return
        if (error) {
          setStatus('error')
          setMessage(error.message)
        } else {
          setStatus('ok')
          setMessage('Supabase প্রজেক্টের সাথে সংযোগ ঠিক আছে।')
        }
      } catch (err) {
        if (cancelled) return
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'অজানা সংযোগ সমস্যা')
      }
    }

    checkConnection()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <PageHeader title="⚙ সেটিংস" subtitle="সংযোগ, থিম এবং অ্যাপ তথ্য" />

      <div className="glass mb-4 rounded-xl px-5 py-4">
        <h3 className="font-serif text-base text-[hsl(var(--accent-dark))]">🔌 Supabase সংযোগ</h3>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span>
            {status === 'checking' && '⏳'}
            {status === 'ok' && '✅'}
            {status === 'error' && '❌'}
          </span>
          <span className="text-[hsl(var(--ink-soft))]">{message}</span>
        </div>
        <p className="mt-2 break-all text-xs text-[hsl(var(--ink-soft))]">
          {import.meta.env.VITE_SUPABASE_URL}
        </p>
      </div>

      <div className="glass rounded-xl px-5 py-4">
        <h3 className="font-serif text-base text-[hsl(var(--accent-dark))]">🎨 থিম</h3>
        <p className="mt-1 text-sm text-[hsl(var(--ink-soft))]">
          লাইট / ডার্ক / সিস্টেম মোড উপরে টপবার থেকে বদলানো যাবে।
        </p>
      </div>
    </div>
  )
}
