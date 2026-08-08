import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthLayout } from '@/components/auth/auth-layout'
import { useAuth } from '@/lib/auth-context'

const loginSchema = z.object({
  email: z.string().min(1, 'ইমেইল দাও').email('সঠিক ইমেইল লেখো'),
  password: z.string().min(1, 'পাসওয়ার্ড দাও'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { signInWithPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'

  const onSubmit = async (values: LoginForm) => {
    setServerError(null)
    setSubmitting(true)
    const { error } = await signInWithPassword(values.email, values.password)
    setSubmitting(false)
    if (error) {
      setServerError(error === 'Invalid login credentials' ? 'ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।' : error)
      return
    }
    navigate(redirectTo, { replace: true })
  }

  return (
    <AuthLayout title="লগইন করো" subtitle="তোমার ভ্রমণ ডেটাবেসে ফিরে এসো">
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
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-xs font-semibold text-[hsl(var(--ink-soft))]">পাসওয়ার্ড</label>
            <Link to="/forgot-password" className="text-xs text-[hsl(var(--accent-dark))] hover:underline">
              ভুলে গেছো?
            </Link>
          </div>
          <input
            type="password"
            autoComplete="current-password"
            className="w-full rounded-lg border border-[hsl(var(--line))] bg-white/70 px-3 py-2 text-sm outline-none focus:border-[hsl(var(--accent))] focus:ring-2 focus:ring-[hsl(var(--accent)/0.25)]"
            {...register('password')}
          />
          {errors.password && <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errors.password.message}</p>}
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
          {submitting ? 'লগইন হচ্ছে...' : 'লগইন করো'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-[hsl(var(--ink-soft))]">
        একাউন্ট নেই?{' '}
        <Link to="/signup" className="font-semibold text-[hsl(var(--accent-dark))] hover:underline">
          সাইনআপ করো
        </Link>
      </p>
    </AuthLayout>
  )
}
