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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  ArrowLeft, Calendar, MapPin, Clock, Users, Video, GraduationCap, Presentation, Users2,
  Trophy, UserCheck, Share2, Loader2, Globe, Shield, User, Mail, Phone, Building, CheckCircle2,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatDateTime } from '@/lib/helpers'
import { toast } from 'sonner'

interface EventDetail {
  id: string; slug: string; title: string; description: string; eventType: string
  coverImage?: string | null
  location: string; startDate: string; endDate: string; quota: number
  registeredCount: number; isRegistrationOpen: boolean; isPublicEvent?: boolean
  organizer: { name: string; email: string }
  registrations: any[]
}

const EVENT_ICONS: Record<string, any> = {
  WEBINAR: Video, PELATIHAN: GraduationCap, WORKSHOP: Presentation,
  SEMINAR: Users2, RAPAT: Users, LOMBA: Trophy,
}

export function EventDetailView({ slug }: { slug: string }) {
  const { user, setView, goBack } = useApp()
  const [event, setEvent] = React.useState<EventDetail | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [registering, setRegistering] = React.useState(false)

  // Public registration modal state
  const [publicModalOpen, setPublicModalOpen] = React.useState(false)
  const [publicForm, setPublicForm] = React.useState({
    participantName: '',
    participantEmail: '',
    participantPhone: '',
    participantInstitution: '',
    memberNumber: '',
  })

  React.useEffect(() => {
    fetch(`/api/events?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.event) {
          setEvent(d.event)
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href)
            url.searchParams.set('event', d.event.slug)
            window.history.replaceState({}, '', url.toString())
          }
        }
      })
      .finally(() => setLoading(false))
  }, [slug])

  const handleShare = async () => {
    if (!event) return
    const shareUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/?event=${event.slug}`
      : `https://iaa-digital.org/?event=${event.slug}`

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Agenda Kegiatan IAA: ${event.title}`,
          url: shareUrl,
        })
        return
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Tautan agenda berhasil disalin: ' + shareUrl)
    } catch {
      toast.error('Gagal menyalin tautan')
    }
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-3xl px-4 py-10 space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PublicLayout>
    )
  }

  if (!event) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Kegiatan tidak ditemukan</h2>
          <Button onClick={() => setView({ name: 'event-list' })}>Kembali ke Agenda</Button>
        </div>
      </PublicLayout>
    )
  }

  const Icon = EVENT_ICONS[event.eventType] ?? Calendar
  const remaining = event.quota - event.registeredCount
  const pct = Math.min(100, Math.round((event.registeredCount / event.quota) * 100))

  const handleRegisterClick = () => {
    // 1. If logged in as ANGGOTA -> register directly
    if (user && user.role === 'ANGGOTA') {
      submitMemberRegistration()
      return
    }

    // 2. If event is PUBLIC -> open public registration modal (for visitors & non-members)
    if (event.isPublicEvent) {
      setPublicForm({
        participantName: user?.name || '',
        participantEmail: user?.email || '',
        participantPhone: '',
        participantInstitution: '',
        memberNumber: user?.memberNumber || '',
      })
      setPublicModalOpen(true)
      return
    }

    // 3. If event is MEMBERS ONLY & not logged in -> redirect to login
    toast.info('Kegiatan ini khusus untuk Anggota Terdaftar IAA. Silakan Login terlebih dahulu.')
    setView({ name: 'login' })
  }

  const submitMemberRegistration = async () => {
    setRegistering(true)
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id }),
      })
      const d = await res.json()
      if (!res.ok) {
        if (d.registration) {
          toast.info('Anda sudah terdaftar di kegiatan ini')
        } else {
          toast.error(d.error || 'Gagal mendaftar')
        }
        return
      }
      if (d.registration.status === 'WAITING_LIST') {
        toast.success('Anda masuk waiting list. Kami akan menghubungi jika ada slot tersedia.')
      } else {
        toast.success('Pendaftaran berhasil! Menunggu approval pengurus.')
      }
      // Reload event detail to update count
      fetch(`/api/events?slug=${slug}`).then((r) => r.json()).then((d) => { if (d.event) setEvent(d.event) })
    } catch {
      toast.error('Terjadi kesalahan jaringan')
    } finally {
      setRegistering(false)
    }
  }

  const submitPublicRegistration = async () => {
    if (!publicForm.participantName.trim() || !publicForm.participantEmail.trim()) {
      toast.error('Nama lengkap dan Email wajib diisi')
      return
    }
    setRegistering(true)
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          participantName: publicForm.participantName.trim(),
          participantEmail: publicForm.participantEmail.trim(),
          participantPhone: publicForm.participantPhone.trim() || undefined,
          participantInstitution: publicForm.participantInstitution.trim() || undefined,
          memberNumber: publicForm.memberNumber.trim() || undefined,
        }),
      })
      const d = await res.json()
      if (!res.ok) {
        if (d.registration) {
          toast.info('Email Anda sudah terdaftar di kegiatan ini')
        } else {
          toast.error(d.error || 'Gagal mendaftar')
        }
        return
      }
      setPublicModalOpen(false)
      if (d.registration.status === 'WAITING_LIST') {
        toast.success('Pendaftaran tersimpan! Anda masuk ke daftar tunggu (waiting list).')
      } else {
        toast.success('Pendaftaran berhasil! Terima kasih telah mendaftar.')
      }
      // Reload event detail to update count
      fetch(`/api/events?slug=${slug}`).then((r) => r.json()).then((d) => { if (d.event) setEvent(d.event) })
    } catch {
      toast.error('Terjadi kesalahan jaringan')
    } finally {
      setRegistering(false)
    }
  }

  return (
    <PublicLayout>
      {/* Hero */}
      <div className="bg-hero-gradient text-white py-12 lg:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
          <Button variant="ghost" onClick={goBack} className="text-white/70 hover:text-white hover:bg-white/10 mb-4 -ml-2">
            <ArrowLeft className="mr-1 h-4 w-4" /> Kembali
          </Button>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold/20 border border-gold/30 backdrop-blur">
              <Icon className="h-6 w-6 text-gold" />
            </div>
            <Badge className="bg-gold text-navy hover:bg-gold">{event.eventType}</Badge>

            {/* Target Audience Badge */}
            {event.isPublicEvent ? (
              <Badge className="bg-emerald-500 text-white border-emerald-400/30 flex items-center gap-1">
                <Globe className="h-3 w-3" /> Terbuka untuk Umum
              </Badge>
            ) : (
              <Badge className="bg-navy-soft text-gold border-gold/40 flex items-center gap-1">
                <Shield className="h-3 w-3 text-gold" /> Khusus Anggota IAA
              </Badge>
            )}

            {!event.isRegistrationOpen && (
              <Badge className="bg-red-500/80 text-white border-red-400/30">Pendaftaran Ditutup</Badge>
            )}
          </div>
          <h1 className="font-display text-3xl lg:text-4xl font-extrabold leading-tight">{event.title}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 lg:px-8 py-10 grid lg:grid-cols-[1fr_320px] gap-8">
        {/* Left: details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {event.coverImage && (
            <div className="rounded-2xl overflow-hidden border border-border shadow-md aspect-video max-h-80 w-full bg-muted">
              <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div>
            <h2 className="font-display text-xl font-bold mb-3 text-navy dark:text-white">Deskripsi Kegiatan</h2>
            <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>

          <Card>
            <CardContent className="p-6 grid sm:grid-cols-2 gap-4">
              <InfoRow icon={Calendar} label="Tanggal Mulai" value={formatDate(event.startDate, { weekday: 'long' })} />
              <InfoRow icon={Calendar} label="Tanggal Selesai" value={formatDate(event.endDate, { weekday: 'long' })} />
              <InfoRow icon={Clock} label="Waktu" value={formatDateTime(event.startDate).split(' ').slice(-1)[0] + ' - ' + formatDateTime(event.endDate).split(' ').slice(-1)[0] + ' WIB'} />
              <InfoRow icon={MapPin} label="Lokasi" value={event.location} />
              <InfoRow icon={Users} label="Kuota Peserta" value={`${event.quota} orang`} />
              <InfoRow icon={UserCheck} label="Terdaftar" value={`${event.registeredCount} peserta`} />
            </CardContent>
          </Card>

          {/* Target Peserta Banner */}
          <Card className="border-border">
            <CardContent className="p-5 flex items-start gap-4">
              <div className={`p-3 rounded-xl ${event.isPublicEvent ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-gold/10 text-gold'}`}>
                {event.isPublicEvent ? <Globe className="h-6 w-6" /> : <Shield className="h-6 w-6" />}
              </div>
              <div>
                <h4 className="font-semibold text-sm text-navy dark:text-white mb-0.5">
                  {event.isPublicEvent ? 'Kegiatan Terbuka Untuk Umum' : 'Kegiatan Khusus Anggota IAA'}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {event.isPublicEvent
                    ? 'Siapa saja (Masyarakat umum, Mahasiswa, Praktisi, Non-Anggota) dapat berpartisipasi dalam kegiatan ini.'
                    : 'Kegiatan ini merupakan program internal khusus bagi Anggota Terdaftar Ikatan Arsiparis ANRI.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Organizer */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-navy dark:text-white mb-3">Penyelenggara</h3>
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-navy-gradient text-white">
                  {event.organizer.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-navy dark:text-white">{event.organizer.name}</div>
                  <div className="text-xs text-muted-foreground">{event.organizer.email}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right: registration card */}
        <div className="space-y-4">
          <Card className="lg:sticky lg:top-24">
            <CardContent className="p-6 space-y-4">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Kuota Tersedia</div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-extrabold font-display text-navy dark:text-white">{remaining}</span>
                  <span className="text-sm text-muted-foreground pb-1">/ {event.quota} slot</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted mt-2">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: `${pct}%` }} />
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">{pct}% terisi</div>
              </div>

              {event.isRegistrationOpen ? (
                <Button onClick={handleRegisterClick} disabled={registering} className="w-full bg-navy-gradient" size="lg">
                  {registering ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mendaftarkan...</>
                  ) : (
                    <><UserCheck className="mr-2 h-4 w-4" /> Daftar Sekarang</>
                  )}
                </Button>
              ) : (
                <Button disabled className="w-full" size="lg" variant="secondary">Pendaftaran Ditutup</Button>
              )}

              <Button variant="outline" className="w-full border-gold/40 text-gold hover:bg-gold/10" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" /> Bagikan Agenda
              </Button>

              <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
                {user
                  ? `Login sebagai: ${user.email} (${user.role})`
                  : event.isPublicEvent
                  ? 'Buka untuk Umum (Tidak wajib login)'
                  : 'Khusus Anggota (Wajib login)'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Public Registration Dialog (Modal) */}
      <Dialog open={publicModalOpen} onOpenChange={setPublicModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-navy dark:text-white">
              <Globe className="h-5 w-5 text-emerald-500" /> Formulir Pendaftaran Umum
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 inline mr-1" />
              Kegiatan <strong>{event.title}</strong> terbuka untuk umum. Silakan lengkapi identitas Anda di bawah ini.
            </div>

            <div className="space-y-2">
              <Label>Nama Lengkap *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={publicForm.participantName}
                  onChange={(e) => setPublicForm({ ...publicForm, participantName: e.target.value })}
                  placeholder="Nama Lengkap & Gelar"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email Aktif *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={publicForm.participantEmail}
                  onChange={(e) => setPublicForm({ ...publicForm, participantEmail: e.target.value })}
                  placeholder="email.anda@domain.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>No. Handphone / WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={publicForm.participantPhone}
                  onChange={(e) => setPublicForm({ ...publicForm, participantPhone: e.target.value })}
                  placeholder="081234567890"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Instansi / Perguruan Tinggi / Perusahaan</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={publicForm.participantInstitution}
                  onChange={(e) => setPublicForm({ ...publicForm, participantInstitution: e.target.value })}
                  placeholder="Contoh: Universitas Indonesia / ANRI"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nomor Anggota IAA <span className="text-muted-foreground font-normal">(Opsional)</span></Label>
              <Input
                value={publicForm.memberNumber}
                onChange={(e) => setPublicForm({ ...publicForm, memberNumber: e.target.value })}
                placeholder="Contoh: IAA-2026-0001 (jika Anda anggota)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPublicModalOpen(false)}>Batal</Button>
            <Button onClick={submitPublicRegistration} disabled={registering} className="bg-navy-gradient">
              {registering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}
              Kirim Pendaftaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-gold/10 text-gold">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium text-navy dark:text-white">{value}</div>
      </div>
    </div>
  )
}
