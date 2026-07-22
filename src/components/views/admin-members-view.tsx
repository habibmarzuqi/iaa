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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Users, Plus, Search, Edit2, Trash2, Loader2, Save, Upload,
  Fingerprint, Building2, Award, GraduationCap, CheckCircle2, X,
  Mail, Phone as PhoneIcon, User as UserIcon,
} from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import { toast } from 'sonner'
import { DataPagination } from '@/components/ui/data-pagination'

interface Member {
  id: string
  memberNumber: string
  nip: string | null
  fullName: string
  photo: string | null
  workUnit: string | null
  position: string | null
  arsiparisLevel: string | null
  education: string | null
  trainingHistory: string | null
  certificationHistory: string | null
  status: string
  joinDate: string
  user: { email: string; role: string; avatar: string | null }
}

const LEVELS = ['PEMULA', 'MUDA', 'MADYA', 'UTAMA']
const STATUSES = ['AKTIF', 'TIDAK_AKTIF', 'PENSIUN', 'MENINGGAL']
const ROLES = ['ANGGOTA', 'PENGURUS', 'ADMINISTRATOR', 'SUPER_ADMIN']

export function AdminMembersView() {
  const [members, setMembers] = React.useState<Member[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [searchInput, setSearchInput] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)
  const [total, setTotal] = React.useState(0)
  const [totalPages, setTotalPages] = React.useState(1)
  const [editing, setEditing] = React.useState<Member | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const load = React.useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      limit: String(pageSize),
    })
    if (search) params.set('search', search)
    fetch(`/api/members-admin?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setMembers(d.members ?? [])
        setTotal(d.total ?? 0)
        setTotalPages(d.totalPages ?? 1)
      })
      .finally(() => setLoading(false))
  }, [page, pageSize, search])

  React.useEffect(() => { load() }, [load])

  // Debounce search input
  React.useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      setSearch(searchInput.trim())
    }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const remove = async (m: Member) => {
    if (!confirm(`Hapus anggota "${m.fullName}"? Akun user juga akan dihapus.`)) return
    try {
      await fetch(`/api/members-admin?id=${m.id}`, { method: 'DELETE' })
      toast.success('Anggota dihapus')
      load()
    } catch { toast.error('Gagal menghapus') }
  }

  const openCreate = () => { setEditing(null); setDialogOpen(true) }
  const openEdit = (m: Member) => { setEditing(m); setDialogOpen(true) }

  return (
    <AdminShell
      activeKey="members"
      title="Manajemen Anggota"
      subtitle="Kelola data anggota IAA: tambah, edit, hapus, upload foto, kelola jenjang & status"
      actions={
        <Button onClick={openCreate} className="bg-navy-gradient">
          <Plus className="mr-2 h-4 w-4" /> Tambah Anggota
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Anggota', value: total, color: 'from-blue-soft to-blue' },
          { label: 'Aktif', value: members.filter((m) => m.status === 'AKTIF').length, color: 'from-emerald-400 to-emerald-600' },
          { label: 'Arsiparis Utama', value: members.filter((m) => m.arsiparisLevel === 'UTAMA').length, color: 'from-gold-soft to-gold' },
          { label: 'Pensiun', value: members.filter((m) => m.status === 'PENSIUN').length, color: 'from-slate-400 to-slate-600' },
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
            <Input placeholder="Cari nama, nomor anggota, NIP, email..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
          ) : members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{search ? 'Tidak ada hasil untuk pencarian ini' : 'Belum ada anggota'}</p>
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto scrollbar-premium">
              {members.map((m, i) => {
                const initials = m.fullName.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="p-4 hover:bg-muted/30 flex items-center gap-3"
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      {m.photo ? (
                        <img src={m.photo} alt={m.fullName} className="h-full w-full object-cover rounded-full" />
                      ) : (
                        <AvatarFallback className="bg-navy-gradient text-white text-xs font-semibold">{initials}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-medium text-sm text-navy dark:text-white">{m.fullName}</span>
                        {m.arsiparisLevel && <Badge variant="outline" className="text-[9px] border-gold/40 text-gold">{m.arsiparisLevel}</Badge>}
                        <Badge variant="outline" className={`text-[9px] ${m.status === 'AKTIF' ? 'border-emerald-400/40 text-emerald-600' : 'border-slate-400/40 text-slate-500'}`}>{m.status}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="font-mono">{m.memberNumber}</span>
                        <span>{m.user?.email}</span>
                        {m.position && <span>· {m.position}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(m)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600" onClick={() => remove(m)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
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

      <MemberDialog open={dialogOpen} onOpenChange={setDialogOpen} member={editing} onSaved={() => { setDialogOpen(false); load() }} />
    </AdminShell>
  )
}

function MemberDialog({ open, onOpenChange, member, onSaved }: {
  open: boolean; onOpenChange: (o: boolean) => void; member: Member | null; onSaved: () => void
}) {
  const [form, setForm] = React.useState({
    email: '', password: '', name: '', role: 'ANGGOTA',
    memberNumber: '', nip: '', fullName: '', photo: '',
    workUnit: '', position: '', arsiparisLevel: '', education: '',
    trainingHistory: '', certificationHistory: '', status: 'AKTIF', joinDate: new Date().toISOString().slice(0, 10),
    isActive: true,
  })
  const [saving, setSaving] = React.useState(false)
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false)

  React.useEffect(() => {
    if (member) {
      setForm({
        email: member.user?.email || '', password: '', name: member.fullName, role: member.user?.role || 'ANGGOTA',
        memberNumber: member.memberNumber, nip: member.nip || '', fullName: member.fullName, photo: member.photo || '',
        workUnit: member.workUnit || '', position: member.position || '', arsiparisLevel: member.arsiparisLevel || '',
        education: member.education || '', trainingHistory: member.trainingHistory || '', certificationHistory: member.certificationHistory || '',
        status: member.status, joinDate: new Date(member.joinDate).toISOString().slice(0, 10), isActive: true,
      })
    } else {
      setForm({
        email: '', password: '', name: '', role: 'ANGGOTA', memberNumber: '', nip: '', fullName: '', photo: '',
        workUnit: '', position: '', arsiparisLevel: '', education: '', trainingHistory: '', certificationHistory: '',
        status: 'AKTIF', joinDate: new Date().toISOString().slice(0, 10), isActive: true,
      })
    }
  }, [member, open])

  const handlePhotoUpload = async (file: File) => {
    setUploadingPhoto(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/members-admin/upload', { method: 'POST', body: fd })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal upload'); return }
      setForm((f) => ({ ...f, photo: d.url }))
      toast.success('Foto terunggah')
    } catch { toast.error('Gagal upload foto') } finally { setUploadingPhoto(false) }
  }

  const submit = async () => {
    if (!form.email || !form.fullName || !form.memberNumber) {
      toast.error('Email, nama lengkap, nomor anggota wajib diisi')
      return
    }
    if (!member && !form.password) {
      toast.error('Password wajib diisi untuk anggota baru')
      return
    }
    setSaving(true)
    try {
      const payload = { ...form }
      if (member && !form.password) delete (payload as any).password
      const url = member ? `/api/members-admin?id=${member.id}` : '/api/members-admin'
      const method = member ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal menyimpan'); return }
      toast.success(member ? 'Anggota diperbarui' : 'Anggota ditambahkan')
      onSaved()
    } catch { toast.error('Terjadi kesalahan') } finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-premium">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-navy dark:text-white">
            <Users className="h-5 w-5 text-gold" /> {member ? 'Edit Anggota' : 'Tambah Anggota Baru'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Photo upload */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-border">
              {form.photo ? (
                <img src={form.photo} alt="Foto" className="h-full w-full object-cover rounded-full" />
              ) : (
                <AvatarFallback className="bg-muted">
                  <UserIcon className="h-8 w-8 text-muted-foreground" />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="space-y-2">
              <input type="file" accept="image/*" className="hidden" id="photo-upload" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f) }} />
              <label htmlFor="photo-upload">
                <Button type="button" variant="outline" size="sm" disabled={uploadingPhoto} className="cursor-pointer">
                  {uploadingPhoto ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-2 h-3.5 w-3.5" />}
                  Upload Foto
                </Button>
              </label>
              {form.photo && (
                <Button type="button" variant="ghost" size="sm" className="text-red-600 ml-2" onClick={() => setForm({ ...form, photo: '' })}>
                  <X className="h-3.5 w-3.5" /> Hapus
                </Button>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@iaa-anri.go.id" />
            </div>
            <div className="space-y-2">
              <Label>Password {member ? '(kosongkan jika tidak ubah)' : '*'}</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Nama Lengkap *</Label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value, name: e.target.value })} placeholder="Nama lengkap dengan gelar" />
            </div>
            <div className="space-y-2">
              <Label>Nomor Anggota *</Label>
              <Input value={form.memberNumber} onChange={(e) => setForm({ ...form, memberNumber: e.target.value })} placeholder="IAA-2024-0001" className="font-mono" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>NIP</Label>
              <Input value={form.nip} onChange={(e) => setForm({ ...form, nip: e.target.value })} placeholder="198503152010012001" className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Jabatan</Label>
              <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Arsiparis Muda" />
            </div>
            <div className="space-y-2">
              <Label>Unit Kerja</Label>
              <Input value={form.workUnit} onChange={(e) => setForm({ ...form, workUnit: e.target.value })} placeholder="ANRI - Pusat Konservasi" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Jenjang Arsiparis</Label>
              <Select value={form.arsiparisLevel} onValueChange={(v) => setForm({ ...form, arsiparisLevel: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Pilih jenjang" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Tidak ada —</SelectItem>
                  {LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Pendidikan</Label>
            <Input value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} placeholder="S1 - Ilmu Perpustakaan UI (2008)" />
          </div>

          <div className="space-y-2">
            <Label>Riwayat Pelatihan (JSON)</Label>
            <Textarea rows={2} value={form.trainingHistory} onChange={(e) => setForm({ ...form, trainingHistory: e.target.value })} placeholder='[{"name":"Pelatihan X","year":2023,"organizer":"ANRI"}]' className="font-mono text-xs" />
          </div>

          <div className="space-y-2">
            <Label>Riwayat Sertifikasi (JSON)</Label>
            <Textarea rows={2} value={form.certificationHistory} onChange={(e) => setForm({ ...form, certificationHistory: e.target.value })} placeholder='[{"name":"Sertifikasi Y","year":2022,"number":"AR-M-2022-045"}]' className="font-mono text-xs" />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tanggal Bergabung</Label>
              <Input type="date" value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Aktif</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch checked={form.isActive} onCheckedChange={(c) => setForm({ ...form, isActive: c })} />
                <span className="text-sm">{form.isActive ? 'Aktif' : 'Nonaktif'}</span>
              </div>
            </div>
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
