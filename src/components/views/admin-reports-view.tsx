'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { AdminShell } from '@/components/admin/admin-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IAALogo } from '@/components/iaa-logo'
import {
  FileBarChart, Users, CalendarCheck, Award, BookOpen, Archive,
  Download, FileText, Printer, Calendar, Filter, Loader2, Sparkles,
  TrendingUp, FileSpreadsheet,
} from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/helpers'
import { toast } from 'sonner'

type ReportType = 'members' | 'events' | 'certificates' | 'library' | 'archives'

const REPORT_TYPES: { id: ReportType; label: string; desc: string; icon: any; color: string }[] = [
  { id: 'members', label: 'Daftar Anggota', desc: 'Data lengkap seluruh anggota IAA dengan jenjang & status', icon: Users, color: 'from-blue-soft to-blue' },
  { id: 'events', label: 'Kegiatan & Registrasi', desc: 'Rekap kegiatan, kuota, peserta terdaftar, sertifikat terbit', icon: CalendarCheck, color: 'from-emerald-400 to-emerald-600' },
  { id: 'certificates', label: 'Sertifikat Terbit', desc: 'Log penerbitan sertifikat dengan penerima & nomor unik', icon: Award, color: 'from-gold-soft to-gold' },
  { id: 'library', label: 'Digital Library', desc: 'Statistik koleksi, unduhan, dan viewed per item', icon: BookOpen, color: 'from-purple-400 to-purple-600' },
  { id: 'archives', label: 'Arsip Organisasi', desc: 'Daftar arsip dengan klasifikasi, versi, dan akses', icon: Archive, color: 'from-orange-400 to-orange-600' },
]

// Map type → data key in API response
const REPORT_DATA_KEYS: Record<ReportType, string> = {
  members: 'members',
  events: 'events',
  certificates: 'certificates',
  library: 'items',
  archives: 'archives',
}

export function AdminReportsView() {
  const [type, setType] = React.useState<ReportType>('members')
  const [from, setFrom] = React.useState('')
  const [to, setTo] = React.useState('')
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    setData(null) // clear old data to prevent shape mismatch
    try {
      const params = new URLSearchParams({ type })
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      const res = await fetch(`/api/reports?${params}`)
      const d = await res.json()
      if (res.ok) setData(d)
      else toast.error(d.error || 'Gagal memuat laporan')
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }, [type, from, to])

  React.useEffect(() => { load() }, [load])

  const exportCSV = () => {
    const params = new URLSearchParams({ type, format: 'csv' })
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    window.open(`/api/reports?${params.toString()}`, '_blank')
    toast.success('File CSV diunduh')
  }

  const printReport = () => {
    window.print()
  }

  return (
    <AdminShell
      activeKey="reports"
      title="Laporan & Export"
      subtitle="Generate laporan organisasi dalam format PDF (print) atau Excel (CSV)"
      actions={
        <>
          <Button variant="outline" onClick={exportCSV} disabled={!data}>
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button onClick={printReport} disabled={!data} className="bg-navy-gradient">
            <Printer className="mr-2 h-4 w-4" /> Print / PDF
          </Button>
        </>
      }
    >
      {/* Report type selector */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5 print:hidden">
        {REPORT_TYPES.map((r) => (
          <button
            key={r.id}
            onClick={() => setType(r.id)}
            className={`group rounded-xl border p-4 text-left transition-all ${
              type === r.id
                ? 'border-gold bg-gold/5 shadow-premium'
                : 'border-border bg-card hover:border-gold/40 hover:shadow-premium'
            }`}
          >
            <div className={`grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ${r.color} text-white mb-2`}>
              <r.icon className="h-5 w-5" />
            </div>
            <div className="font-semibold text-sm text-navy dark:text-white">{r.label}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{r.desc}</div>
          </button>
        ))}
      </div>

      {/* Date filter */}
      <Card className="print:hidden">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Dari Tanggal</label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="flex-1 w-full">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Sampai Tanggal</label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <Button onClick={load} disabled={loading} className="bg-navy-gradient">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Filter className="h-4 w-4" />}
              <span className="ml-2">Terapkan Filter</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report preview */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-10 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-navy mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Memuat laporan...</p>
            </div>
          ) : data && data[REPORT_DATA_KEYS[type]] ? (
            <ReportPreview type={type} data={data} />
          ) : (
            <div className="p-10 text-center text-sm text-muted-foreground">
              {data ? 'Tidak ada data untuk laporan ini' : 'Pilih jenis laporan untuk mulai'}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminShell>
  )
}

