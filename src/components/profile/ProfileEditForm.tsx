// src/components/profile/ProfileEditForm.tsx
import { useState } from 'react'
import { useUpdateProfile } from '@/hooks/use-update-profile'
import type { Profile } from '@/types/database'

interface ProfileEditFormProps {
  profile: Profile
  onSaved?: (updated: Profile) => void
  onCancel?: () => void
}

/** নিজের প্রোফাইলে বসানোর এডিট ফর্ম — ইউজারনেম, নাম, বায়ো */
export function ProfileEditForm({ profile, onSaved, onCancel }: ProfileEditFormProps) {
  const { updateProfile, saving, error } = useUpdateProfile()
  const [username, setUsername] = useState(profile.username ?? '')
  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { profile: updated, error: saveError } = await updateProfile({
      username,
      full_name: fullName,
      bio,
    })
    if (!saveError && updated) onSaved?.(updated)
  }

  return (
    <form onSubmit={handleSubmit} className="glass mt-4 flex flex-col gap-4 rounded-xl p-4">
      <div>
        <label htmlFor="username" className="mb-1 block text-xs font-semibold text-[hsl(var(--ink))]">
          ইউজারনেম
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="যেমন: rony_islam"
          maxLength={20}
          className="w-full rounded-lg border border-[hsl(var(--line))] bg-transparent px-3 py-2 text-sm text-[hsl(var(--ink))] outline-none focus:border-[hsl(var(--accent))]"
        />
        <p className="mt-1 text-xs text-[hsl(var(--ink-soft))]">৩-২০ অক্ষর, ছোট হাতের অক্ষর/সংখ্যা/. _</p>
      </div>

      <div>
        <label htmlFor="full_name" className="mb-1 block text-xs font-semibold text-[hsl(var(--ink))]">
          পুরো নাম
        </label>
        <input
          id="full_name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          maxLength={80}
          className="w-full rounded-lg border border-[hsl(var(--line))] bg-transparent px-3 py-2 text-sm text-[hsl(var(--ink))] outline-none focus:border-[hsl(var(--accent))]"
        />
      </div>

      <div>
        <label htmlFor="bio" className="mb-1 block text-xs font-semibold text-[hsl(var(--ink))]">
          বায়ো
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          maxLength={280}
          placeholder="নিজের সম্পর্কে কিছু লিখুন..."
          className="w-full resize-none rounded-lg border border-[hsl(var(--line))] bg-transparent px-3 py-2 text-sm text-[hsl(var(--ink))] outline-none focus:border-[hsl(var(--accent))]"
        />
        <p className="mt-1 text-right text-xs text-[hsl(var(--ink-soft))]">{bio.length}/280</p>
      </div>

      {error && <p className="text-xs text-[hsl(var(--danger))]">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[hsl(var(--accent))] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[hsl(var(--line))] px-4 py-2 text-sm text-[hsl(var(--ink-soft))]"
          >
            বাতিল
          </button>
        )}
      </div>
    </form>
  )
}
