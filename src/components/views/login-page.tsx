'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/lib/store'
import { IAALogo } from '@/components/iaa-logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles, Loader2, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { roleLabel } from '@/lib/store'

const DEMO_CREDENTIALS = [
  { role: 'SUPER_ADMIN' as const, email: 'superadmin@iaa-anri.go.id', label: 'Super Admin', desc: 'Akses penuh sistem' },
  { role: 'ADMINISTRATOR' as const, email: 'admin@iaa-anri.go.id', label: 'Administrator', desc: 'Kelola konten & anggota' },
  { role: 'PENGURUS' as const, email: 'pengurus@iaa-anri.go.id', label: 'Pengurus', desc: 'Monitoring & approval' },
  { role: 'ANGGOTA' as const, email: 'anggota@iaa-anri.go.id', label: 'Anggota', desc: 'Portal anggota' },
]

export function LoginPage() {
  const { setUser, setView } = useApp()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [show, setShow] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Email dan password wajib diisi')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Login gagal')
        return
      }
      setUser(data.user)
      toast.success(`Selamat datang, ${data.user.name.split(',')[0]}!`)

      // Route based on role
      if (data.user.role === 'ANGGOTA') {
        setView({ name: 'member-dashboard' })
      } else {
        setView({ name: 'admin-dashboard' })
      }
    } catch {
      toast.error('Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('iaa12345')
    toast.info('Kredensial demo terisi. Klik "Masuk" untuk lanjut.')
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex flex-col p-6 lg:p-10 bg-background">
        <button
          onClick={() => setView({ name: 'public' })}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-navy dark:hover:text-white transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
        </button>

        <div className="flex-1 flex items-center justify-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md space-y-6"
          >
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <IAALogo withText />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-navy dark:text-white">Selamat Datang Kembali</h1>
                <p className="text-sm text-muted-foreground mt-1">Masuk untuk mengakses portal IAA Digital</p>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email" type="email" placeholder="anda@iaa-anri.go.id"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11" autoComplete="email" autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button type="button" className="text-xs text-blue-brand hover:underline">Lupa password?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password" type={show ? 'text' : 'password'} placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11" autoComplete="current-password"
                  />
                  <button
                    type="button" onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy dark:hover:text-white"
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-11 bg-navy-gradient hover:opacity-90 font-semibold">
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</>
                ) : (
                  <><KeyRound className="mr-2 h-4 w-4" /> Masuk ke Portal</>
                )}
              </Button>
            </form>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 px-3 bg-background text-xs text-muted-foreground uppercase tracking-wide">
                Akun Demo
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_CREDENTIALS.map((d) => (
                <button
                  key={d.role}
                  onClick={() => fillDemo(d.email)}
                  type="button"
                  className="group rounded-lg border border-border bg-card p-2.5 text-left hover:border-gold/40 hover:shadow-premium transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-navy dark:text-white">{d.label}</span>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0">{roleLabel(d.role)}</Badge>
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">{d.desc}</div>
                </button>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Password demo: <code className="bg-muted px-1.5 py-0.5 rounded text-navy dark:text-white font-mono">iaa12345</code>
            </p>
          </motion.div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          © 2026 Ikatan Arsiparis ANRI. Hak Cipta Dilindungi.
        </p>
      </div>

      {/* Right: branding */}
      <div className="hidden lg:block relative bg-hero-gradient overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-blue/20 blur-3xl animate-float-slow" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gold/15 blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />

        <div className="relative h-full flex flex-col justify-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-7 max-w-md"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" /> Portal Anggota IAA
            </div>
            <h2 className="font-display text-4xl font-extrabold leading-tight">
              Satu Akun, <br />
              <span className="text-gradient-gold">Semua Akses.</span>
            </h2>
            <p className="text-white/70 leading-relaxed">
              Dashboard anggota terintegrasi dengan kartu keanggotaan digital, riwayat kegiatan, e-certificate, dan akses penuh ke perpustakaan digital.
            </p>

            <div className="space-y-3">
              {[
                { icon: ShieldCheck, title: 'Digital Membership Card', desc: 'Kartu anggota dengan QR verifikasi' },
                { icon: Sparkles, title: 'Riwayat Kegiatan & Sertifikat', desc: 'Semua pencapaian dalam satu tempat' },
                { icon: ShieldCheck, title: 'Akses Digital Library', desc: '1,200+ koleksi siap unduh' },
              ].map((f) => (
                <div key={f.title} className="glass-card rounded-xl p-4 flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-gold-gradient text-navy flex-shrink-0">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{f.title}</div>
                    <div className="text-xs text-white/60 mt-0.5">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
              {[
                { v: '2,400+', l: 'Anggota' },
                { v: '5,600+', l: 'Sertifikat' },
                { v: '1,200+', l: 'Koleksi' },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl font-extrabold font-display text-gold">{s.v}</div>
                  <div className="text-[11px] text-white/60">{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
