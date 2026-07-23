'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/lib/store'
import { PublicLayout } from '@/components/layout/public-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Eye, Target, Award, BookOpen, Globe2, Building2, Calendar, Users, ArrowRight,
  History, Heart, Phone, Mail, MapPin, Clock, Facebook, Instagram, Youtube,
  Linkedin, Twitter, MessageCircle,
} from 'lucide-react'

const SOCIAL_ICONS: Record<string, any> = {
  facebook: Facebook, instagram: Instagram, youtube: Youtube, linkedin: Linkedin, twitter: Twitter,
}

export function AboutView() {
  const { setView } = useApp()
  const [settings, setSettings] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setSettings(d.settings || {}))
      .catch(() => {})
  }, [])

  const contact = {
    address: settings['contact.address'] || '',
    phone: settings['contact.phone'] || '',
    fax: settings['contact.fax'] || '',
    email: settings['contact.email'] || '',
    whatsapp: settings['contact.whatsapp'] || '',
    operatingHours: settings['contact.operatingHours'] || '',
    mapsUrl: settings['contact.mapsUrl'] || '',
  }

  const socials = [
    { key: 'social.facebook', label: 'Facebook', icon: Facebook },
    { key: 'social.instagram', label: 'Instagram', icon: Instagram },
    { key: 'social.youtube', label: 'YouTube', icon: Youtube },
    { key: 'social.linkedin', label: 'LinkedIn', icon: Linkedin },
    { key: 'social.twitter', label: 'Twitter/X', icon: Twitter },
  ].filter((s) => settings[s.key])

  const hasContactInfo = contact.address || contact.phone || contact.email || contact.whatsapp

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-gradient text-white py-16 lg:py-24">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-blue/20 blur-3xl animate-float-slow" />
        <div className="relative mx-auto max-w-4xl px-4 lg:px-8 text-center">
          <Badge className="bg-gold text-navy hover:bg-gold mb-4">Tentang IAA</Badge>
          <h1 className="font-display text-4xl lg:text-6xl font-extrabold leading-tight">
            Ikatan Arsiparis <br />
            <span className="text-gradient-gold">ANRI (IAA)</span>
          </h1>
          <p className="text-white/70 mt-5 text-lg leading-relaxed max-w-2xl mx-auto">
            {settings['site.description'] || 'Organisasi profesi resmi arsiparis di lingkungan Arsip Nasional Republik Indonesia, berdedikasi membangun sistem kearsipan nasional yang modern, profesional, dan berkelanjutan.'}
          </p>
        </div>
      </section>

      {/* Sejarah */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-5"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold uppercase tracking-wider">
                <History className="h-3.5 w-3.5" /> Sejarah
              </div>
              <h2 className="font-display text-3xl font-extrabold text-navy dark:text-white">Perjalanan Lebih dari 5 Dekade</h2>
              {(settings['about.history'] || '').split(/\n\n+/).filter(Boolean).map((para, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed">
                  {para.trim()}
                </p>
              ))}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gold/10 blur-3xl rounded-full" />
              <Card className="relative bg-navy-gradient text-white border-0 shadow-2xl">
                <CardContent className="p-8 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { v: settings['about.stats.foundedYear'] || '1973', l: settings['about.stats.foundedYearLabel'] || 'Tahun Berdiri' },
                      { v: settings['about.stats.yearsActive'] || '53', l: settings['about.stats.yearsActiveLabel'] || 'Tahun Berkarya' },
                      { v: settings['about.stats.activeMembers'] || '2,400+', l: settings['about.stats.activeMembersLabel'] || 'Anggota Aktif' },
                      { v: settings['about.stats.provinces'] || '34', l: settings['about.stats.provincesLabel'] || 'Provinsi' },
                    ].map((s) => (
                      <div key={s.l} className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-3xl font-extrabold font-display text-gold">{s.v}</div>
                        <div className="text-[11px] text-white/60 uppercase tracking-wide mt-1">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Visi Misi */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 lg:px-8 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-navy-gradient text-white border-0 overflow-hidden relative">
              <div className="absolute inset-0 bg-grid opacity-20" />
              <CardContent className="relative p-8 lg:p-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold/20 border border-gold/30">
                    <Eye className="h-6 w-6 text-gold" />
                  </div>
                  <h3 className="font-display text-2xl font-bold">Visi</h3>
                </div>
                <p className="text-white/85 leading-relaxed text-lg italic">
                  "{settings['about.vision'] || 'Menjadi organisasi profesi arsiparis terdepan di Asia Tenggara yang mendorong transformasi digital kearsipan demi terwujudnya tata kelola informasi publik yang transparan, akuntabel, dan berkelanjutan.'}"
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-8 lg:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold/10 border border-gold/20">
                    <Target className="h-6 w-6 text-gold" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-navy dark:text-white">Misi</h3>
                </div>
                <ul className="space-y-4">
                  {(settings['about.mission'] || '').split(/\n+/).filter(Boolean).map((m, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-navy text-white text-xs font-bold font-display">
                        {i + 1}
                      </div>
                      <span className="text-foreground/80 leading-relaxed pt-0.5">{m.trim()}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Nilai */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-10">
            <Badge className="bg-gold/10 text-gold border-gold/30 mb-3">Nilai Organisasi</Badge>
            <h2 className="font-display text-3xl font-extrabold text-navy dark:text-white">Nilai-Nilai yang Kami Junjung</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(settings['about.values'] || '')
              .split(/\n+/)
              .filter(Boolean)
              .map((line, i) => {
                const [title, desc] = line.split('|').map((s) => s.trim())
                const icon = [Award, BookOpen, Globe2, Heart][i % 4]
                const Icon = icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <Card className="group h-full border-border hover:border-gold/40 hover:shadow-premium transition-all">
                      <CardContent className="p-6 text-center">
                        <div className="grid h-14 w-14 mx-auto place-items-center rounded-2xl bg-gradient-to-br from-navy to-blue-soft text-white shadow-lg mb-4 group-hover:scale-110 transition-transform">
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="font-display font-bold text-navy dark:text-white mb-2">{title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
          </div>
        </div>
      </section>

      {/* ===== Kontak & Alamat (dinamis dari site settings) ===== */}
      {hasContactInfo && (
        <section className="py-20 bg-muted/30">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center mb-10">
              <Badge className="bg-gold/10 text-gold border-gold/30 mb-3">Kontak & Sekretariat</Badge>
              <h2 className="font-display text-3xl font-extrabold text-navy dark:text-white">Hubungi Kami</h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
                Informasi kontak resmi IAA Digital. Pengurus dapat memperbarui informasi ini melalui menu Pengaturan Situs.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {contact.address && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                  <Card className="h-full border-border hover:border-gold/40 hover:shadow-premium transition-all">
                    <CardContent className="p-6">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-navy-gradient text-white mb-4">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <h3 className="font-display font-bold text-navy dark:text-white mb-2">Alamat Sekretariat</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{contact.address}</p>
                      {contact.mapsUrl && (
                        <a
                          href={contact.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-brand hover:underline mt-3"
                        >
                          <MapPin className="h-3 w-3" /> Lihat di Maps <ArrowRight className="h-3 w-3" />
                        </a>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {contact.phone && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
                  <Card className="h-full border-border hover:border-gold/40 hover:shadow-premium transition-all">
                    <CardContent className="p-6">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white mb-4">
                        <Phone className="h-5 w-5" />
                      </div>
                      <h3 className="font-display font-bold text-navy dark:text-white mb-2">Telepon & Fax</h3>
                      <div className="space-y-1.5 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                          <a href={`tel:${contact.phone}`} className="hover:text-navy dark:hover:text-white">{contact.phone}</a>
                        </div>
                        {contact.fax && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wide w-12">Fax</span>
                            <span>{contact.fax}</span>
                          </div>
                        )}
                      </div>
                      {contact.whatsapp && (
                        <a
                          href={`https://wa.me/${contact.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 px-3 py-1.5 text-xs font-medium mt-3"
                        >
                          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                        </a>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {contact.email && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <Card className="h-full border-border hover:border-gold/40 hover:shadow-premium transition-all">
                    <CardContent className="p-6">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-gold-soft to-gold text-white mb-4">
                        <Mail className="h-5 w-5" />
                      </div>
                      <h3 className="font-display font-bold text-navy dark:text-white mb-2">Email</h3>
                      <div className="space-y-1.5 text-sm text-muted-foreground">
                        <a href={`mailto:${contact.email}`} className="block hover:text-navy dark:hover:text-white break-all">
                          {contact.email}
                        </a>
                        {settings['contact.emailPengurus'] && (
                          <a href={`mailto:${settings['contact.emailPengurus']}`} className="block hover:text-navy dark:hover:text-white break-all text-xs">
                            Pengurus: {settings['contact.emailPengurus']}
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {contact.operatingHours && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}>
                  <Card className="h-full border-border hover:border-gold/40 hover:shadow-premium transition-all">
                    <CardContent className="p-6">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue-soft to-blue text-white mb-4">
                        <Clock className="h-5 w-5" />
                      </div>
                      <h3 className="font-display font-bold text-navy dark:text-white mb-2">Jam Operasional</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{contact.operatingHours}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {socials.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }}>
                  <Card className="h-full border-border hover:border-gold/40 hover:shadow-premium transition-all">
                    <CardContent className="p-6">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 text-white mb-4">
                        <Globe2 className="h-5 w-5" />
                      </div>
                      <h3 className="font-display font-bold text-navy dark:text-white mb-2">Sosial Media</h3>
                      <div className="flex flex-wrap gap-2">
                        {socials.map((s) => (
                          <a
                            key={s.key}
                            href={settings[s.key]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="grid h-9 w-9 place-items-center rounded-lg bg-muted hover:bg-navy-gradient text-navy dark:text-white hover:text-white transition-colors"
                            title={s.label}
                          >
                            <s.icon className="h-4 w-4" />
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5 }}>
                <Card className="h-full bg-navy-gradient text-white border-0 hover:shadow-premium transition-all">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 mb-4">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <h3 className="font-display font-bold mb-2">Punya Pertanyaan?</h3>
                    <p className="text-xs text-white/70 leading-relaxed flex-1">
                      Kirim pesan langsung melalui formulir kontak untuk pertanyaan, kerja sama, atau informasi lebih lanjut.
                    </p>
                    <Button
                      onClick={() => setView({ name: 'contact' })}
                      className="bg-white text-navy hover:bg-white/90 mt-4 text-xs font-semibold"
                      size="sm"
                    >
                      Hubungi Kami <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="pb-20">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <Card className="bg-navy-gradient text-white border-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-30" />
            <CardContent className="relative p-8 lg:p-12 text-center">
              <Building2 className="h-12 w-12 text-gold mx-auto mb-4" />
              <h2 className="font-display text-2xl lg:text-3xl font-bold mb-3">Pelajari Lebih Lanjut</h2>
              <p className="text-white/70 mb-6 max-w-xl mx-auto">
                Lihat struktur pengurus, agenda kegiatan, atau hubungi kami untuk informasi lebih detail tentang IAA.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button onClick={() => setView({ name: 'organization' })} className="bg-gold-gradient text-navy hover:opacity-90">
                  Struktur Pengurus <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button onClick={() => setView({ name: 'contact' })} variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white">
                  Hubungi Kami
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicLayout>
  )
}
