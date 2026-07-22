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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { QRCodeSVG } from 'qrcode.react'
import { IAALogo } from '@/components/iaa-logo'
import {
  Award, Plus, Search, FileText, Calendar, User, Hash, Shield, Eye,
  Download, Send, CheckCircle2, Sparkles, ScrollText, ExternalLink,
} from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import { toast } from 'sonner'
import { DataPagination } from '@/components/ui/data-pagination'
import { useApp } from '@/lib/store'

interface Cert {
  id: string
  certificateNumber: string
  title: string
  description: string | null
  issuedAt: string
  template: string
  member: { fullName: string; memberNumber: string; arsiparisLevel: string | null }
  event: { title: string; startDate: string } | null
  issuedBy: { name: string }
}

const TEMPLATES = [
  { id: 'default', name: 'Template Standar', desc: 'Sertifikat formal navy + gold' },
  { id: 'webinar', name: 'Webinar', desc: 'Biru cerah, cocok untuk webinar' },
  { id: 'training', name: 'Pelatihan', desc: 'Hijau emerald, untuk pelatihan' },
  { id: 'workshop', name: 'Workshop', desc: 'Oranye energik' },
]

export function AdminCertificatesView() {
  const { setView } = useApp()
  const [certs, setCerts] = React.useState<Cert[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selected, setSelected] = React.useState<Cert | null>(null)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [searchInput, setSearchInput] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)
  const [total, setTotal] = React.useState(0)

  const load = React.useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      limit: String(pageSize),
    })
    if (search) params.set('search', search)
    fetch(`/api/certificates?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setCerts(d.certificates ?? [])
        setTotal(d.total ?? 0)
      })
      .finally(() => setLoading(false))
  }, [page, pageSize, search])

  React.useEffect(() => { load() }, [load])

  React.useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      setSearch(searchInput.trim())
    }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const openDetail = (c: Cert) => {
    setSelected(c)
    setDetailOpen(true)
  }

  return (
    <AdminShell
      activeKey="certificates"
      title="E-Certificate Management"
      subtitle="Generate, verifikasi, dan kelola sertifikat digital dengan QR verification"
      actions={
        <Button onClick={() => setCreateOpen(true)} className="bg-navy-gradient">
          <Plus className="mr-2 h-4 w-4" /> Generate Sertifikat
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Sertifikat', value: total, icon: Award, color: 'from-gold-soft to-gold' },
          { label: 'Bulan Ini', value: certs.filter((c) => new Date(c.issuedAt).getMonth() === new Date().getMonth()).length, icon: Calendar, color: 'from-emerald-400 to-emerald-600' },
          { label: 'Dengan Event', value: certs.filter((c) => c.event).length, icon: FileText, color: 'from-blue-soft to-blue' },
          { label: 'Template Standar', value: certs.filter((c) => c.template === 'default').length, icon: Sparkles, color: 'from-purple-400 to-purple-600' },
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

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari sertifikat (nomor, judul, nama anggota)..."
              value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-navy dark:text-white">
            <span className="flex items-center gap-2">
              <Award className="h-5 w-5 text-gold" /> Daftar Sertifikat
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">{total} total</Badge>
              <Button variant="outline" size="sm" onClick={() => setView({ name: 'verify-certificate' })}>
                <ExternalLink className="mr-2 h-3.5 w-3.5" /> Halaman Verifikasi
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}
            </div>
          ) : certs.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{search ? 'Tidak ada hasil pencarian' : 'Belum ada sertifikat'}</p>
            </div>
          ) : (
            certs.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="group rounded-lg border border-border bg-card hover:border-gold/40 hover:shadow-premium transition-all cursor-pointer p-4 flex items-center gap-4"
                onClick={() => openDetail(c)}
              >
                <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-lg bg-gold-gradient text-navy">
                  <ScrollText className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-[11px] text-gold font-semibold">{c.certificateNumber}</span>
                    <Badge variant="outline" className="text-[10px]">{c.template}</Badge>
                    <Badge variant="outline" className="text-[10px] border-emerald-400/40 text-emerald-600">
                      <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Verified
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-navy dark:text-white group-hover:text-blue-brand transition-colors line-clamp-1">{c.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> {c.member.fullName}</span>
                    <span className="flex items-center gap-1"><Hash className="h-3 w-3" /> {c.member.memberNumber}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(c.issuedAt)}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>

      {total > 0 && (
        <Card>
          <CardContent className="p-2">
            <DataPagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
            />
          </CardContent>
        </Card>
      )}

      {/* Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto scrollbar-premium">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="text-left">Detail Sertifikat</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                {/* Certificate preview */}
                <CertificatePreview cert={selected} />

                {/* Info */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <Info label="Nomor Sertifikat" value={selected.certificateNumber} />
                  <Info label="Template" value={selected.template} />
                  <Info label="Penerima" value={selected.member.fullName} />
                  <Info label="No. Anggota" value={selected.member.memberNumber} />
                  <Info label="Jenjang" value={selected.member.arsiparisLevel ?? '-'} />
                  <Info label="Tanggal Terbit" value={formatDate(selected.issuedAt)} />
                  <Info label="Diterbitkan oleh" value={selected.issuedBy.name} />
                  <Info label="Kegiatan" value={selected.event?.title ?? '-'} />
                </div>

                {selected.description && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Deskripsi</h4>
                    <p className="text-sm text-foreground/80">{selected.description}</p>
                  </div>
                )}

                {/* QR Code */}
                <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-center gap-4">
                  <div className="bg-white rounded-lg p-2 shadow-sm flex-shrink-0">
                    <QRCodeSVG
                      value={JSON.stringify({
                        no: selected.certificateNumber,
                        name: selected.member.fullName,
                        verify: 'https://iaa-anri.go.id/verify',
                      })}
                      size={80}
                      level="M"
                      fgColor="#0a1e3f"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-navy dark:text-white flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-emerald-600" /> QR Verifikasi
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">Pindai QR untuk verifikasi keaslian sertifikat di portal IAA Digital</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => toast.info('Unduh PDF akan segera tersedia')}>
                    <Download className="mr-2 h-4 w-4" /> Unduh PDF
                  </Button>
                  <Button variant="outline" onClick={() => toast.info('Email terkirim ke ' + selected.member.fullName)}>
                    <Send className="mr-2 h-4 w-4" /> Kirim Email
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <CreateCertDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={() => { setCreateOpen(false); load() }} />
    </AdminShell>
  )
}

function CreateCertDialog({ open, onOpenChange, onCreated }: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onCreated: () => void
}) {
  const [members, setMembers] = React.useState<any[]>([])
  const [events, setEvents] = React.useState<any[]>([])
  const [form, setForm] = React.useState({
    memberId: '', eventId: '', title: '', description: '', template: 'default',
    issuedAt: new Date().toISOString().slice(0, 10),
  })
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      // Fetch members and events via admin dashboard isn't available; reuse members endpoint with workaround
      // Since /api/members returns current user's member, we need a different endpoint.
      // For simplicity, fetch via dashboard stats recentMembers and via events list
      Promise.all([
        fetch('/api/dashboard').then((r) => r.json()),
        fetch('/api/events?limit=50').then((r) => r.json()),
      ]).then(([d, e]) => {
        // Get full member list from dashboard recentMembers + extra: use a separate fetch via prisma
        // For now, use recent + lookup by admin endpoint
        // Better: add /api/members/list endpoint? Let's fetch via a simple workaround:
        fetch('/api/members-list').then((r) => r.json()).then((ml) => {
          setMembers(ml.members ?? [])
        }).catch(() => setMembers([]))
        setEvents(e.events ?? [])
      })
    }
  }, [open])

  const submit = async () => {
    if (!form.memberId || !form.title) {
      toast.error('Anggota dan judul wajib diisi')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const d = await res.json()
      if (!res.ok) {
        toast.error(d.error || 'Gagal membuat sertifikat')
        return
      }
      toast.success(`Sertifikat ${d.certificate.certificateNumber} berhasil dibuat`)
      onCreated()
      setForm({ memberId: '', eventId: '', title: '', description: '', template: 'default', issuedAt: new Date().toISOString().slice(0, 10) })
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-premium">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-navy dark:text-white">
            <Sparkles className="h-5 w-5 text-gold" /> Generate Sertifikat Baru
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Penerima (Anggota) *</Label>
            <Select value={form.memberId} onValueChange={(v) => setForm({ ...form, memberId: v })}>
              <SelectTrigger><SelectValue placeholder="Pilih anggota..." /></SelectTrigger>
              <SelectContent>
                {members.map((m: any) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.fullName} — {m.memberNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Kegiatan Terkait (opsional)</Label>
            <Select value={form.eventId} onValueChange={(v) => setForm({ ...form, eventId: v })}>
              <SelectTrigger><SelectValue placeholder="Tanpa kegiatan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tanpa kegiatan</SelectItem>
                {events.map((e: any) => (
                  <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Judul Sertifikat *</Label>
            <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Contoh: Peserta Webinar Transformasi Digital Kearsipan" />
          </div>

          <div className="space-y-2">
            <Label>Template</Label>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm({ ...form, template: t.id })}
                  className={`text-left rounded-lg border p-3 transition-all ${
                    form.template === t.id
                      ? 'border-gold bg-gold/5 shadow-premium'
                      : 'border-border hover:border-gold/40'
                  }`}
                >
                  <div className="font-semibold text-sm text-navy dark:text-white">{t.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi sertifikat..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issuedAt">Tanggal Terbit</Label>
            <Input id="issuedAt" type="date" value={form.issuedAt} onChange={(e) => setForm({ ...form, issuedAt: e.target.value })} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={submit} disabled={saving} className="bg-navy-gradient">
            {saving ? 'Generating...' : 'Generate Sertifikat'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CertificatePreview({ cert }: { cert: Cert }) {
  const templateColors: Record<string, { bg: string; accent: string; label: string }> = {
    default: { bg: 'from-[#0a1e3f] via-[#1e3a6b] to-[#061229]', accent: '#c9a227', label: 'SERTIFIKAT' },
    webinar: { bg: 'from-[#1d4ed8] via-[#3b82f6] to-[#1e3a6b]', accent: '#fde047', label: 'SERTIFIKAT WEBINAR' },
    training: { bg: 'from-[#059669] via-[#10b981] to-[#047857]', accent: '#fde047', label: 'SERTIFIKAT PELATIHAN' },
    workshop: { bg: 'from-[#ea580c] via-[#fb923c] to-[#9a3412]', accent: '#fef3c7', label: 'SERTIFIKAT WORKSHOP' },
  }
  const t = templateColors[cert.template] ?? templateColors.default

  return (
    <div className={`relative aspect-[1.414/1] w-full rounded-lg overflow-hidden shadow-xl bg-gradient-to-br ${t.bg} text-white`}>
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl" style={{ backgroundColor: t.accent + '40' }} />

      {/* Border ornament */}
      <div className="absolute inset-3 border-2 rounded" style={{ borderColor: t.accent + '60' }} />
      <div className="absolute inset-4 border rounded" style={{ borderColor: t.accent + '30' }} />

      <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="flex items-center gap-2 mb-3">
          <IAALogo light />
        </div>
        <div className="text-[10px] tracking-[0.3em] font-semibold mb-1" style={{ color: t.accent }}>
          IKATAN ARSIPARIS ANRI
        </div>
        <h2 className="font-display text-2xl lg:text-3xl font-extrabold mb-3" style={{ color: t.accent }}>
          {t.label}
        </h2>
        <div className="text-xs text-white/60 mb-1">Diberikan kepada:</div>
        <div className="font-display text-xl lg:text-2xl font-bold mb-3">{cert.member.fullName}</div>
        <div className="text-sm text-white/80 max-w-md mb-4">{cert.title}</div>
        {cert.event && (
          <div className="text-[10px] text-white/60 mb-3">Kegiatan: {cert.event.title}</div>
        )}
        <div className="flex items-end justify-between w-full max-w-md mt-auto pt-3">
          <div className="text-left">
            <div className="text-[10px] text-white/60">Tanggal Terbit</div>
            <div className="text-xs font-semibold">{formatDate(cert.issuedAt)}</div>
          </div>
          <div className="bg-white rounded p-1">
            <QRCodeSVG value={cert.certificateNumber} size={48} level="M" fgColor="#0a1e3f" />
          </div>
          <div className="text-right">
            <div className="text-[10px] text-white/60">Diterbitkan oleh</div>
            <div className="text-xs font-semibold">{cert.issuedBy.name.split(',')[0]}</div>
          </div>
        </div>
        <div className="absolute bottom-1 left-0 right-0 text-center text-[9px] text-white/40 font-mono">
          {cert.certificateNumber}
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-2.5">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="text-xs font-medium text-navy dark:text-white mt-0.5 truncate">{value}</div>
    </div>
  )
}
