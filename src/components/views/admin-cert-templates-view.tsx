'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { AdminShell } from '@/components/admin/admin-shell'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { QRCodeSVG } from 'qrcode.react'
import {
  Image as ImageIcon, Plus, Edit2, Trash2, Loader2, Save, Upload,
  Download, Award, Star, X, Sliders, Eye, Target, Sparkles, Check, Move,
} from 'lucide-react'
import { toast } from 'sonner'
import { DataPagination } from '@/components/ui/data-pagination'

interface Template {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  fileUrl: string | null
  layoutConfig: string | null
  isDefault: boolean
  createdAt: string
}

const DEFAULT_CONFIG = {
  recipientName: { x: 50, y: 42, fontSize: 24, fontColor: '#0A1E3F', align: 'center' },
  eventTitle: { x: 50, y: 56, fontSize: 16, fontColor: '#C9A227', align: 'center' },
  certNumber: { x: 50, y: 88, fontSize: 11, fontColor: '#64748B', align: 'center' },
  issueDate: { x: 22, y: 76, fontSize: 11, fontColor: '#1E293B', align: 'left' },
  signatory: { x: 78, y: 76, fontSize: 11, fontColor: '#1E293B', align: 'right' },
  qrCode: { x: 50, y: 74, size: 54, align: 'center' },
}

const LAYOUT_PRESETS = [
  {
    id: 'standard_center',
    name: 'Standar Terpusat (Default IAA)',
    desc: 'Nama & Judul di tengah, QR Code di bawah center',
    config: DEFAULT_CONFIG,
  },
  {
    id: 'dual_signature',
    name: 'Dua Tanda Tangan (ANRI + IAA)',
    desc: 'Dua kolom penandatangan di kiri (Ketua Umum) & kanan (Kepala ANRI)',
    config: {
      recipientName: { x: 50, y: 40, fontSize: 26, fontColor: '#0A1E3F', align: 'center' },
      eventTitle: { x: 50, y: 54, fontSize: 17, fontColor: '#0F172A', align: 'center' },
      certNumber: { x: 50, y: 91, fontSize: 10, fontColor: '#64748B', align: 'center' },
      issueDate: { x: 50, y: 64, fontSize: 11, fontColor: '#334155', align: 'center' },
      signatory: { x: 25, y: 78, fontSize: 11, fontColor: '#0F172A', align: 'center' },
      signatory2: { x: 75, y: 78, fontSize: 11, fontColor: '#0F172A', align: 'center' },
      qrCode: { x: 50, y: 76, size: 52, align: 'center' },
    },
  },
  {
    id: 'minimalist_skp',
    name: 'Formal Pelatihan & SKP Kearsipan',
    desc: 'Nomor sertifikat di kiri atas, QR Code di pojok bawah',
    config: {
      recipientName: { x: 50, y: 38, fontSize: 24, fontColor: '#000000', align: 'center' },
      eventTitle: { x: 50, y: 52, fontSize: 15, fontColor: '#1F2937', align: 'center' },
      certNumber: { x: 10, y: 12, fontSize: 11, fontColor: '#4B5563', align: 'left' },
      issueDate: { x: 80, y: 78, fontSize: 11, fontColor: '#111827', align: 'right' },
      signatory: { x: 80, y: 84, fontSize: 11, fontColor: '#111827', align: 'right' },
      qrCode: { x: 10, y: 80, size: 52, align: 'left' },
    },
  },
]

