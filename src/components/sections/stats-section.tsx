'use client'

import { motion } from 'framer-motion'
import { Users, Calendar, Award, BookOpen, FileText, Download } from 'lucide-react'

const STATS = [
  { icon: Users, label: 'Total Anggota', value: 2418, suffix: '', color: 'from-blue-500 to-blue-600' },
  { icon: Calendar, label: 'Kegiatan / Tahun', value: 180, suffix: '+', color: 'from-emerald-500 to-emerald-600' },
  { icon: Award, label: 'Sertifikat Terbit', value: 5624, suffix: '', color: 'from-gold-soft to-gold', colorHex: true },
  { icon: BookOpen, label: 'Koleksi Digital Library', value: 1247, suffix: '+', color: 'from-purple-500 to-purple-600' },
  { icon: FileText, label: 'Artikel & Publikasi', value: 386, suffix: '', color: 'from-orange-500 to-orange-600' },
  { icon: Download, label: 'Unduhan / Bulan', value: 34.2, suffix: 'K', color: 'from-red-500 to-red-600', decimal: true },
]

export function StatsSection() {
  return (
    <section className="py-16 bg-muted/30 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold uppercase tracking-wider">
            Dalam Angka
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-extrabold mt-4 text-navy dark:text-white">
            Kontribusi Nyata IAA
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Dampak kerja organisasi dalam membangun ekosistem kearsipan profesional Indonesia
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 hover:shadow-premium hover:-translate-y-1 transition-all"
            >
              <div className={`absolute -top-4 -right-4 h-16 w-16 rounded-full bg-gradient-to-br ${s.colorHex ? 'from-gold-soft to-gold' : s.color} opacity-10 blur-xl group-hover:opacity-20 transition-opacity`} />
              <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${s.colorHex ? 'from-gold-soft to-gold text-navy' : s.color + ' text-white'} mb-3 shadow-lg`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-extrabold font-display text-navy dark:text-white">
                {s.decimal ? s.value.toFixed(1) : s.value.toLocaleString('id-ID')}{s.suffix}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
