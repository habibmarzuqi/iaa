'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useApp, roleBadgeColor, roleLabel } from '@/lib/store'
import { Header } from '@/components/layout/header'
import { DigitalMembershipCard } from '@/components/member/membership-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard, CreditCard, Award, CalendarCheck, Clock,
  Download, Mail, MapPin, Briefcase, GraduationCap, Fingerprint,
  Building2, BookOpen, CheckCircle2, XCircle, Loader2, LogOut,
  ChevronRight, Calendar, FileCheck, ScrollText, User, Lock, Globe, Search
} from 'lucide-react'
import { formatDate, formatDateTime, timeAgo } from '@/lib/helpers'
import { toast } from 'sonner'

type Tab = 'overview' | 'membership' | 'certificates' | 'events' | 'library' | 'profile'

interface MemberData {
  id: string
  memberNumber: string
  fullName: string
  photo: string | null
  nip: string | null
  workUnit: string | null
  position: string | null
  arsiparisLevel: string | null
  education: string | null
  trainingHistory: string
  certificationHistory: string
  status: string
  joinDate: string
}

interface RegItem {
  id: string
  status: string
  checkedIn: boolean
  registeredAt: string
  event: {
    id: string
    title: string
    eventType: string
    location: string
    startDate: string
    endDate: string
    isRegistrationOpen: boolean
  }
}

interface CertItem {
  id: string
  certificateNumber: string
  title: string
  description: string | null
  issuedAt: string
  event: { title: string; startDate: string } | null
}

