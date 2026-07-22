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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Image as ImageIcon, Plus, Edit2, Trash2, Loader2, Save, Upload,
  Download, Award, Check, FileText, Star, X,
} from 'lucide-react'
import { toast } from 'sonner'
import { DataPagination } from '@/components/ui/data-pagination'

interface Template {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  fileUrl: string | null
  isDefault: boolean
  createdAt: string
}

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
      title="Template Sertifikat"
      subtitle="Kelola template sertifikat: upload background image, download contoh format, set template default"
      actions={
        <Button onClick={() => { setEditing(null); setDialogOpen(true) }} className="bg-navy-gradient">
          <Plus className="mr-2 h-4 w-4" /> Tambah Template
        </Button>
      }
    >
      {/* Info banner */}
      <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-3 flex items-start gap-2 text-xs">
        <Award className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-blue-700 dark:text-blue-300">
          <strong>Template sertifikat</strong> digunakan saat generate e-certificate. Upload gambar background (PNG/JPG, rasio 1.414:1) dan file template yang bisa di-download sebagai contoh format.
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
              <Card className="overflow-hidden hover:shadow-premium transition-shadow">
                {/* Preview */}
                <div className="relative aspect-[1.414/1] bg-navy-gradient overflow-hidden">
                  <div className="absolute inset-0 bg-grid opacity-30" />
                  {t.imageUrl ? (
                    <img src={t.imageUrl} alt={t.name} className="absolute inset-0 h-full w-full object-cover opacity-80" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center">
                      <ImageIcon className="h-12 w-12 text-white/30" />
                    </div>
                  )}
                  {t.isDefault && (
                    <Badge className="absolute top-2 right-2 bg-gold text-navy hover:bg-gold text-[10px]">
                      <Star className="h-2.5 w-2.5 mr-1" /> Default
                    </Badge>
                  )}
                </div>
                {/* Info */}
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-semibold text-sm text-navy dark:text-white">{t.name}</h3>
                  {t.description && <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>}
                  <div className="flex gap-1.5">
                    {t.fileUrl && (
                      <a href={t.fileUrl} download>
                        <Button size="sm" variant="outline" className="h-7 text-[10px]">
                          <Download className="mr-1 h-3 w-3" /> Download Contoh
                        </Button>
                      </a>
                    )}
                    {!t.isDefault && (
                      <Button size="sm" variant="ghost" className="h-7 text-[10px] text-gold" onClick={() => setDefault(t)}>
                        <Star className="mr-1 h-3 w-3" /> Set Default
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 ml-auto" onClick={() => { setEditing(t); setDialogOpen(true) }}>
                      <Edit2 className="h-3.5 w-3.5" />
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
  const [form, setForm] = React.useState({ name: '', description: '', imageUrl: '', fileUrl: '', isDefault: false })
  const [saving, setSaving] = React.useState(false)
  const [uploadingImage, setUploadingImage] = React.useState(false)
  const [uploadingFile, setUploadingFile] = React.useState(false)

  React.useEffect(() => {
    if (template) {
      setForm({ name: template.name, description: template.description || '', imageUrl: template.imageUrl || '', fileUrl: template.fileUrl || '', isDefault: template.isDefault })
    } else {
      setForm({ name: '', description: '', imageUrl: '', fileUrl: '', isDefault: false })
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

  const submit = async () => {
    if (!form.name) { toast.error('Nama wajib diisi'); return }
    setSaving(true)
    try {
      const url = template ? `/api/cert-templates?id=${template.id}` : '/api/cert-templates'
      const method = template ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal'); return }
      toast.success(template ? 'Template diperbarui' : 'Template dibuat')
      onSaved()
    } catch { toast.error('Terjadi kesalahan') } finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-navy dark:text-white">
            <Award className="h-5 w-5 text-gold" /> {template ? 'Edit Template' : 'Tambah Template Sertifikat'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nama Template *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Template Default / Webinar / Workshop" />
          </div>
          <div className="space-y-2">
            <Label>Deskripsi</Label>
            <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi template..." />
          </div>

          {/* Background Image Upload */}
          <div className="space-y-2">
            <Label>Background Image (rasio 1.414:1 / A4 landscape)</Label>
            <div className="flex items-start gap-3">
              <div className="h-20 w-28 rounded-lg border border-border bg-muted overflow-hidden flex-shrink-0">
                {form.imageUrl ? (
                  <img src={form.imageUrl} alt="Template" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full grid place-items-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <input type="file" accept="image/*" className="hidden" id="tpl-image-upload" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, 'image') }} />
                <label htmlFor="tpl-image-upload">
                  <Button type="button" variant="outline" size="sm" disabled={uploadingImage} className="cursor-pointer">
                    {uploadingImage ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1 h-3.5 w-3.5" />}
                    Upload Image
                  </Button>
                </label>
                {form.imageUrl && (
                  <Button type="button" variant="ghost" size="sm" className="text-red-600 ml-1" onClick={() => setForm({ ...form, imageUrl: '' })}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Template File Upload (downloadable) */}
          <div className="space-y-2">
            <Label>File Template (PDF/PNG — untuk download contoh format)</Label>
            <div className="flex items-center gap-3">
              <input type="file" accept=".pdf,.png,.jpg,.jpeg,.svg" className="hidden" id="tpl-file-upload" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, 'file') }} />
              <label htmlFor="tpl-file-upload">
                <Button type="button" variant="outline" size="sm" disabled={uploadingFile} className="cursor-pointer">
                  {uploadingFile ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1 h-3.5 w-3.5" />}
                  Upload File
                </Button>
              </label>
              {form.fileUrl && (
                <>
                  <a href={form.fileUrl} download>
                    <Button type="button" variant="ghost" size="sm">
                      <Download className="mr-1 h-3.5 w-3.5" /> Download
                    </Button>
                  </a>
                  <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => setForm({ ...form, fileUrl: '' })}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <Switch checked={form.isDefault} onCheckedChange={(c) => setForm({ ...form, isDefault: c })} />
            <span className="text-sm">Jadikan template default</span>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={submit} disabled={saving} className="bg-navy-gradient">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
