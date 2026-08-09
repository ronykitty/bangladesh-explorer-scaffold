// src/pages/set-username.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useCurrentUser } from '@/hooks/use-current-user'

// শুধু ছোট হাতের অক্ষর, সংখ্যা, আন্ডারস্কোর — ৩ থেকে ২০ ক্যারেক্টার
const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/

export default function SetUsernamePage() {
  const { userId, loading } = useCurrentUser()
  const navigate = useNavigate()

  const [value, setValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (loading) return null

  if (!userId) {
    // লগইন করা নেই — এই পেজে থাকার কথাই না
    navigate('/login', { replace: true })
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!userId) return // TS-কে জানানো এবং রানটাইমেও নিরাপদ থাকা, দুটোই দরকার

    const username = value.trim().toLowerCase()

    if (!USERNAME_REGEX.test(username)) {
      setError('ইউজারনেমে শুধু ছোট হাতের অক্ষর, সংখ্যা ও আন্ডারস্কোর ব্যবহার করা যাবে (৩–২০ ক্যারেক্টার)।')
      return
    }

    setSubmitting(true)

    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({ id: userId, username }, { onConflict: 'id' })

    setSubmitting(false)

    if (upsertError) {
      // profiles.username টেবিলে unique constraint আছে —
      // ইউনিক ভায়োলেশন হলে Postgres error code 23505 আসে
      if (upsertError.code === '23505') {
        setError('এই ইউজারনেমটি ইতিমধ্যে নেওয়া হয়ে গেছে। অন্য একটা চেষ্টা করুন।')
      } else {
        setError('ইউজারনেম সেভ করা যায়নি। আবার চেষ্টা করুন।')
        console.error('username upsert failed:', upsertError.message)
      }
      return
    }

    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="text-xl font-semibold">একটা ইউজারনেম বেছে নিন</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        এটা দিয়েই আপনার প্রোফাইল লিংক তৈরি হবে (/profile/আপনার-ইউজারনেম), পরে বদলানো যাবে।
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="username"
          autoFocus
          disabled={submitting}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting || value.trim().length === 0}
          className="w-full rounded-md bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          {submitting ? 'সেভ হচ্ছে...' : 'কনফার্ম করুন'}
        </button>
      </form>
    </div>
  )
}
