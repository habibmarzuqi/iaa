'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight, ShieldCheck, BookOpen, Award, Users, Sparkles, Calendar,
  ChevronLeft, ChevronRight, CheckCircle2, Play, Pause,
} from 'lucide-react'

const HERO_SLIDES = [
  {
    id: 'slide-1',
    badge: '🎉 Portal Resmi IAA Digital',
    title: 'Transformasi Kearsipan Digital Indonesia',
    subtitle: 'Platform terpadu untuk keanggotaan, sertifikasi arsiparis berjenjang, perpustakaan digital, dan tata kelola memori kolektif peradaban bangsa.',
    primaryBtnText: 'Masuk / Daftar',
    primaryView: 'login',
    secondaryBtnText: 'Jelajahi Portal',
    secondaryView: 'about',
    accentGradient: 'from-blue-600/20 via-navy/90 to-navy',
    tagIcon: Sparkles,
  },
  {
    id: 'slide-2',
    badge: '🎓 Program Unggulan IAA',
    title: 'Sertifikasi & Pelatihan Berjenjang Arsiparis',
    subtitle: 'Tingkatkan kompetensi profesional dengan pelatihan berstandar nasional dan E-Certificate resmi terverifikasi online dengan QR Code.',
    primaryBtnText: 'Lihat Agenda Kegiatan',
    primaryView: 'event-list',
    secondaryBtnText: 'Verifikasi Sertifikat',
    secondaryView: 'verify-cert',
    accentGradient: 'from-amber-600/20 via-navy/90 to-navy',
    tagIcon: Award,
  },
  {
    id: 'slide-3',
    badge: '📚 Digital Library & Repository',
    title: 'Pusat Referensi, Jurnal & Regulasi Kearsipan',
    subtitle: 'Akses cepat ke 1,200+ koleksi digital, jurnal ilmiah, pedoman teknis, dan standar SOP kearsipan Indonesia.',
    primaryBtnText: 'Buka Digital Library',
    primaryView: 'library',
    secondaryBtnText: 'Tentang IAA',
    secondaryView: 'about',
    accentGradient: 'from-emerald-600/20 via-navy/90 to-navy',
    tagIcon: BookOpen,
  },
]

export function HeroSection() {
  const [settings, setSettings] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setSettings(d.settings || {}))
      .catch(() => {})
  }, [])

  const heroStyle = settings['hero.style'] || 'carousel'

  if (heroStyle === 'classic') {
    return <HeroClassic settings={settings} />
  }

  return <HeroCarousel settings={settings} />
}

/**
 * Option A: Hero Carousel Banner Interaktif & Profesional
 */