export function AdminCertTemplatesView() {
  const [templates, setTemplates] = React.useState<Template[]>([])
  const [loading, setLoading] = React.useState(true)
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(12)
  const [total, setTotal] = React.useState(0)
  const [editing, setEditing] = React.useState<Template | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const load = React.useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      limit: String(pageSize),
    })
    fetch(`/api/cert-templates?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setTemplates(d.templates ?? [])
        setTotal(d.total ?? 0)
      })
      .finally(() => setLoading(false))
  }, [page, pageSize])

  React.useEffect(() => { load() }, [load])

  const remove = async (t: Template) => {
    if (!confirm(`Hapus template "${t.name}"?`)) return
    try {
      await fetch(`/api/cert-templates?id=${t.id}`, { method: 'DELETE' })
      toast.success('Template dihapus')
      load()
    } catch { toast.error('Gagal menghapus') }
  }

  const setDefault = async (t: Template) => {
    try {
      await fetch(`/api/cert-templates?id=${t.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      })
      toast.success(`"${t.name}" dijadikan template default`)
      load()
    } catch { toast.error('Gagal set default') }
  }

  return (
    <AdminShell
      activeKey="cert-templates"
      title="Template & Koordinat Sertifikat"
      subtitle="Kelola background template, atur posisi koordinat X & Y untuk nama, judul, nomor sertifikat, dan QR code verifikasi"
      actions={
        <Button onClick={() => { setEditing(null); setDialogOpen(true) }} className="bg-navy-gradient">
          <Plus className="mr-2 h-4 w-4" /> Tambah Template
        </Button>
      }
    >
      {/* Info banner */}
      <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4 flex items-start gap-3 text-xs">
        <Award className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-blue-700 dark:text-blue-300">
          <div className="font-semibold text-sm">Pengaturan Template & Koordinat Elemen Sertifikat</div>
          <p className="leading-relaxed">
            Setiap kegiatan dapat menggunakan template sertifikat sendiri. Anda dapat mengunggah gambar background (rasio A4 landscape 1.414:1) serta menentukan posisi koordinat persentase (X%, Y%), ukuran font, dan perataan teks untuk elemen: <strong>Nama Peserta</strong>, <strong>Judul Kegiatan</strong>, <strong>Nomor Sertifikat</strong>, <strong>Tanda Tangan</strong>, dan <strong>QR Code Verifikasi</strong>.
          </p>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Belum ada template. Klik "Tambah Template" untuk membuat.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <Card className="overflow-hidden hover:shadow-premium transition-shadow group">
                {/* Preview */}
                <div className="relative aspect-[1.414/1] bg-navy-gradient overflow-hidden">
                  <div className="absolute inset-0 bg-grid opacity-30" />
                  {t.imageUrl ? (
                    <img src={t.imageUrl} alt={t.name} className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center">
                      <ImageIcon className="h-12 w-12 text-white/30" />
                    </div>
                  )}

                  {/* Overlay badge info */}
                  {t.isDefault && (
                    <Badge className="absolute top-2 right-2 bg-gold text-navy hover:bg-gold text-[10px]">
                      <Star className="h-2.5 w-2.5 mr-1" /> Default
                    </Badge>
                  )}
                  {t.layoutConfig && (
                    <Badge className="absolute bottom-2 left-2 bg-navy/90 text-gold border-gold/40 text-[9px] backdrop-blur flex items-center gap-1">
                      <Target className="h-2.5 w-2.5 text-gold" /> Customized Coordinates
                    </Badge>
                  )}
                </div>

                {/* Info */}
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-semibold text-sm text-navy dark:text-white">{t.name}</h3>
                  {t.description && <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>}
                  <div className="flex gap-1.5 pt-1">
                    {t.fileUrl && (
                      <a href={t.fileUrl} download>
                        <Button size="sm" variant="outline" className="h-7 text-[10px]">
                          <Download className="mr-1 h-3 w-3" /> Master Format
                        </Button>
                      </a>
                    )}
                    {!t.isDefault && (
                      <Button size="sm" variant="ghost" className="h-7 text-[10px] text-gold" onClick={() => setDefault(t)}>
                        <Star className="mr-1 h-3 w-3" /> Set Default
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="h-7 text-[10px] ml-auto border-gold/40 text-gold" onClick={() => { setEditing(t); setDialogOpen(true) }}>
                      <Edit2 className="mr-1 h-3 w-3" /> Edit Koordinat
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600" onClick={() => remove(t)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

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

      <TemplateDialog open={dialogOpen} onOpenChange={setDialogOpen} template={editing} onSaved={() => { setDialogOpen(false); load() }} />
    </AdminShell>
  )
}

function TemplateDialog({ open, onOpenChange, template, onSaved }: {
  open: boolean; onOpenChange: (o: boolean) => void; template: Template | null; onSaved: () => void
}) {
  const [form, setForm] = React.useState({
    name: '',
    description: '',
    imageUrl: '',
    fileUrl: '',
    isDefault: false,
    layoutConfig: DEFAULT_CONFIG,
  })
  const [saving, setSaving] = React.useState(false)
  const [uploadingImage, setUploadingImage] = React.useState(false)
  const [uploadingFile, setUploadingFile] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState('general')

  const imageInputRef = React.useRef<HTMLInputElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (template) {
      let parsedConfig = DEFAULT_CONFIG
      if (template.layoutConfig) {
        try { parsedConfig = JSON.parse(template.layoutConfig) } catch {}
      }
      setForm({
        name: template.name,
        description: template.description || '',
        imageUrl: template.imageUrl || '',
        fileUrl: template.fileUrl || '',
        isDefault: template.isDefault,
        layoutConfig: parsedConfig,
      })
    } else {
      setForm({
        name: '',
        description: '',
        imageUrl: '',
        fileUrl: '',
        isDefault: false,
        layoutConfig: DEFAULT_CONFIG,
      })
    }
  }, [template, open])

  const handleUpload = async (file: File, type: 'image' | 'file') => {
    if (type === 'image') setUploadingImage(true)
    else setUploadingFile(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/cert-templates/upload', { method: 'POST', body: fd })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal upload'); return }
      if (type === 'image') setForm((f) => ({ ...f, imageUrl: d.url }))
      else setForm((f) => ({ ...f, fileUrl: d.url }))
      toast.success('File terunggah')
    } catch { toast.error('Gagal upload') } finally {
      if (type === 'image') setUploadingImage(false)
      else setUploadingFile(false)
    }
  }

  const applyPreset = (preset: typeof LAYOUT_PRESETS[0]) => {
    setForm((f) => ({ ...f, layoutConfig: preset.config }))
    toast.success(`Preset layout "${preset.name}" diterapkan`)
  }

  const updateElementCoord = (key: string, field: string, value: any) => {
    setForm((f) => ({
      ...f,
      layoutConfig: {
        ...f.layoutConfig,
        [key]: {
          ...(f.layoutConfig as any)[key],
          [field]: value,
        },
      },
    }))
  }

  const submit = async () => {
    if (!form.name) { toast.error('Nama wajib diisi'); return }
    setSaving(true)
    try {
      const url = template ? `/api/cert-templates?id=${template.id}` : '/api/cert-templates'
      const method = template ? 'PATCH' : 'POST'
      const payload = {
        ...form,
        layoutConfig: JSON.stringify(form.layoutConfig),
      }
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal'); return }
      toast.success(template ? 'Template diperbarui' : 'Template dibuat')
      onSaved()
    } catch { toast.error('Terjadi kesalahan') } finally { setSaving(false) }
  }

  const cfg = form.layoutConfig as typeof DEFAULT_CONFIG

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-navy dark:text-white">
            <Award className="h-5 w-5 text-gold" /> {template ? 'Edit Template Sertifikat' : 'Tambah Template Sertifikat'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general" className="flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4" /> Informasi & Background Image
            </TabsTrigger>
            <TabsTrigger value="coordinates" className="flex items-center gap-1.5">
              <Target className="h-4 w-4 text-gold" /> Penempatan Koordinat Elemen
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: General Info & Upload */}
          <TabsContent value="general" className="space-y-4 py-3">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Template *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Contoh: Sertifikat Webinar Transformasi Digital" />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi Kegiatan / Penggunaan</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Digunakan untuk webinar & workshop kearsipan..." />
              </div>
            </div>

            {/* Background Image Upload */}
            <div className="space-y-2">
              <Label>Gambar Background Template (PNG/JPG — Rasio 1.414:1 / A4 Landscape)</Label>
              <div className="flex items-start gap-4">
                <div className="h-28 w-40 rounded-xl border border-border bg-muted overflow-hidden flex-shrink-0 relative shadow-sm">
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt="Template" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-center p-2">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                      <span className="text-[10px] text-muted-foreground">Belum ada gambar</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) handleUpload(f, 'image')
                      e.target.value = ''
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingImage}
                    onClick={() => imageInputRef.current?.click()}
                  >
                    {uploadingImage ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1.5 h-3.5 w-3.5" />}
                    Upload Gambar Background
                  </Button>
                  <p className="text-[10px] text-muted-foreground">
                    Upload gambar background tanpa teks nama/peserta. Teks akan dicetak secara otomatis di atas koordinat yang Anda atur.
                  </p>
                </div>
              </div>
            </div>

            {/* Template File Upload (downloadable) */}
            <div className="space-y-2 pt-2 border-t border-border">
              <Label>File Contoh / Format Master (PDF/PNG — Opsional per kegiatan)</Label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.svg"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleUpload(f, 'file')
                    e.target.value = ''
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingFile}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadingFile ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1.5 h-3.5 w-3.5" />}
                  Upload Master PDF / Format Sertifikat
                </Button>
                {form.fileUrl && (
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> File terlampir
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch checked={form.isDefault} onCheckedChange={(c) => setForm({ ...form, isDefault: c })} />
                <span className="text-sm font-medium">Jadikan sebagai Template Default Utama</span>
              </label>
            </div>
          </TabsContent>

          {/* TAB 2: Coordinate Placement Editor */}
          <TabsContent value="coordinates" className="space-y-4 py-3">
            {/* Presets */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-normal">PILIH PRESET SKEMA KOORDINAT TERUJI:</Label>
              <div className="grid sm:grid-cols-3 gap-2">
                {LAYOUT_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="text-left rounded-lg border border-border hover:border-gold/50 p-2.5 transition-all bg-card hover:bg-gold/5"
                  >
                    <div className="font-semibold text-xs text-navy dark:text-white flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-gold" /> {p.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Visual Canvas & Controls */}
            <div className="grid lg:grid-cols-[1fr_300px] gap-4 items-start">
              {/* Canvas Live Preview Overlay */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-navy dark:text-white">
                  <span>Pratinjau Visual Koordinat (Visual Inspector)</span>
                  <span className="text-[10px] text-muted-foreground">Rasio 1.414:1 (A4 Landscape)</span>
                </div>

                <div className="relative aspect-[1.414/1] w-full rounded-xl overflow-hidden border border-border bg-slate-900 shadow-md">
                  {/* Background */}
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt="Background" className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-soft to-slate-900 opacity-90 flex flex-col items-center justify-center p-4 text-center">
                      <div className="border border-gold/40 rounded-lg p-6 max-w-sm">
                        <div className="text-xs text-gold uppercase tracking-widest font-semibold">IKATAN ARSIPARIS ANRI</div>
                        <div className="text-xl font-bold text-white mt-1">SERTIFIKAT KEGIATAN</div>
                      </div>
                    </div>
                  )}

                  {/* Overlaid Coordinate Elements */}
                  {/* 1. Recipient Name */}
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2 font-bold px-2 py-1 border border-dashed border-emerald-400 bg-emerald-500/20 text-white rounded cursor-move transition-all"
                    style={{
                      left: `${cfg.recipientName.x}%`,
                      top: `${cfg.recipientName.y}%`,
                      fontSize: `${Math.max(10, cfg.recipientName.fontSize * 0.55)}px`,
                      color: cfg.recipientName.fontColor,
                      textAlign: cfg.recipientName.align as any,
                    }}
                  >
                    Dr. H. Ahmad Sudrajat, M.Si (Nama Peserta)
                  </div>

                  {/* 2. Event Title */}
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 border border-dashed border-gold bg-gold/20 text-gold font-semibold rounded transition-all"
                    style={{
                      left: `${cfg.eventTitle.x}%`,
                      top: `${cfg.eventTitle.y}%`,
                      fontSize: `${Math.max(8, cfg.eventTitle.fontSize * 0.55)}px`,
                      color: cfg.eventTitle.fontColor,
                      textAlign: cfg.eventTitle.align as any,
                    }}
                  >
                    Peserta Seminar Nasional Transformasi Kearsipan Digital
                  </div>

                  {/* 3. Certificate Number */}
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2 font-mono text-white/90 px-1 border border-dashed border-blue-400 bg-blue-500/20 rounded"
                    style={{
                      left: `${cfg.certNumber.x}%`,
                      top: `${cfg.certNumber.y}%`,
                      fontSize: `${Math.max(8, cfg.certNumber.fontSize * 0.6)}px`,
                    }}
                  >
                    NO: IAA/2026/EVENT-00129
                  </div>

                  {/* 4. Issue Date */}
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2 text-white/90 px-1 border border-dashed border-purple-400 bg-purple-500/20 rounded"
                    style={{
                      left: `${cfg.issueDate.x}%`,
                      top: `${cfg.issueDate.y}%`,
                      fontSize: `${Math.max(8, cfg.issueDate.fontSize * 0.6)}px`,
                    }}
                  >
                    Jakarta, 29 Juli 2026
                  </div>

                  {/* 5. Signatory */}
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2 text-white/90 px-1 border border-dashed border-amber-400 bg-amber-500/20 rounded text-center"
                    style={{
                      left: `${cfg.signatory.x}%`,
                      top: `${cfg.signatory.y}%`,
                      fontSize: `${Math.max(8, cfg.signatory.fontSize * 0.6)}px`,
                    }}
                  >
                    Pengurus Pusat IAA
                  </div>

                  {/* 6. QR Code */}
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded shadow"
                    style={{
                      left: `${cfg.qrCode.x}%`,
                      top: `${cfg.qrCode.y}%`,
                    }}
                  >
                    <QRCodeSVG value="https://iaa-digital.org/verify" size={cfg.qrCode.size * 0.4} />
                  </div>
                </div>
              </div>

              {/* Sliders & Coordinates Controls */}
              <div className="space-y-4 bg-muted/40 p-3 rounded-xl border border-border text-xs max-h-[420px] overflow-y-auto">
                <div className="font-semibold text-navy dark:text-white flex items-center gap-1">
                  <Sliders className="h-3.5 w-3.5 text-gold" /> Atur Koordinat Persentase (%)
                </div>

                {/* Recipient Name Controls */}
                <div className="space-y-2 p-2 bg-background rounded-lg border border-border">
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                    <span>Nama Peserta</span>
                    <span>X: {cfg.recipientName.x}% | Y: {cfg.recipientName.y}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px]">Posisi X (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={cfg.recipientName.x}
                        onChange={(e) => updateElementCoord('recipientName', 'x', Number(e.target.value))}
                        className="h-7 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px]">Posisi Y (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={cfg.recipientName.y}
                        onChange={(e) => updateElementCoord('recipientName', 'y', Number(e.target.value))}
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px]">Ukuran Font (px)</Label>
                      <Input
                        type="number"
                        min="12"
                        max="48"
                        value={cfg.recipientName.fontSize}
                        onChange={(e) => updateElementCoord('recipientName', 'fontSize', Number(e.target.value))}
                        className="h-7 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px]">Warna Teks</Label>
                      <Input
                        type="color"
                        value={cfg.recipientName.fontColor || '#0A1E3F'}
                        onChange={(e) => updateElementCoord('recipientName', 'fontColor', e.target.value)}
                        className="h-7 p-0.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Event Title Controls */}
                <div className="space-y-2 p-2 bg-background rounded-lg border border-border">
                  <div className="font-semibold text-gold flex items-center justify-between">
                    <span>Judul Kegiatan</span>
                    <span>X: {cfg.eventTitle.x}% | Y: {cfg.eventTitle.y}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px]">Posisi X (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={cfg.eventTitle.x}
                        onChange={(e) => updateElementCoord('eventTitle', 'x', Number(e.target.value))}
                        className="h-7 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px]">Posisi Y (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={cfg.eventTitle.y}
                        onChange={(e) => updateElementCoord('eventTitle', 'y', Number(e.target.value))}
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Cert Number & QR Code */}
                <div className="space-y-2 p-2 bg-background rounded-lg border border-border">
                  <div className="font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-between">
                    <span>QR Code & Nomor Sertifikat</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px]">QR Code X (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={cfg.qrCode.x}
                        onChange={(e) => updateElementCoord('qrCode', 'x', Number(e.target.value))}
                        className="h-7 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px]">QR Code Y (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={cfg.qrCode.y}
                        onChange={(e) => updateElementCoord('qrCode', 'y', Number(e.target.value))}
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={submit} disabled={saving} className="bg-navy-gradient">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? 'Menyimpan...' : 'Simpan Template & Koordinat'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
