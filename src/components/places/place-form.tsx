import { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/modal'
import { useDivisions, useDistricts, useCategories } from '@/hooks/use-reference-data'
import { useCreatePlace, useUpdatePlace, type PlaceWithRelations } from '@/hooks/use-places'
import { useAuth } from '@/lib/auth-context'
import type { PlaceStatus } from '@/types/database'

const placeSchema = z.object({
  division_id: z.string().min(1, 'বিভাগ বেছে নাও'),
  district_id: z.string().min(1, 'জেলা বেছে নাও'),
  upazila_name: z.string().optional(),
  union_village: z.string().optional(),
  category_id: z.string().min(1, 'ক্যাটাগরি বেছে নাও'),
  name: z.string().min(1, 'জায়গার নাম লেখো'),
  status: z.enum(['wishlist', 'planned', 'visited', 'revisited']),
  description: z.string().optional(),
  photo_url: z.string().url('সঠিক লিংক দাও').optional().or(z.literal('')),
  google_maps_url: z.string().url('সঠিক লিংক দাও').optional().or(z.literal('')),
  personal_rating: z.string().optional(),
  target_date: z.string().optional(),
})

type PlaceFormValues = z.infer<typeof placeSchema>

const STATUS_OPTIONS: { value: PlaceStatus; label: string; icon: string }[] = [
  { value: 'wishlist', label: 'যেতে চাই', icon: '⭐' },
  { value: 'planned', label: 'পরিকল্পিত', icon: '🗓' },
  { value: 'visited', label: 'ঘুরে এসেছি', icon: '✅' },
  { value: 'revisited', label: 'আবার গিয়েছি', icon: '🔁' },
]

interface PlaceFormProps {
  open: boolean
  onClose: () => void
  editingPlace?: PlaceWithRelations | null
  presetCategoryId?: string
  presetStatus?: PlaceStatus
}

export function PlaceForm({ open, onClose, editingPlace, presetCategoryId, presetStatus }: PlaceFormProps) {
  const { user } = useAuth()
  const { data: divisions } = useDivisions()
  const { data: districts } = useDistricts()
  const { data: categories } = useCategories()
  const createPlace = useCreatePlace()
  const updatePlace = useUpdatePlace()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<PlaceFormValues>({
    resolver: zodResolver(placeSchema),
    defaultValues: {
      division_id: '',
      district_id: '',
      upazila_name: '',
      union_village: '',
      category_id: presetCategoryId ?? '',
      name: '',
      status: presetStatus ?? 'wishlist',
      description: '',
      photo_url: '',
      google_maps_url: '',
      personal_rating: '',
      target_date: '',
    },
  })

  const selectedDivisionId = watch('division_id')

  const filteredDistricts = useMemo(
    () => (districts ?? []).filter((d) => d.division_id === selectedDivisionId),
    [districts, selectedDivisionId]
  )

  useEffect(() => {
    if (!open) return
    if (editingPlace) {
      reset({
        division_id: editingPlace.district.division_id,
        district_id: editingPlace.district_id,
        upazila_name: editingPlace.upazila_name ?? '',
        union_village: editingPlace.union_village ?? '',
        category_id: editingPlace.category_id,
        name: editingPlace.name,
        status: editingPlace.status,
        description: editingPlace.description ?? '',
        photo_url: editingPlace.photo_url ?? '',
        google_maps_url: editingPlace.google_maps_url ?? '',
        personal_rating: editingPlace.personal_rating != null ? String(editingPlace.personal_rating) : '',
        target_date: editingPlace.target_date ?? '',
      })
    } else {
      reset({
        division_id: '',
        district_id: '',
        upazila_name: '',
        union_village: '',
        category_id: presetCategoryId ?? '',
        name: '',
        status: presetStatus ?? 'wishlist',
        description: '',
        photo_url: '',
        google_maps_url: '',
        personal_rating: '',
        target_date: '',
      })
    }
    setServerError(null)
  }, [open, editingPlace, presetCategoryId, presetStatus, reset])

  const onSubmit = async (values: PlaceFormValues) => {
    if (!user) return
    setServerError(null)
    const input = {
      category_id: values.category_id,
      district_id: values.district_id,
      upazila_name: values.upazila_name || null,
      union_village: values.union_village || null,
      name: values.name,
      description: values.description || null,
      status: values.status,
      photo_url: values.photo_url || null,
      google_maps_url: values.google_maps_url || null,
      personal_rating: values.personal_rating ? Number(values.personal_rating) : null,
      target_date: values.target_date || null,
    }
    try {
      if (editingPlace) {
        await updatePlace.mutateAsync({ id: editingPlace.id, input })
      } else {
        await createPlace.mutateAsync({ input, userId: user.id })
      }
      onClose()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'সংরক্ষণ ব্যর্থ হয়েছে')
    }
  }

  const submitting = createPlace.isPending || updatePlace.isPending
  const inputClasses =
    'w-full rounded-lg border border-[hsl(var(--line))] bg-white/70 px-3 py-2 text-sm outline-none focus:border-[hsl(var(--accent))] focus:ring-2 focus:ring-[hsl(var(--accent)/0.25)]'
  const labelClasses = 'mb-1 block text-xs font-semibold text-[hsl(var(--ink-soft))]'

  return (
    <Modal open={open} onClose={onClose} title={editingPlace ? 'এন্ট্রি এডিট করো' : 'নতুন এন্ট্রি যোগ করো'}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto pr-1" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClasses}>বিভাগ</label>
            <select className={inputClasses} {...register('division_id')}>
              <option value="">বেছে নাও</option>
              {divisions?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name_bn}
                </option>
              ))}
            </select>
            {errors.division_id && <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.division_id.message}</p>}
          </div>
          <div>
            <label className={labelClasses}>জেলা</label>
            <select className={inputClasses} disabled={!selectedDivisionId} {...register('district_id')}>
              <option value="">বেছে নাও</option>
              {filteredDistricts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name_bn}
                </option>
              ))}
            </select>
            {errors.district_id && <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.district_id.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClasses}>উপজেলা</label>
            <input className={inputClasses} placeholder="যেমন: সদর" {...register('upazila_name')} />
          </div>
          <div>
            <label className={labelClasses}>ইউনিয়ন / গ্রাম / এলাকা</label>
            <input className={inputClasses} placeholder="ঐচ্ছিক" {...register('union_village')} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClasses}>ক্যাটাগরি</label>
            <select className={inputClasses} {...register('category_id')}>
              <option value="">বেছে নাও</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name_bn}
                </option>
              ))}
            </select>
            {errors.category_id && <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.category_id.message}</p>}
          </div>
          <div>
            <label className={labelClasses}>জায়গার নাম</label>
            <input className={inputClasses} placeholder="যেমন: মেঘনা ঘাট" {...register('name')} />
            {errors.name && <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.name.message}</p>}
          </div>
        </div>

        <div>
          <label className={labelClasses}>অবস্থা</label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <div className="grid grid-cols-4 gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => field.onChange(opt.value)}
                    className={`rounded-lg border-2 px-2 py-2 text-center text-xs font-semibold transition-colors ${
                      field.value === opt.value
                        ? 'border-[hsl(var(--accent))] bg-[hsl(var(--wishlist-bg))] text-[hsl(var(--accent-dark))]'
                        : 'border-[hsl(var(--line))] text-[hsl(var(--ink-soft))]'
                    }`}
                  >
                    <div>{opt.icon}</div>
                    <div>{opt.label}</div>
                  </button>
                ))}
              </div>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClasses}>ছবির লিংক (ঐচ্ছিক)</label>
            <input className={inputClasses} placeholder="https://..." {...register('photo_url')} />
            {errors.photo_url && <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.photo_url.message}</p>}
          </div>
          <div>
            <label className={labelClasses}>Google Maps লিংক (ঐচ্ছিক)</label>
            <input className={inputClasses} placeholder="https://maps.google.com/..." {...register('google_maps_url')} />
            {errors.google_maps_url && (
              <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.google_maps_url.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClasses}>নিজের রেটিং (০–৫, ঐচ্ছিক)</label>
            <input type="number" min={0} max={5} step={0.5} className={inputClasses} {...register('personal_rating')} />
          </div>
          <div>
            <label className={labelClasses}>পরিকল্পিত মাস (ঐচ্ছিক)</label>
            <input type="date" className={inputClasses} {...register('target_date')} />
          </div>
        </div>

        <div>
          <label className={labelClasses}>বিস্তারিত / বর্ণনা (ঐচ্ছিক)</label>
          <textarea
            className={inputClasses}
            rows={3}
            placeholder="কেন যেতে চাও, ইতিহাস, কীভাবে যাবে..."
            {...register('description')}
          />
        </div>

        {serverError && (
          <p className="rounded-lg bg-[hsl(var(--danger)/0.1)] px-3 py-2 text-xs text-[hsl(var(--danger))]">
            {serverError}
          </p>
        )}

        <div className="sticky bottom-0 -mx-1 mt-1 flex justify-end gap-2 bg-[hsl(var(--card))] px-1 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[hsl(var(--line))] px-4 py-2 text-sm text-[hsl(var(--ink-soft))]"
          >
            বাতিল
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-[hsl(var(--accent))] px-4 py-2 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
          >
            {submitting ? 'সংরক্ষণ হচ্ছে...' : editingPlace ? 'আপডেট করো' : 'সংরক্ষণ করো'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
