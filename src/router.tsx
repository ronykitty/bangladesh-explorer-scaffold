// src/router.tsx
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'

// --- auth pages (no sidebar) ---
import LoginPage from '@/routes/auth/login'
import SignupPage from '@/routes/auth/signup'
import ForgotPasswordPage from '@/routes/auth/forgot-password'
import ResetPasswordPage from '@/routes/auth/reset-password'

// --- main app pages (rendered inside AppLayout via <Outlet />) ---
import DashboardPage from '@/routes/dashboard'
import FriendsPage from '@/routes/friends'
import MessagesPage from '@/routes/messages'
import ProfilePage from '@/routes/profile'
import CategoryPage from '@/routes/category'
import GalleryPage from '@/routes/gallery'
import JournalPage from '@/routes/journal'
import PlacesPage from '@/routes/places'
import PlannerPage from '@/routes/planner'
import SettingsPage from '@/routes/settings'
import WishlistPage from '@/routes/wishlist'

export const router = createBrowserRouter([
  // --- auth: standalone, outside AppLayout (no sidebar on these) ---
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },

  // --- main app: wrapped in AppLayout (sidebar + topbar) ---
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },              // '/'
      { path: 'dashboard', element: <DashboardPage /> },        // '/dashboard' (kept for old links)
      { path: 'places', element: <PlacesPage /> },               // '/places'
      { path: 'gallery', element: <GalleryPage /> },             // '/gallery'
      { path: 'wishlist', element: <WishlistPage /> },           // '/wishlist'
      { path: 'planner', element: <PlannerPage /> },             // '/planner'
      { path: 'journal', element: <JournalPage /> },             // '/journal'
      { path: 'settings', element: <SettingsPage /> },           // '/settings'
      { path: 'friends', element: <FriendsPage /> },             // '/friends'
      { path: 'messages', element: <MessagesPage /> },           // '/messages'
      { path: 'messages/:friendId', element: <MessagesPage /> }, // '/messages/:friendId'
      { path: 'category', element: <CategoryPage /> },           // '/category'
      { path: 'category/:slug', element: <CategoryPage /> },     // '/category/heritage' etc.
      { path: 'profile/:username', element: <ProfilePage /> },   // '/profile/:username'
    ],
  },
])
