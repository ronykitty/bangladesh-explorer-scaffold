import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthLayout } from '@/components/auth/auth-layout'
import { useAuth } from '@/lib/auth-context'

const schema = z
  .object({
    password: z.string().min(6, 'কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দাও'),
    confirmPassword: z.string().min(1, 'পাসওয়ার্ড আবার লেখো'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'দুটো পাসওয়ার্ড মিলছে না',
    path: ['confirmPassword'],
  })
type ResetForm = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: ResetForm) => {
    setServerError(null)
    setSubmitting(true)
    const { error } = await updatePassword(values.password)
    setSubmitting(false)
    if (error) {
      setServerError(
        error.includes('Auth session missing')
          ? 'রিসেট লিংকটা মেয়াদোত্তীর্ণ হয়ে গেছে, আবার "পাসওয়ার্ড ভুলে গেছো" থেকে চেষ্টা করো।'
          : error
      )
      return
    }
    setDone(true)
    setTimeout(() => navigate('/', { replace: true }), 1500)
  }

  if (done) {
    return (
      <AuthLayout title="পাসওয়ার্ড বদলে গেছে" subtitle="ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...">
        <div className="rounded-lg bg-[hsl(var(--visited-bg))] px-4 py-4 text-sm text-[hsl(var(--visited))]">
          ✅ তোমার নতুন পাসওয়ার্ড সেট হয়ে গেছে।
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="নতুন পাসওয়ার্ড দাও" subtitle="আগের লিংক থেকে এসেছো, এবার নতুন পাসওয়ার্ড সেট করো">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div>
          <label className="mb-1 block text-xs font-semibold text-[hsl(var(--ink-soft))]">নতুন পাসওয়ার্ড</label>
          <input
            type="password"
            autoComplete="new-password"
            className="w-full rounded-lg border border-[hsl(var(--line))] bg-white/70 px-3 py-2 text-sm outline-none focus:border-[hsl(var(--accent))] focus:ring-2 focus:ring-[hsl(var(--accent)/0.25)]"
            {...register('password')}
          />
          {errors.password && <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.password.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-[hsl(var(--ink-soft))]">আবার লেখো</label>
          <input
            type="password"
            autoComplete="new-password"
            className="w-full rounded-lg border border-[hsl(var(--line))] bg-white/70 px-3 py-2 text-sm outline-none focus:border-[hsl(var(--accent))] focus:ring-2 focus:ring-[hsl(var(--accent)/0.25)]"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.confirmPassword.message}</p>
          )}
        </div>

        {serverError && (
          <p className="rounded-lg bg-[hsl(var(--danger)/0.1)] px-3 py-2 text-xs text-[hsl(var(--danger))]">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 rounded-lg bg-[hsl(var(--accent))] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
        >
          {submitting ? 'সেভ হচ্ছে...' : 'পাসওয়ার্ড সেভ করো'}
        </button>
      </form>
    </AuthLayout>
  )
}
