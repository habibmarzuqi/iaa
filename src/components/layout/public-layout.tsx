'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AnnouncementBanner } from '@/components/announcement-banner'

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