export function MemberDashboard() {
  const { user, view, setView, logout } = useApp()
  const initialTab = (view.name === 'member-dashboard' && view.tab)
    ? (view.tab as Tab)
    : 'overview'
  const [tab, setTab] = React.useState<Tab>(initialTab)
  const [member, setMember] = React.useState<MemberData | null>(null)
  const [registrations, setRegistrations] = React.useState<RegItem[]>([])
  const [certificates, setCertificates] = React.useState<CertItem[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    Promise.all([
      fetch('/api/members').then((r) => r.json()),
      fetch('/api/members?sub=registrations').then((r) => r.json()),
      fetch('/api/members?sub=certificates').then((r) => r.json()),
    ])
      .then(([m, r, c]) => {
        if (m.member) setMember(m.member)
        if (r.registrations) setRegistrations(r.registrations)
        if (c.certificates) setCertificates(c.certificates)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    logout()
  }

  if (loading || !member) {
    return (
      <div className="min-h-screen grid place-items-center bg-muted/30">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-navy" />
          <p className="text-sm text-muted-foreground">Memuat dashboard anggota...</p>
        </div>
      </div>
    )
  }

  const initials = member.fullName.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
  const training = safeParse(member.trainingHistory)
  const certifications = safeParse(member.certificationHistory)

  const NAV_ITEMS: { key: Tab; label: string; icon: any }[] = [
    { key: 'overview', label: 'Ringkasan', icon: LayoutDashboard },
    { key: 'membership', label: 'Kartu Anggota', icon: CreditCard },
    { key: 'certificates', label: 'Sertifikat', icon: Award },
    { key: 'events', label: 'Kegiatan Saya', icon: CalendarCheck },
    { key: 'library', label: 'Digital Library Anggota', icon: BookOpen },
    { key: 'profile', label: 'Profil', icon: User },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />

      <div className="flex-1 mx-auto max-w-7xl w-full px-4 lg:px-8 py-8">
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-navy-gradient p-6 lg:p-8 text-white mb-6"
        >
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative flex items-center gap-5">
            <Avatar className="h-16 w-16 border-2 border-gold/40 shadow-lg">
              <AvatarFallback className="bg-white/10 text-white font-display font-bold text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display text-2xl font-bold">{member.fullName}</h1>
                <Badge className={`text-[10px] ${roleBadgeColor(user?.role)}`}>{roleLabel(user?.role)}</Badge>
              </div>
              <p className="text-white/70 text-sm">
                Selamat datang di portal anggota IAA Digital. Status keanggotaan Anda <span className="text-emerald-300 font-semibold">AKTIF</span>.
              </p>
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-white/60">
                <span className="flex items-center gap-1"><Fingerprint className="h-3 w-3 text-gold" /> {member.memberNumber}</span>
                <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-gold" /> {user?.email}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-gold" /> Bergabung {formatDate(member.joinDate)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="space-y-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`flex items-center gap-3 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  tab === item.key
                    ? 'bg-navy-gradient text-white shadow-premium'
                    : 'bg-card hover:bg-accent text-foreground/70 hover:text-navy dark:hover:text-white'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {tab === item.key && <ChevronRight className="ml-auto h-4 w-4" />}
              </button>
            ))}
            <Separator className="my-2" />
            <button
              onClick={() => setView({ name: 'public' })}
              className="flex items-center gap-3 w-full rounded-lg px-4 py-2.5 text-sm font-medium bg-card hover:bg-accent text-foreground/70 hover:text-navy dark:hover:text-white transition-all"
            >
              <BookOpen className="h-4 w-4" /> Lihat Website
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full rounded-lg px-4 py-2.5 text-sm font-medium bg-card hover:bg-red-50 dark:hover:bg-red-900/20 text-foreground/70 hover:text-red-600 dark:hover:text-red-400 transition-all"
            >
              <LogOut className="h-4 w-4" /> Keluar
            </button>
          </aside>

          {/* Main content */}
          <main className="space-y-6">
            {tab === 'overview' && (
              <OverviewTab
                member={member}
                registrations={registrations}
                certificates={certificates}
                setTab={setTab}
                userEmail={user?.email || ''}
              />
            )}

            {tab === 'membership' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-navy dark:text-white">
                      <CreditCard className="h-5 w-5 text-gold" /> Digital Membership Card
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col lg:flex-row gap-6 items-start">
                    <div className="flex-1 max-w-md">
                      <DigitalMembershipCard member={member} email={user?.email || ''} />
                    </div>
                    <div className="flex-1 space-y-3 w-full">
                      <div className="rounded-xl bg-muted/50 p-4 space-y-2">
                        <h4 className="font-semibold text-sm text-navy dark:text-white">Informasi Kartu</h4>
                        <Row label="Nomor Anggota" value={member.memberNumber} />
                        <Row label="Nama" value={member.fullName} />
                        <Row label="Status" value={member.status} valueClass="text-emerald-600 font-semibold" />
                        <Row label="Jenjang Arsiparis" value={member.arsiparisLevel ?? '-'} />
                        <Row label="Berlaku Sejak" value={formatDate(member.joinDate)} />
                      </div>
                      <Button
                        onClick={() => toast.info('Fitur unduh PDF akan segera tersedia')}
                        className="w-full bg-navy-gradient"
                      >
                        <Download className="mr-2 h-4 w-4" /> Unduh Kartu (PDF)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {tab === 'certificates' && (
              <CertificatesTab certificates={certificates} />
            )}

            {tab === 'events' && (
              <EventsTab registrations={registrations} />
            )}

            {tab === 'library' && (
              <LibraryTab />
            )}

            {tab === 'profile' && (
              <ProfileTab member={member} training={training} certifications={certifications} userEmail={user?.email || ''} />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

// ===== Sub-tabs =====

function OverviewTab({ member, registrations, certificates, setTab, userEmail }: {
  member: MemberData
  registrations: RegItem[]
  certificates: CertItem[]
  setTab: (t: Tab) => void
  userEmail: string
}) {
  const upcomingRegs = registrations.filter((r) => new Date(r.event.startDate) >= new Date())
  const pendingRegs = registrations.filter((r) => r.status === 'PENDING')

  return (
    <>
      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Sertifikat', value: certificates.length, icon: Award, color: 'from-gold-soft to-gold' },
          { label: 'Kegiatan Terdaftar', value: registrations.length, icon: CalendarCheck, color: 'from-blue-soft to-blue' },
          { label: 'Menunggu Approval', value: pendingRegs.length, icon: Clock, color: 'from-orange-400 to-orange-600' },
          { label: 'Status Anggota', value: 'AKTIF', icon: CheckCircle2, color: 'from-emerald-400 to-emerald-600' },
        ].map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-border hover:shadow-premium transition-shadow">
              <CardContent className="p-4">
                <div className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${s.color} text-white mb-2`}>
                  <s.icon className="h-4 w-4" />
                </div>
                <div className="text-2xl font-bold font-display text-navy dark:text-white">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Membership card preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-navy dark:text-white">
              <CreditCard className="h-5 w-5 text-gold" /> Kartu Keanggotaan
            </span>
            <Button variant="ghost" size="sm" onClick={() => setTab('membership')}>
              Lihat Detail <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-sm">
            <DigitalMembershipCard member={member} email={userEmail} />
          </div>
        </CardContent>
      </Card>

      {/* Recent activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-navy dark:text-white">
              <span className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-gold" /> Kegiatan Mendatang
              </span>
              <Button variant="ghost" size="sm" onClick={() => setTab('events')}>Semua</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingRegs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Belum ada kegiatan mendatang</p>
            )}
            {upcomingRegs.slice(0, 3).map((r) => (
              <div key={r.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted transition-colors">
                <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-navy-gradient text-white">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-navy dark:text-white truncate">{r.event.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{formatDateTime(r.event.startDate)}</div>
                  <Badge variant="outline" className={`text-[10px] mt-1 ${statusColor(r.status)}`}>{r.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-navy dark:text-white">
              <span className="flex items-center gap-2">
                <Award className="h-5 w-5 text-gold" /> Sertifikat Terbaru
              </span>
              <Button variant="ghost" size="sm" onClick={() => setTab('certificates')}>Semua</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {certificates.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Belum ada sertifikat</p>
            )}
            {certificates.slice(0, 3).map((c) => (
              <div key={c.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted transition-colors">
                <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-gold-gradient text-navy">
                  <ScrollText className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-navy dark:text-white truncate">{c.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 font-mono">{c.certificateNumber}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Diterbitkan {formatDate(c.issuedAt)}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function CertificatesTab({ certificates }: { certificates: CertItem[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-navy dark:text-white">
            <Award className="h-5 w-5 text-gold" /> E-Certificate Saya
          </CardTitle>
        </CardHeader>
        <CardContent>
          {certificates.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Belum ada sertifikat yang diterbitkan</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {certificates.map((c) => (
                <div key={c.id} className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-premium hover:border-gold/40 transition-all">
                  <div className="relative h-32 bg-navy-gradient overflow-hidden">
                    <div className="absolute inset-0 bg-grid opacity-30" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Award className="h-10 w-10 text-gold" />
                    </div>
                    <Badge className="absolute top-3 right-3 bg-gold text-navy hover:bg-gold text-[10px]">VERIFIED</Badge>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="font-semibold text-sm text-navy dark:text-white line-clamp-2">{c.title}</div>
                    <div className="text-xs text-muted-foreground font-mono">{c.certificateNumber}</div>
                    {c.event && (
                      <div className="text-xs text-muted-foreground">Kegiatan: {c.event.title}</div>
                    )}
                    <div className="text-[10px] text-muted-foreground pt-2 border-t border-border">
                      Diterbitkan: {formatDate(c.issuedAt)}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-2 border-gold/40 text-gold hover:bg-gold/10"
                      onClick={() => toast.info('Unduh PDF akan segera tersedia')}
                    >
                      <Download className="mr-2 h-3.5 w-3.5" /> Unduh PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function EventsTab({ registrations }: { registrations: RegItem[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-navy dark:text-white">
            <CalendarCheck className="h-5 w-5 text-gold" /> Kegiatan yang Saya Ikuti
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {registrations.length === 0 ? (
            <div className="text-center py-12">
              <CalendarCheck className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Belum ada pendaftaran kegiatan</p>
            </div>
          ) : (
            registrations.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-4 hover:shadow-premium transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] border-blue-soft/40 text-blue-brand">{r.event.eventType}</Badge>
                      <Badge variant="outline" className={`text-[10px] ${statusColor(r.status)}`}>{r.status}</Badge>
                      {r.checkedIn && (
                        <Badge variant="outline" className="text-[10px] border-emerald-400/40 text-emerald-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Checked In
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-navy dark:text-white">{r.event.title}</h3>
                    <div className="grid sm:grid-cols-2 gap-1.5 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {formatDateTime(r.event.startDate)}</div>
                      <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {r.event.location}</div>
                      <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Daftar: {timeAgo(r.registeredAt)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function ProfileTab({ member, training, certifications, userEmail }: {
  member: MemberData
  training: any[]
  certifications: any[]
  userEmail: string
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-navy dark:text-white">
            <User className="h-5 w-5 text-gold" /> Profil Anggota
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nama Lengkap" value={member.fullName} icon={User} />
            <Field label="Nomor Anggota" value={member.memberNumber} icon={Fingerprint} />
            <Field label="NIP" value={member.nip ?? '-'} icon={Fingerprint} />
            <Field label="Jenjang Arsiparis" value={member.arsiparisLevel ?? '-'} icon={Award} />
            <Field label="Jabatan" value={member.position ?? '-'} icon={Briefcase} />
            <Field label="Unit Kerja" value={member.workUnit ?? '-'} icon={Building2} />
            <Field label="Email" value={userEmail} icon={Mail} />
            <Field label="Status" value={member.status} icon={CheckCircle2} valueClass="text-emerald-600 font-semibold" />
          </div>
          {member.education && (
            <Field label="Pendidikan" value={member.education} icon={GraduationCap} fullWidth />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-navy dark:text-white">
            <GraduationCap className="h-5 w-5 text-gold" /> Riwayat Pelatihan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {training.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Belum ada riwayat pelatihan</p>
          ) : (
            <div className="space-y-3">
              {training.map((t, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                  <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-blue-soft/20 text-blue-brand">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-navy dark:text-white">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.year} · {t.organizer}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-navy dark:text-white">
            <FileCheck className="h-5 w-5 text-gold" /> Riwayat Sertifikasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {certifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Belum ada riwayat sertifikasi</p>
          ) : (
            <div className="space-y-3">
              {certifications.map((c, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                  <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-gold/20 text-gold">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-navy dark:text-white">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.year} · No. <span className="font-mono">{c.number}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ===== Helpers =====

function Row({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium text-navy dark:text-white ${valueClass}`}>{value}</span>
    </div>
  )
}

function Field({ label, value, icon: Icon, valueClass = '', fullWidth = false }: {
  label: string
  value: string
  icon: any
  valueClass?: string
  fullWidth?: boolean
}) {
  return (
    <div className={`rounded-lg bg-muted/40 p-3 ${fullWidth ? 'sm:col-span-2' : ''}`}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        <Icon className="h-3.5 w-3.5 text-gold" /> {label}
      </div>
      <div className={`text-sm font-medium text-navy dark:text-white ${valueClass}`}>{value}</div>
    </div>
  )
}

function statusColor(status: string) {
  switch (status) {
    case 'APPROVED': return 'border-emerald-400/40 text-emerald-600'
    case 'PENDING': return 'border-orange-400/40 text-orange-600'
    case 'REJECTED': return 'border-red-400/40 text-red-600'
    case 'WAITING_LIST': return 'border-blue-400/40 text-blue-600'
    case 'CANCELLED': return 'border-slate-400/40 text-slate-600'
    default: return ''
  }
}

function safeParse(s: string | null | undefined): any[] {
  if (!s) return []
  try { return JSON.parse(s) } catch { return [] }
}

function LibraryTab() {
  const [items, setItems] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [filter, setFilter] = React.useState('ALL')
  const [catFilter, setCatFilter] = React.useState('ALL')

  React.useEffect(() => {
    fetch('/api/library?limit=100')
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .finally(() => setLoading(false))
  }, [])

  const cats = ['ALL', 'BUKU', 'EBOOK', 'JURNAL', 'PEDOMAN', 'REGULASI', 'SOP', 'TEMPLATE', 'PRESENTASI', 'MAJALAH', 'VIDEO', 'AUDIO']

  const filtered = items.filter((i) => {
    if (filter === 'ANGGOTA' && i.accessLevel !== 'ANGGOTA') return false
    if (filter === 'PUBLIK' && i.accessLevel === 'ANGGOTA') return false
    if (catFilter !== 'ALL' && i.category !== catFilter) return false
    if (search && !i.title.toLowerCase().includes(search.toLowerCase()) && !i.description?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleDownload = (item: any) => {
    if (!item.fileUrl) {
      toast.info('File dokumen belum diunggah oleh pengurus.')
      return
    }

    const link = document.createElement('a')
    link.href = item.fileUrl
    link.download = item.title
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Mengunduh "${item.title}"...`)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="border-border bg-gradient-to-r from-navy via-navy-light to-navy text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <CardContent className="p-6 relative space-y-2">
          <Badge className="bg-gold text-navy hover:bg-gold text-[10px] font-bold uppercase tracking-wider">
            🔒 Eksklusif Anggota IAA
          </Badge>
          <h2 className="font-display text-2xl font-bold">Digital Library Portal Anggota</h2>
          <p className="text-white/70 text-sm max-w-xl">
            Akses bebas dan unduh seluruh koleksi regulasi, SOP, pedoman, modul, dan e-book khusus keanggotaan Ikatan Arsiparis Indonesia.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
            <CardTitle className="flex items-center gap-2 text-navy dark:text-white text-lg">
              <BookOpen className="h-5 w-5 text-gold" /> Koleksi Perpustakaan Digital
            </CardTitle>
            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  filter === 'ALL' ? 'bg-navy-gradient text-white border-navy' : 'bg-card border-border text-muted-foreground'
                }`}
              >
                Semua Koleksi ({items.length})
              </button>
              <button
                onClick={() => setFilter('ANGGOTA')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
                  filter === 'ANGGOTA' ? 'bg-purple-600 text-white border-purple-600' : 'bg-card border-border text-muted-foreground'
                }`}
              >
                <Lock className="h-3 w-3" /> Khusus Anggota ({items.filter((i) => i.accessLevel === 'ANGGOTA').length})
              </button>
              <button
                onClick={() => setFilter('PUBLIK')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
                  filter === 'PUBLIK' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-card border-border text-muted-foreground'
                }`}
              >
                <Globe className="h-3 w-3" /> Publik ({items.filter((i) => i.accessLevel !== 'ANGGOTA').length})
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari koleksi, regulasi, pedoman..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>

          <div className="flex gap-1.5 overflow-x-auto scrollbar-premium pb-2">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                  catFilter === c ? 'bg-navy text-white dark:bg-white dark:text-navy' : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                }`}
              >
                {c === 'ALL' ? 'Semua Kategori' : c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-navy" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Tidak ada koleksi ditemukan</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((item) => (
                <div key={item.id} className="rounded-xl border border-border bg-card p-4 hover:shadow-premium transition-all space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
                      {item.accessLevel === 'ANGGOTA' ? (
                        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-300 text-[10px] flex items-center gap-1">
                          <Lock className="h-3 w-3" /> Khusus Anggota
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 text-[10px] flex items-center gap-1">
                          <Globe className="h-3 w-3" /> Akses Publik
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold text-sm text-navy dark:text-white line-clamp-2">{item.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="pt-2 border-t border-border space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{item.author || '—'} {item.year ? `· ${item.year}` : ''}</span>
                      <span>{item.fileSize ? `${(item.fileSize / (1024 * 1024)).toFixed(1)} MB` : ''}</span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleDownload(item)}
                      className="w-full bg-navy-gradient text-white hover:opacity-90 text-xs"
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" /> Unduh Dokumen
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
