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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Users, Plus, Edit2, Trash2, Loader2, Save, Search, Shield,
  ChevronRight, X, UserPlus, UserMinus, Lock, Eye, EyeOff,
} from 'lucide-react'
import { toast } from 'sonner'
import { DataPagination } from '@/components/ui/data-pagination'

interface Group {
  id: string
  name: string
  description: string | null
  color: string
  isActive: boolean
  createdAt: string
  _count?: { users: number; permissions: number }
  users?: { id: string; user: { id: string; name: string; email: string; role: string; avatar: string | null } }[]
  permissions?: Permission[]
}

interface Permission {
  id?: string
  module: string
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

interface AdminModule {
  key: string
  label: string
}

const COLOR_OPTIONS = [
  { value: 'blue', label: 'Biru', className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' },
  { value: 'emerald', label: 'Hijau', className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' },
  { value: 'gold', label: 'Emas', className: 'bg-gold/10 text-gold border-gold/30' },
  { value: 'purple', label: 'Ungu', className: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' },
  { value: 'orange', label: 'Oranye', className: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800' },
  { value: 'rose', label: 'Merah Muda', className: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800' },
]

function colorClass(color: string) {
  return COLOR_OPTIONS.find((c) => c.value === color)?.className || COLOR_OPTIONS[0].className
}

export function AdminGroupsView() {
  const [groups, setGroups] = React.useState<Group[]>([])
  const [modules, setModules] = React.useState<AdminModule[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [editing, setEditing] = React.useState<Group | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [selectedGroupId, setSelectedGroupId] = React.useState<string | null>(null)

  const load = React.useCallback(() => {
    setLoading(true)
    fetch('/api/groups')
      .then((r) => r.json())
      .then((d) => {
        setGroups(d.groups ?? [])
        setModules(d.modules ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => { load() }, [load])

  const filtered = groups.filter((g) => {
    if (!search) return true
    const s = search.toLowerCase()
    return g.name.toLowerCase().includes(s) || (g.description || '').toLowerCase().includes(s)
  })

  const remove = async (g: Group) => {
    if (!confirm(`Hapus grup "${g.name}"?\n\nSemua anggota & permission grup ini akan dihapus.`)) return
    try {
      const res = await fetch(`/api/groups?id=${g.id}`, { method: 'DELETE' })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal menghapus'); return }
      toast.success('Grup dihapus')
      load()
    } catch { toast.error('Terjadi kesalahan') }
  }

  const openCreate = () => { setEditing(null); setDialogOpen(true) }
  const openEdit = (g: Group) => { setEditing(g); setDialogOpen(true) }

  return (
    <AdminShell
      activeKey="groups"
      title="Manajemen Grup Pengguna"
      subtitle="Buat grup (Humas, Publikasi, Organisasi) dan atur akses modul per grup dengan checklist permission"
      actions={
        <Button onClick={openCreate} className="bg-navy-gradient">
          <Plus className="mr-2 h-4 w-4" /> Tambah Grup
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Grup', value: groups.length, color: 'from-blue-soft to-blue' },
          { label: 'Grup Aktif', value: groups.filter((g) => g.isActive).length, color: 'from-emerald-400 to-emerald-600' },
          { label: 'Grup Nonaktif', value: groups.filter((g) => !g.isActive).length, color: 'from-slate-400 to-slate-600' },
          { label: 'Total Anggota', value: groups.reduce((sum, g) => sum + (g._count?.users || 0), 0), color: 'from-gold-soft to-gold' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className={`h-2 w-full rounded-full bg-gradient-to-r ${s.color} mb-2`} />
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
            <Input placeholder="Cari nama grup atau deskripsi..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {/* Groups grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">{search ? 'Tidak ada hasil pencarian' : 'Belum ada grup. Buat grup pertama Anda.'}</p>
            <Button onClick={openCreate} className="bg-navy-gradient">
              <Plus className="mr-2 h-4 w-4" /> Tambah Grup
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`h-full ${!g.isActive ? 'opacity-60' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] ${colorClass(g.color)}`}>{g.name}</Badge>
                        {!g.isActive && (
                          <Badge variant="outline" className="text-[9px] border-slate-400/40 text-slate-500">
                            <EyeOff className="h-2.5 w-2.5 mr-1" /> Nonaktif
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-navy dark:text-white">{g.name}</h3>
                      {g.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{g.description}</p>}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setSelectedGroupId(g.id)} title="Kelola Anggota & Permission">
                        <Shield className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(g)} title="Edit">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600" onClick={() => remove(g)} title="Hapus">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-muted/40 p-2.5">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Anggota</div>
                      <div className="font-bold text-navy dark:text-white text-lg">{g._count?.users || 0}</div>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-2.5">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Modul Diakses</div>
                      <div className="font-bold text-navy dark:text-white text-lg">{g._count?.permissions || 0}</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-3"
                    onClick={() => setSelectedGroupId(g.id)}
                  >
                    <Shield className="mr-2 h-3.5 w-3.5" /> Kelola Anggota & Permission
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Group Dialog */}
      <GroupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        group={editing}
        onSaved={() => { setDialogOpen(false); load() }}
      />

      {/* Manage Group Detail (Members + Permissions) */}
      {selectedGroupId && (
        <ManageGroupDialog
          groupId={selectedGroupId}
          modules={modules}
          onOpenChange={(o) => { if (!o) setSelectedGroupId(null) }}
          onChanged={load}
        />
      )}
    </AdminShell>
  )
}

// ============ Group Create/Edit Dialog ============

function GroupDialog({ open, onOpenChange, group, onSaved }: {
  open: boolean
  onOpenChange: (o: boolean) => void
  group: Group | null
  onSaved: () => void
}) {
  const [form, setForm] = React.useState({
    name: '',
    description: '',
    color: 'blue',
    isActive: true,
  })
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (group) {
      setForm({
        name: group.name,
        description: group.description || '',
        color: group.color,
        isActive: group.isActive,
      })
    } else {
      setForm({ name: '', description: '', color: 'blue', isActive: true })
    }
  }, [group, open])

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error('Nama grup wajib diisi')
      return
    }
    setSaving(true)
    try {
      const url = group ? `/api/groups?id=${group.id}` : '/api/groups'
      const method = group ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal menyimpan'); return }
      toast.success(group ? 'Grup diperbarui' : 'Grup dibuat')
      onSaved()
    } catch { toast.error('Terjadi kesalahan') } finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-navy dark:text-white">
            <Users className="h-5 w-5 text-gold" /> {group ? 'Edit Grup' : 'Tambah Grup Baru'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nama Grup *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="contoh: Humas, Publikasi, Organisasi"
            />
          </div>
          <div className="space-y-2">
            <Label>Deskripsi</Label>
            <Textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Deskripsi singkat grup ini..."
            />
          </div>
          <div className="space-y-2">
            <Label>Warna Badge</Label>
            <Select value={form.color} onValueChange={(v) => setForm({ ...form, color: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {COLOR_OPTIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <span className={`inline-block h-3 w-3 rounded-full mr-2 border ${c.className}`} />
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border p-3">
            <Switch
              checked={form.isActive}
              onCheckedChange={(c) => setForm({ ...form, isActive: c })}
            />
            <Label className="text-sm cursor-pointer">Grup Aktif</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={submit} disabled={saving} className="bg-navy-gradient">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {group ? 'Simpan' : 'Buat Grup'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============ Manage Group Dialog (Members + Permissions) ============

function ManageGroupDialog({ groupId, modules, onOpenChange, onChanged }: {
  groupId: string
  modules: AdminModule[]
  onOpenChange: (o: boolean) => void
  onChanged: () => void
}) {
  const [group, setGroup] = React.useState<Group | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [tab, setTab] = React.useState<'permissions' | 'members'>('permissions')
  const [permissions, setPermissions] = React.useState<Record<string, Permission>>({})
  const [savingPerms, setSavingPerms] = React.useState(false)
  const [searchUser, setSearchUser] = React.useState('')
  const [allUsers, setAllUsers] = React.useState<{ id: string; name: string; email: string; role: string }[]>([])
  const [addMemberOpen, setAddMemberOpen] = React.useState(false)

  const load = React.useCallback(() => {
    setLoading(true)
    fetch(`/api/groups?id=${groupId}`)
      .then((r) => r.json())
      .then((d) => {
        setGroup(d.group)
        const perms: Record<string, Permission> = {}
        for (const p of d.group?.permissions || []) {
          perms[p.module] = p
        }
        setPermissions(perms)
      })
      .finally(() => setLoading(false))
  }, [groupId])

  React.useEffect(() => { load() }, [load])

  // Load all users for member picker
  React.useEffect(() => {
    if (tab === 'members') {
      fetch('/api/members-admin?limit=200')
        .then((r) => r.json())
        .then((d) => {
          // members-admin returns members with user.email/role
          const users = (d.members || []).map((m: any) => ({
            id: m.user ? m.userId : m.id,
            name: m.fullName || m.name,
            email: m.user?.email || m.email || '',
            role: m.user?.role || 'ANGGOTA',
          }))
          setAllUsers(users)
        })
        .catch(() => {})
    }
  }, [tab])

  const togglePerm = (module: string, field: 'canView' | 'canCreate' | 'canEdit' | 'canDelete', value: boolean) => {
    setPermissions((prev) => {
      const existing = prev[module] || { module, canView: false, canCreate: false, canEdit: false, canDelete: false }
      // If turning on create/edit/delete, automatically turn on view
      const updated = { ...existing, [field]: value }
      if ((field === 'canCreate' || field === 'canEdit' || field === 'canDelete') && value) {
        updated.canView = true
      }
      // If turning off view, turn off all others
      if (field === 'canView' && !value) {
        updated.canCreate = false
        updated.canEdit = false
        updated.canDelete = false
      }
      return { ...prev, [module]: updated }
    })
  }

  const savePermissions = async () => {
    setSavingPerms(true)
    try {
      const perms = Object.values(permissions).filter((p) => p.canView || p.canCreate || p.canEdit || p.canDelete)
      const res = await fetch(`/api/groups?id=${groupId}&action=setPermissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: perms }),
      })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal menyimpan'); return }
      toast.success(`${perms.length} permission disimpan`)
      onChanged()
      load()
    } catch { toast.error('Terjadi kesalahan') } finally { setSavingPerms(false) }
  }

  const addMember = async (userId: string) => {
    try {
      const res = await fetch(`/api/groups?id=${groupId}&action=addMember`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal menambah'); return }
      toast.success('Anggota ditambahkan')
      load()
      onChanged()
    } catch { toast.error('Terjadi kesalahan') }
  }

  const removeMember = async (userId: string) => {
    try {
      const res = await fetch(`/api/groups?id=${groupId}&action=removeMember`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal menghapus'); return }
      toast.success('Anggota dihapus')
      load()
      onChanged()
    } catch { toast.error('Terjadi kesalahan') }
  }

  const memberIds = new Set((group?.users || []).map((u) => u.user.id))
  const availableUsers = allUsers.filter((u) => !memberIds.has(u.id) && (
    !searchUser || u.name.toLowerCase().includes(searchUser.toLowerCase()) || u.email.toLowerCase().includes(searchUser.toLowerCase())
  ))

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-premium">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-navy dark:text-white">
            <Shield className="h-5 w-5 text-gold" />
            Kelola Grup: {group?.name}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-10 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-navy mb-2" />
            <p className="text-sm text-muted-foreground">Memuat...</p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-border pb-2">
              <Button
                size="sm"
                variant={tab === 'permissions' ? 'default' : 'ghost'}
                className={tab === 'permissions' ? 'bg-navy-gradient' : ''}
                onClick={() => setTab('permissions')}
              >
                <Lock className="mr-2 h-3.5 w-3.5" /> Permission Modul
              </Button>
              <Button
                size="sm"
                variant={tab === 'members' ? 'default' : 'ghost'}
                className={tab === 'members' ? 'bg-navy-gradient' : ''}
                onClick={() => setTab('members')}
              >
                <Users className="mr-2 h-3.5 w-3.5" /> Anggota ({group?.users?.length || 0})
              </Button>
            </div>

            {/* ===== Permissions tab ===== */}
            {tab === 'permissions' && (
              <div className="space-y-3">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 text-xs text-blue-700 dark:text-blue-300">
                  Centang <strong>View</strong> untuk memberi akses lihat modul. <strong>Create/Edit/Delete</strong> untuk operasi CRUD.
                  Saat Create/Edit/Delete diaktifkan, View otomatis aktif. Saat View dimatikan, semua ikut mati.
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-2 font-semibold text-navy dark:text-white">Modul</th>
                        <th className="text-center py-2 px-2 font-semibold text-emerald-700 dark:text-emerald-300">View</th>
                        <th className="text-center py-2 px-2 font-semibold text-blue-700 dark:text-blue-300">Create</th>
                        <th className="text-center py-2 px-2 font-semibold text-gold">Edit</th>
                        <th className="text-center py-2 px-2 font-semibold text-red-700 dark:text-red-300">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modules.map((m) => {
                        const isSubModule = m.key.startsWith('cms-')
                        const isMainCms = m.key === 'admin-cms'
                        const p = permissions[m.key] || { module: m.key, canView: false, canCreate: false, canEdit: false, canDelete: false }
                        return (
                          <tr key={m.key} className={`border-b border-border/50 hover:bg-muted/30 ${isSubModule ? 'bg-muted/20' : isMainCms ? 'bg-gold/5 font-bold' : ''}`}>
                            <td className={`py-2.5 px-2 font-medium text-navy dark:text-white ${isSubModule ? 'pl-7 text-xs text-foreground/80' : ''}`}>
                              {isSubModule && <span className="text-muted-foreground font-mono mr-1.5">↳</span>}
                              {m.label}
                              {isSubModule && <Badge variant="outline" className="ml-2 text-[9px] border-gold/40 text-gold font-normal">Sub-Modul CMS</Badge>}
                              {isMainCms && <Badge variant="outline" className="ml-2 text-[9px] border-blue-400/40 text-blue-600 font-normal">Semua Bagian</Badge>}
                            </td>
                            <td className="text-center py-2.5 px-2">
                              <div className="grid place-items-center">
                                <Switch checked={p.canView} onCheckedChange={(c) => togglePerm(m.key, 'canView', c)} />
                              </div>
                            </td>
                            <td className="text-center py-2.5 px-2">
                              <div className="grid place-items-center">
                                <Switch checked={p.canCreate} onCheckedChange={(c) => togglePerm(m.key, 'canCreate', c)} disabled={!p.canView} />
                              </div>
                            </td>
                            <td className="text-center py-2.5 px-2">
                              <div className="grid place-items-center">
                                <Switch checked={p.canEdit} onCheckedChange={(c) => togglePerm(m.key, 'canEdit', c)} disabled={!p.canView} />
                              </div>
                            </td>
                            <td className="text-center py-2.5 px-2">
                              <div className="grid place-items-center">
                                <Switch checked={p.canDelete} onCheckedChange={(c) => togglePerm(m.key, 'canDelete', c)} disabled={!p.canView} />
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <Button onClick={savePermissions} disabled={savingPerms} className="bg-navy-gradient">
                    {savingPerms ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Simpan Permission
                  </Button>
                </div>
              </div>
            )}

            {/* ===== Members tab ===== */}
            {tab === 'members' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">Anggota grup ini akan mendapat akses sesuai permission di atas.</p>
                  <Button size="sm" variant="outline" onClick={() => setAddMemberOpen(!addMemberOpen)}>
                    <UserPlus className="mr-2 h-3.5 w-3.5" /> Tambah Anggota
                  </Button>
                </div>

                {addMemberOpen && (
                  <Card className="border-gold/30">
                    <CardContent className="p-3 space-y-2">
                      <Input
                        placeholder="Cari user (nama atau email)..."
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        className="text-sm"
                      />
                      <div className="max-h-48 overflow-y-auto scrollbar-premium space-y-1">
                        {availableUsers.slice(0, 30).map((u) => (
                          <div key={u.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 border border-border/50">
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-medium text-navy dark:text-white truncate">{u.name}</div>
                              <div className="text-[10px] text-muted-foreground truncate">{u.email}</div>
                            </div>
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => addMember(u.id)}>
                              <Plus className="h-3 w-3 mr-1" /> Tambah
                            </Button>
                          </div>
                        ))}
                        {availableUsers.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-3">Tidak ada user tersedia</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-1.5">
                  {(group?.users || []).map((m) => {
                    const u = m.user
                    const initials = u.name?.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() ?? '?'
                    return (
                      <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg border border-border/50 hover:bg-muted/30">
                        <Avatar className="h-9 w-9">
                          {u.avatar ? <img src={u.avatar} alt={u.name} className="h-full w-full object-cover rounded-full" /> : <AvatarFallback className="bg-navy-gradient text-white text-xs font-semibold">{initials}</AvatarFallback>}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-navy dark:text-white truncate">{u.name}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{u.email} · {u.role}</div>
                        </div>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600" onClick={() => removeMember(u.id)}>
                          <UserMinus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )
                  })}
                  {(group?.users || []).length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-6">Belum ada anggota di grup ini</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
