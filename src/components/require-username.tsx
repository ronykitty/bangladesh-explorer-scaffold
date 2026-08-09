// src/components/require-username.tsx
import { Navigate, useLocation } from 'react-router-dom'
import { useCurrentUser } from '@/hooks/use-current-user'

/**
 * অ্যাপের রুট ট্রি-তে এমন জায়গায় বসান যেখানে ইউজার আগে থেকেই লগইন করা
 * (যেমন একটা <RequireAuth> এর ভেতরে)। এটা চেক করবে username সেট করা আছে কিনা;
 * না থাকলে /set-username এ পাঠিয়ে দেবে — শুধু সেই পেজটা বাদে (লুপ এড়াতে)।
 */
export function RequireUsername({ children }: { children: React.ReactNode }) {
  const { loading, needsUsername } = useCurrentUser()
  const location = useLocation()

  if (loading) return null // অথবা এখানে একটা স্পিনার বসাতে পারেন

  const isSetUsernamePage = location.pathname === '/set-username'

  if (needsUsername && !isSetUsernamePage) {
    return <Navigate to="/set-username" replace />
  }

  return <>{children}</>
}
