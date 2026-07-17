/**
 * IAA Digital — Lightweight i18n dictionary (ID/EN)
 * Persisted language choice via localStorage.
 */
'use client'

import * as React from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Locale = 'id' | 'en'

interface I18nState {
  locale: Locale
  setLocale: (l: Locale) => void
}

export const useI18n = create<I18nState>()(
  persist(
    (set) => ({
      locale: 'id',
      setLocale: (l) => set({ locale: l }),
    }),
    { name: 'iaa-locale' }
  )
)

type Dict = Record<string, string>

const ID: Dict = {
  // Header nav
  'nav.beranda': 'Beranda',
  'nav.tentang': 'Tentang',
  'nav.pengurus': 'Pengurus',
  'nav.berita': 'Berita',
  'nav.agenda': 'Agenda',
  'nav.library': 'Digital Library',
  'nav.galeri': 'Galeri',
  'nav.faq': 'FAQ',
  'nav.kontak': 'Kontak',
  'nav.masuk': 'Masuk',
  'nav.chatbot': 'AI Chatbot',
  'nav.verify': 'Verifikasi',

  // Hero
  'hero.badge': 'Platform Digital Organisasi Resmi',
  'hero.title1': 'Platform Digital',
  'hero.title2': 'Ikatan Arsiparis',
  'hero.title3': 'ANRI (IAA)',
  'hero.subtitle': 'Sistem terpadu untuk manajemen organisasi, keanggotaan, perpustakaan digital, arsip, kegiatan, dan e-certificate. Membawa profesi kearsipan Indonesia menuju era transformasi digital.',
  'hero.cta.login': 'Masuk Portal Anggota',
  'hero.cta.about': 'Tentang IAA',
  'hero.cta.dashboard': 'Buka Dashboard',
  'hero.stats.members': 'Anggota Aktif',
  'hero.stats.events': 'Kegiatan / Tahun',
  'hero.stats.certs': 'Sertifikat Terbit',
  'hero.stats.library': 'Koleksi Digital',

  // Sections
  'section.about.badge': 'Tentang IAA',
  'section.about.title1': 'Wadah Profesional',
  'section.about.title2': 'Arsiparis Indonesia',
  'section.stats.badge': 'Dalam Angka',
  'section.stats.title': 'Kontribusi Nyata IAA',
  'section.stats.subtitle': 'Dampak kerja organisasi dalam membangun ekosistem kearsipan profesional Indonesia',
  'section.news.badge': 'Berita & Artikel',
  'section.news.title': 'Kabar Terbaru IAA',
  'section.news.subtitle': 'Berita kegiatan, pengumuman, artikel ilmiah, dan publikasi terkini dari organisasi',
  'section.news.viewAll': 'Semua Berita',
  'section.events.badge': 'Agenda Kegiatan',
  'section.events.title': 'Kegiatan Mendatang',
  'section.events.subtitle': 'Webinar, seminar, workshop, pelatihan, dan rapat organisasi terjadwal',
  'section.events.viewAll': 'Lihat Agenda',
  'section.library.badge': 'Digital Library',
  'section.library.title': 'Pusat Pengetahuan Kearsipan',
  'section.library.subtitle': 'Koleksi buku, ebook, jurnal, regulasi, SOP, dan template kearsipan terlengkap',
  'section.library.viewAll': 'Jelajahi Library',
  'section.org.badge': 'Struktur Organisasi',
  'section.org.title': 'Pengurus Pusat IAA',
  'section.org.subtitle': 'Para arsiparis profesional yang memimpin organisasi periode 2024-2027',
  'section.org.viewAll': 'Lihat Semua',
  'section.faq.badge': 'FAQ',
  'section.faq.title': 'Pertanyaan Umum',
  'section.faq.subtitle': 'Jawaban atas pertanyaan yang sering diajukan tentang IAA Digital dan keanggotaan',
  'section.cta.badge': 'Bergabung dengan IAA',
  'section.cta.title1': 'Jadilah Bagian dari',
  'section.cta.title2': 'Komunitas Arsiparis',
  'section.cta.title3': 'Profesional Indonesia',
  'section.cta.subtitle': 'Akses pelatihan, sertifikasi, perpustakaan digital, jejaring nasional, dan beragam manfaat lainnya. Daftar keanggotaan IAA sekarang dan kembangkan karir arsiparis Anda.',
  'section.cta.register': 'Masuk / Daftar',
  'section.cta.learnMore': 'Pelajari Lebih Lanjut',

  // Footer
  'footer.tagline': 'Platform digital resmi organisasi Ikatan Arsiparis ANRI. Memori kolektif peradaban bangsa, dikelola dengan profesionalisme dan teknologi modern.',
  'footer.nav': 'Navigasi',
  'footer.services': 'Layanan',
  'footer.contact': 'Kontak',
  'footer.memberPortal': 'Portal Anggota',
  'footer.copyright': '© 2026 Ikatan Arsiparis ANRI (IAA). Hak Cipta Dilindungi.',
  'footer.built': 'Dibangun dengan dedikasi untuk profesi Arsiparis Indonesia',

  // Common
  'common.loading': 'Memuat...',
  'common.search': 'Cari',
  'common.viewAll': 'Lihat Semua',
  'common.download': 'Unduh',
  'common.share': 'Bagikan',
  'common.back': 'Kembali',
  'common.save': 'Simpan',
  'common.cancel': 'Batal',
  'common.confirm': 'Konfirmasi',
  'common.yes': 'Ya',
  'common.no': 'Tidak',
}

