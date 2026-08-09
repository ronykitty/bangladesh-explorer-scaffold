// src/hooks/use-current-user.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type Profile = {
  username: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
}

/**
 * ছোট, স্বনির্ভর হুক — অ্যাপের অন্য কোনো auth সিস্টেমের উপর নির্ভর করে না।
 * Supabase auth থেকে বর্তমান লগইন করা ইউজার (user.id, email) দেয়,
 * এবং `profiles` টেবিল থেকে username/bio/avatar_url ও দেয়
 * (এগুলো auth.users-এ থাকে না, তাই আলাদা করে আনতে হয়)।
 */
export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadProfile(userId: string) {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url, bio')
        .eq('id', userId)
        .single()

      if (active) {
        if (error) {
          console.error('profiles fetch failed:', error.message)
          setProfile(null)
        } else {
          setProfile(data)
        }
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null
      setUser(sessionUser)
      if (sessionUser) {
        loadProfile(sessionUser.id).finally(() => active && setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null
      setUser(sessionUser)
      if (sessionUser) {
        loadProfile(sessionUser.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  // লগইন করা আছে, প্রোফাইল লোডও হয়েছে, কিন্তু username এখনো সেট করা হয়নি —
  // এই flag দিয়ে "Set username" পেজে রিডাইরেক্ট/প্রম্পট করা যাবে।
  const needsUsername = !loading && !!user && !profile?.username

  return {
    user,
    userId: user?.id,
    username: profile?.username ?? null,
    profile,
    loading,
    needsUsername,
  }
}