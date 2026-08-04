'use client'

import { useApp, roleLabel, roleBadgeColor, hasPengurusAccess } from '@/lib/store'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard, Archive, Award, CalendarCheck, FileBarChart,
  LogOut, ChevronRight, BookOpen, Settings, Globe, FolderOpen, Palette, ListOrdered,
  Users, Image as ImageIcon, Inbox as InboxIcon, Shield, ArrowLeft,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n'
import { usePermissions } from '@/lib/use-permissions'
import * as React from 'react'

interface AdminNavItem {
  key: string
  labelKey: string
  icon: any
  view: any
}

interface AdminNavGroup {
  groupKey: string
  groupLabel: string
  items: AdminNavItem[]
}

const NAV_GROUPS: AdminNavGroup[] = [
  {
    groupKey: 'main',
    groupLabel: 'Utama',
    items: [
      { key: 'dashboard', labelKey: 'admin.dashboard', icon: LayoutDashboard, view: { name: 'admin-dashboard' } },
    ],
  },
  {
    groupKey: 'content',
    groupLabel: 'Konten & Website',
    items: [
      { key: 'cms', labelKey: 'admin.cms', icon: Globe, view: { name: 'admin-cms' } },
      { key: 'menu', labelKey: 'admin.menu', icon: ListOrdered, view: { name: 'admin-menu' } },
      { key: 'site-settings', labelKey: 'admin.siteSettings', icon: Palette, view: { name: 'admin-site-settings' } },
    ],
  },
  {
    groupKey: 'events_cert',
    groupLabel: 'Kegiatan & Sertifikat',
    items: [
      { key: 'events', labelKey: 'admin.events', icon: CalendarCheck, view: { name: 'admin-events' } },
      { key: 'certificates', labelKey: 'admin.certificates', icon: Award, view: { name: 'admin-certificates' } },
      { key: 'cert-templates', labelKey: 'admin.certTemplates', icon: ImageIcon, view: { name: 'admin-cert-templates' } },
    ],
  },
  {
    groupKey: 'membership',
    groupLabel: 'Keanggotaan & Komunikasi',
    items: [
      { key: 'members', labelKey: 'admin.members', icon: Users, view: { name: 'admin-members' } },
      { key: 'groups', labelKey: 'admin.groups', icon: Shield, view: { name: 'admin-groups' } },
      { key: 'inbox', labelKey: 'admin.inbox', icon: InboxIcon, view: { name: 'admin-inbox' } },
    ],
  },
  {
    groupKey: 'documents',
    groupLabel: 'Dokumen & Laporan',
    items: [
      { key: 'files', labelKey: 'admin.files', icon: FolderOpen, view: { name: 'admin-files' } },
      { key: 'archives', labelKey: 'admin.archives', icon: Archive, view: { name: 'admin-archives' } },
      { key: 'reports', labelKey: 'admin.reports', icon: FileBarChart, view: { name: 'admin-reports' } },
    ],
  },
  {
    groupKey: 'system',
    groupLabel: 'Sistem',
    items: [
      { key: 'settings', labelKey: 'admin.settings', icon: Settings, view: { name: 'admin-settings' } },
    ],
  },
]

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
  const { user, setView, logout, goBack } = useApp()
  const { t } = useTranslation()
  const [unreadInbox, setUnreadInbox] = React.useState(0)
  const { loading: permsLoading, canView } = usePermissions()

  // Filter groups and items by group permissions
  const visibleGroups = React.useMemo(() => {
    return NAV_GROUPS.map((group) => {
      const items = group.items.filter((item) => {
        if (permsLoading) return item.key === 'dashboard'
        if (item.key === 'cms') {
          return (
            canView('admin-cms') ||
            canView('cms-articles') ||
            canView('cms-events') ||
            canView('cms-library') ||
            canView('cms-gallery') ||
            canView('cms-organization') ||
            canView('cms-announcements') ||
            canView('cms-faq')
          )
        }
        return canView(item.view.name) || item.key === 'dashboard'
      })
      return { ...group, items }
    }).filter((group) => group.items.length > 0)
  }, [permsLoading, canView])

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
    const i = setInterval(loadUnread, 30000) // poll every 30s
    return () => clearInterval(i)
  }, [loadUnread])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    logout()
    toast.success('Anda telah keluar dari sistem')
  }

  const initials = user?.name?.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() ?? '?'

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />

      <div className="flex-1 mx-auto max-w-7xl w-full px-4 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[240px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start max-h-[85vh] overflow-y-auto pr-1 scrollbar-premium">
            {/* User card */}
            <div className="rounded-xl bg-navy-gradient text-white p-3.5 relative overflow-hidden">
              <div className="absolute inset-0 bg-grid opacity-20" />
              <div className="relative flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-gold/40">
                  <AvatarFallback className="bg-white/10 text-white text-xs font-semibold">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{user?.name?.split(',')[0]}</div>
                  <Badge className={`text-[10px] mt-0.5 ${roleBadgeColor(user?.role)}`}>{roleLabel(user?.role)}</Badge>
                </div>
              </div>
            </div>

            {/* Grouped Navigation */}
            <div className="space-y-4">
              {visibleGroups.map((group) => (
                <div key={group.groupKey} className="space-y-1">
                  <div className="px-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    {group.groupLabel}
                  </div>
                  {group.items.map((item) => {
                    const showInboxBadge = item.key === 'inbox' && unreadInbox > 0
                    return (
                      <button
                        key={item.key}
                        onClick={() => setView(item.view)}
                        className={`flex items-center gap-3 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                          activeKey === item.key
                            ? 'bg-navy-gradient text-white shadow-premium'
                            : 'bg-card hover:bg-accent text-foreground/70 hover:text-navy dark:hover:text-white'
                        }`}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{t(item.labelKey)}</span>
                        {showInboxBadge && (
                          <span className="ml-auto min-w-[18px] h-4 px-1 grid place-items-center rounded-full bg-red-500 text-white text-[9px] font-bold animate-pulse-gold">
                            {unreadInbox > 9 ? '9+' : unreadInbox}
                          </span>
                        )}
                        {activeKey === item.key && !showInboxBadge && <ChevronRight className="ml-auto h-4 w-4 flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            <Separator className="my-2" />
            <button
              onClick={() => setView({ name: 'public' })}
              className="flex items-center gap-3 w-full rounded-lg px-4 py-2.5 text-sm font-medium bg-card hover:bg-accent text-foreground/70 hover:text-navy dark:hover:text-white transition-all"
            >
              <BookOpen className="h-4 w-4" /> {t('admin.viewWebsite')}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full rounded-lg px-4 py-2.5 text-sm font-medium bg-card hover:bg-red-50 dark:hover:bg-red-900/20 text-foreground/70 hover:text-red-600 dark:hover:text-red-400 transition-all"
            >
              <LogOut className="h-4 w-4" /> {t('admin.logout')}
            </button>
          </aside>

          {/* Main content */}
          <main className="space-y-6 min-w-0">
            <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-border/40">
              <div className="flex items-center gap-3">
                {activeKey !== 'dashboard' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goBack}
                    className="h-9 px-3 gap-1.5 text-xs font-semibold text-navy dark:text-white border-border hover:bg-muted"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Kembali
                  </Button>
                )}
                <div>
                  <h1 className="font-display text-2xl lg:text-3xl font-extrabold text-navy dark:text-white leading-tight">{title}</h1>
                  {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
                </div>
              </div>
              {actions && <div className="flex gap-2">{actions}</div>}
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
