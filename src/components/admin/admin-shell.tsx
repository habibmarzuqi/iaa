'use client'

import { useApp, roleLabel, roleBadgeColor, hasPengurusAccess } from '@/lib/store'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  LayoutDashboard, Archive, Award, CalendarCheck, FileBarChart,
  LogOut, ChevronRight, BookOpen, Settings, Globe, FolderOpen, Palette, ListOrdered,
  Users, Image as ImageIcon, Inbox as InboxIcon, Menu, X, Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n'
import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ===== Nav structure with sections =====

interface AdminNavItem {
  key: string
  labelKey: string
  icon: any
  view: any
}

interface AdminNavSection {
  name: string
  labelKey: string
  items: AdminNavItem[]
}

const NAV_SECTIONS: AdminNavSection[] = [
  {
    name: 'utama',
    labelKey: 'admin.section.utama',
    items: [
      { key: 'dashboard', labelKey: 'admin.dashboard', icon: LayoutDashboard, view: { name: 'admin-dashboard' } },
    ],
  },
  {
    name: 'konten',
    labelKey: 'admin.section.konten',
    items: [
      { key: 'cms', labelKey: 'admin.cms', icon: Globe, view: { name: 'admin-cms' } },
      { key: 'menu', labelKey: 'admin.menu', icon: ListOrdered, view: { name: 'admin-menu' } },
      { key: 'archives', labelKey: 'admin.archives', icon: Archive, view: { name: 'admin-archives' } },
    ],
  },
  {
    name: 'people',
    labelKey: 'admin.section.people',
    items: [
      { key: 'members', labelKey: 'admin.members', icon: Users, view: { name: 'admin-members' } },
      { key: 'inbox', labelKey: 'admin.inbox', icon: InboxIcon, view: { name: 'admin-inbox' } },
    ],
  },
  {
    name: 'kegiatan',
    labelKey: 'admin.section.kegiatan',
    items: [
      { key: 'events', labelKey: 'admin.events', icon: CalendarCheck, view: { name: 'admin-events' } },
      { key: 'certificates', labelKey: 'admin.certificates', icon: Award, view: { name: 'admin-certificates' } },
      { key: 'cert-templates', labelKey: 'admin.certTemplates', icon: ImageIcon, view: { name: 'admin-cert-templates' } },
    ],
  },
  {
    name: 'sistem',
    labelKey: 'admin.section.sistem',
    items: [
      { key: 'files', labelKey: 'admin.files', icon: FolderOpen, view: { name: 'admin-files' } },
      { key: 'reports', labelKey: 'admin.reports', icon: FileBarChart, view: { name: 'admin-reports' } },
      { key: 'site-settings', labelKey: 'admin.siteSettings', icon: Palette, view: { name: 'admin-site-settings' } },
      { key: 'settings', labelKey: 'admin.settings', icon: Settings, view: { name: 'admin-settings' } },
    ],
  },
]

// Flatten for quick lookup
const ALL_ITEMS = NAV_SECTIONS.flatMap((s) => s.items)

