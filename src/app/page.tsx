'use client'

import { useEffect } from 'react'
import { useApp } from '@/lib/store'
import { usePermissions } from '@/lib/use-permissions'
import { PublicSite } from '@/components/views/public-site'
import { LoginPage } from '@/components/views/login-page'
import { MemberDashboard } from '@/components/views/member-dashboard'
import { AdminDashboard } from '@/components/views/admin-dashboard'
import { NewsListView } from '@/components/views/news-list-view'
import { NewsDetailView } from '@/components/views/news-detail-view'
import { EventListView } from '@/components/views/event-list-view'
import { EventDetailView } from '@/components/views/event-detail-view'
import { LibraryView } from '@/components/views/library-view'
import { GalleryView } from '@/components/views/gallery-view'
import { AboutView } from '@/components/views/about-view'
import { OrganizationView } from '@/components/views/organization-view'
import { ContactView } from '@/components/views/contact-view'
import { FaqView } from '@/components/views/faq-view'
import { AdminArchivesView } from '@/components/views/admin-archives-view'
import { AdminCertificatesView } from '@/components/views/admin-certificates-view'
import { AdminEventsView } from '@/components/views/admin-events-view'
import { AdminReportsView } from '@/components/views/admin-reports-view'
import { AdminSettingsView } from '@/components/views/admin-settings-view'
import { AdminCMSView } from '@/components/views/admin-cms-view'
import { AdminFilesView } from '@/components/views/admin-files-view'
import { AdminSiteSettingsView } from '@/components/views/admin-site-settings-view'
import { AdminMenuView } from '@/components/views/admin-menu-view'
import { AdminMembersView } from '@/components/views/admin-members-view'
import { AdminCertTemplatesView } from '@/components/views/admin-cert-templates-view'
import { AdminInboxView } from '@/components/views/admin-inbox-view'
import { AdminGroupsView } from '@/components/views/admin-groups-view'
import { VerifyCertificateView } from '@/components/views/verify-certificate-view'
import { MyCertificatesView } from '@/components/views/my-certificates-view'
import { RegisterPage } from '@/components/views/register-page'
import { ChatView } from '@/components/views/chat-view'

