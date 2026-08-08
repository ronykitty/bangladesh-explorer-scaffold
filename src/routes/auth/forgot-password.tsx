import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthLayout } from '@/components/auth/auth-layout'
import { useAuth } from '@/lib/auth-context'

const schema = z.object({
  email: z.string().min(1, 'ইমেইল দাও').email('সঠিক ইমেইল লেখো'),
})
type ForgotForm = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const { sendPasswordResetEmail } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: ForgotForm) => {
    setServerError(null)
    setSubmitting(true)
    const { error } = await sendPasswordResetEmail(values.email)
    setSubmitting(false)
    if (error) {
      setServerError(error)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <AuthLayout title="লিংক পাঠানো হয়েছে" subtitle="ইমেইল চেক করো">
        <div className="rounded-lg bg-[hsl(var(--visited-bg))] px-4 py-4 text-sm text-[hsl(var(--visited))]">
          পাসওয়ার্ড রিসেট করার লিংক তোমার ইমেইলে পাঠানো হয়েছে। লিংকে ক্লিক করলে নতুন পাসওয়ার্ড সেট করতে পারবে।
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
    <AuthLayout title="পাসওয়ার্ড ভুলে গেছো?" subtitle="ইমেইল দাও, রিসেট লিংক পাঠিয়ে দেব">
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
          {submitting ? 'পাঠানো হচ্ছে...' : 'রিসেট লিংক পাঠাও'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-[hsl(var(--ink-soft))]">
        <Link to="/login" className="font-semibold text-[hsl(var(--accent-dark))] hover:underline">
          লগইন পেজে ফিরে যাও
        </Link>
      </p>
    </AuthLayout>
  )
}
