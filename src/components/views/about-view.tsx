'use client'

import { motion } from 'framer-motion'
import { useApp } from '@/lib/store'
import { PublicLayout } from '@/components/layout/public-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Target, Award, BookOpen, Globe2, Building2, Calendar, Users, ArrowRight, History, Heart } from 'lucide-react'

export function AboutView() {
  const { setView } = useApp()
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
            Organisasi profesi resmi arsiparis di lingkungan Arsip Nasional Republik Indonesia, berdedikasi membangun sistem kearsipan nasional yang modern, profesional, dan berkelanjutan.
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
              <p className="text-muted-foreground leading-relaxed">
                Ikatan Arsiparis ANRI (IAA) didirikan pada tahun 1973 sebagai wadah komunikasi dan pembinaan profesi arsiparis di lingkungan Arsip Nasional Republik Indonesia. Berdiri dalam konteks pembangunan sistem kearsipan nasional pasca-kemerdekaan, IAA tumbuh menjadi organisasi profesi terkemuka di bidang tata kelola arsip dan informasi publik.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Selama lebih dari lima dekade, IAA telah berkontribusi pada penyusunan berbagai regulasi kearsipan, pelatihan ribuan arsiparis, sertifikasi profesi berjenjang, serta menjadi mitra strategis pemerintah dalam transformasi digital kearsipan nasional. Organisasi ini juga aktif dalam jejaring internasional, termasuk International Council on Archives (ICA) dan Southeast Asian Regional Branch (SEARCA).
              </p>
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
                      { v: '1973', l: 'Tahun Berdiri' },
                      { v: '53', l: 'Tahun Berkarya' },
                      { v: '2,400+', l: 'Anggota Aktif' },
                      { v: '34', l: 'Provinsi' },
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
                  "Menjadi organisasi profesi arsiparis terdepan di Asia Tenggara yang mendorong transformasi digital kearsipan demi terwujudnya tata kelola informasi publik yang transparan, akuntabel, dan berkelanjutan."
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
                  {[
                    'Meningkatkan kompetensi profesional arsiparis melalui pelatihan, sertifikasi berjenjang, dan pengembangan kapasitas berkelanjutan',
                    'Memperkuat kelembagaan organisasi sebagai mitra strategis pemerintah dalam kebijakan tata kelola arsip nasional',
                    'Mendorong inovasi dan adopsi teknologi digital dalam manajemen arsip dan preservasi warisan informasi',
                    'Membangun jejaring kerja sama nasional dan internasional untuk pertukaran pengetahuan dan praktik terbaik',
                    'Melindungi dan memperjuangkan kepentingan profesi arsiparis serta menjunjung tinggi etika profesi',
                  ].map((m, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-navy text-white text-xs font-bold font-display">
                        {i + 1}
                      </div>
                      <span className="text-foreground/80 leading-relaxed pt-0.5">{m}</span>
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
            {[
              { icon: Award, title: 'Profesional', desc: 'Kompetensi berstandar nasional & internasional, etika profesi yang tinggi' },
              { icon: BookOpen, title: 'Berpengetahuan', desc: 'Pusat referensi kearsipan terlengkap, riset dan publikasi ilmiah' },
              { icon: Globe2, title: 'Berkontribusi', desc: 'Mitra strategis pembangunan bangsa, pelayanan publik yang prima' },
              { icon: Heart, title: 'Berdedikasi', desc: 'Menjaga memori kolektif bangsa untuk generasi mendatang' },
            ].map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="group h-full border-border hover:border-gold/40 hover:shadow-premium transition-all">
                  <CardContent className="p-6 text-center">
                    <div className="grid h-14 w-14 mx-auto place-items-center rounded-2xl bg-gradient-to-br from-navy to-blue-soft text-white shadow-lg mb-4 group-hover:scale-110 transition-transform">
                      <v.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-display font-bold text-navy dark:text-white mb-2">{v.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
