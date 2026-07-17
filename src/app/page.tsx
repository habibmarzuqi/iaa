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
        // redirect to login if not member
        if (user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMINISTRATOR' || user.role === 'PENGURUS')) {
          return <AdminDashboard />
        }
        return <LoginPage />
      }
      return <MemberDashboard />

    case 'admin-dashboard':
      if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
        return <LoginPage />
      }
      return <AdminDashboard />

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
