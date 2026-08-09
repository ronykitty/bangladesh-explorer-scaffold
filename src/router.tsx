// src/router.tsx
import { createBrowserRouter } from 'react-router-dom'

// --- auth pages ---
import LoginPage from '@/routes/auth/login'
import SignupPage from '@/routes/auth/signup'
import ForgotPasswordPage from '@/routes/auth/forgot-password'
import ResetPasswordPage from '@/routes/auth/reset-password'

// --- main app pages ---
import DashboardPage from '@/routes/dashboard'
import FriendsPage from '@/routes/friends'
import ProfilePage from '@/routes/profile'
import CategoryPage from '@/routes/category'
import GalleryPage from '@/routes/gallery'
import JournalPage from '@/routes/journal'
import PlacesPage from '@/routes/places'
import PlannerPage from '@/routes/planner'
import SettingsPage from '@/routes/settings'
import WishlistPage from '@/routes/wishlist'

export const router = createBrowserRouter([
  // --- auth ---
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },

  // --- main app ---
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/friends', element: <FriendsPage /> },
  { path: '/profile/:username', element: <ProfilePage /> },
  { path: '/category', element: <CategoryPage /> },
  { path: '/gallery', element: <GalleryPage /> },
  { path: '/journal', element: <JournalPage /> },
  { path: '/places', element: <PlacesPage /> },
  { path: '/planner', element: <PlannerPage /> },
  { path: '/settings', element: <SettingsPage /> },
  { path: '/wishlist', element: <WishlistPage /> },

  // root path -> dashboard (redirect)
  {
    path: '/',
    element: <DashboardPage />,
  },
])
