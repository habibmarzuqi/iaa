'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/lib/store'
import { PublicLayout } from '@/components/layout/public-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, MapPin, Clock, Users, Video, GraduationCap, Presentation, Users2, Trophy, UserCheck, Share2, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatDateTime } from '@/lib/helpers'
import { toast } from 'sonner'

interface EventDetail {
  id: string; slug: string; title: string; description: string; eventType: string
  location: string; startDate: string; endDate: string; quota: number
  registeredCount: number; isRegistrationOpen: boolean
  organizer: { name: string; email: string }
  registrations: any[]
}

const EVENT_ICONS: Record<string, any> = {
  WEBINAR: Video, PELATIHAN: GraduationCap, WORKSHOP: Presentation,
  SEMINAR: Users2, RAPAT: Users, LOMBA: Trophy,
}

export function EventDetailView({ slug }: { slug: string }) {
  const { setView, user } = useApp()
  const [event, setEvent] = React.useState<EventDetail | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [registering, setRegistering] = React.useState(false)

  React.useEffect(() => {
    fetch(`/api/events?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => { if (d.event) setEvent(d.event) })
      .finally(() => setLoading(false))
  }, [slug])

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
  const d = new Date(event.startDate)
  const remaining = event.quota - event.registeredCount
  const pct = Math.min(100, Math.round((event.registeredCount / event.quota) * 100))

  const handleRegister = async () => {
    if (!user) {
      toast.info('Silakan login sebagai anggota untuk mendaftar kegiatan')
      setView({ name: 'login' })
      return
    }
    if (user.role !== 'ANGGOTA') {
      toast.info('Hanya anggota yang dapat mendaftar kegiatan. Gunakan akun anggota.')
      return
    }
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
          <Button variant="ghost" onClick={() => setView({ name: 'event-list' })} className="text-white/70 hover:text-white hover:bg-white/10 mb-4 -ml-2">
            <ArrowLeft className="mr-1 h-4 w-4" /> Semua Agenda
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold/20 border border-gold/30 backdrop-blur">
              <Icon className="h-6 w-6 text-gold" />
            </div>
            <Badge className="bg-gold text-navy hover:bg-gold">{event.eventType}</Badge>
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
          <div>
            <h2 className="font-display text-xl font-bold mb-3 text-navy dark:text-white">Deskripsi Kegiatan</h2>
            <p className="text-foreground/80 leading-relaxed">{event.description}</p>
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
                <Button onClick={handleRegister} disabled={registering} className="w-full bg-navy-gradient" size="lg">
                  {registering ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mendaftarkan...</>
                  ) : (
                    <><UserCheck className="mr-2 h-4 w-4" /> Daftar Sekarang</>
                  )}
                </Button>
              ) : (
                <Button disabled className="w-full" size="lg" variant="secondary">Pendaftaran Ditutup</Button>
              )}

              <Button variant="outline" className="w-full border-gold/40 text-gold hover:bg-gold/10" onClick={() => toast.info('Tautan disalin')}>
                <Share2 className="mr-2 h-4 w-4" /> Bagikan
              </Button>

              <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
                {user ? `Login sebagai: ${user.email}` : 'Anda harus login sebagai anggota untuk mendaftar'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
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
