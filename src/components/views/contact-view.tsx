'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/lib/store'
import { PublicLayout } from '@/components/layout/public-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, MapPin, Phone, Mail, Clock, Send, MessageCircle, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react'
import { toast } from 'sonner'

export function ContactView() {
  const { setView } = useApp()
  const [submitting, setSubmitting] = React.useState(false)
  const [form, setForm] = React.useState({ name: '', email: '', phone: '', subject: '', message: '' })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      toast.success('Pesan Anda berhasil dikirim. Tim IAA akan menghubungi Anda dalam 1-2 hari kerja.')
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    }, 1000)
  }

  return (
    <PublicLayout>
      <div className="bg-hero-gradient text-white py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
          <Button variant="ghost" onClick={() => setView({ name: 'public' })} className="text-white/70 hover:text-white hover:bg-white/10 mb-4 -ml-2">
            <ArrowLeft className="mr-1 h-4 w-4" /> Beranda
          </Button>
          <Badge className="bg-gold text-navy hover:bg-gold mb-3">Kontak</Badge>
          <h1 className="font-display text-4xl lg:text-5xl font-extrabold">Hubungi Kami</h1>
          <p className="text-white/70 mt-2 max-w-2xl">Sampaikan pertanyaan, saran, atau kritik Anda kepada pengurus IAA</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-5"
          >
            <Card className="bg-navy-gradient text-white border-0 overflow-hidden relative">
              <div className="absolute inset-0 bg-grid opacity-20" />
              <CardContent className="relative p-7 space-y-5">
                <h3 className="font-display text-xl font-bold">Sekretariat IAA</h3>
                <div className="space-y-4">
                  <ContactRow icon={MapPin} title="Alamat" lines={['Jl. Gajah Mada No. 111', 'Jakarta Pusat 11130, Indonesia']} />
                  <ContactRow icon={Phone} title="Telepon" lines={['(021) 6694166', '(021) 6694167 (Fax)']} />
                  <ContactRow icon={Mail} title="Email" lines={['sekretariat@iaa-anri.go.id', 'pengurus@iaa-anri.go.id']} />
                  <ContactRow icon={Clock} title="Jam Operasional" lines={['Senin - Jumat: 08.00 - 16.00 WIB', 'Sabtu - Minggu: Tutup']} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-navy dark:text-white">WhatsApp Resmi</h4>
                    <p className="text-xs text-muted-foreground">Respon cepat untuk pertanyaan mendesak</p>
                  </div>
                </div>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <MessageCircle className="mr-2 h-4 w-4" /> Chat via WhatsApp
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-navy dark:text-white mb-3">Media Sosial</h4>
                <div className="grid grid-cols-4 gap-2">
                  {[Facebook, Instagram, Youtube, Linkedin].map((Icon, i) => (
                    <a key={i} href="#" className="aspect-square grid place-items-center rounded-xl border border-border hover:border-gold/40 hover:bg-gold/5 transition-colors">
                      <Icon className="h-5 w-5 text-navy dark:text-white" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardContent className="p-7">
                <h3 className="font-display text-xl font-bold text-navy dark:text-white mb-1">Kirim Pesan</h3>
                <p className="text-sm text-muted-foreground mb-6">Isi formulir di bawah ini, tim kami akan merespons dalam 1-2 hari kerja</p>
                <form onSubmit={submit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Lengkap *</Label>
                      <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama Anda" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@anda.com" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telepon</Label>
                      <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="08xxxxxxxxxx" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subjek *</Label>
                      <Input id="subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Topik pesan" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Pesan *</Label>
                    <Textarea id="message" required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tulis pesan Anda di sini..." />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full bg-navy-gradient h-11">
                    {submitting ? 'Mengirim...' : <><Send className="mr-2 h-4 w-4" /> Kirim Pesan</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PublicLayout>
  )
}

function ContactRow({ icon: Icon, title, lines }: { icon: any; title: string; lines: string[] }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-gold/20 border border-gold/30">
        <Icon className="h-5 w-5 text-gold" />
      </div>
      <div>
        <div className="text-xs text-white/60 uppercase tracking-wide mb-1">{title}</div>
        {lines.map((l, i) => <div key={i} className="text-sm text-white/90">{l}</div>)}
      </div>
    </div>
  )
}