function ReportPreview({ type, data }: { type: ReportType; data: any }) {
  const reportMeta = REPORT_TYPES.find((r) => r.id === type)!

  return (
    <div className="p-6 lg:p-8">
      {/* Report header */}
      <div className="border-b-2 border-navy pb-4 mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <IAALogo />
          <div>
            <div className="font-display font-extrabold text-navy dark:text-white">IAA Digital</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Ikatan Arsiparis ANRI</div>
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div className="font-semibold text-navy dark:text-white">LAPORAN RESMI</div>
          <div>{formatDateTime(new Date().toISOString())}</div>
          <div>Dibuat oleh: {data.generatedBy}</div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-navy dark:text-white mb-1">{data.title}</h2>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="border-gold/40 text-gold">{reportMeta.label}</Badge>
          <span>·</span>
          <span>Periode: {data.from || 'Awal'} s/d {data.to || 'Sekarang'}</span>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatBox label="Total Records" value={data.total ?? 0} icon={FileText} />
        {type === 'library' && <StatBox label="Total Unduhan" value={data.totalDownloads ?? 0} icon={Download} />}
        {type === 'library' && <StatBox label="Total Views" value={data.totalViews ?? 0} icon={TrendingUp} />}
        <StatBox label="Generated" value={formatDate(data.generatedAt)} icon={Calendar} />
        <StatBox label="Status" value="Complete" icon={Sparkles} valueClass="text-emerald-600" />
      </div>

      {/* Table */}
      <ReportTable type={type} data={data} />

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-border text-center text-xs text-muted-foreground">
        <p>Laporan ini dibuat otomatis oleh sistem IAA Digital pada {formatDateTime(new Date().toISOString())}.</p>
        <p className="mt-1">© 2026 Ikatan Arsiparis ANRI. Hak Cipta Dilindungi.</p>
      </div>
    </div>
  )
}

