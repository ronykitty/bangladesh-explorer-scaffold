import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { AuthProvider } from '@/lib/auth-context'
import { AppLayout } from '@/components/layout/app-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { PublicOnlyRoute } from '@/components/auth/public-only-route'

import DashboardPage from '@/routes/dashboard'
import PlacesPage from '@/routes/places'
import CategoryPage from '@/routes/category'
import GalleryPage from '@/routes/gallery'
import WishlistPage from '@/routes/wishlist'
import PlannerPage from '@/routes/planner'
import JournalPage from '@/routes/journal'
import SettingsPage from '@/routes/settings'
import LoginPage from '@/routes/auth/login'
import SignupPage from '@/routes/auth/signup'
import ForgotPasswordPage from '@/routes/auth/forgot-password'
import ResetPasswordPage from '@/routes/auth/reset-password'
import ProfilePage from '@/routes/profile'
import FriendsPage from '@/routes/friends'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Password recovery lands here directly from the emailed link */}
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              <Route element={<PublicOnlyRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="places" element={<PlacesPage />} />
                  <Route path="category/:slug" element={<CategoryPage />} />
                  <Route path="gallery" element={<GalleryPage />} />
                  <Route path="wishlist" element={<WishlistPage />} />
                  <Route path="planner" element={<PlannerPage />} />
                  <Route path="journal" element={<JournalPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="profile/:username" element={<ProfilePage />} />
                  <Route path="friends" element={<FriendsPage />} />
                </Route>
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
