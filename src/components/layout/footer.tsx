'use client'

import * as React from 'react'
import { useApp } from '@/lib/store'
import { IAALogo } from '@/components/iaa-logo'
import { Mail, MapPin, Phone, Facebook, Instagram, Youtube, Linkedin, Twitter } from 'lucide-react'

const LINKS = [
  { label: 'Tentang IAA', view: { name: 'about' as const } },
  { label: 'Struktur Pengurus', view: { name: 'organization' as const } },
  { label: 'Berita & Artikel', view: { name: 'news-list' as const } },
  { label: 'Agenda Kegiatan', view: { name: 'event-list' as const } },
  { label: 'Digital Library', view: { name: 'library' as const } },
  { label: 'Galeri Foto', view: { name: 'gallery' as const } },
  { label: 'FAQ', view: { name: 'faq' as const } },
  { label: 'Kontak', view: { name: 'contact' as const } },
]

export function Footer() {
  const { setView } = useApp()
  const [settings, setSettings] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setSettings(d.settings || {}))
      .catch(() => {})
  }, [])

  const siteName = settings['site.name'] || 'IAA Digital'
  const siteTagline = settings['site.tagline'] || 'Ikatan Arsiparis ANRI'
  const siteDescription = settings['site.description'] || 'Platform digital resmi organisasi Ikatan Arsiparis ANRI.'
  const logoUrl = settings['branding.logoUrl']

  const address = settings['contact.address'] || 'Jl. Gajah Mada No. 111, Jakarta Pusat 11130, Indonesia'
  const phone = settings['contact.phone'] || '(021) 6694166'
  const email = settings['contact.email'] || 'sekretariat@iaa-anri.go.id'

  const socials = [
    { url: settings['social.facebook'], Icon: Facebook, label: 'Facebook' },
    { url: settings['social.instagram'], Icon: Instagram, label: 'Instagram' },
    { url: settings['social.youtube'], Icon: Youtube, label: 'YouTube' },
    { url: settings['social.linkedin'], Icon: Linkedin, label: 'LinkedIn' },
    { url: settings['social.twitter'], Icon: Twitter, label: 'Twitter' },
  ].filter((s) => s.url)

  const copyrightName = settings['site.name'] || 'Ikatan Arsiparis ANRI (IAA)'

  return (
    <footer className="mt-auto bg-navy-deep text-white/80 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="relative mx-auto max-w-7xl px-4 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-9 w-auto max-w-[150px] object-contain" />
              ) : (
                <IAALogo light />
              )}
              <div className="flex flex-col leading-none">
                <span className="font-display font-extrabold tracking-tight text-[15px] text-white">{siteName}</span>
                <span className="text-[10px] tracking-wider uppercase mt-0.5 text-white/50">{siteTagline}</span>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">{siteDescription}</p>
            {socials.length > 0 && (
              <div className="flex items-center gap-3">
                {socials.map(({ url, Icon, label }) => (
                  <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="grid h-9 w-9 place-items-center rounded-full bg-white/5 border border-white/10 hover:bg-gold hover:text-navy transition-all" aria-label={label}>
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4 text-sm tracking-wide uppercase">Navigasi</h4>
            <ul className="space-y-2.5 text-sm">
              {LINKS.slice(0, 5).map((l) => (
                <li key={l.label}>
                  <button onClick={() => setView(l.view)} className="text-white/60 hover:text-gold transition-colors">{l.label}</button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4 text-sm tracking-wide uppercase">Layanan</h4>
            <ul className="space-y-2.5 text-sm">
              {LINKS.slice(5).map((l) => (
                <li key={l.label}>
                  <button onClick={() => setView(l.view)} className="text-white/60 hover:text-gold transition-colors">{l.label}</button>
                </li>
              ))}
              <li>
                <button onClick={() => setView({ name: 'login' })} className="text-white/60 hover:text-gold transition-colors">Portal Anggota</button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4 text-sm tracking-wide uppercase">Kontak</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-white/70">
                <MapPin className="h-4 w-4 mt-0.5 text-gold flex-shrink-0" />
                <span>{address}</span>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Phone className="h-4 w-4 text-gold flex-shrink-0" />
                <span>{phone}</span>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Mail className="h-4 w-4 text-gold flex-shrink-0" />
                <span>{email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>© 2026 {copyrightName}. Hak Cipta Dilindungi.</p>
          <p>Dibangun dengan dedikasi untuk profesi Arsiparis Indonesia</p>
        </div>
      </div>
    </footer>
  )
}