export default function Home() {
  const { user, view, setUser, setView } = useApp()

  // hydrate session on first mount
  useEffect(() => {
    fetch('/api/auth/login', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser(d.user) })
      .catch(() => {})
  }, [setUser])

  // Listen for browser Back/Forward (popstate) events
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state?.view) {
        setView(e.state.view, { skipPushState: true })
      } else {
        const params = new URLSearchParams(window.location.search)
        const viewName = params.get('view')
        const eventSlug = params.get('event')
        const newsSlug = params.get('news')
        const verifyCert = params.get('verify')
        const certsEmail = params.get('certs')

        if (newsSlug) {
          setView({ name: 'news-detail', slug: newsSlug }, { skipPushState: true })
        } else if (eventSlug) {
          setView({ name: 'event-detail', slug: eventSlug }, { skipPushState: true })
        } else if (verifyCert) {
          setView({ name: 'verify-certificate' }, { skipPushState: true })
        } else if (certsEmail) {
          setView({ name: 'my-certificates' }, { skipPushState: true })
        } else if (viewName) {
          setView({ name: viewName as any }, { skipPushState: true })
        } else {
          setView({ name: 'public' }, { skipPushState: true })
        }
      }
    }

    window.addEventListener('popstate', handlePopState)

    // Initial page load deep link parse
    const params = new URLSearchParams(window.location.search)
    const viewName = params.get('view')
    const eventSlug = params.get('event')
    const newsSlug = params.get('news')
    const verifyCert = params.get('verify')
    const certsEmail = params.get('certs')

    let initialView: any = null
    if (eventSlug) {
      initialView = { name: 'event-detail', slug: eventSlug }
    } else if (newsSlug) {
      initialView = { name: 'news-detail', slug: newsSlug }
    } else if (verifyCert) {
      initialView = { name: 'verify-certificate' }
    } else if (certsEmail) {
      initialView = { name: 'my-certificates' }
    } else if (viewName) {
      initialView = { name: viewName as any }
    }

    if (initialView) {
      setView(initialView, { skipPushState: true })
      try {
        window.history.replaceState({ view: initialView }, '', window.location.href)
      } catch {}
    } else {
      try {
        window.history.replaceState({ view: { name: 'public' } }, '', '/')
      } catch {}
    }

    return () => window.removeEventListener('popstate', handlePopState)
  }, [setView])

  // Helper: render admin view by name
  function renderAdminView(name: string): React.ReactNode {
    switch (name) {
      case 'admin-archives': return <AdminArchivesView />
      case 'admin-certificates': return <AdminCertificatesView />
      case 'admin-events': return <AdminEventsView />
      case 'admin-reports': return <AdminReportsView />
      case 'admin-settings': return <AdminSettingsView />
      case 'admin-cms': return <AdminCMSView />
      case 'admin-files': return <AdminFilesView />
      case 'admin-site-settings': return <AdminSiteSettingsView />
      case 'admin-menu': return <AdminMenuView />
      case 'admin-members': return <AdminMembersView />
      case 'admin-cert-templates': return <AdminCertTemplatesView />
      case 'admin-inbox': return <AdminInboxView />
      case 'admin-groups': return <AdminGroupsView />
      default: return <AdminDashboard />
    }
  }

  // dispatch by view.name
  switch (view.name) {
    case 'login':
      return <LoginPage />
    case 'register':
      return <RegisterPage />

    case 'member-dashboard':
      if (!user || user.role !== 'ANGGOTA') {
        if (user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMINISTRATOR' || user.role === 'PENGURUS')) {
          return <AdminDashboard />
        }
        return <LoginPage />
      }
      return <MemberDashboard />

    case 'admin-dashboard':
    case 'admin-archives':
    case 'admin-certificates':
    case 'admin-events':
    case 'admin-reports':
    case 'admin-settings':
    case 'admin-cms':
    case 'admin-files':
    case 'admin-site-settings':
    case 'admin-menu':
    case 'admin-members':
    case 'admin-cert-templates':
    case 'admin-inbox':
    case 'admin-groups':
      if (!user) {
        return <LoginPage />
      }
      // For non-dashboard views, check group permission for non-SUPER_ADMIN users
      if (view.name !== 'admin-dashboard' && user.role !== 'SUPER_ADMIN') {
        return <PermissionGate viewName={view.name}>{renderAdminView(view.name)}</PermissionGate>
      }
      return renderAdminView(view.name)

    case 'verify-certificate':
      return <VerifyCertificateView />

    case 'my-certificates':
      return <MyCertificatesView />

    case 'chat':
      return <ChatView />

    case 'news-list':
      return <NewsListView />
    case 'news-detail':
      return <NewsDetailView slug={view.slug} />
    case 'event-list':
      return <EventListView />
    case 'event-detail':
      return <EventDetailView slug={view.slug} />
    case 'library':
      return <LibraryView />
    case 'gallery':
      return <GalleryView />
    case 'about':
      return <AboutView />
    case 'organization':
      return <OrganizationView />
    case 'contact':
      return <ContactView />
    case 'faq':
      return <FaqView />

    case 'public':
    default:
      return <PublicSite />
  }
}

// ============ Permission Gate ============
// Wraps admin views for PENGURUS users — blocks access if they don't have
// group permission for the module, and redirects to dashboard.
function PermissionGate({ viewName, children }: { viewName: string; children: React.ReactNode }) {
  const { setView } = useApp()
  const { loading, canView } = usePermissions()

  // While loading permissions, show a spinner instead of the content
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy border-t-transparent mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Memuat permission...</p>
        </div>
      </div>
    )
  }

  // Check if user can view this module
  if (!canView(viewName)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <div className="max-w-md text-center">
          <div className="grid h-16 w-16 mx-auto place-items-center rounded-full bg-red-50 dark:bg-red-900/20 mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0114.635 4.44m-2.515 0a11.959 11.959 0 00-2.515-.585M12 9v.01m5.636-3.921A11.959 11.959 0 0112 4.44m5.636 3.921a11.959 11.959 0 012.515.585M12 15h.01m5.636-3.921a11.959 11.959 0 00-2.515-.585m2.515.585a11.959 11.959 0 012.515.585" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-navy dark:text-white mb-2">Akses Ditolak</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Anda tidak memiliki permission untuk mengakses modul ini. Hubungi administrator jika Anda merasa ini adalah kesalahan.
          </p>
          <button
            onClick={() => setView({ name: 'admin-dashboard' })}
            className="inline-flex items-center gap-2 rounded-lg bg-navy-gradient px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Mon Jul 27 01:16:29 UTC 2026
