'use client'

import { motion } from 'framer-motion'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import { HelpCircle, MessageCircleQuestion } from 'lucide-react'
import { useApp } from '@/lib/store'
import { Button } from '@/components/ui/button'

const FAQS = [
  {
    q: 'Apa itu IAA Digital?',
    a: 'IAA Digital adalah platform digital resmi Ikatan Arsiparis ANRI yang mengintegrasikan website publik, manajemen anggota, perpustakaan digital, arsip organisasi, registrasi kegiatan, e-certificate, dan dashboard organisasi dalam satu sistem terpadu. Platform ini dikembangkan dengan teknologi modern untuk mendukung transformasi digital kearsipan Indonesia.',
  },
  {
    q: 'Bagaimana cara menjadi anggota IAA?',
    a: 'Pendaftaran anggota baru dibuka setiap tahun. Anda dapat mendaftar melalui portal IAA Digital dengan mengisi formulir pendaftaran online, melampirkan dokumen pendukung (NIP, ijazah, SK pengangkatan), dan membayar iuran tahunan. Setelah diverifikasi oleh pengurus, Anda akan menerima nomor anggota dan dapat mengakses kartu keanggotaan digital.',
  },
  {
    q: 'Apakah Digital Membership Card sah dan diakui?',
    a: 'Ya, Digital Membership Card di IAA Digital memiliki QR Code yang terenkripsi dan dapat diverifikasi keasliannya melalui portal resmi. Kartu ini setara dengan kartu fisik dan diterima di seluruh kegiatan IAA maupun mitra kerja sama. Setiap kartu memiliki nomor unik dan masa berlaku sesuai status keanggotaan.',
  },
  {
    q: 'Bagaimana cara mendaftar kegiatan (webinar, seminar, pelatihan)?',
    a: 'Anggota dapat mendaftar kegiatan melalui menu Agenda di portal IAA Digital. Pilih kegiatan yang ingin diikuti, klik tombol "Daftar", dan lengkapi formulir registrasi. Konfirmasi pendaftaran akan dikirim via email. Untuk kegiatan berbayar, sistem akan generate invoice yang dapat dibayar melalui transfer bank atau e-wallet.',
  },
  {
    q: 'Apakah e-certificate yang diterbitkan memiliki verifikasi online?',
    a: 'Ya, setiap e-certificate yang diterbitkan melalui IAA Digital memiliki nomor sertifikat unik dan QR Code verifikasi. Pemilik sertifikat dapat mengunduh PDF, dan pihak ketiga dapat memverifikasi keaslian sertifikat dengan memasukkan nomor atau memindai QR Code di portal publik IAA.',
  },
  {
    q: 'Apa saja koleksi yang tersedia di Digital Library?',
    a: 'Digital Library IAA menyediakan beragam koleksi: buku referensi kearsipan, ebook, jurnal ilmiah, pedoman teknis, regulasi terkait arsip, SOP standar, template dokumen, materi presentasi pelatihan, majalah organisasi, serta video dan audio pembelajaran. Koleksi dapat diunduh oleh anggota aktif, sebagian juga tersedia untuk publik.',
  },
  {
    q: 'Bagaimana cara mendapatkan sertifikasi arsiparis berjenjang?',
    a: 'IAA menyelenggarakan program sertifikasi arsiparis berjenjang: Pemuda, Muda, Madya, dan Utama. Setiap jenjang memiliki persyaratan pengalaman kerja, pendidikan, dan pelatihan prasyarat. Pendaftaran dibuka dua kali setahun melalui portal IAA Digital. Program meliputi pelatihan intensif, asesmen kompetensi, dan uji sertifikasi.',
  },
  {
    q: 'Apakah data anggota aman di platform ini?',
    a: 'Keamanan data adalah prioritas utama. Platform IAA Digital mengimplementasikan HTTPS, enkripsi password, CSRF protection, rate limiting, audit trail untuk setiap aksi sensitif, serta backup otomatis harian. Data anggota hanya dapat diakses oleh pemilik data dan administrator yang berwenang, sesuai kebijakan privasi yang berlaku.',
  },
]

export function FaqSection() {
  const { setView } = useApp()
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-extrabold mt-4 text-navy dark:text-white">
            Pertanyaan Umum
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Jawaban atas pertanyaan yang sering diajukan tentang IAA Digital dan keanggotaan
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-xl border border-border bg-card px-5 shadow-sm overflow-hidden"
              >
                <AccordionTrigger className="text-left hover:no-underline py-5">
                  <div className="flex items-start gap-3 pr-4">
                    <HelpCircle className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                    <span className="font-semibold text-navy dark:text-white">{f.q}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5 pl-8">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 text-center rounded-2xl bg-navy-gradient p-8 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="relative">
            <MessageCircleQuestion className="h-10 w-10 text-gold mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold mb-2">Masih ada pertanyaan?</h3>
            <p className="text-white/70 text-sm mb-4 max-w-md mx-auto">
              Tim pengurus IAA siap membantu Anda. Hubungi kami melalui formulir kontak atau email resmi.
            </p>
            <Button onClick={() => setView({ name: 'contact' })} className="bg-gold-gradient text-navy hover:opacity-90">
              Hubungi Kami
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
