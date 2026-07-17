'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { AdminShell } from '@/components/admin/admin-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs'
import { QRCodeSVG } from 'qrcode.react'
import {
  CalendarCheck, Users, Clock, CheckCircle2, XCircle, UserPlus,
  Search, Calendar, MapPin, QrCode, Check, Filter, ListChecks, UserCheck,
  AlertCircle,
} from 'lucide-react'
import { formatDateTime, formatDate, timeAgo } from '@/lib/helpers'
import { toast } from 'sonner'

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
  id: string; title: string; eventType: string; startDate: string; location: string
  quota: number; registeredCount: number; isRegistrationOpen: boolean
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Menunggu', color: 'border-orange-400/40 text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
  APPROVED: { label: 'Disetujui', color: 'border-emerald-400/40 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
  REJECTED: { label: 'Ditolak', color: 'border-red-400/40 text-red-600 bg-red-50 dark:bg-red-900/20' },
  WAITING_LIST: { label: 'Waiting List', color: 'border-blue-400/40 text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
  CANCELLED: { label: 'Dibatalkan', color: 'border-slate-400/40 text-slate-600 bg-slate-50 dark:bg-slate-900/20' },
}

export function AdminEventsView() {
  const [events, setEvents] = React.useState<EventItem[]>([])
  const [regs, setRegs] = React.useState<RegItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filterEvent, setFilterEvent] = React.useState('ALL')
  const [filterStatus, setFilterStatus] = React.useState('ALL')
  const [selectedReg, setSelectedReg] = React.useState<RegItem | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)

  const load = React.useCallback(() => {
    setLoading(true)
    Promise.all([
      fetch('/api/events?limit=50').then((r) => r.json()),
      fetch('/api/registrations').then((r) => r.json()),
    ])
      .then(([e, r]) => {
        setEvents(e.events ?? [])
        setRegs(r.registrations ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => { load() }, [load])

  const filtered = regs.filter((r) => {
    if (filterEvent !== 'ALL' && r.event.id !== filterEvent) return false
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false
    return true
  })

  const pendingCount = regs.filter((r) => r.status === 'PENDING').length
  const approvedCount = regs.filter((r) => r.status === 'APPROVED').length
  const checkedInCount = regs.filter((r) => r.checkedIn).length
  const waitingCount = regs.filter((r) => r.status === 'WAITING_LIST').length

  const handleAction = async (reg: RegItem, action: 'approve' | 'reject' | 'checkin' | 'cancel') => {
    const actionMap = {
      approve: { status: 'APPROVED', label: 'menyetujui' },
      reject: { status: 'REJECTED', label: 'menolak' },
      checkin: { action: 'checkin', label: 'check-in' },
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
      toast.success(`Berhasil ${a.label} ${reg.member.fullName}`)
      setDetailOpen(false)
      load()
    } catch {
      toast.error('Terjadi kesalahan')
    }
  }

  return (
    <AdminShell
      activeKey="events"
      title="Event & Registrasi"
      subtitle="Kelola pendaftaran kegiatan, approval peserta, dan check-in QR"
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
            <Select value={filterEvent} onValueChange={setFilterEvent}>
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
            <Select value={filterStatus} onValueChange={setFilterStatus}>
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
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="registrations">
        <TabsList>
          <TabsTrigger value="registrations" className="gap-1.5">
            <ListChecks className="h-3.5 w-3.5" /> Registrasi ({filtered.length})
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
              ) : filtered.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Belum ada pendaftaran</p>
                </div>
              ) : (
                <div className="divide-y divide-border max-h-[600px] overflow-y-auto scrollbar-premium">
                  {filtered.map((r, i) => {
                    const sm = STATUS_META[r.status] ?? STATUS_META.PENDING
                    const initials = r.member.fullName.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
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
                              <span className="font-semibold text-sm text-navy dark:text-white">{r.member.fullName}</span>
                              <Badge variant="outline" className={`text-[10px] ${sm.color}`}>{sm.label}</Badge>
                              {r.checkedIn && (
                                <Badge variant="outline" className="text-[10px] border-emerald-400/40 text-emerald-600">
                                  <Check className="h-2.5 w-2.5 mr-1" /> Checked-in
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5 truncate">
                              {r.event.title} · {r.member.memberNumber}
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
        </TabsContent>

        {/* Events tab */}
        <TabsContent value="events">
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((e) => {
              const eventRegs = regs.filter((r) => r.event.id === e.id)
              const pending = eventRegs.filter((r) => r.status === 'PENDING').length
              const checkedIn = eventRegs.filter((r) => r.checkedIn).length
              const pct = Math.min(100, Math.round((e.registeredCount / e.quota) * 100))
              return (
                <Card key={e.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <Badge variant="outline" className="text-[10px] mb-1">{e.eventType}</Badge>
                        <h3 className="font-semibold text-navy dark:text-white line-clamp-1">{e.title}</h3>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          <Calendar className="h-3 w-3" /> {formatDate(e.startDate)}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setFilterEvent(e.id)}>
                        <Users className="mr-1 h-3 w-3" /> {eventRegs.length}
                      </Button>
                    </div>
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
        </TabsContent>

        {/* Check-in scanner tab */}
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
                        {selectedReg.member.fullName.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-display font-bold">{selectedReg.member.fullName}</div>
                      <div className="text-xs text-white/70 font-mono">{selectedReg.member.memberNumber}</div>
                      <div className="text-[10px] text-white/60 mt-0.5">{selectedReg.member.position}</div>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Info label="Status" value={STATUS_META[selectedReg.status]?.label ?? selectedReg.status} />
                  <Info label="Checked-In" value={selectedReg.checkedIn ? formatDateTime(selectedReg.checkedInAt!) : 'Belum'} />
                  <Info label="Waktu Daftar" value={formatDateTime(selectedReg.registeredAt)} />
                  <Info label="Jenjang" value={selectedReg.member.arsiparisLevel ?? '-'} />
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
                        memberNumber: selectedReg.member.memberNumber,
                        name: selectedReg.member.fullName,
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
    </AdminShell>
  )
}

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
                      {r.member.fullName.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-navy dark:text-white truncate">{r.member.fullName}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{r.member.memberNumber}</div>
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
                    <div className="text-xs font-medium text-navy dark:text-white truncate">{r.member.fullName}</div>
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
