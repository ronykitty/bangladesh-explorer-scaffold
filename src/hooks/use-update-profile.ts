// src/hooks/use-update-profile.ts
import { useCallback, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'

export interface ProfileUpdateInput {
  username?: string
  full_name?: string
  bio?: string
  avatar_url?: string
}

const USERNAME_PATTERN = /^[a-z0-9_.]{3,20}$/

export function useUpdateProfile() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateProfile = useCallback(
    async (input: ProfileUpdateInput): Promise<{ profile: Profile | null; error: string | null }> => {
      setSaving(true)
      setError(null)

      if (input.username !== undefined) {
        const clean = input.username.trim().toLowerCase()
        if (!USERNAME_PATTERN.test(clean)) {
          const msg = 'ইউজারনেম শুধু ছোট হাতের অক্ষর, সংখ্যা, . এবং _ দিয়ে হতে পারে (৩-২০ অক্ষর)'
          setError(msg)
          setSaving(false)
          return { profile: null, error: msg }
        }
        input = { ...input, username: clean }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        const msg = 'লগইন করা নেই'
        setError(msg)
        setSaving(false)
        return { profile: null, error: msg }
      }

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(input)
        .eq('id', user.id)
        .select('*')
        .single()

      setSaving(false)

      if (updateError) {
        // ইউনিক কনস্ট্রেইন্ট ভাঙলে বন্ধুত্বপূর্ণ মেসেজ দেখানো
        const msg = updateError.code === '23505' ? 'এই ইউজারনেমটি আগে থেকেই নেওয়া আছে' : updateError.message
        setError(msg)
        return { profile: null, error: msg }
      }

      return { profile: data as Profile, error: null }
    },
    []
  )

  return { updateProfile, saving, error }
}
