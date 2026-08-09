// src/routes/category-manage.tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Category = {
  id: string
  name_bn: string
  slug: string
  icon: string
  sort_order: number
  is_active: boolean
}

export default function CategoryManagePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [nameBn, setNameBn] = useState('')
  const [slug, setSlug] = useState('')
  const [icon, setIcon] = useState('📍')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('id, name_bn, slug, icon, sort_order, is_active')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('categories fetch failed:', error.message)
    } else {
      setCategories(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const trimmedName = nameBn.trim()
    const trimmedSlug = slug.trim().toLowerCase()

    if (!trimmedName || !trimmedSlug) {
      setError('নাম এবং স্লাগ দুটোই দিতে হবে।')
      return
    }

    setSubmitting(true)
    const { error: insertError } = await supabase.from('categories').insert({
      name_bn: trimmedName,
      slug: trimmedSlug,
      icon: icon.trim() || '📍',
      sort_order: categories.length,
    })
    setSubmitting(false)

    if (insertError) {
      if (insertError.code === '23505') {
        setError('এই নাম বা স্লাগ ইতিমধ্যে আছে।')
      } else {
        setError('ক্যাটাগরি যোগ করা যায়নি। আবার চেষ্টা করুন।')
        console.error('category insert failed:', insertError.message)
      }
      return
    }

    setNameBn('')
    setSlug('')
    setIcon('📍')
    await load()
  }

  // hard delete না করে is_active টগল করা হয় — এটাই "archive" (কারণ places.category_id RESTRICT)
  async function toggleActive(cat: Category) {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: !cat.is_active })
      .eq('id', cat.id)

    if (error) {
      console.error('category toggle failed:', error.message)
      return
    }
    await load()
  }

  if (loading) return <p className="mt-10 text-center text-sm text-muted-foreground">লোড হচ্ছে...</p>

  return (
    <div className="mx-auto mt-10 max-w-lg">
      <h1 className="text-xl font-semibold">ক্যাটাগরি ম্যানেজ করুন</h1>

      <form onSubmit={handleAdd} className="mt-6 space-y-3 rounded-md border p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="🏛️"
            className="w-16 rounded-md border px-3 py-2 text-center text-sm"
          />
          <input
            type="text"
            value={nameBn}
            onChange={(e) => setNameBn(e.target.value)}
            placeholder="ক্যাটাগরির নাম (যেমন: হেরিটেজ)"
            className="flex-1 rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="slug (যেমন: heritage) — ইংরেজি, স্পেস ছাড়া"
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          {submitting ? 'যোগ হচ্ছে...' : 'নতুন ক্যাটাগরি যোগ করুন'}
        </button>
      </form>

      <div className="mt-6 space-y-1">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`flex items-center justify-between rounded-md border px-3 py-2 ${
              cat.is_active ? '' : 'opacity-50'
            }`}
          >
            <span className="text-sm">
              {cat.icon} {cat.name_bn} <span className="text-xs text-muted-foreground">/{cat.slug}</span>
            </span>
            <button onClick={() => toggleActive(cat)} className="rounded-md border px-3 py-1 text-xs">
              {cat.is_active ? 'আর্কাইভ করুন' : 'সক্রিয় করুন'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
