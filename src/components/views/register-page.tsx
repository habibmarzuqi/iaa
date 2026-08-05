'use client'
import * as React from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  ArrowLeft, UserPlus, Loader2, Mail, Lock, User as UserIcon, Building2,
  Briefcase, GraduationCap, Phone, CheckCircle2, AlertCircle, ShieldCheck, FileText, ArrowRight
} from 'lucide-react'
import { toast } from 'sonner'

const WORK_UNITS = [
  'Sekretariat Utama',
  'Deputi Bidang Tata Kelola Kearsipan Nasional',
  'Deputi Bidang Penyelamatan, Pelestarian, dan Pelindungan Arsip',
  'Deputi Bidang Sistem dan Informasi Kearsipan Nasional',
  'Biro Manajemen Kinerja, Keuangan, dan Organisasi',
  'Biro Hukum, Kerja Sama, dan Hubungan Masyarakat',
  'Biro Kepegawaian dan Umum',
  'Direktorat Kearsipan Pusat',
  'Direktorat Kearsipan Daerah I',
  'Direktorat Kearsipan Daerah II',
  'Direktorat SDM Kearsipan dan Sertifikasi',
  'Direktorat Penyelamatan Arsip',
  'Direktorat Pengolahan Arsip',
  'Direktorat Pelestarian dan Pelindungan Arsip',
  'Direktorat Layanan dan Pemanfaatan Arsip',
  'Direktorat Informasi Kearsipan',
  'Direktorat Teknologi Informasi Kearsipan',
  'Direktorat Sistem Kearsipan',
  'Balai Arsip Statis dan Tsunami',
  'Pusat Pengawasan dan Akreditasi Kearsipan',
  'Pusat Pelatihan Sumber Daya Manusia',
  'Pusat Data, Informasi, dan Jasa Teknis Kearsipan',
  'Pusat Studi Arsip Statis Kepresidenan',
  'Inspektorat',
]

const POSITIONS = [
  'Arsiparis Ahli Utama',
  'Arsiparis Ahli Madya',
  'Arsiparis Ahli Muda',
  'Arsiparis Ahli Pertama',
  'Arsiparis Penyelia',
  'Arsiparis Mahir',
  'Arsiparis Terampil',
]

const DEFAULT_AD_ART = `
ANGGARAN DASAR & ANGGARAN RUMAH TANGGA (AD/ART)
IKATAN ARSIPARIS ANRI (IAA)

BAB I — NAMA, WAKTU, DAN KEDUDUKAN
Pasal 1: Organisasi ini bernama Ikatan Arsiparis ANRI (disingkat IAA).
Pasal 2: IAA berkedudukan di Kantor Arsip Nasional Republik Indonesia (ANRI) Jakarta.

BAB II — ASAS DAN TUJUAN
Pasal 3: IAA berasaskan Pancasila dan Undang-Undang Dasar 1945.
Pasal 4: IAA bertujuan meningkatkan profesionalisme, integritas, dan kesejahteraan Arsiparis serta memajukan kearsipan nasional.

BAB III — KEANGGOTAAN DAN HAK/KEWAJIBAN
Pasal 5: Anggota IAA terdiri dari Anggota Biasa, Anggota Luar Biasa, dan Anggota Kehormatan.
Pasal 6: Setiap Anggota berkewajiban menjunjung tinggi integritas, kode etik profesi, membela nama baik organisasi, serta mematuhi seluruh ketetapan AD/ART IAA.
`

