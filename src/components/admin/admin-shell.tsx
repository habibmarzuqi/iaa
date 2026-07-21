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
  Users, Image as ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n'

interface AdminNavItem {
  key: string
  labelKey: string
  icon: any
  view: any
}

const NAV_ITEMS: AdminNavItem[] = [
  { key: 'dashboard', labelKey: 'admin.dashboard', icon: LayoutDashboard, view: { name: 'admin-dashboard' } },
  { key: 'cms', labelKey: 'admin.cms', icon: Globe, view: { name: 'admin-cms' } },
  { key: 'menu', labelKey: 'admin.menu', icon: ListOrdered, view: { name: 'admin-menu' } },
  { key: 'members', labelKey: 'admin.members', icon: Users, view: { name: 'admin-members' } },
  { key: 'files', labelKey: 'admin.files', icon: FolderOpen, view: { name: 'admin-files' } },
  { key: 'site-settings', labelKey: 'admin.siteSettings', icon: Palette, view: { name: 'admin-site-settings' } },
  { key: 'archives', labelKey: 'admin.archives', icon: Archive, view: { name: 'admin-archives' } },
  { key: 'certificates', labelKey: 'admin.certificates', icon: Award, view: { name: 'admin-certificates' } },
  { key: 'cert-templates', labelKey: 'admin.certTemplates', icon: ImageIcon, view: { name: 'admin-cert-templates' } },
  { key: 'events', labelKey: 'admin.events', icon: CalendarCheck, view: { name: 'admin-events' } },
  { key: 'reports', labelKey: 'admin.reports', icon: FileBarChart, view: { name: 'admin-reports' } },
  { key: 'settings', labelKey: 'admin.settings', icon: Settings, view: { name: 'admin-settings' } },
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
  const { user, setView, logout } = useApp()
  const { t } = useTranslation()

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
          <aside className="space-y-2 lg:sticky lg:top-24 lg:self-start">
            {/* User card */}
            <div className="rounded-xl bg-navy-gradient text-white p-4 mb-2 relative overflow-hidden">
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

            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => setView(item.view)}
                className={`flex items-center gap-3 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  activeKey === item.key
                    ? 'bg-navy-gradient text-white shadow-premium'
                    : 'bg-card hover:bg-accent text-foreground/70 hover:text-navy dark:hover:text-white'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {t(item.labelKey)}
                {activeKey === item.key && <ChevronRight className="ml-auto h-4 w-4" />}
              </button>
            ))}

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
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h1 className="font-display text-2xl lg:text-3xl font-extrabold text-navy dark:text-white">{title}</h1>
                {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
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
