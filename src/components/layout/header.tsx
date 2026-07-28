'use client'

import * as React from 'react'
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
  Bot, ShieldCheck, Search, ChevronDown,
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
  const [settingsLoaded, setSettingsLoaded] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)

  // Load site settings on mount
  React.useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => { setSiteSettings(d.settings || {}); setSettingsLoaded(true) })
      .catch(() => setSettingsLoaded(true))
  }, [])

  const siteName = siteSettings['site.name'] || 'IAA Digital'
  const siteTagline = siteSettings['site.tagline'] || 'Ikatan Arsiparis ANRI'
  const logoUrl = siteSettings['branding.logoUrl']

  // Header feature toggles (respect site settings)
  const showSearch = siteSettings['header.showSearch'] !== 'false'
  const showAIChatbot = siteSettings['header.showAIChatbot'] !== 'false'
  const showVerifyButton = siteSettings['header.showVerifyButton'] !== 'false'
  const showLanguageSwitcher = siteSettings['header.showLanguageSwitcher'] !== 'false'
  const showThemeToggle = siteSettings['header.showThemeToggle'] !== 'false'

  // Keyboard shortcut: Cmd/Ctrl+K (only if search enabled)
  React.useEffect(() => {
    if (!showSearch) return
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
          {/* Search button - hidden until settings loaded to prevent flash */}
          {settingsLoaded && showSearch && (
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
          )}

          {/* AI Chatbot quick access */}
          {settingsLoaded && showAIChatbot && (
          <button
            onClick={() => setView({ name: 'chat' })}
            className="hidden md:flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold hover:bg-gold/20 transition-colors"
            title="Asisten AI Kearsipan"
          >
            <Bot className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">{t('nav.chatbot')}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>
          )}

          {/* Verify cert quick access */}
          {settingsLoaded && showVerifyButton && (
          <button
            onClick={() => setView({ name: 'verify-certificate' })}
            className="hidden md:flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground/70 hover:border-gold/40 hover:text-navy dark:hover:text-white transition-colors"
            title="Verifikasi Sertifikat"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">{t('nav.verify')}</span>
          </button>
          )}

          {settingsLoaded && showLanguageSwitcher && <LanguageSwitcher />}
          {settingsLoaded && showThemeToggle && <ThemeToggle />}

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
            <SheetContent side="right" className="w-[300px] sm:w-[360px]">
              <div className="flex flex-col gap-1 mt-6">
                <div className="px-2 mb-3">
                  <IAALogo withText />
                </div>
                {NAV.map((item) => {
                  if (isNavGroup(item)) {
                    return (
                      <div key={item.labelKey} className="space-y-1">
                        <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {t(item.labelKey)}
                        </div>
                        {item.children.map((child) => {
                          const Icon = iconFor(child.labelKey)
                          return (
                            <button
                              key={child.labelKey}
                              onClick={() => { setView(child.view); setMobileOpen(false) }}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-navy transition-colors w-full"
                            >
                              <Icon className="h-4 w-4 text-gold" />
                              {t(child.labelKey)}
                            </button>
                          )
                        })}
                      </div>
                    )
                  }
                  const Icon = iconFor(item.labelKey)
                  return (
                    <button
                      key={item.labelKey}
                      onClick={() => { setView(item.view); setMobileOpen(false) }}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-navy transition-colors"
                    >
                      <Icon className="h-4 w-4 text-gold" />
                      {t(item.labelKey)}
                    </button>
                  )
                })}
                {!user && (
                  <Button
                    onClick={() => { setView({ name: 'login' }); setMobileOpen(false) }}
                    className="mt-4 bg-navy-gradient"
                  >
                    {t('nav.masuk')} ke Akun
                  </Button>
                )}
                <div className="mt-4 pt-4 border-t border-border space-y-1">
                  {settingsLoaded && showAIChatbot && (
                  <button
                    onClick={() => { setView({ name: 'chat' }); setMobileOpen(false) }}
                    className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent transition-colors"
                  >
                    <Bot className="h-4 w-4 text-gold" /> {t('nav.chatbot')} Kearsipan
                  </button>
                  )}
                  {settingsLoaded && showVerifyButton && (
                  <button
                    onClick={() => { setView({ name: 'verify-certificate' }); setMobileOpen(false) }}
                    className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4 text-gold" /> {t('nav.verify')} Sertifikat
                  </button>
                  )}
                  {settingsLoaded && (showLanguageSwitcher || showThemeToggle) && (
                  <div className="flex items-center gap-2 pt-2">
                    {showLanguageSwitcher && <LanguageSwitcher />}
                    {showThemeToggle && <ThemeToggle />}
                  </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  )
}