export function AdminShell({
  activeKey,
  title,
  subtitle,
  children,
  actions,
}: {
  activeKey: string
  title: string
  subtitle?: string
  children: React.ReactNode
  actions?: React.ReactNode
}) {
  const { user, setView, logout } = useApp()
  const { t } = useTranslation()
  const [unreadInbox, setUnreadInbox] = React.useState(0)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  // Fetch unread inbox count for badge
  const loadUnread = React.useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch('/api/contact?unread=true&limit=1', { cache: 'no-store' })
      if (res.ok) {
        const d = await res.json()
        setUnreadInbox(d.unreadCount ?? 0)
      }
    } catch {}
  }, [user])

  React.useEffect(() => {
    loadUnread()
    const i = setInterval(loadUnread, 30000)
    return () => clearInterval(i)
  }, [loadUnread])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    logout()
    toast.success('Anda telah keluar dari sistem')
  }

  const handleNavigate = (view: any) => {
    setView(view)
    setMobileOpen(false)
  }

  const initials = user?.name?.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() ?? '?'

  // Find current section for mobile header
  const currentSection = NAV_SECTIONS.find((s) => s.items.some((i) => i.key === activeKey))
  const currentItem = ALL_ITEMS.find((i) => i.key === activeKey)

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />

      {/* Mobile admin toolbar (sticky) */}
      <div className="lg:hidden sticky top-16 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="min-w-0 flex-1">
            <div className="font-display font-bold text-sm text-navy dark:text-white truncate">{title}</div>
            {currentItem && (
              <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                <currentItem.icon className="h-3 w-3" />
                {t(currentItem.labelKey)}
              </div>
            )}
          </div>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Menu className="h-4 w-4" /> Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-[380px] p-0 overflow-y-auto scrollbar-premium">
              <AdminSidebar
                activeKey={activeKey}
                user={user}
                unreadInbox={unreadInbox}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                onClose={() => setMobileOpen(false)}
                t={t}
                isMobile
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex-1 mx-auto max-w-7xl w-full px-4 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
            <AdminSidebar
              activeKey={activeKey}
              user={user}
              unreadInbox={unreadInbox}
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              onClose={() => {}}
              t={t}
              isMobile={false}
            />
          </aside>

          {/* Main content */}
          <main className="space-y-6 min-w-0">
            <div className="hidden lg:flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h1 className="font-display text-2xl lg:text-3xl font-extrabold text-navy dark:text-white">{title}</h1>
                {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
              </div>
              {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
            </div>

            {/* Mobile actions row */}
            {actions && (
              <div className="lg:hidden flex gap-2 flex-wrap">{actions}</div>
            )}

            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

// ============ Admin Sidebar Component ============

interface SidebarProps {
  activeKey: string
  user: any
  unreadInbox: number
  onNavigate: (view: any) => void
  onLogout: () => void
  onClose: () => void
  t: (key: string) => string
  isMobile: boolean
}

function AdminSidebar({ activeKey, user, unreadInbox, onNavigate, onLogout, onClose, t, isMobile }: SidebarProps) {
  const initials = user?.name?.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase() ?? '?'

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background via-background to-muted/30">
      {/* ===== Hero Header ===== */}
      <div className="relative overflow-hidden bg-navy-gradient text-white">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-blue/30 blur-3xl" />

        <div className="relative p-5 pt-5">
          {/* Top row: title + close (mobile) */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/15">
                <Sparkles className="h-4 w-4 text-gold" />
              </div>
              <div className="leading-tight">
                <div className="font-display font-extrabold text-sm tracking-tight">Admin Panel</div>
                <div className="text-[10px] text-white/60 uppercase tracking-wider">IAA Digital</div>
              </div>
            </div>
            {isMobile && (
              <button
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Tutup menu"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* User profile card */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 p-3 flex items-center gap-3"
            >
              <Avatar className="h-11 w-11 border-2 border-gold/40 flex-shrink-0">
                <AvatarFallback className="bg-white/15 text-white font-bold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm truncate">{user.name?.split(',')[0]}</div>
                <div className="text-[11px] text-white/70 truncate">{user.email}</div>
              </div>
              <Badge className={`text-[10px] flex-shrink-0 ${roleBadgeColor(user.role)}`}>
                {roleLabel(user.role)}
              </Badge>
            </motion.div>
          )}
        </div>
      </div>

      {/* ===== Navigation sections ===== */}
      <div className="flex-1 px-3 py-4 space-y-4 overflow-y-auto scrollbar-premium">
        {NAV_SECTIONS.map((section, sIdx) => (
          <motion.div
            key={section.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sIdx * 0.05 }}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 px-2">
              {t(section.labelKey)}
            </div>
            <div className="space-y-1">
              {section.items.map((item, iIdx) => {
                const isActive = activeKey === item.key
                const showInboxBadge = item.key === 'inbox' && unreadInbox > 0
                return (
                  <motion.button
                    key={item.key}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: sIdx * 0.05 + iIdx * 0.025 }}
                    onClick={() => onNavigate(item.view)}
                    className={`group flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-left transition-all border ${
                      isActive
                        ? 'bg-gradient-to-r from-navy to-blue text-white border-transparent shadow-premium'
                        : 'bg-card border-border/50 hover:border-gold/40 hover:shadow-sm text-foreground/80'
                    }`}
                  >
                    <div className={`grid h-8 w-8 place-items-center rounded-lg flex-shrink-0 transition-colors ${
                      isActive ? 'bg-white/15' : 'bg-muted group-hover:bg-gradient-to-br group-hover:from-gold-soft group-hover:to-gold'
                    }`}>
                      <item.icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-navy dark:text-white group-hover:text-white'}`} />
                    </div>
                    <span className={`flex-1 text-sm font-medium ${isActive ? 'text-white' : ''}`}>
                      {t(item.labelKey)}
                    </span>
                    {showInboxBadge && (
                      <span className="min-w-[20px] h-5 px-1.5 grid place-items-center rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse-gold flex-shrink-0">
                        {unreadInbox > 9 ? '9+' : unreadInbox}
                      </span>
                    )}
                    {isActive && !showInboxBadge && (
                      <ChevronRight className="h-4 w-4 text-white/70 flex-shrink-0" />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ===== Footer ===== */}
      <div className="border-t border-border p-3 bg-card/50 backdrop-blur-sm space-y-1">
        <button
          onClick={() => onNavigate({ name: 'public' })}
          className="group flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent transition-colors"
        >
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted group-hover:bg-gradient-to-br group-hover:from-blue-soft group-hover:to-blue transition-colors flex-shrink-0">
            <BookOpen className="h-4 w-4 text-navy dark:text-white group-hover:text-white" />
          </div>
          <span className="flex-1 text-left">{t('admin.viewWebsite')}</span>
        </button>
        <button
          onClick={onLogout}
          className="group flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 dark:bg-red-900/20 flex-shrink-0">
            <LogOut className="h-4 w-4" />
          </div>
          <span className="flex-1 text-left">{t('admin.logout')}</span>
        </button>
      </div>
    </div>
  )
}