export function RegisterPage() {
  const { setView } = useApp()
  const [step, setStep] = React.useState<1 | 2>(1)
  const [form, setForm] = React.useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    nip: '',
    workUnit: '',
    position: '',
    education: '',
    agreedToAdArt: false,
  })
  const [loading, setLoading] = React.useState(false)
  const [adArtText, setAdArtText] = React.useState(DEFAULT_AD_ART)
  const [success, setSuccess] = React.useState<{ fullName: string; email: string } | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch dynamic AD/ART text from site settings if available
  React.useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.settings?.ad_art_content) {
          setAdArtText(d.settings.ad_art_content)
        }
      })
      .catch(() => {})
  }, [])

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.email || !form.password || !form.fullName) {
      setError('Email, password, dan nama lengkap wajib diisi')
      return
    }
    if (form.password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Konfirmasi password tidak cocok')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Format email tidak valid')
      return
    }

    setStep(2)
  }

  const submit = async () => {
    setError(null)
    if (!form.agreedToAdArt) {
      setError('Anda harus menyetujui AD/ART serta Kode Etik IAA untuk dapat mendaftar')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          phone: form.phone || undefined,
          nip: form.nip || undefined,
          workUnit: form.workUnit || undefined,
          position: form.position || undefined,
          education: form.education || undefined,
          agreedToAdArt: form.agreedToAdArt,
        }),
      })

      const d = await res.json()
      if (!res.ok) {
        setError(d.error || 'Gagal mendaftar')
        return
      }

      setSuccess({ fullName: form.fullName, email: form.email })
      toast.success('Pengajuan pendaftaran berhasil dikirim!')
    } catch {
      setError('Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-blue-soft to-navy relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gold/15 blur-3xl animate-float-slow" />

      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <button
            onClick={() => {
              if (step === 2) setStep(1)
              else setView({ name: 'login' })
            }}
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-xs mb-4 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {step === 2 ? 'Kembali ke Data Diri' : 'Kembali ke Login'}
          </button>

          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold backdrop-blur-sm mb-4">
              <UserPlus className="h-3.5 w-3.5" /> Pendaftaran Anggota IAA
            </div>
            <h1 className="font-display text-3xl font-extrabold text-white mb-2">
              Daftar sebagai <span className="text-gradient-gold">Anggota IAA</span>
            </h1>
            <p className="text-white/70 text-sm max-w-md mx-auto">
              {step === 1 ? 'Langkah 1: Isi data profil dan akun Anda.' : 'Langkah 2: Persetujuan AD/ART & Kode Etik.'}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-card border border-border shadow-2xl p-6 lg:p-8"
          >
            {/* Step 1: Input Form */}
            {step === 1 && (
              <form onSubmit={handleNextStep} className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-gold" /> Informasi Akun Login
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="nama@anri.go.id"
                        className="pl-10 h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Minimal 6 karakter"
                        className="pl-10 h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Konfirmasi Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        placeholder="Ulangi password"
                        className="pl-10 h-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 pt-3 border-t border-border">
                  <UserIcon className="h-3.5 w-3.5 text-gold" /> Data Pribadi & Kepegawaian
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Nama Lengkap (dengan Gelar) *</Label>
                    <Input
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="Contoh: Dr. Budi Santoso, M.Si."
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Nomor WhatsApp *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="081234567890"
                        className="pl-10 h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>NIP</Label>
                    <Input
                      value={form.nip}
                      onChange={(e) => setForm({ ...form, nip: e.target.value })}
                      placeholder="Nomor Induk Pegawai"
                      className="h-10"
                    />
                  </div>

                  {/* Dropdown Unit Kerja */}
                  <div className="space-y-1.5 min-w-0">
                    <Label>Unit Kerja / Instansi</Label>
                    <Select value={form.workUnit} onValueChange={(v) => setForm({ ...form, workUnit: v })}>
                      <SelectTrigger className="h-10 w-full min-w-0">
                        <SelectValue placeholder="Pilih Unit Kerja ANRI" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto max-w-[calc(100vw-2rem)] sm:max-w-md">
                        {WORK_UNITS.map((u) => (
                          <SelectItem key={u} value={u} className="text-xs sm:text-sm leading-snug py-2 whitespace-normal break-words">{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dropdown Jabatan / Jenjang */}
                  <div className="space-y-1.5 min-w-0">
                    <Label>Jabatan / Jenjang Arsiparis</Label>
                    <Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}>
                      <SelectTrigger className="h-10 w-full min-w-0">
                        <SelectValue placeholder="Pilih Jenjang Arsiparis" />
                      </SelectTrigger>
                      <SelectContent>
                        {POSITIONS.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Pendidikan Terakhir</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={form.education}
                        onChange={(e) => setForm({ ...form, education: e.target.value })}
                        placeholder="Contoh: S1 Kearsipan / S2 Manajemen"
                        className="pl-10 h-10"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <Button type="submit" className="w-full h-11 bg-navy-gradient font-semibold">
                  Lanjut ke Persetujuan AD/ART <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Sudah punya akun?{' '}
                  <button type="button" onClick={() => setView({ name: 'login' })} className="text-blue-brand font-semibold hover:underline">
                    Masuk di sini
                  </button>
                </p>
              </form>
            )}

            {/* Step 2: AD/ART & Statement */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gold" /> Anggaran Dasar & Anggaran Rumah Tangga (AD/ART)
                </div>

                {/* AD/ART Scrollable Terms */}
                <div className="rounded-xl border border-border bg-muted/30 p-4 max-h-64 overflow-y-auto scrollbar-premium text-xs text-foreground/80 leading-relaxed font-mono whitespace-pre-wrap">
                  {adArtText}
                </div>

                {/* Agreement Checkbox */}
                <div className="p-4 rounded-xl border border-gold/30 bg-gold/5 space-y-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="adart-checkbox"
                      checked={form.agreedToAdArt}
                      onCheckedChange={(checked) => setForm({ ...form, agreedToAdArt: !!checked })}
                      className="mt-0.5"
                    />
                    <label htmlFor="adart-checkbox" className="text-xs text-navy dark:text-white font-medium cursor-pointer leading-normal">
                      Dengan ini saya menyatakan <strong>patuh dan tunduk</strong> pada Anggaran Dasar / Anggaran Rumah Tangga (AD/ART) serta Kode Etik Ikatan Arsiparis ANRI (IAA).
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-1/3 h-11">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                  </Button>
                  <Button
                    type="button"
                    onClick={submit}
                    disabled={loading || !form.agreedToAdArt}
                    className="w-2/3 h-11 bg-navy-gradient font-semibold"
                  >
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim...</>
                    ) : (
                      <><ShieldCheck className="mr-2 h-4 w-4 text-gold" /> Kirim Pengajuan Pendaftaran</>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Step 3: Success Dialog */}
      <Dialog open={!!success} onOpenChange={(o) => { if (!o) setView({ name: 'login' }) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-navy dark:text-white text-lg font-bold">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0" />
              Pengajuan Pendaftaran Berhasil
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-800 dark:text-emerald-300">
              Pengajuan Pendaftaran Anda berhasil dikirim. Akun menunggu persetujuan pengurus IAA.
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-muted-foreground">Nama Lengkap:</span>
                <span className="font-semibold text-navy dark:text-white text-right">{success?.fullName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-mono font-semibold text-right">{success?.email}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-muted-foreground">Nomor Anggota:</span>
                <span className="text-red-500 font-semibold flex items-center gap-1">
                  ❌ Belum diterbitkan (menunggu persetujuan)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status:</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold text-[11px]">
                  ⏳ Menunggu Persetujuan
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setView({ name: 'login' })} className="bg-navy-gradient w-full h-10">
              Kembali ke Halaman Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
