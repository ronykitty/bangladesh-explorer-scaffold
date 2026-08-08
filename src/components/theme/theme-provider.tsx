import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeProviderState {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const STORAGE_KEY = 'bd-explorer-theme-mode'

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system'
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null
    return stored ?? 'system'
  })

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
    theme === 'system' ? getSystemTheme() : theme
  )

  useEffect(() => {
    const root = window.document.documentElement
    const applied = theme === 'system' ? getSystemTheme() : theme
    root.classList.toggle('dark', applied === 'dark')
    setResolvedTheme(applied)
  }, [theme])

  useEffect(() => {
    if (theme !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => {
      const applied = getSystemTheme()
      window.document.documentElement.classList.toggle('dark', applied === 'dark')
      setResolvedTheme(applied)
    }
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [theme])

  const setTheme = (next: Theme) => {
    window.localStorage.setItem(STORAGE_KEY, next)
    setThemeState(next)
  }

  return (
    <ThemeProviderContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeProviderContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
