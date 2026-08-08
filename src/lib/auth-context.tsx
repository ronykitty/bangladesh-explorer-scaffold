import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>
  signUpWithPassword: (email: string, password: string) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>
  signOut: () => Promise<void>
  sendPasswordResetEmail: (email: string) => Promise<{ error: string | null }>
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const signInWithPassword: AuthContextValue['signInWithPassword'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? error.message : null }
  }

  const signUpWithPassword: AuthContextValue['signUpWithPassword'] = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message, needsEmailConfirmation: false }
    // If email confirmation is required, Supabase returns a user with no active session yet
    const needsEmailConfirmation = !data.session
    return { error: null, needsEmailConfirmation }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const sendPasswordResetEmail: AuthContextValue['sendPasswordResetEmail'] = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error: error ? error.message : null }
  }

  const updatePassword: AuthContextValue['updatePassword'] = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    return { error: error ? error.message : null }
  }

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    loading,
    signInWithPassword,
    signUpWithPassword,
    signOut,
    sendPasswordResetEmail,
    updatePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
