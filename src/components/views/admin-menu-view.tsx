'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { AdminShell } from '@/components/admin/admin-shell'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  ListOrdered, Plus, Eye, EyeOff, Trash2, Edit2, GripVertical,
  ChevronRight, ChevronDown, Loader2, Save, ExternalLink, Menu as MenuIcon,
} from 'lucide-react'
import { toast } from 'sonner'

interface MenuItem {
  id: string
  label: string
  labelKey: string | null
  view: string | null
  url: string | null
  icon: string | null
  parentId: string | null
  order: number
  isVisible: boolean
  isExternal: boolean
  isActive: boolean
  children?: MenuItem[]
}

const VIEW_OPTIONS = [
  { value: 'public', label: 'Beranda' },
  { value: 'about', label: 'Tentang IAA' },
  { value: 'organization', label: 'Struktur Pengurus' },
  { value: 'news-list', label: 'Berita & Artikel' },
  { value: 'event-list', label: 'Agenda Kegiatan' },
  { value: 'library', label: 'Digital Library' },
  { value: 'gallery', label: 'Galeri Foto' },
  { value: 'faq', label: 'FAQ' },
  { value: 'contact', label: 'Kontak' },
  { value: 'chat', label: 'AI Chatbot' },
  { value: 'verify-certificate', label: 'Verifikasi Sertifikat' },
]

const ICON_OPTIONS = ['Home', 'Info', 'Users', 'FileText', 'Calendar', 'BookOpen', 'Image', 'HelpCircle', 'Mail', 'Globe']

export function AdminMenuView() {
  const [menus, setMenus] = React.useState<MenuItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editing, setEditing] = React.useState<MenuItem | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set())

  const load = React.useCallback(() => {
    setLoading(true)
    fetch('/api/menu?admin=true')
      .then((r) => r.json())
      .then((d) => {
        setMenus(d.menus ?? [])
        // Auto-expand all parents
        const exp = new Set<string>()
        for (const m of d.menus ?? []) {
          if (m.children && m.children.length > 0) exp.add(m.id)
        }
        setExpanded(exp)
      })
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => { load() }, [load])

  const toggleVisibility = async (item: MenuItem) => {
    try {
      await fetch(`/api/menu?id=${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !item.isVisible }),
      })
      toast.success(`Menu "${item.label}" ${!item.isVisible ? 'ditampilkan' : 'disembunyikan'}`)
      load()
    } catch { toast.error('Gagal mengubah visibility') }
  }

  const moveItem = async (item: MenuItem, direction: 'up' | 'down', siblings: MenuItem[]) => {
    const currentIndex = siblings.findIndex((s) => s.id === item.id)
    if (direction === 'up' && currentIndex === 0) return
    if (direction === 'down' && currentIndex === siblings.length - 1) return

    const newItems = [...siblings]
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    ;[newItems[currentIndex], newItems[swapIndex]] = [newItems[swapIndex], newItems[currentIndex]]

    // Send reorder
    const reorderData = newItems.map((item, idx) => ({ id: item.id, order: idx, parentId: item.parentId }))
    try {
      await fetch('/api/menu?reorder=true', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: reorderData }),
      })
      load()
    } catch { toast.error('Gagal mengurutkan menu') }
  }

  const deleteItem = async (item: MenuItem) => {
    if (!confirm(`Hapus menu "${item.label}"? ${item.children?.length ? 'Semua submenu juga akan dihapus.' : ''}`)) return
    try {
      await fetch(`/api/menu?id=${item.id}`, { method: 'DELETE' })
      toast.success('Menu dihapus')
      load()
    } catch { toast.error('Gagal menghapus menu') }
  }

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openCreate = (parentId?: string) => {
    setEditing({ id: '', label: '', labelKey: '', view: '', url: '', icon: '', parentId: parentId || null, order: 0, isVisible: true, isExternal: false, isActive: true } as MenuItem)
    setDialogOpen(true)
  }

  const openEdit = (item: MenuItem) => {
    setEditing(item)
    setDialogOpen(true)
  }

  const renderItem = (item: MenuItem, siblings: MenuItem[], level: number = 0) => {
    const isExpanded = expanded.has(item.id)
    const hasChildren = item.children && item.children.length > 0

    return (
      <div key={item.id} style={{ marginLeft: level * 24 }}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex items-center gap-2 p-3 rounded-lg border bg-card hover:shadow-sm transition-all ${
            !item.isVisible ? 'opacity-50' : ''
          }`}
        >
          {/* Expand/collapse */}
          {hasChildren ? (
            <button onClick={() => toggleExpand(item.id)} className="grid h-6 w-6 place-items-center rounded hover:bg-accent">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <div className="w-6" />
          )}

          {/* Drag handle (visual only) */}
          <GripVertical className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />

          {/* Label */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-navy dark:text-white">{item.label}</span>
              {hasChildren && <Badge variant="outline" className="text-[9px]">{item.children!.length} submenu</Badge>}
              {item.isExternal && <Badge variant="outline" className="text-[9px] border-blue-400/40 text-blue-600">External</Badge>}
              {!item.isVisible && <Badge variant="outline" className="text-[9px] border-slate-400/40 text-slate-500"><EyeOff className="h-2.5 w-2.5 mr-0.5" />Hidden</Badge>}
            </div>
            {item.view && <span className="text-[10px] text-muted-foreground font-mono">{item.view}</span>}
            {item.url && <span className="text-[10px] text-muted-foreground font-mono truncate">{item.url}</span>}
          </div>

          {/* Move up/down */}
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => moveItem(item, 'up', siblings)}
              disabled={siblings.findIndex((s) => s.id === item.id) === 0}
              className="text-muted-foreground hover:text-navy dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronDown className="h-3.5 w-3.5 rotate-180" />
            </button>
            <button
              onClick={() => moveItem(item, 'down', siblings)}
              disabled={siblings.findIndex((s) => s.id === item.id) === siblings.length - 1}
              className="text-muted-foreground hover:text-navy dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Visibility toggle */}
          <Switch
            checked={item.isVisible}
            onCheckedChange={() => toggleVisibility(item)}
          />

          {/* Add submenu (only for parents) */}
          {level === 0 && (
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openCreate(item.id)} title="Tambah submenu">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* Edit */}
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(item)} title="Edit">
            <Edit2 className="h-3.5 w-3.5" />
          </Button>

          {/* Delete */}
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600" onClick={() => deleteItem(item)} title="Hapus">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </motion.div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderItem(child, item.children!, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <AdminShell
      activeKey="menu"
      title="Manajemen Menu"
      subtitle="Atur menu header website publik: tampilkan/sembunyikan, urutan, tambah/hapus menu dan submenu"
      actions={
        <Button onClick={() => openCreate()} className="bg-navy-gradient">
          <Plus className="mr-2 h-4 w-4" /> Tambah Menu
        </Button>
      }
    >
      {/* Info banner */}
      <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-3 flex items-start gap-2 text-xs">
        <MenuIcon className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-blue-700 dark:text-blue-300">
          <strong>Tips:</strong> Toggle switch untuk menampilkan/sembunyikan menu. Gunakan tombol ↑↓ untuk mengubah urutan.
          Menu dengan submenu akan otomatis menjadi dropdown di header website publik.
        </div>
      </div>

      {/* Menu list */}
      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}
            </div>
          ) : menus.length === 0 ? (
            <div className="text-center py-12">
              <ListOrdered className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Belum ada menu. Klik "Tambah Menu" untuk membuat.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {menus.map((item) => renderItem(item, menus))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit/Create dialog */}
      <MenuDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editing}
        parentMenus={menus}
        onSaved={() => { setDialogOpen(false); load() }}
      />
    </AdminShell>
  )
}

