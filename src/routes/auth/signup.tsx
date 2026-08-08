import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthLayout } from '@/components/auth/auth-layout'
import { useAuth } from '@/lib/auth-context'

const signupSchema = z
  .object({
    email: z.string().min(1, 'ইমেইল দাও').email('সঠিক ইমেইল লেখো'),
    password: z.string().min(6, 'কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দাও'),
    confirmPassword: z.string().min(1, 'পাসওয়ার্ড আবার লেখো'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'দুটো পাসওয়ার্ড মিলছে না',
    path: ['confirmPassword'],
  })

type SignupForm = z.infer<typeof signupSchema>

export default function SignupPage() {
  const { signUpWithPassword } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) })

  const onSubmit = async (values: SignupForm) => {
    setServerError(null)
    setSubmitting(true)
    const { error, needsEmailConfirmation } = await signUpWithPassword(values.email, values.password)
    setSubmitting(false)
    if (error) {
      setServerError(
        error.includes('already registered') ? 'এই ইমেইল দিয়ে আগেই একাউন্ট আছে, লগইন করো।' : error
      )
      return
    }
    if (needsEmailConfirmation) {
      setConfirmationSent(true)
      return
    }
    navigate('/', { replace: true })
  }

  if (confirmationSent) {
    return (
      <AuthLayout title="ইমেইল চেক করো" subtitle="একাউন্ট প্রায় তৈরি হয়ে গেছে">
        <div className="rounded-lg bg-[hsl(var(--visited-bg))] px-4 py-4 text-sm text-[hsl(var(--visited))]">
          তোমার ইমেইলে একটা কনফার্মেশন লিংক পাঠানো হয়েছে। ওখানে ক্লিক করলেই একাউন্ট সক্রিয় হয়ে যাবে।
        </div>
        <Link
          to="/login"
          className="mt-4 block text-center text-sm font-semibold text-[hsl(var(--accent-dark))] hover:underline"
        >
          লগইন পেজে ফিরে যাও
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="সাইনআপ করো" subtitle="তোমার ব্যক্তিগত ভ্রমণ ডেটাবেস শুরু করো">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div>
          <label className="mb-1 block text-xs font-semibold text-[hsl(var(--ink-soft))]">ইমেইল</label>
          <input
            type="email"
            autoComplete="email"
            className="w-full rounded-lg border border-[hsl(var(--line))] bg-white/70 px-3 py-2 text-sm outline-none focus:border-[hsl(var(--accent))] focus:ring-2 focus:ring-[hsl(var(--accent)/0.25)]"
            {...register('email')}
          />
          {errors.email && <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-[hsl(var(--ink-soft))]">পাসওয়ার্ড</label>
          <input
            type="password"
            autoComplete="new-password"
            className="w-full rounded-lg border border-[hsl(var(--line))] bg-white/70 px-3 py-2 text-sm outline-none focus:border-[hsl(var(--accent))] focus:ring-2 focus:ring-[hsl(var(--accent)/0.25)]"
            {...register('password')}
          />
          {errors.password && <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.password.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-[hsl(var(--ink-soft))]">পাসওয়ার্ড আবার লেখো</label>
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
          {submitting ? 'তৈরি হচ্ছে...' : 'একাউন্ট তৈরি করো'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-[hsl(var(--ink-soft))]">
        একাউন্ট আছে?{' '}
        <Link to="/login" className="font-semibold text-[hsl(var(--accent-dark))] hover:underline">
          লগইন করো
        </Link>
      </p>
    </AuthLayout>
  )
}
