'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { AdminShell } from '@/components/admin/admin-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs'
import { QRCodeSVG } from 'qrcode.react'
import {
  CalendarCheck, Users, Clock, CheckCircle2, XCircle, UserPlus,
  Search, Calendar, MapPin, QrCode, Check, Filter, ListChecks, UserCheck,
  AlertCircle, Plus, Edit2, Trash2, Loader2, Save, Upload, X,
  Image as ImageIcon, Link2, Eye, EyeOff, Globe2, Award, Download, CheckCheck,
} from 'lucide-react'
import { formatDateTime, formatDate, timeAgo } from '@/lib/helpers'
import { toast } from 'sonner'
import { DataPagination } from '@/components/ui/data-pagination'

interface RegItem {
  id: string
  status: string
  checkedIn: boolean
  checkedInAt: string | null
  registeredAt: string
  event: { id: string; title: string; eventType: string; startDate: string; location: string; quota: number }
  member: { id: string; fullName: string; memberNumber: string; arsiparisLevel: string | null; position: string | null; workUnit: string | null }
}

interface EventItem {
  id: string
  title: string
  slug: string
  description: string
  eventType: string
  coverImage: string | null
  location: string
  startDate: string
  endDate: string
  quota: number
  registeredCount: number
  isPublished: boolean
  isRegistrationOpen: boolean
  organizer?: { name: string } | null
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Menunggu', color: 'border-orange-400/40 text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
  APPROVED: { label: 'Disetujui', color: 'border-emerald-400/40 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
  REJECTED: { label: 'Ditolak', color: 'border-red-400/40 text-red-600 bg-red-50 dark:bg-red-900/20' },
  WAITING_LIST: { label: 'Waiting List', color: 'border-blue-400/40 text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
  CANCELLED: { label: 'Dibatalkan', color: 'border-slate-400/40 text-slate-600 bg-slate-50 dark:bg-slate-900/20' },
}

const EVENT_TYPES = [
  { value: 'SEMINAR', label: 'Seminar' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'WEBINAR', label: 'Webinar' },
  { value: 'RAPAT', label: 'Rapat' },
  { value: 'PELATIHAN', label: 'Pelatihan' },
  { value: 'LOMBA', label: 'Lomba' },
]

export function AdminEventsView() {
  const [events, setEvents] = React.useState<EventItem[]>([])
  const [regs, setRegs] = React.useState<RegItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filterEvent, setFilterEvent] = React.useState('ALL')
  const [filterStatus, setFilterStatus] = React.useState('ALL')
  const [regPage, setRegPage] = React.useState(1)
  const [regPageSize, setRegPageSize] = React.useState(20)
  const [regTotal, setRegTotal] = React.useState(0)
  const [eventPage, setEventPage] = React.useState(1)
  const [eventPageSize, setEventPageSize] = React.useState(12)
  const [eventTotal, setEventTotal] = React.useState(0)
  const [selectedReg, setSelectedReg] = React.useState<RegItem | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [editingEvent, setEditingEvent] = React.useState<EventItem | null>(null)
  const [eventFormOpen, setEventFormOpen] = React.useState(false)

  const load = React.useCallback(() => {
    setLoading(true)
    const eventParams = new URLSearchParams({
      admin: 'true',
      page: String(eventPage),
      limit: String(eventPageSize),
    })
    const regParams = new URLSearchParams({
      page: String(regPage),
      limit: String(regPageSize),
    })
    if (filterEvent !== 'ALL') regParams.set('eventId', filterEvent)
    if (filterStatus !== 'ALL') regParams.set('status', filterStatus)

    Promise.all([
      fetch(`/api/events?${eventParams.toString()}`).then((r) => r.json()),
      fetch(`/api/registrations?${regParams.toString()}`).then((r) => r.json()),
    ])
      .then(([e, r]) => {
        setEvents(e.events ?? [])
        setEventTotal(e.total ?? 0)
        setRegs(r.registrations ?? [])
        setRegTotal(r.total ?? 0)
      })
      .finally(() => setLoading(false))
  }, [eventPage, eventPageSize, regPage, regPageSize, filterEvent, filterStatus])

  React.useEffect(() => { load() }, [load])

  // Stats still use ALL registrations data on current page — for accuracy, fetch totals separately.
  // For simplicity here, we use regTotal and let pending/approved/checkedIn reflect current page.
  const pendingCount = regs.filter((r) => r.status === 'PENDING').length
  const approvedCount = regs.filter((r) => r.status === 'APPROVED').length
  const checkedInCount = regs.filter((r) => r.checkedIn).length
  const waitingCount = regs.filter((r) => r.status === 'WAITING_LIST').length

  const handleAction = async (reg: RegItem, action: 'approve' | 'reject' | 'checkin' | 'cancel') => {
    const actionMap: Record<string, { status?: string; label: string }> = {
      approve: { status: 'APPROVED', label: 'menyetujui' },
      reject: { status: 'REJECTED', label: 'menolak' },
      checkin: { label: 'check-in' },
      cancel: { status: 'CANCELLED', label: 'membatalkan' },
    }
    const a = actionMap[action]
    const url = action === 'checkin'
      ? `/api/registrations?id=${reg.id}&action=checkin`
      : `/api/registrations?id=${reg.id}`
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: a.status }),
      })
      const d = await res.json()
      if (!res.ok) {
        toast.error(d.error || `Gagal ${a.label}`)
        return
      }
      toast.success(`Berhasil ${a.label} ${(reg.member?.fullName || reg.participantName || "peserta")}`)
      setDetailOpen(false)
      load()
    } catch {
      toast.error('Terjadi kesalahan')
    }
  }

  const removeEvent = async (e: EventItem) => {
    if (!confirm(`Hapus kegiatan "${e.title}"?\n\nSemua pendaftaran peserta terkait juga akan dihapus permanen.`)) return
    try {
      const res = await fetch(`/api/events?id=${e.id}`, { method: 'DELETE' })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal menghapus'); return }
      toast.success(`Kegiatan "${e.title}" dihapus`)
      load()
    } catch { toast.error('Terjadi kesalahan') }
  }

  // ===== Bulk actions for large participant counts =====
  const [bulkApproving, setBulkApproving] = React.useState(false)
  const [bulkIssuing, setBulkIssuing] = React.useState(false)
  const [bulkDialogOpen, setBulkDialogOpen] = React.useState<'approve' | 'issue' | null>(null)

  const bulkApprove = async () => {
    if (!confirm(`Setujui SEMUA pendaftaran PENDING${filterEvent !== 'ALL' ? ' untuk kegiatan ini' : ''}?\n\nIni tidak bisa dibatalkan.`)) return
    setBulkApproving(true)
    try {
      const res = await fetch('/api/registrations/bulk-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: filterEvent !== 'ALL' ? filterEvent : undefined, status: 'APPROVED' }),
      })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal'); return }
      toast.success(d.message || `${d.processed} pendaftaran disetujui`)
      setBulkDialogOpen(null)
      load()
    } catch { toast.error('Terjadi kesalahan') } finally { setBulkApproving(false) }
  }

  const bulkIssueCerts = async (certTitle: string, certDesc: string, certTemplate: string) => {
    if (!filterEvent || filterEvent === 'ALL') {
      toast.error('Pilih kegiatan tertentu dulu di filter')
      return
    }
    setBulkIssuing(true)
    try {
      const res = await fetch('/api/certificates/bulk-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: filterEvent,
          title: certTitle,
          description: certDesc,
          template: certTemplate,
        }),
      })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal'); return }
      toast.success(d.message || `${d.issued} sertifikat diterbitkan`)
      setBulkDialogOpen(null)
    } catch { toast.error('Terjadi kesalahan') } finally { setBulkIssuing(false) }
  }

  const exportParticipants = async (eventId: string, eventTitle: string) => {
    try {
      const res = await fetch(`/api/events/export-participants?id=${eventId}`)
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        toast.error(d.error || 'Gagal export')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `peserta-${eventTitle.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50)}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('File Excel diunduh')
    } catch { toast.error('Gagal export') }
  }

  const openCreateEvent = () => { setEditingEvent(null); setEventFormOpen(true) }
  const openEditEvent = (e: EventItem) => { setEditingEvent(e); setEventFormOpen(true) }

  return (
    <AdminShell
      activeKey="events"
      title="Event & Registrasi"
      subtitle="Kelola kegiatan (CRUD), pendaftaran peserta, approval, dan check-in QR"
      actions={
        <Button onClick={openCreateEvent} className="bg-navy-gradient">
          <Plus className="mr-2 h-4 w-4" /> Tambah Kegiatan
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Registrasi', value: regs.length, icon: Users, color: 'from-blue-soft to-blue' },
          { label: 'Menunggu Approval', value: pendingCount, icon: Clock, color: 'from-orange-400 to-orange-600' },
          { label: 'Peserta Disetujui', value: approvedCount, icon: CheckCircle2, color: 'from-emerald-400 to-emerald-600' },
          { label: 'Sudah Check-in', value: checkedInCount, icon: UserCheck, color: 'from-gold-soft to-gold' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${s.color} text-white mb-2`}>
                <s.icon className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold font-display text-navy dark:text-white">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={filterEvent} onValueChange={(v) => { setFilterEvent(v); setRegPage(1) }}>
              <SelectTrigger className="sm:w-[280px]">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Kegiatan</SelectItem>
                {events.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setRegPage(1) }}>
              <SelectTrigger className="sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="PENDING">Menunggu</SelectItem>
                <SelectItem value="APPROVED">Disetujui</SelectItem>
                <SelectItem value="REJECTED">Ditolak</SelectItem>
                <SelectItem value="WAITING_LIST">Waiting List</SelectItem>
                <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
            {waitingCount > 0 && (
              <div className="flex items-center gap-2 text-xs text-blue-600 ml-auto">
                <AlertCircle className="h-3.5 w-3.5" />
                {waitingCount} peserta di waiting list
              </div>
            )}
          </div>
          {/* Bulk action toolbar */}
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBulkDialogOpen('approve')}
              disabled={bulkApproving}
              className="border-emerald-400/40 text-emerald-600 hover:bg-emerald-50"
            >
              {bulkApproving ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="mr-2 h-3.5 w-3.5" />}
              Approve Semua Pending
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBulkDialogOpen('issue')}
              disabled={bulkIssuing || filterEvent === 'ALL'}
              className="border-gold/40 text-gold hover:bg-gold/10"
            >
              {bulkIssuing ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Award className="mr-2 h-3.5 w-3.5" />}
              Terbitkan Sertifikat Massal
            </Button>
            {filterEvent !== 'ALL' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const ev = events.find((e) => e.id === filterEvent)
                  if (ev) exportParticipants(ev.id, ev.title)
                }}
                className="ml-auto"
              >
                <Download className="mr-2 h-3.5 w-3.5" /> Export Peserta (Excel)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="registrations">
        <TabsList>
          <TabsTrigger value="registrations" className="gap-1.5">
            <ListChecks className="h-3.5 w-3.5" /> Registrasi ({regTotal})
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-1.5">
            <CalendarCheck className="h-3.5 w-3.5" /> Kegiatan ({events.length})
          </TabsTrigger>
          <TabsTrigger value="checkin" className="gap-1.5">
            <QrCode className="h-3.5 w-3.5" /> Check-In Scanner
          </TabsTrigger>
        </TabsList>

        {/* Registrations tab */}
        <TabsContent value="registrations">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}
                </div>
              ) : regs.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Belum ada pendaftaran</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {regs.map((r, i) => {
                    const sm = STATUS_META[r.status] ?? STATUS_META.PENDING
                    const initials = (r.member?.fullName || r.participantName || "P").split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
                    return (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => { setSelectedReg(r); setDetailOpen(true) }}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-navy-gradient text-white text-xs font-semibold">{initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-navy dark:text-white">{(r.isMember ? r.member?.fullName : r.participantName)}</span>
                              <Badge variant="outline" className={`text-[10px] ${sm.color}`}>{sm.label}</Badge>
                              {r.checkedIn && (
                                <Badge variant="outline" className="text-[10px] border-emerald-400/40 text-emerald-600">
                                  <Check className="h-2.5 w-2.5 mr-1" /> Checked-in
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5 truncate">
                              {r.event.title} · {(r.isMember ? r.member?.memberNumber : r.participantEmail || "")}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              Daftar {timeAgo(r.registeredAt)} · {formatDateTime(r.event.startDate)}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {r.status === 'PENDING' && (
                              <>
                                <Button size="sm" variant="outline" className="h-7 text-[10px] border-emerald-400/40 text-emerald-600 hover:bg-emerald-50"
                                  onClick={(e) => { e.stopPropagation(); handleAction(r, 'approve') }}>
                                  <Check className="h-3 w-3 mr-1" /> Approve
                                </Button>
                                <Button size="sm" variant="outline" className="h-7 text-[10px] border-red-400/40 text-red-600 hover:bg-red-50"
                                  onClick={(e) => { e.stopPropagation(); handleAction(r, 'reject') }}>
                                  <XCircle className="h-3 w-3 mr-1" /> Reject
                                </Button>
                              </>
                            )}
                            {r.status === 'APPROVED' && !r.checkedIn && (
                              <Button size="sm" variant="outline" className="h-7 text-[10px] border-blue-400/40 text-blue-600 hover:bg-blue-50"
                                onClick={(e) => { e.stopPropagation(); handleAction(r, 'checkin') }}>
                                <QrCode className="h-3 w-3 mr-1" /> Check-In
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          {regTotal > 0 && (
            <Card className="mt-4">
              <CardContent className="p-2">
                <DataPagination
                  page={regPage}
                  pageSize={regPageSize}
                  total={regTotal}
                  onPageChange={setRegPage}
                  onPageSizeChange={(s) => { setRegPageSize(s); setRegPage(1) }}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Events tab */}
        <TabsContent value="events">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />)}
            </div>
          ) : events.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CalendarCheck className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-3">Belum ada kegiatan. Buat kegiatan pertama Anda.</p>
                <Button onClick={openCreateEvent} className="bg-navy-gradient">
                  <Plus className="mr-2 h-4 w-4" /> Tambah Kegiatan
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {events.map((e) => {
                const eventRegs = regs.filter((r) => r.event.id === e.id)
                const pending = eventRegs.filter((r) => r.status === 'PENDING').length
                const checkedIn = eventRegs.filter((r) => r.checkedIn).length
                const pct = Math.min(100, Math.round((e.registeredCount / Math.max(e.quota, 1)) * 100))
                return (
                  <Card key={e.id} className="overflow-hidden">
                    {e.coverImage && (
                      <div className="h-32 w-full overflow-hidden bg-muted">
                        <img src={e.coverImage} alt={e.title} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <Badge variant="outline" className="text-[10px]">{e.eventType}</Badge>
                            {e.isPublished ? (
                              <Badge variant="outline" className="text-[9px] border-emerald-400/40 text-emerald-600">
                                <Eye className="h-2.5 w-2.5 mr-1" /> Published
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[9px] border-slate-400/40 text-slate-500">
                                <EyeOff className="h-2.5 w-2.5 mr-1" /> Draft
                              </Badge>
                            )}
                            {!e.isRegistrationOpen && (
                              <Badge variant="outline" className="text-[9px] border-red-400/40 text-red-600">Ditutup</Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-navy dark:text-white line-clamp-1">{e.title}</h3>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                            <Calendar className="h-3 w-3" /> {formatDate(e.startDate)}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-1 font-mono">/{e.slug}</div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEditEvent(e)} title="Edit">
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600" onClick={() => removeEvent(e)} title="Hapus">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      {e.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{e.description}</p>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Kuota: {e.registeredCount}/{e.quota}</span>
                          <span className="text-emerald-600 font-medium">{pending} pending</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full bg-gradient-to-r from-blue-soft to-blue" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.location}</span>
                          <span className="text-gold font-medium flex items-center gap-1"><Check className="h-3 w-3" /> {checkedIn} hadir</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
          {eventTotal > 0 && (
            <Card className="mt-4">
              <CardContent className="p-2">
                <DataPagination
                  page={eventPage}
                  pageSize={eventPageSize}
                  total={eventTotal}
                  onPageChange={setEventPage}
                  onPageSizeChange={(s) => { setEventPageSize(s); setEventPage(1) }}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="checkin">
          <CheckInScanner events={events} regs={regs} onCheckIn={(r) => handleAction(r, 'checkin')} />
        </TabsContent>
      </Tabs>

      {/* Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto scrollbar-premium">
          {selectedReg && (
            <>
              <SheetHeader>
                <SheetTitle className="text-left">Detail Pendaftaran</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                {/* Member card */}
                <div className="rounded-xl bg-navy-gradient text-white p-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid opacity-20" />
                  <div className="relative flex items-center gap-3">
                    <Avatar className="h-14 w-14 border-2 border-gold/40">
                      <AvatarFallback className="bg-white/10 text-white font-semibold">
                        {(selectedReg.member?.fullName || selectedReg.participantName || "P").split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-display font-bold">{(selectedReg.isMember ? selectedReg.member?.fullName : selectedReg.participantName)}</div>
                      <div className="text-xs text-white/70 font-mono">{(selectedReg.isMember ? selectedReg.member?.memberNumber : selectedReg.participantEmail || "")}</div>
                      <div className="text-[10px] text-white/60 mt-0.5">{selectedReg.member?.position}</div>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Info label="Status" value={STATUS_META[selectedReg.status]?.label ?? selectedReg.status} />
                  <Info label="Checked-In" value={selectedReg.checkedIn ? formatDateTime(selectedReg.checkedInAt!) : 'Belum'} />
                  <Info label="Waktu Daftar" value={formatDateTime(selectedReg.registeredAt)} />
                  <Info label="Jenjang" value={selectedReg.member?.arsiparisLevel ?? '-'} />
                </div>

                {/* Event info */}
                <div className="rounded-lg border border-border p-3 space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Kegiatan</div>
                  <div className="font-semibold text-sm text-navy dark:text-white">{selectedReg.event.title}</div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2"><Calendar className="h-3 w-3" /> {formatDateTime(selectedReg.event.startDate)}</div>
                    <div className="flex items-center gap-2"><MapPin className="h-3 w-3" /> {selectedReg.event.location}</div>
                  </div>
                </div>

                {/* QR for check-in */}
                <div className="rounded-lg bg-muted/30 p-4 flex flex-col items-center text-center">
                  <div className="bg-white rounded-lg p-2 shadow-sm">
                    <QRCodeSVG
                      value={JSON.stringify({
                        regId: selectedReg.id,
                        eventId: selectedReg.event.id,
                        memberNumber: (selectedReg.isMember ? selectedReg.member?.memberNumber : selectedReg.participantEmail || ""),
                        name: (selectedReg.isMember ? selectedReg.member?.fullName : selectedReg.participantName),
                      })}
                      size={100}
                      level="M"
                      fgColor="#0a1e3f"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">QR Check-In Peserta</div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  {selectedReg.status === 'PENDING' && (
                    <>
                      <Button onClick={() => handleAction(selectedReg, 'approve')} className="bg-emerald-600 hover:bg-emerald-700">
                        <Check className="mr-2 h-4 w-4" /> Approve
                      </Button>
                      <Button onClick={() => handleAction(selectedReg, 'reject')} variant="outline" className="border-red-400/40 text-red-600 hover:bg-red-50">
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                      </Button>
                    </>
                  )}
                  {selectedReg.status === 'APPROVED' && !selectedReg.checkedIn && (
                    <Button onClick={() => handleAction(selectedReg, 'checkin')} className="col-span-2 bg-navy-gradient">
                      <QrCode className="mr-2 h-4 w-4" /> Check-In Peserta
                    </Button>
                  )}
                  {selectedReg.checkedIn && (
                    <div className="col-span-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-3 text-center">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-1" />
                      <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Sudah Check-In</div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {selectedReg.checkedInAt && formatDateTime(selectedReg.checkedInAt)}
                      </div>
                    </div>
                  )}
                  {selectedReg.status !== 'CANCELLED' && selectedReg.status !== 'REJECTED' && (
                    <Button onClick={() => handleAction(selectedReg, 'cancel')} variant="outline" className="col-span-2">
                      Batalkan Pendaftaran
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Event Form Dialog (Create/Edit) */}
      <EventFormDialog
        open={eventFormOpen}
        onOpenChange={setEventFormOpen}
        event={editingEvent}
        onSaved={() => { setEventFormOpen(false); load() }}
      />

      {/* Bulk Approve Dialog */}
      {bulkDialogOpen === 'approve' && (
        <Dialog open={true} onOpenChange={() => setBulkDialogOpen(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-navy dark:text-white">
                <CheckCheck className="h-5 w-5 text-emerald-600" /> Approve Massal
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-3 text-sm text-emerald-700 dark:text-emerald-300">
                <p>Semua pendaftaran dengan status <strong>PENDING</strong>{filterEvent !== 'ALL' ? ' untuk kegiatan terpilih' : ''} akan disetujui sekaligus.</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Pastikan Anda sudah meninjau semua pendaftar sebelum approve massal. Tindakan ini tidak bisa dibatalkan.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBulkDialogOpen(null)}>Batal</Button>
              <Button onClick={bulkApprove} disabled={bulkApproving} className="bg-emerald-600 hover:bg-emerald-700">
                {bulkApproving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCheck className="mr-2 h-4 w-4" />}
                Approve Semua
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Bulk Issue Certificates Dialog */}
      {bulkDialogOpen === 'issue' && (
        <BulkIssueDialog
          eventName={events.find((e) => e.id === filterEvent)?.title || ''}
          onIssue={bulkIssueCerts}
          loading={bulkIssuing}
          onClose={() => setBulkDialogOpen(null)}
        />
      )}
    </AdminShell>
  )
}

// ============ Bulk Issue Dialog ============

function BulkIssueDialog({
  eventName, onIssue, loading, onClose,
}: {
  eventName: string
  onIssue: (title: string, desc: string, template: string) => void
  loading: boolean
  onClose: () => void
}) {
  const [title, setTitle] = React.useState(`Peserta ${eventName}`)
  const [desc, setDesc] = React.useState('Sebagai peserta aktif kegiatan')
  const [template, setTemplate] = React.useState('default')

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-navy dark:text-white">
            <Award className="h-5 w-5 text-gold" /> Terbitkan Sertifikat Massal
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-lg bg-gold/5 border border-gold/30 p-3 text-sm">
            <p className="font-semibold text-navy dark:text-white">Kegiatan: {eventName}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Sertifikat akan diterbitkan ke SEMUA peserta dengan status APPROVED. Peserta yang sudah punya sertifikat akan dilewati. Anggota IAA mendapat notifikasi otomatis.
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Judul Sertifikat *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Deskripsi (opsional)</Label>
            <Input value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Template</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Standar (Navy + Gold)</SelectItem>
                <SelectItem value="webinar">Webinar (Biru)</SelectItem>
                <SelectItem value="training">Pelatihan (Hijau)</SelectItem>
                <SelectItem value="workshop">Workshop (Oranye)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={() => onIssue(title, desc, template)} disabled={loading || !title} className="bg-navy-gradient">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Award className="mr-2 h-4 w-4" />}
            Terbitkan ke Semua Peserta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============ Event Form Dialog (Create/Edit) ============

function EventFormDialog({ open, onOpenChange, event, onSaved }: {
  open: boolean
  onOpenChange: (o: boolean) => void
  event: EventItem | null
  onSaved: () => void
}) {
  const [form, setForm] = React.useState({
    title: '',
    slug: '',
    description: '',
    eventType: 'SEMINAR',
    coverImage: '',
    location: '',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '12:00',
    quota: 100,
    isPublished: true,
    isRegistrationOpen: true,
  })
  const [saving, setSaving] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)

  React.useEffect(() => {
    if (event) {
      const sd = new Date(event.startDate)
      const ed = new Date(event.endDate)
      const pad = (n: number) => String(n).padStart(2, '0')
      const toLocalDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
      const toLocalTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`
      setForm({
        title: event.title,
        slug: event.slug,
        description: event.description,
        eventType: event.eventType,
        coverImage: event.coverImage || '',
        location: event.location,
        startDate: toLocalDate(sd),
        startTime: toLocalTime(sd),
        endDate: toLocalDate(ed),
        endTime: toLocalTime(ed),
        quota: event.quota,
        isPublished: event.isPublished,
        isRegistrationOpen: event.isRegistrationOpen,
      })
    } else {
      const today = new Date()
      const pad = (n: number) => String(n).padStart(2, '0')
      const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
      setForm({
        title: '', slug: '', description: '', eventType: 'SEMINAR',
        coverImage: '', location: '',
        startDate: todayStr, startTime: '09:00',
        endDate: todayStr, endTime: '12:00',
        quota: 100, isPublished: true, isRegistrationOpen: true,
      })
    }
  }, [event, open])

  const handleBannerUpload = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/events-admin/upload', { method: 'POST', body: fd })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal upload banner'); return }
      setForm((f) => ({ ...f, coverImage: d.url }))
      toast.success('Banner terunggah')
    } catch { toast.error('Gagal upload banner') } finally { setUploading(false) }
  }

  const submit = async () => {
    if (!form.title || !form.description || !form.location || !form.startDate || !form.endDate) {
      toast.error('Judul, deskripsi, lokasi, tanggal mulai & selesai wajib diisi')
      return
    }

    const startISO = new Date(`${form.startDate}T${form.startTime}:00`).toISOString()
    const endISO = new Date(`${form.endDate}T${form.endTime}:00`).toISOString()

    if (new Date(endISO) <= new Date(startISO)) {
      toast.error('Tanggal selesai harus setelah tanggal mulai')
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || undefined,
        description: form.description.trim(),
        eventType: form.eventType,
        coverImage: form.coverImage || null,
        location: form.location.trim(),
        startDate: startISO,
        endDate: endISO,
        quota: Number(form.quota) || 100,
        isPublished: form.isPublished,
        isRegistrationOpen: form.isRegistrationOpen,
      }
      const url = event ? `/api/events?id=${event.id}` : '/api/events'
      const method = event ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal menyimpan'); return }
      toast.success(event ? 'Kegiatan diperbarui' : 'Kegiatan ditambahkan')
      onSaved()
    } catch { toast.error('Terjadi kesalahan') } finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-premium">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-navy dark:text-white">
            <CalendarCheck className="h-5 w-5 text-gold" /> {event ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Banner upload */}
          <div className="space-y-2">
            <Label>Banner / Cover Image</Label>
            <div className="flex items-start gap-4">
              <div className="h-24 w-40 rounded-lg overflow-hidden border border-border bg-muted flex-shrink-0">
                {form.coverImage ? (
                  <img src={form.coverImage} alt="Banner" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full grid place-items-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="space-y-2 flex-1">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="event-banner-upload"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleBannerUpload(f) }}
                />
                <label htmlFor="event-banner-upload">
                  <Button type="button" variant="outline" size="sm" disabled={uploading} className="cursor-pointer">
                    {uploading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-2 h-3.5 w-3.5" />}
                    Upload Banner
                  </Button>
                </label>
                <div className="flex items-center gap-2">
                  <Link2 className="h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder="atau tempel URL gambar..."
                    value={form.coverImage.startsWith('/uploads/') ? '' : form.coverImage}
                    onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                {form.coverImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600 h-7 text-xs"
                    onClick={() => setForm({ ...form, coverImage: '' })}
                  >
                    <X className="h-3 w-3 mr-1" /> Hapus Banner
                  </Button>
                )}
                <p className="text-[10px] text-muted-foreground">
                  JPG/PNG/WebP/GIF/SVG. Di lokal: maks 5MB (disimpan di /uploads/events/).
                  Di Vercel: maks 500KB (otomatis dikompres ke WebP base64). Untuk file besar, gunakan URL gambar eksternal.
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2 sm:col-span-2">
              <Label>Judul Kegiatan *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Seminar Nasional Arsiparis 2026"
              />
            </div>

            <div className="space-y-2">
              <Label>Slug (URL)</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="biarkan kosong untuk auto-generate"
              />
              <p className="text-[10px] text-muted-foreground">Contoh: seminar-arsiparis-2026</p>
            </div>

            <div className="space-y-2">
              <Label>Jenis Kegiatan *</Label>
              <Select value={form.eventType} onValueChange={(v) => setForm({ ...form, eventType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Deskripsi *</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Deskripsi singkat kegiatan, tujuan, narasumber, dll."
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Lokasi *</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Aula IAA ANRI, Jakarta / Zoom / Google Meet"
              />
            </div>

            <div className="space-y-2">
              <Label>Tanggal Mulai *</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Jam Mulai</Label>
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Tanggal Selesai *</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Jam Selesai</Label>
              <Input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Kuota Peserta</Label>
              <Input
                type="number"
                min={1}
                value={form.quota}
                onChange={(e) => setForm({ ...form, quota: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2 flex items-end">
              <div className="flex items-center gap-2 rounded-lg border border-border p-3 w-full">
                <Switch
                  checked={form.isPublished}
                  onCheckedChange={(c) => setForm({ ...form, isPublished: c })}
                />
                <Label className="text-sm cursor-pointer">Publikasikan (tampil di website)</Label>
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center gap-2 rounded-lg border border-border p-3">
                <Switch
                  checked={form.isRegistrationOpen}
                  onCheckedChange={(c) => setForm({ ...form, isRegistrationOpen: c })}
                />
                <Label className="text-sm cursor-pointer">Buka Pendaftaran Online</Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={submit} disabled={saving} className="bg-navy-gradient">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {event ? 'Simpan Perubahan' : 'Buat Kegiatan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============ Check-In Scanner ============

function CheckInScanner({ events, regs, onCheckIn }: {
  events: EventItem[]
  regs: RegItem[]
  onCheckIn: (r: RegItem) => void
}) {
  const [selectedEventId, setSelectedEventId] = React.useState(events[0]?.id ?? '')
  const [scanInput, setScanInput] = React.useState('')

  const eventRegs = regs.filter((r) => r.event.id === selectedEventId && r.status === 'APPROVED' && !r.checkedIn)
  const recentCheckIns = regs.filter((r) => r.event.id === selectedEventId && r.checkedIn).slice(0, 5)

  const handleScan = () => {
    if (!scanInput.trim()) return
    try {
      const data = JSON.parse(scanInput)
      const reg = regs.find((r) => r.id === data.regId)
      if (!reg) {
        toast.error('QR tidak valid atau peserta tidak ditemukan')
        return
      }
      if (reg.event.id !== selectedEventId) {
        toast.error('Peserta terdaftar di kegiatan lain')
        return
      }
      onCheckIn(reg)
      setScanInput('')
    } catch {
      toast.error('Format QR tidak valid')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-navy dark:text-white">
          <QrCode className="h-5 w-5 text-gold" /> Simulasi Scanner Check-In
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 text-xs text-blue-700 dark:text-blue-300">
          <AlertCircle className="h-4 w-4 inline mr-1" />
          Pilih kegiatan, lalu tempel QR data peserta (JSON) untuk simulasi check-in otomatis. Di produksi, kamera akan otomatis memindai QR.
        </div>

        <div className="space-y-2">
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger><SelectValue placeholder="Pilih kegiatan..." /></SelectTrigger>
            <SelectContent>
              {events.map((e) => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Scan QR (JSON)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              placeholder='{"regId":"...","memberNumber":"..."}'
              className="flex-1 h-10 rounded-md border border-border bg-background px-3 text-xs font-mono"
            />
            <Button onClick={handleScan} className="bg-navy-gradient">
              <QrCode className="h-4 w-4 mr-1" /> Scan
            </Button>
          </div>
        </div>

        {/* Quick check-in list */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Belum Check-In ({eventRegs.length})
          </h4>
          <div className="space-y-1.5 max-h-64 overflow-y-auto scrollbar-premium">
            {eventRegs.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Semua peserta sudah check-in</p>
            ) : (
              eventRegs.map((r) => (
                <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/30">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-navy-gradient text-white text-[10px]">
                      {(r.member?.fullName || r.participantName || "P").split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-navy dark:text-white truncate">{(r.isMember ? r.member?.fullName : r.participantName)}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{(r.isMember ? r.member?.memberNumber : r.participantEmail || "")}</div>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => onCheckIn(r)}>
                    <Check className="h-3 w-3 mr-1" /> Check-In
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent check-ins */}
        {recentCheckIns.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Check-In Terbaru
            </h4>
            <div className="space-y-1.5">
              {recentCheckIns.map((r) => (
                <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-navy dark:text-white truncate">{(r.isMember ? r.member?.fullName : r.participantName)}</div>
                    <div className="text-[10px] text-muted-foreground">{r.checkedInAt && timeAgo(r.checkedInAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-2.5">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="text-xs font-medium text-navy dark:text-white mt-0.5">{value}</div>
    </div>
  )
}
