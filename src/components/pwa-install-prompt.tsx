'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Download, X, Smartphone, Bell, Wifi, Shield } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'iaa-pwa-install-dismissed'
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = React.useState(false)
  const [installed, setInstalled] = React.useState(false)

  React.useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setInstalled(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Check dismiss timestamp
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || '0')
      if (Date.now() - dismissedAt > DISMISS_DURATION) {
        setTimeout(() => setShow(true), 3000) // show after 3s
      }
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      setInstalled(true)
      setShow(false)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setInstalled(true)
      setShow(false)
    } else {
      handleDismiss()
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setShow(false)
  }

  // Register service worker
  React.useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    } else if ('serviceWorker' in navigator) {
      // Also register in dev for testing
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  if (installed) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-[420px] z-[90]"
        >
          <div className="relative overflow-hidden rounded-2xl bg-card border border-gold/30 shadow-2xl">
            {/* Gradient header strip */}
            <div className="bg-hero-gradient text-white p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-grid opacity-20" />
              <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gold/20 blur-2xl" />
              <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Tutup"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="relative flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold/20 border border-gold/30 backdrop-blur">
                  <Smartphone className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <div className="font-display font-bold text-sm">Install IAA Digital</div>
                  <div className="text-xs text-white/70">Akses cepat dari layar utama</div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-4">
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Pasang IAA Digital sebagai aplikasi di perangkat Anda untuk akses cepat, notifikasi push, dan dukungan offline.
              </p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { icon: Wifi, label: 'Offline' },
                  { icon: Bell, label: 'Push Notif' },
                  { icon: Shield, label: 'Native Feel' },
                ].map((f) => (
                  <div key={f.label} className="text-center p-2 rounded-lg bg-muted/40">
                    <f.icon className="h-4 w-4 text-gold mx-auto mb-1" />
                    <div className="text-[10px] text-muted-foreground font-medium">{f.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleInstall} className="flex-1 bg-navy-gradient" size="sm">
                  <Download className="mr-2 h-4 w-4" /> Install Sekarang
                </Button>
                <Button onClick={handleDismiss} variant="outline" size="sm">
                  Nanti
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook for requesting push notification permission
export function usePushPermission() {
  const [permission, setPermission] = React.useState<NotificationPermission>('default')

  React.useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!('Notification' in window)) return false
    const result = await Notification.requestPermission()
    setPermission(result)
    return result === 'granted'
  }

  return { permission, requestPermission }
}