const EN: Dict = {
  'nav.beranda': 'Home',
  'nav.tentang': 'About',
  'nav.pengurus': 'Officers',
  'nav.berita': 'News',
  'nav.agenda': 'Events',
  'nav.library': 'Digital Library',
  'nav.galeri': 'Gallery',
  'nav.faq': 'FAQ',
  'nav.kontak': 'Contact',
  'nav.masuk': 'Sign In',
  'nav.chatbot': 'AI Chatbot',
  'nav.verify': 'Verify',

  'hero.badge': 'Official Digital Organization Platform',
  'hero.title1': 'Digital Platform of',
  'hero.title2': 'Archivists Association',
  'hero.title3': 'ANRI (IAA)',
  'hero.subtitle': 'Integrated system for organization management, membership, digital library, archives, events, and e-certificates. Bringing Indonesian archival profession into the digital transformation era.',
  'hero.cta.login': 'Access Member Portal',
  'hero.cta.about': 'About IAA',
  'hero.cta.dashboard': 'Open Dashboard',
  'hero.stats.members': 'Active Members',
  'hero.stats.events': 'Events / Year',
  'hero.stats.certs': 'Certificates Issued',
  'hero.stats.library': 'Digital Collections',

  'section.about.badge': 'About IAA',
  'section.about.title1': 'Professional Home of',
  'section.about.title2': 'Indonesian Archivists',
  'section.stats.badge': 'In Numbers',
  'section.stats.title': 'IAA Real Contribution',
  'section.stats.subtitle': 'Organizational work impact in building professional archival ecosystem in Indonesia',
  'section.news.badge': 'News & Articles',
  'section.news.title': 'Latest IAA News',
  'section.news.subtitle': 'Activity news, announcements, scientific articles, and latest publications from the organization',
  'section.news.viewAll': 'All News',
  'section.events.badge': 'Events',
  'section.events.title': 'Upcoming Events',
  'section.events.subtitle': 'Webinars, seminars, workshops, training, and scheduled organization meetings',
  'section.events.viewAll': 'View Agenda',
  'section.library.badge': 'Digital Library',
  'section.library.title': 'Archival Knowledge Hub',
  'section.library.subtitle': 'Most complete collection of archival books, ebooks, journals, regulations, SOPs, and templates',
  'section.library.viewAll': 'Explore Library',
  'section.org.badge': 'Organization Structure',
  'section.org.title': 'IAA Central Officers',
  'section.org.subtitle': 'Professional archivists leading the organization for 2024-2027 period',
  'section.org.viewAll': 'View All',
  'section.faq.badge': 'FAQ',
  'section.faq.title': 'Frequently Asked Questions',
  'section.faq.subtitle': 'Answers to commonly asked questions about IAA Digital and membership',
  'section.cta.badge': 'Join IAA',
  'section.cta.title1': 'Become Part of',
  'section.cta.title2': 'Archivists Community',
  'section.cta.title3': 'Indonesia Professional',
  'section.cta.subtitle': 'Access training, certification, digital library, national network, and many other benefits. Register for IAA membership now and develop your archival career.',
  'section.cta.register': 'Sign In / Register',
  'section.cta.learnMore': 'Learn More',

  'footer.tagline': 'Official digital platform of the Indonesian Archivists Association (IAA). Collective memory of civilization, managed with professionalism and modern technology.',
  'footer.nav': 'Navigation',
  'footer.services': 'Services',
  'footer.contact': 'Contact',
  'footer.memberPortal': 'Member Portal',
  'footer.copyright': '© 2026 Indonesian Archivists Association (IAA). All Rights Reserved.',
  'footer.built': 'Built with dedication for the Indonesian Archival Profession',

  'common.loading': 'Loading...',
  'common.search': 'Search',
  'common.viewAll': 'View All',
  'common.download': 'Download',
  'common.share': 'Share',
  'common.back': 'Back',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.confirm': 'Confirm',
  'common.yes': 'Yes',
  'common.no': 'No',
}

const DICTS: Record<Locale, Dict> = { id: ID, en: EN }

export function useTranslation() {
  const locale = useI18n((s) => s.locale)
  const t = React.useCallback(
    (key: string, fallback?: string): string => {
      return DICTS[locale]?.[key] ?? fallback ?? key
    },
    [locale]
  )
  return { t, locale }
}