function HeroCarousel({ settings }: { settings: Record<string, string> }) {
  const { setView, user } = useApp()
  const [currentIndex, setCurrentIndex] = React.useState(0)

  const slides = React.useMemo(() => {
    try {
      if (settings['hero.carousel.slides']) {
        const parsed = JSON.parse(settings['hero.carousel.slides'])
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return HERO_SLIDES
  }, [settings])

  const stats = [
    { icon: Users, value: settings['about.stats.stat1Value'] || '2,400+', label: settings['about.stats.stat1Label'] || 'Anggota Aktif' },
    { icon: Calendar, value: settings['about.stats.stat2Value'] || '180+', label: settings['about.stats.stat2Label'] || 'Kegiatan / Tahun' },
    { icon: Award, value: settings['about.stats.stat3Value'] || '5,600+', label: settings['about.stats.stat3Label'] || 'Sertifikat Terbit' },
    { icon: BookOpen, value: settings['about.stats.stat4Value'] || '1,200+', label: settings['about.stats.stat4Label'] || 'Koleksi Digital' },
  ]

  const currentSlide = slides[currentIndex % slides.length] || HERO_SLIDES[0]
  const TagIcon = currentSlide.tagIcon || Sparkles

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }

  return (
    <section
      className="relative overflow-hidden bg-hero-gradient text-white min-h-[580px] lg:min-h-[640px] flex flex-col justify-between"
    >
      {/* Decorative Orbs */}
      <div className="absolute inset-0 bg-grid opacity-35" />
      <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue/20 blur-3xl animate-float-slow" />
      <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gold/15 blur-3xl animate-float-slow" style={{ animationDelay: '2.5s' }} />

      {/* Main Slide Area */}
      <div className="relative mx-auto max-w-7xl px-4 lg:px-8 pt-16 lg:pt-24 pb-12 flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id || currentIndex}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="grid gap-10 lg:grid-cols-12 items-center"
          >
            {/* Slide Content (Left) */}
            <div className="lg:col-span-7 space-y-6">
              {currentSlide.badge && (
                <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-xs font-semibold text-gold backdrop-blur-md">
                  <TagIcon className="h-4 w-4" />
                  <span>{currentSlide.badge}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse ml-1" />
                </div>
              )}

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight">
                {currentSlide.title}
              </h1>

              <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-2xl">
                {currentSlide.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-3">
                {currentSlide.primaryBtnText && (
                  <Button
                    onClick={() => {
                      if (user && currentSlide.primaryView === 'login') {
                        setView({ name: user.role === 'ANGGOTA' ? 'member-dashboard' : 'admin-dashboard' })
                      } else {
                        setView({ name: (currentSlide.primaryView as any) || 'about' })
                      }
                    }}
                    size="lg"
                    className="bg-gold-gradient text-navy font-bold hover:opacity-90 shadow-gold-glow border-0"
                  >
                    {user && currentSlide.primaryView === 'login' ? 'Dashboard Saya' : currentSlide.primaryBtnText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}

                {currentSlide.secondaryBtnText && (
                  <Button
                    onClick={() => setView({ name: (currentSlide.secondaryView as any) || 'about' })}
                    size="lg"
                    variant="outline"
                    className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
                  >
                    {currentSlide.secondaryBtnText}
                  </Button>
                )}
              </div>
            </div>

            {/* Slide Graphic / Preview Card (Right) */}
            <div className="lg:col-span-5 relative hidden lg:block">
              {currentSlide.image ? (
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 aspect-[16/10] group">
                  <img src={currentSlide.image} alt={currentSlide.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <Badge className="bg-gold text-navy font-bold text-[10px] mb-1">BANNER SLIDE #{currentIndex + 1}</Badge>
                    <div className="text-xs font-semibold line-clamp-1">{currentSlide.title}</div>
                  </div>
                </div>
              ) : (
                <div className="relative glass-card rounded-2xl p-6 border-white/20 shadow-2xl overflow-hidden group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${currentSlide.accentGradient || 'from-blue-600/20 via-navy/90 to-navy'} opacity-60`} />
                  <div className="relative space-y-4 text-white">
                    <div className="flex items-center justify-between border-b border-white/15 pb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4" /> Official Platform
                      </span>
                      <Badge className="bg-white/10 text-white border-white/20 text-[10px]">VERIFIED</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-display font-bold text-lg leading-snug">{currentSlide.title}</h3>
                      <p className="text-xs text-white/70 line-clamp-3 leading-relaxed">{currentSlide.subtitle}</p>
                    </div>

                    {/* Feature checklist */}
                    <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs text-white/90">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-gold flex-shrink-0" />
                        <span>Terintegrasi ANRI & Database Kearsipan Nasional</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-gold flex-shrink-0" />
                        <span>Verifikasi Online E-Certificate Real-time</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-gold flex-shrink-0" />
                        <span>Akses Repository Digital 24/7</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls & Stats Bottom Bar */}
      <div className="relative border-t border-white/10 bg-black/20 backdrop-blur-md py-4">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Controls: Prev/Next & Indicators */}
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <button
                onClick={handlePrev}
                className="h-8 w-8 rounded-full border border-white/20 bg-white/5 hover:bg-white/20 grid place-items-center transition-colors text-white"
                title="Slide Sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNext}
                className="h-8 w-8 rounded-full border border-white/20 bg-white/5 hover:bg-white/20 grid place-items-center transition-colors text-white"
                title="Slide Selanjutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Slide Dots Indicator */}
            <div className="flex items-center gap-2">
              {slides.map((slide: any, index: number) => (
                <button
                  key={slide.id || index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    currentIndex === index ? 'w-8 bg-gold' : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                  title={`Slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Inline Live Stats */}
          <div className="flex items-center gap-6 sm:gap-8 flex-wrap justify-center">
            {stats.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <s.icon className="h-4 w-4 text-gold" />
                <div className="text-left">
                  <div className="text-sm font-bold font-display leading-none text-white">{s.value}</div>
                  <div className="text-[10px] text-white/60 leading-tight">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Option B: Hero Classic (Split Screen Statis Beranda Asli)
 */
function HeroClassic({ settings }: { settings: Record<string, string> }) {
  const { setView, user } = useApp()
  const { t } = useTranslation()

  const stats = [
    { icon: Users, value: settings['about.stats.stat1Value'] || '2,400+', label: settings['about.stats.stat1Label'] || 'Anggota Aktif' },
    { icon: Calendar, value: settings['about.stats.stat2Value'] || '180+', label: settings['about.stats.stat2Label'] || 'Kegiatan / Tahun' },
    { icon: Award, value: settings['about.stats.stat3Value'] || '5,600+', label: settings['about.stats.stat3Label'] || 'Sertifikat Terbit' },
    { icon: BookOpen, value: settings['about.stats.stat4Value'] || '1,200+', label: settings['about.stats.stat4Label'] || 'Koleksi Digital' },
  ]

  return (
    <section className="relative overflow-hidden bg-hero-gradient text-white">
      {/* Grid + decorative orbs */}
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-blue/20 blur-3xl animate-float-slow" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gold/15 blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8 py-20 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-7"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              {t('hero.badge')}
              <span className="ml-1 h-1 w-1 rounded-full bg-gold animate-pulse" />
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
              {t('hero.title1')} <br />
              <span className="text-gradient-gold">{t('hero.title2')}</span> <br />
              <span className="text-white/90">{t('hero.title3')}</span>
            </h1>

            <p className="text-white/70 text-base sm:text-lg max-w-xl leading-relaxed">
              {settings['site.description'] || t('hero.subtitle')}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              {!user ? (
                <Button
                  onClick={() => setView({ name: 'login' })}
                  size="lg"
                  className="bg-gold-gradient text-navy font-bold hover:opacity-90 shadow-gold-glow border-0"
                >
                  {t('hero.cta.join')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => setView({ name: user.role === 'ANGGOTA' ? 'member-dashboard' : 'admin-dashboard' })}
                  size="lg"
                  className="bg-gold-gradient text-navy font-bold hover:opacity-90 shadow-gold-glow border-0"
                >
                  Dashboard Saya
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              <Button
                onClick={() => setView({ name: 'about' })}
                size="lg"
                variant="outline"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
              >
                {t('hero.cta.about')}
              </Button>
            </div>

            {/* Stats inline */}
            <div className="flex flex-wrap gap-8 pt-6 border-t border-white/10">
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <s.icon className="h-5 w-5 text-gold" />
                  <div>
                    <div className="text-lg font-bold font-display">{s.value}</div>
                    <div className="text-[11px] text-white/60">{s.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: glass dashboard preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gold/20 blur-3xl rounded-full" />
            <div className="relative glass-card rounded-2xl shadow-2xl border-white/20 p-5 rotate-1 hover:rotate-0 transition-transform duration-500">
              {/* Mock dashboard preview */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                </div>
                <Badge variant="outline" className="border-gold/40 text-gold bg-gold/10 text-[10px]">
                  <ShieldCheck className="h-3 w-3 mr-1" /> Live Dashboard
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Anggota Aktif', value: '2,418', trend: '+12%' },
                  { label: 'Sertifikat', value: '5,624', trend: '+8%' },
                  { label: 'Kegiatan', value: '47', trend: '+5' },
                  { label: 'Library Downloads', value: '34.2K', trend: '+22%' },
                ].map((card) => (
                  <div key={card.label} className="rounded-xl bg-white/80 dark:bg-white/5 p-3 backdrop-blur">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{card.label}</div>
                    <div className="text-xl font-bold text-navy dark:text-white font-display mt-1">{card.value}</div>
                    <div className="text-[10px] text-emerald-600 font-medium mt-0.5">{card.trend} bulan ini</div>
                  </div>
                ))}
              </div>

              {/* Mini chart */}
              <div className="rounded-xl bg-white/80 dark:bg-white/5 p-4 backdrop-blur">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-medium text-navy dark:text-white">Pertumbuhan Anggota</div>
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px]">+24%</Badge>
                </div>
                <div className="flex items-end gap-1.5 h-20">
                  {[40, 55, 48, 70, 62, 85, 78, 95, 88, 100].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 0.8 + i * 0.05, duration: 0.4 }}
                      className="flex-1 bg-gradient-to-t from-navy to-blue-soft rounded-sm"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="absolute -bottom-6 -left-6 glass-card rounded-xl p-3 shadow-xl border-gold/30 hidden sm:block"
            >
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gold-gradient text-navy">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-navy dark:text-white">ISO 16363 Certified</div>
                  <div className="text-[10px] text-muted-foreground">Trusted Digital Repository</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
