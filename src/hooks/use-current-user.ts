// src/hooks/use-current-user.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

/**
 * ছোট, স্বনির্ভর হুক — অ্যাপের অন্য কোনো auth সিস্টেমের উপর নির্ভর করে না।
 * সরাসরি Supabase auth থেকে বর্তমান লগইন করা ইউজার (user.id, email ইত্যাদি) দেয়।
 */
export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return { user, userId: user?.id, loading }
}
