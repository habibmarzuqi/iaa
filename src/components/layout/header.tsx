'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp, hasPengurusAccess, roleLabel, roleBadgeColor } from '@/lib/store'
import { IAALogo } from '@/components/iaa-logo'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/theme-toggle'
import { NotificationBell } from '@/components/notification-bell'
import { LanguageSwitcher } from '@/components/language-switcher'
import { SearchDialog } from '@/components/search-dialog'
import { useTranslation } from '@/lib/i18n'
import {
  Menu, LogOut, User as UserIcon, LayoutDashboard,
  FileText, Calendar, BookOpen, Users, Info, HelpCircle, Mail, Image as ImageIcon,
  Bot, ShieldCheck, Search, ChevronDown, ChevronRight, X, Sparkles,
} from 'lucide-react'

// Grouped nav structure: standalone items + dropdown groups
type NavItem = { labelKey: string; view: any }
type NavGroup = { labelKey: string; children: NavItem[] }
type NavEntry = NavItem | NavGroup

const NAV: NavEntry[] = [
  { labelKey: 'nav.beranda', view: { name: 'public' as const } },
  {
    labelKey: 'nav.tentang',
    children: [
      { labelKey: 'nav.tentang', view: { name: 'about' as const } },
      { labelKey: 'nav.pengurus', view: { name: 'organization' as const } },
    ],
  },
  {
    labelKey: 'nav.informasi',
    children: [
      { labelKey: 'nav.berita', view: { name: 'news-list' as const } },
      { labelKey: 'nav.agenda', view: { name: 'event-list' as const } },
      { labelKey: 'nav.galeri', view: { name: 'gallery' as const } },
      { labelKey: 'nav.faq', view: { name: 'faq' as const } },
    ],
  },
  { labelKey: 'nav.library', view: { name: 'library' as const } },
  { labelKey: 'nav.kontak', view: { name: 'contact' as const } },
]

function iconFor(labelKey: string) {
  switch (labelKey) {
    case 'nav.tentang': return Info
    case 'nav.pengurus': return Users
    case 'nav.berita': return FileText
    case 'nav.agenda': return Calendar
    case 'nav.library': return BookOpen
    case 'nav.galeri': return ImageIcon
    case 'nav.faq': return HelpCircle
    case 'nav.kontak': return Mail
    default: return FileText
  }
}

function isNavGroup(item: NavEntry): item is NavGroup {
  return 'children' in item
}

