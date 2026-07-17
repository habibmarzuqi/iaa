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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet'
import {
  Archive as ArchiveIcon, Search, Plus, FileText, Calendar, Building2,
  User, Lock, Eye, Download, Edit, Pin, History, Shield, FileCheck,
  ArrowRight, Filter,
} from 'lucide-react'
import { formatDate, formatDateTime, timeAgo } from '@/lib/helpers'
import { toast } from 'sonner'

const CATEGORIES = [
  { value: 'SURAT_MASUK', label: 'Surat Masuk', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { value: 'SURAT_KELUAR', label: 'Surat Keluar', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
  { value: 'DOKUMEN_RAPAT', label: 'Dokumen Rapat', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  { value: 'SK', label: 'Surat Keputusan', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  { value: 'AD_ART', label: 'AD / ART', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  { value: 'MOU', label: 'MoU', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  { value: 'DOKUMEN_ORGANISASI', label: 'Dokumen Organisasi', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
  { value: 'FOTO', label: 'Foto', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
  { value: 'VIDEO', label: 'Video', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
]

const CLASSIFICATIONS = [
  { value: 'PUBLIK', label: 'Publik', color: 'border-emerald-400/40 text-emerald-600' },
  { value: 'INTERNAL', label: 'Internal', color: 'border-blue-400/40 text-blue-600' },
  { value: 'RAHASIA', label: 'Rahasia', color: 'border-orange-400/40 text-orange-600' },
  { value: 'SANGAT_RAHASIA', label: 'Sangat Rahasia', color: 'border-red-400/40 text-red-600' },
]

const ACCESS_LEVELS = [
  { value: 'PUBLIK', label: 'Publik (Semua orang)' },
  { value: 'ANGGOTA', label: 'Anggota (Login)' },
  { value: 'PENGURUS', label: 'Pengurus+' },
  { value: 'ADMIN', label: 'Administrator+' },
  { value: 'SUPER_ADMIN', label: 'Super Admin only' },
]

interface ArchiveVersion {
  id: string; version: number; fileName: string | null; fileSize: number | null
  mimeType: string | null; changeLog: string | null; createdAt: string
  uploadedBy: { name: string }
}

interface ArchiveAccess {
  id: string; action: string; createdAt: string; ipAddress: string | null
  user: { name: string; role: string } | null
}

interface Archive {
  id: string; archiveNumber: string; title: string; description: string | null
  category: string; documentDate: string; source: string | null; destination: string | null
  classification: string; accessLevel: string; tags: string | null
  currentVersion: number; isPinned: boolean; createdAt: string
  uploadedBy: { name: string }
  _count?: { versions: number; accesses: number }
  versions?: ArchiveVersion[]
  accesses?: ArchiveAccess[]
}

export function AdminArchivesView() {
  const [archives, setArchives] = React.useState<Archive[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [filterCat, setFilterCat] = React.useState('ALL')
  const [selected, setSelected] = React.useState<Archive | null>(null)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [detailOpen, setDetailOpen] = React.useState(false)

  const load = React.useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (filterCat !== 'ALL') params.set('category', filterCat)
    fetch(`/api/archives?${params}`)
      .then((r) => r.json())
      .then((d) => setArchives(d.archives ?? []))
      .finally(() => setLoading(false))
  }, [search, filterCat])

  React.useEffect(() => { load() }, [load])

  const openDetail = async (a: Archive) => {
    const res = await fetch(`/api/archives?id=${a.id}`)
    const d = await res.json()
    if (d.archive) {
      setSelected(d.archive)
      setDetailOpen(true)
    }
  }

  const catMeta = (c: string) => CATEGORIES.find((x) => x.value === c) ?? CATEGORIES[0]
  const classMeta = (c: string) => CLASSIFICATIONS.find((x) => x.value === c) ?? CLASSIFICATIONS[0]

  return (
    <AdminShell
      activeKey="archives"
      title="Arsip Digital Organisasi"
      subtitle="Kelola surat masuk/keluar, SK, AD/ART, MoU, dan dokumen organisasi dengan versioning & audit log"
      actions={
        <Button onClick={() => setCreateOpen(true)} className="bg-navy-gradient">
          <Plus className="mr-2 h-4 w-4" /> Tambah Arsip
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Arsip', value: archives.length, icon: ArchiveIcon, color: 'from-blue-soft to-blue' },
          { label: 'Dokumen Pinned', value: archives.filter((a) => a.isPinned).length, icon: Pin, color: 'from-gold-soft to-gold' },
          { label: 'Klasifikasi Internal', value: archives.filter((a) => a.classification === 'INTERNAL').length, icon: Lock, color: 'from-purple-400 to-purple-600' },
          { label: 'Akses Publik', value: archives.filter((a) => a.accessLevel === 'PUBLIK').length, icon: Shield, color: 'from-emerald-400 to-emerald-600' },
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

      {/* Filter bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari arsip (nomor, judul, deskripsi)..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="sm:w-[220px]">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Kategori</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Archives list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-navy dark:text-white">
              <ArchiveIcon className="h-5 w-5 text-gold" /> Daftar Arsip
            </span>
            <Badge variant="outline" className="text-xs">{archives.length} dokumen</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : archives.length === 0 ? (
            <div className="text-center py-12">
              <ArchiveIcon className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Belum ada arsip. Klik "Tambah Arsip" untuk membuat.</p>
            </div>
          ) : (
            archives.map((a, i) => {
              const cm = catMeta(a.category)
              const cl = classMeta(a.classification)
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group rounded-lg border border-border bg-card hover:border-gold/40 hover:shadow-premium transition-all cursor-pointer p-4"
                  onClick={() => openDetail(a)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`grid h-11 w-11 flex-shrink-0 place-items-center rounded-lg ${cm.color}`}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-[11px] text-muted-foreground">{a.archiveNumber}</span>
                        <Badge variant="outline" className={`text-[10px] ${cl.color}`}>{cl.label}</Badge>
                        {a.isPinned && (
                          <Badge variant="outline" className="text-[10px] border-gold/40 text-gold bg-gold/5">
                            <Pin className="h-2.5 w-2.5 mr-1" /> Pinned
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px]">v{a.currentVersion}</Badge>
                      </div>
                      <h3 className="font-semibold text-navy dark:text-white group-hover:text-blue-brand transition-colors line-clamp-1">
                        {a.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{a.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(a.documentDate)}</span>
                        {a.source && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {a.source}</span>}
                        <span className="flex items-center gap-1"><History className="h-3 w-3" /> {a._count?.versions ?? 0} versi</span>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {a._count?.accesses ?? 0} akses</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-gold group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto scrollbar-premium">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={`text-[10px] ${catMeta(selected.category).color} border-transparent`}>
                    {catMeta(selected.category).label}
                  </Badge>
                  <Badge variant="outline" className={`text-[10px] ${classMeta(selected.classification).color}`}>
                    <Lock className="h-2.5 w-2.5 mr-1" /> {classMeta(selected.classification).label}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">v{selected.currentVersion}</Badge>
                </div>
                <SheetTitle className="text-left">{selected.title}</SheetTitle>
                <p className="text-xs font-mono text-muted-foreground text-left">{selected.archiveNumber}</p>
              </SheetHeader>

              <div className="mt-4 space-y-4">
                {/* Info grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <Info label="Tanggal Dokumen" value={formatDate(selected.documentDate)} />
                  <Info label="Dibuat" value={timeAgo(selected.createdAt)} />
                  <Info label="Sumber" value={selected.source ?? '-'} />
                  <Info label="Tujuan" value={selected.destination ?? '-'} />
                  <Info label="Akses Level" value={selected.accessLevel} />
                  <Info label="Diunggah oleh" value={selected.uploadedBy.name} />
                </div>

                {selected.description && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Deskripsi</h4>
                    <p className="text-sm text-foreground/80 leading-relaxed">{selected.description}</p>
                  </div>
                )}

                {selected.tags && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Tags</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.tags.split(',').map((t) => (
                        <Badge key={t} variant="outline" className="text-[10px] border-gold/30 text-gold bg-gold/5">#{t.trim()}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Versions */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <History className="h-3.5 w-3.5 text-gold" /> Riwayat Versi ({selected.versions?.length ?? 0})
                  </h4>
                  <div className="space-y-2">
                    {selected.versions?.map((v) => (
                      <div key={v.id} className="rounded-lg border border-border bg-muted/30 p-3">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-[10px] border-navy/30 text-navy dark:text-white">Versi {v.version}</Badge>
                          <span className="text-[10px] text-muted-foreground">{formatDateTime(v.createdAt)}</span>
                        </div>
                        {v.fileName && (
                          <div className="flex items-center gap-2 text-xs">
                            <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="font-mono truncate">{v.fileName}</span>
                            {v.fileSize && <span className="text-muted-foreground">({(v.fileSize / 1024).toFixed(0)} KB)</span>}
                          </div>
                        )}
                        {v.changeLog && <p className="text-xs text-muted-foreground mt-1 italic">"{v.changeLog}"</p>}
                        <div className="text-[10px] text-muted-foreground mt-1">Diunggah oleh: {v.uploadedBy.name}</div>
                        <div className="flex gap-1.5 mt-2">
                          <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => toast.info('Preview PDF akan segera tersedia')}>
                            <Eye className="mr-1 h-3 w-3" /> Preview
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => toast.info('Download dimulai...')}>
                            <Download className="mr-1 h-3 w-3" /> Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit log / Accesses */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-gold" /> Audit Log Akses ({selected.accesses?.length ?? 0})
                  </h4>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto scrollbar-premium">
                    {selected.accesses?.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">Belum ada aktivitas</p>
                    )}
                    {selected.accesses?.map((acc) => (
                      <div key={acc.id} className="flex items-center gap-2 text-xs py-1.5 border-b border-border/50 last:border-0">
                        <div className={`grid h-6 w-6 flex-shrink-0 place-items-center rounded ${
                          acc.action === 'VIEW' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
                          : acc.action === 'DOWNLOAD' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : acc.action === 'UPLOAD' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300'
                          : acc.action === 'EDIT' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300'
                          : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {acc.action === 'VIEW' && <Eye className="h-3 w-3" />}
                          {acc.action === 'DOWNLOAD' && <Download className="h-3 w-3" />}
                          {acc.action === 'UPLOAD' && <Plus className="h-3 w-3" />}
                          {acc.action === 'EDIT' && <Edit className="h-3 w-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-navy dark:text-white">{acc.user?.name ?? 'Guest'}</span>
                          <span className="text-muted-foreground"> · {acc.action}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{timeAgo(acc.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Dialog */}
      <CreateArchiveDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={() => { setCreateOpen(false); load() }} />
    </AdminShell>
  )
}

function CreateArchiveDialog({ open, onOpenChange, onCreated }: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onCreated: () => void
}) {
  const [form, setForm] = React.useState({
    title: '', description: '', category: 'SK', documentDate: new Date().toISOString().slice(0, 10),
    source: '', destination: '', classification: 'PUBLIK', accessLevel: 'PUBLIK', tags: '',
    fileName: '', changeLog: '',
  })
  const [saving, setSaving] = React.useState(false)

  const submit = async () => {
    if (!form.title || !form.category) {
      toast.error('Judul dan kategori wajib diisi')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/archives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const d = await res.json()
      if (!res.ok) {
        toast.error(d.error || 'Gagal membuat arsip')
        return
      }
      toast.success(`Arsip ${d.archive.archiveNumber} berhasil dibuat`)
      onCreated()
      setForm({
        title: '', description: '', category: 'SK', documentDate: new Date().toISOString().slice(0, 10),
        source: '', destination: '', classification: 'PUBLIK', accessLevel: 'PUBLIK', tags: '',
        fileName: '', changeLog: '',
      })
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
            <Plus className="h-5 w-5 text-gold" /> Tambah Arsip Baru
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Arsip *</Label>
            <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Judul dokumen..." />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Kategori *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentDate">Tanggal Dokumen *</Label>
              <Input id="documentDate" type="date" value={form.documentDate} onChange={(e) => setForm({ ...form, documentDate: e.target.value })} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="source">Sumber / Pengirim</Label>
              <Input id="source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Pihak pengirim" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Tujuan</Label>
              <Input id="destination" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="Pihak penerima" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Klasifikasi</Label>
              <Select value={form.classification} onValueChange={(v) => setForm({ ...form, classification: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CLASSIFICATIONS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Access Level</Label>
              <Select value={form.accessLevel} onValueChange={(v) => setForm({ ...form, accessLevel: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACCESS_LEVELS.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi singkat dokumen..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (pisahkan dengan koma)</Label>
            <Input id="tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="sk, pengurus, 2024" />
          </div>

          <div className="rounded-lg bg-muted/50 p-3 space-y-3 border border-border">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Versi Awal Dokumen</div>
            <div className="space-y-2">
              <Label htmlFor="fileName">Nama File</Label>
              <Input id="fileName" value={form.fileName} onChange={(e) => setForm({ ...form, fileName: e.target.value })} placeholder="document.pdf" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="changeLog">Catatan Versi</Label>
              <Input id="changeLog" value={form.changeLog} onChange={(e) => setForm({ ...form, changeLog: e.target.value })} placeholder="Versi awal" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={submit} disabled={saving} className="bg-navy-gradient">
            {saving ? 'Menyimpan...' : 'Simpan Arsip'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
