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
  Users, Plus, Search, Edit2, Trash2, Loader2, Save, Upload, Download, FileText,
  Fingerprint, Building2, Award, GraduationCap, CheckCircle2, X,
  Mail, Phone as PhoneIcon, User as UserIcon, Filter, RotateCcw, SlidersHorizontal, ArrowUpDown,
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

const LEVELS = ['PEMULA', 'TERAMPIL', 'MAHIR', 'PENYELIA', 'AHLI PERTAMA', 'AHLI MUDA', 'AHLI MADYA', 'AHLI UTAMA', 'MUDA', 'MADYA', 'UTAMA']
const STATUSES = ['AKTIF', 'PENDING', 'REJECTED', 'TIDAK_AKTIF', 'PENSIUN', 'MENINGGAL']
const ROLES = ['ANGGOTA', 'PENGURUS', 'ADMINISTRATOR', 'SUPER_ADMIN']

export function AdminMembersView() {
  const [members, setMembers] = React.useState<Member[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [searchInput, setSearchInput] = React.useState('')
  const [filterStatus, setFilterStatus] = React.useState('ALL')
  const [filterLevel, setFilterLevel] = React.useState('ALL')
  const [filterRole, setFilterRole] = React.useState('ALL')
  const [filterWorkUnit, setFilterWorkUnit] = React.useState('ALL')
  const [sortBy, setSortBy] = React.useState('memberNumber')
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc')
  const [availableWorkUnits, setAvailableWorkUnits] = React.useState<string[]>([])
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)
  const [total, setTotal] = React.useState(0)
  const [totalPages, setTotalPages] = React.useState(1)
  const [editing, setEditing] = React.useState<Member | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [importDialogOpen, setImportDialogOpen] = React.useState(false)
  const [importResult, setImportResult] = React.useState<any>(null)
  const [importing, setImporting] = React.useState(false)
  const [downloadingTemplate, setDownloadingTemplate] = React.useState(false)
  const [adArtDialogOpen, setAdArtDialogOpen] = React.useState(false)

  const handleApprove = async (memberId: string, fullName: string) => {
    if (!confirm(`Setujui pendaftaran anggota "${fullName}"? Nomor Anggota IAA akan diterbitkan secara otomatis.`)) return
    try {
      const res = await fetch(`/api/members-admin?id=${memberId}&action=approve`, { method: 'PATCH' })
      const d = await res.json()
      if (!res.ok) {
        toast.error(d.error || 'Gagal menyetujui anggota')
        return
      }
      toast.success(d.message || 'Pendaftaran anggota berhasil disetujui!')
      load()
    } catch {
      toast.error('Terjadi kesalahan jaringan')
    }
  }

  const handleReject = async (memberId: string, fullName: string) => {
    if (!confirm(`Tolak pengajuan pendaftaran anggota "${fullName}"?`)) return
    try {
      const res = await fetch(`/api/members-admin?id=${memberId}&action=reject`, { method: 'PATCH' })
      const d = await res.json()
      if (!res.ok) {
        toast.error(d.error || 'Gagal menolak pengajuan')
        return
      }
      toast.success(d.message || 'Pengajuan pendaftaran ditolak')
      load()
    } catch {
      toast.error('Terjadi kesalahan jaringan')
    }
  }

  const activeFiltersCount = (search ? 1 : 0)
    + (filterStatus !== 'ALL' ? 1 : 0)
    + (filterLevel !== 'ALL' ? 1 : 0)
    + (filterRole !== 'ALL' ? 1 : 0)
    + (filterWorkUnit !== 'ALL' ? 1 : 0)

  const resetFilters = () => {
    setSearchInput('')
    setSearch('')
    setFilterStatus('ALL')
    setFilterLevel('ALL')
    setFilterRole('ALL')
    setFilterWorkUnit('ALL')
    setSortBy('memberNumber')
    setSortOrder('asc')
    setPage(1)
  }

  const load = React.useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      limit: String(pageSize),
    })
    if (search) params.set('search', search)
    if (filterStatus !== 'ALL') params.set('status', filterStatus)
    if (filterLevel !== 'ALL') params.set('level', filterLevel)
    if (filterRole !== 'ALL') params.set('role', filterRole)
    if (filterWorkUnit !== 'ALL') params.set('workUnit', filterWorkUnit)
    if (sortBy) params.set('sortBy', sortBy)
    if (sortOrder) params.set('sortOrder', sortOrder)

    fetch(`/api/members-admin?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setMembers(d.members ?? [])
        setTotal(d.total ?? 0)
        setTotalPages(d.totalPages ?? 1)
        if (Array.isArray(d.availableWorkUnits)) {
          setAvailableWorkUnits(d.availableWorkUnits)
        }
      })
      .finally(() => setLoading(false))
  }, [page, pageSize, search, filterStatus, filterLevel, filterRole, filterWorkUnit, sortBy, sortOrder])

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

  const downloadTemplate = async () => {
    setDownloadingTemplate(true)
    try {
      const res = await fetch('/api/members-admin/template')
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        toast.error(d.error || 'Gagal download template')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'template-import-anggota-iaa.xlsx'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Template berhasil diunduh')
    } catch (e) {
      toast.error('Gagal download template')
    } finally {
      setDownloadingTemplate(false)
    }
  }

  const handleImport = async (file: File) => {
    setImporting(true)
    setImportResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/members-admin/import', { method: 'POST', body: fd })
      const d = await res.json()
      if (!res.ok) {
        toast.error(d.error || 'Gagal import')
        return
      }
      setImportResult(d)
      toast.success(d.message || `Import selesai: ${d.imported} anggota baru`)
      load()
    } catch (e) {
      toast.error('Terjadi kesalahan saat import')
    } finally {
      setImporting(false)
    }
  }

  return (
    <AdminShell
      activeKey="members"
      title="Manajemen Anggota"
      subtitle="Kelola data anggota IAA: tambah, edit, hapus, upload foto, kelola jenjang & status"
      actions={
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setAdArtDialogOpen(true)} className="border-gold/40 text-gold-dark dark:text-gold hover:bg-gold/10">
            <FileText className="mr-2 h-4 w-4" /> Kelola Teks AD/ART
          </Button>
          <Button variant="outline" onClick={downloadTemplate} disabled={downloadingTemplate}>
            {downloadingTemplate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Template Excel
          </Button>
          <Button variant="outline" onClick={() => { setImportResult(null); setImportDialogOpen(true) }}>
            <Upload className="mr-2 h-4 w-4" /> Import Excel
          </Button>
          <Button onClick={openCreate} className="bg-navy-gradient">
            <Plus className="mr-2 h-4 w-4" /> Tambah Anggota
          </Button>
        </div>
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

      {/* Dynamic Search & Filter Panel */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Main search input bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, nomor anggota, NIP, instansi, jabatan, email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-9 text-xs"
              />
              {searchInput && (
                <button
                  onClick={() => { setSearchInput(''); setSearch('') }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="text-xs text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30 flex-shrink-0"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset Filter ({activeFiltersCount})
              </Button>
            )}
          </div>

          {/* Dynamic Filter Selectors */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1 border-t border-border">
            {/* Status Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Status
              </label>
              <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1) }}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Level Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Award className="h-3 w-3 text-gold" /> Jenjang Arsiparis
              </label>
              <Select value={filterLevel} onValueChange={(v) => { setFilterLevel(v); setPage(1) }}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Semua Jenjang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Jenjang</SelectItem>
                  {LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <UserIcon className="h-3 w-3 text-blue-500" /> Hak Akses Role
              </label>
              <Select value={filterRole} onValueChange={(v) => { setFilterRole(v); setPage(1) }}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Semua Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Role</SelectItem>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Unit Kerja Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3 text-purple-500" /> Unit Kerja / Instansi
              </label>
              <Select value={filterWorkUnit} onValueChange={(v) => { setFilterWorkUnit(v); setPage(1) }}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Semua Unit Kerja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Instansi ({availableWorkUnits.length})</SelectItem>
                  {availableWorkUnits.map((w) => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sorting */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <ArrowUpDown className="h-3 w-3 text-slate-500" /> Urutkan Berdasarkan
              </label>
              <div className="flex gap-1">
                <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1) }}>
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="memberNumber">No. Anggota</SelectItem>
                    <SelectItem value="fullName">Nama (A-Z)</SelectItem>
                    <SelectItem value="joinDate">Tgl Bergabung</SelectItem>
                    <SelectItem value="arsiparisLevel">Jenjang</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 flex-shrink-0"
                  title={sortOrder === 'asc' ? 'Urutan Naik (A-Z)' : 'Urutan Turun (Z-A)'}
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  <ArrowUpDown className={`h-3.5 w-3.5 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50 text-xs text-muted-foreground">
              <span className="text-[11px] font-medium">Filter Aktif:</span>
              {search && (
                <Badge variant="secondary" className="text-[10px] gap-1 bg-muted pl-2 pr-1 py-0.5 font-normal">
                  Kata Kunci: "{search}"
                  <button
                    type="button"
                    onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }}
                    className="h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 transition-colors text-muted-foreground hover:text-red-600"
                    title="Hapus filter kata kunci"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filterStatus !== 'ALL' && (
                <Badge variant="secondary" className="text-[10px] gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 pl-2 pr-1 py-0.5 font-normal">
                  Status: {filterStatus}
                  <button
                    type="button"
                    onClick={() => { setFilterStatus('ALL'); setPage(1) }}
                    className="h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors text-emerald-700 dark:text-emerald-300 hover:text-red-600"
                    title="Hapus filter status"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filterLevel !== 'ALL' && (
                <Badge variant="secondary" className="text-[10px] gap-1 bg-gold/20 text-gold-dark dark:text-gold pl-2 pr-1 py-0.5 font-normal">
                  Jenjang: {filterLevel}
                  <button
                    type="button"
                    onClick={() => { setFilterLevel('ALL'); setPage(1) }}
                    className="h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-gold/30 transition-colors text-gold-dark dark:text-gold hover:text-red-600"
                    title="Hapus filter jenjang"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filterRole !== 'ALL' && (
                <Badge variant="secondary" className="text-[10px] gap-1 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 pl-2 pr-1 py-0.5 font-normal">
                  Role: {filterRole}
                  <button
                    type="button"
                    onClick={() => { setFilterRole('ALL'); setPage(1) }}
                    className="h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-blue-700 dark:text-blue-300 hover:text-red-600"
                    title="Hapus filter role"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filterWorkUnit !== 'ALL' && (
                <Badge variant="secondary" className="text-[10px] gap-1 bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 pl-2 pr-1 py-0.5 font-normal">
                  Unit Kerja: {filterWorkUnit}
                  <button
                    type="button"
                    onClick={() => { setFilterWorkUnit('ALL'); setPage(1) }}
                    className="h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors text-purple-700 dark:text-purple-300 hover:text-red-600"
                    title="Hapus filter unit kerja"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
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
                        <Badge variant="outline" className={`text-[9px] ${
                          m.status === 'AKTIF'
                            ? 'border-emerald-400/40 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                            : m.status === 'PENDING'
                            ? 'border-amber-400/40 text-amber-700 bg-amber-50 dark:bg-amber-950/40'
                            : m.status === 'REJECTED'
                            ? 'border-red-400/40 text-red-600 bg-red-50 dark:bg-red-950/40'
                            : 'border-slate-400/40 text-slate-500'
                        }`}>
                          {m.status === 'PENDING' ? '⏳ MENUNGU APPROVAL' : m.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="font-mono">{m.memberNumber || '❌ Belum Terbit'}</span>
                        <span>{m.user?.email}</span>
                        {m.position && <span>· {m.position}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {m.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-1 shadow-sm"
                            onClick={() => handleApprove(m.id, m.fullName)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Setujui
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-xs border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1 font-medium"
                            onClick={() => handleReject(m.id, m.fullName)}
                          >
                            <X className="h-3.5 w-3.5" /> Tolak
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Edit Data Anggota" onClick={() => openEdit(m)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600" title="Hapus Anggota" onClick={() => remove(m)}>
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

      <ImportMembersDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImport}
        onDownloadTemplate={downloadTemplate}
        importing={importing}
        result={importResult}
      />

      <AdArtDialog open={adArtDialogOpen} onOpenChange={setAdArtDialogOpen} />
    </AdminShell>
  )
}

function AdArtDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [content, setContent] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setLoading(true)
      fetch('/api/settings')
        .then((r) => r.json())
        .then((d) => {
          if (d.settings?.ad_art_content) {
            setContent(d.settings.ad_art_content)
          } else {
            setContent(`ANGGARAN DASAR & ANGGARAN RUMAH TANGGA (AD/ART)\nIKATAN ARSIPARIS ANRI (IAA)\n\nBAB I — NAMA, WAKTU, DAN KEDUDUKAN\nPasal 1: Organisasi ini bernama Ikatan Arsiparis ANRI (disingkat IAA).\nPasal 2: IAA berkedudukan di Kantor Arsip Nasional Republik Indonesia (ANRI) Jakarta.\n\nBAB II — ASAS DAN TUJUAN\nPasal 3: IAA berasaskan Pancasila dan Undang-Undang Dasar 1945.\nPasal 4: IAA bertujuan meningkatkan profesionalisme, integritas, dan kesejahteraan Arsiparis serta memajukan kearsipan nasional.\n\nBAB III — KEANGGOTAAN DAN HAK/KEWAJIBAN\nPasal 5: Anggota IAA terdiri dari Anggota Biasa, Anggota Luar Biasa, dan Anggota Kehormatan.\nPasal 6: Setiap Anggota berkewajiban menjunjung tinggi integritas, kode etik profesi, membela nama baik organisasi, serta mematuhi seluruh ketetapan AD/ART IAA.`)
          }
        })
        .finally(() => setLoading(false))
    }
  }, [open])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: { ad_art_content: content },
        }),
      })
      if (!res.ok) throw new Error('Gagal menyimpan')
      toast.success('Teks AD/ART berhasil diperbarui!')
      onOpenChange(false)
    } catch {
      toast.error('Gagal menyimpan teks AD/ART')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-navy dark:text-white">
            <FileText className="h-5 w-5 text-gold" /> Kelola Teks AD/ART & Kode Etik Pendaftaran
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-xs text-muted-foreground">
            Teks ini akan ditampilkan kepada pendaftar anggota baru pada Langkah 2 (Persetujuan AD/ART).
          </p>

          {loading ? (
            <div className="h-48 rounded-lg bg-muted animate-pulse grid place-items-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="font-mono text-xs leading-relaxed"
              placeholder="Ketik atau tempel teks AD/ART di sini..."
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleSave} disabled={saving || loading} className="bg-navy-gradient">
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</> : <><Save className="mr-2 h-4 w-4" /> Simpan Perubahan</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

// ============ Import Members Dialog ============

function ImportMembersDialog({
  open, onOpenChange, onImport, onDownloadTemplate, importing, result,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onImport: (file: File) => void
  onDownloadTemplate: () => void
  importing: boolean
  result: any
}) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (open) setSelectedFile(null)
  }, [open])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setSelectedFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) setSelectedFile(f)
  }

  const handleSubmit = () => {
    if (!selectedFile) {
      toast.error('Pilih file Excel terlebih dahulu')
      return
    }
    onImport(selectedFile)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-premium">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-navy dark:text-white">
            <Upload className="h-5 w-5 text-gold" /> Import Anggota dari Excel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Step 1: Download template */}
          <div className="rounded-lg border border-border p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-sm text-navy dark:text-white">Langkah 1: Unduh Template</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Download template Excel berisi format kolom, contoh data, dan instruksi pengisian.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={onDownloadTemplate}>
                <Download className="mr-2 h-3.5 w-3.5" /> Unduh Template
              </Button>
            </div>
          </div>

          {/* Step 2: Upload */}
          <div className="rounded-lg border border-border p-4 space-y-3">
            <div>
              <div className="font-semibold text-sm text-navy dark:text-white">Langkah 2: Unggah File Excel</div>
              <p className="text-xs text-muted-foreground mt-1">
                Isi template dengan data anggota, lalu unggah di sini. Format: .xlsx atau .xls, maks 5MB, maks 500 baris.
              </p>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-gold/50 hover:bg-muted/30 transition-colors"
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                className="hidden"
                onChange={handleFileChange}
              />
              {selectedFile ? (
                <div className="space-y-1">
                  <FileText className="h-8 w-8 text-emerald-600 mx-auto" />
                  <div className="text-sm font-medium text-navy dark:text-white">{selectedFile.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                  <div className="text-sm text-muted-foreground">
                    Klik untuk pilih file atau drag & drop
                  </div>
                  <div className="text-[10px] text-muted-foreground">.xlsx atau .xls, maks 5MB</div>
                </div>
              )}
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/30">
              <div className="font-semibold text-sm text-navy dark:text-white">Hasil Import</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3">
                  <div className="text-2xl font-bold text-emerald-600">{result.imported}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Berhasil</div>
                </div>
                <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 p-3">
                  <div className="text-2xl font-bold text-orange-600">{result.skipped}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Dilewati</div>
                </div>
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
                  <div className="text-2xl font-bold text-blue-600">{result.total}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Baris</div>
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-red-600">
                    Detail Error ({result.errors.length} baris bermasalah):
                  </div>
                  <div className="max-h-40 overflow-y-auto scrollbar-premium rounded-lg border border-border bg-background">
                    {result.errors.slice(0, 50).map((err: any, i: number) => (
                      <div key={i} className="px-3 py-1.5 text-[11px] border-b border-border/50 last:border-0">
                        <span className="font-mono text-red-600">Baris {err.row}</span>
                        <span className="text-muted-foreground mx-2">·</span>
                        <span className="text-foreground/80">{err.email}</span>
                        <span className="text-muted-foreground mx-2">·</span>
                        <span className="text-muted-foreground">{err.reason}</span>
                      </div>
                    ))}
                    {result.errors.length > 50 && (
                      <div className="px-3 py-2 text-[10px] text-muted-foreground italic">
                        ...dan {result.errors.length - 50} error lainnya
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 text-[11px] text-blue-700 dark:text-blue-300">
            <strong>Catatan:</strong> Email dan Nomor Anggota yang sudah ada di database akan otomatis dilewati.
            Field bertanda * wajib diisi. Setelah import berhasil, anggota dapat login dengan email + password dari file Excel.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedFile || importing}
            className="bg-navy-gradient"
          >
            {importing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengimpor...</>
            ) : (
              <><Upload className="mr-2 h-4 w-4" /> Import Sekarang</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