export function Header() {
  const { user, setView, logout } = useApp()
  const { t } = useTranslation()
  const [siteSettings, setSiteSettings] = React.useState<Record<string, string>>({})
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)

  // Load site settings on mount
  React.useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setSiteSettings(d.settings || {}))
      .catch(() => {})
  }, [])

  const siteName = siteSettings['site.name'] || 'IAA Digital'
  const siteTagline = siteSettings['site.tagline'] || 'Ikatan Arsiparis ANRI'
  const logoUrl = siteSettings['branding.logoUrl']

  // Keyboard shortcut: Cmd/Ctrl+K
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const initials = user?.name
    ?.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() ?? '?'

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    logout()
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'glass-card shadow-premium border-b border-border/50'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
        <button
          onClick={() => setView({ name: 'public' })}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          {logoUrl ? (
            <div className="flex items-center gap-2.5">
              <img src={logoUrl} alt={siteName} className="h-9 w-9 object-contain" />
              <div className="flex flex-col leading-none">
                <span className="font-display font-extrabold tracking-tight text-[15px] text-navy dark:text-white">{siteName}</span>
                <span className="text-[10px] tracking-wider uppercase mt-0.5 text-muted-foreground">{siteTagline}</span>
              </div>
            </div>
          ) : siteSettings['site.name'] ? (
            <div className="flex items-center gap-2.5">
              <IAALogo />
              <div className="flex flex-col leading-none">
                <span className="font-display font-extrabold tracking-tight text-[15px] text-navy dark:text-white">{siteName}</span>
                <span className="text-[10px] tracking-wider uppercase mt-0.5 text-muted-foreground">{siteTagline}</span>
              </div>
            </div>
          ) : (
            <IAALogo withText />
          )}
        </button>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV.map((item) => {
            if (isNavGroup(item)) {
              // Dropdown group with hover
              return (
                <div key={item.labelKey} className="group relative">
                  <button
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-navy hover:bg-accent/40 rounded-md"
                  >
                    {t(item.labelKey)}
                    <ChevronDown className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:rotate-180 transition-all" />
                  </button>
                  {/* Hover dropdown */}
                  <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute top-full left-0 pt-1 transition-all duration-200 z-50 min-w-[200px]">
                    <div className="rounded-xl border border-border bg-card shadow-premium overflow-hidden p-1.5">
                      {item.children.map((child) => {
                        const Icon = iconFor(child.labelKey)
                        return (
                          <button
                            key={child.labelKey}
                            onClick={() => setView(child.view)}
                            className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-sm text-foreground/70 hover:bg-accent hover:text-navy dark:hover:text-white transition-colors text-left"
                          >
                            <Icon className="h-4 w-4 text-gold flex-shrink-0" />
                            {t(child.labelKey)}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            }
            // Standalone item
            return (
              <button
                key={item.labelKey}
                onClick={() => setView(item.view)}
                className="px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-navy hover:bg-accent/40 rounded-md"
              >
                {t(item.labelKey)}
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Search button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:border-gold/40 hover:text-navy dark:hover:text-white transition-colors"
            title="Pencarian global (Ctrl+K)"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">{t('nav.search')}</span>
            <kbd className="hidden lg:inline-flex h-4 items-center gap-0.5 rounded border border-border bg-muted px-1 text-[9px] font-mono">
              ⌘K
            </kbd>
          </button>

          {/* AI Chatbot quick access */}
          <button
            onClick={() => setView({ name: 'chat' })}
            className="hidden md:flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold hover:bg-gold/20 transition-colors"
            title="Asisten AI Kearsipan"
          >
            <Bot className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">{t('nav.chatbot')}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {/* Verify cert quick access */}
          <button
            onClick={() => setView({ name: 'verify-certificate' })}
            className="hidden md:flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground/70 hover:border-gold/40 hover:text-navy dark:hover:text-white transition-colors"
            title="Verifikasi Sertifikat"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">{t('nav.verify')}</span>
          </button>

          <LanguageSwitcher />
          <ThemeToggle />

          {user && <NotificationBell />}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-border bg-background/50 p-1 pr-3 transition-all hover:shadow-premium hover:border-gold/30">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-navy-gradient text-white text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start leading-tight">
                    <span className="text-xs font-semibold text-navy dark:text-white max-w-[120px] truncate">{user.name.split(',')[0]}</span>
                    <span className="text-[10px] text-muted-foreground">{roleLabel(user.role)}</span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="flex flex-col gap-1">
                  <span>{user.name}</span>
                  <Badge variant="outline" className={`w-fit text-[10px] ${roleBadgeColor(user.role)}`}>
                    {roleLabel(user.role)}
                  </Badge>
                  <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === 'ANGGOTA' && (
                  <DropdownMenuItem onClick={() => setView({ name: 'member-dashboard' })}>
                    <LayoutDashboard className="mr-2 h-4 w-4" /> {t('nav.dashboardAnggota')}
                  </DropdownMenuItem>
                )}
                {hasPengurusAccess(user.role) && (
                  <DropdownMenuItem onClick={() => setView({ name: 'admin-dashboard' })}>
                    <LayoutDashboard className="mr-2 h-4 w-4" /> {t('nav.dashboardAdmin')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setView({ name: 'public' })}>
                  <UserIcon className="mr-2 h-4 w-4" /> {t('nav.lihatWebsite')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" /> {t('nav.keluar')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => setView({ name: 'login' })}
              size="sm"
              className="hidden sm:inline-flex bg-navy-gradient hover:opacity-90"
            >
              {t('nav.masuk')}
            </Button>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t('nav.menu')}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] p-0 overflow-y-auto scrollbar-premium">
              <MobileMenu
                user={user}
                siteName={siteName}
                siteTagline={siteTagline}
                logoUrl={logoUrl}
                onClose={() => setMobileOpen(false)}
                onNavigate={(v) => { setView(v); setMobileOpen(false) }}
                onLogout={handleLogout}
                onSearch={() => { setSearchOpen(true); setMobileOpen(false) }}
                t={t}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  )
}

// ============ Modern Mobile Menu ============

interface MobileMenuProps {
  user: any
  siteName: string
  siteTagline: string
  logoUrl?: string
  onClose: () => void
  onNavigate: (view: any) => void
  onLogout: () => void
  onSearch: () => void
  t: (key: string) => string
}

function MobileMenu({ user, siteName, siteTagline, logoUrl, onClose, onNavigate, onLogout, onSearch, t }: MobileMenuProps) {
  const [expandedGroup, setExpandedGroup] = React.useState<string | null>(null)
  const initials = user?.name?.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase() ?? '?'

  // Flatten all navigation items for the main list
  const flatNav: { labelKey: string; view: any; icon: any; group?: string; description?: string }[] = []
  for (const item of NAV) {
    if (isNavGroup(item)) {
      for (const child of item.children) {
        flatNav.push({
          labelKey: child.labelKey,
          view: child.view,
          icon: iconFor(child.labelKey),
          group: t(item.labelKey),
        })
      }
    } else {
      flatNav.push({
        labelKey: item.labelKey,
        view: item.view,
        icon: iconFor(item.labelKey),
      })
    }
  }

  // Group by section
  const sections = flatNav.reduce<Record<string, typeof flatNav>>((acc, item) => {
    const g = item.group || 'Menu'
    if (!acc[g]) acc[g] = []
    acc[g].push(item)
    return acc
  }, {})

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background via-background to-muted/30">
      {/* ===== Hero Header with gradient ===== */}
      <div className="relative overflow-hidden bg-navy-gradient text-white">
        <div className="absolute inset-0 bg-grid opacity-20" />
        {/* Decorative gold accent */}
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-blue/30 blur-3xl" />

        <div className="relative p-5 pt-6">
          {/* Top row: logo + close button */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-11 w-11 object-contain rounded-lg bg-white/10 p-1.5" />
              ) : (
                <IAALogo />
              )}
              <div className="flex flex-col leading-tight">
                <span className="font-display font-extrabold text-base tracking-tight">{siteName}</span>
                <span className="text-[10px] tracking-wider uppercase text-white/60 mt-0.5">{siteTagline}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Tutup menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* User profile card (if logged in) */}
          {user ? (
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
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-gold/15 backdrop-blur-sm border border-gold/30 p-3 flex items-center gap-3"
            >
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gold/20 text-gold flex-shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-white">Selamat Datang</div>
                <div className="text-[11px] text-white/70">Masuk untuk akses fitur lengkap</div>
              </div>
              <Button
                size="sm"
                onClick={() => onNavigate({ name: 'login' })}
                className="bg-white text-navy hover:bg-white/90 text-xs font-semibold"
              >
                Masuk
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* ===== Quick Actions (horizontal scroll) ===== */}
      <div className="px-4 -mt-3 relative z-10">
        <div className="grid grid-cols-3 gap-2">
          <QuickActionCard
            icon={Search}
            label="Pencarian"
            onClick={onSearch}
            color="from-blue-soft to-blue"
          />
          <QuickActionCard
            icon={Bot}
            label="AI Asisten"
            onClick={() => onNavigate({ name: 'chat' })}
            color="from-emerald-400 to-emerald-600"
            badge="●"
          />
          <QuickActionCard
            icon={ShieldCheck}
            label="Verifikasi"
            onClick={() => onNavigate({ name: 'verify-certificate' })}
            color="from-gold-soft to-gold"
          />
        </div>
      </div>

      {/* ===== Navigation sections ===== */}
      <div className="flex-1 px-4 py-4 space-y-5">
        {Object.entries(sections).map(([sectionName, items], sIdx) => (
          <motion.div
            key={sectionName}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sIdx * 0.05 }}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
              {sectionName}
            </div>
            <div className="space-y-1">
              {items.map((item, iIdx) => (
                <motion.button
                  key={item.labelKey}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: sIdx * 0.05 + iIdx * 0.03 }}
                  onClick={() => onNavigate(item.view)}
                  className="group flex items-center gap-3 w-full rounded-xl px-3 py-3 text-left bg-card hover:bg-gradient-to-r hover:from-navy hover:to-blue dark:hover:from-navy dark:hover:to-blue-dark border border-border/50 hover:border-transparent transition-all"
                >
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-muted group-hover:bg-white/15 transition-colors flex-shrink-0">
                    <item.icon className="h-4 w-4 text-navy dark:text-white group-hover:text-white transition-colors" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-foreground/80 group-hover:text-white transition-colors">
                    {t(item.labelKey)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-white/70 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}

        {/* ===== Admin / Member Dashboard quick link ===== */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
              Dashboard
            </div>
            <button
              onClick={() => onNavigate({ name: hasPengurusAccess(user.role) ? 'admin-dashboard' : 'member-dashboard' })}
              className="group flex items-center gap-3 w-full rounded-xl px-3 py-3 text-left bg-gradient-to-r from-navy to-blue text-white border border-navy/30 hover:shadow-premium transition-all"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/15 flex-shrink-0">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              <span className="flex-1 text-sm font-semibold">
                {hasPengurusAccess(user.role) ? 'Dashboard Admin' : 'Dashboard Anggota'}
              </span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-all" />
            </button>
          </motion.div>
        )}
      </div>

      {/* ===== Footer: logout + branding ===== */}
      <div className="border-t border-border p-4 bg-card/50 backdrop-blur-sm">
        {user && (
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full rounded-xl px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-red-50 dark:bg-red-900/20 flex-shrink-0">
              <LogOut className="h-4 w-4" />
            </div>
            <span className="flex-1 text-left">Keluar dari Akun</span>
          </button>
        )}
        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">© 2026 IAA Digital</span>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickActionCard({
  icon: Icon,
  label,
  onClick,
  color,
  badge,
}: {
  icon: any
  label: string
  onClick: () => void
  color: string
  badge?: string
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="relative flex flex-col items-center gap-1.5 rounded-xl bg-card border border-border/60 p-3 hover:border-gold/40 hover:shadow-premium transition-all"
    >
      <div className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${color} text-white shadow-sm`}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-[10px] font-semibold text-foreground/80 text-center leading-tight">{label}</span>
      {badge && (
        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
      )}
    </motion.button>
  )
}
