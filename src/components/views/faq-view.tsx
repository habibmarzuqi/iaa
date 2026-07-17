'use client'

import { motion } from 'framer-motion'
import { useApp } from '@/lib/store'
import { PublicLayout } from '@/components/layout/public-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import { ArrowLeft, HelpCircle, MessageCircleQuestion } from 'lucide-react'

const FAQS = [
  { q: 'Apa itu IAA Digital?', a: 'IAA Digital adalah platform digital resmi Ikatan Arsiparis ANRI yang mengintegrasikan website publik, manajemen anggota, perpustakaan digital, arsip organisasi, registrasi kegiatan, e-certificate, dan dashboard organisasi dalam satu sistem terpadu. Platform ini dikembangkan dengan teknologi modern untuk mendukung transformasi digital kearsipan Indonesia.' },
  { q: 'Bagaimana cara menjadi anggota IAA?', a: 'Pendaftaran anggota baru dibuka setiap tahun. Anda dapat mendaftar melalui portal IAA Digital dengan mengisi formulir pendaftaran online, melampirkan dokumen pendukung (NIP, ijazah, SK pengangkatan), dan membayar iuran tahunan. Setelah diverifikasi oleh pengurus, Anda akan menerima nomor anggota dan dapat mengakses kartu keanggotaan digital.' },
  { q: 'Apakah Digital Membership Card sah dan diakui?', a: 'Ya, Digital Membership Card di IAA Digital memiliki QR Code yang terenkripsi dan dapat diverifikasi keasliannya melalui portal resmi. Kartu ini setara dengan kartu fisik dan diterima di seluruh kegiatan IAA maupun mitra kerja sama. Setiap kartu memiliki nomor unik dan masa berlaku sesuai status keanggotaan.' },
  { q: 'Bagaimana cara mendaftar kegiatan (webinar, seminar, pelatihan)?', a: 'Anggota dapat mendaftar kegiatan melalui menu Agenda di portal IAA Digital. Pilih kegiatan yang ingin diikuti, klik tombol "Daftar", dan lengkapi formulir registrasi. Konfirmasi pendaftaran akan dikirim via email. Untuk kegiatan berbayar, sistem akan generate invoice yang dapat dibayar melalui transfer bank atau e-wallet.' },
  { q: 'Apakah e-certificate yang diterbitkan memiliki verifikasi online?', a: 'Ya, setiap e-certificate yang diterbitkan melalui IAA Digital memiliki nomor sertifikat unik dan QR Code verifikasi. Pemilik sertifikat dapat mengunduh PDF, dan pihak ketiga dapat memverifikasi keaslian sertifikat dengan memasukkan nomor atau memindai QR Code di portal publik IAA.' },
  { q: 'Apa saja koleksi yang tersedia di Digital Library?', a: 'Digital Library IAA menyediakan beragam koleksi: buku referensi kearsipan, ebook, jurnal ilmiah, pedoman teknis, regulasi terkait arsip, SOP standar, template dokumen, materi presentasi pelatihan, majalah organisasi, serta video dan audio pembelajaran. Koleksi dapat diunduh oleh anggota aktif, sebagian juga tersedia untuk publik.' },
  { q: 'Bagaimana cara mendapatkan sertifikasi arsiparis berjenjang?', a: 'IAA menyelenggarakan program sertifikasi arsiparis berjenjang: Pemuda, Muda, Madya, dan Utama. Setiap jenjang memiliki persyaratan pengalaman kerja, pendidikan, dan pelatihan prasyarat. Pendaftaran dibuka dua kali setahun melalui portal IAA Digital. Program meliputi pelatihan intensif, asesmen kompetensi, dan uji sertifikasi.' },
  { q: 'Apakah data anggota aman di platform ini?', a: 'Keamanan data adalah prioritas utama. Platform IAA Digital mengimplementasikan HTTPS, enkripsi password, CSRF protection, rate limiting, audit trail untuk setiap aksi sensitif, serta backup otomatis harian. Data anggota hanya dapat diakses oleh pemilik data dan administrator yang berwenang, sesuai kebijakan privasi yang berlaku.' },
  { q: 'Apakah ada biaya iuran anggota?', a: 'Ya, keanggotaan IAA memerlukan iuran tahunan yang besarnya disesuaikan dengan jenjang keanggotaan dan kemampuan anggota. Iuran digunakan untuk operasional organisasi, penyelenggaraan kegiatan, pengembangan platform digital, dan publikasi. Detail besaran iuran dapat dilihat di portal anggota setelah login.' },
  { q: 'Bagaimana cara mengajukan publikasi artikel di portal IAA?', a: 'Anggota yang ingin mempublikasikan artikel ilmiah atau opini di portal IAA dapat mengirimkan naskah melalui menu "Kirim Artikel" di dashboard anggota. Naskah akan ditinjau oleh tim redaksi dalam 7-14 hari kerja. Kriteria publikasi mencakup relevansi kearsipan, orisinalitas, dan kualitas penulisan.' },
]

export function FaqView() {
  const { setView } = useApp()
  return (
    <PublicLayout>
      <div className="bg-hero-gradient text-white py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative mx-auto max-w-4xl px-4 lg:px-8">
          <Button variant="ghost" onClick={() => setView({ name: 'public' })} className="text-white/70 hover:text-white hover:bg-white/10 mb-4 -ml-2">
            <ArrowLeft className="mr-1 h-4 w-4" /> Beranda
          </Button>
          <Badge className="bg-gold text-navy hover:bg-gold mb-3">FAQ</Badge>
          <h1 className="font-display text-4xl lg:text-5xl font-extrabold">Pertanyaan Umum</h1>
          <p className="text-white/70 mt-2 max-w-2xl">Jawaban atas pertanyaan yang sering diajukan tentang IAA Digital dan keanggotaan</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
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

        <Card className="mt-10 bg-navy-gradient text-white border-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <CardContent className="relative p-8 text-center">
            <MessageCircleQuestion className="h-10 w-10 text-gold mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold mb-2">Masih ada pertanyaan?</h3>
            <p className="text-white/70 text-sm mb-4 max-w-md mx-auto">
              Tim pengurus IAA siap membantu Anda. Hubungi kami melalui formulir kontak atau email resmi.
            </p>
            <Button onClick={() => setView({ name: 'contact' })} className="bg-gold-gradient text-navy hover:opacity-90">
              Hubungi Kami
            </Button>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  )
}
