'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X, Megaphone, Pin, Info, ChevronRight } from 'lucide-react'
import { useApp } from '@/lib/store'

interface Announcement {
  id: string
  title: string
  content: string
  type: string  // BANNER | POPUP | RUNNING_TEXT | PINNED
  isPinned: boolean
  isPopup: boolean
}

const STORAGE_KEY = 'iaa-dismissed-popups'

export function AnnouncementBanner() {
  const { setView } = useApp()
  const [banners, setBanners] = React.useState<Announcement[]>([])
  const [runningTexts, setRunningTexts] = React.useState<Announcement[]>([])
  const [popup, setPopup] = React.useState<Announcement | null>(null)
  const [closedBanners, setClosedBanners] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    fetch('/api/announcements')
      .then((r) => r.json())
      .then((d) => {
        const all: Announcement[] = d.announcements ?? []
        setBanners(all.filter((a) => a.type === 'BANNER' || a.type === 'PINNED' || a.isPinned))
        setRunningTexts(all.filter((a) => a.type === 'RUNNING_TEXT'))

        // Popup: only show if not dismissed
        const dismissed: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
        const popupItem = all.find((a) => a.type === 'POPUP' || a.isPopup)
        if (popupItem && !dismissed.includes(popupItem.id)) {
          setPopup(popupItem)
        }
      })
      .catch(() => {})
  }, [])

  const dismissPopup = () => {
    if (!popup) return
    const dismissed: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    dismissed.push(popup.id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed))
    setPopup(null)
  }

  const closeBanner = (id: string) => {
    setClosedBanners((prev) => new Set(prev).add(id))
  }

  const visibleBanners = banners.filter((b) => !closedBanners.has(b.id))

  return (
    <>
      {/* Top banners (above hero) */}
      <AnimatePresence>
        {visibleBanners.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative bg-navy-gradient text-white overflow-hidden"
          >
            <div className="absolute inset-0 bg-grid opacity-20" />
            <div className="relative mx-auto max-w-7xl px-4 lg:px-8 py-2.5 flex items-center gap-3">
              {visibleBanners[0].isPinned ? (
                <Pin className="h-4 w-4 text-gold flex-shrink-0" />
              ) : (
                <Megaphone className="h-4 w-4 text-gold flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{visibleBanners[0].title}</span>
                  {visibleBanners[0].isPinned && (
                    <span className="text-[9px] uppercase tracking-wide bg-gold/30 text-gold px-1.5 py-0.5 rounded">Pinned</span>
                  )}
                </div>
                <p className="text-xs text-white/70 line-clamp-1 mt-0.5">{visibleBanners[0].content}</p>
              </div>
              <button
                onClick={() => closeBanner(visibleBanners[0].id)}
                className="grid h-6 w-6 place-items-center rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
                aria-label="Tutup banner"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Running text (below header) */}
      {runningTexts.length > 0 && (
        <div className="bg-gold/10 border-b border-gold/20 overflow-hidden">
          <div className="mx-auto max-w-7xl flex items-center gap-2 px-4 lg:px-8 py-1.5">
            <Megaphone className="h-3.5 w-3.5 text-gold flex-shrink-0" />
            <div className="flex-1 overflow-hidden">
              <div className="flex gap-8 animate-marquee whitespace-nowrap text-xs text-navy dark:text-white">
                {runningTexts.map((r) => (
                  <span key={r.id} className="flex items-center gap-2">
                    <span className="font-semibold">★ {r.title}</span>
                    <span className="text-muted-foreground">— {r.content}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup modal */}
      <AnimatePresence>
        {popup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] grid place-items-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={dismissPopup}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative max-w-lg w-full bg-card rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with gradient */}
              <div className="relative bg-hero-gradient text-white p-6">
                <div className="absolute inset-0 bg-grid opacity-30" />
                <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gold/20 blur-3xl" />
                <button
                  onClick={dismissPopup}
                  className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="relative">
                  <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold backdrop-blur-sm mb-3">
                    <Info className="h-3 w-3" /> Pengumuman Penting
                  </div>
                  <h3 className="font-display text-xl lg:text-2xl font-bold leading-tight">{popup.title}</h3>
                </div>
              </div>
              {/* Body */}
              <div className="p-6">
                <p className="text-sm text-muted-foreground leading-relaxed">{popup.content}</p>
                <div className="flex gap-2 mt-5">
                  <Button
                    onClick={() => { dismissPopup(); setView({ name: 'event-list' }) }}
                    className="flex-1 bg-navy-gradient"
                  >
                    Lihat Detail <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={dismissPopup}>
                    Nanti Saja
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </>
  )
}
