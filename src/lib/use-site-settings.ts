/**
 * Site Settings Hook — fetches and caches site settings from /api/settings
 * Used by Header, Footer, and layout to display dynamic branding/contact info.
 */
'use client'

import * as React from 'react'
import { create } from 'zustand'

interface SiteSettingsState {
  settings: Record<string, string>
  loaded: boolean
  load: () => Promise<void>
}

export const useSiteSettings = create<SiteSettingsState>((set, get) => ({
  settings: {},
  loaded: false,
  load: async () => {
    if (get().loaded) return
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' })
      const d = await res.json()
      set({ settings: d.settings || {}, loaded: true })
    } catch {
      set({ loaded: true })
    }
  },
}))

// React hook that auto-loads settings and returns the settings object
// Uses full store subscription to ensure re-render on settings update
export function useSiteSettingsHook(): Record<string, string> {
  const state = useSiteSettings()

  React.useEffect(() => {
    if (!state.loaded) state.load()
  }, [state.loaded, state.load])

  return state.settings
}
