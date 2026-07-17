'use client'

import * as React from 'react'
import { useApp } from '@/lib/store'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import {
  Bell, Check, CheckCheck, Trash2, Award, CalendarCheck, Clock,
  Settings, Info, MessageSquare, Sparkles, ChevronRight,
} from 'lucide-react'
import { timeAgo } from '@/lib/helpers'
import { toast } from 'sonner'

interface NotifItem {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  readAt: string | null
  createdAt: string
}

const TYPE_ICONS: Record<string, any> = {
  CERTIFICATE_ISSUED: Award,
  EVENT_REMINDER: CalendarCheck,
  REGISTRATION_STATUS: Check,
  ANNOUNCEMENT: Info,
  SYSTEM: Sparkles,
  MESSAGE: MessageSquare,
}

const TYPE_COLORS: Record<string, string> = {
  CERTIFICATE_ISSUED: 'bg-gold/15 text-gold',
  EVENT_REMINDER: 'bg-blue/15 text-blue-brand',
  REGISTRATION_STATUS: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  ANNOUNCEMENT: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  SYSTEM: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  MESSAGE: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
}

export function NotificationBell() {
  const { user, setView } = useApp()
  const [notifs, setNotifs] = React.useState<NotifItem[]>([])
  const [unread, setUnread] = React.useState(0)
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const load = React.useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' })
      const d = await res.json()
      if (d.notifications) {
        setNotifs(d.notifications)
        setUnread(d.unreadCount ?? 0)
      }
    } catch {}
  }, [user])

  React.useEffect(() => {
    if (user) {
      load()
      // Poll every 30 seconds
      const i = setInterval(load, 30000)
      return () => clearInterval(i)
    }
  }, [user, load])

  const markAllRead = async () => {
    setLoading(true)
    try {
      await fetch('/api/notifications?action=read-all', { method: 'PATCH' })
      setNotifs((ns) => ns.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })))
      setUnread(0)
      toast.success('Semua notifikasi ditandai dibaca')
    } finally {
      setLoading(false)
    }
  }

  const markRead = async (id: string) => {
    await fetch(`/api/notifications?id=${id}`, { method: 'PATCH' })
    setNotifs((ns) => ns.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)))
    setUnread((u) => Math.max(0, u - 1))
  }

  const remove = async (id: string) => {
    await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' })
    setNotifs((ns) => ns.filter((n) => n.id !== id))
    toast.success('Notifikasi dihapus')
  }

  const handleClick = (n: NotifItem) => {
    if (!n.isRead) markRead(n.id)
    if (n.link) {
      // Convert link string to view
      const viewMap: Record<string, any> = {
        'public': { name: 'public' },
        'member-dashboard': { name: 'member-dashboard' },
        'admin-dashboard': { name: 'admin-dashboard' },
        'admin-archives': { name: 'admin-archives' },
        'admin-certificates': { name: 'admin-certificates' },
        'admin-events': { name: 'admin-events' },
        'admin-reports': { name: 'admin-reports' },
        'event-list': { name: 'event-list' },
        'news-list': { name: 'news-list' },
      }
      const v = viewMap[n.link]
      if (v) {
        setView(v)
        setOpen(false)
      }
    }
  }

  if (!user) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-accent transition-colors"
          aria-label="Notifikasi"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] grid place-items-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 animate-pulse-gold">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-navy dark:text-white">Notifikasi</span>
            {unread > 0 && <Badge className="bg-red-500 text-white text-[10px]">{unread} baru</Badge>}
          </div>
          {unread > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead} disabled={loading} className="h-7 text-xs">
              <CheckCheck className="h-3.5 w-3.5 mr-1" /> Tandai semua dibaca
            </Button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[420px] overflow-y-auto scrollbar-premium">
          {notifs.length === 0 ? (
            <div className="text-center py-10">
              <Bell className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Tidak ada notifikasi</p>
            </div>
          ) : (
            notifs.map((n) => {
              const Icon = TYPE_ICONS[n.type] ?? Info
              const colorClass = TYPE_COLORS[n.type] ?? 'bg-muted text-muted-foreground'
              return (
                <div
                  key={n.id}
                  className={`group relative flex gap-3 p-3 border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors cursor-pointer ${
                    !n.isRead ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''
                  }`}
                  onClick={() => handleClick(n)}
                >
                  {/* Unread indicator */}
                  {!n.isRead && (
                    <span className="absolute left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500" />
                  )}

                  <div className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg ${colorClass} ml-1`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-navy dark:text-white truncate">{n.title}</span>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {!n.isRead && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markRead(n.id) }}
                          className="text-[10px] text-blue-brand hover:underline"
                        >
                          Tandai dibaca
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); remove(n.id) }}
                        className="text-[10px] text-muted-foreground hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              setOpen(false)
              if (user.role === 'ANGGOTA') setView({ name: 'member-dashboard' })
              else setView({ name: 'admin-dashboard' })
            }}
          >
            <Settings className="h-3.5 w-3.5 mr-1.5" /> Pengaturan Notifikasi <ChevronRight className="ml-auto h-3.5 w-3.5" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
