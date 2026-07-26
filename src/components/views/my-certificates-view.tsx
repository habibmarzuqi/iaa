'use client'
import * as React from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/lib/store'
import { PublicLayout } from '@/components/layout/public-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Award, Search, Mail, Calendar, FileText, Building2, User, Loader2, Download, Share2, CheckCircle2 } from 'lucide-react'
import { formatDate } from '@/lib/helpers'
import { toast } from 'sonner'

const TEMPLATE_COLORS: Record<string, { bg: string; accent: string; label: string }> = {
  default: { bg: 'from-[#0a1e3f] via-[#1e3a6b] to-[#061229]', accent: '#c9a227', label: 'SERTIFIKAT' },
  webinar: { bg: 'from-[#1d4ed8] via-[#3b82f6] to-[#1e3a6b]', accent: '#fde047', label: 'SERTIFIKAT WEBINAR' },
  training: { bg: 'from-[#059669] via-[#10b981] to-[#047857]', accent: '#fde047', label: 'SERTIFIKAT PELATIHAN' },
  workshop: { bg: 'from-[#ea580c] via-[#fb923c] to-[#9a3412]', accent: '#fef3c7', label: 'SERTIFIKAT WORKSHOP' },
}

export function MyCertificatesView() {
  const { setView } = useApp()
  const [email, setEmail] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [searched, setSearched] = React.useState(false)
  const [certs, setCerts] = React.useState<any[]>([])

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!email.trim()) return
    setLoading(true); setSearched(true)
    try {
      const res = await fetch(`/api/certificates/my?email=${encodeURIComponent(email.trim())}`)
      const d = await res.json()
      if (!res.ok) { toast.error(d.error||'Gagal'); setCerts([]); return }
      setCerts(d.certificates || [])
      if (!d.certificates?.length) toast.info('Tidak ada sertifikat ditemukan')
      else toast.success(`Ditemukan ${d.certificates.length} sertifikat`)
    } catch { toast.error('Kesalahan jaringan'); setCerts([]) } finally { setLoading(false) }
  }

  const shareCert = (n: string) => { navigator.clipboard.writeText(`${window.location.origin}/?verify=${n}`).then(()=>toast.success('Link disalin!')).catch(()=>toast.info(`Link: ${window.location.origin}/?verify=${n}`)) }

  const downloadCert = (cert: any) => {
    const t = TEMPLATE_COLORS[cert.template] || TEMPLATE_COLORS.default
    const html = `<!DOCTYPE html><html><head><title>${cert.certificateNumber}</title><style>@page{size:A4 landscape;margin:0}body{margin:0;font-family:Georgia,serif}.cert{width:100vw;height:100vh;min-height:210mm;background:linear-gradient(135deg,${t.bg.replace('from-[','').replace(']','').split(' ')[0]} 0%,${t.bg.replace('via-[','').replace(']','').split(' ')[0]} 50%,${t.bg.replace('to-[','').replace(']','').split(' ')[0]} 100%);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative}.b1{position:absolute;inset:20px;border:3px solid ${t.accent};border-radius:8px}.b2{position:absolute;inset:30px;border:1px solid ${t.accent}80;border-radius:4px}.o{font-size:12px;letter-spacing:4px;color:${t.accent};font-weight:bold;margin-bottom:5px}.t{font-size:36px;font-weight:bold;color:${t.accent};margin-bottom:20px}.g{font-size:14px;color:#ffffff99;margin-bottom:5px}.n{font-size:28px;font-weight:bold;margin-bottom:20px}.d{font-size:14px;color:#ffffffcc;max-width:500px;margin-bottom:20px}.f{position:absolute;bottom:50px;left:0;right:0;display:flex;justify-content:space-between;padding:0 60px}.fl{font-size:10px;color:#ffffff60}.fv{font-size:14px;font-weight:bold}.cn{position:absolute;top:40px;right:60px;font-size:10px;color:#ffffff60}</style></head><body><div class="cert"><div class="b1"></div><div class="b2"></div><div class="cn">No: ${cert.certificateNumber}</div><div class="o">IKATAN ARSIPARIS ANRI</div><div class="t">${t.label}</div><div class="g">Diberikan kepada:</div><div class="n">${cert.recipientName||'Peserta'}</div><div class="d">${cert.title}</div>${cert.event?`<div style="font-size:12px;color:#ffffff99;margin-bottom:30px">Kegiatan: ${cert.event.title}</div>`:''}<div class="f"><div><div class="fl">Tanggal</div><div class="fv">${formatDate(cert.issuedAt)}</div></div><div><div class="fl">Diterbitkan oleh</div><div class="fv">${cert.issuedBy?.name||'IAA'}</div></div></div></div><script>window.print()</script></body></html>`
    const w = window.open('', '_blank')
    if (w) { w.document.write(html); w.document.close() } else toast.error('Popup diblokir')
  }

  return (
    <PublicLayout>
      <section className="relative overflow-hidden bg-hero-gradient text-white py-16">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gold/15 blur-3xl animate-float-slow" />
        <div className="relative mx-auto max-w-3xl px-4 lg:px-8 text-center">
          <Badge className="bg-gold text-navy hover:bg-gold mb-4">Sertifikat Saya</Badge>
          <h1 className="font-display text-3xl lg:text-5xl font-extrabold mb-4">Cari & Download <span className="text-gradient-gold">Sertifikat</span></h1>
          <p className="text-white/70 text-sm max-w-xl mx-auto">Masukkan email untuk menemukan semua sertifikat Anda. Berlaku untuk anggota & non-anggota.</p>
        </div>
      </section>
      <section className="py-10">
        <div className="mx-auto max-w-2xl px-4 lg:px-8">
          <Card><CardContent className="p-6">
            <form onSubmit={search} className="space-y-3">
              <Label htmlFor="email" className="text-sm font-semibold">Email Anda</Label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="email" type="email" placeholder="email@contoh.com" value={email} onChange={e=>setEmail(e.target.value)} className="pl-10 h-11" autoFocus /></div>
              <Button type="submit" disabled={loading} className="w-full bg-navy-gradient h-11">{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mencari...</> : <><Search className="mr-2 h-4 w-4" /> Cari Sertifikat</>}</Button>
            </form>
            <div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 text-xs text-blue-700 dark:text-blue-300"><strong>Anggota IAA?</strong> Login untuk lihat sertifikat di dashboard. <button onClick={()=>setView({name:'login'})} className="font-semibold underline">Login di sini</button></div>
          </CardContent></Card>
          {searched && !loading && (
            <div className="mt-6 space-y-4">
              {certs.length === 0 ? (
                <Card><CardContent className="p-10 text-center"><Award className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" /><p className="text-sm text-muted-foreground">Tidak ada sertifikat ditemukan</p></CardContent></Card>
              ) : (
                <>
                  <div className="text-sm text-muted-foreground">Ditemukan <strong className="text-navy dark:text-white">{certs.length}</strong> sertifikat untuk <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{email}</code></div>
                  {certs.map((cert, i) => {
                    const t = TEMPLATE_COLORS[cert.template] || TEMPLATE_COLORS.default
                    return (
                      <motion.div key={cert.certificateNumber} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}>
                        <Card className="overflow-hidden hover:shadow-premium transition-shadow">
                          <div className={`relative h-32 bg-gradient-to-br ${t.bg} text-white p-4 flex flex-col justify-center`}>
                            <div className="absolute inset-2 border rounded" style={{ borderColor: t.accent + '40' }} />
                            <div className="relative text-center"><div className="text-[9px] tracking-widest font-semibold mb-1" style={{ color: t.accent }}>IKATAN ARSIPARIS ANRI</div><div className="text-xs font-bold" style={{ color: t.accent }}>{t.label}</div><div className="text-sm font-bold mt-1">{cert.recipientName}</div></div>
                          </div>
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <code className="text-xs font-mono font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded">{cert.certificateNumber}</code>
                              <Badge variant="outline" className={cert.isMember ? "text-[9px] border-blue-400/40 text-blue-600" : "text-[9px] border-purple-400/40 text-purple-600"}>{cert.isMember ? 'Anggota IAA' : 'Non-Anggota'}</Badge>
                            </div>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-muted-foreground" /> {cert.title}</div>
                              <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-muted-foreground" /> {formatDate(cert.issuedAt)}</div>
                              {cert.event && <div className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-muted-foreground" /> {cert.event.title}</div>}
                            </div>
                            <div className="flex gap-2 pt-1">
                              <Button size="sm" variant="outline" className="flex-1" onClick={()=>downloadCert(cert)}><Download className="mr-2 h-3.5 w-3.5" /> Download</Button>
                              <Button size="sm" variant="outline" className="flex-1" onClick={()=>shareCert(cert.certificateNumber)}><Share2 className="mr-2 h-3.5 w-3.5" /> Bagikan</Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  )
}