function StatBox({ label, value, icon: Icon, valueClass = '' }: { label: string; value: any; icon: any; valueClass?: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        <Icon className="h-3.5 w-3.5 text-gold" /> {label}
      </div>
      <div className={`text-lg font-bold font-display text-navy dark:text-white ${valueClass}`}>
        {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
      </div>
    </div>
  )
}

function ReportTable({ type, data }: { type: ReportType; data: any }) {
  if (type === 'members') {
    return (
      <div className="overflow-x-auto scrollbar-premium">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-navy-gradient text-white">
              <th className="px-2 py-2 text-left">No. Anggota</th>
              <th className="px-2 py-2 text-left">Nama</th>
              <th className="px-2 py-2 text-left">NIP</th>
              <th className="px-2 py-2 text-left">Jabatan</th>
              <th className="px-2 py-2 text-left">Unit Kerja</th>
              <th className="px-2 py-2 text-left">Jenjang</th>
              <th className="px-2 py-2 text-left">Status</th>
              <th className="px-2 py-2 text-left">Bergabung</th>
            </tr>
          </thead>
          <tbody>
            {data.members.map((m: any, i: number) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/30'}>
                <td className="px-2 py-1.5 font-mono">{m.memberNumber}</td>
                <td className="px-2 py-1.5 font-medium text-navy dark:text-white">{m.fullName}</td>
                <td className="px-2 py-1.5 font-mono text-muted-foreground">{m.nip ?? '-'}</td>
                <td className="px-2 py-1.5">{m.position ?? '-'}</td>
                <td className="px-2 py-1.5">{m.workUnit ?? '-'}</td>
                <td className="px-2 py-1.5">{m.arsiparisLevel ?? '-'}</td>
                <td className="px-2 py-1.5">
                  <Badge variant="outline" className={`text-[9px] ${m.status === 'AKTIF' ? 'border-emerald-400/40 text-emerald-600' : ''}`}>
                    {m.status}
                  </Badge>
                </td>
                <td className="px-2 py-1.5">{formatDate(m.joinDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (type === 'events') {
    return (
      <div className="overflow-x-auto scrollbar-premium">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-navy-gradient text-white">
              <th className="px-2 py-2 text-left">Kegiatan</th>
              <th className="px-2 py-2 text-left">Tipe</th>
              <th className="px-2 py-2 text-left">Lokasi</th>
              <th className="px-2 py-2 text-left">Tanggal</th>
              <th className="px-2 py-2 text-center">Kuota</th>
              <th className="px-2 py-2 text-center">Terdaftar</th>
              <th className="px-2 py-2 text-center">Regist.</th>
              <th className="px-2 py-2 text-center">Sertifikat</th>
              <th className="px-2 py-2 text-left">Penyelenggara</th>
            </tr>
          </thead>
          <tbody>
            {data.events.map((e: any, i: number) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/30'}>
                <td className="px-2 py-1.5 font-medium text-navy dark:text-white max-w-xs truncate">{e.title}</td>
                <td className="px-2 py-1.5"><Badge variant="outline" className="text-[9px]">{e.eventType}</Badge></td>
                <td className="px-2 py-1.5 truncate max-w-[120px]">{e.location}</td>
                <td className="px-2 py-1.5">{formatDate(e.startDate)}</td>
                <td className="px-2 py-1.5 text-center">{e.quota}</td>
                <td className="px-2 py-1.5 text-center font-semibold">{e.registeredCount}</td>
                <td className="px-2 py-1.5 text-center">{e.registrations}</td>
                <td className="px-2 py-1.5 text-center text-emerald-600 font-semibold">{e.certificatesIssued}</td>
                <td className="px-2 py-1.5 truncate max-w-[120px]">{e.organizer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (type === 'certificates') {
    return (
      <div className="overflow-x-auto scrollbar-premium">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-navy-gradient text-white">
              <th className="px-2 py-2 text-left">Nomor Sertifikat</th>
              <th className="px-2 py-2 text-left">Judul</th>
              <th className="px-2 py-2 text-left">Penerima</th>
              <th className="px-2 py-2 text-left">No. Anggota</th>
              <th className="px-2 py-2 text-left">Jenjang</th>
              <th className="px-2 py-2 text-left">Kegiatan</th>
              <th className="px-2 py-2 text-left">Diterbitkan</th>
              <th className="px-2 py-2 text-left">Oleh</th>
            </tr>
          </thead>
          <tbody>
            {data.certificates.map((c: any, i: number) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/30'}>
                <td className="px-2 py-1.5 font-mono text-gold font-semibold">{c.certificateNumber}</td>
                <td className="px-2 py-1.5 font-medium text-navy dark:text-white max-w-xs truncate">{c.title}</td>
                <td className="px-2 py-1.5">{c.memberName}</td>
                <td className="px-2 py-1.5 font-mono">{c.memberNumber}</td>
                <td className="px-2 py-1.5">{c.arsiparisLevel ?? '-'}</td>
                <td className="px-2 py-1.5 truncate max-w-[120px]">{c.event ?? '-'}</td>
                <td className="px-2 py-1.5">{formatDate(c.issuedAt)}</td>
                <td className="px-2 py-1.5">{c.issuedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (type === 'library') {
    return (
      <div className="overflow-x-auto scrollbar-premium">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-navy-gradient text-white">
              <th className="px-2 py-2 text-left">Judul</th>
              <th className="px-2 py-2 text-left">Kategori</th>
              <th className="px-2 py-2 text-left">Penulis</th>
              <th className="px-2 py-2 text-center">Tahun</th>
              <th className="px-2 py-2 text-center">Halaman</th>
              <th className="px-2 py-2 text-center">Views</th>
              <th className="px-2 py-2 text-center">Downloads</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((it: any, i: number) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/30'}>
                <td className="px-2 py-1.5 font-medium text-navy dark:text-white max-w-xs truncate">{it.title}</td>
                <td className="px-2 py-1.5"><Badge variant="outline" className="text-[9px]">{it.category}</Badge></td>
                <td className="px-2 py-1.5 truncate max-w-[120px]">{it.author ?? '-'}</td>
                <td className="px-2 py-1.5 text-center">{it.year ?? '-'}</td>
                <td className="px-2 py-1.5 text-center">{it.pages ?? '-'}</td>
                <td className="px-2 py-1.5 text-center">{it.viewCount.toLocaleString('id-ID')}</td>
                <td className="px-2 py-1.5 text-center text-emerald-600 font-semibold">{it.downloadCount.toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (type === 'archives') {
    return (
      <div className="overflow-x-auto scrollbar-premium">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-navy-gradient text-white">
              <th className="px-2 py-2 text-left">No. Arsip</th>
              <th className="px-2 py-2 text-left">Judul</th>
              <th className="px-2 py-2 text-left">Kategori</th>
              <th className="px-2 py-2 text-left">Tanggal</th>
              <th className="px-2 py-2 text-left">Klasifikasi</th>
              <th className="px-2 py-2 text-left">Akses</th>
              <th className="px-2 py-2 text-center">Versi</th>
              <th className="px-2 py-2 text-center">Akses Log</th>
              <th className="px-2 py-2 text-left">Diunggah Oleh</th>
            </tr>
          </thead>
          <tbody>
            {data.archives.map((a: any, i: number) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/30'}>
                <td className="px-2 py-1.5 font-mono text-muted-foreground">{a.archiveNumber}</td>
                <td className="px-2 py-1.5 font-medium text-navy dark:text-white max-w-xs truncate">{a.title}</td>
                <td className="px-2 py-1.5"><Badge variant="outline" className="text-[9px]">{a.category}</Badge></td>
                <td className="px-2 py-1.5">{formatDate(a.documentDate)}</td>
                <td className="px-2 py-1.5">
                  <Badge variant="outline" className={`text-[9px] ${
                    a.classification === 'PUBLIK' ? 'border-emerald-400/40 text-emerald-600'
                    : a.classification === 'INTERNAL' ? 'border-blue-400/40 text-blue-600'
                    : a.classification === 'RAHASIA' ? 'border-orange-400/40 text-orange-600'
                    : 'border-red-400/40 text-red-600'
                  }`}>{a.classification}</Badge>
                </td>
                <td className="px-2 py-1.5">{a.accessLevel}</td>
                <td className="px-2 py-1.5 text-center font-semibold">{a.versionCount}</td>
                <td className="px-2 py-1.5 text-center">{a.accessCount}</td>
                <td className="px-2 py-1.5 truncate max-w-[120px]">{a.uploadedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return null
}
