'use client'

import { motion } from 'framer-motion'
import { Target, Eye, Award, Users, BookOpen, Globe2 } from 'lucide-react'

export function AboutSection() {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-12 items-start">
          {/* Left: title + description */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-5"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold uppercase tracking-wider">
                Tentang IAA
              </span>
              <h2 className="font-display text-3xl lg:text-4xl font-extrabold leading-tight text-navy dark:text-white">
                Wadah Profesional <br />
                <span className="text-gradient-navy">Arsiparis Indonesia</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Ikatan Arsiparis ANRI (IAA) adalah organisasi profesi resmi yang beranggotakan arsiparis di lingkungan Arsip Nasional Republik Indonesia (ANRI) dan instansi pemerintah lainnya. Berdiri sebagai wadah peningkatan kompetensi, pembelaan kepentingan profesi, serta kontribusi pada pembangunan sistem kearsipan nasional yang modern dan profesional.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Sejak berdirinya, IAA aktif menyelenggarakan pelatihan, seminar, webinar, sertifikasi, serta menghasilkan publikasi ilmiah di bidang kearsipan. Organisasi ini juga menjadi mitra strategis pemerintah dalam merumuskan kebijakan tata kelola arsip dan informasi publik.
              </p>

              <div className="grid grid-cols-3 gap-4 pt-4">
                {[
                  { label: 'Berdiri', value: '1973' },
                  { label: 'Anggota', value: '2,400+' },
                  { label: 'Provinsi', value: '34' },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-muted/50 p-3 text-center">
                    <div className="text-2xl font-extrabold text-gradient-navy font-display">{s.value}</div>
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wide mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: vision & mission cards */}
          <div className="lg:col-span-7 space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group relative overflow-hidden rounded-2xl bg-navy-gradient p-7 text-white shadow-premium"
            >
              <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gold/20 blur-2xl group-hover:bg-gold/30 transition-colors" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 border border-white/20">
                    <Eye className="h-5 w-5 text-gold" />
                  </div>
                  <h3 className="font-display text-xl font-bold">Visi</h3>
                </div>
                <p className="text-white/85 leading-relaxed text-lg">
                  "Menjadi organisasi profesi arsiparis terdepan di Asia Tenggara yang mendorong transformasi digital kearsipan demi terwujudnya tata kelola informasi publik yang transparan, akuntabel, dan berkelanjutan."
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-premium hover:shadow-gold-glow transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gold/10 border border-gold/20">
                  <Target className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-display text-xl font-bold text-navy dark:text-white">Misi</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Meningkatkan kompetensi profesional arsiparis melalui pelatihan, sertifikasi berjenjang, dan pengembangan kapasitas berkelanjutan',
                  'Memperkuat kelembagaan organisasi sebagai mitra strategis pemerintah dalam kebijakan tata kelola arsip nasional',
                  'Mendorong inovasi dan adopsi teknologi digital dalam manajemen arsip dan preservasi warisan informasi',
                  'Membangun jejaring kerja sama nasional dan internasional untuk pertukaran pengetahuan dan praktik terbaik',
                  'Melindungi dan memperjuangkan kepentingan profesi arsiparis serta menjunjung tinggi etika profesi',
                ].map((m, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-navy text-white text-[10px] font-bold">
                      {i + 1}
                    </div>
                    <span className="text-muted-foreground leading-relaxed">{m}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Value cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: Award, title: 'Profesional', desc: 'Kompetensi berstandar nasional & internasional' },
                { icon: BookOpen, title: 'Berpengetahuan', desc: 'Pusat referensi kearsipan terlengkap' },
                { icon: Globe2, title: 'Berkontribusi', desc: 'Mitra strategis pembangunan bangsa' },
              ].map((v) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="rounded-xl border border-border bg-card p-4 hover:border-gold/40 hover:shadow-premium transition-all"
                >
                  <v.icon className="h-6 w-6 text-gold mb-2" />
                  <div className="font-semibold text-sm text-navy dark:text-white">{v.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{v.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
