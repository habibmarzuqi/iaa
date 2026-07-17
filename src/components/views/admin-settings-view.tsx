'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { AdminShell } from '@/components/admin/admin-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs'
import {
  Database, Download, Upload, Trash2, History, ShieldCheck, Smartphone,
  Bell, KeyRound, CheckCircle2, AlertTriangle, Loader2, RefreshCw,
  Cloud, Lock, FileJson, Clock, HardDrive, Settings as SettingsIcon,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { formatDateTime, timeAgo } from '@/lib/helpers'
import { toast } from 'sonner'
import { usePushPermission } from '@/components/pwa-install-prompt'

interface Backup {
  id: string
  type: string
  status: string
  fileName: string
  fileSize: number | null
  recordCount: number | null
  notes: string | null
  createdAt: string
  triggeredBy: { name: string } | null
}

interface OAuthAccount {
  id: string
  provider: string
  email: string | null
  name: string | null
  avatar: string | null
  createdAt: string
}

export function AdminSettingsView() {
  const { user } = useApp()
  const [backups, setBackups] = React.useState<Backup[]>([])
  const [oauthAccounts, setOauthAccounts] = React.useState<OAuthAccount[]>([])
  const [loading, setLoading] = React.useState(true)
  const [creating, setCreating] = React.useState(false)
  const [restoreOpen, setRestoreOpen] = React.useState(false)
  const [restoreData, setRestoreData] = React.useState<any>(null)
  const [restoreConfirm, setRestoreConfirm] = React.useState('')
  const [restoring, setRestoring] = React.useState(false)
  const { permission: pushPermission, requestPermission } = usePushPermission()

  const load = React.useCallback(() => {
    setLoading(true)
    fetch('/api/backup')
      .then((r) => r.json())
      .then((d) => setBackups(d.backups ?? []))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => { load() }, [load])

  const createBackup = async () => {
    setCreating(true)
    try {
      const res = await fetch('/api/backup', { method: 'POST' })
      if (!res.ok) {
        const d = await res.json()
        toast.error(d.error || 'Gagal membuat backup')
        return
      }
      const blob = await res.blob()
      const contentDisp = res.headers.get('content-disposition') || ''
      const fileNameMatch = contentDisp.match(/filename="([^"]+)"/)
      const fileName = fileNameMatch ? fileNameMatch[1] : `iaa-backup-${Date.now()}.json`

      // Trigger download
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`Backup ${fileName} berhasil dibuat dan diunduh`)
      load()
    } catch (e) {
      toast.error('Terjadi kesalahan')
    } finally {
      setCreating(false)
    }
  }

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      setRestoreData(data)
      setRestoreConfirm('')
      setRestoreOpen(true)
    } catch {
      toast.error('File backup tidak valid (bukan JSON valid)')
    }
    e.target.value = ''
  }

  const performRestore = async () => {
    if (restoreConfirm !== 'RESTORE') {
      toast.error('Ketik "RESTORE" untuk konfirmasi')
      return
    }
    setRestoring(true)
    try {
      const res = await fetch('/api/backup?action=restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: restoreData, confirmText: restoreConfirm }),
      })
      const d = await res.json()
      if (!res.ok) {
        toast.error(d.error || 'Gagal restore')
        return
      }
      toast.success(`Restore berhasil: ${Object.entries(d.restored).map(([k, v]) => `${k}=${v}`).join(', ')}`)
      setRestoreOpen(false)
      setRestoreData(null)
      setRestoreConfirm('')
      load()
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setRestoring(false)
    }
  }

  const deleteBackup = async (id: string) => {
    if (!confirm('Hapus record backup ini? File fisik tetap ada di storage.')) return
    try {
      await fetch(`/api/backup?id=${id}`, { method: 'DELETE' })
      toast.success('Record backup dihapus')
      load()
    } catch {
      toast.error('Gagal menghapus')
    }
  }

  const totalSize = backups.reduce((s, b) => s + (b.fileSize ?? 0), 0)
  const successCount = backups.filter((b) => b.status === 'success').length
  const failedCount = backups.filter((b) => b.status === 'failed').length

  return (
    <AdminShell
      activeKey="settings"
      title="Pengaturan Sistem"
      subtitle="Backup & restore database, OAuth account linking, notifikasi push, dan informasi PWA"
      actions={
        <Button onClick={createBackup} disabled={creating} className="bg-navy-gradient">
          {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          {creating ? 'Memproses...' : 'Backup Sekarang'}
        </Button>
      }
    >
      <Tabs defaultValue="backup">
        <TabsList>
          <TabsTrigger value="backup" className="gap-1.5"><Database className="h-3.5 w-3.5" /> Backup & Restore</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Keamanan & OAuth</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5"><Bell className="h-3.5 w-3.5" /> Notifikasi</TabsTrigger>
          <TabsTrigger value="pwa" className="gap-1.5"><Smartphone className="h-3.5 w-3.5" /> PWA & Mobile</TabsTrigger>
        </TabsList>

        {/* BACKUP TAB */}
        <TabsContent value="backup" className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Backup" value={backups.length} icon={History} color="from-blue-soft to-blue" />
            <StatCard label="Sukses" value={successCount} icon={CheckCircle2} color="from-emerald-400 to-emerald-600" />
            <StatCard label="Gagal" value={failedCount} icon={AlertTriangle} color="from-orange-400 to-orange-600" />
            <StatCard label="Total Size" value={`${(totalSize / 1024 / 1024).toFixed(2)} MB`} icon={HardDrive} color="from-gold-soft to-gold" />
          </div>

          {/* Restore card */}
          <Card className="border-orange-400/30">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600">
                  <Upload className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-navy dark:text-white mb-1">Restore Database</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Unggah file backup JSON untuk restore database. <strong className="text-orange-600">Operasi ini akan menimpa data!</strong> Hanya Super Admin yang dapat melakukan restore.
                  </p>
                  <Label className="block">
                    <span className="sr-only">Pilih file backup</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleRestoreFile}
                      className="block w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-navy-gradient file:text-white file:font-medium file:cursor-pointer hover:file:opacity-90"
                    />
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backup history */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-navy dark:text-white">
                <span className="flex items-center gap-2"><History className="h-5 w-5 text-gold" /> Riwayat Backup</span>
                <Button variant="ghost" size="sm" onClick={load}><RefreshCw className="h-3.5 w-3.5" /></Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}
                </div>
              ) : (
                <div className="divide-y divide-border max-h-[500px] overflow-y-auto scrollbar-premium">
                  {backups.map((b, i) => (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="p-3 hover:bg-muted/30 transition-colors flex items-center gap-3"
                    >
                      <div className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg ${
                        b.status === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                        : b.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600'
                      }`}>
                        {b.status === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-navy dark:text-white truncate">{b.fileName}</span>
                          <Badge variant="outline" className={`text-[9px] ${
                            b.type === 'manual' ? 'border-blue-400/40 text-blue-600'
                            : 'border-purple-400/40 text-purple-600'
                          }`}>{b.type}</Badge>
                          <Badge variant="outline" className={`text-[9px] ${
                            b.status === 'success' ? 'border-emerald-400/40 text-emerald-600'
                            : b.status === 'failed' ? 'border-red-400/40 text-red-600'
                            : 'border-orange-400/40 text-orange-600'
                          }`}>{b.status}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {timeAgo(b.createdAt)}</span>
                          {b.fileSize != null && <span>{(b.fileSize / 1024).toFixed(1)} KB</span>}
                          {b.recordCount != null && <span>{b.recordCount} records</span>}
                          {b.triggeredBy && <span>by {b.triggeredBy.name}</span>}
                        </div>
                        {b.notes && <p className="text-[10px] text-muted-foreground mt-0.5 italic line-clamp-1">{b.notes}</p>}
                      </div>
                      {user?.role === 'SUPER_ADMIN' && (
                        <Button size="sm" variant="ghost" onClick={() => deleteBackup(b.id)} className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security" className="space-y-4">
          {/* OAuth section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-navy dark:text-white">
                <KeyRound className="h-5 w-5 text-gold" /> OAuth Account Linking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Kelola koneksi akun Google/Microsoft untuk login alternatif. Setelah di-link, Anda bisa login dengan satu klik melalui OAuth provider.
              </p>
              {['Google', 'Microsoft'].map((provider) => (
                <div key={provider} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-card border border-border">
                      {provider === 'Google' ? (
                        <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="#F25022" d="M1 1h10v10H1z"/><path fill="#7FBA00" d="M13 1h10v10H13z"/><path fill="#00A4EF" d="M1 13h10v10H1z"/><path fill="#FFB900" d="M13 13h10v10H13z"/></svg>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-navy dark:text-white">{provider}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {provider === 'Google' ? 'Belum terhubung' : 'Tidak tersedia dalam demo'}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.info(`${provider} OAuth simulation — fitur ini memerlukan konfigurasi OAuth credentials asli di production`)}
                  >
                    {provider === 'Google' ? <><KeyRound className="mr-1.5 h-3.5 w-3.5" /> Hubungkan</> : 'Segera Hadir'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Password policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-navy dark:text-white">
                <Lock className="h-5 w-5 text-gold" /> Password Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Minimum 8 karakter', enabled: true },
                { label: 'Wajib mengandung huruf besar & kecil', enabled: true },
                { label: 'Wajib mengandung angka', enabled: true },
                { label: 'Wajib mengandung simbol', enabled: false },
                { label: 'Rotasi password setiap 90 hari', enabled: false },
                { label: 'Two-Factor Authentication (2FA)', enabled: false },
              ].map((p) => (
                <div key={p.label} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-sm text-foreground/80">{p.label}</span>
                  <Badge variant="outline" className={`text-[10px] ${p.enabled ? 'border-emerald-400/40 text-emerald-600' : 'border-muted-foreground/30 text-muted-foreground'}`}>
                    {p.enabled ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICATIONS TAB */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-navy dark:text-white">
                <Bell className="h-5 w-5 text-gold" /> Pengaturan Notifikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Push notification permission */}
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-sm text-navy dark:text-white flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-gold" /> Push Notification
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Izinkan browser mengirim push notification untuk notifikasi real-time (pendaftaran kegiatan, sertifikat baru, pengumuman).
                    </p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] flex-shrink-0 ${
                    pushPermission === 'granted' ? 'border-emerald-400/40 text-emerald-600'
                    : pushPermission === 'denied' ? 'border-red-400/40 text-red-600'
                    : 'border-orange-400/40 text-orange-600'
                  }`}>
                    {pushPermission === 'granted' ? 'Granted' : pushPermission === 'denied' ? 'Denied' : 'Default'}
                  </Badge>
                </div>
                {pushPermission !== 'granted' && (
                  <Button
                    size="sm"
                    className="mt-3 bg-navy-gradient"
                    onClick={async () => {
                      const ok = await requestPermission()
                      if (ok) {
                        toast.success('Push notification diaktifkan')
                        // Send test notification
                        if ('Notification' in window) {
                          new Notification('IAA Digital - Notifikasi Aktif', {
                            body: 'Anda akan menerima notifikasi real-time dari portal IAA Digital.',
                            icon: '/icon-192.svg',
                          })
                        }
                      } else {
                        toast.error('Izin notifikasi ditolak'
                      )
                      }
                    }}
                  >
                    <Bell className="mr-2 h-3.5 w-3.5" /> Aktifkan Push Notification
                  </Button>
                )}
              </div>

              {/* Notification channels */}
              <div>
                <h4 className="font-semibold text-sm text-navy dark:text-white mb-2">Channel Notifikasi</h4>
                <div className="space-y-2">
                  {[
                    { channel: 'In-App (Bell Icon)', status: 'Aktif', icon: Bell, color: 'emerald' },
                    { channel: 'Email', status: 'Aktif', icon: Cloud, color: 'emerald' },
                    { channel: 'Push Notification (PWA)', status: pushPermission === 'granted' ? 'Aktif' : 'Nonaktif', icon: Smartphone, color: pushPermission === 'granted' ? 'emerald' : 'orange' },
                    { channel: 'WhatsApp Gateway', status: 'Segera Hadir', icon: Cloud, color: 'orange' },
                  ].map((c) => (
                    <div key={c.channel} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        <c.icon className="h-4 w-4 text-gold" />
                        <span className="text-sm">{c.channel}</span>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${
                        c.color === 'emerald' ? 'border-emerald-400/40 text-emerald-600'
                        : 'border-orange-400/40 text-orange-600'
                      }`}>{c.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PWA TAB */}
        <TabsContent value="pwa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-navy dark:text-white">
                <Smartphone className="h-5 w-5 text-gold" /> Progressive Web App (PWA)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-border p-4">
                  <FileJson className="h-6 w-6 text-gold mb-2" />
                  <div className="font-semibold text-sm text-navy dark:text-white">Manifest</div>
                  <div className="text-xs text-muted-foreground mt-1">manifest.json terdaftar dengan icons 192x192 & 512x512</div>
                  <Badge variant="outline" className="text-[10px] mt-2 border-emerald-400/40 text-emerald-600">Aktif</Badge>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <Cloud className="h-6 w-6 text-gold mb-2" />
                  <div className="font-semibold text-sm text-navy dark:text-white">Service Worker</div>
                  <div className="text-xs text-muted-foreground mt-1">Offline cache dengan stale-while-revalidate strategy</div>
                  <Badge variant="outline" className="text-[10px] mt-2 border-emerald-400/40 text-emerald-600">Aktif</Badge>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <Smartphone className="h-6 w-6 text-gold mb-2" />
                  <div className="font-semibold text-sm text-navy dark:text-white">Install Prompt</div>
                  <div className="text-xs text-muted-foreground mt-1">Banner install muncul otomatis setelah 3 detik (dismissable 7 hari)</div>
                  <Badge variant="outline" className="text-[10px] mt-2 border-emerald-400/40 text-emerald-600">Aktif</Badge>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <Bell className="h-6 w-6 text-gold mb-2" />
                  <div className="font-semibold text-sm text-navy dark:text-white">Push Notification</div>
                  <div className="text-xs text-muted-foreground mt-1">Handler push notification di service worker</div>
                  <Badge variant="outline" className={`text-[10px] mt-2 ${pushPermission === 'granted' ? 'border-emerald-400/40 text-emerald-600' : 'border-orange-400/40 text-orange-600'}`}>
                    {pushPermission === 'granted' ? 'Aktif' : 'Pending'}
                  </Badge>
                </div>
              </div>

              {/* App shortcuts */}
              <div className="rounded-lg border border-border p-4">
                <h4 className="font-semibold text-sm text-navy dark:text-white mb-2">App Shortcuts (dari manifest)</h4>
                <div className="space-y-1.5">
                  {[
                    { name: 'Dashboard Anggota', url: '/?view=member-dashboard' },
                    { name: 'Verifikasi Sertifikat', url: '/?view=verify-certificate' },
                    { name: 'Digital Library', url: '/?view=library' },
                  ].map((s) => (
                    <div key={s.name} className="flex items-center justify-between text-xs py-1">
                      <span className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-gold" /> {s.name}
                      </span>
                      <code className="text-muted-foreground font-mono">{s.url}</code>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Restore dialog */}
      <Dialog open={restoreOpen} onOpenChange={setRestoreOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" /> Konfirmasi Restore Database
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
              <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                <strong>Peringatan!</strong> Operasi restore akan menimpa data database saat ini dengan data dari file backup.
                Tindakan ini <strong>tidak dapat dibatalkan</strong>. Pastikan Anda telah membuat backup terbaru sebelum melanjutkan.
              </p>
            </div>
            {restoreData?.meta && (
              <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
                <div><strong>Backup dari:</strong> {new Date(restoreData.meta.exportedAt).toLocaleString('id-ID')}</div>
                <div><strong>Total records:</strong> {restoreData.meta.totalRecords}</div>
                <div><strong>Exported by:</strong> {restoreData.meta.exportedBy}</div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="confirm">Ketik "RESTORE" untuk konfirmasi</Label>
              <Input
                id="confirm"
                value={restoreConfirm}
                onChange={(e) => setRestoreConfirm(e.target.value)}
                placeholder="RESTORE"
                className="font-mono uppercase"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRestoreOpen(false); setRestoreData(null); setRestoreConfirm('') }}>
              Batal
            </Button>
            <Button
              onClick={performRestore}
              disabled={restoring || restoreConfirm !== 'RESTORE'}
              variant="destructive"
            >
              {restoring ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Restore Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: any; icon: any; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${color} text-white mb-2`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-2xl font-bold font-display text-navy dark:text-white">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  )
}
