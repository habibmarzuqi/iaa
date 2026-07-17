'use client'

import { motion } from 'framer-motion'
import { useApp } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, ShieldCheck, BookOpen, Award, Users, Sparkles, Calendar } from 'lucide-react'

export function HeroSection() {
  const { setView, user } = useApp()
  const { t } = useTranslation()

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

            <p className="text-base lg:text-lg text-white/70 leading-relaxed max-w-xl">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-wrap gap-3">
              {user ? (
                <Button
                  onClick={() => setView({ name: user.role === 'ANGGOTA' ? 'member-dashboard' : 'admin-dashboard' })}
                  size="lg"
                  className="bg-gold-gradient text-navy hover:opacity-90 font-semibold"
                >
                  {t('hero.cta.dashboard')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => setView({ name: 'login' })}
                  size="lg"
                  className="bg-gold-gradient text-navy hover:opacity-90 font-semibold"
                >
                  {t('hero.cta.login')}
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
              {[
                { icon: Users, value: '2,400+', key: 'hero.stats.members' },
                { icon: Calendar, value: '180+', key: 'hero.stats.events' },
                { icon: Award, value: '5,600+', key: 'hero.stats.certs' },
                { icon: BookOpen, value: '1,200+', key: 'hero.stats.library' },
              ].map((s, i) => (
                <motion.div
                  key={s.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <s.icon className="h-5 w-5 text-gold" />
                  <div>
                    <div className="text-lg font-bold font-display">{s.value}</div>
                    <div className="text-[11px] text-white/60">{t(s.key)}</div>
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
                  { label: t('hero.stats.members'), value: '2,418', trend: '+12%' },
                  { label: t('hero.stats.certs'), value: '5,624', trend: '+8%' },
                  { label: t('hero.stats.events'), value: '47', trend: '+5' },
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
