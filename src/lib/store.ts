/**
 * IAA Digital — Global app state (auth + navigation)
 * SPA-style navigation since only `/` route is exposed to preview.
 */
'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'SUPER_ADMIN' | 'ADMINISTRATOR' | 'PENGURUS' | 'ANGGOTA'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: Role
  avatar?: string | null
  // denormalized member info if role === ANGGOTA
  memberId?: string
  memberNumber?: string
  arsiparisLevel?: string
  position?: string
  workUnit?: string
}

export type View =
  | { name: 'public' }                       // landing page
  | { name: 'login' }
  | { name: 'register' }
  | { name: 'news-list' }
  | { name: 'news-detail'; slug: string }
  | { name: 'event-list' }
  | { name: 'event-detail'; slug: string }
  | { name: 'library' }
  | { name: 'gallery' }
  | { name: 'about' }                        // about / visi misi / sejarah
  | { name: 'organization' }                 // struktur pengurus
  | { name: 'contact' }
  | { name: 'faq' }
  | { name: 'member-dashboard'; tab?: string }
  | { name: 'admin-dashboard'; tab?: string }
  | { name: 'admin-archives' }
  | { name: 'admin-certificates' }
  | { name: 'admin-events' }
  | { name: 'admin-reports' }
  | { name: 'verify-certificate' }           // public verification page
  | { name: 'chat' }                         // AI chatbot page

interface AppState {
  user: SessionUser | null
  view: View
  setUser: (u: SessionUser | null) => void
  setView: (v: View) => void
  logout: () => void
  // theme is handled by next-themes, not here
}

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      view: { name: 'public' },
      setUser: (u) => set({ user: u }),
      setView: (v) => {
        set({ view: v })
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
        }
      },
      logout: () => set({ user: null, view: { name: 'public' } }),
    }),
    {
      name: 'iaa-digital-store',
      // only persist user, not view (so refresh returns to public)
      partialize: (s) => ({ user: s.user }) as AppState,
    }
  )
)

// Helper role check
export const hasAdminAccess = (role?: Role) =>
  role === 'SUPER_ADMIN' || role === 'ADMINISTRATOR'

export const hasPengurusAccess = (role?: Role) =>
  role === 'SUPER_ADMIN' || role === 'ADMINISTRATOR' || role === 'PENGURUS'

export const roleLabel = (role?: Role) => {
  switch (role) {
    case 'SUPER_ADMIN': return 'Super Admin'
    case 'ADMINISTRATOR': return 'Administrator'
    case 'PENGURUS': return 'Pengurus'
    case 'ANGGOTA': return 'Anggota'
    default: return 'Guest'
  }
}

export const roleBadgeColor = (role?: Role) => {
  switch (role) {
    case 'SUPER_ADMIN': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
    case 'ADMINISTRATOR': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800'
    case 'PENGURUS': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
    case 'ANGGOTA': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
    default: return 'bg-muted text-muted-foreground'
  }
}
