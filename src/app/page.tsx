'use client'

import { useEffect } from 'react'
import { useApp } from '@/lib/store'
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
import { VerifyCertificateView } from '@/components/views/verify-certificate-view'
import { ChatView } from '@/components/views/chat-view'

export default function Home() {
  const { user, view, setUser, setView } = useApp()

  // hydrate session on first mount
  useEffect(() => {
    fetch('/api/auth/login', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUser(d.user)
      })
      .catch(() => {})
  }, [setUser])

  // dispatch by view.name
  switch (view.name) {
    case 'login':
    case 'register':
      return <LoginPage />

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
      if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
        return <LoginPage />
      }
      switch (view.name) {
        case 'admin-archives': return <AdminArchivesView />
        case 'admin-certificates': return <AdminCertificatesView />
        case 'admin-events': return <AdminEventsView />
        case 'admin-reports': return <AdminReportsView />
        case 'admin-settings': return <AdminSettingsView />
        case 'admin-cms': return <AdminCMSView />
        case 'admin-files': return <AdminFilesView />
        case 'admin-site-settings': return <AdminSiteSettingsView />
        default: return <AdminDashboard />
      }

    case 'verify-certificate':
      return <VerifyCertificateView />

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