function MenuDialog({ open, onOpenChange, item, parentMenus, onSaved }: {
  open: boolean
  onOpenChange: (o: boolean) => void
  item: MenuItem | null
  parentMenus: MenuItem[]
  onSaved: () => void
}) {
  const [form, setForm] = React.useState({
    label: '', labelKey: '', view: '', url: '', icon: '', isExternal: false, parentId: '',
  })
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (item) {
      setForm({
        label: item.label || '',
        labelKey: item.labelKey || '',
        view: item.view || '',
        url: item.url || '',
        icon: item.icon || '',
        isExternal: item.isExternal || false,
        parentId: item.parentId || '',
      })
    }
  }, [item, open])

  const submit = async () => {
    if (!form.label) { toast.error('Label wajib diisi'); return }
    if (form.isExternal && !form.url) { toast.error('URL wajib diisi untuk menu external'); return }
    setSaving(true)
    try {
      const payload = {
        label: form.label,
        labelKey: form.labelKey || null,
        view: form.isExternal ? null : (form.view || null),
        url: form.isExternal ? form.url : null,
        icon: form.icon || null,
        isExternal: form.isExternal,
        parentId: form.parentId || null,
      }
      const url = item?.id ? `/api/menu?id=${item.id}` : '/api/menu'
      const method = item?.id ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal menyimpan'); return }
      toast.success(item?.id ? 'Menu diperbarui' : 'Menu dibuat')
      onSaved()
    } catch { toast.error('Terjadi kesalahan') } finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-navy dark:text-white">
            <ListOrdered className="h-5 w-5 text-gold" /> {item?.id ? 'Edit Menu' : 'Tambah Menu Baru'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Label Menu *</Label>
            <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Beranda, Tentang, dll" />
          </div>
          <div className="space-y-2">
            <Label>i18n Key (opsional)</Label>
            <Input value={form.labelKey} onChange={(e) => setForm({ ...form, labelKey: e.target.value })} placeholder="nav.beranda" className="font-mono text-xs" />
            <p className="text-[10px] text-muted-foreground">Jika diisi, label akan menggunakan terjemahan dari i18n</p>
          </div>
          <div className="space-y-2">
            <Label>Parent Menu (opsional)</Label>
            <Select value={form.parentId} onValueChange={(v) => setForm({ ...form, parentId: v === 'none' ? '' : v })}>
              <SelectTrigger><SelectValue placeholder="Top-level menu" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Top-level menu</SelectItem>
                {parentMenus.map((m) => <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isExternal} onChange={(e) => setForm({ ...form, isExternal: e.target.checked })} className="rounded" />
            <span className="text-sm">External Link (buka URL di tab baru)</span>
          </label>
          {form.isExternal ? (
            <div className="space-y-2">
              <Label>URL *</Label>
              <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Internal View</Label>
              <Select value={form.view} onValueChange={(v) => setForm({ ...form, view: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Pilih halaman..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Tidak ada (parent dropdown) —</SelectItem>
                  {VIEW_OPTIONS.map((v) => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Icon (opsional)</Label>
            <Select value={form.icon} onValueChange={(v) => setForm({ ...form, icon: v === 'none' ? '' : v })}>
              <SelectTrigger><SelectValue placeholder="Pilih icon..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Tidak ada icon —</SelectItem>
                {ICON_OPTIONS.map((ic) => <SelectItem key={ic} value={ic}>{ic}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
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
