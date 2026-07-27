'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { PublicLayout } from '@/components/layout/public-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IAALogo } from '@/components/iaa-logo'
import { QRCodeSVG } from 'qrcode.react'
import {
  Shield, Search, CheckCircle2, XCircle, Award, User, Calendar,
  Hash, FileText, Building2, AlertCircle, ArrowLeft, Loader2, Sparkles,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { formatDate } from '@/lib/helpers'

interface VerifyResult {
  valid: boolean
  certificate?: {
    certificateNumber: string
    title: string
    description: string | null
    issuedAt: string
    template: string
    member: {
      fullName: string
      memberNumber: string
      arsiparisLevel: string | null
      status: string
    } | null
    isMember: boolean
    participantName: string | null
    participantEmail: string | null
    participantInstitution: string | null
    event: { title: string; startDate: string; location: string } | null
    issuedBy: { name: string }
  }
  error?: string
}

export function VerifyCertificateView() {
  const { setView } = useApp()
  const [number, setNumber] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<VerifyResult | null>(null)

  const verify = async (e?: React.FormEvent, overrideNumber?: string) => {
    e?.preventDefault()
    const num = overrideNumber ?? number
    if (!num.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`/api/certificates?verify=${encodeURIComponent(num.trim())}`)
      const d = await res.json()
      setResult(d)
    } catch {
      setResult({ valid: false, error: 'Gagal terhubung ke server' })
    } finally {
      setLoading(false)
    }
  }

  // Demo certificates for quick test
  const demoCerts = ['IAA-CERT-2026-0001', 'IAA-CERT-2025-0048', 'IAA-CERT-2026-0012']

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-gradient text-white py-16 relative">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gold/15 blur-3xl animate-float-slow" />
        <div className="relative mx-auto max-w-4xl px-4 lg:px-8 text-center">
          <Button variant="ghost" onClick={() => setView({ name: 'public' })} className="text-white/70 hover:text-white hover:bg-white/10 mb-4">
            <ArrowLeft className="mr-1 h-4 w-4" /> Beranda
          </Button>
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold backdrop-blur-sm mb-4">
            <Shield className="h-3.5 w-3.5" /> Verifikasi Sertifikat
          </div>
          <h1 className="font-display text-4xl lg:text-5xl font-extrabold leading-tight">
            Verifikasi <span className="text-gradient-gold">E-Certificate</span>
          </h1>
          <p className="text-white/70 mt-3 max-w-2xl mx-auto">
            Periksa keaslian sertifikat yang diterbitkan oleh Ikatan Arsiparis ANRI (IAA). Masukkan nomor sertifikat atau pindai QR Code pada sertifikat.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 lg:px-8 py-12">
        {/* Search form */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <form onSubmit={verify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="certNumber" className="text-sm font-semibold">Nomor Sertifikat</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="certNumber"
                      placeholder="IAA-CERT-2026-0001"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="pl-10 font-mono uppercase"
                      autoFocus
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="bg-navy-gradient">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    <span className="ml-2 hidden sm:inline">Verifikasi</span>
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>Coba contoh:</span>
                {demoCerts.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { setNumber(c); verify(undefined, c) }}
                    className="font-mono px-2 py-0.5 rounded border border-border bg-muted/50 hover:border-gold/40 hover:text-navy dark:hover:text-white transition-colors"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {result.valid && result.certificate ? (
              <Card className="overflow-hidden border-emerald-400/40 shadow-gold-glow">
                {/* Valid banner */}
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800 p-4 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-emerald-700 dark:text-emerald-300">Sertifikat Valid & Terverifikasi</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400">Sertifikat ini diterbitkan resmi oleh Ikatan Arsiparis ANRI</div>
                  </div>
                </div>

                <CardContent className="p-6 space-y-5">
                  {/* Certificate preview */}
                  <CertPreview cert={result.certificate} />

                  {/* Details */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <DetailRow icon={Hash} label="Nomor Sertifikat" value={result.certificate.certificateNumber} mono />
                    <DetailRow icon={User} label="Penerima" value={(result.certificate.isMember ? result.certificate.member?.fullName : result.certificate.participantName)} />
                    <DetailRow icon={Hash} label="No. Anggota" value={(result.certificate.member?.memberNumber || "-")} mono />
                    <DetailRow icon={Award} label="Jenjang Arsiparis" value={result.certificate.member.arsiparisLevel ?? '-'} />
                    <DetailRow icon={FileText} label="Judul" value={result.certificate.title} />
                    <DetailRow icon={Calendar} label="Tanggal Terbit" value={formatDate(result.certificate.issuedAt)} />
                    {result.certificate.event && (
                      <>
                        <DetailRow icon={Building2} label="Kegiatan" value={result.certificate.event.title} />
                        <DetailRow icon={Calendar} label="Tanggal Kegiatan" value={formatDate(result.certificate.event.startDate)} />
                      </>
                    )}
                    <DetailRow icon={User} label="Diterbitkan oleh" value={result.certificate.issuedBy.name} />
                  </div>

                  {/* QR */}
                  <div className="rounded-xl bg-muted/40 p-4 flex items-center gap-4">
                    <div className="bg-white rounded-lg p-2 shadow-sm">
                      <QRCodeSVG
                        value={JSON.stringify({
                          no: result.certificate.certificateNumber,
                          name: (result.certificate.isMember ? result.certificate.member?.fullName : result.certificate.participantName),
                          verify: 'https://iaa-anri.go.id/verify',
                        })}
                        size={80}
                        level="M"
                        fgColor="#0a1e3f"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-navy dark:text-white flex items-center gap-1.5">
                        <Shield className="h-4 w-4 text-emerald-600" /> QR Code Verifikasi
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 max-w-md">
                        QR Code ini dapat dipindai untuk mengonfirmasi keaslian sertifikat. Setiap sertifikat memiliki nomor unik yang terdaftar di database IAA.
                      </p>
                    </div>
                  </div>

                  {result.certificate.description && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Deskripsi</h4>
                      <p className="text-sm text-foreground/80 leading-relaxed">{result.certificate.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-red-400/40">
                <CardContent className="p-8 text-center">
                  <div className="grid h-16 w-16 mx-auto place-items-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 mb-4">
                    <XCircle className="h-9 w-9" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-navy dark:text-white mb-2">Sertifikat Tidak Ditemukan</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {result.error || 'Nomor sertifikat yang Anda masukkan tidak terdaftar dalam database IAA. Pastikan penulisan nomor sudah benar.'}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Jika sertifikat Anda baru saja diterbitkan, verifikasi dapat membutuhkan waktu hingga 24 jam.
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* Empty state hint */}
        {!result && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="grid h-16 w-16 mx-auto place-items-center rounded-full bg-muted text-muted-foreground mb-3">
              <Search className="h-7 w-7" />
            </div>
            <p className="text-sm text-muted-foreground">Masukkan nomor sertifikat di atas untuk memverifikasi keasliannya</p>
          </motion.div>
        )}
      </div>
    </PublicLayout>
  )
}

function CertPreview({ cert }: { cert: NonNullable<VerifyResult['certificate']> }) {
  const templateColors: Record<string, { bg: string; accent: string; label: string }> = {
    default: { bg: 'from-[#0a1e3f] via-[#1e3a6b] to-[#061229]', accent: '#c9a227', label: 'SERTIFIKAT' },
    webinar: { bg: 'from-[#1d4ed8] via-[#3b82f6] to-[#1e3a6b]', accent: '#fde047', label: 'SERTIFIKAT WEBINAR' },
    training: { bg: 'from-[#059669] via-[#10b981] to-[#047857]', accent: '#fde047', label: 'SERTIFIKAT PELATIHAN' },
    workshop: { bg: 'from-[#ea580c] via-[#fb923c] to-[#9a3412]', accent: '#fef3c7', label: 'SERTIFIKAT WORKSHOP' },
  }
  const t = templateColors[cert.template] ?? templateColors.default
  return (
    <div className={`relative aspect-[1.414/1] w-full max-w-md mx-auto rounded-lg overflow-hidden shadow-xl bg-gradient-to-br ${t.bg} text-white`}>
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl" style={{ backgroundColor: t.accent + '40' }} />
      <div className="absolute inset-3 border-2 rounded" style={{ borderColor: t.accent + '60' }} />
      <div className="absolute inset-4 border rounded" style={{ borderColor: t.accent + '30' }} />
      <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="flex items-center gap-2 mb-3"><IAALogo light /></div>
        <div className="text-[10px] tracking-[0.3em] font-semibold mb-1" style={{ color: t.accent }}>IKATAN ARSIPARIS ANRI</div>
        <h2 className="font-display text-xl lg:text-2xl font-extrabold mb-3" style={{ color: t.accent }}>{t.label}</h2>
        <div className="text-xs text-white/60 mb-1">Diberikan kepada:</div>
        <div className="font-display text-lg lg:text-xl font-bold mb-3">{(cert.isMember ? cert.member?.fullName : cert.participantName)}</div>
        <div className="text-xs text-white/80 max-w-md mb-4">{cert.title}</div>
        <div className="flex items-end justify-between w-full mt-auto pt-3">
          <div className="text-left">
            <div className="text-[10px] text-white/60">Tanggal</div>
            <div className="text-xs font-semibold">{formatDate(cert.issuedAt)}</div>
          </div>
          <div className="bg-white rounded p-1">
            <QRCodeSVG value={cert.certificateNumber} size={40} level="M" fgColor="#0a1e3f" />
          </div>
          <div className="text-right">
            <div className="text-[10px] text-white/60">Oleh</div>
            <div className="text-xs font-semibold">{cert.issuedBy.name.split(',')[0]}</div>
          </div>
        </div>
        <div className="absolute bottom-1 left-0 right-0 text-center text-[9px] text-white/40 font-mono">{cert.certificateNumber}</div>
      </div>
    </div>
  )
}

function DetailRow({ icon: Icon, label, value, mono = false }: { icon: any; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
      <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-gold/10 text-gold">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
        <div className={`text-sm font-medium text-navy dark:text-white ${mono ? 'font-mono' : ''} truncate`}>{value}</div>
      </div>
    </div>
  )
}
