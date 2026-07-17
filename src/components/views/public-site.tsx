'use client'

import { PublicLayout } from '@/components/layout/public-layout'
import { HeroSection } from '@/components/sections/hero-section'
import { AboutSection } from '@/components/sections/about-section'
import { StatsSection } from '@/components/sections/stats-section'
import { NewsSection } from '@/components/sections/news-section'
import { EventsSection } from '@/components/sections/events-section'
import { LibraryPreview } from '@/components/sections/library-preview'
import { OrganizationPreview } from '@/components/sections/organization-preview'
import { FaqSection } from '@/components/sections/faq-section'
import { CtaSection } from '@/components/sections/cta-section'

export function PublicSite() {
  return (
    <PublicLayout>
      <HeroSection />
      <AboutSection />
      <StatsSection />
      <NewsSection />
      <EventsSection />
      <LibraryPreview />
      <OrganizationPreview />
      <FaqSection />
      <CtaSection />
    </PublicLayout>
  )
}
