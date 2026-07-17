'use client'

import { motion } from 'framer-motion'
import { useApp } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react'

export function CtaSection() {
  const { setView, user } = useApp()
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl bg-hero-gradient p-10 lg:p-16 text-white"
        >
          {/* Decorative orbs */}
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-gold/15 blur-3xl animate-float-slow" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-blue/20 blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0 bg-grid opacity-30" />

          <div className="relative grid gap-8 lg:grid-cols-2 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Bergabung dengan IAA
              </div>
              <h2 className="font-display text-3xl lg:text-5xl font-extrabold leading-tight">
                Jadilah Bagian dari <br />
                <span className="text-gradient-gold">Komunitas Arsiparis</span> <br />
                Profesional Indonesia
              </h2>
              <p className="text-white/75 text-base lg:text-lg leading-relaxed max-w-xl">
                Akses pelatihan, sertifikasi, perpustakaan digital, jejaring nasional, dan beragam manfaat lainnya. Daftar keanggotaan IAA sekarang dan kembangkan karir arsiparis Anda.
              </p>
              <div className="flex flex-wrap gap-3">
                {user ? (
                  <Button
                    onClick={() => setView({ name: user.role === 'ANGGOTA' ? 'member-dashboard' : 'admin-dashboard' })}
                    size="lg"
                    className="bg-gold-gradient text-navy hover:opacity-90 font-semibold"
                  >
                    Buka Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => setView({ name: 'login' })}
                    size="lg"
                    className="bg-gold-gradient text-navy hover:opacity-90 font-semibold"
                  >
                    Masuk / Daftar <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                <Button
                  onClick={() => setView({ name: 'about' })}
                  size="lg"
                  variant="outline"
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
                >
                  Pelajari Lebih Lanjut
                </Button>
              </div>
            </div>

            {/* Right: benefit cards */}
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: ShieldCheck, title: 'Sertifikasi Berjenjang', desc: 'Pemuda → Utama' },
                { icon: Sparkles, title: 'Pelatihan Gratis', desc: '180+ kegiatan / tahun' },
                { icon: ShieldCheck, title: 'Digital Library', desc: '1,200+ koleksi' },
                { icon: Sparkles, title: 'E-Certificate', desc: 'Verifikasi online' },
              ].map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="glass-card rounded-xl p-4 hover:scale-105 transition-transform"
                >
                  <b.icon className="h-6 w-6 text-gold mb-2" />
                  <div className="font-semibold text-white text-sm">{b.title}</div>
                  <div className="text-xs text-white/60 mt-0.5">{b.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
