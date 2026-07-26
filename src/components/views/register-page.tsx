'use client'
import * as React from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ArrowLeft, UserPlus, Loader2, Mail, Lock, User as UserIcon, Building2, Briefcase, GraduationCap, Hash, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export function RegisterPage() {
  const { setView } = useApp()
  const [form, setForm] = React.useState({ email:'', password:'', confirmPassword:'', name:'', fullName:'', memberNumber:'', nip:'', workUnit:'', position:'', education:'' })
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState<{memberNumber:string; email:string}|null>(null)
  const [error, setError] = React.useState<string|null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null)
    if (!form.email || !form.password || !form.name || !form.fullName) { setError('Email, password, nama, dan nama lengkap wajib diisi'); return }
    if (form.password.length < 6) { setError('Password minimal 6 karakter'); return }
    if (form.password !== form.confirmPassword) { setError('Password tidak cocok'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Format email tidak valid'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email:form.email, password:form.password, name:form.name, fullName:form.fullName, memberNumber:form.memberNumber||undefined, nip:form.nip||undefined, workUnit:form.workUnit||undefined, position:form.position||undefined, education:form.education||undefined }) })
      const d = await res.json()
      if (!res.ok) { setError(d.error||'Gagal mendaftar'); return }
      setSuccess({ memberNumber:d.memberNumber, email:form.email })
      toast.success('Pendaftaran berhasil!')
    } catch { setError('Terjadi kesalahan jaringan') } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-blue-soft to-navy relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gold/15 blur-3xl animate-float-slow" />
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <button onClick={() => setView({ name:'login' })} className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-xs mb-4"><ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Login</button>
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold backdrop-blur-sm mb-4"><UserPlus className="h-3.5 w-3.5" /> Pendaftaran Anggota Baru</div>
            <h1 className="font-display text-3xl font-extrabold text-white mb-2">Daftar sebagai <span className="text-gradient-gold">Anggota IAA</span></h1>
            <p className="text-white/70 text-sm max-w-md mx-auto">Isi formulir untuk mendaftar. Pendaftaran akan ditinjau oleh pengurus.</p>
          </div>
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="rounded-2xl bg-card border border-border shadow-2xl p-6 lg:p-8">
            <form onSubmit={submit} className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Lock className="h-3.5 w-3.5" /> Informasi Akun</div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Email *</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="nama@anri.go.id" className="pl-10 h-10" /></div></div>
                <div className="space-y-1.5"><Label>Nama Singkat *</Label><div className="relative"><UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Budi Santoso" className="pl-10 h-10" /></div></div>
                <div className="space-y-1.5"><Label>Password *</Label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Min 6 karakter" className="pl-10 h-10" /></div></div>
                <div className="space-y-1.5"><Label>Konfirmasi Password *</Label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="password" value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} placeholder="Ulangi" className="pl-10 h-10" /></div></div>
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 pt-3 border-t border-border"><UserIcon className="h-3.5 w-3.5" /> Data Pribadi</div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 sm:col-span-2"><Label>Nama Lengkap (dengan gelar) *</Label><Input value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} placeholder="Dr. Budi Santoso, M.Si." /></div>
                <div className="space-y-1.5"><Label>Nomor Anggota (opsional)</Label><div className="relative"><Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={form.memberNumber} onChange={e=>setForm({...form,memberNumber:e.target.value})} placeholder="Auto-generate" className="pl-10 h-10" /></div></div>
                <div className="space-y-1.5"><Label>NIP</Label><div className="relative"><Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={form.nip} onChange={e=>setForm({...form,nip:e.target.value})} placeholder="NIP" className="pl-10 h-10" /></div></div>
                <div className="space-y-1.5"><Label>Unit Kerja</Label><div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={form.workUnit} onChange={e=>setForm({...form,workUnit:e.target.value})} placeholder="ANRI" className="pl-10 h-10" /></div></div>
                <div className="space-y-1.5"><Label>Jabatan</Label><div className="relative"><Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={form.position} onChange={e=>setForm({...form,position:e.target.value})} placeholder="Arsiparis" className="pl-10 h-10" /></div></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Pendidikan</Label><div className="relative"><GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={form.education} onChange={e=>setForm({...form,education:e.target.value})} placeholder="S1 Kearsipan" className="pl-10 h-10" /></div></div>
              </div>
              {error && <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 flex items-start gap-2 text-sm text-red-700"><AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" /><span>{error}</span></div>}
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 text-xs text-blue-700 dark:text-blue-300"><strong>Catatan:</strong> Akun berstatus PENDING dan perlu disetujui pengurus sebelum bisa login.</div>
              <Button type="submit" disabled={loading} className="w-full h-11 bg-navy-gradient font-semibold">{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mendaftarkan...</> : <><UserPlus className="mr-2 h-4 w-4" /> Daftar Sekarang</>}</Button>
              <p className="text-center text-xs text-muted-foreground">Sudah punya akun? <button type="button" onClick={()=>setView({name:'login'})} className="text-blue-brand font-semibold hover:underline">Masuk di sini</button></p>
            </form>
          </motion.div>
        </div>
      </div>
      <Dialog open={!!success} onOpenChange={o=>{if(!o)setView({name:'login'})}}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-navy dark:text-white"><CheckCircle2 className="h-6 w-6 text-emerald-600" /> Pendaftaran Berhasil</DialogTitle></DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-muted-foreground">Pendaftaran Anda berhasil dikirim. Akun menunggu persetujuan pengurus IAA.</p>
            <div className="rounded-lg bg-muted/40 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Email:</span><span className="font-mono font-semibold">{success?.email}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Nomor Anggota:</span><span className="font-mono font-semibold">{success?.memberNumber}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status:</span><span className="text-orange-600 font-semibold">Menunggu Persetujuan</span></div>
            </div>
          </div>
          <DialogFooter><Button onClick={()=>setView({name:'login'})} className="bg-navy-gradient w-full">Kembali ke Login</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
