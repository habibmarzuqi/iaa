'use client'

import { useApp } from '@/lib/store'
import { IAALogo } from '@/components/iaa-logo'
import { Mail, MapPin, Phone, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react'

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
  return (
    <footer className="mt-auto bg-navy-deep text-white/80 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="relative mx-auto max-w-7xl px-4 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <IAALogo light />
              <div className="flex flex-col leading-none">
                <span className="font-display font-extrabold tracking-tight text-[15px] text-white">IAA Digital</span>
                <span className="text-[10px] tracking-wider uppercase mt-0.5 text-white/50">Ikatan Arsiparis ANRI</span>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Platform digital resmi organisasi Ikatan Arsiparis ANRI. Memori kolektif peradaban bangsa, dikelola dengan profesionalisme dan teknologi modern.
            </p>
            <div className="flex items-center gap-3">
              {[Facebook, Instagram, Youtube, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-full bg-white/5 border border-white/10 hover:bg-gold hover:text-navy transition-all" aria-label="social media">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
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
                <span>Jl. Gajah Mada No. 111, Jakarta Pusat 11130, Indonesia</span>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Phone className="h-4 w-4 text-gold flex-shrink-0" />
                <span>(021) 6694166</span>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Mail className="h-4 w-4 text-gold flex-shrink-0" />
                <span>sekretariat@iaa-anri.go.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>© 2026 Ikatan Arsiparis ANRI (IAA). Hak Cipta Dilindungi.</p>
          <p>Dibangun dengan dedikasi untuk profesi Arsiparis Indonesia</p>
        </div>
      </div>
    </footer>
  )
}
